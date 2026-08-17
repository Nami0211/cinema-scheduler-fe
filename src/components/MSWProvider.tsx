'use client';

import { useEffect, useState } from 'react';

// Singleton promise: se il worker è già stato avviato (o è in avviamento)
// riutilizziamo la stessa promise invece di chiamare worker.start() due volte.
// Questo risolve la race condition con React StrictMode che monta il
// componente due volte in rapida successione.
let mswPromise: Promise<void> | null = null;

function startMSW(): Promise<void> {
  if (!mswPromise) {
    mswPromise = import('../../mocks/browser')
      .then(({ worker }) => worker.start({ onUnhandledRequest: 'warn' }))
      .then(() => undefined);
  }
  return mswPromise!;
}

export function MSWProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_USE_MOCKS === 'true') {
      startMSW()
        .then(() => setMswReady(true))
        .catch((err) => {
          console.error('[MSW] Failed to start:', err);
          setMswReady(true);
        });
    } else {
      Promise.resolve().then(() => setMswReady(true));
    }
  }, []);

  // Non renderizzare nulla finché MSW non è pronto:
  // così RTK Query non può sparare richieste prima che il worker le intercetti.
  if (!mswReady) {
    return null;
  }

  return <>{children}</>;
}
