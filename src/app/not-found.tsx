import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './not-found.module.css';
export default function NotFound() {
  const t = useTranslations('NotFound');

  return (
    <div className={styles.container}>
      <h2>{t('title')}</h2>
      <p className={styles.message}>{t('message')}</p>
      <div className={styles.linkContainer}>
        <Link href="/" className={styles.link}>
          {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
