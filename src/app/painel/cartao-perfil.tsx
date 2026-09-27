import Link from "next/link";
import { CarimboVerificado } from "@/components/card-prestador";
import { AcoesModeracao } from "./moderacao";
import { CLASSE_BOTAO } from "./campos";
import type { MeuPerfil, StatusPerfil } from "./tipos";

/*
  Selos do perfil no painel. Usam o MESMO componente da página pública
  (CarimboVerificado) para o morador ver o mesmo selo nos dois lugares;
  a situação de publicação é um carimbo separado, para não misturar
  "está no ar" com "documento conferido".
*/
export function SelosPerfil({
  status,
  verificado,
}: {
  status: StatusPerfil;
  verificado: boolean;
}) {
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {status === "publicado" && (
        <span className="carimbo border-verde-fundo bg-verde-fundo text-papel">
          No ar
        </span>
      )}
      {status === "suspenso" && (
        <span className="carimbo border-amarelo-aviso bg-amarelo-aviso text-verde-fundo">
          Suspenso
        </span>
      )}
      {status === "rascunho" && (
        <span className="carimbo border-cinza-linha bg-papel text-tinta/70">
          Fora do ar
        </span>
      )}
      <CarimboVerificado verificado={verificado} />
    </span>
  );
}

/**
 * Cartão do perfil na visão geral: situação, selos e os dois caminhos
 * diretos (editar | métricas) + página pública. Números de desempenho
 * ficam só na tela de métricas — aqui é gestão.
 */
export function CartaoPerfil({
  perfil,
  admin,
}: {
  perfil: MeuPerfil;
  admin: boolean;
}) {
  const noAr = perfil.status === "publicado";
  return (
    <article
      className="border-2 border-verde-fundo bg-papel p-4"
      style={{ borderRadius: 10 }}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h3 className="font-display text-lg uppercase leading-tight text-verde-fundo">
            {perfil.nome}
          </h3>
          <p className="text-sm text-tinta/75">
            {perfil.profissao}
            {perfil.categorias.length > 0 && (
              <span className="text-tinta/50">
                {" "}
                · {perfil.categorias.map((c) => c.nome).join(", ")}
              </span>
            )}
          </p>
        </div>
        <SelosPerfil status={perfil.status} verificado={perfil.verificado} />
      </div>

      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-tinta/80">
        <span>
          <strong className="font-display text-base text-verde-fundo">
            {perfil.notaMedia.toFixed(1)}
          </strong>{" "}
          em {perfil.totalAvaliacoes}{" "}
          {perfil.totalAvaliacoes === 1 ? "avaliação" : "avaliações"}
        </span>
        {perfil.disponivelHoje && (
          <span className="text-verde-trampo">· Disponível hoje</span>
        )}
      </p>

      {!perfil.verificado && noAr && !admin && (
        <p
          className="mt-3 border-2 border-dashed border-amarelo-aviso bg-amarelo-aviso/10 p-2.5 text-xs text-tinta/85"
          style={{ borderRadius: 8 }}
        >
          Seu perfil está <strong>no ar</strong> como{" "}
          <strong>não verificado</strong>: ele aparece no catálogo junto com os
          demais, depois dos perfis já verificados. A equipe do Trampo Certo
          pode conferir seus dados e liberar o selo quando quiser.
        </p>
      )}

      {perfil.status === "rascunho" && (
        <p
          className="mt-3 border-2 border-dashed border-cinza-linha bg-verde-papel p-2.5 text-xs text-tinta/85"
          style={{ borderRadius: 8 }}
        >
          Este perfil ainda <strong>não está no catálogo</strong>. É um perfil
          antigo criado antes da publicação automática — a equipe do Trampo
          Certo publica na hora que abrir o painel.
        </p>
      )}

      {perfil.status === "suspenso" && (
        <p
          className="mt-3 border-2 border-dashed border-amarelo-aviso bg-amarelo-aviso/10 p-2.5 text-xs text-tinta/85"
          style={{ borderRadius: 8 }}
        >
          Perfil <strong>suspenso</strong> pela moderação: sai do catálogo até
          a equipe liberar de novo.
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Link
          href={`/painel/${perfil.id}/editar`}
          className={`${CLASSE_BOTAO} border-verde-trampo bg-verde-trampo text-papel hover:bg-verde-trampo-forte`}
          style={{ borderRadius: 10 }}
        >
          Editar perfil
        </Link>
        <Link
          href={`/painel/${perfil.id}/metricas`}
          className={`${CLASSE_BOTAO} border-verde-fundo text-verde-fundo hover:bg-verde-claro`}
          style={{ borderRadius: 10 }}
        >
          Métricas
        </Link>
        {noAr && (
          <Link
            href={`/prestador/${perfil.slug}`}
            className="text-xs font-bold uppercase tracking-wide text-verde-trampo underline underline-offset-2 hover:text-verde-trampo-forte"
          >
            Ver página pública
          </Link>
        )}
      </div>

      {admin && (
        <AcoesModeracao
          providerId={perfil.id}
          verificado={perfil.verificado}
          status={perfil.status}
        />
      )}
    </article>
  );
}
