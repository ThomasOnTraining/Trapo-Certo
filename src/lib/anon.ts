import { createHash } from "crypto";

/*
  Hashes irreversíveis para as tabelas de métrica. O salt diário rotativa
  impede correlacionar um mesmo IP/voto ao longo dos dias, e nada de
  identidade bruta chega a gravar no banco.
*/

function saltDiario(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
}

export function hashIp(ip: string | null): string {
  return createHash("sha256").update(`${ip ?? "desconhecido"}:${saltDiario()}`).digest("hex");
}

export function hashSessao(sessionId: string): string {
  return createHash("sha256").update(`${sessionId}:${saltDiario()}`).digest("hex");
}
