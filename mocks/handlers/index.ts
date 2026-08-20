import { http, HttpResponse } from 'msw';
import films from '../fixtures/film.json';
import proiezioni from '../fixtures/proiezioni.json';
import sale from '../fixtures/sale.json';

interface ProiezioneFixture {
  id: number;
  filmId: number;
  salaId: number;
  dataOraInizio: string;
  dataOraFine: string;
}

export const handlers = [
  http.get('*/api/films', () => {
    return HttpResponse.json({
      items: films,
      total: films.length,
      page: 1,
      pageSize: films.length,
    });
  }),

  http.get('*/api/sale', () => {
    return HttpResponse.json({
      items: sale,
      total: sale.length,
      page: 1,
      pageSize: sale.length,
    });
  }),

  http.get('*/api/films/:id', ({ params }) => {
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

  http.get('*/api/proiezioni/palinsesto/:data', ({ params }) => {
    const data = params.data as string;

    let matches: ProiezioneFixture[] = (
      proiezioni as ProiezioneFixture[]
    ).filter((p) => p.dataOraInizio.startsWith(data));

    if (matches.length === 0 && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const reqDate = new Date(`${data}T00:00:00Z`);
      const dayOfWeek = reqDate.getUTCDay();
      const fixtureDayNumber = dayOfWeek === 0 ? 9 : 2 + dayOfWeek;
      const fixtureDateStr = `2026-08-${String(fixtureDayNumber).padStart(2, '0')}`;

      const fixtureMatches = (proiezioni as ProiezioneFixture[]).filter((p) =>
        p.dataOraInizio.startsWith(fixtureDateStr)
      );

      matches = fixtureMatches.map((p) => ({
        ...p,
        dataOraInizio: p.dataOraInizio.replace(fixtureDateStr, data),
        dataOraFine: p.dataOraFine.replace(fixtureDateStr, data),
      }));
    }

    const items = matches.map((p) => {
      const film = films.find((f: { id: number }) => f.id === p.filmId);
      const sala = sale.find((s: { id: number }) => s.id === p.salaId);
      return {
        ...p,
        film,
        sala,
      };
    });

    return HttpResponse.json({
      items,
      total: items.length,
    });
  }),
];
