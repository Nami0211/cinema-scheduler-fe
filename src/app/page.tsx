import { useTranslations } from 'next-intl';
import styles from './page.module.css';
export default function Home() {
  const t = useTranslations('Home');
  return (
    <div className={styles.centeredContainer}>
      <h1>{t('welcome')}</h1>
      <p className={styles.description}>{t('description')}</p>
    </div>
  );
}
