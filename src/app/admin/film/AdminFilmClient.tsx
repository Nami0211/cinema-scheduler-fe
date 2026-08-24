'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Film, FilmClassificazioneEnum } from 'api-client';
import {
  useGetFilmsQuery,
  useCreateFilmMutation,
  useUpdateFilmMutation,
  useDeleteFilmMutation,
} from 'services/api/filmApi';
import type { AppError } from 'services/baseQuery';
import { Button } from 'ui/atoms/Button/Button';
import { Spinner } from 'ui/atoms/Spinner/Spinner';
import { FilmTable } from './FilmTable';
import { FilmFormModal } from './FilmFormModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import styles from './adminFilm.module.css';

export function AdminFilmClient() {
  const t = useTranslations('AdminFilm');

  const {
    data: films = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFilmsQuery();

  const [createFilm, { isLoading: isCreating, error: createError }] =
    useCreateFilmMutation();
  const [updateFilm, { isLoading: isUpdating, error: updateError }] =
    useUpdateFilmMutation();
  const [deleteFilm, { isLoading: isDeleting }] = useDeleteFilmMutation();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFilm, setEditingFilm] = useState<Film | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingFilm, setDeletingFilm] = useState<Film | null>(null);

  // Success / Global error alert state
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  function handleOpenCreate() {
    setEditingFilm(null);
    setIsFormModalOpen(true);
  }

  function handleOpenEdit(film: Film) {
    setEditingFilm(film);
    setIsFormModalOpen(true);
  }

  function handleOpenDelete(film: Film) {
    setDeletingFilm(film);
    setIsDeleteModalOpen(true);
  }

  async function handleFormSubmit(data: {
    titolo: string;
    durataMinuti: number;
    genere: string;
    classificazione: FilmClassificazioneEnum;
  }) {
    setFeedback(null);
    if (editingFilm) {
      const res = await updateFilm({
        id: editingFilm.id,
        film: data,
      });

      if ('data' in res) {
        setIsFormModalOpen(false);
        setEditingFilm(null);
        setFeedback({ type: 'success', message: t('updatedSuccess') });
      }
    } else {
      const res = await createFilm(data);

      if ('data' in res) {
        setIsFormModalOpen(false);
        setFeedback({ type: 'success', message: t('createdSuccess') });
      }
    }
  }

  async function handleConfirmDelete() {
    if (!deletingFilm) return;
    setFeedback(null);
    const res = await deleteFilm(deletingFilm.id);

    if (!('error' in res)) {
      setIsDeleteModalOpen(false);
      setDeletingFilm(null);
      setFeedback({ type: 'success', message: t('deletedSuccess') });
    }
  }

  const activeFormError = (editingFilm ? updateError : createError) as
    AppError | undefined;

  return (
    <div className={styles.page}>
      {/* Intestazione pagina */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{t('title')}</h1>
          <p className={styles.subtitle}>{t('subtitle')}</p>
        </div>

        <Button variant="primary" onClick={handleOpenCreate}>
          ➕ {t('newFilm')}
        </Button>
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

      {/* Contenuto principale */}
      {isLoading ? (
        <div className={styles.emptyTable}>
          <Spinner />
        </div>
      ) : isError ? (
        <div className={`${styles.alert} ${styles.alertError}`}>
          <span>{(error as AppError)?.message ?? t('errorLoading')}</span>
          <Button variant="secondary" onClick={() => refetch()}>
            {t('retry')}
          </Button>
        </div>
      ) : (
        <FilmTable
          films={films}
          onEdit={handleOpenEdit}
          onDelete={handleOpenDelete}
        />
      )}

      {/* Modale Creazione / Modifica */}
      <FilmFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingFilm(null);
        }}
        film={editingFilm}
        onSubmit={handleFormSubmit}
        isLoading={isCreating || isUpdating}
        error={activeFormError}
      />

      {/* Modale Conferma Eliminazione */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingFilm(null);
        }}
        film={deletingFilm}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
