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
