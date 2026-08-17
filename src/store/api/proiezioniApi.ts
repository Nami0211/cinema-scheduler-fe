import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '../baseQuery';
import type {
  Proiezione,
  Film,
  Sala,
} from 'api-client/typescript-fetch-client';

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
  sala: Sala;
}

interface ProiezioniResponse {
  items: ProiezioneArricchita[];
  total: number;
}

export const proiezioniApi = createApi({
  reducerPath: 'proiezioniApi',
  baseQuery: baseQuery,
  tagTypes: ['Proiezione'],
  endpoints: (builder) => ({
    getProiezioniByData: builder.query<ProiezioneArricchita[], string>({
      query: (data) => `/proiezioni?data=${data}`,
      transformResponse: (response: ProiezioniResponse) => response.items ?? [],
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
