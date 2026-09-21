import { notFound } from "next/navigation";
import { AvisoContato } from "@/components/aviso-contato";
import { CarimboVerificado } from "@/components/card-prestador";
import { Icone } from "@/components/icones";
import { VotoRapido } from "@/components/voto-rapido";
import { CIDADE, buscarPrestadorPorSlug, PRESTADORES } from "@/lib/demo";
import {
  descricaoPrestador,
  jsonLdPrestador,
  tituloPrestador,
} from "@/lib/seo";

/*
  Ficha do prestador: a tela de decisao. Foto/dados, disponibilidade,
  servicos e precos, avaliacoes, contato fixo no rodape.
  Anuncio so no fim: a conversao do prestador e prioridade maxima.
*/

export function generateStaticParams() {
  return PRESTADORES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = buscarPrestadorPorSlug(slug);
  if (!p) return { title: "Profissional não encontrado" };
  return {
    title: tituloPrestador(p.nome, p.profissao),
    description: descricaoPrestador(
      p.nome,
      p.profissao,
      p.notaMedia,
      p.totalAvaliacoes,
      p.verificado
    ),
  };
}

const AVALIACOES_DEMO = [
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

export default async function PaginaPrestador({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = buscarPrestadorPorSlug(slug);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPrestador(p)) }}
      />

      <a
        href="javascript:history.back()"
        className="inline-flex items-center gap-1 text-sm font-semibold text-verde-fundo hover:text-verde-trampo"
      >
        <Icone nome="voltar" tamanho={16} />
        Voltar para a lista
      </a>

      {/* Ficha: nome, selo, nota, bairros */}
      <header className="mt-3 flex items-start gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-verde-fundo bg-verde-claro font-display text-2xl text-verde-fundo"
          style={{ borderRadius: 10 }}
          aria-hidden="true"
        >
          {p.nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl uppercase leading-none text-verde-fundo">
              {p.nome}
            </h1>
            <CarimboVerificado verificado={p.verificado} />
          </div>
          <p className="mt-1 text-tinta/80">
            {p.profissao} · {p.anosRegiao} anos na região · {CIDADE.nome}
          </p>
          <p className="mt-1 flex items-center gap-1">
            <Icone nome="estrela" tamanho={15} className="text-amarelo-aviso" />
            <strong>{p.notaMedia.toFixed(1)}</strong>
            <span className="text-sm text-tinta/70">
              · {p.totalAvaliacoes} avaliações de moradores
            </span>
          </p>
        </div>
      </header>

      {/* Estado vivo: disponibilidade ou area de atendimento */}
      <div className="mt-3 border-2 border-cinza-linha bg-verde-papel p-3" style={{ borderRadius: 10 }}>
        {p.disponivelHoje ? (
          <p className="flex items-center gap-2 font-semibold text-verde-trampo">
            <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-verde-trampo" />
            Disponível hoje
          </p>
        ) : (
          <p className="text-sm text-tinta/80">
            Atende: {p.bairros.join(", ")}
            {p.horario ? ` · ${p.horario}` : ""}
          </p>
        )}
      </div>

      <p className="mt-3 text-tinta">{p.bio}</p>

      {/* Servicos e precos: transparencia rara entre concorrentes */}
      <section aria-label="Serviços e preços" className="regra-tracejada mt-5 pt-3">
        <h2 className="font-display text-lg uppercase text-verde-fundo">
          Serviços e preços
        </h2>
        <ul className="mt-2">
          {p.servicos.map((s) => (
            <li
              key={s.titulo}
              className="flex items-baseline justify-between border-b border-cinza-linha py-2 last:border-b-0"
            >
              <span>{s.titulo}</span>
              <span className="font-semibold text-verde-fundo">
                {s.precoDesde != null ? `a partir de R$${s.precoDesde}` : "orçamento"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Avaliacoes: conteudo unico e indexavel, com voto rapido */}
      <section aria-label="Avaliações" className="regra-tracejada mt-5 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg uppercase text-verde-fundo">
            Avaliações dos moradores ({p.totalAvaliacoes})
          </h2>
          <VotoRapido
            prestadorId={p.id}
            positivos={p.votosPositivos}
            negativos={p.votosNegativos}
          />
        </div>
        <ul className="mt-2 space-y-3">
          {AVALIACOES_DEMO.map((a) => (
            <li key={a.nome} className="border-l-2 border-verde-claro pl-3">
              <p className="text-sm">
                <strong>{a.nome}</strong>
                <span className="ml-2 text-amarelo-aviso">
                  {"★".repeat(a.nota)}
                  <span className="text-cinza-linha">{"★".repeat(5 - a.nota)}</span>
                </span>
              </p>
              <p className="text-sm text-tinta/90">{a.texto}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm">
          <a href="/entrar" className="font-semibold underline">
            Escrever avaliação
          </a>{" "}
          <span className="text-tinta/60">(conta rapidinha, é grátis)</span>
        </p>
        {p.gmapsUrl && (
          <p className="mt-1 text-sm">
            <a
              href={p.gmapsUrl}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="underline"
            >
              Ver e avaliar no Google Maps
            </a>
          </p>
        )}
      </section>

      {/* Empresa: mapa (embed gratuito) e rota */}
      {p.tipo === "empresa" && (
        <section aria-label="Onde fica" className="regra-tracejada mt-5 pt-3">
          <h2 className="font-display text-lg uppercase text-verde-fundo">
            Onde está
          </h2>
          <div className="mt-2 overflow-hidden border-2 border-verde-fundo" style={{ borderRadius: 10 }}>
            <iframe
              title={`Mapa de ${p.nome}`}
              width="100%"
              height="220"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(
                p.mapsQuery ?? `${p.nome} ${CIDADE.nome}`
              )}&output=embed`}
            />
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
              p.mapsQuery ?? `${p.nome} ${CIDADE.nome}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="botao-afunda mt-2 inline-block border-2 border-verde-fundo px-3 py-2 text-sm font-bold text-verde-fundo hover:bg-verde-claro"
            style={{ borderRadius: 10 }}
          >
            Como chegar
          </a>
        </section>
      )}

      {/* Denuncia: moderacao comunitaria */}
      <p className="regra-tracejada mt-6 pt-3 text-xs text-tinta/60">
        Algo errado neste perfil?{" "}
        <a href="/entrar" className="underline">
          Denuncie
        </a>{" "}
        para a moderação. O Trampo Certo só divulga: negocie preço, prazo e
        recibo direto com o profissional.
      </p>

      {/* Publicidade: sempre DEPOIS da decisao */}
      <div className="regra-tracejada mt-4 pt-3 text-center text-xs text-tinta/50">
        Publicidade dos comércios da cidade ·{" "}
        <a href="/entrar" className="underline">
          anuncie aqui
        </a>
      </div>

      {/* Contato: barra fixa no celular, botao no fim da ficha no desktop */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-verde-fundo bg-papel p-3 md:hidden">
        <AvisoContato
          prestadorId={p.id}
          whatsapp={p.whatsapp}
          nomePrestador={p.nome}
        />
      </div>
      <div className="mt-5 hidden md:block">
        <AvisoContato
          prestadorId={p.id}
          whatsapp={p.whatsapp}
          nomePrestador={p.nome}
        />
      </div>
    </main>
  );
}
