import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';

/**
 * Forma di ogni elemento restituito da GET /proiezioni/palinsesto/{data}.
 * Rispecchia il tipo ProiezioneDettaglio definito nel BE (proiezione.repository.ts).
 * I campi film e sala sono snake_case nel JSON del BE.
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
     * Chiama: GET /proiezioni/palinsesto/{data}
     * Risposta BE: { status: 'success', data: PalinsestoItem[] }
     */
    getPalinsestoByData: builder.query<PalinsestoItem[], string>({
      query: (data) => `/proiezioni/palinsesto/${data}`,
      transformResponse: (response: unknown): PalinsestoItem[] => {
        const obj = response as Record<string, unknown>;
        // Il BE risponde con { status: 'success', data: [...] }
        const raw: unknown[] = Array.isArray(response)
          ? response
          : Array.isArray(obj.data)
            ? (obj.data as unknown[])
            : [];
        return raw as PalinsestoItem[];
      },
      providesTags: (_result, _error, data) => [
        { type: 'Palinsesto', id: data },
      ],
    }),
  }),
});

export const { useGetPalinsestoByDataQuery } = palinsestoApi;
