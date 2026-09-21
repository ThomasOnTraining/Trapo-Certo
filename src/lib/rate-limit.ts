/*
  Rate limit em memoria: generoso com humanos, duro com bots.
  O IP aqui vive APENAS em memoria volátil (nunca em banco ou log).
  Em producao com varias instancias, trocar por um limiter na borda
  (Cloudflare) ou Redis; para o MVP de uma instancia isto e suficiente.
*/

type Janela = { contador: number; expira: number };

const sacos = new Map<string, Janela>();

function limparExpirados() {
  const agora = Date.now();
  for (const [chave, janela] of sacos) {
    if (janela.expira < agora) sacos.delete(chave);
  }
}

export type ResultadoLimite = { permitido: boolean; restamSegundos: number };

export function checarLimite(
  chave: string,
  maximo: number,
  janelaSegundos: number
): ResultadoLimite {
  const agora = Date.now();
  limparExpirados();
  const janela = sacos.get(chave);
  if (!janela || janela.expira < agora) {
    sacos.set(chave, { contador: 1, expira: agora + janelaSegundos * 1000 });
    return { permitido: true, restamSegundos: 0 };
  }
  janela.contador += 1;
  if (janela.contador <= maximo) {
    return { permitido: true, restamSegundos: 0 };
  }
  return {
    permitido: false,
    restamSegundos: Math.ceil((janela.expira - agora) / 1000),
  };
}

/** Identificador volatil do chamador: hash do IP + rota. Nunca persistido. */
export function chaveDoChamador(
  ipBruto: string | null,
  rota: string
): string {
  const ip = (ipBruto ?? "desconhecido").split(",")[0].trim();
  return `${rota}:${ip}`;
}
