'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ThemeToggle } from 'ui/ThemeToggle';
import styles from './Header.module.css';
import classNames from 'classnames';

const NAV_LINKS = [
  { href: '/palinsesto', labelKey: 'schedule' },
  { href: '/prenotazioni', labelKey: 'myBookings' },
  { href: '/admin', labelKey: 'adminArea' },
];

export default function Header() {
  const t = useTranslations('Header');
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          <span className={styles.logoIcon}>🎬</span>
          <span className={styles.logoText}>{t('logoText')}</span>
        </Link>

        {/* Right actions */}
        <div className={styles.headerActions}>
          {/* Navigation */}
          <nav
            className={classNames(styles.nav, { [styles.navOpen]: isOpen })}
            aria-label={t('mainNavAria')}
          >
            {NAV_LINKS.map(({ href, labelKey }) => {
              const isActive = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={classNames(styles.navLink, {
                    [styles.navLinkActive]: isActive,
                  })}
                  onClick={() => setIsOpen(false)}
                >
                  {t(labelKey as Parameters<typeof t>[0])}
                </Link>
              );
            })}
          </nav>

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Hamburger (mobile) */}
          <button
            className={styles.menuToggle}
            onClick={() => setIsOpen(!isOpen)}
            aria-label={t('menuToggle')}
            aria-expanded={isOpen}
          >
            <span
              className={classNames(styles.hamburgerLine, {
                [styles.open1]: isOpen,
              })}
            />
            <span
              className={classNames(styles.hamburgerLine, {
                [styles.open2]: isOpen,
              })}
            />
            <span
              className={classNames(styles.hamburgerLine, {
                [styles.open3]: isOpen,
              })}
            />
          </button>
        </div>
      </div>
    </header>
  );
}
