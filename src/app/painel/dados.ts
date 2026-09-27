import { supabaseAutenticado } from "@/lib/supabase/auth";
import { supabaseService } from "@/lib/supabase/service";
import type { MeuPerfil, StatusPerfil } from "./tipos";

/*
  SO DE SERVIDOR (usa cookies do Next). Leitura do perfil do dono em um
  so lugar: a visao geral, o editor e as metricas consomem daqui, com o
  MESMO select e o mesmo mapeamento. A RLS libera leitura de qualquer
  perfil publicado, entao o dono e conferido pelo user_id na mao —
  nunca confie so na policy.
*/

export const SELECT_PERFIL =
  "id, user_id, slug, tipo, nome, profissao, bio, bairros, disponivel_hoje, whatsapp, gmaps_url, maps_query, site, horario, equipe, anos_regiao, status, verificado, nota_media, total_avaliacoes, votos_positivos, votos_negativos, provider_categories(categories(id, nome, slug)), provider_services(id, titulo, preco_desde, ordem)";

export const SELECT_CATEGORIAS = "id, nome, slug";

type CategoriaLinha = { id: string; nome: string; slug: string };

export type LinhaPerfil = {
  id: string;
  user_id: string;
  slug: string;
  tipo: "pessoa" | "empresa";
  nome: string;
  profissao: string;
  bio: string;
  bairros: string[];
  disponivel_hoje: boolean;
  whatsapp: string;
  gmaps_url: string | null;
  maps_query: string | null;
  site: string | null;
  horario: string | null;
  equipe: number | null;
  anos_regiao: number;
  status: StatusPerfil;
  verificado: boolean;
  nota_media: number | string;
  total_avaliacoes: number;
  votos_positivos: number;
  votos_negativos: number;
  provider_categories: { categories: CategoriaLinha | null }[] | null;
  provider_services:
    | { id: string; titulo: string; preco_desde: number | string | null; ordem: number }[]
    | null;
};

export function mapearPerfil(l: LinhaPerfil): MeuPerfil {
  return {
    id: l.id,
    slug: l.slug,
    tipo: l.tipo,
    nome: l.nome,
    profissao: l.profissao,
    bio: l.bio,
    bairros: l.bairros,
    disponivelHoje: l.disponivel_hoje,
    whatsapp: l.whatsapp,
    gmapsUrl: l.gmaps_url,
    mapsQuery: l.maps_query,
    site: l.site,
    horario: l.horario,
    equipe: l.equipe,
    anosRegiao: l.anos_regiao,
    status: l.status,
    verificado: l.verificado,
    notaMedia: Number(l.nota_media),
    totalAvaliacoes: l.total_avaliacoes,
    votosPositivos: l.votos_positivos,
    votosNegativos: l.votos_negativos,
    categorias: (l.provider_categories ?? [])
      .map((c) => c.categories)
      .filter((c): c is CategoriaLinha => c !== null),
    servicos: (l.provider_services ?? [])
      .map((s) => ({
        id: s.id,
        titulo: s.titulo,
        precoDesde: s.preco_desde == null ? null : Number(s.preco_desde),
        ordem: s.ordem,
      }))
      .sort((a, b) => a.ordem - b.ordem),
  };
}

/** Perfil do dono (ou null se não existe ou não é dele). */
export async function buscarPerfilDoDono(
  id: string,
  userId: string
): Promise<MeuPerfil | null> {
  const db = await supabaseAutenticado();
  if (!db) return null;
  const { data } = await db
    .from("providers")
    .select(SELECT_PERFIL)
    .eq("id", id)
    .maybeSingle();
  const linha = data as unknown as LinhaPerfil | null;
  if (!linha || linha.user_id !== userId) return null;
  return mapearPerfil(linha);
}

/** Cliques de contato dos últimos N dias (bruto, service_role). */
export async function listarCliques(providerId: string, dias: number) {
  const svc = supabaseService();
  if (!svc) return [] as { criado_em: string }[];
  const desde = new Date(Date.now() - (dias - 1) * 864e5);
  desde.setHours(0, 0, 0, 0);
  const { data } = await svc
    .from("contact_clicks")
    .select("criado_em")
    .eq("provider_id", providerId)
    .gte("criado_em", desde.toISOString());
  return (data ?? []) as { criado_em: string }[];
}

export type LinhaDiaria = {
  dia: string;
  paginas_vistas: number;
  cliques_contato: number;
  buscas: number;
  visitantes_unicos: number;
};

/** Agregado diário do perfil (páginas vistas, buscas, visitantes). */
export async function listarDiarias(
  providerId: string
): Promise<LinhaDiaria[]> {
  const svc = supabaseService();
  if (!svc) return [];
  const { data } = await svc
    .from("metrics_daily")
    .select("dia, paginas_vistas, cliques_contato, buscas, visitantes_unicos")
    .eq("provider_id", providerId)
    .order("dia", { ascending: false })
    .limit(30);
  return (data ?? []) as LinhaDiaria[];
}

/** Notas recebidas (leitura pública das avaliações do perfil). */
export async function listarNotas(
  providerId: string
): Promise<{ nota: number; criado_em: string }[]> {
  const db = await supabaseAutenticado();
  if (!db) return [];
  const { data } = await db
    .from("reviews")
    .select("nota, criado_em")
    .eq("provider_id", providerId)
    .order("criado_em", { ascending: false })
    .limit(500);
  return (data ?? []) as { nota: number; criado_em: string }[];
}
