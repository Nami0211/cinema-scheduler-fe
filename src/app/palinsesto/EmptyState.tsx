import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';

interface EmptyStateProps {
  data: string;
}

export default function EmptyState({ data }: EmptyStateProps) {
  const t = useTranslations('Palinsesto');
  return (
    <div className={styles.emptyState} role="status" aria-live="polite">
      <svg
        className={styles.emptyStateIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        aria-hidden="true"
        fill="none"
      >
        {/* Schermo cinema */}
        <rect
          x="4"
          y="10"
          width="56"
          height="34"
          rx="3"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        {/* Sedute */}
        <rect
          x="10"
          y="50"
          width="8"
          height="6"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="22"
          y="50"
          width="8"
          height="6"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="34"
          y="50"
          width="8"
          height="6"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect
          x="46"
          y="50"
          width="8"
          height="6"
          rx="2"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Zzz — nessun film */}
        <text
          x="21"
          y="33"
          fontSize="16"
          fontWeight="bold"
          fill="currentColor"
          opacity="0.35"
        >
          zzz
        </text>
      </svg>
      <h3 className={styles.emptyStateTitle}>{t('noShowsTitle')}</h3>
      <p className={styles.emptyStateText}>{t('noShowsText', { data })}</p>
      <p className={styles.emptyStateHint}>{t('noShowsHint')}</p>
    </div>
  );
}
