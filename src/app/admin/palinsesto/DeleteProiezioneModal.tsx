'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { ProiezioneArricchita } from 'services/api/proiezioniApi';
import type { AppError } from 'services/baseQuery';
import { Modal } from 'ui/molecules/Modal';
import { Button } from 'ui/atoms/Button/Button';
import { formatUtcToLocalTime } from 'utils/date';
import styles from './adminPalinsesto.module.css';

interface DeleteProiezioneModalProps {
  isOpen: boolean;
  onClose: () => void;
  proiezione: ProiezioneArricchita | null;
  onConfirm: () => void;
  isLoading: boolean;
  error?: AppError;
}

export function DeleteProiezioneModal({
  isOpen,
  onClose,
  proiezione,
  onConfirm,
  isLoading,
  error,
}: DeleteProiezioneModalProps) {
  const t = useTranslations('AdminPalinsesto');

  if (!proiezione) return null;

  const filmTitolo = proiezione.film?.titolo ?? t('defaultFilm');
  const salaNome =
    proiezione.sala?.nome ?? t('defaultSala', { id: proiezione.salaId });
  const oraInizio = formatUtcToLocalTime(proiezione.dataOraInizio);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('confirmDeleteTitle')}
      footer={
        <div className={styles.footerActions}>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button variant="primary" onClick={onConfirm} isLoading={isLoading}>
            {isLoading ? t('deleting') : t('confirmDelete')}
          </Button>
        </div>
      }
    >
      {error && (
        <div className={`${styles.alert} ${styles.alertError}`} role="alert">
          <span>{error.message}</span>
        </div>
      )}
      <p className={styles.calcRow}>
        {t('confirmDeleteMessage', {
          film: filmTitolo,
          sala: salaNome,
          time: oraInizio,
        })}
      </p>
    </Modal>
  );
}
