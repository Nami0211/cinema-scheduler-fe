/**
 * Utility per la gestione delle date del palinsesto.
 */

/**
 * Restituisce la data in formato YYYY-MM-DD.
 */
export function getTodayString(refDate: Date = new Date()): string {
  const d = new Date(refDate);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const dayStr = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

/**
 * Calcola i 7 giorni della settimana corrente (da Lunedì a Domenica) in formato YYYY-MM-DD.
 */
export function getGiorniSettimanaCorrente(
  refDate: Date = new Date()
): string[] {
  const date = new Date(refDate);
  const day = date.getDay(); // 0 = Domenica, 1 = Lunedì, ..., 6 = Sabato
  // Quanti giorni sottrarre per arrivare al Lunedì
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(date);
  monday.setDate(date.getDate() + diffToMonday);

  const giorni: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    giorni.push(getTodayString(d));
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
 * Converte una data locale YYYY-MM-DD ed un orario locale HH:mm in una stringa ISO in formato UTC.
 */
export function parseLocalInputToUtcIso(
  dateStr: string,
  timeStr: string
): string {
  if (!dateStr || !timeStr) return '';
  const localDate = new Date(`${dateStr}T${timeStr}:00`);
  if (isNaN(localDate.getTime())) return '';
  return localDate.toISOString();
}
