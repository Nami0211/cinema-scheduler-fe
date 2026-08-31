'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useGetSaleQuery } from 'services/api/saleApi';
import { useGetFilmsQuery } from 'services/api/filmApi';
import {
  useGetProiezioniByDataQuery,
  useCreateProiezioneMutation,
  useDeleteProiezioneMutation,
} from 'services/api/proiezioniApi';
import type { ProiezioneArricchita } from 'services/api/proiezioniApi';
import type { ProiezioniPostRequest } from 'api-client';
import type { AppError } from 'services/baseQuery';
import { Button } from 'ui/atoms/Button/Button';
import { Spinner } from 'ui/atoms/Spinner/Spinner';
import { getTodayString } from 'utils/date';
import { AdminSubNav } from '../AdminSubNav';
import { HallTimelineView } from './HallTimelineView';
import { ProiezioneFormModal } from './ProiezioneFormModal';
import { DeleteProiezioneModal } from './DeleteProiezioneModal';
import styles from './adminPalinsesto.module.css';

export function AdminPalinsestoClient() {
  const t = useTranslations('AdminPalinsesto');

  const [selectedDate, setSelectedDate] = useState<string>(() =>
    getTodayString()
  );

  const { data: sale = [], isLoading: isLoadingSale } = useGetSaleQuery();
  const { data: films = [], isLoading: isLoadingFilms } = useGetFilmsQuery();
  const {
    data: proiezioni = [],
    isLoading: isLoadingProiezioni,
    isError: isErrorProiezioni,
    error: errorProiezioni,
    refetch,
  } = useGetProiezioniByDataQuery(selectedDate);

  const [createProiezione, { isLoading: isCreating, error: createError }] =
    useCreateProiezioneMutation();

  const [deleteProiezione, { isLoading: isDeleting }] =
    useDeleteProiezioneMutation();

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingProiezione, setDeletingProiezione] =
    useState<ProiezioneArricchita | null>(null);

  // Feedback banner
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function handleOpenCreate() {
    setIsFormModalOpen(true);
  }

  function handleOpenDelete(p: ProiezioneArricchita) {
    setDeletingProiezione(p);
    setIsDeleteModalOpen(true);
  }

  async function handleCreateSubmit(data: ProiezioniPostRequest) {
    setFeedback(null);
    const res = await createProiezione(data);

    if ('data' in res) {
      setIsFormModalOpen(false);
      setFeedback({ type: 'success', message: t('createdSuccess') });
    }
  }

  async function handleConfirmDelete() {
    if (!deletingProiezione) return;
    setFeedback(null);
    const res = await deleteProiezione(deletingProiezione.id);

    if (!('error' in res)) {
      setIsDeleteModalOpen(false);
      setDeletingProiezione(null);
      setFeedback({ type: 'success', message: t('deletedSuccess') });
    }
  }

  const isLoading = isLoadingSale || isLoadingFilms || isLoadingProiezioni;

  return (
    <div className={styles.page}>
      <AdminSubNav />

      {/* Intestazione */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          ➕ {t('newProiezione')}
        </Button>
      </div>

      {/* Controlli data e filtri */}
      <div className={styles.controlsRow}>
        <div className={styles.datePickerGroup}>
          <label
            htmlFor="palinsesto-date-picker"
            className={styles.datePickerLabel}
          >
            📅 {t('datePickerLabel')}:
          </label>
          <input
            id="palinsesto-date-picker"
            type="date"
            className={styles.dateInput}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* Banner Feedback esito */}
      {feedback && (
        <div
          className={`${styles.alert} ${
            feedback.type === 'success'
              ? styles.alertSuccess
              : styles.alertError
          }`}
          role="status"
        >
          <span>{feedback.message}</span>
          <Button variant="ghost" onClick={() => setFeedback(null)}>
            &times;
          </Button>
        </div>
      )}

      {/* Timeline Giornaliera per Sala */}
      {isLoading ? (
        <div className={styles.emptyHall}>
          <Spinner />
        </div>
      ) : isErrorProiezioni ? (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <span>
            {(errorProiezioni as AppError)?.message ?? t('errorLoading')}
          </span>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : (
        <HallTimelineView
          sale={sale}
          films={films}
          proiezioni={proiezioni}
          onDeleteProiezione={handleOpenDelete}
        />
      )}

      {/* Modale Creazione Proiezione */}
      <ProiezioneFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleCreateSubmit}
        films={films}
        sale={sale}
        initialDate={selectedDate}
        isLoading={isCreating}
        error={createError as AppError | undefined}
      />

      {/* Modale Conferma Eliminazione Proiezione */}
      <DeleteProiezioneModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingProiezione(null);
        }}
        proiezione={deletingProiezione}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
