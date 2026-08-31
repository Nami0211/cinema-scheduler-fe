/**
 * Utility per la gestione delle date del palinsesto.
 *
 * IMPORTANTE – Fuso orario di riferimento:
 * Tutte le funzioni di questa utility usano esplicitamente 'Europe/Rome' come
 * fuso di palinsesto, indipendentemente dal fuso del browser del client.
 * - Le funzioni che estraggono componenti di data (anno/mese/giorno) usano
 *   Intl.DateTimeFormat con timeZone: 'Europe/Rome'.
 * - parseLocalInputToUtcIso() tratta l'input HH:mm come orario di Roma e
 *   calcola l'offset UTC corretto (gestendo automaticamente ora solare/legale).
 */

/** Fuso orario di riferimento per il palinsesto. */
const PALINSESTO_TZ = 'Europe/Rome';

/**
 * Restituisce i componenti anno/mese/giorno di una Date nel fuso Europe/Rome.
 * Uso interno; non esposta come API pubblica.
 */
function getRomeDateParts(d: Date): {
  year: number;
  month: number;
  day: number;
} {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: PALINSESTO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  // en-CA produce YYYY-MM-DD
  const [year, month, day] = fmt.format(d).split('-').map(Number);
  return { year, month, day };
}

/**
 * Restituisce la data corrente (o quella passata come riferimento)
 * nel fuso Europe/Rome, in formato YYYY-MM-DD.
 */
export function getTodayString(refDate: Date = new Date()): string {
  const { year, month, day } = getRomeDateParts(refDate);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/**
 * Calcola i 7 giorni della settimana corrente (da Lunedì a Domenica) in formato YYYY-MM-DD,
 * nel fuso Europe/Rome.
 */
export function getGiorniSettimanaCorrente(
  refDate: Date = new Date()
): string[] {
  // Ricaviamo il giorno della settimana di Roma tramite Intl (0 = Dom … 6 = Sab).
  const dowFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: PALINSESTO_TZ,
    weekday: 'short',
  });
  // Mappa il nome abbreviato en-US al numero ISO (1 = Lun … 7 = Dom).
  const dowMap: Record<string, number> = {
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
    Sun: 7,
  };
  const romeDoW = dowMap[dowFormatter.format(refDate)] ?? 1; // 1-7, Lun=1

  // Giorni da sottrarre per arrivare al Lunedì di Roma.
  const diffToMonday = -(romeDoW - 1); // Lun → 0, Mar → -1, …, Dom → -6

  // Partiamo dalla data di Roma ed aggiungiamo offset interi di giorni.
  const { year, month, day } = getRomeDateParts(refDate);
  // Usiamo UTC-midnight come ancora numerica (i componenti Y/M/D sono già di Roma).
  const romeAnchorMs = Date.UTC(year, month - 1, day);

  const giorni: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayMs = romeAnchorMs + (diffToMonday + i) * 86_400_000;
    const { year: y, month: mo, day: d } = getRomeDateParts(new Date(dayMs));
    giorni.push(
      `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    );
  }
  return giorni;
}

/**
 * Valida il parametro data dall'URL.
 * Se la data non è valida o non è nei giorni disponibili,
 * ritorna la data odierna (se disponibile) oppure il primo giorno della settimana.
 */
export function getDataValida(
  dataParam: string | undefined,
  giorniDisponibili: string[],
  refDate: Date = new Date()
): string {
  if (dataParam && giorniDisponibili.includes(dataParam)) {
    return dataParam;
  }
  const todayStr = getTodayString(refDate);
  if (giorniDisponibili.includes(todayStr)) {
    return todayStr;
  }
  return giorniDisponibili[0];
}

/** Buffer di pulizia standard tra due proiezioni nella stessa sala (in minuti) */
export const BUFFER_PULIZIA_MINUTI = 15;

/**
 * Formatta una data ISO UTC (o oggetto Date) nel fuso orario italiano (Europe/Rome) in formato HH:mm.
 */
export function formatUtcToLocalTime(isoUtcString: string | Date): string {
  if (!isoUtcString) return '';
  const d =
    typeof isoUtcString === 'string' ? new Date(isoUtcString) : isoUtcString;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formatta una data ISO UTC (o oggetto Date) nel fuso orario italiano (Europe/Rome) in formato YYYY-MM-DD.
 */
export function formatUtcToLocalDate(isoUtcString: string | Date): string {
  if (!isoUtcString) return '';
  const d =
    typeof isoUtcString === 'string' ? new Date(isoUtcString) : isoUtcString;
  if (isNaN(d.getTime())) return '';
  // Utilizza Intl per ricavare anno, mese e giorno nel fuso italiano
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Rome',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
}

/**
 * Calcola l'orario di fine film ed il termine dell'occupazione della sala (film + buffer 15m).
 */
export function calculateFineProiezione(
  dataOraInizioUtcIso: string | Date,
  durataMinuti: number
): { dataOraFineUtc: string; fineOccupazioneUtc: string } {
  const start = new Date(dataOraInizioUtcIso);
  if (isNaN(start.getTime()) || durataMinuti <= 0) {
    return { dataOraFineUtc: '', fineOccupazioneUtc: '' };
  }

  const fineFilmMs = start.getTime() + durataMinuti * 60 * 1000;
  const fineOccupazioneMs =
    start.getTime() + (durataMinuti + BUFFER_PULIZIA_MINUTI) * 60 * 1000;

  return {
    dataOraFineUtc: new Date(fineFilmMs).toISOString(),
    fineOccupazioneUtc: new Date(fineOccupazioneMs).toISOString(),
  };
}

/**
 * Converte una data YYYY-MM-DD e un orario HH:mm espressi nel fuso Europe/Rome
 * in una stringa ISO UTC.
 *
 * L'algoritmo calcola l'offset UTC di Roma per quell'istante preciso tramite
 * Intl.DateTimeFormat, gestendo automaticamente ora solare/legale (CET/CEST).
 * Il risultato è corretto indipendentemente dal fuso orario del browser del client.
 */
export function parseLocalInputToUtcIso(
  dateStr: string,
  timeStr: string
): string {
  if (!dateStr || !timeStr) return '';

  // Passo 1: costruiamo un timestamp approssimativo assumendo UTC, poi
  // ricaviamo l'offset reale di Roma in quell'istante (gestisce DST).
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  if (
    isNaN(year) ||
    isNaN(month) ||
    isNaN(day) ||
    isNaN(hours) ||
    isNaN(minutes)
  ) {
    return '';
  }

  // Timestamp UTC grezzo (come se Roma fosse UTC+0, usato solo per trovare l'offset).
  const approxUtcMs = Date.UTC(year, month - 1, day, hours, minutes, 0);

  // Calcola l'offset UTC di Europe/Rome per quell'istante.
  const romeOffsetMinutes = getRomeUtcOffsetMinutes(new Date(approxUtcMs));

  // Sottrae l'offset per ottenere l'UTC reale corrispondente all'ora romana.
  const utcMs = approxUtcMs - romeOffsetMinutes * 60 * 1000;
  const result = new Date(utcMs);

  if (isNaN(result.getTime())) return '';
  return result.toISOString();
}

/**
 * Restituisce l'offset UTC di Europe/Rome in minuti per un dato istante.
 * Valori positivi = est di UTC (es. CET = +60, CEST = +120).
 * Uso interno.
 */
function getRomeUtcOffsetMinutes(at: Date): number {
  // Costruiamo una stringa che rappresenta l'ora locale di Roma per 'at'.
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: PALINSESTO_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = fmt.formatToParts(at);
  const get = (t: string) =>
    Number(parts.find((p) => p.type === t)?.value ?? '0');

  const romeAsUtcMs = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second')
  );

  // Differenza in minuti tra l'ora "di Roma vista come UTC" e l'UTC reale.
  return Math.round((romeAsUtcMs - at.getTime()) / 60_000);
}
