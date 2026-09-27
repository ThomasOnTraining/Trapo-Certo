import { BotaoPendente } from "./botao-pendente";
import {
  publicarPerfil,
  removerVerificacao,
  suspenderPerfil,
  verificarPerfil,
} from "./actions";
import type { StatusPerfil } from "./tipos";

/*
  Ações da equipe (papel admin) sobre um perfil: verificar a identidade
  (não verificado -> verificado) e publicar/suspender. Verificação NÃO
  bloqueia publicação: é só o selo de documento conferido. O servidor
  confere o papel de novo em cada action — a UI só esconde o botão.
*/
export function AcoesModeracao({
  providerId,
  verificado,
  status,
  compacto = false,
}: {
  providerId: string;
  verificado: boolean;
  status: StatusPerfil;
  compacto?: boolean;
}) {
  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        compacto ? "" : "regra-tracejada mt-3 pt-3"
      }`}
    >
      <form action={verificado ? removerVerificacao : verificarPerfil}>
        <input type="hidden" name="providerId" value={providerId} />
        <BotaoPendente
          rotulo={verificado ? "Remover verificação" : "Verificar perfil"}
          rotuloPendente="Atualizando..."
          classe={
            verificado
              ? "border-cinza-linha text-tinta hover:bg-verde-papel"
              : "border-verde-trampo bg-verde-claro text-verde-trampo hover:bg-verde-trampo hover:text-papel"
          }
        />
      </form>
      {status !== "publicado" && (
        <form action={publicarPerfil}>
          <input type="hidden" name="providerId" value={providerId} />
          <BotaoPendente
            rotulo="Publicar"
            classe="border-verde-fundo text-verde-fundo hover:bg-verde-claro"
          />
        </form>
      )}
      {status === "publicado" && (
        <form action={suspenderPerfil}>
          <input type="hidden" name="providerId" value={providerId} />
          <BotaoPendente
            rotulo="Suspender"
            rotuloPendente="Suspendendo..."
            classe="border-amarelo-aviso text-verde-fundo hover:bg-amarelo-aviso/20"
          />
        </form>
      )}
    </div>
  );
}
