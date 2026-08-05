import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <h2>{t('title')}</h2>
      <p style={{ marginTop: '1rem' }}>{t('message')}</p>
      <div style={{ marginTop: '2rem' }}>
        <Link href="/" style={{ textDecoration: 'underline' }}>
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
