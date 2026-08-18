# Mock e fixture

Questa cartella permette di sviluppare e testare il frontend **senza il backend attivo**. Non è un ripiego: il backend è sviluppato in parallelo da un'altra persona, e dipendere dalla sua disponibilità per poter scrivere una pagina è il modo più veloce per bloccarsi.

## Cosa c'è dentro

| Percorso                 | Contenuto                                                      | Da fare in   |
| ------------------------ | -------------------------------------------------------------- | ------------ |
| `fixtures/`              | Dati di dominio in JSON, derivati dai dati di seed del backend | già presente |
| `openapi-reference.json` | Spec OpenAPI di riferimento, **temporaneo**                    | già presente |
| `handlers/`              | Handler MSW che servono le fixture                             | issue #6     |
| `mockFactory/`           | Factory `factory.ts` + `@faker-js/faker` per i test            | issue #6     |

## Le fixture

Sono la conversione in JSON (camelCase) dei CSV di seed del backend, in `init-data/` del repository `cinema-scheduler-be`. **Sono gli stessi dati** che il backend carica nel proprio database: lo scenario mockato e quello reale coincidono, quindi quello che vedi in modalità mock è quello che vedrai col backend attivo.

| File                | Record | Note                                                         |
| ------------------- | ------ | ------------------------------------------------------------ |
| `cinema.json`       | 1      | Multiplex Aurora                                             |
| `sale.json`         | 4      | Sala 1 (18×10), Sala 2 (12×10), Sala 3 (9×10), Sala 4 (10×6) |
| `film.json`         | 8      | Con `durataMinuti`, `genere`, `ratingEta`                    |
| `proiezioni.json`   | 78     | Palinsesto dal 2026-08-03 al 2026-08-09, orari in UTC        |
| `prenotazioni.json` | 1709   | Di cui 1542 attive; i posti sono annidati in `posti[]`       |
| `utenti.json`       | 16     | 1 `admin`, 15 `customer`; **senza** password hash            |

Alcune cose da sapere prima di usarle:

- **Gli orari sono in UTC** (`2026-08-03T18:10:00Z`), come li restituisce il backend. La conversione in ora locale è compito del frontend: è il punto in cui nascono i bug che si vedono solo in produzione, al cambio dell'ora legale.
- **Le prenotazioni cancellate ci sono.** Uno stato `cancelled` non occupa il posto: filtrarle o no è una decisione, e sbagliarla si vede subito sulla mappa dei posti.
- **Il volume è realistico di proposito.** 78 proiezioni e oltre 1700 prenotazioni servono a far emergere i problemi di rendering della Milestone 5. Non ridurre il dataset per far andare la pagina più veloce: è il dataset il punto.
- **Le password non ci sono.** Per il login serve il backend reale, oppure un handler MSW che accetta credenziali note (definiscilo tu nella issue #6, ed è bene che i mock rendano facile impersonare sia un `customer` sia l'`admin`).

Le fixture sono dati di riferimento: **non modificarle** per far passare un caso. Se ti serve uno scenario diverso (una sala piena, una proiezione senza prenotazioni, un utente senza prenotazioni), costruiscilo con le factory nei test — è esattamente il motivo per cui esistono.

## Lo spec OpenAPI di riferimento

`openapi-reference.json` è uno spec **minimo e non autoritativo**, scritto solo per sbloccare la issue #4 quando il backend non espone ancora il proprio `/openapi.json`.

Descrive gli endpoint previsti dalle issue del backend (auth, film, sale, proiezioni, disponibilità posti, prenotazioni, report di occupazione) con i nomi dei campi delle fixture.

**Va abbandonato appena il backend è disponibile.** Le forme reali quasi certamente differiranno in qualche dettaglio: quando succede, la fonte di verità è il backend, non questo file. Se una PR usa ancora lo spec di riferimento, deve dirlo esplicitamente.

## Casi di errore da mockare

I mock servono soprattutto a riprodurre a comando i casi che col backend reale sono difficili da ottenere — e sono quelli in cui l'interfaccia sbaglia più spesso. Prevedi almeno:

- **`409` su prenotazione**: un posto preso da qualcun altro tra il caricamento della mappa e la conferma (issue #13)
- **`409` su creazione proiezione**: sovrapposizione con una proiezione esistente nella stessa sala (issue #10)
- **`400` di validazione** con dettagli per campo (issue #9)
- **`401` a sessione scaduta** (issue #11)
- **Risposta lenta** (2-3 secondi) per vedere davvero gli stati di caricamento
- **`500`** per verificare che l'interfaccia non lasci la pagina bianca

## Rigenerare le fixture

Se il backend cambia i dati di seed, le fixture si rigenerano dai CSV di `init-data/` del repository backend. La conversione è meccanica: CSV → JSON, `snake_case` → `camelCase`, e i posti prenotati annidati dentro la prenotazione di appartenenza.
