import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { EditorPerfil } from "../../editor-perfil";
import { TrilhaSecao } from "../../trilha-secao";
import { SelosPerfil } from "../../cartao-perfil";
import { CLASSE_BOTAO } from "../../campos";
import {
  SELECT_CATEGORIAS,
  buscarPerfilDoDono,
} from "../../dados";
import type { CategoriaPainel } from "../../tipos";

export const metadata: Metadata = {
  title: "Editar perfil",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
  Editar: tela dedicada a conteúdo. Zero métrica aqui dentro — número de
  desempenho é assunto da tela de métricas, a um toque de distância.
*/
export default async function EditarPerfilPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await supabaseAutenticado();
  if (!db) redirect("/entrar");

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");

  const perfil = await buscarPerfilDoDono(id, user.id);
  if (!perfil) notFound();

  const { data: categorias } = await db
    .from("categories")
    .select(SELECT_CATEGORIAS)
    .order("nome");

  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-6">
      <TrilhaSecao
        secao="Editar perfil"
        titulo={perfil.nome}
        descricao="Altere dados, bairros, links, categorias, serviços e preços. Salve e o catálogo atualiza na hora."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <SelosPerfil status={perfil.status} verificado={perfil.verificado} />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/painel/${perfil.id}/metricas`}
            className={`${CLASSE_BOTAO} border-verde-fundo text-verde-fundo hover:bg-verde-claro`}
            style={{ borderRadius: 10 }}
          >
            Ver métricas
          </Link>
          {perfil.status === "publicado" && (
            <Link
              href={`/prestador/${perfil.slug}`}
              className="text-xs font-bold uppercase tracking-wide text-verde-trampo underline underline-offset-2 hover:text-verde-trampo-forte"
            >
              Ver página pública
            </Link>
          )}
        </div>
      </div>

      <section
        aria-labelledby="titulo-editor"
        className="relative mt-5 border-2 border-verde-fundo bg-papel p-4 pt-7"
        style={{ borderRadius: 10 }}
      >
        <span className="carimbo absolute -top-3.5 left-3 border-verde-trampo bg-verde-claro text-verde-trampo">
          Edição
        </span>
        <h2
          id="titulo-editor"
          className="font-display text-xl uppercase text-verde-fundo"
        >
          Dados do perfil
        </h2>
        <EditorPerfil
          perfil={perfil}
          categorias={(categorias ?? []) as CategoriaPainel[]}
        />
      </section>
    </main>
  );
}
