import { useTranslations } from 'next-intl';
import styles from './loading.module.css';
export default function Loading() {
  const t = useTranslations('Common');
  return <div className={styles.container}>{t('loading')}</div>;
}
