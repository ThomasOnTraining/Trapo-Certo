"use client";

import { useFormStatus } from "react-dom";
import { CLASSE_BOTAO } from "./campos";

/*
  Botão de submit com feedback de carregamento. Fica DENTRO do <form>
  de uma server action: o useFormStatus lê o estado do formulário pai e
  desabilita o botão enquanto a ação roda (evita clique duplo).
*/
export function BotaoPendente({
  rotulo,
  rotuloPendente = "Aguarde...",
  classe,
}: {
  rotulo: string;
  rotuloPendente?: string;
  classe: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className={`${CLASSE_BOTAO} ${classe}`}
      style={{ borderRadius: 10 }}
    >
      {pending ? rotuloPendente : rotulo}
    </button>
  );
}
