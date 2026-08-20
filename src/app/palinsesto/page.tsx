import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import PalinsestoClient from './PalinsestoClient';
import { getGiorniSettimanaCorrente, getDataValida } from 'utils/date';

interface PalinsestoPageProps {
  searchParams: Promise<{ data?: string; filmId?: string; salaId?: string }>;
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

export async function generateMetadata({
  searchParams,
}: PalinsestoPageProps): Promise<Metadata> {
  const params = await searchParams;
  const t = await getTranslations('Palinsesto');
  const giorniDisponibili = getGiorniSettimanaCorrente();
  const data = getDataValida(params.data, giorniDisponibili);

  return {
    title: `${t('title')} — ${data} | Cinema Aurora`,
    description: t('subtitle'),
  };
}

export default async function PalinsestoPage({
  searchParams,
}: PalinsestoPageProps) {
  const params = await searchParams;
  const giorniDisponibili = getGiorniSettimanaCorrente();
  const dataValida = getDataValida(params.data, giorniDisponibili);

  return (
    <PalinsestoClient
      dataIniziale={dataValida}
      giorniDisponibili={giorniDisponibili}
    />
  );
}
