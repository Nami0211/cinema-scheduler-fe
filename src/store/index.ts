import { configureStore } from '@reduxjs/toolkit';
import { filmApi } from 'services/api/filmApi';
import { proiezioniApi } from 'services/api/proiezioniApi';
import { saleApi } from 'services/api/saleApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [filmApi.reducerPath]: filmApi.reducer,
      [proiezioniApi.reducerPath]: proiezioniApi.reducer,
      [saleApi.reducerPath]: saleApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        filmApi.middleware,
        proiezioniApi.middleware,
        saleApi.middleware
      ),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
