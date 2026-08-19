import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query/react';
import {
  instanceOfErrorResponseError,
  type ErrorResponseError,
} from 'api-client/typescript-fetch-client';

/**
 * Forma unica dell'errore vista dai componenti.
 * `status` è indispensabile per distinguere 400 / 401 / 409 / 500 (issue #9, #11, #13).
 */
export interface AppError {
  /** Status HTTP, oppure null se la richiesta non è mai arrivata al server. */
  status: number | null;
  /** Chiave i18n o messaggio del backend. */
  message: string;
  code?: string;
  details?: unknown;
}

/** Estrae `{ error: { code, message, details? } }` validandolo, senza cast ciechi. */
function parseBackendError(data: unknown): ErrorResponseError | null {
  if (typeof data !== 'object' || data === null || !('error' in data)) {
    return null;
  }
  const { error } = data as { error: unknown };
  if (typeof error !== 'object' || error === null) {
    return null;
  }
  return instanceOfErrorResponseError(error)
    ? (error as ErrorResponseError)
    : null;
}

function toAppError(fetchError: FetchBaseQueryError): AppError {
  if (typeof fetchError.status === 'number') {
    const backendError = parseBackendError(fetchError.data);
    return {
      status: fetchError.status,
      message: backendError?.message ?? 'errors.unknown',
      code: backendError?.code,
      details: backendError?.details,
    };
  }

  switch (fetchError.status) {
    case 'FETCH_ERROR':
      return { status: null, message: 'errors.network', code: 'FETCH_ERROR' };
    case 'TIMEOUT_ERROR':
      return { status: null, message: 'errors.timeout', code: 'TIMEOUT_ERROR' };
    case 'PARSING_ERROR':
      return {
        status: fetchError.originalStatus,
        message: 'errors.parsing',
        code: 'PARSING_ERROR',
      };
    default:
      return { status: null, message: 'errors.unknown', code: 'CUSTOM_ERROR' };
  }
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
  AppError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error) {
    return { error: toAppError(result.error) };
  }
  return result;
};
