import { notFound } from "next/navigation";
import { AvisoContato } from "@/components/aviso-contato";
import { CarimboVerificado } from "@/components/card-prestador";
import { Icone } from "@/components/icones";
import { Voltar } from "@/components/voltar";
import { VotoRapido } from "@/components/voto-rapido";
import { CIDADE } from "@/lib/demo";
import {
  buscarPrestadorPorSlug,
  listarAvaliacoes,
  listarSlugs,
} from "@/lib/catalogo";
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

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await listarSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await buscarPrestadorPorSlug(slug);
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

export default async function PaginaPrestador({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [p, avaliacoes] = await Promise.all([
    buscarPrestadorPorSlug(slug),
    listarAvaliacoes(slug),
  ]);
  if (!p) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 pb-28 pt-3">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPrestador(p)) }}
      />

      <Voltar />

      {/* Ficha: nome, selo, nota, bairros */}
      <header className="risca-forte mt-3 flex items-start gap-3 pb-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center border-2 border-verde-fundo bg-verde-fundo font-display text-2xl text-papel"
          style={{ borderRadius: 10 }}
          aria-hidden="true"
        >
          {p.nome.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-3xl uppercase leading-none text-verde-fundo">
              {p.nome}
            </h1>
            <CarimboVerificado verificado={p.verificado} />
          </div>
          <p className="mt-1.5 text-tinta/80">
            {p.profissao}, {p.anosRegiao} anos em {CIDADE.nome}
          </p>
          <p className="mt-1 flex items-center gap-1">
            <Icone nome="estrela" tamanho={15} className="text-amarelo-aviso" />
            <strong className="font-display text-lg">{p.notaMedia.toFixed(1)}</strong>
            <span className="text-sm text-tinta/70">
              em {p.totalAvaliacoes} avaliações de moradores
            </span>
          </p>
        </div>
      </header>

      {/* Estado vivo: faixa de cartaz quando tem agenda hoje */}
      {p.disponivelHoje ? (
        <p
          className="mt-4 flex items-center gap-2 border-2 border-verde-fundo bg-verde-trampo px-3 py-2 font-display uppercase tracking-wide text-papel"
          style={{ borderRadius: 10 }}
        >
          <span className="inline-block h-2.5 w-2.5 animate-pulse rounded-full bg-papel" />
          Disponível hoje
        </p>
      ) : (
        <p
          className="mt-4 border-2 border-cinza-linha bg-papel px-3 py-2 text-sm text-tinta/80"
          style={{ borderRadius: 10 }}
        >
          Atende {p.bairros.join(", ")}
          {p.horario ? `, ${p.horario}` : ""}
        </p>
      )}

      {!p.verificado && (
        <p
          className="mt-3 flex items-start gap-2 border-2 border-dashed border-amarelo-aviso bg-amarelo-aviso/10 px-3 py-2 text-sm text-tinta/90"
          style={{ borderRadius: 10 }}
        >
          <Icone
            nome="relogio"
            tamanho={16}
            className="mt-0.5 shrink-0 text-verde-fundo"
          />
          <span>
            <strong>Perfil não verificado.</strong> O dono publicou o perfil
            direto, sem esperar a equipe, e o Trampo Certo ainda não conferiu os
            documentos. Combine orçamento por escrito e nunca pague tudo
            adiantado.
          </span>
        </p>
      )}

      <p className="mt-4 max-w-[65ch] leading-relaxed text-tinta">{p.bio}</p>

      {/* Servicos e precos: quadro de feira, com pontilhado e preco em tinta */}
      <section aria-label="Serviços e preços" className="mt-6">
        <h2 className="risca-forte pb-2 font-display text-xl uppercase leading-none text-verde-fundo">
          Serviços e preços
        </h2>
        <ul className="mt-2">
          {p.servicos.map((s) => (
            <li key={s.titulo} className="linha-preco py-2.5">
              <span>{s.titulo}</span>
              <span className="shrink-0 font-display text-lg text-verde-fundo">
                {s.precoDesde != null ? `R$${s.precoDesde}+` : "sob orçamento"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Avaliacoes: conteudo unico e indexavel, com voto rapido */}
      <section aria-label="Avaliações" className="regra-tracejada mt-6 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl uppercase leading-none text-verde-fundo">
            Avaliações dos moradores ({p.totalAvaliacoes})
          </h2>
          <VotoRapido
            prestadorId={p.id}
            positivos={p.votosPositivos}
            negativos={p.votosNegativos}
          />
        </div>
        <ul className="mt-3 space-y-3">
          {avaliacoes.map((a) => (
            <li
              key={a.nome}
              className="border-l-4 border-verde-trampo bg-papel py-2 pl-3 pr-2"
              style={{ borderRadius: 3 }}
            >
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
        <section aria-label="Onde fica" className="regra-tracejada mt-6 pt-4">
          <h2 className="risca-forte pb-2 font-display text-xl uppercase leading-none text-verde-fundo">
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
      <p className="regra-tracejada mt-8 pt-4 text-xs text-tinta/60">
        Algo errado neste perfil?{" "}
        <a href="/entrar" className="underline">
          Denuncie
        </a>{" "}
        para a moderação. O Trampo Certo só divulga: negocie preço, prazo e
        recibo direto com o profissional.
      </p>

      {/* Publicidade: sempre DEPOIS da decisao */}
      <div className="regra-tracejada mt-4 pt-3 text-center text-xs text-tinta/50">
        Publicidade dos comércios da cidade.{" "}
        <a href="/entrar" className="underline">
          Anuncie aqui
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
