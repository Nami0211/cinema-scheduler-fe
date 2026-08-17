'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import styles from './Header.module.css';
import classNames from 'classnames';

export default function Header() {
  const t = useTranslations('Header');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <Link href="/">Cinema</Link>
        <button
          className={styles.menuToggle}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={t('menuToggle')}
        >
          ☰
        </button>
      </div>
      <nav className={classNames(styles.nav, { [styles.open]: isOpen })}>
        <Link href="/" onClick={() => setIsOpen(false)}>
          {t('schedule')}
        </Link>
        <Link href="/prenotazioni" onClick={() => setIsOpen(false)}>
          {t('myBookings')}
        </Link>
        <Link href="/admin" onClick={() => setIsOpen(false)}>
          {t('adminArea')}
        </Link>
      </nav>
    </header>
  );
}
