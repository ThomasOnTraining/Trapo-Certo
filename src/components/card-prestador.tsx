import { Icone, Monograma } from "./icones";
import type { PrestadorDemo } from "@/lib/demo";
import { AvisoContato } from "./aviso-contato";

/** Card do prestador: a moeda do produto. Completo em uma tela de celular. */
export function CardPrestador({ p }: { p: PrestadorDemo }) {
  const letra = p.nome.trim().charAt(0);
  return (
    <article
      className="cartao-prestador flex flex-col border-2 border-cinza-linha bg-papel p-4"
      style={{ borderRadius: 10 }}
    >
      <div className="flex items-start gap-3">
        <Monograma letra={letra} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={`/prestador/${p.slug}`}
              className="font-display text-[17px] uppercase leading-snug text-verde-fundo hover:text-verde-trampo"
            >
              {p.nome}
            </a>
            <CarimboVerificado verificado={p.verificado} />
          </div>
          <p className="text-sm text-tinta/80">
            {p.profissao} <span className="text-tinta/40">/</span> {p.anosRegiao}{" "}
            anos na região
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Icone nome="estrela" tamanho={14} className="text-amarelo-aviso" />
            <strong>{p.notaMedia.toFixed(1)}</strong>
            <span className="text-tinta/70">({p.totalAvaliacoes} avaliações)</span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-tinta/80">
            <Icone
              nome="pino"
              tamanho={14}
              className="shrink-0 text-verde-trampo"
            />
            <span className="truncate">{p.bairros.join(", ")}</span>
          </p>
          {p.disponivelHoje && (
            <p className="mt-1.5">
              <span className="carimbo border-verde-trampo bg-verde-trampo text-papel">
                Disponível hoje
              </span>
            </p>
          )}
        </div>
      </div>

      {p.servicos.length > 0 && (
        <div className="regra-tracejada mt-3 pt-2">
          <p className="linha-preco text-sm">
            <span className="min-w-0 truncate">{p.servicos[0].titulo}</span>
            {p.servicos[0].precoDesde != null && (
              <span className="shrink-0 font-display text-base text-verde-fundo">
                R${p.servicos[0].precoDesde}+
              </span>
            )}
          </p>
        </div>
      )}

      <div className="mt-auto pt-3">
        <AvisoContato
          prestadorId={p.id}
          whatsapp={p.whatsapp}
          nomePrestador={p.nome}
          compacto
        />
      </div>
    </article>
  );
}

/** Selo com tooltip honesto: diz exatamente o que foi conferido. */
export function CarimboVerificado({ verificado }: { verificado: boolean }) {
  if (verificado) {
    return (
      <span
        title="Documento de identidade conferido pelo Trampo Certo. Não garante qualidade do serviço."
        className="carimbo border-verde-trampo bg-verde-claro text-verde-trampo"
      >
        <Icone nome="escudo" tamanho={13} />
        Verificado
      </span>
    );
  }
  return (
    <span
      title="As informações deste perfil não foram conferidas pelo Trampo Certo. Negocie com atenção."
      className="inline-flex items-center border border-cinza-linha px-1.5 py-0.5 text-xs text-tinta/60"
      style={{ borderRadius: 3 }}
    >
      Não verificado
    </span>
  );
}

/** Etiqueta de patrocinado: adesivo amarelo de cupom, nunca escondida. */
export function EtiquetaPatrocinado() {
  return (
    <span
      className="inline-flex rotate-1 items-center border-2 border-verde-fundo bg-amarelo-aviso px-2 py-0.5 text-xs font-black uppercase tracking-wide text-verde-fundo"
      style={{ borderRadius: 3 }}
    >
      Patrocinado
    </span>
  );
}
