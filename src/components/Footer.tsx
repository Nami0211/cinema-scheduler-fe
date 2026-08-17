'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  const t = useTranslations('Footer');
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerBrand}>
          <span className={styles.footerLogo}>🎬 {t('description')}</span>
          <p className={styles.footerTagline}>{t('tagline')}</p>
        </div>
        <div className={styles.footerLinks}>
          <Link href="/palinsesto">{t('linkSchedule')}</Link>
          <Link href="/prenotazioni">{t('linkBookings')}</Link>
          <Link href="/admin">{t('linkAdmin')}</Link>
        </div>
        <p className={styles.footerCopy}>
          &copy; {new Date().getFullYear()} {t('description')}. {t('copyright')}
        </p>
      </div>
    </footer>
  );
}
