import { http, HttpResponse } from 'msw';
import films from '../fixtures/film.json';
import proiezioniRaw from '../fixtures/proiezioni.json';
import saleRaw from '../fixtures/sale.json';

// RTK Query chiama sempre path relativi tipo /api/films.
// Il browser li risolve come http://localhost:3000/api/films (same-origin).
// MSW può intercettarli senza problemi di cross-origin.

/**
 * Converte una stringa ISO UTC in una data locale italiana (Europe/Rome).
 * Restituisce una stringa "YYYY-MM-DD" nel fuso orario italiano.
 */
function toItalianDateString(isoUtc: string): string {
  return new Date(isoUtc).toLocaleDateString('sv-SE', {
    timeZone: 'Europe/Rome',
  });
}

export const handlers = [
  // ─── Film ────────────────────────────────────────────────────────────────

  http.get('/api/films', () => {
    return HttpResponse.json({
      items: films,
      total: films.length,
      page: 1,
      pageSize: films.length,
    });
  }),

  http.get('/api/films/:id', ({ params }) => {
    const id = Number(params.id);
    const film = films.find((f: { id: number }) => f.id === id);

    if (!film) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Film non trovato' } },
        { status: 404 }
      );
    }

    return HttpResponse.json(film);
  }),

  // ─── Sale ─────────────────────────────────────────────────────────────────

  http.get('/api/sale', () => {
    return HttpResponse.json({
      items: saleRaw,
      total: saleRaw.length,
    });
  }),

  // ─── Proiezioni per data ──────────────────────────────────────────────────

  http.get('/api/proiezioni', ({ request }) => {
    const url = new URL(request.url);
    const dataParam = url.searchParams.get('data'); // atteso: "YYYY-MM-DD"

    // Costruiamo una mappa id → film e id → sala per il join in-memory
    const filmMap = Object.fromEntries(films.map((f) => [f.id, f]));
    const salaMap = Object.fromEntries(saleRaw.map((s) => [s.id, s]));

    let risultato = proiezioniRaw;

    if (dataParam) {
      risultato = proiezioniRaw.filter((p) => {
        const giornoProiezione = toItalianDateString(p.dataOraInizio);
        return giornoProiezione === dataParam;
      });
    }

    // Arricchisce ogni proiezione con film e sala annidati (come farebbe il
    // backend con una query con JOIN), in modo che il client non debba
    // fare richieste separate.
    const arricchito = risultato.map((p) => ({
      ...p,
      film: filmMap[p.filmId] ?? null,
      sala: salaMap[p.salaId] ?? null,
    }));

    return HttpResponse.json({
      items: arricchito,
      total: arricchito.length,
    });
  }),
];
