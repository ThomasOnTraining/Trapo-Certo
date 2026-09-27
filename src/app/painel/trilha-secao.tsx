import Link from "next/link";

/*
  Cabeçalho de seção do painel: trilha (Meu painel / seção) + título.
  É o "onde eu estou" das telas Editar e Métricas, com o caminho de
  volta a um toque.
*/
export function TrilhaSecao({
  secao,
  titulo,
  descricao,
}: {
  secao: string;
  titulo: string;
  descricao?: string;
}) {
  return (
    <div>
      <nav
        aria-label="Você está em"
        className="flex flex-wrap items-center gap-1.5 text-xs"
      >
        <Link
          href="/painel"
          className="font-bold uppercase tracking-wide text-verde-trampo underline underline-offset-2 hover:text-verde-trampo-forte"
        >
          Meu painel
        </Link>
        <span aria-hidden="true" className="text-tinta/40">
          /
        </span>
        <span
          aria-current="page"
          className="font-bold uppercase tracking-wide text-tinta/60"
        >
          {secao}
        </span>
      </nav>
      <h1 className="risca-forte mt-2 pb-2 font-display text-3xl uppercase leading-none text-verde-fundo">
        {titulo}
      </h1>
      {descricao && (
        <p className="mt-2 max-w-[60ch] text-sm text-tinta/80">{descricao}</p>
      )}
    </div>
  );
}
