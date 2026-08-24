import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from 'services/baseQuery';
import type { Sale } from 'api-client';

export const saleApi = createApi({
  reducerPath: 'saleApi',
  baseQuery: baseQuery,
  tagTypes: ['Sala'],
  endpoints: (builder) => ({
    getSale: builder.query<Sale[], void>({
      query: () => '/sale',
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
          } else if (typeof obj.data === 'object' && obj.data !== null) {
            const nested = obj.data as Record<string, unknown>;
            if (Array.isArray(nested.items)) {
              rawItems = nested.items;
            } else if (Array.isArray(nested.data)) {
              rawItems = nested.data;
            }
          }
        }

        return rawItems.map((item) => {
          const it = item as Record<string, unknown>;
          return {
            ...it,
            id: (it.id ?? it.salaId ?? it.sala_id) as number,
            nome: (it.nome ?? it.name ?? `Sala ${it.id}`) as string,
            capienza: (it.capienza ?? it.capacity ?? 0) as number,
          } as unknown as Sale;
        });
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
