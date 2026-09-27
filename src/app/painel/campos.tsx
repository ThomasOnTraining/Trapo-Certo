import type { ComponentProps } from "react";

/*
  Campos de formulário do painel: um lugar só para o visual de input,
  reutilizado pelo criador de perfil e pelo editor. Raio 8px (campo),
  borda verde-fundo em repouso e verde-trampo no foco — igual ao resto
  do site.
*/

const CLASSE_CAMPO =
  "mt-1 w-full border-2 border-verde-fundo bg-papel px-3 py-2.5 text-sm font-normal text-tinta focus:border-verde-trampo focus:bg-verde-papel focus:outline-none";

export const CLASSE_BOTAO =
  "botao-afunda inline-flex items-center justify-center gap-1.5 border-2 px-3 py-2 text-xs font-bold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70";

export function Campo({ rotulo, ...resto }: { rotulo: string } & ComponentProps<"input">) {
  return (
    <label className="block text-sm font-semibold">
      {rotulo}
      <input {...resto} className={CLASSE_CAMPO} style={{ borderRadius: 8 }} />
    </label>
  );
}

export function CampoTexto({
  rotulo,
  ...resto
}: { rotulo: string } & ComponentProps<"textarea">) {
  return (
    <label className="block text-sm font-semibold">
      {rotulo}
      <textarea rows={3} {...resto} className={CLASSE_CAMPO} style={{ borderRadius: 8 }} />
    </label>
  );
}
