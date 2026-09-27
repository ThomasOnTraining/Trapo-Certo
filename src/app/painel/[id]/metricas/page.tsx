import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { TrilhaSecao } from "../../trilha-secao";
import { SelosPerfil } from "../../cartao-perfil";
import { AcoesModeracao } from "../../moderacao";
import { CLASSE_BOTAO } from "../../campos";
import {
  buscarPerfilDoDono,
  listarCliques,
  listarDiarias,
  listarNotas,
} from "../../dados";

export const metadata: Metadata = {
  title: "Métricas do perfil",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/*
  Métricas: tela separada do editor, só com desempenho.
  - cliques no WhatsApp: contagem real de contact_clicks (14 e 30 dias);
  - notas e avaliações: reviews do perfil, por estrela e por mês;
  - agregado diário (páginas vistas, buscas, visitantes) quando existir.
  Gráficos são CSS puro (barras) — sem dependência nova, sem JS extra.
*/

const MESES = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

type Ponto = { rotulo: string; valor: number; titulo: string };

function diasAtras(n: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

function chaveDoDia(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/** Barras verticais com valor no topo e rótulo embaixo. */
function GraficoBarras({
  titulo,
  legenda,
  serie,
  vazio,
}: {
  titulo: string;
  legenda: string;
  serie: Ponto[];
  vazio: string;
}) {
  const maior = Math.max(...serie.map((p) => p.valor), 0);
  const total = serie.reduce((s, p) => s + p.valor, 0);

  return (
    <figure
      className="border-2 border-cinza-linha bg-papel p-4"
      style={{ borderRadius: 10 }}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-display uppercase text-verde-fundo">{titulo}</span>
        <span className="text-xs text-tinta/60">{legenda}</span>
      </figcaption>

      {total === 0 ? (
        <p className="mt-3 text-sm text-tinta/70">{vazio}</p>
      ) : (
        <div
          className="mt-4 flex items-end gap-1"
          role="img"
          aria-label={`${titulo}: ${legenda}`}
        >
          {serie.map((p) => (
            <div
              key={p.rotulo}
              className="flex min-w-0 flex-1 flex-col items-center gap-1"
              title={p.titulo}
            >
              <span className="text-[10px] font-bold leading-none text-tinta/70">
                {p.valor > 0 ? p.valor : ""}
              </span>
              <span
                aria-hidden="true"
                className="w-full"
                style={{
                  height: maior > 0 ? Math.round((p.valor / maior) * 80) : 0,
                  minHeight: 2,
                  borderRadius: 3,
                  background:
                    p.valor > 0
                      ? "var(--color-verde-trampo)"
                      : "var(--color-cinza-linha)",
                }}
              />
              <span className="truncate text-[9px] uppercase leading-none text-tinta/55">
                {p.rotulo}
              </span>
            </div>
          ))}
        </div>
      )}

      <ul className="sr-only">
        {serie.map((p) => (
          <li key={p.rotulo}>{p.titulo}</li>
        ))}
      </ul>
    </figure>
  );
}

/** Barras horizontais (notas de 5 a 1). */
function GraficoNotas({ distribuicao }: { distribuicao: number[] }) {
  const maior = Math.max(...distribuicao, 0);
  const total = distribuicao.reduce((s, n) => s + n, 0);
  return (
    <figure
      className="border-2 border-cinza-linha bg-papel p-4"
      style={{ borderRadius: 10 }}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="font-display uppercase text-verde-fundo">
          Notas recebidas
        </span>
        <span className="text-xs text-tinta/60">de 1 a 5 estrelas</span>
      </figcaption>
      {total === 0 ? (
        <p className="mt-3 text-sm text-tinta/70">
          Nenhuma avaliação ainda. O perfil público mostra as avaliações dos
          moradores conforme elas chegam.
        </p>
      ) : (
        <ul className="mt-3 space-y-1.5">
          {[5, 4, 3, 2, 1].map((nota) => {
            const qtd = distribuicao[nota - 1] ?? 0;
            const largura = maior > 0 ? Math.round((qtd / maior) * 100) : 0;
            return (
              <li key={nota} className="flex items-center gap-2 text-xs">
                <span className="w-10 shrink-0 font-bold text-tinta/70">
                  {nota} ★
                </span>
                <span
                  className="h-3 flex-1 overflow-hidden bg-verde-papel"
                  style={{ borderRadius: 3 }}
                >
                  <span
                    className="block h-full bg-amarelo-aviso"
                    style={{ width: `${largura}%`, borderRadius: 3 }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right font-bold text-tinta">
                  {qtd}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </figure>
  );
}

/** Número grande com legenda: a leitura rápida do topo da tela. */
function Indicador({
  valor,
  legenda,
  detalhe,
}: {
  valor: string;
  legenda: string;
  detalhe?: string;
}) {
  return (
    <li
      className="border-2 border-verde-fundo bg-papel px-3 py-2.5"
      style={{ borderRadius: 10 }}
    >
      <p className="font-display text-2xl leading-none text-verde-fundo">
        {valor}
      </p>
      <p className="mt-1 text-xs font-bold uppercase tracking-wide text-tinta/70">
        {legenda}
      </p>
      {detalhe && <p className="text-xs text-tinta/50">{detalhe}</p>}
    </li>
  );
}


export default async function MetricasPagina({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await supabaseAutenticado();
  if (!db) redirect("/entrar");

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");

  const perfil = await buscarPerfilDoDono(id, user.id);
  if (!perfil) notFound();

  const { data: conta } = await db
    .from("profiles")
    .select("papel")
    .eq("id", user.id)
    .single();
  const admin = conta?.papel === "admin";

  const [cliques30, notas, diarias] = await Promise.all([
    listarCliques(perfil.id, 30),
    listarNotas(perfil.id),
    listarDiarias(perfil.id),
  ]);

  // Série de 14 dias (mais antigo -> hoje)
  const contagemPorDia = new Map<string, number>();
  for (const c of cliques30) {
    const chave = chaveDoDia(new Date(c.criado_em));
    contagemPorDia.set(chave, (contagemPorDia.get(chave) ?? 0) + 1);
  }
  const serie14: Ponto[] = Array.from({ length: 14 }, (_, i) => {
    const dia = diasAtras(13 - i);
    const chave = chaveDoDia(dia);
    const valor = contagemPorDia.get(chave) ?? 0;
    const rotulo = `${String(dia.getDate()).padStart(2, "0")}/${String(
      dia.getMonth() + 1
    ).padStart(2, "0")}`;
    return { rotulo, valor, titulo: `${rotulo}: ${valor} clique(s)` };
  });

  const cliques14 = serie14.reduce((s, p) => s + p.valor, 0);
  const cliquesTotal30 = cliques30.length;

  // Distribuição das notas (índice 0 = 1 estrela)
  const distribuicao = [0, 0, 0, 0, 0];
  for (const n of notas) {
    const idx = Math.min(4, Math.max(0, Math.round(n.nota) - 1));
    distribuicao[idx] += 1;
  }

  // Avaliações por mês (6 meses, mais antigo -> atual)
  const hoje = new Date();
  const meses: Ponto[] = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - (5 - i), 1);
    const qtd = notas.filter((n) => {
      const c = new Date(n.criado_em);
      return (
        c.getFullYear() === d.getFullYear() && c.getMonth() === d.getMonth()
      );
    }).length;
    const rotulo = `${MESES[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`;
    return { rotulo, valor: qtd, titulo: `${rotulo}: ${qtd} avaliação(ões)` };
  });

  const agregado = diarias.reduce(
    (s, d) => ({
      paginas: s.paginas + d.paginas_vistas,
      buscas: s.buscas + d.buscas,
      visitantes: s.visitantes + d.visitantes_unicos,
    }),
    { paginas: 0, buscas: 0, visitantes: 0 }
  );
  const temAlcance =
    agregado.paginas + agregado.buscas + agregado.visitantes > 0;


  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-6">
      <TrilhaSecao
        secao="Métricas"
        titulo={perfil.nome}
        descricao="Desempenho do perfil no catálogo: cliques no WhatsApp, avaliações recebidas e alcance. Os últimos 30 dias entram na conta."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <SelosPerfil status={perfil.status} verificado={perfil.verificado} />
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/painel/${perfil.id}/editar`}
            className={`${CLASSE_BOTAO} border-verde-fundo text-verde-fundo hover:bg-verde-claro`}
            style={{ borderRadius: 10 }}
          >
            Editar perfil
          </Link>
          {perfil.status === "publicado" && (
            <Link
              href={`/prestador/${perfil.slug}`}
              className="text-xs font-bold uppercase tracking-wide text-verde-trampo underline underline-offset-2 hover:text-verde-trampo-forte"
            >
              Ver página pública
            </Link>
          )}
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Indicador
          valor={String(cliquesTotal30)}
          legenda="Cliques no WhatsApp"
          detalhe="últimos 30 dias"
        />
        <Indicador
          valor={perfil.notaMedia.toFixed(1)}
          legenda="Nota média"
          detalhe={`${perfil.totalAvaliacoes} avaliação(ões)`}
        />
        <Indicador
          valor={String(cliques14)}
          legenda="Cliques na quinzena"
          detalhe="últimos 14 dias"
        />
        <Indicador
          valor={`${perfil.votosPositivos}/${perfil.votosNegativos}`}
          legenda="Votos úteis/não"
          detalhe="avaliação da ficha"
        />
      </ul>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <GraficoBarras
          titulo="Cliques no WhatsApp"
          legenda="últimos 14 dias"
          serie={serie14}
          vazio="Nenhum clique no período. Todo toque no botão de WhatsApp da página pública conta aqui — divulgue o link do seu perfil para começar a medir."
        />
        <GraficoNotas distribuicao={distribuicao} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <GraficoBarras
          titulo="Avaliações por mês"
          legenda="últimos 6 meses"
          serie={meses}
          vazio="Sem avaliações nos últimos 6 meses."
        />


        <section
          aria-labelledby="titulo-alcance"
          className="border-2 border-cinza-linha bg-papel p-4"
          style={{ borderRadius: 10 }}
        >
          <h2
            id="titulo-alcance"
            className="font-display uppercase text-verde-fundo"
          >
            Alcance no catálogo
          </h2>
          {!temAlcance ? (
            <p className="mt-3 text-sm text-tinta/70">
              O contador diário de páginas vistas, buscas e visitantes ainda não
              tem dado para este perfil. Ele é acumulado pelo servidor e aparece
              aqui assim que começar a rodar.
            </p>
          ) : (
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="linha-preco">
                <span>Páginas vistas</span>
                <span className="font-display text-base text-verde-fundo">
                  {agregado.paginas}
                </span>
              </li>
              <li className="linha-preco">
                <span>Aparições em busca</span>
                <span className="font-display text-base text-verde-fundo">
                  {agregado.buscas}
                </span>
              </li>
              <li className="linha-preco">
                <span>Visitantes únicos</span>
                <span className="font-display text-base text-verde-fundo">
                  {agregado.visitantes}
                </span>
              </li>
            </ul>
          )}
        </section>
      </div>

      {/* Selo: o que muda para o morador + ação da equipe quando for admin */}
      <section
        aria-labelledby="titulo-selo"
        className="mt-4 border-2 border-cinza-linha bg-papel p-4"
        style={{ borderRadius: 10 }}
      >
        <h2 id="titulo-selo" className="font-display uppercase text-verde-fundo">
          Situação do perfil
        </h2>
        <p className="mt-2 text-sm text-tinta/85">
          {perfil.verificado ? (
            <>
              <strong>Verificado.</strong> A equipe do Trampo Certo conferiu os
              dados deste perfil: ele aparece antes dos não verificados no
              catálogo.
            </>
          ) : (
            <>
              <strong>Não verificado.</strong> O perfil está publicado
              normalmente, mas aparece depois dos verificados no catálogo. A
              equipe pode conferir seus dados a qualquer momento — sem precisar
              tirar o perfil do ar.
            </>
          )}
        </p>
        {admin && (
          <AcoesModeracao
            providerId={perfil.id}
            verificado={perfil.verificado}
            status={perfil.status}
          />
        )}
      </section>

      <p className="regra-tracejada mt-6 pt-4 text-xs text-tinta/60">
        Sem contagem de pessoas: os cliques são anônimos (nunca guardamos quem
        clicou) e as avaliações vêm de moradores com conta no Trampo Certo.
      </p>
    </main>
  );
}

