'use client';

import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import styles from './ThemeToggle.module.css';

const emptySubscribe = () => () => {};

function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const isMounted = useMounted();
  const t = useTranslations('Header');

  if (!isMounted) {
    return <div className={styles.placeholder} aria-hidden />;
  }

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const label = isDark ? t('themeLight') : t('themeDark');

  return (
    <button
      type="button"
      className={styles.themeToggleBtn}
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span className={styles.icon}>{isDark ? '☀️' : '🌙'}</span>
    </button>
  );
}
