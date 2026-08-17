import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';
import cx from 'classnames';
import ShowtimeChip from './ShowtimeChip';
import type { ProiezioneArricchita } from 'store/api/proiezioniApi';
import type { RatingEta } from 'api-client/typescript-fetch-client';

interface FilmCardProps {
  film: ProiezioneArricchita['film'];
  proiezioni: ProiezioneArricchita[];
}

const RATING_CSS_CLASS: Record<RatingEta, string> = {
  T: 'ratingT',
  '14+': 'rating14',
  '18+': 'rating18',
};

const GENRE_EMOJI: Record<string, string> = {
  Azione: '💥',
  Horror: '👻',
  Commedia: '😂',
  Drammatico: '🎭',
  Romantico: '❤️',
  Fantascienza: '🚀',
  Animazione: '🎨',
};

export default function FilmCard({ film, proiezioni }: FilmCardProps) {
  const t = useTranslations('Palinsesto');
  const ratingClass = RATING_CSS_CLASS[film.ratingEta] ?? 'ratingT';
  const emoji = GENRE_EMOJI[film.genere] ?? '🎬';

  const ordinate = [...proiezioni].sort(
    (a, b) =>
      new Date(a.dataOraInizio).getTime() - new Date(b.dataOraInizio).getTime()
  );

  return (
    <article className={styles.filmCard} id={`film-card-${film.id}`}>
      {/* Poster placeholder */}
      <div className={styles.filmPoster} aria-hidden="true">
        <span className={styles.filmPosterEmoji}>{emoji}</span>
      </div>

      {/* Info film */}
      <div className={styles.filmInfo}>
        <h2 className={styles.filmTitle}>{film.titolo}</h2>

        <div className={styles.filmMeta}>
          <span className={styles.filmGenre}>{film.genere}</span>
          <span className={styles.filmDuration}>
            {t('duration', { minutes: film.durataMinuti })}
          </span>
        </div>

        {/* Rating d'età posizionato sotto il genere */}
        <div className={styles.filmRatingWrapper}>
          <span
            className={cx(styles.ratingBadge, styles[ratingClass])}
            aria-label={t('ratingAriaLabel', { rating: film.ratingEta })}
          >
            {t('rating', { rating: film.ratingEta })}
          </span>
        </div>
      </div>

      {/* Orari */}
      <div className={styles.showtimesList}>
        {ordinate.map((proiezione) => (
          <ShowtimeChip
            key={proiezione.id}
            proiezioneId={proiezione.id}
            dataOraInizio={
              proiezione.dataOraInizio instanceof Date
                ? proiezione.dataOraInizio.toISOString()
                : String(proiezione.dataOraInizio)
            }
            dataOraFine={
              proiezione.dataOraFine instanceof Date
                ? proiezione.dataOraFine.toISOString()
                : String(proiezione.dataOraFine)
            }
            salaNome={proiezione.sala.nome}
          />
        ))}
      </div>
    </article>
  );
}
