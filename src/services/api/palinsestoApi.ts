import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';

/**
 * Forma di ogni elemento restituito da GET /proiezioni/palinsesto/{data}.
 * Rispecchia il tipo ProiezioneDettaglio definito nel BE (proiezione.repository.ts).
 */
export interface PalinsestoFilm {
  id: string;
  titolo: string;
  durata: number;
  genere: string;
  classificazione: string;
}

export interface PalinsestoSala {
  id: string;
  nome: string;
}

export interface PalinsestoItem {
  proiezioneId: string;
  dataOraInizio: string;
  dataOraFine: string;
  film: PalinsestoFilm;
  sala: PalinsestoSala;
}

export const palinsestoApi = createApi({
  reducerPath: 'palinsestoApi',
  baseQuery: baseQuery,
  tagTypes: ['Palinsesto'],
  endpoints: (builder) => ({
    /**
     * Recupera il palinsesto per una data specifica nel formato YYYY-MM-DD.
     * Contratto reale BE: GET /proiezioni/palinsesto/{data}
     */
    getPalinsestoByData: builder.query<PalinsestoItem[], string>({
      query: (data) => `/proiezioni/palinsesto/${data}`,
      transformResponse: (response: unknown): PalinsestoItem[] => {
        if (Array.isArray(response)) return response as PalinsestoItem[];
        const obj = response as Record<string, unknown>;
        if (Array.isArray(obj.data)) return obj.data as PalinsestoItem[];
        return [];
      },
      providesTags: (_result, _error, data) => [
        { type: 'Palinsesto', id: data },
      ],
    }),
  }),
});

export const { useGetPalinsestoByDataQuery } = palinsestoApi;
