import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Proiezione, Film, Sale } from 'api-client';

/**
 * Proiezione arricchita con film e sala annidati,
 * come restituita dal mock handler (join in-memory).
 * Il backend reale restituisce la stessa struttura quando si includono
 * le relazioni nella risposta.
 */
export interface ProiezioneArricchita extends Omit<
  Proiezione,
  'film' | 'sala'
> {
  film: Film;
  sala: Sale;
}

export const proiezioniApi = createApi({
  reducerPath: 'proiezioniApi',
  baseQuery: baseQuery,
  tagTypes: ['Proiezione'],
  endpoints: (builder) => ({
    getProiezioniByData: builder.query<ProiezioneArricchita[], string>({
      query: (data) => `/proiezioni/palinsesto/${data}`,
      transformResponse: (response: unknown) => {
        const respObj = response as
          { data?: unknown[]; items?: unknown[] } | undefined;
        const rawItems: unknown[] =
          respObj?.data ??
          respObj?.items ??
          (Array.isArray(response) ? response : []);

        return rawItems.map((item) => {
          const it = item as Record<string, unknown>;
          const filmObj = it.film as Record<string, unknown> | undefined;
          const salaObj = it.sala as Record<string, unknown> | undefined;

          return {
            ...it,
            id: (it.id ?? it.proiezioneId) as number,
            filmId: (it.filmId ?? it.film_id ?? filmObj?.id) as number,
            salaId: (it.salaId ?? it.sala_id ?? salaObj?.id) as number,
            film: filmObj
              ? {
                  ...filmObj,
                  durataMinuti: (filmObj.durataMinuti ??
                    filmObj.durata) as number,
                }
              : filmObj,
          } as unknown as ProiezioneArricchita;
        });
      },
      providesTags: (result, _error, data) =>
        result
          ? [
              ...result.map(({ id }) => ({
                type: 'Proiezione' as const,
                id,
              })),
              { type: 'Proiezione', id: `LIST_${data}` },
            ]
          : [{ type: 'Proiezione', id: `LIST_${data}` }],
    }),
  }),
});

export const { useGetProiezioniByDataQuery } = proiezioniApi;
