'use client';

import { useTranslations } from 'next-intl';
import styles from './palinsesto.module.css';
import cx from 'classnames';

interface DaySelectorProps {
  giorniDisponibili: string[];
  dataSelezionata: string;
  onSelectDay: (giorno: string) => void;
}

function formatLabel(dateString: string): { giorno: string; data: string } {
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  const rawDayName = new Intl.DateTimeFormat('it-IT', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(date);
  const giornoSettimana =
    rawDayName.charAt(0).toUpperCase() + rawDayName.slice(1, 3);

  const rawMonthName = new Intl.DateTimeFormat('it-IT', {
    month: 'short',
    timeZone: 'UTC',
  }).format(date);
  const monthName = rawMonthName.replace('.', '');
  const dataParte = `${day} ${monthName}`;

  return { giorno: giornoSettimana, data: dataParte };
}

export default function DaySelector({
  giorniDisponibili,
  dataSelezionata,
  onSelectDay,
}: DaySelectorProps) {
  const t = useTranslations('Palinsesto');

  function handleDayClick(giorno: string) {
    onSelectDay(giorno);
  }

  return (
    <div className={styles.daySelectorWrapper}>
      <nav className={styles.daySelector} aria-label={t('daySelectorAria')}>
        {giorniDisponibili.map((giorno) => {
          const isActive = giorno === dataSelezionata;
          const { giorno: gg, data } = formatLabel(giorno);
          return (
            <button
              key={giorno}
              id={`day-btn-${giorno}`}
              className={cx(styles.dayButton, {
                [styles.dayButtonActive]: isActive,
              })}
              onClick={() => handleDayClick(giorno)}
              aria-pressed={isActive}
              aria-label={`${gg} ${data}`}
            >
              <span className={styles.dayName}>{gg}</span>
              <span className={styles.dayDate}>{data}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
