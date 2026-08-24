'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type { Film } from 'api-client';
import { Modal } from 'ui/molecules/Modal';
import { Button } from 'ui/atoms/Button/Button';
import styles from './adminFilm.module.css';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  film?: Film | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  film,
  onConfirm,
  isLoading,
}: DeleteConfirmModalProps) {
  const t = useTranslations('AdminFilm');

  if (!film) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('confirmDeleteTitle')}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            {t('cancel')}
          </Button>
          <Button
            variant="secondary"
            onClick={onConfirm}
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? t('deleting') : t('confirmDelete')}
          </Button>
        </>
      }
    >
      <p className={styles.confirmText}>
        {t('confirmDeleteMessage', { titolo: film.titolo })}
      </p>
    </Modal>
  );
}
