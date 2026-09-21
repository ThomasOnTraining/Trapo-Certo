import { z } from "zod";

/*
  Camada unica de validacao e sanitizacao. TODA entrada do usuario
  passa por aqui no backend. O browser nunca e a autoridade.
*/

/** Remove acentos e dobra para ASCII (equivalente a unaccent do Postgres). */
export function semAcento(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Normaliza texto de busca: minusculas, sem acento, sem controle, espacos unicos. */
export function normalizarBusca(texto: string): string {
  return semAcento(texto)
    .toLowerCase()
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

/** Limpa texto livre (avaliacao, denuncia): texto puro, sem tags, tamanho limitado. */
export function textoPuro(texto: string, max: number): string {
  return texto
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);
}

const telefoneBr = z
  .string()
  .trim()
  .regex(/^[0-9]{10,13}$/, "Telefone invalido: use apenas numeros com DDD");

export const EsquemaEvento = z.object({
  nome: z.enum([
    "page_view",
    "search_no_result",
    "contact_click",
    "quick_vote",
    "favorite_add",
    "alert_create",
  ]),
  props: z
    .object({
      termo: z.string().max(100).optional(),
      categoria: z.string().max(60).optional(),
      prestadorId: z.string().uuid().optional(),
      cidade: z.string().max(60).optional(),
      voto: z.enum(["positivo", "negativo"]).optional(),
    })
    .strict(),
  consent: z.boolean(),
});

export const EsquemaCliqueContato = z.object({
  prestadorId: z.string().uuid(),
});

export const EsquemaBusca = z.object({
  q: z.string().max(100).optional(),
  categoria: z.string().max(60).optional(),
  bairro: z.string().max(60).optional(),
});

export const EsquemaDenuncia = z.object({
  prestadorId: z.string().uuid(),
  motivo: z.enum([
    "perfil_falso",
    "informacao_errada",
    "comportamento",
    "outro",
  ]),
  detalhes: z.string().max(1000).optional(),
});

export const EMAILS_PERMITIDOS = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.br",
  "outlook.com",
  "live.com",
  "msn.com",
];

/** Allowlist de dominio validada SEMPRE no servidor. */
export function emailPermitido(email: string): boolean {
  const dominio = email.trim().toLowerCase().split("@")[1];
  return !!dominio && EMAILS_PERMITIDOS.includes(dominio);
}

export type EventoEntrada = z.infer<typeof EsquemaEvento>;
