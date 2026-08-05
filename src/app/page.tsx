import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('Home');
  return (
    <div style={{ textAlign: 'center', marginTop: '2rem' }}>
      <h1>{t('welcome')}</h1>
      <p style={{ marginTop: '1rem' }}>{t('description')}</p>
    </div>
  );
}
