import { configureStore } from '@reduxjs/toolkit';
import { filmApi } from './api/filmApi';

export const makeStore = () => {
  return configureStore({
    reducer: {
      [filmApi.reducerPath]: filmApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(filmApi.middleware),
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
