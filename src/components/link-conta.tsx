"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { Icone } from "./icones";

/*
  CTA de conta do cabeçalho e da barra de baixo.

  O layout é estático (a página pública não pode virar dinâmica por causa
  de cookie), então quem descobre a sessão é o navegador: os cookies do
  @supabase/ssr são legíveis por JS. Enquanto não sabe, mostra "Conta" —
  rótulo neutro, sem piscar entre Entrar e Painel.

  Logado: vai direto para o painel. Deslogado: para /entrar, que já
  redireciona quem tem sessão.
*/
export function LinkConta({ variacao }: { variacao: "topo" | "inferior" }) {
  const [logado, setLogado] = useState<boolean | null>(null);

  useEffect(() => {
    const db = supabaseNavegador();
    if (!db) return;
    let ativo = true;

    db.auth.getSession().then(({ data }) => {
      if (ativo) setLogado(!!data.session);
    });
    const { data: inscricao } = db.auth.onAuthStateChange((_evento, sessao) => {
      setLogado(!!sessao);
    });

    return () => {
      ativo = false;
      inscricao.subscription.unsubscribe();
    };
  }, []);

  const destino = logado ? "/painel" : "/entrar";
  const rotulo = logado === null ? "Conta" : logado ? "Painel" : "Entrar";
  const titulo = logado
    ? "Ir para o meu painel"
    : "Entrar para divulgar seu perfil";

  if (variacao === "inferior") {
    return (
      <Link
        href={destino}
        title={titulo}
        aria-current={logado ? "page" : undefined}
        className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-bold uppercase tracking-wide text-verde-fundo hover:bg-verde-claro active:bg-verde-claro"
      >
        <Icone nome="pessoa" tamanho={20} />
        {rotulo}
      </Link>
    );
  }

  return (
    <Link
      href={destino}
      title={titulo}
      className="botao-afunda inline-flex shrink-0 items-center gap-1.5 border-2 border-verde-fundo px-3 py-2 text-sm font-bold uppercase tracking-wide text-verde-fundo hover:bg-verde-claro"
      style={{ borderRadius: 10 }}
    >
      <Icone nome="pessoa" tamanho={16} />
      {rotulo}
    </Link>
  );
}
