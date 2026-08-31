'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import classNames from 'classnames';
import styles from './AdminSubNav.module.css';

export function AdminSubNav() {
  const t = useTranslations('AdminNav');
  const pathname = usePathname();

  const isFilm = pathname.startsWith('/admin/film');
  const isPalinsesto = pathname.startsWith('/admin/palinsesto');

  return (
    <nav className={styles.subNav} aria-label={t('ariaLabel')}>
      <Link
        href="/admin/film"
        className={classNames(styles.tab, { [styles.activeTab]: isFilm })}
      >
        🎬 {t('film')}
      </Link>
      <Link
        href="/admin/palinsesto"
        className={classNames(styles.tab, {
          [styles.activeTab]: isPalinsesto,
        })}
      >
        📅 {t('palinsesto')}
      </Link>
    </nav>
  );
}
