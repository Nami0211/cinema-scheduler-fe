'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { getDataValida } from 'utils/date';
import type { Film, Sale } from 'api-client';

export interface PalinsestoFilters {
  data: string;
  filmId?: string;
  salaId?: string;
}

export interface UsePalinsestoFiltersReturn {
  filters: PalinsestoFilters;
  setData: (data: string) => void;
  setFilmId: (filmId?: number | string | null) => void;
  setSalaId: (salaId?: number | string | null) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

/**
 * Hook per la gestione dei filtri del palinsesto tramite URL SearchParams.
 * La query string dell'URL è l'unica fonte di verità.
 */
export function usePalinsestoFilters(
  giorniDisponibili: string[],
  availableFilms?: Film[],
  availableSale?: Sale[]
): UsePalinsestoFiltersReturn {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const defaultData = useMemo(() => {
    return getDataValida(undefined, giorniDisponibili);
  }, [giorniDisponibili]);

  // 1. Data validata
  const rawData = searchParams.get('data') ?? undefined;
  const validData = useMemo(() => {
    return getDataValida(rawData, giorniDisponibili);
  }, [rawData, giorniDisponibili]);

  // 2. Film ID validato
  const rawFilmId = searchParams.get('filmId') ?? undefined;
  const validFilmId = useMemo(() => {
    if (!rawFilmId) return undefined;
    if (availableFilms && availableFilms.length > 0) {
      const exists = availableFilms.some(
        (f) => String(f.id) === String(rawFilmId)
      );
      if (!exists) return undefined;
    }
    return rawFilmId;
  }, [rawFilmId, availableFilms]);

  // 3. Sala ID validata
  const rawSalaId = searchParams.get('salaId') ?? undefined;
  const validSalaId = useMemo(() => {
    if (!rawSalaId) return undefined;
    if (availableSale && availableSale.length > 0) {
      const exists = availableSale.some(
        (s) => String(s.id) === String(rawSalaId)
      );
      if (!exists) return undefined;
    }
    return rawSalaId;
  }, [rawSalaId, availableSale]);

  const updateQueryParams = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      const queryString = params.toString();
      const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.push(newUrl, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setData = useCallback(
    (newData: string) => {
      updateQueryParams({ data: newData });
    },
    [updateQueryParams]
  );

  const setFilmId = useCallback(
    (filmId?: number | string | null) => {
      const val =
        filmId !== undefined && filmId !== null && filmId !== ''
          ? String(filmId)
          : null;
      updateQueryParams({ filmId: val });
    },
    [updateQueryParams]
  );

  const setSalaId = useCallback(
    (salaId?: number | string | null) => {
      const val =
        salaId !== undefined && salaId !== null && salaId !== ''
          ? String(salaId)
          : null;
      updateQueryParams({ salaId: val });
    },
    [updateQueryParams]
  );

  const resetFilters = useCallback(() => {
    updateQueryParams({
      filmId: null,
      salaId: null,
      data: null,
    });
  }, [updateQueryParams]);

  const hasActiveFilters = useMemo(() => {
    const isCustomDate = validData !== defaultData;
    return (
      isCustomDate || validFilmId !== undefined || validSalaId !== undefined
    );
  }, [validData, defaultData, validFilmId, validSalaId]);

  return {
    filters: {
      data: validData,
      filmId: validFilmId,
      salaId: validSalaId,
    },
    setData,
    setFilmId,
    setSalaId,
    resetFilters,
    hasActiveFilters,
  };
}
