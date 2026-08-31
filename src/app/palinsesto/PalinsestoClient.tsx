'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useGetProiezioniByDataQuery } from 'services/api/proiezioniApi';
import { useGetFilmsQuery } from 'services/api/filmApi';
import { useGetSaleQuery } from 'services/api/saleApi';
import type { ProiezioneArricchita } from 'services/api/proiezioniApi';
import { usePalinsestoFilters } from 'utils/hooks/usePalinsestoFilters';
import { getDataValida } from 'utils/date';
import { Select } from 'ui/atoms/Select/Select';
import { Button } from 'ui/atoms/Button/Button';
import DaySelector from './DaySelector';
import FilmCard from './FilmCard';
import PalinsestoSkeleton from './PalinsestoSkeleton';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import styles from './palinsesto.module.css';
import type { AppError } from 'services/baseQuery';

interface PalinsestoClientProps {
  dataIniziale: string;
  giorniDisponibili: string[];
}

/**
 * Raggruppa le proiezioni per filmId.
 * Ritorna un array ordinato alfabeticamente per titolo film.
 */
function groupByFilm(proiezioni: ProiezioneArricchita[]): Array<{
  film: ProiezioneArricchita['film'];
  proiezioni: ProiezioneArricchita[];
}> {
  const map = new Map<
    string | number,
    { film: ProiezioneArricchita['film']; proiezioni: ProiezioneArricchita[] }
  >();

  for (const p of proiezioni) {
    if (!p.film || !p.filmId) continue;
    if (!map.has(p.filmId)) {
      map.set(p.filmId, { film: p.film, proiezioni: [] });
    }
    map.get(p.filmId)!.proiezioni.push(p);
  }

  return Array.from(map.values()).sort((a, b) => {
    const titleA = a.film?.titolo ?? '';
    const titleB = b.film?.titolo ?? '';
    return titleA.localeCompare(titleB, 'it');
  });
}

export default function PalinsestoClient({
  dataIniziale,
  giorniDisponibili,
}: PalinsestoClientProps) {
  const t = useTranslations('Palinsesto');

  // Recupera elenchi di film e sale via API (se presenti nel BE)
  const { data: films } = useGetFilmsQuery();
  const { data: sale } = useGetSaleQuery();

  // Data correntemente richiesta nell'URL (fallback su dataIniziale fornita dal Server Component)
  const searchParams = useSearchParams();
  const rawData = searchParams.get('data') ?? dataIniziale;
  const currentData = useMemo(() => {
    return getDataValida(rawData, giorniDisponibili);
  }, [rawData, giorniDisponibili]);

  // Query proiezioni per la data (supportata da backend e mock)
  const {
    data: proiezioni,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetProiezioniByDataQuery(currentData);

  // Calcola le opzioni di sale e film disponibili:
  // Se la chiamata /sale o /films fallisce o restituisce 404 (es. endpoint BE non ancora pronto),
  // ricava l'elenco unico dalle proiezioni arricchite della giornata!
  const availableSale = useMemo(() => {
    if (sale && sale.length > 0) return sale;
    if (!proiezioni) return [];
    const map = new Map<string | number, ProiezioneArricchita['sala']>();
    for (const p of proiezioni) {
      if (p.sala && p.sala.id != null && !map.has(p.sala.id)) {
        map.set(p.sala.id, p.sala);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const nameA = a?.nome ?? '';
      const nameB = b?.nome ?? '';
      return nameA.localeCompare(nameB, 'it');
    });
  }, [sale, proiezioni]);

  const availableFilms = useMemo(() => {
    if (films && films.length > 0) return films;
    if (!proiezioni) return [];
    const map = new Map<string | number, ProiezioneArricchita['film']>();
    for (const p of proiezioni) {
      if (p.film && p.film.id != null && !map.has(p.film.id)) {
        map.set(p.film.id, p.film);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const titleA = a?.titolo ?? '';
      const titleB = b?.titolo ?? '';
      return titleA.localeCompare(titleB, 'it');
    });
  }, [films, proiezioni]);

  // Hook per i filtri agganciato alla query string dell'URL
  const {
    filters,
    setData,
    setFilmId,
    setSalaId,
    resetFilters,
    hasActiveFilters,
  } = usePalinsestoFilters(giorniDisponibili, availableFilms, availableSale);

  // Applica filtri in-memory per filmId e salaId
  const proiezioniFiltrate = useMemo(() => {
    if (!proiezioni) return [];
    return proiezioni.filter((p) => {
      if (
        filters.filmId !== undefined &&
        String(p.filmId) !== String(filters.filmId)
      ) {
        return false;
      }
      if (
        filters.salaId !== undefined &&
        String(p.salaId) !== String(filters.salaId)
      ) {
        return false;
      }
      return true;
    });
  }, [proiezioni, filters.filmId, filters.salaId]);

  const gruppiFilm = useMemo(
    () => groupByFilm(proiezioniFiltrate),
    [proiezioniFiltrate]
  );

  const totalSpettacoli = proiezioniFiltrate.length;

  const errorMessage =
    isError && error ? (error as AppError).message : undefined;

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
        dataSelezionata={filters.data}
        onSelectDay={setData}
      />

      {/* Barra Filtri (Film, Sala, Reset) */}
      <div className={styles.filterSection}>
        <div className={styles.filtersBar}>
          <div className={styles.filterGroup}>
            <Select
              id="filter-film"
              label={t('filterFilmLabel')}
              value={filters.filmId ?? ''}
              onChange={(e) => setFilmId(e.target.value || undefined)}
            >
              <option value="">{t('filterFilmAll')}</option>
              {availableFilms.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.titolo}
                </option>
              ))}
            </Select>
          </div>

          <div className={styles.filterGroup}>
            <Select
              id="filter-sala"
              label={t('filterSalaLabel')}
              value={filters.salaId ?? ''}
              onChange={(e) => setSalaId(e.target.value || undefined)}
            >
              <option value="">{t('filterSalaAll')}</option>
              {availableSale.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.nome}
                </option>
              ))}
            </Select>
          </div>

          {hasActiveFilters && (
            <div className={styles.filterActions}>
              <Button variant="ghost" onClick={resetFilters}>
                {t('resetFilters')}
              </Button>
            </div>
          )}
        </div>

        {!isLoading && !isError && (
          <div className={styles.resultsHeader}>
            <span className={styles.resultsCount}>
              {t('resultsCount', { count: totalSpettacoli })}
            </span>
          </div>
        )}
      </div>

      {/* Contenuto principale */}
      {isLoading ? (
        <PalinsestoSkeleton />
      ) : isError ? (
        <ErrorState onRetry={refetch} message={errorMessage} />
      ) : gruppiFilm.length === 0 ? (
        <EmptyState
          data={filters.data}
          hasActiveFilters={hasActiveFilters}
          onResetFilters={resetFilters}
        />
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
