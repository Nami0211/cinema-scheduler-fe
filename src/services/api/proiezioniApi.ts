import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Proiezione, Film, Sale } from 'api-client';

/**
 * Proiezione arricchita con film e sala annidati,
 * come restituita dall'endpoint GET /proiezioni/palinsesto/{data}.
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
      // Contratto reale BE: GET /proiezioni/palinsesto/{data}
      query: (data) => `/proiezioni/palinsesto/${data}`,
      transformResponse: (response: unknown) => {
        let rawItems: unknown[] = [];
        if (Array.isArray(response)) {
          rawItems = response;
        } else if (typeof response === 'object' && response !== null) {
          const obj = response as Record<string, unknown>;
          if (Array.isArray(obj.data)) {
            rawItems = obj.data;
          } else if (Array.isArray(obj.items)) {
            rawItems = obj.items;
          }
        }

        return rawItems.map((item) => {
          const it = item as Record<string, unknown>;
          const filmObj =
            it.film && typeof it.film === 'object'
              ? (it.film as Record<string, unknown>)
              : undefined;
          const salaObj =
            it.sala && typeof it.sala === 'object'
              ? (it.sala as Record<string, unknown>)
              : undefined;

          const id = (it.id ?? it.proiezioneId ?? it.proiezione_id) as number;
          const filmId = (it.filmId ??
            it.film_id ??
            filmObj?.id ??
            (typeof it.film === 'number' || typeof it.film === 'string'
              ? it.film
              : undefined)) as number;
          const salaId = (it.salaId ??
            it.sala_id ??
            salaObj?.id ??
            (typeof it.sala === 'number' || typeof it.sala === 'string'
              ? it.sala
              : undefined)) as number;

          const dataOraInizio = (it.dataOraInizio ??
            it.data_ora_inizio ??
            it.dataInizio ??
            it.data_inizio) as string;

          const dataOraFine = (it.dataOraFine ??
            it.data_ora_fine ??
            it.dataFine ??
            it.data_fine) as string;

          return {
            ...it,
            id,
            filmId,
            salaId,
            dataOraInizio,
            dataOraFine,
            film: filmObj
              ? {
                  ...filmObj,
                  id: filmObj.id ?? filmId,
                  titolo: (filmObj.titolo ?? filmObj.title) as string,
                  durataMinuti: Number(
                    filmObj.durataMinuti ??
                      filmObj.durata_minuti ??
                      filmObj.durata ??
                      0
                  ),
                }
              : filmObj,
            sala: salaObj
              ? {
                  ...salaObj,
                  id: salaObj.id ?? salaId,
                  nome: (salaObj.nome ?? salaObj.name) as string,
                }
              : salaObj,
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
              { type: 'Proiezione', id: 'LIST' },
            ]
          : [
              { type: 'Proiezione', id: `LIST_${data}` },
              { type: 'Proiezione', id: 'LIST' },
            ],
    }),
    createProiezione: builder.mutation<
      ProiezioneArricchita,
      { filmId: number; salaId: number; dataOraInizio: string }
    >({
      query: (data) => ({
        url: '/proiezioni',
        method: 'POST',
        // Il backend reale usa snake_case per il body di POST /proiezioni
        body: {
          film_id: data.filmId,
          sala_id: data.salaId,
          data_ora_inizio: data.dataOraInizio,
        },
      }),
      invalidatesTags: [{ type: 'Proiezione' }],
    }),
    deleteProiezione: builder.mutation<void, number | string>({
      query: (id) => ({
        url: `/proiezioni/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Proiezione' }],
    }),
  }),
});

export const {
  useGetProiezioniByDataQuery,
  useCreateProiezioneMutation,
  useDeleteProiezioneMutation,
} = proiezioniApi;
