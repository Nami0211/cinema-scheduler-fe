import { faker } from '@faker-js/faker';
import {
  AuthRuoloEnum,
  type Film,
  type Proiezione,
  type Sale,
  type Prenotazione,
  type Auth,
} from 'api-client';

export type Posto = {
  riga: number;
  colonna: number;
};

export const buildFilm = (overrides?: Partial<Film>): Film => ({
  id: String(faker.number.int({ min: 1, max: 1000 })),
  titolo: faker.lorem.words(3),
  durataMinuti: faker.number.int({ min: 60, max: 180 }),
  genere: faker.helpers.arrayElement([
    'Azione',
    'Animazione',
    'Commedia',
    'Documentario',
    'Drammatico',
    'Fantascienza',
    'Horror',
    'Romantico',
  ]),
  classificazione: faker.helpers.arrayElement(['T', '14+', '18+'] as const),
  creataIl: faker.date.past(),
  aggiornataIl: faker.date.recent(),
  eliminata: false,
  ...overrides,
});

export const buildSala = (overrides?: Partial<Sale>): Sale => {
  const righe = faker.number.int({ min: 6, max: 18 });
  const colonne = faker.number.int({ min: 6, max: 10 });
  return {
    id: String(faker.number.int({ min: 1, max: 100 })),
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
    id: String(faker.number.int({ min: 1, max: 1000 })),
    filmId: String(faker.number.int({ min: 1, max: 8 })),
    salaId: String(faker.number.int({ min: 1, max: 4 })),
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
  id: String(faker.number.int({ min: 1, max: 2000 })),
  proiezioneId: String(faker.number.int({ min: 1, max: 78 })),
  stato: faker.helpers.arrayElement([
    'CONFIRMED',
    'PENDING',
    'CANCELLED',
  ] as const),
  riga: faker.number.int({ min: 1, max: 18 }),
  colonna: faker.number.int({ min: 1, max: 10 }),
  ...overrides,
});

export const buildUtente = (overrides?: Partial<Auth>): Auth => ({
  email: faker.internet.email(),
  password: faker.internet.password(),
  nome: faker.person.firstName(),
  cognome: faker.person.lastName(),
  ruolo: faker.helpers.arrayElement(Object.values(AuthRuoloEnum)),
  ...overrides,
});
