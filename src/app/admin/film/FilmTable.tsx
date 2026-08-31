'use client';

import React, { useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { Film, FilmClassificazioneEnum } from 'api-client';
import { Button } from 'ui/atoms/Button/Button';
import { Tag } from 'ui/atoms/Tag/Tag';
import styles from './adminFilm.module.css';

interface FilmTableProps {
  films: Film[];
  onEdit: (film: Film) => void;
  onDelete: (film: Film) => void;
}

const columnHelper = createColumnHelper<Film>();

export function FilmTable({ films, onEdit, onDelete }: FilmTableProps) {
  const t = useTranslations('AdminFilm');
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor('titolo', {
        header: t('tableTitle'),
        cell: (info) => (
          <span className={styles.titleCell}>{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor(
        (row) =>
          row.durataMinuti ||
          (row as unknown as { durata_minuti?: number }).durata_minuti ||
          (row as unknown as { durata?: number }).durata ||
          0,
        {
          id: 'durataMinuti',
          header: t('tableDuration'),
          cell: (info) => t('durationFormat', { minutes: info.getValue() }),
        }
      ),
      columnHelper.accessor('genere', {
        header: t('tableGenre'),
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor(
        (row) =>
          row.classificazione ??
          (row as unknown as { ratingEta?: FilmClassificazioneEnum })
            .ratingEta ??
          'T',
        {
          id: 'classificazione',
          header: t('tableRating'),
          sortingFn: (rowA, rowB, columnId) => {
            const RATING_WEIGHTS: Record<string, number> = {
              T: 1,
              '14+': 2,
              '18+': 3,
            };
            const weightA =
              RATING_WEIGHTS[rowA.getValue<string>(columnId)] ?? 0;
            const weightB =
              RATING_WEIGHTS[rowB.getValue<string>(columnId)] ?? 0;
            return weightA - weightB;
          },
          cell: (info) => {
            const val = info.getValue();
            let variant: 'success' | 'primary' | 'danger' | 'default' =
              'default';
            if (val === 'T') variant = 'success';
            else if (val === '14+') variant = 'primary';
            else if (val === '18+') variant = 'danger';
            return <Tag variant={variant}>{val}</Tag>;
          },
        }
      ),
      columnHelper.display({
        id: 'actions',
        header: t('tableActions'),
        cell: (info) => {
          const film = info.row.original;
          return (
            <div className={styles.actionsCell}>
              <Button
                variant="ghost"
                onClick={() => onEdit(film)}
                aria-label={`${t('edit')} ${film.titolo}`}
              >
                ✏️ {t('edit')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => onDelete(film)}
                aria-label={`${t('delete')} ${film.titolo}`}
              >
                🗑️ {t('delete')}
              </Button>
            </div>
          );
        },
      }),
    ],
    [t, onEdit, onDelete]
  );

  const table = useReactTable({
    data: films,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  if (films.length === 0) {
    return <div className={styles.emptyTable}>{t('noFilms')}</div>;
  }

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isSortable = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();

                  return (
                    <th key={header.id}>
                      {isSortable ? (
                        <div
                          className={styles.sortableHeader}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          <span className={styles.sortIcon}>
                            {sortDir === 'asc'
                              ? ' ▲'
                              : sortDir === 'desc'
                                ? ' ▼'
                                : ' ↕'}
                          </span>
                        </div>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            {t('paginationPage', {
              current: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </div>
          <div className={styles.paginationButtons}>
            <Button
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              {t('paginationPrev')}
            </Button>
            <Button
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t('paginationNext')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
