import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Sale, SaleGet200Response } from 'api-client';

export const saleApi = createApi({
  reducerPath: 'saleApi',
  baseQuery: baseQuery,
  tagTypes: ['Sala'],
  endpoints: (builder) => ({
    getSale: builder.query<Sale[], void>({
      // Contratto BE: GET /sale → SaleGet200Response { data: Sale[], meta: {...} }
      query: () => '/sale',
      transformResponse: (response: unknown): Sale[] => {
        // Il codegen ha già il tipo corretto: SaleGet200Response.data
        const typed = response as SaleGet200Response;
        if (Array.isArray(typed?.data)) return typed.data;
        if (Array.isArray(response)) return response as Sale[];
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
