'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Sale, Film } from 'api-client';
import type { ProiezioneArricchita } from 'services/api/proiezioniApi';
import { calculateFineProiezione, formatUtcToLocalTime } from 'utils/date';
import styles from './adminPalinsesto.module.css';

interface HallTimelineViewProps {
  sale: Sale[];
  films?: Film[];
  proiezioni: ProiezioneArricchita[];
  onDeleteProiezione: (proiezione: ProiezioneArricchita) => void;
}

export function HallTimelineView({
  sale,
  films = [],
  proiezioni,
  onDeleteProiezione,
}: HallTimelineViewProps) {
  const t = useTranslations('AdminPalinsesto');

  return (
    <div className={styles.timelineContainer}>
      <h2 className={styles.timelineTitle}>{t('timelineTitle')}</h2>

      <div className={styles.hallsGrid}>
        {sale.map((sala) => {
          const salaProiezioni = proiezioni
            .filter((p) => {
              const pSalaId =
                p.salaId ??
                p.sala?.id ??
                (p as unknown as Record<string, unknown>).sala_id ??
                (p as unknown as Record<string, unknown>).sala;
              return String(pSalaId) === String(sala.id);
            })
            .sort((a, b) => {
              const tA = new Date(a.dataOraInizio).getTime();
              const tB = new Date(b.dataOraInizio).getTime();
              return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB);
            });

          return (
            <div key={sala.id} className={styles.hallColumn}>
              <div className={styles.hallHeader}>
                <span className={styles.hallName}>{sala.nome}</span>
                <span className={styles.hallCapienza}>
                  {sala.capienza} posti
                </span>
              </div>

              <div className={styles.proiezioniList}>
                {salaProiezioni.length === 0 ? (
                  <div className={styles.emptyHall}>{t('noProiezioni')}</div>
                ) : (
                  salaProiezioni.map((p) => {
                    const filmObj =
                      p.film ??
                      films.find((f) => String(f.id) === String(p.filmId));

                    const filmTitolo =
                      filmObj?.titolo ?? `Film #${p.filmId ?? '?'}`;
                    const durata = filmObj?.durataMinuti ?? 120;
                    const oraInizio = formatUtcToLocalTime(p.dataOraInizio);

                    const { dataOraFineUtc, fineOccupazioneUtc } =
                      calculateFineProiezione(p.dataOraInizio, durata);

                    const oraFine = formatUtcToLocalTime(dataOraFineUtc);
                    const oraFineBuffer =
                      formatUtcToLocalTime(fineOccupazioneUtc);

                    return (
                      <div key={p.id} className={styles.proiezioneCard}>
                        <div className={styles.proiezioneTop}>
                          <span className={styles.filmTitle}>{filmTitolo}</span>
                          <button
                            type="button"
                            className={styles.deleteBtn}
                            onClick={() => onDeleteProiezione(p)}
                            title={t('deleteProiezione')}
                            aria-label={`${t('deleteProiezione')} ${filmTitolo}`}
                          >
                            🗑️
                          </button>
                        </div>

                        <div className={styles.proiezioneTimes}>
                          <span className={styles.filmTimeRange}>
                            🕒 {oraInizio} - {oraFine} ({durata} min)
                          </span>
                          <span className={styles.bufferBadge}>
                            🧹 {t('cleaningBuffer')} (fino alle {oraFineBuffer})
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
