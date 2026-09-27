import { CIDADE } from "@/lib/demo";
import { listarCategorias, listarPrestadores } from "@/lib/catalogo";

/*
  llms.txt: resumo interpretavel do site para answer engines
  (ChatGPT, Perplexity, Google AI Overviews). Fatos extraiveis,
  sem marketing: e isso que as IA citam com link.
*/
export async function GET() {
  const [categorias, prestadores] = await Promise.all([
    listarCategorias(),
    listarPrestadores(),
  ]);
  const verificados = prestadores.filter((p) => p.verificado).length;
  const avaliacoes = prestadores.reduce((s, p) => s + p.totalAvaliacoes, 0);

  const corpo = `# Trampo Certo

> Catálogo de prestadores de serviço de ${CIDADE.nome} (${CIDADE.estado}), Brasil.
> Perfis de profissionais e empresas com avaliações escritas por moradores,
> contato direto via WhatsApp e selo de verificação de documento.

## Fatos
- ${prestadores.length} profissionais e empresas cadastrados em ${CIDADE.nome}
- ${verificados} com documento verificado pelo Trampo Certo
- ${avaliacoes} avaliações de moradores
- O Trampo Certo apenas divulga perfis; não intermedia contratações, pagamentos nem negociações

## Categorias
${categorias.map((c) => `- [${c.nome}](${`/busca?categoria=${c.slug}`}): profissionais de ${c.nome.toLowerCase()} em ${CIDADE.nome}`).join("\n")}

## Profissionais
${prestadores.map(
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
