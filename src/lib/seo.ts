import { CIDADE } from "./demo";

/*
  Gerador central de SEO: todo title/description/schema nasce daqui,
  no formato aprovado no plano (nome do prestador, servico local,
  guia da cidade). Zero texto gerado em massa: cada tipo de pagina
  tem um padrao e o conteudo vem de dados reais.
*/

export function tituloHome(): string {
  return `Serviços de ${CIDADE.nome} avaliados por moradores | Trampo Certo`;
}

export function descricaoHome(total: number, avaliacoes: number): string {
  return `${total} profissionais de ${CIDADE.nome} com ${avaliacoes} avaliações de quem mora aqui. Encontre eletricista, encanador, diarista e mais, com WhatsApp direto.`;
}

export function tituloPrestador(nome: string, profissao: string): string {
  return `${nome} | ${profissao} em ${CIDADE.nome} | Trampo Certo`;
}

export function descricaoPrestador(
  nome: string,
  profissao: string,
  nota: number,
  total: number,
  verificado: boolean
): string {
  const selo = verificado
    ? "Verificado (documento conferido)."
    : "Ainda não verificado pela equipe.";
  return `${nome}, ${profissao.toLowerCase()} em ${CIDADE.nome}. Nota ${nota} com ${total} avaliações de moradores. ${selo} Contato direto pelo WhatsApp.`;
}

export function tituloCategoria(categoria: string, total: number): string {
  return `${categoria} em ${CIDADE.nome}: ${total} profissionais | Trampo Certo`;
}

/** JSON-LD do perfil (LocalBusiness + AggregateRating). */
export function jsonLdPrestador(p: {
  nome: string;
  profissao: string;
  notaMedia: number;
  totalAvaliacoes: number;
  verificado: boolean;
  bairros: string[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: p.nome,
    description: `${p.profissao} em ${CIDADE.nome}`,
    address: {
      "@type": "PostalAddress",
      addressRegion: CIDADE.estado,
      addressLocality: CIDADE.nome,
    },
    areaServed: p.bairros,
    aggregateRating: p.totalAvaliacoes > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: p.notaMedia,
          reviewCount: p.totalAvaliacoes,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
  };
}
