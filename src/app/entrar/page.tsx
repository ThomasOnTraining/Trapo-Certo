import type { Metadata } from "next";
import { Icone } from "@/components/icones";

export const metadata: Metadata = {
  title: "Entrar",
  // rota privada: fora do index e fora das IAs
  robots: { index: false, follow: false },
};

/*
  Pagina de entrada (fase 1: estrutura). Regra do plano: login
  passwordless via Google (OAuth PKCE) com allowlist de dominios
  Gmail/Hotmail validada NO SERVIDOR. Nenhuma senha em banco.
*/
export default function Entrar() {
  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="border-b-2 border-verde-fundo pb-1 font-display text-2xl uppercase text-verde-fundo">
        Entrar
      </h1>
      <p className="mt-3 text-sm text-tinta/80">
        Procurar serviço não precisa de conta. Entre apenas se você quer
        anunciar um perfil, avaliar ou salvar profissionais.
      </p>

      <div className="mt-5 space-y-3">
        <button
          type="button"
          disabled
          title="Conectar ao Supabase para ativar"
          className="botao-afunda w-full border-2 border-verde-fundo bg-papel py-3 font-bold text-verde-fundo"
          style={{ borderRadius: 10 }}
        >
          <span className="inline-flex items-center gap-2">
            <Icone nome="tela" tamanho={18} />
            Entrar com Google (Gmail)
          </span>
        </button>
        <button
          type="button"
          disabled
          title="Conectar ao Supabase para ativar"
          className="botao-afunda w-full border-2 border-verde-fundo bg-papel py-3 font-bold text-verde-fundo"
          style={{ borderRadius: 10 }}
        >
          Entrar com e-mail (Hotmail/Outlook)
        </button>
      </div>

      <p className="mt-4 text-xs text-tinta/60">
        Acesso por Gmail ou Hotmail/Outlook. Sem senha: o servidor envia um
        código de uso único ou autentica pela conta Google. Não guardamos
        senha em banco nenhum.
      </p>
    </main>
  );
}
