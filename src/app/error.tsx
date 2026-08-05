'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

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
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2>{t('title')}</h2>
      <p style={{ marginTop: '1rem' }}>{t('message')}</p>
      <button
        onClick={() => reset()}
        style={{ marginTop: '2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
      >
        {tCommon('retry')}
      </button>
    </div>
  );
}
