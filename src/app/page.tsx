import Link from "next/link";
import { Busca } from "@/components/busca";
import {
  CardPrestador,
  EtiquetaPatrocinado,
} from "@/components/card-prestador";
import { Icone } from "@/components/icones";
import {
  BAIRROS,
  CATEGORIAS,
  CIDADE,
  PATROCINADO_CIDADE,
  PRESTADORES,
} from "@/lib/demo";
import {
  descricaoHome,
  jsonLdPrestador,
  tituloHome,
} from "@/lib/seo";

/*
  Home = catalogo da cidade. Sem hero, sem apresentacao: a lista
  de profissionais comeca na primeira dobra. O site nao se apresenta,
  ele trabalha.
*/

export const metadata = {
  title: tituloHome(),
  description: descricaoHome(PRESTADORES.length, 146),
};

const totalAvaliacoes = PRESTADORES.reduce(
  (soma, p) => soma + p.totalAvaliacoes,
  0
);

export default function Home() {
  // Ordenacao: verificados primeiro, nota em seguida, disponivel hoje sobe.
  const lista = [...PRESTADORES].sort((a, b) => {
    if (a.verificado !== b.verificado) return a.verificado ? -1 : 1;
    if (a.disponivelHoje !== b.disponivelHoje)
      return a.disponivelHoje ? -1 : 1;
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

      <BarraTopo />

      {/* Chips de categoria: acesso direto ao que a cidade mais procura */}
      <nav aria-label="Categorias" className="regra-tracejada mt-3 py-3">
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {CATEGORIAS.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/busca?categoria=${c.slug}`}
                className="botao-afunda flex shrink-0 items-center gap-1.5 border-2 border-verde-fundo bg-papel px-3 py-1.5 text-sm font-semibold text-verde-fundo hover:bg-verde-claro"
                style={{ borderRadius: 10 }}
              >
                <Icone nome={c.icone} tamanho={17} />
                {c.nome}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Patrocinado da cidade: 1 card, etiqueta visivel, nunca no meio da lista */}
      <section aria-label="Patrocinado" className="mt-3">
        <div className="flex items-center gap-2">
          <EtiquetaPatrocinado />
          <span className="text-xs text-tinta/60">
            Comércio local que apoia o catálogo
          </span>
        </div>
        <div
          className="mt-1 flex items-center justify-between gap-3 border-2 border-amarelo-aviso bg-amarelo-aviso/10 p-3"
          style={{ borderRadius: 10 }}
        >
          <div>
            <p className="font-display uppercase text-verde-fundo">
              {PATROCINADO_CIDADE.nome}
            </p>
            <p className="text-sm">{PATROCINADO_CIDADE.descricao}</p>
          </div>
          <a
            href={`https://wa.me/${PATROCINADO_CIDADE.whatsapp}?text=${encodeURIComponent("Olá! Vi o anúncio no Trampo Certo.")}`}
            className="botao-afunda shrink-0 border-2 border-verde-fundo bg-papel px-3 py-2 text-sm font-bold text-verde-fundo hover:bg-verde-claro"
            style={{ borderRadius: 10 }}
          >
            Pedir orçamento
          </a>
        </div>
      </section>

      {/* A LISTA: o coracao da pagina, com conteudo real na primeira dobra */}
      <section aria-label="Profissionais da cidade" className="mt-4">
        <h2 className="flex items-baseline gap-2 border-b-2 border-verde-fundo pb-1 font-display text-xl uppercase text-verde-fundo">
          Profissionais de {CIDADE.nome}
          <span className="text-base font-bold text-verde-trampo">
            ({lista.length})
          </span>
        </h2>
        <p className="mt-1 text-sm text-tinta/70">
          {lista.length} profissionais · {totalAvaliacoes} avaliações de
          moradores · bairros atendidos: {BAIRROS.join(", ")}
        </p>
        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((p) => (
            <CardPrestador key={p.id} p={p} />
          ))}
        </div>
      </section>

      <p className="regra-tracejada mt-8 pt-4 text-sm text-tinta/70">
        Trampo Certo é o catálogo de serviços de {CIDADE.nome}. Quem busca não
        precisa de conta. Quem trabalha bem, aparece.
      </p>
    </main>
  );
}

function BarraTopo() {
  return (
    <header className="pt-2">
      <div className="flex items-center gap-3">
        <Link href="/" className="shrink-0">
          <span className="font-display text-lg leading-none text-verde-fundo">
            Trampo
            <br />
            Certo
            <span className="ml-1 inline-block -rotate-6 text-verde-trampo">✓</span>
          </span>
        </Link>
        <div className="min-w-0 flex-1">
          <Busca />
        </div>
        <a
          href="/entrar"
          className="botao-afunda shrink-0 border-2 border-verde-fundo px-3 py-2 text-sm font-bold text-verde-fundo hover:bg-verde-claro"
          style={{ borderRadius: 10 }}
        >
          Conta
        </a>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            jsonLdPrestador({
              nome: "Trampo Certo",
              profissao: "Catálogo de serviços",
              notaMedia: 4.8,
              totalAvaliacoes: 146,
              verificado: true,
              bairros: BAIRROS,
            })
          ),
        }}
      />
    </header>
  );
}
