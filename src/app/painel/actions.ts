"use server";

import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { supabaseService } from "@/lib/supabase/service";

/*
  Ações do painel.

  Publicação: o perfil do dono nasce PUBLICADO (não espera equipe). O
  cadastro roda com o JWT da própria conta — RLS de dono e grant de
  coluna são a autorização. Como instalações antigas do banco ainda
  gravam 'rascunho' no INSERT (trigger legado), logo depois da criação
  a ação publica com service_role. Isso separa os dois estados que
  importam para o morador: publicado (sim) e verificado (ainda não).

  Moderação (publicar/suspender/verificar): só papel admin, e a escrita
  usa service_role porque status/verificado ficam fora do grant do dono
  (congelados por trigger).
*/

export type ResultadoPublicacao = { ok: boolean; erro?: string };

type Equipe = { svc: SupabaseClient } | { erro: string };

/** Confere que quem chama é da equipe (papel admin em profiles). */
async function equipeResponsavel(): Promise<Equipe> {
  const db = await supabaseAutenticado();
  if (!db) return { erro: "Login não configurado." };

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { erro: "Sessão expirou. Entre de novo." };

  const { data: perfil } = await db
    .from("profiles")
    .select("papel")
    .eq("id", user.id)
    .single();
  if (perfil?.papel !== "admin") {
    return { erro: "Só a equipe do Trampo Certo faz isso." };
  }

  const svc = supabaseService();
  if (!svc) return { erro: "Servidor sem chave de moderação." };
  return { svc };
}

/** Escrita de moderação com service_role (status/verificado são congelados). */
async function aplicarModeracao(
  providerId: string,
  patch: { status?: "publicado" | "suspenso"; verificado?: boolean }
): Promise<ResultadoPublicacao> {
  const equipe = await equipeResponsavel();
  if ("erro" in equipe) return { ok: false, erro: equipe.erro };

  const { error } = await equipe.svc
    .from("providers")
    .update(patch)
    .eq("id", providerId);
  if (error) return { ok: false, erro: "Não consegui atualizar o perfil." };

  revalidatePath("/", "layout");
  return { ok: true };
}

/*
  Ações usadas nos formulários do painel (equipe). Devolvem void de
  propósito: o botão do formulário só precisa saber que terminou. O id
  do perfil chega pelo campo hidden "providerId" e quem garante a
  autorização é equipeResponsavel(), no servidor.
*/
function idDoFormulario(formData: FormData): string | null {
  const id = String(formData.get("providerId") ?? "").trim();
  return id.length > 0 ? id : null;
}

export async function publicarPerfil(formData: FormData): Promise<void> {
  const id = idDoFormulario(formData);
  if (!id) return;
  await aplicarModeracao(id, { status: "publicado" });
}

export async function suspenderPerfil(formData: FormData): Promise<void> {
  const id = idDoFormulario(formData);
  if (!id) return;
  await aplicarModeracao(id, { status: "suspenso" });
}

/** Verificação: documento conferido (não bloqueia publicação). */
export async function verificarPerfil(formData: FormData): Promise<void> {
  const id = idDoFormulario(formData);
  if (!id) return;
  await aplicarModeracao(id, { verificado: true });
}

export async function removerVerificacao(formData: FormData): Promise<void> {
  const id = idDoFormulario(formData);
  if (!id) return;
  await aplicarModeracao(id, { verificado: false });
}

export type ResultadoCriar = {
  ok: boolean;
  erro?: string;
  /** false quando o banco manteve o perfil em rascunho (sem chave de moderação). */
  publicado?: boolean;
};

function slugDe(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "prestador";
}

/*
  Criação de perfil roda com o JWT da própria conta: o trigger
  protege_providers preenche user_id/stats e zera a verificação. O dono
  NUNCA escreve status, verificado nem user_id.
*/
export async function criarPerfil(
  _: ResultadoCriar,
  formData: FormData
): Promise<ResultadoCriar> {
  const db = await supabaseAutenticado();
  if (!db) return { ok: false, erro: "Login não configurado." };

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) return { ok: false, erro: "Sessão expirou. Entre de novo." };

  const tipo = String(formData.get("tipo") ?? "");
  const nome = String(formData.get("nome") ?? "").trim().slice(0, 80);
  const profissao = String(formData.get("profissao") ?? "").trim().slice(0, 80);
  const whatsapp = String(formData.get("whatsapp") ?? "").replace(/\D/g, "");

  if (tipo !== "pessoa" && tipo !== "empresa")
    return { ok: false, erro: "Escolha pessoa ou empresa." };
  if (nome.length < 2) return { ok: false, erro: "Informe o nome." };
  if (profissao.length < 2) return { ok: false, erro: "Informe a profissão." };
  if (!/^[0-9]{10,13}$/.test(whatsapp))
    return { ok: false, erro: "WhatsApp inválido: números com DDD, só dígitos." };

  const { data: criado, error } = await db
    .from("providers")
    .insert({
      tipo,
      slug: `${slugDe(nome)}-${Math.random().toString(36).slice(2, 6)}`,
      nome,
      profissao,
      whatsapp,
    })
    .select("id, status")
    .single();

  if (error) {
    if (error.code === "42501")
      return { ok: false, erro: "Sem permissão para criar perfil." };
    return { ok: false, erro: "Não consegui criar o perfil. Tente de novo." };
  }

  /*
    Publicação imediata: se o banco devolveu 'rascunho' (trigger antigo),
    publica agora com service_role. A verificação continua pendente —
    quem decide o selo é a equipe, e isso não segura o perfil no ar.
  */
  let publicado = criado?.status === "publicado";
  const svc = supabaseService();
  if (!publicado && criado?.id && svc) {
    const { error: erroPublicar } = await svc
      .from("providers")
      .update({ status: "publicado" })
      .eq("id", criado.id);
    publicado = !erroPublicar;
  }

  revalidatePath("/", "layout");
  return { ok: true, publicado };
}

