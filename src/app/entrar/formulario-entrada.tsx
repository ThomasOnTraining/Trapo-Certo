"use client";

import { useActionState } from "react";
import { entrarComEmail, type ResultadoEntrada } from "./actions";
import { Icone } from "@/components/icones";

const INICIAL: ResultadoEntrada = { ok: false };

export function FormularioEntrada() {
  const [estado, acao, pendente] = useActionState(entrarComEmail, INICIAL);

  if (estado.ok && estado.email) {
    return (
      <div
        className="border-2 border-verde-trampo bg-verde-claro p-4 text-sm text-verde-fundo"
        style={{ borderRadius: 10 }}
        role="status"
      >
        <p className="font-bold uppercase tracking-wide">
          Link enviado para {estado.email}
        </p>
        <p className="mt-1">
          Abra a caixa de entrada (e o spam, por garantia) e clique no link.
          Ele abre o seu painel direto, sem senha.
        </p>
        <a
          href="/entrar"
          className="botao-afunda mt-3 inline-block border-2 border-verde-fundo bg-papel px-3 py-1.5 text-xs font-bold uppercase text-verde-fundo hover:bg-verde-claro"
          style={{ borderRadius: 8 }}
        >
          Usar outro e-mail
        </a>
      </div>
    );
  }

  return (
    <form action={acao} className="space-y-3">
      <label className="block text-sm font-semibold" htmlFor="email">
        Seu e-mail
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="voce@gmail.com"
          className="mt-1 w-full border-2 border-verde-fundo bg-papel px-3 py-2.5 text-sm text-tinta focus:border-verde-trampo focus:outline-none"
          style={{ borderRadius: 8 }}
        />
      </label>

      {estado.erro && (
        <p
          className="border-2 border-amarelo-aviso bg-amarelo-aviso/10 p-2.5 text-sm font-semibold text-verde-fundo"
          style={{ borderRadius: 8 }}
          role="alert"
        >
          {estado.erro}
        </p>
      )}

      <button
        type="submit"
        disabled={pendente}
        className="botao-afunda w-full border-2 border-verde-trampo bg-verde-trampo py-3 font-bold uppercase tracking-wide text-papel hover:bg-verde-trampo-forte disabled:opacity-70"
        style={{ borderRadius: 10 }}
      >
        <span className="inline-flex items-center justify-center gap-2">
          <Icone nome="tela" tamanho={18} />
          {pendente ? "Enviando..." : "Receber link de entrada"}
        </span>
      </button>
    </form>
  );
}
