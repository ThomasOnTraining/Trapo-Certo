import { CardPrestador, EtiquetaPatrocinado } from "@/components/card-prestador";
import { Busca } from "@/components/busca";
import { CATEGORIAS, PRESTADORES } from "@/lib/demo";
import {
  analisarConsulta,
  ordenarResultados,
  pontuarItem,
} from "@/lib/search";
import type { PrestadorDemo } from "@/lib/demo";
import { tituloCategoria } from "@/lib/seo";

/*
  Pagina de resultado: nunca existe resultado seco. Sem match exato,
  mostra o mais parecido + sugestao de alerta (fase 2).
*/

type Params = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    bairro?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Params) {
  const { q, categoria, bairro } = await searchParams;
  const cat = categoria
    ? CATEGORIAS.find((c) => c.slug === categoria)?.nome
    : null;
  if (cat) {
    const total = PRESTADORES.filter((p) =>
      p.categoriaSlugs.includes(categoria!)
    ).length;
    return {
      title: tituloCategoria(q ? `${q} ${cat}` : cat, total),
      description: `${total} profissionais de ${cat} em cidade, com avaliações de moradores e WhatsApp direto no Trampo Certo.`,
    };
  }
  return { title: q ? `Busca: ${q}` : "Buscar profissionais" };
}

export default async function PaginaBusca({ searchParams }: Params) {
  const { q = "", categoria, bairro } = await searchParams;

  let lista: PrestadorDemo[] = PRESTADORES;
  let buscaSemResultado = false;

  if (categoria) {
    lista = lista.filter((p) => p.categoriaSlugs.includes(categoria));
  }
  if (q.trim()) {
    const consulta = analisarConsulta(q, lista.flatMap((p) => p.bairros));
    const ponderados = lista
      .map((p) => pontuarItem(p, consulta, { bairroDoUsuario: bairro ?? null }))
      .filter((r): r is NonNullable<typeof r> => r !== null);
    lista = ordenarResultados(ponderados).map((r) => r.item);
    buscaSemResultado = lista.length === 0;
  }

  const rotulo = q.trim()
    ? `Resultados para "${q.trim()}"`
    : categoria
      ? (CATEGORIAS.find((c) => c.slug === categoria)?.nome ?? "Profissionais")
      : "Todos os profissionais";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-3">
      <Busca inicial={q} />

      {categoria && (
        <nav className="regra-tracejada mt-3 py-2 text-sm">
          {"Categorias: "}
          <a href="/busca" className="underline">
            todas
          </a>
          {" · "}
          {CATEGORIAS.map((c) => (
            <span key={c.slug}>
              {c.slug === categoria ? (
                <strong className="text-verde-trampo">{c.nome}</strong>
              ) : (
                <a href={`/busca?categoria=${c.slug}`} className="underline">
                  {c.nome}
                </a>
              )}
              {" · "}
            </span>
          ))}
        </nav>
      )}

      <h1 className="mt-4 border-b-2 border-verde-fundo pb-1 font-display text-xl uppercase text-verde-fundo">
        {rotulo}
        <span className="ml-2 text-base text-verde-trampo">({lista.length})</span>
      </h1>

      {buscaSemResultado && (
        <div className="mt-4 border-2 border-cinza-linha bg-verde-papel p-4" style={{ borderRadius: 10 }}>
          <p className="font-display uppercase text-verde-fundo">
            Ninguém daqui ainda
          </p>
          <p className="mt-1 text-sm">
            Não achamos esse serviço na cidade. Já sabe quem faz bem feito?
            Chame o profissional para aparecer no catálogo,{" "}
            <a href="/entrar" className="font-semibold underline">
              indicar é rápido
            </a>
            .
          </p>
        </div>
      )}

      {lista.length > 0 && (
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((p) => (
            <CardPrestador key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Banner do fim da lista: posicao de maior receptividade */}
      <div className="regra-tracejada mt-6 flex items-center justify-between gap-3 pt-4">
        <EtiquetaPatrocinado />
        <p className="text-sm text-tinta/70">
          Seu comércio aqui, para toda a cidade.{" "}
          <a href="/entrar" className="font-semibold underline">
            Fale com a gente
          </a>
          .
        </p>
      </div>
    </main>
  );
}
