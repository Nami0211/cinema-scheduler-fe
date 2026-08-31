/**
 * Test per src/utils/date.ts
 *
 * I test verificano che tutte le funzioni usino Europe/Rome come fuso
 * di riferimento, indipendentemente dal TZ del processo Node.
 *
 * Per simulare un client fuori dall'Italia viene usato TZ=America/New_York
 * nella riga di script: "test": "TZ=America/New_York vitest run"
 */

import { describe, it, expect } from 'vitest';
import {
  getTodayString,
  getGiorniSettimanaCorrente,
  parseLocalInputToUtcIso,
  formatUtcToLocalTime,
} from './date';

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Istante UTC che in Europe/Rome è esattamente 2024-01-15 18:00 CET (UTC+1). */
const ROME_18_JAN2024_UTC = new Date('2024-01-15T17:00:00.000Z');

// ─── getTodayString ──────────────────────────────────────────────────────────

describe('getTodayString', () => {
  it('restituisce la data nel fuso Europe/Rome, non quella locale del client', () => {
    // Questo istante è 2024-01-15 alle 23:30 UTC.
    // In America/New_York è ancora 2024-01-15 (18:30).
    // In Europe/Rome è già 2024-01-16 (00:30 CET).
    const utcMidnightEdge = new Date('2024-01-15T23:30:00.000Z');

    expect(getTodayString(utcMidnightEdge)).toBe('2024-01-16');
  });

  it('restituisce la data corretta per un istante ordinario di Roma', () => {
    expect(getTodayString(ROME_18_JAN2024_UTC)).toBe('2024-01-15');
  });

  it('gestisce correttamente il cambio mese in ora legale (estate)', () => {
    // 2024-06-30 ore 23:30 UTC → in Roma è 2024-07-01 01:30 CEST
    const edgeJuneJuly = new Date('2024-06-30T23:30:00.000Z');
    expect(getTodayString(edgeJuneJuly)).toBe('2024-07-01');
  });
});

// ─── getGiorniSettimanaCorrente ───────────────────────────────────────────────

describe('getGiorniSettimanaCorrente', () => {
  it('restituisce una settimana Lun–Dom usando il fuso Europe/Rome', () => {
    // 2024-01-15T17:00Z → lunedì 15 gennaio 2024 ore 18:00 a Roma
    const giorni = getGiorniSettimanaCorrente(ROME_18_JAN2024_UTC);

    expect(giorni).toHaveLength(7);
    expect(giorni[0]).toBe('2024-01-15'); // Lunedì
    expect(giorni[6]).toBe('2024-01-21'); // Domenica
  });

  it('usa il giorno corretto di Roma per una domenica a mezzanotte UTC+', () => {
    // 2024-01-14T23:30:00Z → domenica 14 gen 23:30 UTC → già lunedì 15 a Roma? NO:
    // Roma è UTC+1, quindi 23:30 UTC = 00:30 del 15 gen a Roma → domenica 14 gen era alle 22:29 UTC
    // Verifichiamo: 2024-01-14T22:00:00Z → domenica 14 gen 23:00 Roma → settimana deve iniziare il 8 gen
    const domenica14Roma = new Date('2024-01-14T22:00:00.000Z');
    const giorni = getGiorniSettimanaCorrente(domenica14Roma);

    expect(giorni[0]).toBe('2024-01-08'); // Lunedì della settimana della domenica 14
    expect(giorni[6]).toBe('2024-01-14'); // Domenica 14
  });

  it('è coerente con getTodayString', () => {
    const ref = ROME_18_JAN2024_UTC;
    const giorni = getGiorniSettimanaCorrente(ref);
    const oggi = getTodayString(ref);

    expect(giorni).toContain(oggi);
  });
});

// ─── parseLocalInputToUtcIso ─────────────────────────────────────────────────

describe('parseLocalInputToUtcIso', () => {
  it('interpreta 18:00 come ora di Roma in ora solare (CET = UTC+1)', () => {
    // 15 gennaio 2024 ore 18:00 CET → UTC 17:00
    const result = parseLocalInputToUtcIso('2024-01-15', '18:00');
    expect(result).toBe('2024-01-15T17:00:00.000Z');
  });

  it('interpreta 18:00 come ora di Roma in ora legale (CEST = UTC+2)', () => {
    // 10 luglio 2024 ore 18:00 CEST → UTC 16:00
    const result = parseLocalInputToUtcIso('2024-07-10', '18:00');
    expect(result).toBe('2024-07-10T16:00:00.000Z');
  });

  it("il round-trip parseLocalInputToUtcIso → formatUtcToLocalTime restituisce l'orario originale", () => {
    const iso = parseLocalInputToUtcIso('2024-01-15', '18:00');
    expect(formatUtcToLocalTime(iso)).toBe('18:00');
  });

  it('il round-trip funziona anche in ora legale', () => {
    const iso = parseLocalInputToUtcIso('2024-07-10', '18:00');
    expect(formatUtcToLocalTime(iso)).toBe('18:00');
  });

  it('restituisce stringa vuota per input mancanti', () => {
    expect(parseLocalInputToUtcIso('', '18:00')).toBe('');
    expect(parseLocalInputToUtcIso('2024-01-15', '')).toBe('');
    expect(parseLocalInputToUtcIso('', '')).toBe('');
  });

  it('restituisce stringa vuota per input malformati', () => {
    expect(parseLocalInputToUtcIso('not-a-date', '18:00')).toBe('');
    expect(parseLocalInputToUtcIso('2024-01-15', 'xx:yy')).toBe('');
  });
});
