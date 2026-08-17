'use client';

import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';
import { Button } from 'ui/atoms/Button/Button';

interface ErrorStateProps {
  onRetry: () => void;
  message?: string;
}

export default function ErrorState({ onRetry, message }: ErrorStateProps) {
  const t = useTranslations('Palinsesto');
  return (
    <div className={styles.errorState} role="alert" aria-live="assertive">
      <svg
        className={styles.errorStateIcon}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 64 64"
        aria-hidden="true"
        fill="none"
      >
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <line
          x1="32"
          y1="18"
          x2="32"
          y2="36"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="32" cy="44" r="2.5" fill="currentColor" />
      </svg>
      <h3 className={styles.errorStateTitle}>{t('errorTitle')}</h3>
      <p className={styles.errorStateText}>{message ?? t('errorMessage')}</p>
      <Button
        id="palinsesto-retry-btn"
        variant="primary"
        onClick={onRetry}
        className={styles.retryButton}
      >
        {t('retry')}
      </Button>
    </div>
  );
}
