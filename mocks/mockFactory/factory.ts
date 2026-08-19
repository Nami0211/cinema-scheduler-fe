import { faker } from '@faker-js/faker';
import {
  Genere,
  RatingEta,
  Ruolo,
  StatoPrenotazione,
  type Film,
  type Posto,
  type Prenotazione,
  type Proiezione,
  type Sala,
  type Utente,
} from 'api-client/typescript-fetch-client';

export const buildFilm = (overrides?: Partial<Film>): Film => ({
  id: faker.number.int({ min: 1, max: 1000 }),
  titolo: faker.lorem.words(3),
  durataMinuti: faker.number.int({ min: 60, max: 180 }),
  genere: faker.helpers.arrayElement(Object.values(Genere)),
  ratingEta: faker.helpers.arrayElement(Object.values(RatingEta)),
  ...overrides,
});

export const buildSala = (overrides?: Partial<Sala>): Sala => {
  const righe = faker.number.int({ min: 6, max: 18 });
  const colonne = faker.number.int({ min: 6, max: 10 });
  return {
    id: faker.number.int({ min: 1, max: 100 }),
    cinemaId: 1,
    nome: `Sala ${faker.number.int({ min: 1, max: 10 })}`,
    righe,
    colonne,
    capienza: righe * colonne,
    ...overrides,
  };
};

export const buildProiezione = (
  overrides?: Partial<Proiezione>
): Proiezione => {
  const dataOraInizio = faker.date.soon({ days: 7 });
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    filmId: faker.number.int({ min: 1, max: 8 }),
    salaId: faker.number.int({ min: 1, max: 4 }),
    dataOraInizio,
    dataOraFine: new Date(dataOraInizio.getTime() + 120 * 60_000),
    ...overrides,
  };
};

export const buildPosto = (overrides?: Partial<Posto>): Posto => ({
  riga: faker.number.int({ min: 1, max: 18 }),
  colonna: faker.number.int({ min: 1, max: 10 }),
  ...overrides,
});

export const buildPrenotazione = (
  overrides?: Partial<Prenotazione>
): Prenotazione => ({
  id: faker.number.int({ min: 1, max: 2000 }),
  proiezioneId: faker.number.int({ min: 1, max: 78 }),
  utenteId: faker.number.int({ min: 1, max: 16 }),
  stato: faker.helpers.arrayElement(Object.values(StatoPrenotazione)),
  createdAt: faker.date.recent(),
  posti: faker.helpers.multiple(() => buildPosto(), {
    count: { min: 1, max: 4 },
  }),
  ...overrides,
});

export const buildUtente = (overrides?: Partial<Utente>): Utente => ({
  id: faker.number.int({ min: 1, max: 100 }),
  email: faker.internet.email(),
  nome: faker.person.firstName(),
  cognome: faker.person.lastName(),
  ruolo: faker.helpers.arrayElement(Object.values(Ruolo)),
  ...overrides,
});
