import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type {
  Film,
  FilmsGet200Response,
  FilmsPostRequest,
  FilmsIdPatchRequest,
  FilmsPost201Response,
} from 'api-client';

export const filmApi = createApi({
  reducerPath: 'filmApi',
  baseQuery: baseQuery,
  tagTypes: ['Film'],
  endpoints: (builder) => ({
    getFilms: builder.query<Film[], void>({
      query: () => '/films',
      transformResponse: (
        response: FilmsGet200Response & { items?: unknown[] }
      ) => {
        const rawItems = (response.data ??
          response.items ??
          []) as unknown as Array<Record<string, unknown>>;
        return rawItems.map((item) => ({
          ...item,
          durataMinuti: Number(
            item.durataMinuti ?? item.durata_minuti ?? item.durata ?? 0
          ),
          classificazione:
            (item.classificazione as string) ??
            (item.ratingEta as string) ??
            (item.rating_eta as string) ??
            'T',
        })) as Film[];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Film' as const, id })),
              { type: 'Film', id: 'LIST' },
            ]
          : [{ type: 'Film', id: 'LIST' }],
    }),
    getFilmById: builder.query<Film, string | number>({
      query: (id) => `/films/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Film', id }],
    }),
    createFilm: builder.mutation<FilmsPost201Response, FilmsPostRequest>({
      query: (body) => ({
        url: '/films',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Film', id: 'LIST' }],
    }),
    updateFilm: builder.mutation<
      FilmsPost201Response,
      { id: string | number; film: FilmsIdPatchRequest }
    >({
      query: ({ id, film }) => ({
        url: `/films/${id}`,
        method: 'PATCH',
        body: film,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Film', id },
        { type: 'Film', id: 'LIST' },
      ],
    }),
    deleteFilm: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/films/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Film', id },
        { type: 'Film', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFilmsQuery,
  useGetFilmByIdQuery,
  useCreateFilmMutation,
  useUpdateFilmMutation,
  useDeleteFilmMutation,
} = filmApi;
