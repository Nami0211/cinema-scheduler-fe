import { faker } from '@faker-js/faker';
import type { Film } from 'api-client/typescript-fetch-client';
import type { Genere } from 'api-client/typescript-fetch-client';
import type { RatingEta } from 'api-client/typescript-fetch-client';

export const buildFilm = (overrides?: Partial<Film>): Film => {
  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    titolo: faker.lorem.words(3),
    durataMinuti: faker.number.int({ min: 60, max: 180 }),
    genere: faker.helpers.arrayElement([
      'Azione',
      'Commedia',
      'Drammatico',
      'Fantascienza',
      'Horror',
      'Romantico',
    ]) as Genere,
    ratingEta: faker.helpers.arrayElement(['T', '14+', '18+']) as RatingEta,
    ...overrides,
  };
};
