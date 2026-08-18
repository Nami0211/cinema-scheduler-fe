import { http, HttpResponse } from 'msw';
import films from '../fixtures/film.json';

export const handlers = [
  http.get('*/api/films', () => {
    return HttpResponse.json({
      items: films,
      total: films.length,
      page: 1,
      pageSize: films.length,
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
];
