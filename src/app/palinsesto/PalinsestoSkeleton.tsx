import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';

/**
 * Skeleton strutturale della pagina palinsesto.
 * Riproduce la struttura attesa (N card film con M orari ciascuna)
 * senza uno spinner a tutta pagina.
 */
export default function PalinsestoSkeleton() {
  const t = useTranslations('Palinsesto');

  return (
    <div className={styles.page} aria-busy="true" aria-label={t('loadingAria')}>
      {/* Day selector skeleton */}
      <div className={styles.daySelectorWrapper}>
        <div className={styles.daySelector}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={styles.dayButtonSkeleton} />
          ))}
        </div>
      </div>

      {/* Film cards skeleton */}
      <div className={styles.filmGrid}>
        {Array.from({ length: 4 }).map((_, cardIndex) => (
          <div
            key={cardIndex}
            className={`${styles.filmCard} ${styles.filmCardSkeleton}`}
          >
            {/* Header */}
            <div className={styles.filmCardHeader}>
              <div className={styles.filmInfo}>
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonTitle}`}
                />
                <div
                  className={`${styles.skeletonLine} ${styles.skeletonMeta}`}
                />
              </div>
              <div className={`${styles.skeletonBadge}`} />
            </div>
            {/* Showtimes */}
            <div className={styles.showtimesList}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`${styles.showtimeChip} ${styles.showtimeChipSkeleton}`}
                >
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonShowtime}`}
                  />
                  <div
                    className={`${styles.skeletonLine} ${styles.skeletonSala}`}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
