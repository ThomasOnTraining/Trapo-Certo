"use client";

import { useEffect, useState } from "react";

/*
  Banner de consentimento LGPD: rodape discreto, sem bloquear a lista,
  tres opcoes honestas (aceitar tudo / so essenciais / configurar).
  A decisao fica em cookie proprio (o que e exigencia), sem truque
  de "recusar escondido". Visitante que recusa navega identico.
*/

const CHAVE = "tc_consent_v1";

export type Consentimento = { metricas: boolean; anuncios: boolean };

function lerCookie(): Consentimento | null {
  const m = document.cookie.match(/(?:^|; )tc_consent_v1=([^;]*)/);
  if (!m) return null;
  try {
    return JSON.parse(decodeURIComponent(m[1]));
  } catch {
    return null;
  }
}

function salvarCookie(valor: Consentimento) {
  const umAno = 60 * 60 * 24 * 365;
  document.cookie = `${CHAVE}=${encodeURIComponent(
    JSON.stringify(valor)
  )}; path=/; max-age=${umAno}; samesite=lax`;
}

export function BannerCookies() {
  const [visivel, setVisivel] = useState(false);
  const [configurando, setConfigurando] = useState(false);
  const [metricas, setMetricas] = useState(true);
  const [anuncios, setAnuncios] = useState(true);

  useEffect(() => {
    setVisivel(lerCookie() === null);
  }, []);

  function decidir(valor: Consentimento) {
    salvarCookie(valor);
    setVisivel(false);
  }

  if (!visivel) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-verde-fundo bg-verde-papel">
      <div className="mx-auto max-w-3xl px-4 py-3">
        {!configurando ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm">
              Usamos cookies essenciais para o site funcionar e, se você
              deixar, métricas anônimas para melhorar o catálogo.{" "}
              <a href="/cookies" className="font-semibold underline">
                Detalhes
              </a>
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => decidir({ metricas: true, anuncios: true })}
                className="botao-afunda border-2 border-verde-trampo bg-verde-trampo px-3 py-1.5 text-sm font-bold uppercase text-papel hover:bg-verde-trampo-forte"
              >
                Aceitar tudo
              </button>
              <button
                onClick={() => decidir({ metricas: false, anuncios: false })}
                className="botao-afunda border-2 border-cinza-linha px-3 py-1.5 text-sm font-semibold hover:bg-verde-claro"
              >
                Só essenciais
              </button>
              <button
                onClick={() => setConfigurando(true)}
                className="px-2 py-1.5 text-sm underline"
              >
                Configurar
              </button>
            </div>
          </div>
        ) : (
          <div className="text-sm">
            <p className="font-display uppercase text-verde-fundo">
              Suas escolhas
            </p>
            <label className="mt-2 flex items-center justify-between gap-4 border-2 border-cinza-linha bg-papel p-3">
              <span>
                <strong>Essenciais</strong>
                <br />
                Sessão, preferências. Sempre ativos.
              </span>
              <span className="font-bold text-verde-trampo">Sempre ativos</span>
            </label>
            <label className="mt-2 flex items-center justify-between gap-4 border-2 border-cinza-linha bg-papel p-3">
              <span>
                <strong>Métricas</strong>
                <br />
                Uso anônimo do site para melhorar o catálogo.
              </span>
              <input
                type="checkbox"
                checked={metricas}
                onChange={(e) => setMetricas(e.target.checked)}
                className="h-5 w-5 accent-verde-trampo"
              />
            </label>
            <label className="mt-2 flex items-center justify-between gap-4 border-2 border-cinza-linha bg-papel p-3">
              <span>
                <strong>Anúncios</strong>
                <br />
                Medição dos anúncios dos comércios locais.
              </span>
              <input
                type="checkbox"
                checked={anuncios}
                onChange={(e) => setAnuncios(e.target.checked)}
                className="h-5 w-5 accent-verde-trampo"
              />
            </label>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => decidir({ metricas, anuncios })}
                className="botao-afunda border-2 border-verde-trampo bg-verde-trampo px-3 py-1.5 font-bold uppercase text-papel hover:bg-verde-trampo-forte"
              >
                Salvar
              </button>
              <button
                onClick={() => setConfigurando(false)}
                className="px-2 py-1.5 underline"
              >
                Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
