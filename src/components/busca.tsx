"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Icone } from "./icones";

type Sugestao = { tipo: "categoria" | "bairro" | "prestador"; texto: string; detalhe: string; href: string };

/** Barra de busca com sugestoes vivas (categorias, bairros, prestadores). */
export function Busca({ inicial = "" }: { inicial?: string }) {
  const router = useRouter();
  const [termo, setTermo] = useState(inicial);
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!aberto || termo.trim().length < 2) {
      setSugestoes([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search/suggest?q=${encodeURIComponent(termo)}`);
        if (r.ok) setSugestoes(await r.json());
      } catch {
        // sugestao e melhoria, nunca bloqueia
      }
    }, 150);
    return () => clearTimeout(t);
  }, [termo, aberto]);

  useEffect(() => {
    function aoFora(e: MouseEvent) {
      if (caixa.current && !caixa.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("mousedown", aoFora);
    return () => document.removeEventListener("mousedown", aoFora);
  }, []);

  function buscar(q: string) {
    setAberto(false);
    router.push(`/busca?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={caixa} className="relative w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (termo.trim()) buscar(termo.trim());
        }}
        role="search"
      >
        <label htmlFor="busca" className="sr-only">
          O que você precisa?
        </label>
        <input
          id="busca"
          type="search"
          value={termo}
          onChange={(e) => {
            setTermo(e.target.value);
            setAberto(true);
          }}
          onFocus={() => setAberto(true)}
          placeholder="O que você precisa? Ex.: eletricista no Centro"
          autoComplete="off"
          className="botao-afunda w-full border-2 border-verde-fundo bg-papel px-4 py-3 text-base placeholder:text-tinta/50 focus:bg-verde-papel"
          style={{ borderRadius: 10 }}
        />
      </form>
      {aberto && sugestoes.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-30 mt-1 border-2 border-verde-fundo bg-papel shadow-none">
          {sugestoes.map((s, i) => (
            <li key={i} className="border-b border-cinza-linha last:border-b-0">
              <button
                type="button"
                onClick={() => {
                  setAberto(false);
                  router.push(s.href);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left hover:bg-verde-papel"
              >
                <span>
                  <strong className="text-tinta">{s.texto}</strong>
                  <span className="block text-xs text-tinta/60">{s.detalhe}</span>
                </span>
                <Icone nome="busca" tamanho={16} className="text-verde-trampo" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
