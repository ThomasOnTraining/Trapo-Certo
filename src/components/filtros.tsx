import Link from "next/link";
import { Icone } from "./icones";
import { BAIRROS } from "@/lib/demo";
import { listarCategorias, listarPrestadores } from "@/lib/catalogo";

/*
  Filtros colapsados por padrao: a lista manda, o filtro espera.
  <details> nativo, sem JS: abre com um toque, mostra o ativo como
  etiqueta removivel, e o resto continua escondido.
*/

type Atual = { q?: string; categoria?: string | null; bairro?: string | null };

function hrefBusca(atual: Atual, troca: Atual) {
  const params = new URLSearchParams();
  const q = troca.q !== undefined ? troca.q : atual.q;
  const categoria = troca.categoria !== undefined ? troca.categoria : atual.categoria;
  const bairro = troca.bairro !== undefined ? troca.bairro : atual.bairro;
  if (q?.trim()) params.set("q", q.trim());
  if (categoria) params.set("categoria", categoria);
  if (bairro) params.set("bairro", bairro);
  const s = params.toString();
  return s ? `/busca?${s}` : "/busca";
}

const chipBase =
  "botao-afunda inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-semibold";
const chipAberto = "border-verde-fundo bg-papel text-verde-fundo hover:bg-verde-claro";
const chipAtivo = "border-verde-fundo bg-verde-fundo text-papel";

export async function Filtros({
  q = "",
  categoria = null,
  bairro = null,
}: {
  q?: string;
  categoria?: string | null;
  bairro?: string | null;
}) {
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);
  const atual: Atual = { q, categoria, bairro };
  const catAtiva = categorias.find((c) => c.slug === categoria) ?? null;
  const bairroAtivo = BAIRROS.find((b) => b === bairro) ?? null;
  const ativos = (catAtiva ? 1 : 0) + (bairroAtivo ? 1 : 0);

  const contagem: Record<string, number> = {};
  for (const p of prestadores)
    for (const s of p.categoriaSlugs) contagem[s] = (contagem[s] ?? 0) + 1;

  return (
    <div className="regra-tracejada mt-3 py-2">
      {ativos > 0 && (
        <p className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          {catAtiva && (
            <Link
              href={hrefBusca(atual, { categoria: null })}
              className={`${chipBase} ${chipAtivo}`}
              style={{ borderRadius: 10 }}
            >
              {catAtiva.nome}
              <span aria-hidden="true">×</span>
              <span className="sr-only">(remover filtro)</span>
            </Link>
          )}
          {bairroAtivo && (
            <Link
              href={hrefBusca(atual, { bairro: null })}
              className={`${chipBase} ${chipAtivo}`}
              style={{ borderRadius: 10 }}
            >
              {bairroAtivo}
              <span aria-hidden="true">×</span>
              <span className="sr-only">(remover filtro)</span>
            </Link>
          )}
          <Link href="/busca" className="underline">
            Limpar
          </Link>
        </p>
      )}

      <details className="group">
        <summary
          className="botao-afunda inline-flex cursor-pointer items-center gap-2 border-2 border-verde-fundo bg-papel px-3 py-1.5 text-sm font-bold text-verde-fundo hover:bg-verde-claro"
          style={{ borderRadius: 10 }}
        >
          <Icone nome="busca" tamanho={16} />
          {ativos > 0 ? `Filtros (${ativos})` : "Filtrar por serviço e bairro"}
          <span
            aria-hidden="true"
            className="-rotate-90 transition-transform group-open:rotate-90"
          >
            <Icone nome="voltar" tamanho={14} />
          </span>
        </summary>

        <div className="mt-2">
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {categorias.map((c) => {
              const ativa = c.slug === categoria;
              return (
                <li key={c.slug}>
                  <Link
                    href={hrefBusca(atual, {
                      categoria: ativa ? null : c.slug,
                    })}
                    aria-current={ativa ? "true" : undefined}
                    className={`${chipBase} w-full ${ativa ? chipAtivo : chipAberto}`}
                    style={{ borderRadius: 10 }}
                  >
                    <Icone nome={c.icone} tamanho={16} />
                    {c.nome} ({contagem[c.slug] ?? 0})
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-3 text-sm font-bold text-verde-fundo">Bairro</p>
          <ul className="mt-1 flex flex-wrap gap-2">
            {BAIRROS.map((b) => {
              const ativo = b === bairro;
              return (
                <li key={b}>
                  <Link
                    href={hrefBusca(atual, { bairro: ativo ? null : b })}
                    aria-current={ativo ? "true" : undefined}
                    className={`${chipBase} ${ativo ? chipAtivo : chipAberto}`}
                    style={{ borderRadius: 10 }}
                  >
                    {b}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </details>
    </div>
  );
}
