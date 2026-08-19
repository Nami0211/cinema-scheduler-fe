'use client';

import { useTranslations } from 'next-intl';
import { useGetFilmsQuery } from 'services/api/filmApi';
import type { AppError } from 'services/baseQuery';
import styles from './page.module.css';

function FilmList({ instanceId }: { instanceId: string }) {
  const t = useTranslations('TestRedux');
  const tErr = useTranslations('errors');
  const { data: films, error, isLoading } = useGetFilmsQuery();

  if (isLoading) return <div>{t('loading', { instanceId })}</div>;
  if (error) {
    const appError = error as AppError;
    const errKey = appError?.message?.replace(/^errors\./, '') ?? 'unknown';
    const errorMessage = tErr.has(errKey as Parameters<typeof tErr>[0])
      ? tErr(errKey as Parameters<typeof tErr>[0])
      : appError.message;

    return <div>{t('error', { instanceId, message: errorMessage })}</div>;
  }

  return (
    <div className={styles.filmCard}>
      <h2>{t('filmListTitle', { instanceId })}</h2>
      <ul>
        {films?.map((film) => (
          <li key={film.id}>
            {film.titolo} - {film.durataMinuti} min
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TestReduxPage() {
  const t = useTranslations('TestRedux');

  return (
    <div className={styles.container}>
      <h1>{t('title')}</h1>
      <p>
        Questa pagina monta due componenti identici che effettuano la stessa
        query RTK Query (<code>useGetFilmsQuery</code>). Verifica nel tab
        Network dei DevTools che venga effettuata una <strong>sola</strong>{' '}
        chiamata HTTP a <code>/films</code>.
      </p>

      <div className={styles.grid}>
        <div className={styles.gridItem}>
          <FilmList instanceId="1" />
        </div>
        <div className={styles.gridItem}>
          <FilmList instanceId="2" />
        </div>
      </div>
    </div>
  );
}
