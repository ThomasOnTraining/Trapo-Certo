/*
  Carregando do painel (visão geral, editar e métricas): esqueleto no
  formato dos cartões, para a tela não piscar em branco entre a navegação.
*/
export default function CarregandoPainel() {
  return (
    <main
      className="mx-auto max-w-3xl px-4 pb-10 pt-6"
      aria-busy="true"
      aria-live="polite"
    >
      <p className="sr-only">Carregando seu painel...</p>
      <div
        className="h-9 w-52 animate-pulse bg-cinza-linha"
        style={{ borderRadius: 8 }}
      />
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse border-2 border-cinza-linha bg-papel"
            style={{ borderRadius: 10 }}
          />
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse border-2 border-cinza-linha bg-papel"
            style={{ borderRadius: 10 }}
          />
        ))}
      </div>
    </main>
  );
}
