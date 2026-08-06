import styles from './Footer.module.css';
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className={styles.footer}>
      <p>
        &copy; {new Date().getFullYear()} {t('description')}
      </p>
    </footer>
  );
}
