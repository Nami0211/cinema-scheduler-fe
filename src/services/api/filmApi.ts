import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type {
  Film,
  FilmsGet200Response,
} from 'api-client/typescript-fetch-client';

export const filmApi = createApi({
  reducerPath: 'filmApi',
  baseQuery: baseQuery,
  tagTypes: ['Film'],
  endpoints: (builder) => ({
    getFilms: builder.query<Film[], void>({
      query: () => '/films',
      transformResponse: (response: FilmsGet200Response) =>
        response.items || [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Film' as const, id })),
              { type: 'Film', id: 'LIST' },
            ]
          : [{ type: 'Film', id: 'LIST' }],
    }),
    getFilmById: builder.query<Film, number>({
      query: (id) => `/films/${id}`,
      providesTags: (result, error, id) => [{ type: 'Film', id }],
    }),
  }),
});

export const { useGetFilmsQuery, useGetFilmByIdQuery } = filmApi;
