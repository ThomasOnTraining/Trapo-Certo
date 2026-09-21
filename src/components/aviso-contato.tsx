"use client";

import { useEffect, useState } from "react";
import { Icone } from "./icones";

/*
  Aviso legal humano antes do contato (aparece uma vez por visitante,
  salvo em cookie essencial). Depois registra o clique e abre o WhatsApp.
  Sombra de recorte de papel: a unica sombra do sistema.
*/

const CHAVE_AVISO = "tc_aviso_v1";

export function AvisoContato({
  prestadorId,
  whatsapp,
  nomePrestador,
  compacto = false,
}: {
  prestadorId: string;
  whatsapp: string;
  nomePrestador: string;
  compacto?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [avisoJaVisto, setAvisoJaVisto] = useState(true);

  useEffect(() => {
    setAvisoJaVisto(
      typeof window !== "undefined" &&
        window.localStorage.getItem(CHAVE_AVISO) === "1"
    );
  }, []);

  function abrirWhatsApp() {
    // Registro do clique: sem dado pessoal do visitante, so o id do prestador.
    try {
      fetch("/api/contact-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prestadorId }),
      }).catch(() => {});
    } catch {
      // metrica nunca pode bloquear o contato
    }
    window.location.href = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
      `Olá! Vi seu perfil no Trampo Certo. Preciso de um orçamento.`
    )}`;
  }

  function aoClicar() {
    if (avisoJaVisto) {
      abrirWhatsApp();
      return;
    }
    setAberto(true);
  }

  function continuar(lembrete: boolean) {
    window.localStorage.setItem(CHAVE_AVISO, "1");
    setAvisoJaVisto(true);
    setAberto(false);
    abrirWhatsApp();
    if (lembrete === false) return; // nunca rastreamos a escolha de lembrar
  }

  const classe = compacto
    ? "botao-afunda w-full border-2 border-verde-trampo bg-verde-trampo py-2.5 text-sm font-bold uppercase tracking-wide text-papel hover:bg-verde-trampo-forte"
    : "botao-afunda w-full border-2 border-verde-trampo bg-verde-trampo py-3.5 text-base font-bold uppercase tracking-wide text-papel hover:bg-verde-trampo-forte";

  return (
    <>
      <button type="button" onClick={aoClicar} className={classe}>
        <span className="inline-flex items-center justify-center gap-2">
          <Icone nome="chat" tamanho={compacto ? 16 : 20} />
          Falar no WhatsApp
        </span>
      </button>

      {aberto && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-verde-fundo/60 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-label="Aviso antes do contato"
          onClick={() => setAberto(false)}
        >
          <div
            className="sombra-papel w-full max-w-md border-2 border-verde-fundo bg-papel p-5"
            style={{ borderRadius: 12 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg uppercase text-verde-fundo">
              Antes de falar com {nomePrestador}
            </h2>
            <p className="mt-2 text-sm">
              Você vai sair do site e conversar direto no WhatsApp. O Trampo
              Certo só divulga o perfil:{" "}
              <strong>
                combine preço, prazo e recibo aí mesmo, na sua conversa.
              </strong>{" "}
              Não participamos dessa conversa nem da contratação.
            </p>
            <p className="mt-2 text-sm text-tinta/80">
              Fez o trampo? Volte aqui e avalie, ajuda seus vizinhos.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => continuar(true)}
                className="botao-afunda border-2 border-verde-trampo bg-verde-trampo py-2.5 font-bold uppercase text-papel hover:bg-verde-trampo-forte"
              >
                Bora falar com ele
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="botao-afunda border-2 border-cinza-linha py-2 font-semibold text-tinta hover:bg-verde-papel"
              >
                Ainda não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
