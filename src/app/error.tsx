'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { Button } from 'ui/atoms/Button/Button';
import styles from './error.module.css';
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('Error');
  const tCommon = useTranslations('Common');

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className={styles.container}>
      <h2>{t('title')}</h2>
      <p className={styles.message}>{t('message')}</p>
      <Button onClick={() => reset()} className={styles.button}>
        {tCommon('retry')}
      </Button>
    </div>
  );
}
