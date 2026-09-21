import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso legal" };

export default function AvisoLegal() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="border-b-2 border-verde-fundo pb-1 font-display text-2xl uppercase text-verde-fundo">
        Aviso legal
      </h1>
      <div className="mt-4 space-y-3 text-sm leading-relaxed">
        <p className="border-2 border-amarelo-aviso bg-amarelo-aviso/10 p-3" style={{ borderRadius: 10 }}>
          <strong>Leia antes de contratar:</strong> o Trampo Certo é só o
          catálogo. Quem faz o serviço é o profissional, direto com você.
        </p>
        <p>
          Perfis <strong>verificados</strong> tiveram um documento de
          identidade conferido pela nossa equipe. Isso aumenta a confiança,
          mas <strong>não garante</strong> a qualidade do serviço nem cobre
          prejuízos.
        </p>
        <p>
          Perfis <strong>não verificados</strong> não tiveram nenhum documento
          conferido. Combine com cuidado extra: prefira orçamento por escrito,
          não pague tudo adiantado e peça indicação de trabalhos anteriores.
        </p>
        <p>
          Dicas de negociação segura: combine valor, prazo e o que está
          incluído antes de começar; guarde o comprovante; avalie depois do
          serviço, para ajudar seus vizinhos.
        </p>
        <p>
          Teve um problema grave com um profissional daqui?{" "}
          <a href="/entrar" className="underline">
            Denuncie o perfil
          </a>{" "}
          — removemos quem age de má-fé.
        </p>
      </div>
    </main>
  );
}
