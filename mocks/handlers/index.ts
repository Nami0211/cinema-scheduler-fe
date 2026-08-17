import { http, HttpResponse } from 'msw';
import films from '../fixtures/film.json';

// RTK Query chiama sempre path relativi tipo /api/films.
// Il browser li risolve come http://localhost:3000/api/films (same-origin).
// MSW può intercettarli senza problemi di cross-origin.

export const handlers = [
  http.get('http://localhost:3000/api/films', () => {
    return HttpResponse.json({
      items: films,
      total: films.length,
      page: 1,
      pageSize: films.length,
    });
  }),

  http.get('http://localhost:3000/api/films/:id', ({ params }) => {
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
];
