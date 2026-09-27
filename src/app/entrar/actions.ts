"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { emailPermitido } from "@/lib/validate";

/*
  Login passwordless: o servidor valida o dominio (allowlist) e pede ao
  Supabase o e-mail magico. Nenhuma senha em banco, nenhum dado novo
  antes do consentimento do link.
*/

export type ResultadoEntrada = { ok: boolean; erro?: string; email?: string };

export async function entrarComEmail(
  _: ResultadoEntrada,
  formData: FormData
): Promise<ResultadoEntrada> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return { ok: false, erro: "Digite um e-mail válido." };
  }
  if (!emailPermitido(email)) {
    return {
      ok: false,
      erro: "Por enquanto só entram contas Gmail ou Hotmail/Outlook.",
    };
  }

  const db = await supabaseAutenticado();
  if (!db) {
    return { ok: false, erro: "Login ainda não configurado neste ambiente." };
  }

  const origem = (await headers()).get("origin") ?? "http://localhost:3000";
  const { error } = await db.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origem}/auth/callback` },
  });
  if (error) {
    return { ok: false, erro: "Não consegui enviar o link. Tenta de novo em instantes." };
  }
  return { ok: true, email };
}

export async function sair() {
  const db = await supabaseAutenticado();
  if (db) await db.auth.signOut();
  redirect("/");
}
