// Avvio di MSW fuori dall'albero React: nessun componente deve sapere
// che i mock esistono, e il rendering (SSR incluso) non viene mai bloccato.
// `process.env.NEXT_PUBLIC_USE_MOCKS` è inlinato a build time: quando i mock
// sono disattivi l'intero blocco (e il chunk di msw) sparisce dal bundle.
if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
  void import('../mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'warn' })
  );
}

// Workaround per un bug di Next.js 16.3.0 / web-vitals che causa:
//   TypeError: Cannot read properties of undefined (reading 'startTime')
//
// Il PerformanceObserver interno di Next.js può ricevere entry malformate
// (senza startTime) da Chrome in scenari di prerendering o back-forward cache.
// Fino a quando Next.js non rilascia una patch, filtriamo le entry invalide
// a livello di PerformanceObserver prima che raggiungano il bundle web-vitals.
if (
  typeof window !== 'undefined' &&
  typeof PerformanceObserver !== 'undefined'
) {
  const OriginalPerformanceObserver = window.PerformanceObserver;

  class SafePerformanceObserver extends OriginalPerformanceObserver {
    constructor(callback: PerformanceObserverCallback) {
      super((entryList, observer) => {
        try {
          // Filtra le entry prive di startTime prima di passarle al callback
          const safeList = {
            getEntries: () =>
              entryList
                .getEntries()
                .filter((e) => e != null && e.startTime != null),
            getEntriesByName: entryList.getEntriesByName.bind(entryList),
            getEntriesByType: entryList.getEntriesByType.bind(entryList),
          } as PerformanceObserverEntryList;
          callback(safeList, observer);
        } catch (err) {
          // Sopprimiamo silenziosamente solo gli errori relativi a startTime
          if (
            err instanceof TypeError &&
            typeof err.message === 'string' &&
            err.message.includes('startTime')
          ) {
            console.warn(
              '[web-vitals workaround] Filtered malformed PerformanceEntry:',
              err.message
            );
          } else {
            throw err;
          }
        }
      });
    }
  }

  // Copia le proprietà statiche (es. supportedEntryTypes) sul costruttore proxy.
  // Escludiamo 'prototype', 'length' e 'name': sono non-configurabili sui
  // costruttori nativi e causano TypeError se si tenta di ridefinirle.
  const SKIP_KEYS = new Set(['prototype', 'length', 'name']);
  const descriptors = Object.getOwnPropertyDescriptors(
    OriginalPerformanceObserver
  );
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if (!SKIP_KEYS.has(key) && descriptor.configurable) {
      Object.defineProperty(SafePerformanceObserver, key, descriptor);
    }
  }

  window.PerformanceObserver =
    SafePerformanceObserver as typeof PerformanceObserver;
}
