'use client';

import { useGetFilmsQuery } from 'store/api/filmApi';
import styles from './page.module.css';

function FilmList({ instanceId }: { instanceId: string }) {
  const { data: films, error, isLoading } = useGetFilmsQuery();

  if (isLoading) return <div>Caricamento film (Istanza {instanceId})...</div>;
  if (error)
    return <div>Errore nel caricamento film: {JSON.stringify(error)}</div>;

  return (
    <div className={styles.filmCard}>
      <h2>Lista Film (Istanza {instanceId})</h2>
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
  return (
    <div className={styles.container}>
      <h1>Test Redux Toolkit &amp; RTK Query</h1>
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
