import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de uso" };

export default function Termos() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="border-b-2 border-verde-fundo pb-1 font-display text-2xl uppercase text-verde-fundo">
        Termos de uso
      </h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p>
          O Trampo Certo é um <strong>catálogo de divulgação</strong> de
          prestadores de serviço. Nós publicamos perfis criados pelos próprios
          profissionais e empresas, com informações declaradas por eles.
        </p>
        <p>
          <strong>O Trampo Certo não</strong> intermedia, contrata, cobra,
          recebe pagamento, fiscaliza ou garante nenhum serviço. A negociação,
          o contrato e a execução acontecem <strong>diretamente</strong> entre
          você e o profissional, fora da plataforma.
        </p>
        <p>
          O selo <strong>Verificado</strong> significa apenas que conferimos um
          documento de identidade enviado pelo prestador. Não garante qualidade
          de serviço nem idoneidade. Perfis sem selo não tiveram documentos
          conferidos: negocie com atenção redobrada, combine valores e prazos
          por escrito e prefira pagamento após a entrega.
        </p>
        <p>
          As avaliações são de responsabilidade de quem as escreve. Denúncias
          de perfil falso ou de mau comportamento são investigadas e perfis
          podem ser removidos.
        </p>
        <p>
          Ao usar o site você concorda com estes termos e com a{" "}
          <a href="/privacidade" className="underline">
            Política de privacidade
          </a>
          .
        </p>
      </div>
    </main>
  );
}
