import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Icone } from "@/components/icones";
import { supabaseAutenticado } from "@/lib/supabase/auth";
import { FormularioEntrada } from "./formulario-entrada";

export const metadata: Metadata = {
  title: "Entrar",
  // rota privada: fora do index e fora das IAs
  robots: { index: false, follow: false },
};

/*
  Entrada passwordless: link magico por e-mail (Google OAuth fica para o
  proximo passo da fase 2). Já logado? Vai direto pro painel.
*/
export default async function Entrar() {
  const db = await supabaseAutenticado();
  if (db) {
    const {
      data: { user },
    } = await db.auth.getUser();
    if (user) redirect("/painel");
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="risca-forte pb-2 font-display text-3xl uppercase leading-none text-verde-fundo">
        Entrar
      </h1>
      <p className="mt-3 text-sm text-tinta/80">
        Procurar serviço não precisa de conta. Entre apenas se você quer
        divulgar o seu perfil por aqui.
      </p>

      <div
        className="relative mt-6 border-2 border-verde-fundo bg-papel p-4 pt-6"
        style={{ borderRadius: 10 }}
      >
        <span className="carimbo absolute -top-3.5 right-3 border-verde-trampo bg-verde-claro text-verde-trampo">
          Sem senha, sem rolo
        </span>
        <FormularioEntrada />
        <div className="mt-4 border-t-2 border-dashed border-cinza-linha pt-3">
          <button
            type="button"
            disabled
            title="Em breve: configurar OAuth no Google Cloud"
            className="botao-afunda w-full border-2 border-cinza-linha bg-papel py-2.5 text-sm font-bold text-tinta/50"
            style={{ borderRadius: 10 }}
          >
            <span className="inline-flex items-center gap-2">
              <Icone nome="tela" tamanho={16} />
              Entrar com Google (em breve)
            </span>
          </button>
        </div>
      </div>

      <p className="mt-4 text-xs text-tinta/60">
        Acesso por Gmail ou Hotmail/Outlook. O servidor envia um link de uso
        único; não guardamos senha em banco nenhum. Ao entrar, você aceita
        aparecer como autor das suas avaliações.
      </p>
    </main>
  );
}
