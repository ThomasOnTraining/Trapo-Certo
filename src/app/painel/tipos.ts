/*
  Tipos do painel. Compartilhados entre telas de servidor (visão geral,
  editar, métricas) e componentes de cliente — por isso ficam fora de
  qualquer módulo com "use client".
*/

export type CategoriaPainel = { id: string; nome: string; slug: string };

/*
  Status de moderação. 'rascunho' é estado legado (perfil criado antes de
  a publicação ser imediata): aparece só como aviso, some quando a equipe
  publica. O caminho normal é nascer 'publicado' + verificado = false.
*/
export type StatusPerfil = "rascunho" | "publicado" | "suspenso";

export type MeuPerfil = {
  id: string;
  slug: string;
  tipo: "pessoa" | "empresa";
  nome: string;
  profissao: string;
  bio: string;
  bairros: string[];
  disponivelHoje: boolean;
  whatsapp: string;
  gmapsUrl: string | null;
  mapsQuery: string | null;
  site: string | null;
  horario: string | null;
  equipe: number | null;
  anosRegiao: number;
  status: StatusPerfil;
  verificado: boolean;
  notaMedia: number;
  totalAvaliacoes: number;
  votosPositivos: number;
  votosNegativos: number;
  categorias: CategoriaPainel[];
  servicos: {
    id: string;
    titulo: string;
    precoDesde: number | null;
    ordem: number;
  }[];
};

export type AnuncioPainel = {
  id: string;
  nome: string;
  posicao: "patrocinado_cidade" | "fim_lista" | "categoria";
  categoriaSlug: string | null;
  status: "ativo" | "pausado" | "encerrado";
  pagoAte: string;
};

/** Linha em edição no editor (id null = serviço ainda não salvo). */
export type RascunhoServico = {
  id: string | null;
  titulo: string;
  preco: string;
};
