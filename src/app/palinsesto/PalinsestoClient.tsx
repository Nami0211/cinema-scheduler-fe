'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetProiezioniByDataQuery } from 'store/api/proiezioniApi';
import type { ProiezioneArricchita } from 'store/api/proiezioniApi';
import DaySelector from './DaySelector';
import FilmCard from './FilmCard';
import PalinsestoSkeleton from './PalinsestoSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import styles from './palinsesto.module.css';
import type { CustomError } from 'store/baseQuery';

interface PalinsestoClientProps {
  dataIniziale: string;
  giorniDisponibili: string[];
}

/**
 * Raggruppa le proiezioni per filmId.
 * Ritorna un array ordinato alfabeticamente per titolo film.
 */
function groupByFilm(
  proiezioni: ProiezioneArricchita[]
): Array<{
  film: ProiezioneArricchita['film'];
  proiezioni: ProiezioneArricchita[];
}> {
  const map = new Map<
    number,
    { film: ProiezioneArricchita['film']; proiezioni: ProiezioneArricchita[] }
  >();

  for (const p of proiezioni) {
    if (!map.has(p.filmId)) {
      map.set(p.filmId, { film: p.film, proiezioni: [] });
    }
    map.get(p.filmId)!.proiezioni.push(p);
  }

  return Array.from(map.values()).sort((a, b) =>
    a.film.titolo.localeCompare(b.film.titolo, 'it')
  );
}

export default function PalinsestoClient({
  dataIniziale,
  giorniDisponibili,
}: PalinsestoClientProps) {
  const t = useTranslations('Palinsesto');
  const searchParams = useSearchParams();
  const dataFromUrl = searchParams.get('data');

  const dataSelezionata =
    dataFromUrl && giorniDisponibili.includes(dataFromUrl)
      ? dataFromUrl
      : dataIniziale;

  const {
    data: proiezioni,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetProiezioniByDataQuery(dataSelezionata);

  const gruppiFilm = useMemo(() => groupByFilm(proiezioni ?? []), [proiezioni]);

  if (isLoading || isFetching) {
    return <PalinsestoSkeleton />;
  }

  const errorMessage =
    isError && error ? (error as CustomError).message : undefined;

  return (
    <div className={styles.page}>
      {/* Intestazione pagina */}
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>{t('title')}</h1>
        <p className={styles.pageSubtitle}>{t('subtitle')}</p>
      </div>

      {/* Selettore giorno */}
      <DaySelector
        giorniDisponibili={giorniDisponibili}
        dataSelezionata={dataSelezionata}
      />

      {/* Contenuto principale */}
      {isError ? (
        <ErrorState onRetry={refetch} message={errorMessage} />
      ) : gruppiFilm.length === 0 ? (
        <EmptyState data={dataSelezionata} />
      ) : (
        <div className={styles.filmGrid}>
          {gruppiFilm.map(({ film, proiezioni: prs }) => (
            <FilmCard key={film.id} film={film} proiezioni={prs} />
          ))}
        </div>
      )}
    </div>
  );
}
