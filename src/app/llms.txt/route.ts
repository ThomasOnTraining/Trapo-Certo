import { CATEGORIAS, CIDADE, PRESTADORES } from "@/lib/demo";

/*
  llms.txt: resumo interpretavel do site para answer engines
  (ChatGPT, Perplexity, Google AI Overviews). Fatos extraiveis,
  sem marketing: e isso que as IA citam com link.
*/
export function GET() {
  const verificados = PRESTADORES.filter((p) => p.verificado).length;
  const avaliacoes = PRESTADORES.reduce((s, p) => s + p.totalAvaliacoes, 0);

  const corpo = `# Trampo Certo

> Catálogo de prestadores de serviço de ${CIDADE.nome} (${CIDADE.estado}), Brasil.
> Perfis de profissionais e empresas com avaliações escritas por moradores,
> contato direto via WhatsApp e selo de verificação de documento.

## Fatos
- ${PRESTADORES.length} profissionais e empresas cadastrados em ${CIDADE.nome}
- ${verificados} com documento verificado pelo Trampo Certo
- ${avaliacoes} avaliações de moradores
- O Trampo Certo apenas divulga perfis; não intermedia contratações, pagamentos nem negociações

## Categorias
${CATEGORIAS.map((c) => `- [${c.nome}](${`/busca?categoria=${c.slug}`}): profissionais de ${c.nome.toLowerCase()} em ${CIDADE.nome}`).join("\n")}

## Profissionais
${PRESTADORES.map(
  (p) =>
    `- [${p.nome}](${`/prestador/${p.slug}`}): ${p.profissao}, nota ${p.notaMedia.toFixed(1)} de 5 com ${p.totalAvaliacoes} avaliações${p.verificado ? ", documento verificado" : ""}, atende ${p.bairros.join(" e ")}`
).join("\n")}

## Páginas legais
- [Termos de uso](/termos)
- [Política de privacidade](/privacidade)
- [Aviso legal](/aviso-legal)
- [Privacidade e cookies](/cookies)
`;

  return new Response(corpo, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
