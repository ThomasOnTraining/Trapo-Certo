"use client";

import { useEffect, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Campo, CLASSE_BOTAO } from "./campos";
import { criarPerfil } from "./actions";
import { Icone } from "@/components/icones";

/*
  Criar perfil: formulário curto (tipo, nome, profissão, WhatsApp).
  O resto (serviços, bairros, links) se completa no editor. Deu certo?
  O perfil já está NO AR como não verificado — a verificação da equipe
  é uma camada de confiança, não uma fila de aprovação.
*/
export function CriarPerfil({ embutido = false }: { embutido?: boolean }) {
  const router = useRouter();
  const [estado, acao, pendente] = useActionState(criarPerfil, { ok: false });

  useEffect(() => {
    if (estado.ok) router.refresh();
  }, [estado.ok, router]);

  const formulario = (
    <form action={acao} className="mt-4 space-y-3">
      <label className="block text-sm font-semibold">
        Tipo de perfil
        <select
          name="tipo"
          defaultValue="pessoa"
          className="mt-1 w-full border-2 border-verde-fundo bg-papel px-3 py-2.5 text-sm font-normal text-tinta focus:border-verde-trampo focus:outline-none"
          style={{ borderRadius: 8 }}
        >
          <option value="pessoa">Pessoa (trabalho sozinho)</option>
          <option value="empresa">Empresa / equipe</option>
        </select>
      </label>
      <Campo rotulo="Nome ou nome fantasia" name="nome" required maxLength={80} />
      <Campo
        rotulo="Profissão (ex.: Eletricista, Diarista)"
        name="profissao"
        required
        maxLength={80}
      />
      <Campo
        rotulo="WhatsApp com DDD (só números)"
        name="whatsapp"
        inputMode="numeric"
        placeholder="41999998888"
        required
      />

      {estado.erro && (
        <p
          className="border-2 border-amarelo-aviso bg-amarelo-aviso/10 p-2.5 text-sm font-semibold text-verde-fundo"
          style={{ borderRadius: 8 }}
          role="alert"
        >
          {estado.erro}
        </p>
      )}

      {estado.ok && (
        <p
          className="border-2 border-verde-trampo bg-verde-claro p-2.5 text-sm font-semibold text-verde-fundo"
          style={{ borderRadius: 8 }}
          role="status"
        >
          Perfil criado e {estado.publicado ? "já no ar" : "guardado"} como{" "}
          <strong>não verificado</strong>. Complete serviços e bairros no
          editor e mande para a equipe verificar quando quiser.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={pendente}
          className={`${CLASSE_BOTAO} border-verde-trampo bg-verde-trampo text-papel hover:bg-verde-trampo-forte`}
          style={{ borderRadius: 10 }}
        >
          <Icone nome="check" tamanho={14} />
          {pendente ? "Criando..." : "Criar perfil"}
        </button>
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wide text-verde-trampo underline underline-offset-2 hover:text-verde-trampo-forte"
        >
          Ver o catálogo
        </Link>
      </div>
    </form>
  );

  if (embutido) return formulario;

  return (
    <section
      className="relative border-2 border-verde-fundo bg-papel p-4 pt-7"
      style={{ borderRadius: 10 }}
    >
      <span className="carimbo absolute -top-3.5 left-3 border-verde-trampo bg-verde-claro text-verde-trampo">
        Primeiro passo
      </span>
      <h2 className="font-display text-xl uppercase text-verde-fundo">
        Criar meu perfil profissional
      </h2>
      <p className="mt-1 text-sm text-tinta/80">
        Conte quem você é e o que faz. O perfil entra no ar na hora, marcado
        como <strong>não verificado</strong> até a equipe conferir seus dados.
      </p>
      {formulario}
    </section>
  );
}
