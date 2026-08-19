// Avvio di MSW fuori dall'albero React: nessun componente deve sapere
// che i mock esistono, e il rendering (SSR incluso) non viene mai bloccato.
// `process.env.NEXT_PUBLIC_USE_MOCKS` è inlinato a build time: quando i mock
// sono disattivi l'intero blocco (e il chunk di msw) sparisce dal bundle.
if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
  void import('../mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'warn' })
  );
}
