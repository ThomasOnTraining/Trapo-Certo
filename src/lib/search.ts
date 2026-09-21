import { normalizarBusca, semAcento } from "./validate";

/*
  Busca tolerante ("pesquisas nao tao sensiveis"):
  - separa o que e servico e o que e bairro/cidade na mesma frase
  - tolera erro de digitacao via similaridade de trigramas
  - dicionario de sinonimos alimenta a busca (cada busca sem resultado
    vira sinonimo novo no admin: a busca fica esperta com o tempo)
  Em producao, a mesma logica roda no Postgres com pg_trgm + unaccent
  (ver supabase/schema.sql). Aqui, a versao em memoria para o modo demo
  e para as sugestoes.
*/

export type ItemBuscavel = {
  id: string;
  nome: string;
  profissao: string;
  categorias: string[];
  bairros: string[];
};

/** Dicionario de sinonimos (no MVP vem de search_synonyms no admin). */
export const SINONIMOS: Record<string, string[]> = {
  encanador: ["hidraulica", "cano", "vazamento", "torneira"],
  hidraulica: ["encanador", "cano", "vazamento"],
  "marido de aluguel": ["pequenos reparos", "bico", "reparos"],
  chuveiro: ["eletrica", "encanador", "instalacao"],
  "tomada": ["eletrica", "fios", "disjuntor"],
  disjuntor: ["eletrica", "fios", "tomada"],
  pintor: ["pintura", "fachada", "reforma"],
  "faxina": ["limpeza", "diarista", "domestica"],
  diarista: ["limpeza", "faxina"],
  frete: ["mudanca", "caminhao", "carreto"],
  carreto: ["frete", "mudanca"],
  dedetizador: ["dedetizacao", "pragas"],
  "de pau": ["marcenaria", "reforma"],
  pedreiro: ["construcao", "reforma", "alvenaria"],
  "professor": ["aulas", "reforco"],
  mecanico: ["oficina", "carro", "mecanica"],
  computador: ["informatica", "tecnologia", "formatacao"],
};

/** Similaridade de trigramas (0 a 1), espelhando pg_trgm. */
export function trigramas(texto: string): Set<string> {
  const t = ` ${texto} `;
  const g = new Set<string>();
  for (let i = 0; i < t.length - 2; i++) g.add(t.slice(i, i + 3));
  return g;
}

export function similaridade(a: string, b: string): number {
  const ga = trigramas(a);
  const gb = trigramas(b);
  if (ga.size === 0 || gb.size === 0) return 0;
  let comuns = 0;
  for (const g of ga) if (gb.has(g)) comuns++;
  return (2 * comuns) / (ga.size + gb.size);
}

export type Consulta = {
  termosServico: string[];
  termoLivre: string;
  bairro: string | null;
};

/** Separa "eletricista centro" em servico + bairro. */
export function analisarConsulta(
  q: string,
  bairrosConhecidos: string[]
): Consulta {
  const limpo = normalizarBusca(q);
  if (!limpo) return { termosServico: [], termoLivre: "", bairro: null };
  const partes = limpo.split(" ");
  const restantes: string[] = [];
  let bairro: string | null = null;

  for (let i = 0; i < partes.length; i++) {
    const fatia = partes.slice(i).join(" ");
    const casaBairro = bairrosConhecidos.find((b) =>
      semAcento(b).toLowerCase().includes(limpo)
    );
    // casa bairro por nome no fim da frase
    const achou = bairrosConhecidos.find(
      (b) => semAcento(b).toLowerCase() === fatia
    );
    if (achou) {
      bairro = achou;
      break;
    }
    if (casaBairro && fatia === limpo) {
      bairro = casaBairro;
      break;
    }
    restantes.push(partes[i]);
  }

  const termoLivre = restantes.join(" ");
  const termosServico = expandir(termoLivre);
  return { termosServico, termoLivre, bairro };
}

/** Expande um termo com sinonimos relevantes do dicionario. */
export function expandir(termo: string): string[] {
  const saida = new Set<string>([termo]);
  const t = normalizarBusca(termo);
  if (!t) return [];
  for (const [chave, lista] of Object.entries(SINONIMOS)) {
    const ch = normalizarBusca(chave);
    const rel = similaridade(t, ch);
    const exato = t.includes(ch) || ch.includes(t);
    if (exato || rel > 0.55) {
      saida.add(chave);
      for (const s of lista) saida.add(s);
    }
    for (const s of lista) {
      const sn = normalizarBusca(s);
      if ((t.includes(sn) || sn.includes(t)) && sn.length > 3) saida.add(s);
    }
  }
  return Array.from(saida);
}

export type ResultadoPonderado<T> = { item: T; pontuacao: number };

/** Pontua um prestador para a consulta: match de servico > bairro > nome. */
export function pontuarItem<T extends ItemBuscavel>(
  item: T,
  consulta: Consulta,
  extras?: { bairroDoUsuario?: string | null }
): ResultadoPonderado<T> | null {
  if (!consulta.termoLivre && !consulta.bairro) return null;
  let pontuacao = 0;

  const nomeNorm = normalizarBusca(item.nome);
  const profNorm = normalizarBusca(item.profissao);
  const catsNorm = item.categorias.map(normalizarBusca);
  const bairrosNorm = item.bairros.map(normalizarBusca);

  if (consulta.bairro) {
    const bNorm = normalizarBusca(consulta.bairro);
    if (bairrosNorm.includes(bNorm)) pontuacao += 2;
    else if (bairrosNorm.some((b) => b.includes(bNorm))) pontuacao += 1;
    else if (extras?.bairroDoUsuario === item.bairros[0]) pontuacao += 0.5;
  }

  if (consulta.termoLivre) {
    let melhor = 0;
    const alvo = normalizarBusca(consulta.termoLivre);
    const alvos = [nomeNorm, profNorm, ...catsNorm];
    for (const a of alvos) {
      melhor = Math.max(melhor, similaridade(alvo, a));
    }
    for (const termo of consulta.termosServico) {
      const t = normalizarBusca(termo);
      for (const a of alvos) melhor = Math.max(melhor, similaridade(t, a));
    }
    if (melhor < 0.35) return null; // sem match nenhum
    pontuacao += melhor * 3;
  }

  return { item, pontuacao };
}

export function ordenarResultados<T>(
  resultados: ResultadoPonderado<T>[]
): ResultadoPonderado<T>[] {
  return resultados.sort((a, b) => b.pontuacao - a.pontuacao);
}
