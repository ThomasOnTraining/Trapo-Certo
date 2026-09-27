/*
  Modo demonstracao: enquanto o Supabase nao esta conectado (env vazias),
  o site roda com estes dados de exemplo, com o mesmo formato que o
  banco real vai devolver. Tudo aqui e publico e fixo: nenhum dado sensivel.
*/

export type Servico = { titulo: string; precoDesde?: number };

export type PrestadorDemo = {
  id: string;
  slug: string;
  tipo: "pessoa" | "empresa";
  nome: string;
  profissao: string;
  bio: string;
  categorias: string[];
  categoriaSlugs: string[];
  bairros: string[];
  verificado: boolean;
  disponivelHoje: boolean;
  whatsapp: string; // formato demo
  notaMedia: number;
  totalAvaliacoes: number;
  votosPositivos: number;
  votosNegativos: number;
  servicos: Servico[];
  anosRegiao: number;
  gmapsUrl?: string;
  mapsQuery?: string; // usado no embed gratis quando nao ha link
  horario?: string;
  equipe?: number;
  site?: string;
};

export const CIDADE = { nome: "Paranaguá", slug: "paranagua", estado: "PR" };

export const CATEGORIAS = [
  { nome: "Elétrica", slug: "eletrica", icone: "bolt" },
  { nome: "Hidráulica", slug: "hidraulica", icone: "gota" },
  { nome: "Reforma e Construção", slug: "reforma", icone: "colher" },
  { nome: "Pequenos Reparos", slug: "reparos", icone: "chave" },
  { nome: "Limpeza", slug: "limpeza", icone: "vassoura" },
  { nome: "Beleza e Estética", slug: "beleza", icone: "tesoura" },
  { nome: "Mudanças e Fretes", slug: "fretes", icone: "caminhao" },
  { nome: "Mecânica", slug: "mecanica", icone: "chave-roda" },
  { nome: "Tecnologia", slug: "tecnologia", icone: "tela" },
  { nome: "Aulas", slug: "aulas", icone: "lapis" },
] as const;

export const BAIRROS = ["Centro", "Jardim Aurora", "Vila Rica", "São Pedro"];

/** Anunciante patrocinado demo (empresa que paga destaque). */
export const PATROCINADO_CIDADE = {
  nome: "Padaria Central",
  descricao: "Bolos e salgados para festas e eventos",
  whatsapp: "5541999990020",
};

export function buscarPrestadorPorSlug(slug: string): PrestadorDemo | undefined {
  return PRESTADORES.find((p) => p.slug === slug);
}

export const PRESTADORES: PrestadorDemo[] = [
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e01",
    slug: "joao-eletrica",
    tipo: "pessoa",
    nome: "João Elétrica",
    profissao: "Eletricista",
    bio: "Instalação e manutenção elétrica residencial. Atendimento no mesmo dia para urgências: disjuntor caindo, tomada, chuveiro e iluminação.",
    categorias: ["Elétrica"],
    categoriaSlugs: ["eletrica"],
    bairros: ["Centro", "Jardim Aurora"],
    verificado: true,
    disponivelHoje: true,
    whatsapp: "5541999990001",
    notaMedia: 4.8,
    totalAvaliacoes: 23,
    votosPositivos: 21,
    votosNegativos: 2,
    servicos: [
      { titulo: "Instalação de chuveiro", precoDesde: 80 },
      { titulo: "Quadro de energia e disjuntores", precoDesde: 150 },
      { titulo: "Troca de tomadas e interruptores", precoDesde: 60 },
    ],
    anosRegiao: 8,
    gmapsUrl: "https://maps.google.com/?q=eletricista+centro+paranagua",
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e02",
    slug: "eletrica-morada-nova",
    tipo: "empresa",
    nome: "Elétrica Morada Nova",
    profissao: "Instalações elétricas e segurança",
    bio: "Empresa com equipe de 3 técnicos verificados. Projetos elétricos, cerca elétrica e câmeras para casas e comércios.",
    categorias: ["Elétrica", "Tecnologia"],
    categoriaSlugs: ["eletrica", "tecnologia"],
    bairros: ["Centro", "Vila Rica", "São Pedro"],
    verificado: true,
    disponivelHoje: false,
    whatsapp: "5541999990002",
    notaMedia: 4.6,
    totalAvaliacoes: 11,
    votosPositivos: 10,
    votosNegativos: 1,
    servicos: [
      { titulo: "Cerca elétrica", precoDesde: 900 },
      { titulo: "Câmeras de segurança", precoDesde: 1200 },
      { titulo: "Manutenção elétrica comercial", precoDesde: 250 },
    ],
    anosRegiao: 12,
    horario: "Seg a Sáb, 8h às 18h",
    equipe: 3,
    mapsQuery: "Elétrica Morada Nova Paranaguá PR",
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e03",
    slug: "carlos-reparos",
    tipo: "pessoa",
    nome: "Carlos Reparos",
    profissao: "Pequenos reparos (marido de aluguel)",
    bio: "Montagem de móveis, pequenos reparos, troca de fechaduras e encanador geral. Levo ferramenta completa.",
    categorias: ["Pequenos Reparos"],
    categoriaSlugs: ["reparos"],
    bairros: ["Jardim Aurora", "Centro"],
    verificado: false,
    disponivelHoje: true,
    whatsapp: "5541999990003",
    notaMedia: 4.2,
    totalAvaliacoes: 7,
    votosPositivos: 6,
    votosNegativos: 1,
    servicos: [
      { titulo: "Montagem de móveis", precoDesde: 70 },
      { titulo: "Troca de fechadura", precoDesde: 90 },
    ],
    anosRegiao: 4,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e04",
    slug: "hidraulica-sao-pedro",
    tipo: "pessoa",
    nome: "Seu Bento Hidráulica",
    profissao: "Encanador",
    bio: "Vazamentos, instalação de pias, caixas d'água e limpeza de fossas simples. Especialista em tubulações antigas.",
    categorias: ["Hidráulica"],
    categoriaSlugs: ["hidraulica"],
    bairros: ["São Pedro", "Vila Rica"],
    verificado: true,
    disponivelHoje: false,
    whatsapp: "5541999990004",
    notaMedia: 4.9,
    totalAvaliacoes: 31,
    votosPositivos: 30,
    votosNegativos: 1,
    servicos: [
      { titulo: "Detecção e correção de vazamento", precoDesde: 120 },
      { titulo: "Instalação de pia e vaso", precoDesde: 150 },
    ],
    anosRegiao: 15,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e05",
    slug: "reformas-araujo",
    tipo: "empresa",
    nome: "Reformas Araújo",
    profissao: "Reforma e construção",
    bio: "Pintura, alvenaria e reformas completas com contrato simples e orçamento sem compromisso.",
    categorias: ["Reforma e Construção"],
    categoriaSlugs: ["reforma"],
    bairros: ["Centro", "Jardim Aurora", "Vila Rica"],
    verificado: true,
    disponivelHoje: true,
    whatsapp: "5541999990005",
    notaMedia: 4.5,
    totalAvaliacoes: 18,
    votosPositivos: 16,
    votosNegativos: 2,
    servicos: [
      { titulo: "Pintura de fachada", precoDesde: 800 },
      { titulo: "Reforma de banheiro", precoDesde: 2500 },
    ],
    anosRegiao: 9,
    horario: "Seg a Sex, 7h às 17h",
    equipe: 4,
    mapsQuery: "Reformas Araujo Paranaguá PR",
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e06",
    slug: "limpeza-rosa",
    tipo: "pessoa",
    nome: "Dona Rosa Limpeza",
    profissao: "Diarista e faxina pesada",
    bio: "Faxina residencial e comercial, pós-obra e lavagem de calçada. Referências na região.",
    categorias: ["Limpeza"],
    categoriaSlugs: ["limpeza"],
    bairros: ["Vila Rica", "Centro"],
    verificado: true,
    disponivelHoje: true,
    whatsapp: "5541999990006",
    notaMedia: 4.7,
    totalAvaliacoes: 15,
    votosPositivos: 14,
    votosNegativos: 1,
    servicos: [{ titulo: "Faxina diária", precoDesde: 150 }],
    anosRegiao: 10,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e07",
    slug: "beleza-ana",
    tipo: "pessoa",
    nome: "Estúdio Ana Beleza",
    profissao: "Cabeleireira e manicure",
    bio: "Atendimento em domicílio para eventos: noivas, formaturas e diárias de beleza.",
    categorias: ["Beleza e Estética"],
    categoriaSlugs: ["beleza"],
    bairros: ["Centro", "São Pedro"],
    verificado: false,
    disponivelHoje: false,
    whatsapp: "5541999990007",
    notaMedia: 4.4,
    totalAvaliacoes: 9,
    votosPositivos: 8,
    votosNegativos: 1,
    servicos: [{ titulo: "Pacote noiva", precoDesde: 600 }],
    anosRegiao: 6,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e08",
    slug: "frete-ze",
    tipo: "pessoa",
    nome: "Zé Fretes",
    profissao: "Fretes e mudanças pequenas",
    bio: "Carro baú para fretes rápidos, mudanças pequenas e entregas para comércios.",
    categorias: ["Mudanças e Fretes"],
    categoriaSlugs: ["fretes"],
    bairros: ["Centro", "Jardim Aurora", "São Pedro"],
    verificado: true,
    disponivelHoje: true,
    whatsapp: "5541999990008",
    notaMedia: 4.3,
    totalAvaliacoes: 12,
    votosPositivos: 10,
    votosNegativos: 2,
    servicos: [{ titulo: "Frete na cidade", precoDesde: 80 }],
    anosRegiao: 5,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e09",
    slug: "aulas-marcos",
    tipo: "pessoa",
    nome: "Marcos Aulas",
    profissao: "Reforço escolar (matemática e física)",
    bio: "Aulas de reforço para fundamental e ensino médio, presencial ou online.",
    categorias: ["Aulas"],
    categoriaSlugs: ["aulas"],
    bairros: ["Centro"],
    verificado: true,
    disponivelHoje: false,
    whatsapp: "5541999990009",
    notaMedia: 4.9,
    totalAvaliacoes: 6,
    votosPositivos: 6,
    votosNegativos: 0,
    servicos: [{ titulo: "Aula avulsa (1h)", precoDesde: 60 }],
    anosRegiao: 3,
  },
  {
    id: "5f0b3c1e-2a4d-4f8b-9c1d-1a2b3c4d5e10",
    slug: "tecnica-lu",
    tipo: "pessoa",
    nome: "Lu Informática",
    profissao: "Assistência técnica de computadores",
    bio: "Formatação, limpeza de vírus, montagem de PC e configuração de redes domésticas.",
    categorias: ["Tecnologia"],
    categoriaSlugs: ["tecnologia"],
    bairros: ["Centro", "Jardim Aurora"],
    verificado: true,
    disponivelHoje: true,
    whatsapp: "5541999990010",
    notaMedia: 4.6,
    totalAvaliacoes: 14,
    votosPositivos: 13,
    votosNegativos: 1,
    servicos: [{ titulo: "Formatação com backup", precoDesde: 120 }],
    anosRegiao: 7,
  },
];
