/*
  Id de sessão anonimo: uuid aleatório por aba (sessionStorage), só para
  dedup de métrica/voto. Nunca sai em claro do servidor — vira hash
  com salt diário antes de tocar o banco.
*/

export function idSessao(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    let id = sessionStorage.getItem("tc_sessao");
    if (!id) {
      id = crypto.randomUUID();
      sessionStorage.setItem("tc_sessao", id);
    }
    return id;
  } catch {
    return "sem-storage";
  }
}
