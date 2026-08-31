import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Sale } from 'api-client';

export const saleApi = createApi({
  reducerPath: 'saleApi',
  baseQuery: baseQuery,
  tagTypes: ['Sala'],
  endpoints: (builder) => ({
    getSale: builder.query<Sale[], void>({
      // Contratto reale BE: GET /sale → { data: Sale[], meta: {...} }
      query: () => '/sale',
      transformResponse: (response: unknown): Sale[] => {
        if (Array.isArray(response)) return response as Sale[];
        const obj = response as Record<string, unknown>;
        // Il BE avvolge la lista in { data: [...], meta: {...} }
        if (Array.isArray(obj.data)) return obj.data as Sale[];
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Sala' as const, id })),
              { type: 'Sala', id: 'LIST' },
            ]
          : [{ type: 'Sala', id: 'LIST' }],
    }),
  }),
});

export const { useGetSaleQuery } = saleApi;
