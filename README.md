# Cinema Scheduler FE — Multiplex Aurora

Interfaccia web per la gestione del palinsesto e delle prenotazioni di Multiplex Aurora, cinema multisala a 4 sale.

Progetto didattico di onboarding: replica lo stack e le convenzioni usate nei progetti frontend reali del team. È il compagno di [`cinema-scheduler-be`](https://github.com/sidmonta/cinema-scheduler-be), che ne espone le API.

> **Questo repository non contiene ancora codice applicativo.** È il punto di partenza dell'esercizio: contiene il contesto di business, le convenzioni, le issue da lavorare e i dati mock. L'applicazione la costruisci tu, a partire dalla issue #1.

## Documenti di riferimento

Prima di iniziare, leggi in ordine:

1. [`PROJECT-CONTEXT.md`](./PROJECT-CONTEXT.md) — chi è Multiplex Aurora, quali problemi risolve l'interfaccia, i vincoli di business e il rapporto con il backend
2. [`CONTRIBUTING.md`](./CONTRIBUTING.md) — workflow, convenzioni di branch/commit/PR, Definition of Done, convenzioni di codice
3. Le issue su GitHub, lavorate in ordine di dipendenza (indicato in ciascuna issue)

Se le issue non sono ancora presenti nel tuo fork, vedi [Bootstrap delle issue](#bootstrap-delle-issue).

## Stack tecnologico

| Ambito                 | Tecnologia                                                  |
| ---------------------- | ----------------------------------------------------------- |
| Framework              | Next.js 14 (App Router)                                     |
| Linguaggio             | TypeScript (strict mode)                                    |
| Stato applicativo      | Redux Toolkit                                               |
| Data fetching e cache  | RTK Query                                                   |
| Client API             | Generato da OpenAPI (`@openapitools/openapi-generator-cli`) |
| Stile                  | CSS Modules + custom properties                             |
| Tema                   | `next-themes` (chiaro/scuro)                                |
| Internazionalizzazione | `next-intl` (locale `it`)                                   |
| Autenticazione         | `next-auth` (Credentials sul backend)                       |
| Tabelle                | `@tanstack/react-table`                                     |
| Virtualizzazione       | `@tanstack/react-virtual`                                   |
| Grafici                | `recharts`                                                  |
| Mock API               | MSW + `factory.ts` + `@faker-js/faker`                      |
| Test                   | Jest + React Testing Library + `jest-axe`                   |
| CI                     | GitHub Actions                                              |

Le librerie sono quelle in uso sul progetto reale del team: l'obiettivo è che alla fine dell'esercizio tu ti muova in un repository di produzione senza dover imparare lo stack da zero.

**Non è previsto un design system esterno**: gli atomi (`Button`, `Input`, `Tag`, …) si scrivono a mano con CSS Modules. Sul progetto reale il design system c'è, ma capire cosa contiene vale più che consumarne uno senza sapere cosa fa.

## Requisiti

- Node.js ≥ 20
- npm
- (opzionale) il backend [`cinema-scheduler-be`](https://github.com/sidmonta/cinema-scheduler-be) in esecuzione in locale — vedi [Lavorare senza backend](#lavorare-senza-backend)

## Setup locale

Il progetto viene inizializzato nella issue #1. Da quel momento in poi il flusso è:

```bash
# 1. Clona il tuo fork
git clone <repo-url>
cd cinema-scheduler-fe

# 2. Installa le dipendenze
npm install

# 3. Copia il file di configurazione
cp .env.example .env.local

# 4. (se il backend è attivo) genera il client tipizzato dallo spec OpenAPI
npm run api:generate

# 5. Avvia l'applicazione in modalità sviluppo
npm run dev
```

L'applicazione parte di default su `http://localhost:3000`. Il backend, se attivo, risponde su `http://localhost:3001` (vedi `NEXT_PUBLIC_API_BASE_URL`).

> Il backend usa la porta `3000` nella sua configurazione di default: se lo esegui in locale insieme al frontend, cambia la porta a uno dei due (`PORT=3001 npm run dev` lato backend è la scelta più semplice).

## Variabili d'ambiente

| Variabile                  | Descrizione                                                                        | Default (sviluppo)                   |
| -------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL del backend                                                               | `http://localhost:3001`              |
| `NEXT_PUBLIC_USE_MOCKS`    | Se `true`, le chiamate API sono intercettate da MSW e servite dalle fixture locali | `false`                              |
| `OPENAPI_SPEC_URL`         | URL da cui `api:generate` scarica lo spec OpenAPI                                  | `http://localhost:3001/openapi.json` |
| `NEXTAUTH_URL`             | URL pubblico dell'applicazione, richiesto da next-auth                             | `http://localhost:3000`              |
| `NEXTAUTH_SECRET`          | Segreto per la firma dei cookie di sessione                                        | — (obbligatorio, nessun default)     |

Le variabili con prefisso `NEXT_PUBLIC_` finiscono nel bundle inviato al browser: **non metterci mai un segreto**.

## Script disponibili

Da implementare progressivamente nelle issue indicate.

| Comando                     | Descrizione                                               | Issue |
| --------------------------- | --------------------------------------------------------- | ----- |
| `npm run dev`               | Avvia l'applicazione in modalità sviluppo                 | #1    |
| `npm run build`             | Build di produzione                                       | #1    |
| `npm start`                 | Avvia la build di produzione                              | #1    |
| `npm run lint` / `lint:fix` | Esegue ESLint                                             | #1    |
| `npm run compile`           | Verifica i tipi senza emettere output (`tsc --noEmit`)    | #1    |
| `npm run prettier`          | Formatta il codice                                        | #1    |
| `npm run api:generate`      | Genera il client tipizzato dallo spec OpenAPI del backend | #4    |
| `npm run unit`              | Esegue gli unit test                                      | #17   |
| `npm run unit:coverage`     | Esegue gli unit test con report di coverage               | #17   |

## Struttura del progetto

Struttura di destinazione, costruita nel corso delle issue:

```
src/
├── app/            # Rotte App Router: page.tsx, layout.tsx, loading/error/not-found
├── components/     # Componenti di feature (palinsesto, prenotazioni, admin, …)
├── ui/             # Design system interno: atoms, molecules, organisms
├── services/       # Layer API: baseQuery, definizioni RTK Query, client generato
├── store/          # Store Redux, slice di stato UI
├── utils/          # hooks/, functions/, interfaces/, configs/
├── messages/       # Messaggi i18n (it.json)
└── hooks/          # Hook trasversali di alto livello

mocks/
├── fixtures/       # Dati di seed del backend in JSON (vedi mocks/README.md)
├── mockFactory/    # Factory factory.ts + faker per i test
└── handlers/       # Handler MSW
```

Regola generale sulle dipendenze: `app → components → ui`, e i componenti consumano i dati **solo** attraverso il layer `services` (RTK Query). Un componente non chiama mai `fetch` direttamente.

## Gestione dello Stato e Cache (Redux & RTK Query)

Il progetto utilizza Redux Toolkit per lo stato globale e RTK Query per il fetching e il caching dei dati dal server.
La distinzione tra i due è la decisione architetturale chiave:

- **RTK Query (Stato Server):** Se il dato ha un'origine remota ed è ricaricabile, sta in RTK Query. Lo stato server (es. elenco film, dettagli di una sala) **non** viene mai copiato in uno slice Redux. Vive solo nella cache.
- **Redux Slice / Stato Locale (Stato UI):** Se il dato esiste solo nel browser (es. filtro selezionato, modale aperta, riga espansa), sta in uno slice Redux. O, meglio ancora, nello stato locale del componente (`useState`), se nessun altro componente ha bisogno di leggerlo.

### Convenzione dei Tag in RTK Query

RTK Query utilizza un sistema di tag per invalidare la cache automaticamente quando i dati cambiano (es. dopo una mutation). Nel progetto adottiamo la seguente convenzione per il campo `providesTags`:

- **Struttura del tag:** `{ type: 'ModelName', id: 'ID_VALUE' | 'LIST' }` (es. `{ type: 'Film', id: 'LIST' }` o `{ type: 'Film', id: 123 }`).
- **Chi li fornisce (providesTags):** Le query (es. `getFilms`, `getFilmById`) forniscono i tag associati ai dati che restituiscono. Una query per una lista fornisce sia i tag per ogni singolo elemento sia un tag generico con `id: 'LIST'`.
- **Chi li invalida (invalidatesTags):** Le mutation (es. `createFilm`, `updateFilm`, `deleteFilm`) invalidano i tag pertinenti. Una creazione invalida la `'LIST'`, un aggiornamento o una cancellazione invalida il tag con l'ID specifico (e opzionalmente la `'LIST'`).

## Lavorare senza backend

Il backend è sviluppato in parallelo da un altro sviluppatore: quando ti serve un'API, potrebbe non esistere ancora. Il progetto è pensato perché questo non ti blocchi mai.

```bash
NEXT_PUBLIC_USE_MOCKS=true npm run dev
```

In modalità mock le chiamate HTTP sono intercettate da MSW e servite dai dati in [`mocks/fixtures/`](./mocks/README.md): **gli stessi dati di seed che il backend carica nel proprio database** (8 film, 4 sale, 78 proiezioni su una settimana, oltre 1700 prenotazioni). Lo scenario mockato e quello reale coincidono, quindi quello che vedi in mock è quello che vedrai col backend attivo.

I mock servono anche a riprodurre a comando i casi che col backend reale sono difficili da ottenere: un `409` su un posto già prenotato, una risposta lenta, un `500`. Sono i casi in cui l'interfaccia sbaglia più spesso, ed è per questo che vanno provati.

## Rapporto con il backend

Il contratto tra i due progetti è lo spec **OpenAPI 3.1** che il backend espone su `/openapi.json`. Da lì si genera il client tipizzato: i tipi del dominio non si scrivono a mano da questa parte.

Quando il backend cambia il contratto:

```bash
npm run api:generate   # rigenera il client
npm run compile        # i punti da aggiornare emergono come errori di tipo
```

Se il backend fa qualcosa di diverso da quello che il contratto dichiara, **è un bug del backend o della documentazione**: segnalalo, non aggirarlo silenziosamente nel frontend.

## Bootstrap delle issue

Quando forki un repository, GitHub non copia issue, milestone e label. Per ripopolarle nel tuo fork a partire da [`issues-progetto-cinema-fe.md`](./issues-progetto-cinema-fe.md):

1. Fai il fork del repository
2. Vai su **Settings → Actions → General** del tuo fork e abilita le Actions (sui fork sono disabilitate di default)
3. Vai su **Actions → Bootstrap issue del progetto → Run workflow**
4. (opzionale) spunta "dry run" per vedere l'anteprima senza scrivere nulla
5. Lancia

Dettagli e uso in locale: [`scripts/README.md`](./scripts/README.md).

## Convenzioni

Vedi [`CONTRIBUTING.md`](./CONTRIBUTING.md) per il dettaglio completo. In sintesi:

- Branch: `<tipo>/<numero-issue>-<descrizione>`
- Commit: [Conventional Commits](https://www.conventionalcommits.org/)
- Ogni issue si considera chiusa solo a fronte della Definition of Done, non del solo "funziona sul mio schermo"

## Licenza

Progetto didattico ad uso interno.
