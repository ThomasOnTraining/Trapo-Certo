import { supabaseLeitura } from "@/lib/supabase/server";
import {
  CATEGORIAS,
  CIDADE,
  PATROCINADO_CIDADE,
  PRESTADORES,
  buscarPrestadorPorSlug as demoPorSlug,
  type PrestadorDemo,
} from "@/lib/demo";

/*
  Repositorio de leitura do catalogo. Cada funcao tenta o banco real e
  cai no modo demo (demo.ts) se o Supabase nao estiver configurado ou
  der erro. As paginas consomem daqui, nunca do demo direto.
*/

export type Categoria = { nome: string; slug: string; icone: string };
export type Avaliacao = { nome: string; nota: number; texto: string };
export type Patrocinado = { nome: string; descricao: string; whatsapp: string };

const AVALIACOES_DEMO: Avaliacao[] = [
  {
    nome: "Marta G.",
    nota: 5,
    texto: "Chegou no mesmo dia e resolveu tudo. Preço justo, recomendo demais.",
  },
  {
    nome: "Célio P.",
    nota: 4,
    texto: "Bom trabalho, demorou um pouco para voltar com o orçamento.",
  },
  {
    nome: "Dona Neusa",
    nota: 5,
    texto: "Trabalha bem, arrumou até o que eu não tinha pedido. Gente fina.",
  },
];

// Linha do banco com os relacionamentos embutidos do select
type LinhaProvider = {
  id: string;
  slug: string;
  tipo: "pessoa" | "empresa";
  nome: string;
  profissao: string;
  bio: string;
  bairros: string[];
  verificado: boolean;
  disponivel_hoje: boolean;
  whatsapp: string;
  nota_media: number | string;
  total_avaliacoes: number;
  votos_positivos: number;
  votos_negativos: number;
  anos_regiao: number;
  gmaps_url: string | null;
  maps_query: string | null;
  horario: string | null;
  site: string | null;
  provider_categories:
    | { categories: { nome: string; slug: string } | null }[]
    | null;
  provider_services:
    | { titulo: string; preco_desde: number | string | null; ordem: number }[]
    | null;
};

const SELECT_PRESTADOR =
  "*, provider_categories(categories(nome, slug)), provider_services(titulo, preco_desde, ordem)";

function mapear(l: LinhaProvider): PrestadorDemo {
  const categorias = (l.provider_categories ?? [])
    .map((c) => c.categories)
    .filter((c): c is { nome: string; slug: string } => c !== null);
  return {
    id: l.id,
    slug: l.slug,
    tipo: l.tipo,
    nome: l.nome,
    profissao: l.profissao,
    bio: l.bio,
    categorias: categorias.map((c) => c.nome),
    categoriaSlugs: categorias.map((c) => c.slug),
    bairros: l.bairros,
    verificado: l.verificado,
    disponivelHoje: l.disponivel_hoje,
    whatsapp: l.whatsapp,
    notaMedia: Number(l.nota_media),
    totalAvaliacoes: l.total_avaliacoes,
    votosPositivos: l.votos_positivos,
    votosNegativos: l.votos_negativos,
    servicos: (l.provider_services ?? [])
      .map((s) => ({
        titulo: s.titulo,
        precoDesde:
          s.preco_desde == null ? undefined : Number(s.preco_desde),
        ordem: s.ordem,
      }))
      .sort((a, b) => a.ordem - b.ordem)
      .map(({ titulo, precoDesde }) => ({ titulo, precoDesde })),
    anosRegiao: l.anos_regiao,
    gmapsUrl: l.gmaps_url ?? undefined,
    mapsQuery: l.maps_query ?? undefined,
    horario: l.horario ?? undefined,
    site: l.site ?? undefined,
  };
}

/*
  Ordenacao de vitrine: perfil verificado vem SEMPRE antes do nao
  verificado; dentro de cada grupo a ordem recebida e preservada (o
  Array.sort do JS e estavel), entao relevancia/nota continuam mandando
  dentro do grupo.
*/
export function verificadoPrimeiro<T extends { verificado: boolean }>(
  lista: T[]
): T[] {
  return [...lista].sort((a, b) => Number(b.verificado) - Number(a.verificado));
}

export async function listarPrestadores(): Promise<PrestadorDemo[]> {
  const db = supabaseLeitura();
  if (!db) return PRESTADORES;
  try {
    const { data, error } = await db
      .from("providers")
      .select(SELECT_PRESTADOR)
      .eq("cidade_slug", CIDADE.slug);
    if (error || !data || data.length === 0) return PRESTADORES;
    return (data as LinhaProvider[]).map(mapear);
  } catch {
    return PRESTADORES;
  }
}

export async function buscarPrestadorPorSlug(
  slug: string
): Promise<PrestadorDemo | undefined> {
  const db = supabaseLeitura();
  if (!db) return demoPorSlug(slug);
  try {
    const { data, error } = await db
      .from("providers")
      .select(SELECT_PRESTADOR)
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return demoPorSlug(slug);
    return mapear(data as LinhaProvider);
  } catch {
    return demoPorSlug(slug);
  }
}

export async function listarSlugs(): Promise<string[]> {
  const db = supabaseLeitura();
  if (!db) return PRESTADORES.map((p) => p.slug);
  try {
    const { data, error } = await db
      .from("providers")
      .select("slug")
      .eq("cidade_slug", CIDADE.slug);
    if (error || !data || data.length === 0)
      return PRESTADORES.map((p) => p.slug);
    return data.map((r: { slug: string }) => r.slug);
  } catch {
    return PRESTADORES.map((p) => p.slug);
  }
}

export async function listarCategorias(): Promise<Categoria[]> {
  const db = supabaseLeitura();
  if (!db) return [...CATEGORIAS];
  try {
    const { data, error } = await db
      .from("categories")
      .select("nome, slug, icone")
      .order("nome");
    if (error || !data || data.length === 0) return [...CATEGORIAS];
    return data as Categoria[];
  } catch {
    return [...CATEGORIAS];
  }
}

export async function listarAvaliacoes(slug: string): Promise<Avaliacao[]> {
  const db = supabaseLeitura();
  if (!db) return AVALIACOES_DEMO;
  try {
    const { data, error } = await db
      .from("providers")
      .select("reviews(autor_nome, nota, texto)")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) return AVALIACOES_DEMO;
    const reviews = (
      data as {
        reviews: { autor_nome: string; nota: number; texto: string }[] | null;
      }
    ).reviews;
    if (!reviews || reviews.length === 0) return AVALIACOES_DEMO;
    return reviews.map((r) => ({
      nome: r.autor_nome,
      nota: Number(r.nota),
      texto: r.texto,
    }));
  } catch {
    return AVALIACOES_DEMO;
  }
}

export async function patrocinadoCidade(): Promise<Patrocinado> {
  const db = supabaseLeitura();
  if (!db) return PATROCINADO_CIDADE;
  try {
    const { data, error } = await db
      .from("ads")
      .select("nome_anunciante, descricao, whatsapp")
      .eq("posicao", "patrocinado_cidade")
      .order("criado_em", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !data) return PATROCINADO_CIDADE;
    const a = data as { nome_anunciante: string; descricao: string; whatsapp: string };
    return { nome: a.nome_anunciante, descricao: a.descricao, whatsapp: a.whatsapp };
  } catch {
    return PATROCINADO_CIDADE;
  }
}
