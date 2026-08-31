import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Sale } from 'api-client';

export const saleApi = createApi({
  reducerPath: 'saleApi',
  baseQuery: baseQuery,
  tagTypes: ['Sala'],
  endpoints: (builder) => ({
    getSale: builder.query<Sale[], void>({
      // Contratto BE: GET /sale → SaleGet200Response { data: Sale[], meta: {...} }
      query: () => '/sale',
      transformResponse: (response: unknown): Sale[] => {
        let rawItems: Array<Record<string, unknown>> = [];
        if (Array.isArray(response)) {
          rawItems = response as Array<Record<string, unknown>>;
        } else if (typeof response === 'object' && response !== null) {
          const obj = response as Record<string, unknown>;
          if (Array.isArray(obj.data)) {
            rawItems = obj.data as Array<Record<string, unknown>>;
          } else if (Array.isArray(obj.items)) {
            rawItems = obj.items as Array<Record<string, unknown>>;
          } else if (Array.isArray(obj.sale)) {
            rawItems = obj.sale as Array<Record<string, unknown>>;
          }
        }
        return rawItems.map((item) => ({
          ...item,
          id: item.id ?? item.salaId ?? item.sala_id,
          nome: (item.nome ?? item.name ?? `Sala ${item.id ?? ''}`) as string,
          capienza: Number(item.capienza ?? item.posti ?? 0),
          righe: Number(item.righe ?? 0),
          colonne: Number(item.colonne ?? 0),
        })) as Sale[];
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
