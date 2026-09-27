import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { CIDADE } from "@/lib/demo";
import { sair } from "../entrar/actions";
import { CartaoPerfil } from "./cartao-perfil";
import { CriarPerfil } from "./criar-perfil";
import { AcoesModeracao } from "./moderacao";
import { CLASSE_BOTAO } from "./campos";
import { Icone } from "@/components/icones";
import { SELECT_PERFIL, mapearPerfil, type LinhaPerfil } from "./dados";
import type { AnuncioPainel } from "./tipos";

export const metadata: Metadata = {
  title: "Meu painel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

type LinhaAnuncio = {
  id: string;
  nome_anunciante: string;
  posicao: AnuncioPainel["posicao"];
  categoria_slug: string | null;
  status: AnuncioPainel["status"];
  pago_ate: string;
};

type LinhaFila = { id: string; nome: string; profissao: string };

const ROTULO_POSICAO: Record<AnuncioPainel["posicao"], string> = {
  patrocinado_cidade: "Patrocinado da cidade",
  fim_lista: "Fim da lista",
  categoria: "Topo da categoria",
};

const ROTULO_STATUS_ANUNCIO: Record<AnuncioPainel["status"], string> = {
  ativo: "No ar",
  pausado: "Pausado",
  encerrado: "Encerrado",
};

/** Horário do dia em Paranaguá — saudação sem depender de locale do host. */
function saudacaoDoDia(): string {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", {
      hour: "numeric",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date())
  );
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

/*
  Visão geral do painel: quem é a conta, quantos perfis, em que pé está
  cada um e os dois caminhos de cada perfil (Editar | Métricas). As
  métricas de desempenho moram na tela de métricas — aqui é gestão.
  Conta admin da equipe ainda vê a fila de perfis a verificar.
*/
export default async function Painel() {
  const db = await supabaseAutenticado();
  if (!db) redirect("/entrar");

  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect("/entrar");

  const [{ data: conta }, { data: linhas }, { data: anunciosLinhas }] =
    await Promise.all([
      db.from("profiles").select("nome, papel").eq("id", user.id).single(),
      db
        .from("providers")
        .select(SELECT_PERFIL)
        .eq("user_id", user.id)
        .order("criado_em"),
      db
        .from("ads")
        .select("id, nome_anunciante, posicao, categoria_slug, status, pago_ate")
        .eq("anunciante_user_id", user.id)
        .order("criado_em", { ascending: false }),
    ]);

  const perfis = ((linhas ?? []) as unknown as LinhaPerfil[]).map(mapearPerfil);
  const admin = conta?.papel === "admin";
  const nomeConta = conta?.nome ?? user.email?.split("@")[0] ?? "morador";

  const anuncios: AnuncioPainel[] = (
    (anunciosLinhas ?? []) as unknown as LinhaAnuncio[]
  ).map((a) => ({
    id: a.id,
    nome: a.nome_anunciante,
    posicao: a.posicao,
    categoriaSlug: a.categoria_slug,
    status: a.status,
    pagoAte: a.pago_ate,
  }));

  // Fila da equipe: publicados que ainda não passaram pela verificação.
  let fila: LinhaFila[] = [];
  if (admin) {
    const { data } = await db
      .from("providers")
      .select("id, nome, profissao")
      .eq("cidade_slug", CIDADE.slug)
      .eq("status", "publicado")
      .eq("verificado", false)
      .neq("user_id", user.id)
      .order("criado_em")
      .limit(12);
    fila = (data ?? []) as LinhaFila[];
  }

  const noAr = perfis.filter((p) => p.status === "publicado").length;
  const semVerificacao = perfis.filter((p) => !p.verificado).length;
  const avaliacoes = perfis.reduce((s, p) => s + p.totalAvaliacoes, 0);


  return (
    <main className="mx-auto max-w-3xl px-4 pb-10 pt-6">
      {/* Cabeçalho: onde estou, como volto, como saio */}
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="font-display text-xs uppercase tracking-widest text-verde-trampo">
            Painel do profissional
          </p>
          <h1 className="risca-forte mt-1 pb-2 font-display text-3xl uppercase leading-none text-verde-fundo">
            Meu painel
          </h1>
          <p className="mt-2 text-sm text-tinta/80">
            {saudacaoDoDia()}, <strong>{nomeConta}</strong>. Aqui você cuida dos
            seus perfis no catálogo de {CIDADE.nome}.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/"
            className={`${CLASSE_BOTAO} border-verde-fundo text-verde-fundo hover:bg-verde-claro`}
            style={{ borderRadius: 10 }}
          >
            <Icone nome="voltar" tamanho={14} />
            Ver catálogo
          </Link>
          <form action={sair}>
            <button
              type="submit"
              className={`${CLASSE_BOTAO} border-cinza-linha text-tinta/80 hover:bg-verde-papel`}
              style={{ borderRadius: 10 }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>

      {/* Resumo da conta: gestão, não desempenho */}
      <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <li
          className="border-2 border-cinza-linha bg-papel px-3 py-2"
          style={{ borderRadius: 10 }}
        >
          <strong className="font-display text-lg text-verde-fundo">
            {perfis.length}
          </strong>{" "}
          <span className="text-tinta/70">
            {perfis.length === 1 ? "perfil" : "perfis"}
          </span>
        </li>
        <li
          className="border-2 border-cinza-linha bg-papel px-3 py-2"
          style={{ borderRadius: 10 }}
        >
          <strong className="font-display text-lg text-verde-fundo">
            {noAr}
          </strong>{" "}
          <span className="text-tinta/70">no ar</span>
        </li>
        <li
          className="border-2 border-cinza-linha bg-papel px-3 py-2"
          style={{ borderRadius: 10 }}
        >
          <strong className="font-display text-lg text-verde-fundo">
            {semVerificacao}
          </strong>{" "}
          <span className="text-tinta/70">não verificados</span>
        </li>
        <li
          className="border-2 border-cinza-linha bg-papel px-3 py-2"
          style={{ borderRadius: 10 }}
        >
          <strong className="font-display text-lg text-verde-fundo">
            {avaliacoes}
          </strong>{" "}
          <span className="text-tinta/70">avaliações</span>
        </li>
      </ul>

      {/* Verificação explicada em uma linha: tira a dúvida do "não verificado" */}
      <details
        className="mt-3 border-2 border-cinza-linha bg-papel p-3"
        style={{ borderRadius: 10 }}
      >
        <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-tinta">
          O que muda entre verificado e não verificado?
        </summary>
        <ul className="mt-2 space-y-1.5 text-sm text-tinta/85">
          <li className="flex items-start gap-2">
            <Icone
              nome="check"
              tamanho={15}
              className="mt-0.5 shrink-0 text-verde-trampo"
            />
            <span>
              <strong>Publicado:</strong> o perfil entra no catálogo assim que
              você cria — não espera aprovação de ninguém.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icone
              nome="escudo"
              tamanho={15}
              className="mt-0.5 shrink-0 text-verde-trampo"
            />
            <span>
              <strong>Verificado:</strong> a equipe conferiu seus dados e o
              perfil ganha o selo, aparecendo antes dos não verificados.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <Icone
              nome="relogio"
              tamanho={15}
              className="mt-0.5 shrink-0 text-amarelo-aviso"
            />
            <span>
              <strong>Não verificado:</strong> normal no começo. O perfil
              aparece no catálogo, na lista de perfis ainda não conferidos.
            </span>
          </li>
        </ul>
      </details>

      {/* Perfis: cada um com Editar e Métricas em um toque */}
      <section aria-labelledby="titulo-perfis" className="mt-7">
        <h2
          id="titulo-perfis"
          className="risca-forte flex flex-wrap items-baseline gap-x-2 pb-2 font-display text-2xl uppercase leading-none text-verde-fundo"
        >
          Meus perfis
          <span className="carimbo border-verde-trampo bg-verde-claro normal-case text-verde-trampo">
            {perfis.length}
          </span>
        </h2>

        {perfis.length === 0 ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-tinta/80">
              Você ainda não tem perfil no catálogo. O cadastro é curto: nome,
              profissão e WhatsApp — o resto você completa depois.
            </p>
            <CriarPerfil />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {perfis.map((p) => (
              <CartaoPerfil key={p.id} perfil={p} admin={admin} />
            ))}
          </div>
        )}
      </section>

      {perfis.length > 0 && (
        <details
          className="mt-4 border-2 border-cinza-linha bg-papel p-3"
          style={{ borderRadius: 10 }}
        >
          <summary className="cursor-pointer text-sm font-bold uppercase tracking-wide text-tinta">
            Criar outro perfil (pessoa + empresa)
          </summary>
          <CriarPerfil embutido />
        </details>
      )}


      {/* Anúncios: são da casa (pagos); o dono acompanha aqui */}
      <section aria-labelledby="titulo-anuncios" className="mt-7">
        <h2
          id="titulo-anuncios"
          className="risca-forte flex flex-wrap items-baseline gap-x-2 pb-2 font-display text-2xl uppercase leading-none text-verde-fundo"
        >
          Meus anúncios
          <span className="carimbo border-verde-trampo bg-verde-claro normal-case text-verde-trampo">
            {anuncios.length}
          </span>
        </h2>
        {anuncios.length === 0 ? (
          <p className="mt-3 text-sm text-tinta/80">
            Você ainda não tem anúncio. O espaço patrocinado da cidade e os
            destaques de categoria são ativados pela equipe do Trampo Certo —{" "}
            <Link
              href="/entrar"
              className="font-semibold underline underline-offset-2"
            >
              fale com a gente
            </Link>{" "}
            para reservar o seu.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {anuncios.map((a) => (
              <li
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-2 border-2 border-cinza-linha bg-papel p-3"
                style={{ borderRadius: 10 }}
              >
                <div>
                  <p className="text-sm font-bold text-tinta">{a.nome}</p>
                  <p className="text-xs text-tinta/70">
                    {ROTULO_POSICAO[a.posicao]}
                    {a.categoriaSlug ? ` · ${a.categoriaSlug}` : ""} · pago até{" "}
                    {new Date(`${a.pagoAte}T12:00:00`).toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>
                </div>
                <span
                  className={`carimbo ${
                    a.status === "ativo"
                      ? "border-verde-trampo bg-verde-claro text-verde-trampo"
                      : "border-amarelo-aviso bg-amarelo-aviso/15 text-verde-fundo"
                  }`}
                >
                  {ROTULO_STATUS_ANUNCIO[a.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>


      {/* Equipe: fila de verificação. Só admin vê. */}
      {admin && (
        <section aria-labelledby="titulo-fila" className="mt-7">
          <h2
            id="titulo-fila"
            className="risca-forte flex flex-wrap items-baseline gap-x-2 pb-2 font-display text-2xl uppercase leading-none text-verde-fundo"
          >
            Verificações pendentes
            <span className="carimbo border-amarelo-aviso bg-amarelo-aviso/15 normal-case text-verde-fundo">
              {fila.length}
            </span>
          </h2>
          <p className="mt-2 text-sm text-tinta/75">
            Perfis no ar criados pelos próprios profissionais e ainda sem
            documento conferido. Verificar só muda o selo — o perfil já está
            publicado.
          </p>
          {fila.length === 0 ? (
            <p className="mt-3 text-sm text-tinta/70">
              Nada pendente por aqui. Todo perfil publicado já passou pela
              verificação.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {fila.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-3 border-2 border-dashed border-amarelo-aviso bg-papel p-3"
                  style={{ borderRadius: 10 }}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-tinta">{f.nome}</p>
                    <p className="text-xs text-tinta/70">{f.profissao}</p>
                  </div>
                  <AcoesModeracao
                    providerId={f.id}
                    verificado={false}
                    status="publicado"
                    compacto
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

