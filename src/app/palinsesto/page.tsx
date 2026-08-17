import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PalinsestoClient from './PalinsestoClient';

interface PalinsestoPageProps {
  searchParams: Promise<{ data?: string }>;
}

/**
 * DECISIONE SERVER/CLIENT:
 *
 * Questo è un Server Component. Il suo ruolo è:
 * 1. Leggere e validare il parametro `?data=` dai searchParams.
 * 2. Generare i metadati SEO della pagina (title, description).
 * 3. Passare la data validata come prop a PalinsestoClient.
 *
 * NON fa il fetch diretto dei dati. Motivo: MSW gira solo nel browser e
 * non può intercettare i fetch server-side di Next.js. Il fetch è delegato
 * a PalinsestoClient che usa RTK Query (intercettata correttamente da MSW).
 *
 * In produzione (con backend reale), questo server component potrebbe fare
 * il fetch direttamente tramite fetch() per inviare HTML pre-renderizzato —
 * ma durante lo sviluppo con mock, il pattern attuale è la scelta corretta.
 */

/** I 7 giorni di programmazione disponibili nelle fixture (UTC). */
const GIORNI_PROGRAMMAZIONE = [
  '2026-08-03',
  '2026-08-04',
  '2026-08-05',
  '2026-08-06',
  '2026-08-07',
  '2026-08-08',
  '2026-08-09',
];

/**
 * Valida il parametro data dall'URL.
 * Se la data non è valida o è fuori dalla settimana in programmazione,
 * ritorna il primo giorno disponibile come fallback.
 */
function getDataValida(dataParam: string | undefined): string {
  if (dataParam && GIORNI_PROGRAMMAZIONE.includes(dataParam)) {
    return dataParam;
  }
  // Fallback: primo giorno disponibile
  return GIORNI_PROGRAMMAZIONE[0];
}

export async function generateMetadata({
  searchParams,
}: PalinsestoPageProps): Promise<Metadata> {
  const params = await searchParams;
  const t = await getTranslations('Palinsesto');
  const data = getDataValida(params.data);

  return {
    title: `${t('title')} — ${data} | Cinema Aurora`,
    description: t('subtitle'),
  };
}

export default async function PalinsestoPage({
  searchParams,
}: PalinsestoPageProps) {
  const params = await searchParams;
  const dataValida = getDataValida(params.data);

  return (
    <PalinsestoClient
      dataIniziale={dataValida}
      giorniDisponibili={GIORNI_PROGRAMMAZIONE}
    />
  );
}
