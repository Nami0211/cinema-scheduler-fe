import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';
import cx from 'classnames';

interface ShowtimeChipProps {
  dataOraInizio: string; // ISO UTC string
  dataOraFine: string; // ISO UTC string
  salaNome: string;
  proiezioneId: number;
}

function formatOra(isoUtc: string): string {
  return new Date(isoUtc).toLocaleTimeString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShowtimeChip({
  dataOraInizio,
  dataOraFine,
  salaNome,
  proiezioneId,
}: ShowtimeChipProps) {
  const t = useTranslations('Palinsesto');
  const now = new Date();
  const inizio = new Date(dataOraInizio);
  const fine = new Date(dataOraFine);

  const isOngoing = now >= inizio && now < fine;
  const isPast = now >= fine;

  const oraInizio = formatOra(dataOraInizio);
  const oraFine = formatOra(dataOraFine);

  return (
    <div
      className={cx(styles.showtimeChip, {
        [styles.showtimeOngoing]: isOngoing,
        [styles.showtimePast]: isPast,
      })}
      id={`showtime-${proiezioneId}`}
    >
      <div className={styles.showtimeTime}>
        <span className={styles.showtimeStart}>{oraInizio}</span>
        <span className={styles.showtimeEnd}>
          {t('showtimeUntil', { time: oraFine })}
        </span>
      </div>
      <div className={styles.showtimeMeta}>
        <span className={styles.showtimeSala}>{salaNome}</span>
        {isOngoing && (
          <span
            className={styles.showtimeBadgeOngoing}
            aria-label={t('ongoingAriaLabel')}
          >
            ● {t('ongoing')}
          </span>
        )}
      </div>
    </div>
  );
}
