import { useTranslations } from 'next-intl';

export default function Loading() {
  const t = useTranslations('Common');
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>{t('loading')}</div>
  );
}
