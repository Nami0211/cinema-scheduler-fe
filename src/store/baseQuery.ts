import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';

// Custom error type expected from the backend
export interface CustomError {
  code?: string;
  message?: string;
  details?: unknown;
}

const rawBaseQuery = fetchBaseQuery({
  // Usa sempre un path relativo: così le chiamate sono same-origin e
  // MSW può intercettarle. In produzione Next.js fa il rewrite verso il backend.
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    // TODO: Add Authorization header here in Issue #10
    // const token = ...;
    // if (token) {
    //   headers.set('authorization', `Bearer ${token}`);
    // }
    return headers;
  },
});

export const baseQuery: BaseQueryFn<
  string | FetchArgs,
  unknown,
  CustomError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error) {
    const fetchError = result.error as FetchBaseQueryError;
    let customError: CustomError = {
      message: 'errors.unknown',
    };

    if (fetchError.status === 'FETCH_ERROR') {
      customError.message = 'errors.network';
    } else if (
      typeof fetchError.status === 'number' &&
      fetchError.data &&
      typeof fetchError.data === 'object' &&
      'error' in fetchError.data
    ) {
      // Assuming the backend returns { error: { code, message, details? } }
      customError = (fetchError.data as Record<string, unknown>)
        .error as CustomError;
    }

    return { error: customError };
  }

  return result;
};
