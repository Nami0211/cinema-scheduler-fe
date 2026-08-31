import { http, HttpResponse } from 'msw';
import films from '../fixtures/film.json';
import proiezioni from '../fixtures/proiezioni.json';
import sale from '../fixtures/sale.json';

interface FilmFixture {
  id: number | string;
  titolo: string;
  durataMinuti: number;
  genere: string;
  classificazione: string;
  creata_il?: string;
  aggiornata_il?: string;
  eliminata?: boolean;
}

interface ProiezioneFixture {
  id: number;
  filmId: number | string;
  salaId: number;
  dataOraInizio: string;
  dataOraFine: string;
}

// In-memory list initialized from fixtures
const filmsList: FilmFixture[] = (
  films as unknown as Array<
    FilmFixture & {
      ratingEta?: string;
      durata?: number;
      durata_minuti?: number;
    }
  >
).map((f) => {
  const dur = Number(f.durataMinuti ?? f.durata_minuti ?? f.durata ?? 0);
  const rating = f.classificazione ?? f.ratingEta ?? 'T';
  return {
    ...f,
    durataMinuti: dur,
    durata_minuti: dur,
    classificazione: rating,
    ratingEta: rating,
  };
});

// In-memory proiezioni list initialized from fixtures
const proiezioniList: ProiezioneFixture[] = [
  ...(proiezioni as ProiezioneFixture[]),
];

export const handlers = [
  http.get('*/api/films', () => {
    const activeFilms = filmsList.filter((f) => !f.eliminata);
    return HttpResponse.json({
      items: activeFilms,
      total: activeFilms.length,
      page: 1,
      pageSize: activeFilms.length,
    });
  }),

  // Contratto reale BE: GET /sale → { data: Sale[], meta: {...} }
  http.get('*/api/sale', () => {
    return HttpResponse.json({
      data: sale,
      meta: {
        page: 1,
        limit: sale.length,
        totalRecords: sale.length,
        totalPages: 1,
      },
    });
  }),

  http.get('*/api/films/:id', ({ params }) => {
    const id = params.id;
    const film = filmsList.find(
      (f) => String(f.id) === String(id) && !f.eliminata
    );

    if (!film) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Film non trovato' } },
        { status: 404 }
      );
    }

    return HttpResponse.json(film);
  }),

  http.post('*/api/films', async ({ request }) => {
    const body = (await request.json()) as Partial<FilmFixture>;

    // Trigger mock backend 400 validation error for testing
    if (body.titolo === 'TRIGGER_400') {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dati del film non validi',
            details: {
              titolo: 'Titolo già esistente nel sistema (mock error)',
              durataMinuti: 'La durata deve essere un valore positivo',
            },
          },
        },
        { status: 400 }
      );
    }

    if (
      !body.titolo ||
      !body.durataMinuti ||
      !body.genere ||
      !body.classificazione
    ) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Campi obbligatori mancanti',
            details: {
              titolo: !body.titolo ? 'Il titolo è obbligatorio' : undefined,
              durataMinuti: !body.durataMinuti
                ? 'La durata è obbligatoria'
                : undefined,
            },
          },
        },
        { status: 400 }
      );
    }

    const newFilm: FilmFixture = {
      id: Date.now(),
      titolo: body.titolo,
      durataMinuti: Number(body.durataMinuti),
      genere: body.genere,
      classificazione: body.classificazione,
      creata_il: new Date().toISOString(),
      aggiornata_il: new Date().toISOString(),
      eliminata: false,
    };

    filmsList.push(newFilm);
    return HttpResponse.json(newFilm, { status: 201 });
  }),

  http.patch('*/api/films/:id', async ({ params, request }) => {
    const id = params.id;
    const body = (await request.json()) as Partial<FilmFixture>;
    const filmIndex = filmsList.findIndex((f) => String(f.id) === String(id));

    if (filmIndex === -1) {
      return HttpResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Film non trovato' } },
        { status: 404 }
      );
    }

    if (body.titolo === 'TRIGGER_400') {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Dati del film non validi',
            details: {
              titolo: 'Titolo non valido per la modifica (mock error)',
            },
          },
        },
        { status: 400 }
      );
    }

    const updatedFilm = {
      ...filmsList[filmIndex],
      ...body,
      aggiornata_il: new Date().toISOString(),
    };
    filmsList[filmIndex] = updatedFilm;

    return HttpResponse.json(updatedFilm);
  }),

  http.delete('*/api/films/:id', ({ params }) => {
    const id = params.id;
    const filmIndex = filmsList.findIndex((f) => String(f.id) === String(id));

    if (filmIndex !== -1) {
      filmsList[filmIndex] = { ...filmsList[filmIndex], eliminata: true };
    }

    return new HttpResponse(null, { status: 204 });
  }),

  // Contratto reale BE: GET /proiezioni/palinsesto/{data}
  http.get('*/api/proiezioni/palinsesto/:data', ({ params }) => {
    const data = params.data as string;

    let matches: ProiezioneFixture[] = proiezioniList.filter((p) =>
      p.dataOraInizio.startsWith(data)
    );

    if (matches.length === 0 && /^\d{4}-\d{2}-\d{2}$/.test(data)) {
      const reqDate = new Date(`${data}T00:00:00Z`);
      const dayOfWeek = reqDate.getUTCDay();
      const fixtureDayNumber = dayOfWeek === 0 ? 9 : 2 + dayOfWeek;
      const fixtureDateStr = `2026-08-${String(fixtureDayNumber).padStart(2, '0')}`;

      const fixtureMatches = proiezioniList.filter((p) =>
        p.dataOraInizio.startsWith(fixtureDateStr)
      );

      matches = fixtureMatches.map((p) => ({
        ...p,
        dataOraInizio: p.dataOraInizio.replace(fixtureDateStr, data),
        dataOraFine: p.dataOraFine.replace(fixtureDateStr, data),
      }));
    }

    const items = matches.map((p) => {
      const film = filmsList.find((f) => String(f.id) === String(p.filmId));
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

  http.post('*/api/proiezioni', async ({ request }) => {
    const body = (await request.json()) as {
      filmId?: number | string;
      film_id?: number | string;
      salaId?: number | string;
      sala_id?: number | string;
      dataOraInizio?: string;
      data_ora_inizio?: string;
    };

    // Il BE reale usa snake_case; supportiamo entrambi per compatibilità con il mock
    const filmId = Number(body.filmId ?? body.film_id);
    const salaId = Number(body.salaId ?? body.sala_id);
    const dataOraInizio = body.dataOraInizio ?? body.data_ora_inizio;

    if (!filmId || !salaId || !dataOraInizio) {
      return HttpResponse.json(
        {
          error: {
            code: 'VALIDATION_ERROR',
            message:
              'Tutti i campi (film, sala, data/ora inizio) sono obbligatori.',
          },
        },
        { status: 400 }
      );
    }

    const film = filmsList.find((f) => Number(f.id) === filmId && !f.eliminata);
    if (!film) {
      return HttpResponse.json(
        {
          error: { code: 'NOT_FOUND', message: 'Film selezionato non trovato' },
        },
        { status: 404 }
      );
    }

    const durataMinuti = film.durataMinuti;
    const newStartMs = new Date(dataOraInizio).getTime();
    const newEndFilmMs = newStartMs + durataMinuti * 60 * 1000;
    const newEndOccupiedMs = newStartMs + (durataMinuti + 15) * 60 * 1000;

    // Check for conflict in the same hall considering 15-minute buffer
    const conflicting = proiezioniList.find((p) => {
      if (Number(p.salaId) !== salaId) return false;

      const pFilm = filmsList.find((f) => Number(f.id) === Number(p.filmId));
      const pDurata = pFilm ? pFilm.durataMinuti : 120;
      const pStartMs = new Date(p.dataOraInizio).getTime();
      const pEndOccupiedMs = pStartMs + (pDurata + 15) * 60 * 1000;

      // Overlap condition: newStart < pEndOccupied AND newEndOccupied > pStart
      return newStartMs < pEndOccupiedMs && newEndOccupiedMs > pStartMs;
    });

    if (conflicting) {
      const cFilm = filmsList.find(
        (f) => Number(f.id) === Number(conflicting.filmId)
      );
      const cDurata = cFilm ? cFilm.durataMinuti : 120;
      const cStartMs = new Date(conflicting.dataOraInizio).getTime();
      const cEndFilmMs = cStartMs + cDurata * 60 * 1000;
      const cEndOccupiedMs = cStartMs + (cDurata + 15) * 60 * 1000;

      const oraInizio = new Date(cStartMs).toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
      });
      const oraFine = new Date(cEndFilmMs).toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
      });
      const oraFineBuffer = new Date(cEndOccupiedMs).toLocaleTimeString(
        'it-IT',
        {
          timeZone: 'Europe/Rome',
          hour: '2-digit',
          minute: '2-digit',
        }
      );

      const salaObj = sale.find((s: { id: number }) => s.id === salaId);
      const salaNome = salaObj ? salaObj.nome : `Sala ${salaId}`;

      return HttpResponse.json(
        {
          error: {
            code: 'CONFLITTO_PROIEZIONE',
            message: `Conflitto in ${salaNome}: il film "${cFilm?.titolo ?? 'in programmazione'}" occupa la sala dalle ${oraInizio} alle ${oraFine} (con buffer pulizia fino alle ${oraFineBuffer}).`,
            details: {
              conflictingProiezioneId: conflicting.id,
              filmTitolo: cFilm?.titolo ?? 'Film sconosciuto',
              salaNome,
              oraInizioLocale: oraInizio,
              oraFineLocale: oraFine,
              oraFineBufferLocale: oraFineBuffer,
            },
          },
        },
        { status: 409 }
      );
    }

    const newProiezione: ProiezioneFixture = {
      id: Date.now(),
      filmId,
      salaId,
      dataOraInizio: new Date(newStartMs).toISOString(),
      dataOraFine: new Date(newEndFilmMs).toISOString(),
    };

    proiezioniList.push(newProiezione);

    const salaObj = sale.find((s: { id: number }) => s.id === salaId);
    return HttpResponse.json(
      {
        ...newProiezione,
        film,
        sala: salaObj,
      },
      { status: 201 }
    );
  }),

  http.delete('*/api/proiezioni/:id', ({ params }) => {
    const id = params.id;
    const index = proiezioniList.findIndex((p) => String(p.id) === String(id));

    if (index !== -1) {
      proiezioniList.splice(index, 1);
    }

    return new HttpResponse(null, { status: 204 });
  }),
];
