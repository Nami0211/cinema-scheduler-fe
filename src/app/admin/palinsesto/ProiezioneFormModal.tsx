'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Film, Sale, ProiezioniPostRequest } from 'api-client';
import type { AppError } from 'services/baseQuery';
import { Modal } from 'ui/molecules/Modal';
import { Input } from 'ui/atoms/Input/Input';
import { Select } from 'ui/atoms/Select/Select';
import { Button } from 'ui/atoms/Button/Button';
import {
  calculateFineProiezione,
  formatUtcToLocalTime,
  parseLocalInputToUtcIso,
  getTodayString,
} from 'utils/date';
import styles from './adminPalinsesto.module.css';

interface ProiezioneFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProiezioniPostRequest) => Promise<void>;
  films: Film[];
  sale: Sale[];
  initialDate?: string;
  isLoading: boolean;
  error?: AppError;
}

function ProiezioneFormContent({
  onSubmit,
  onClose,
  films,
  sale,
  initialDate,
  isLoading,
  error,
}: Omit<ProiezioneFormModalProps, 'isOpen'>) {
  const t = useTranslations('AdminPalinsesto');

  const [filmId, setFilmId] = useState<string>('');
  const [salaId, setSalaId] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(
    initialDate || getTodayString()
  );
  const [timeStr, setTimeStr] = useState<string>('18:00');

  const [formErrors, setFormErrors] = useState<{
    filmId?: string;
    salaId?: string;
    dateStr?: string;
    timeStr?: string;
  }>({});

  const selectedFilm = films.find((f) => String(f.id) === filmId);
  const filmDurata = selectedFilm?.durataMinuti ?? 0;

  // Real-time calculation of end time + 15m cleaning buffer
  const dataOraInizioUtc = parseLocalInputToUtcIso(dateStr, timeStr);
  const { dataOraFineUtc, fineOccupazioneUtc } = calculateFineProiezione(
    dataOraInizioUtc,
    filmDurata
  );

  const oraFineFilm = formatUtcToLocalTime(dataOraFineUtc);
  const oraFineOccupazione = formatUtcToLocalTime(fineOccupazioneUtc);

  function validate() {
    const errs: typeof formErrors = {};
    if (!filmId) errs.filmId = t('errFilmRequired');
    if (!salaId) errs.salaId = t('errSalaRequired');
    if (!dateStr) errs.dateStr = t('errDateRequired');
    if (!timeStr) errs.timeStr = t('errTimeRequired');
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      filmId: filmId,
      salaId: salaId,
      dataOraInizio: new Date(dataOraInizioUtc),
    });
  }

  const conflictDetails =
    error?.status === 409
      ? (error.details as
          | {
              filmTitolo?: string;
              salaNome?: string;
              oraInizioLocale?: string;
              oraFineLocale?: string;
              oraFineBufferLocale?: string;
            }
          | undefined)
      : undefined;

  return (
    <>
      <form
        id="proiezione-form"
        onSubmit={handleSubmit}
        className={styles.form}
      >
        {/* Banner Conflitto 409 */}
        {error?.status === 409 && (
          <div className={styles.conflictBox} role="alert">
            <div className={styles.conflictHeader}>{t('conflictHeader')}</div>
            <div className={styles.conflictMessage}>{error.message}</div>
            {conflictDetails?.filmTitolo && (
              <div className={styles.conflictMessage}>
                {t('conflictingFilmLabel', {
                  film: conflictDetails.filmTitolo,
                })}
                <br />
                {t('conflictingTimeRange', {
                  start: conflictDetails.oraInizioLocale ?? '',
                  end: conflictDetails.oraFineLocale ?? '',
                  bufferEnd: conflictDetails.oraFineBufferLocale ?? '',
                })}
              </div>
            )}
          </div>
        )}

        {/* Altri errori backend (es 400 o 500) */}
        {error && error.status !== 409 && (
          <div className={`${styles.alert} ${styles.alertError}`} role="alert">
            <span>{error.message}</span>
          </div>
        )}

        {/* Sezione Film & Sala */}
        <div className={styles.formGrid}>
          <Select
            label={t('selectFilm')}
            value={filmId}
            onChange={(e) => setFilmId(e.target.value)}
            error={formErrors.filmId}
          >
            <option value="" disabled>
              {t('selectFilmPlaceholder')}
            </option>
            {films.map((f) => (
              <option key={f.id} value={String(f.id)}>
                {f.titolo} ({f.durataMinuti} min)
              </option>
            ))}
          </Select>

          <Select
            label={t('selectSala')}
            value={salaId}
            onChange={(e) => setSalaId(e.target.value)}
            error={formErrors.salaId}
          >
            <option value="" disabled>
              {t('selectSalaPlaceholder')}
            </option>
            {sale.map((s) => (
              <option key={s.id} value={String(s.id)}>
                {s.nome} ({s.capienza} posti)
              </option>
            ))}
          </Select>
        </div>

        {/* Sezione Data e Ora */}
        <div className={styles.formGrid}>
          <Input
            type="date"
            label={t('dateLabel')}
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            error={formErrors.dateStr}
          />

          <Input
            type="time"
            label={t('timeLabel')}
            value={timeStr}
            onChange={(e) => setTimeStr(e.target.value)}
            error={formErrors.timeStr}
          />
        </div>

        {/* Anteprima calcolo orario di fine + buffer 15m */}
        {selectedFilm && timeStr && (
          <div className={styles.calculationPreview}>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>
                {t('filmDurationInfo', { duration: filmDurata })}
              </span>
            </div>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>
                {t('expectedEndTime', { endTime: '' })}
              </span>
              <span className={styles.calcVal}>{oraFineFilm}</span>
            </div>
            <div className={styles.calcRow}>
              <span className={styles.calcLabel}>
                {t('occupiedBufferTime', { bufferTime: '' })}
              </span>
              <span className={styles.calcHighlight}>{oraFineOccupazione}</span>
            </div>
          </div>
        )}
      </form>

      <div className={styles.footerActions}>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          form="proiezione-form"
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {isLoading ? t('submitting') : t('submit')}
        </Button>
      </div>
    </>
  );
}

export function ProiezioneFormModal({
  isOpen,
  onClose,
  onSubmit,
  films,
  sale,
  initialDate,
  isLoading,
  error,
}: ProiezioneFormModalProps) {
  const t = useTranslations('AdminPalinsesto');

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('modalTitle')}>
      <ProiezioneFormContent
        key={initialDate ?? 'new-proiezione'}
        onSubmit={onSubmit}
        onClose={onClose}
        films={films}
        sale={sale}
        initialDate={initialDate}
        isLoading={isLoading}
        error={error}
      />
    </Modal>
  );
}
