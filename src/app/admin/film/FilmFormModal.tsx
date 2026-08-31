'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Film, FilmClassificazioneEnum } from 'api-client';
import { Modal } from 'ui/molecules/Modal';
import { Input } from 'ui/atoms/Input/Input';
import { Select } from 'ui/atoms/Select/Select';
import { Button } from 'ui/atoms/Button/Button';
import type { AppError } from 'services/baseQuery';
import styles from './adminFilm.module.css';

interface FilmFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  film?: Film | null;
  onSubmit: (data: {
    titolo: string;
    durataMinuti: number;
    genere: string;
    classificazione: FilmClassificazioneEnum;
  }) => Promise<void>;
  isLoading: boolean;
  error?: AppError | null;
}

const GENRE_OPTIONS = [
  'Azione',
  'Commedia',
  'Drammatico',
  'Horror',
  'Romantico',
  'Fantascienza',
  'Animazione',
];

const RATING_OPTIONS: Array<{ label: string; value: FilmClassificazioneEnum }> =
  [
    { label: 'T (Tutti)', value: 'T' },
    { label: '14+ (Vietato ai minori di 14)', value: '14+' },
    { label: '18+ (Vietato ai minori di 18)', value: '18+' },
  ];

function FilmFormContent({
  film,
  onSubmit,
  onClose,
  isLoading,
  error,
}: Omit<FilmFormModalProps, 'isOpen'>) {
  const t = useTranslations('AdminFilm');

  const [titolo, setTitolo] = useState(film?.titolo ?? '');
  const [durataMinuti, setDurataMinuti] = useState(
    film ? String(film.durataMinuti) : ''
  );
  const [genere, setGenere] = useState(film?.genere ?? '');
  const [classificazione, setClassificazione] = useState<
    FilmClassificazioneEnum | ''
  >(film?.classificazione ?? '');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const FORM_FIELDS = ['titolo', 'durataMinuti', 'genere', 'classificazione'];

  // Derived backend 400 error field map & general error message
  const rawDetails =
    error?.status === 400 &&
    error.details &&
    typeof error.details === 'object' &&
    !Array.isArray(error.details)
      ? (error.details as Record<string, string>)
      : null;

  const hasMappedField = rawDetails
    ? FORM_FIELDS.some((field) => Boolean(rawDetails[field]))
    : false;

  const backendDetails = hasMappedField ? rawDetails : null;

  const generalError = error && !backendDetails ? error.message : null;

  const mergedFieldErrors = {
    ...backendDetails,
    ...fieldErrors,
  };

  function validateClient(): boolean {
    const errors: Record<string, string> = {};

    if (!titolo.trim()) {
      errors.titolo = t('errTitleRequired');
    }

    const durationNum = Number(durataMinuti);
    if (!durataMinuti || isNaN(durationNum) || durationNum <= 0) {
      errors.durataMinuti = t('errDurationPositive');
    }

    if (!genere) {
      errors.genere = t('errGenreRequired');
    }

    if (!classificazione) {
      errors.classificazione = t('errRatingRequired');
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateClient()) return;

    try {
      await onSubmit({
        titolo: titolo.trim(),
        durataMinuti: Number(durataMinuti),
        genere,
        classificazione: classificazione as FilmClassificazioneEnum,
      });
    } catch {
      // Handled in RTK Query mutation error prop
    }
  }

  return (
    <>
      <form id="film-form" onSubmit={handleSubmit} className={styles.form}>
        {generalError && (
          <div className={`${styles.alert} ${styles.alertError}`}>
            {generalError}
          </div>
        )}

        <Input
          id="film-titolo"
          label={t('fieldTitle')}
          placeholder={t('fieldTitlePlaceholder')}
          value={titolo}
          onChange={(e) => {
            setTitolo(e.target.value);
            if (mergedFieldErrors.titolo) {
              setFieldErrors((prev) => ({ ...prev, titolo: '' }));
            }
          }}
          error={mergedFieldErrors.titolo}
          disabled={isLoading}
        />

        <div className={styles.formGrid}>
          <Input
            id="film-durata"
            type="number"
            min="1"
            label={t('fieldDuration')}
            placeholder={t('fieldDurationPlaceholder')}
            value={durataMinuti}
            onChange={(e) => {
              setDurataMinuti(e.target.value);
              if (mergedFieldErrors.durataMinuti) {
                setFieldErrors((prev) => ({ ...prev, durataMinuti: '' }));
              }
            }}
            error={mergedFieldErrors.durataMinuti}
            disabled={isLoading}
          />

          <Select
            id="film-genere"
            label={t('fieldGenre')}
            value={genere}
            onChange={(e) => {
              setGenere(e.target.value);
              if (mergedFieldErrors.genere) {
                setFieldErrors((prev) => ({ ...prev, genere: '' }));
              }
            }}
            error={mergedFieldErrors.genere}
            disabled={isLoading}
          >
            <option value="" disabled>
              {t('fieldGenreSelect')}
            </option>
            {GENRE_OPTIONS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </div>

        <Select
          id="film-classificazione"
          label={t('fieldRating')}
          value={classificazione}
          onChange={(e) => {
            setClassificazione(e.target.value as FilmClassificazioneEnum);
            if (mergedFieldErrors.classificazione) {
              setFieldErrors((prev) => ({ ...prev, classificazione: '' }));
            }
          }}
          error={mergedFieldErrors.classificazione}
          disabled={isLoading}
        >
          <option value="" disabled>
            {t('fieldRatingSelect')}
          </option>
          {RATING_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </Select>
      </form>
      <div className={styles.footerActions}>
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {t('cancel')}
        </Button>
        <Button
          form="film-form"
          type="submit"
          variant="primary"
          isLoading={isLoading}
          disabled={isLoading}
        >
          {isLoading ? t('saving') : t('save')}
        </Button>
      </div>
    </>
  );
}

export function FilmFormModal({
  isOpen,
  onClose,
  film,
  onSubmit,
  isLoading,
  error,
}: FilmFormModalProps) {
  const t = useTranslations('AdminFilm');
  const modalTitle = film ? t('editFilm') : t('newFilm');
  const formKey = film ? `edit-${film.id}` : 'create-new';

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <FilmFormContent
        key={formKey}
        film={film}
        onSubmit={onSubmit}
        onClose={onClose}
        isLoading={isLoading}
        error={error}
      />
    </Modal>
  );
}
