import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Sale } from 'api-client';

interface SaleResponse {
  items: Sale[];
  total: number;
}

export const saleApi = createApi({
  reducerPath: 'saleApi',
  baseQuery: baseQuery,
  tagTypes: ['Sala'],
  endpoints: (builder) => ({
    getSale: builder.query<Sale[], void>({
      query: () => '/sale',
      transformResponse: (response: SaleResponse) => response.items ?? [],
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
