import { Busca } from "@/components/busca";
import { Filtros } from "@/components/filtros";
import {
  CardPrestador,
  EtiquetaPatrocinado,
} from "@/components/card-prestador";
import { Icone } from "@/components/icones";
import { CIDADE } from "@/lib/demo";
import {
  listarPrestadores,
  patrocinadoCidade,
} from "@/lib/catalogo";
import {
  descricaoHome,
  tituloHome,
} from "@/lib/seo";

/*
  Home = catalogo da cidade. Sem hero, sem apresentacao: a lista
  de profissionais comeca na primeira dobra. O site nao se apresenta,
  ele trabalha.
*/

export const revalidate = 300;

export async function generateMetadata() {
  const prestadores = await listarPrestadores();
  const total = prestadores.reduce((s, p) => s + p.totalAvaliacoes, 0);
  return {
    title: tituloHome(),
    description: descricaoHome(prestadores.length, total),
  };
}

export default async function Home() {
  const [prestadores, patrocinado] = await Promise.all([
    listarPrestadores(),
    patrocinadoCidade(),
  ]);
  const totalAvaliacoes = prestadores.reduce(
    (soma, p) => soma + p.totalAvaliacoes,
    0
  );
  const verificados = prestadores.filter((p) => p.verificado).length;
  const disponiveisHoje = prestadores.filter((p) => p.disponivelHoje).length;
  const naoVerificados = prestadores.filter((p) => !p.verificado).length;

  // Ordenacao: 
  // 1. Verificados disponíveis hoje
  // 2. Verificados não disponíveis hoje (por nota)
  // 3. Não verificados disponíveis hoje
  // 4. Não verificados não disponíveis hoje (por nota)
  const lista = [...prestadores].sort((a, b) => {
    const aVerif = a.verificado ? 0 : 1;
    const bVerif = b.verificado ? 0 : 1;
    if (aVerif !== bVerif) return aVerif - bVerif;
    
    const aDisp = a.disponivelHoje ? 0 : 1;
    const bDisp = b.disponivelHoje ? 0 : 1;
    if (aDisp !== bDisp) return aDisp - bDisp;
    
    return b.notaMedia - a.notaMedia;
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-8 pt-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "Trampo Certo",
            description: `Catálogo de serviços de ${CIDADE.nome}`,
          }),
        }}
      />

      <Busca />

      {/* Patrocinado: cupom de jornal de bairro, tracejado, etiqueta por cima */}
      <section aria-label="Patrocinado" className="relative mt-6">
        <div className="absolute -top-3 left-3 z-10">
          <EtiquetaPatrocinado />
        </div>
        <div
          className="flex flex-col gap-3 border-2 border-dashed border-verde-fundo bg-amarelo-aviso/15 p-3 pt-5 sm:flex-row sm:items-center sm:justify-between"
          style={{ borderRadius: 10 }}
        >
          <div className="flex min-w-0 items-start gap-2.5">
            <span
              aria-hidden="true"
              className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-verde-fundo bg-papel text-verde-fundo"
              style={{ borderRadius: 10 }}
            >
              <Icone nome="loja" tamanho={22} />
            </span>
            <div className="min-w-0">
              <p className="font-display uppercase text-verde-fundo">
                {patrocinado.nome}
              </p>
              <p className="text-sm">
                {patrocinado.descricao}{" "}
                <span className="text-xs text-tinta/60">
                  Comércio local que apoia o catálogo.
                </span>
              </p>
            </div>
          </div>
          <a
            href={`https://wa.me/${patrocinado.whatsapp}?text=${encodeURIComponent("Olá! Vi o anúncio no Trampo Certo.")}`}
            className="botao-afunda w-full shrink-0 border-2 border-verde-fundo bg-papel px-3 py-2 text-center text-sm font-bold uppercase tracking-wide text-verde-fundo hover:bg-verde-claro sm:w-auto"
            style={{ borderRadius: 10 }}
          >
            Pedir orçamento
          </a>
        </div>
      </section>

      <Filtros />

      {/* A LISTA: o coracao da pagina, com conteudo real na primeira dobra */}
      <section aria-label="Profissionais da cidade" className="mt-6">
        <h2 className="risca-forte flex flex-wrap items-baseline gap-x-2 pb-2 font-display text-2xl uppercase leading-none text-verde-fundo md:text-3xl">
          Profissionais de {CIDADE.nome}
          <span className="carimbo border-verde-trampo bg-verde-claro normal-case text-verde-trampo">
            {lista.length} na cidade
          </span>
        </h2>
        <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-2 border-2 border-cinza-linha bg-papel px-3 py-1.5" style={{ borderRadius: 10 }}>
            <Icone nome="escudo" tamanho={16} className="shrink-0 text-verde-trampo" />
            <span>
              <strong className="font-display text-base">{verificados}</strong>{" "}
              verificados
            </span>
          </li>
          <li className="flex items-center gap-2 border-2 border-cinza-linha bg-papel px-3 py-1.5" style={{ borderRadius: 10 }}>
            <Icone nome="estrela" tamanho={15} className="shrink-0 text-amarelo-aviso" />
            <span>
              <strong className="font-display text-base">{totalAvaliacoes}</strong>{" "}
              avaliações de moradores
            </span>
          </li>
          <li className="flex items-center gap-2 border-2 border-cinza-linha bg-papel px-3 py-1.5" style={{ borderRadius: 10 }}>
            <span
              aria-hidden="true"
              className="inline-block h-2 w-2 shrink-0 rounded-full bg-verde-trampo"
            />
            <span>
              <strong className="font-display text-base">{disponiveisHoje}</strong>{" "}
              disponíveis hoje
            </span>
          </li>
        </ul>
        
        {/* Verificados: a primeira vitrine, com selo de documento conferido */}
        <h3 className="mt-4 flex flex-wrap items-baseline gap-x-2 font-display text-lg uppercase text-verde-fundo">
          Perfis verificados
          <span className="carimbo border-verde-trampo bg-verde-claro normal-case text-verde-trampo">
            {verificados}
          </span>
        </h3>
        {verificados === 0 ? (
          <p className="mt-1 text-sm text-tinta/70">
            Nenhum perfil verificado ainda: a equipe do Trampo Certo está
            conferindo os primeiros documentos.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {lista.filter((p) => p.verificado).map((p) => (
              <CardPrestador key={p.id} p={p} />
            ))}
          </div>
        )}

        {/* Não verificados: publicados pelo dono, na hora, abaixo dos verificados */}
        {naoVerificados > 0 && (
          <>
            <hr className="regra-tracejada my-6" />
            <h3 className="font-display text-lg uppercase text-verde-fundo/70">
              Perfis não verificados
              <span className="carimbo border-amarelo-aviso bg-amarelo-aviso/15 normal-case text-verde-fundo">
                {naoVerificados}
              </span>
            </h3>
            <p className="mt-1 text-sm text-tinta/70">
              Publicados pelos próprios profissionais, sem esperar aprovação —
              ficam aqui, depois dos perfis já conferidos, até a equipe do
              Trampo Certo verificar os documentos. Podem ser profissionais
              excelentes: negocie com atenção e combine tudo por escrito.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {lista.filter((p) => !p.verificado).map((p) => (
                <CardPrestador key={p.id} p={p} />
              ))}
            </div>
          </>
        )}
      </section>

      <p className="regra-tracejada mt-8 pt-4 text-sm text-tinta/70">
        Trampo Certo é o catálogo de serviços de {CIDADE.nome}. Quem busca não
        precisa de conta. Quem trabalha bem, aparece.
      </p>
    </main>
  );
}
