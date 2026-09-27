"use client";

import { Icone } from "./icones";

/*
  Voltar para a lista: history.back() preserva filtros e rolagem da
  pagina anterior (home ou /busca). React bloqueia href javascript:,
  entao o clique vai por onClick num <a href="/busca">: com hidratacao
  faz history.back() quando veio de pagina interna; sem hidratacao o
  proprio href cobre o fallback.
*/

export function Voltar() {
  return (
    <a
      href="/busca"
      onClick={(e) => {
        let interno = false;
        try {
          interno =
            !!document.referrer &&
            new URL(document.referrer).origin === window.location.origin;
        } catch {
          interno = false;
        }
        if (!interno) return; // segue o href /busca (tambem funciona sem JS)
        e.preventDefault();
        let timer: number;
        const aoVoltar = () => {
          clearTimeout(timer);
          window.removeEventListener("popstate", aoVoltar);
        };
        timer = window.setTimeout(() => {
          window.removeEventListener("popstate", aoVoltar);
          window.location.href = "/busca";
        }, 600);
        window.addEventListener("popstate", aoVoltar);
        window.history.back();
      }}
      className="inline-flex items-center gap-1 text-sm font-semibold text-verde-fundo hover:text-verde-trampo"
    >
      <Icone nome="voltar" tamanho={16} />
      Voltar para a lista
    </a>
  );
}
