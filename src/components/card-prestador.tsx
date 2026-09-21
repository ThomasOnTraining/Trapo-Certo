import { Icone, Monograma } from "./icones";
import type { PrestadorDemo } from "@/lib/demo";
import { AvisoContato } from "./aviso-contato";

/** Card do prestador: a moeda do produto. Completo em uma tela de celular. */
export function CardPrestador({ p }: { p: PrestadorDemo }) {
  const letra = p.nome.trim().charAt(0);
  return (
    <article className="border-2 border-cinza-linha bg-papel p-4" style={{ borderRadius: 10 }}>
      <div className="flex items-start gap-3">
        <Monograma letra={letra} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <a
              href={`/prestador/${p.slug}`}
              className="font-display text-lg uppercase leading-tight text-verde-fundo hover:text-verde-trampo"
            >
              {p.nome}
            </a>
            <CarimboVerificado verificado={p.verificado} />
          </div>
          <p className="text-sm text-tinta/80">
            {p.profissao} · {p.anosRegiao} anos na região
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm">
            <Icone nome="estrela" tamanho={14} className="text-amarelo-aviso" />
            <strong>{p.notaMedia.toFixed(1)}</strong>
            <span className="text-tinta/70">
              ({p.totalAvaliacoes} avaliações)
            </span>
          </p>
          <p className="mt-1 flex items-center gap-1 text-sm text-tinta/80">
            <Icone nome="pino" tamanho={14} className="text-verde-trampo" />
            {p.bairros.join(" · ")}
          </p>
          {p.disponivelHoje && (
            <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-verde-trampo">
              <span className="inline-block h-2 w-2 rounded-full bg-verde-trampo" />
              Disponível hoje
            </p>
          )}
        </div>
      </div>

      {p.servicos.length > 0 && (
        <div className="regra-tracejada mt-3 pt-2">
          <p className="text-sm">
            {p.servicos[0].titulo}
            {p.servicos[0].precoDesde != null && (
              <span className="text-tinta/70"> · a partir de R${p.servicos[0].precoDesde}</span>
            )}
          </p>
        </div>
      )}

      <AvisoContato
        prestadorId={p.id}
        whatsapp={p.whatsapp}
        nomePrestador={p.nome}
        compacto
      />
    </article>
  );
}

/** Selo com tooltip honesto: diz exatamente o que foi conferido. */
export function CarimboVerificado({ verificado }: { verificado: boolean }) {
  if (verificado) {
    return (
      <span
        title="Documento de identidade conferido pelo Trampo Certo. Não garante qualidade do serviço."
        className="inline-flex -rotate-2 items-center gap-1 border-2 border-verde-trampo bg-verde-claro px-1.5 py-0.5 text-xs font-bold uppercase text-verde-trampo"
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
    >
      Não verificado
    </span>
  );
}

/** Etiqueta de patrocinado: sticker, nunca escondida. */
export function EtiquetaPatrocinado() {
  return (
    <span className="inline-flex rotate-1 items-center border-2 border-amarelo-aviso bg-amarelo-aviso/20 px-1.5 py-0.5 text-xs font-bold uppercase text-verde-fundo">
      Patrocinado
    </span>
  );
}
