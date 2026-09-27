import { CardPrestador, EtiquetaPatrocinado } from "@/components/card-prestador";
import { Busca } from "@/components/busca";
import { Filtros } from "@/components/filtros";
import { BAIRROS } from "@/lib/demo";
import { listarCategorias, listarPrestadores, verificadoPrimeiro } from "@/lib/catalogo";
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

export const revalidate = 300;

type Params = {
  searchParams: Promise<{
    q?: string;
    categoria?: string;
    bairro?: string;
  }>;
};

export async function generateMetadata({ searchParams }: Params) {
  const { q, categoria, bairro } = await searchParams;
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);
  const cat = categoria
    ? categorias.find((c) => c.slug === categoria)?.nome
    : null;
  if (cat) {
    const total = prestadores.filter((p) =>
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
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);

  let lista: PrestadorDemo[] = prestadores;
  let buscaSemResultado = false;

  if (categoria) {
    lista = lista.filter((p) => p.categoriaSlugs.includes(categoria));
  }
  if (bairro && BAIRROS.includes(bairro)) {
    lista = lista.filter((p) => p.bairros.includes(bairro!));
  }
  if (q.trim()) {
    const consulta = analisarConsulta(q, lista.flatMap((p) => p.bairros));
    const ponderados = lista
      .map((p) => pontuarItem(p, consulta, { bairroDoUsuario: bairro ?? null }))
      .filter((r): r is NonNullable<typeof r> => r !== null);
    lista = ordenarResultados(ponderados).map((r) => r.item);
    buscaSemResultado = lista.length === 0;
  }

  // Verificados primeiro, sempre: relevância manda dentro de cada grupo.
  lista = verificadoPrimeiro(lista);

  const rotulo = q.trim()
    ? `Resultados para "${q.trim()}"`
    : categoria
      ? (categorias.find((c) => c.slug === categoria)?.nome ?? "Profissionais")
      : "Todos os profissionais";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-3">
      <Busca inicial={q} />

      <Filtros q={q} categoria={categoria ?? null} bairro={bairro ?? null} />

      <h1 className="risca-forte mt-4 flex flex-wrap items-baseline gap-x-2 pb-2 font-display text-2xl uppercase leading-none text-verde-fundo">
        {rotulo}
        <span className="carimbo border-verde-trampo bg-verde-claro normal-case text-verde-trampo">
          {lista.length} encontrados
        </span>
      </h1>

      {buscaSemResultado && (
        <div
          className="relative mt-6 border-2 border-dashed border-verde-fundo bg-papel p-4 pt-5"
          style={{ borderRadius: 10 }}
        >
          <span className="carimbo absolute -top-3 left-3 border-verde-trampo bg-verde-claro text-verde-trampo">
            Ninguém daqui ainda
          </span>
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
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((p) => (
            <CardPrestador key={p.id} p={p} />
          ))}
        </div>
      )}

      {/* Banner do fim da lista: posicao de maior receptividade */}
      <div className="regra-tracejada mt-6 flex flex-col items-start gap-2 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
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
