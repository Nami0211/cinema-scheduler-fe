# Progetto: Gestionale Palinsesto Cinema Multisala — Frontend

Repository di riferimento: `cinema-scheduler-fe`
Stack: Next.js 14 (App Router), TypeScript, Redux Toolkit + RTK Query, next-intl, CSS Modules, next-auth, Jest + React Testing Library

Le issue sono ordinate per essere lavorate in sequenza. Ogni issue è pensata per essere chiusa con una PR singola. Le stime sono indicative per un developer junior.

Il backend di riferimento è `cinema-scheduler-be` (vedi [`PROJECT-CONTEXT.md`](./PROJECT-CONTEXT.md)). Fino alla issue #4 non serve: da lì in poi si lavora contro il client generato dallo spec OpenAPI, con il layer di mock come alternativa quando il backend non è disponibile.

---

## Milestone 1 — Setup progetto e fondamenta UI

### Issue #1 — Setup iniziale del progetto

**Labels**: `setup`, `good-first-issue`
**Stima**: 0.5g

**Descrizione**
Inizializzare il repository con la struttura base di un progetto Next.js 14 con App Router e TypeScript in modalità strict.

**Task**

- [ ] Init con `create-next-app` (App Router, TypeScript, **senza** Tailwind: in questo progetto si usano CSS Modules), `tsconfig.json` in `strict: true`
- [ ] Setup ESLint (`eslint-config-next`) + Prettier con config condivisa, e `eslint-config-prettier` per evitare regole in conflitto
- [ ] Husky + lint-staged: pre-commit che esegue lint e formattazione sui soli file in stage
- [ ] Struttura cartelle: `src/{app,components,ui,services,store,utils,messages,hooks}` — le responsabilità di ciascuna sono descritte nel README
- [ ] Script npm: `dev`, `build`, `start`, `lint`, `lint:fix`, `compile` (`tsc --noEmit`), `prettier`
- [ ] `.env.example` con le variabili note a questo punto (URL del backend, flag mock)
- [ ] README con istruzioni di setup locale

**Criteri di accettazione**

- `npm run compile` passa senza errori
- `npm run lint` non riporta warning
- `npm run dev` avvia l'applicazione su `http://localhost:3000`
- Un commit con un file mal formattato viene corretto automaticamente dall'hook pre-commit

**Note tecniche**
Path alias: configura `baseUrl`/`paths` in `tsconfig.json` per importare come `components/...`, `utils/...` invece che con percorsi relativi lunghi (`../../../`). È una scelta che conviene fare adesso, non dopo cento file.

---

### Issue #2 — Design tokens, tema e atomic design

**Labels**: `setup`, `ui`
**Stima**: 1g
**Dipende da**: #1

**Descrizione**
Definire le fondamenta visive del progetto: variabili CSS globali (colori, spaziature, tipografia, breakpoint), tema chiaro/scuro, e i primi componenti atomici riutilizzabili.

In questo progetto **non si usa una libreria di componenti esterna**: gli atomi si scrivono a mano con CSS Modules. L'obiettivo è capire cosa c'è dentro un design system prima di consumarne uno.

**Task**

- [ ] `src/app/globals.css` con custom properties CSS per la palette, le spaziature (scala coerente, es. 4/8/12/16/24/32), i raggi, i font e i breakpoint
- [ ] Tema chiaro/scuro con `next-themes`, agganciato alle stesse custom properties (nessun colore hardcoded nei componenti)
- [ ] Struttura `src/ui/{atoms,molecules,organisms}` con la convenzione di cartella per componente: `Button/Button.tsx` + `Button/Button.module.css`
- [ ] Primi atomi: `Button` (varianti primary/secondary/ghost, stato disabled e loading), `Input`, `Tag`, `Spinner`
- [ ] Ogni atomo espone una prop `className` opzionale che si compone con le classi interne (usa `classnames`)

**Criteri di accettazione**

- Nessun valore di colore o spaziatura hardcoded nei CSS Module dei componenti: tutto passa dalle custom properties
- Il cambio tema chiaro/scuro non provoca flash di contenuto non stilizzato al primo caricamento
- Gli atomi sono usabili senza conoscere la loro implementazione: le props sono l'unico contratto

**Note tecniche**
Sul flash al primo caricamento (FOUC): il tema è noto solo lato client, ma l'HTML arriva dal server. Come `next-themes` risolve il problema, e perché serve `suppressHydrationWarning` sull'elemento `html`, sono due cose da capire adesso — non da copiare dalla documentazione e dimenticare.

---

### Issue #3 — Layout, routing e internazionalizzazione

**Labels**: `setup`, `ui`
**Stima**: 1g
**Dipende da**: #2

**Descrizione**
Impostare il layout applicativo, la navigazione tra le sezioni e l'infrastruttura di internazionalizzazione con `next-intl`.

Il progetto ha una sola lingua attiva (italiano), ma **nessuna stringa visibile all'utente va scritta direttamente nel JSX**: passano tutte dal file di messaggi. È la convenzione del team, e il motivo è che aggiungere una seconda lingua dopo, con le stringhe sparse in duecento componenti, costa dieci volte tanto.

**Task**

- [ ] Setup `next-intl` con locale `it`, messaggi in `src/messages/it.json` organizzati per namespace (uno per componente/sezione, più un namespace `Common` per le label condivise)
- [ ] `src/app/layout.tsx` con il provider di i18n, il provider del tema e la struttura header/main/footer
- [ ] Header con navigazione: Palinsesto (pubblico), Le mie prenotazioni, area Admin — le voci protette possono essere già presenti ma non funzionanti, l'auth arriva alla issue #10
- [ ] Pagine di stato di App Router: `loading.tsx`, `error.tsx`, `not-found.tsx` a livello di root
- [ ] Layout responsive: la navigazione deve essere usabile da mobile (il traffico atteso è per l'80% da smartphone)

**Criteri di accettazione**

- Nessuna stringa hardcoded nel JSX: `grep` di una label visibile in pagina la trova solo in `it.json`
- Navigando su una rotta inesistente si vede la `not-found` personalizzata, non quella di default di Next
- Un errore lanciato durante il render di una pagina viene catturato da `error.tsx` e mostra un messaggio comprensibile con possibilità di ritentare, senza schermata bianca
- Il layout è utilizzabile a 375px di larghezza senza scroll orizzontale

**Note tecniche**
`error.tsx` deve essere un client component (`"use client"`) e riceve `error` e `reset` come props: è un vincolo del framework, vale la pena capire perché prima di aggirarlo.

---

## Milestone 2 — Contratto API, stato e mock

### Issue #4 — Client API tipizzato generato da OpenAPI

**Labels**: `feature`, `api`
**Stima**: 1g
**Dipende da**: #1

**Descrizione**
Il backend espone il proprio contratto come spec OpenAPI 3.1 su `/openapi.json`. Da quello spec si genera il client TypeScript tipizzato: i tipi delle richieste e delle risposte **non si scrivono a mano**.

Il motivo è concreto: se il backend rinomina un campo, un client generato fa fallire `tsc`; dei tipi scritti a mano continuano a compilare felicemente e rompono in produzione.

**Task**

- [ ] Integrare `@openapitools/openapi-generator-cli` come dev dependency
- [ ] Script npm `api:generate` che scarica lo spec dal backend (URL configurabile via env) e genera il client in una cartella dedicata
- [ ] Committare l'output generato, oppure generarlo in fase di install: **scegli, e motiva la scelta nella PR** (entrambe le strade sono difendibili, ha ragione chi sa dire perché)
- [ ] Escludere la cartella generata da ESLint e dal calcolo della coverage
- [ ] Documentare nel README il comando e cosa fare quando il backend cambia il contratto

**Criteri di accettazione**

- I modelli del dominio (film, sala, proiezione, prenotazione, utente) sono importabili come tipi TypeScript senza che nessuno di essi sia stato scritto a mano nel repository
- Se il backend non è raggiungibile, `npm run api:generate` fallisce con un messaggio chiaro, non con uno stack trace incomprensibile
- Il progetto compila anche senza backend attivo, partendo dai tipi già generati

**Note tecniche**
Se il backend non è ancora pronto quando affronti questa issue, in `mocks/` trovi uno spec di riferimento minimo per sbloccarti. Non trattarlo come la verità: **è una stampella temporanea**, va sostituito dallo spec reale appena disponibile, e la PR deve dire esplicitamente quale dei due hai usato.

---

### Issue #5 — Store Redux e layer RTK Query

**Labels**: `feature`, `state`
**Stima**: 1g
**Dipende da**: #4

**Descrizione**
Impostare la gestione dello stato: Redux Toolkit per lo stato di UI, RTK Query per la cache dei dati che arrivano dal server. La distinzione tra i due è la decisione architetturale più importante di questa issue.

**Task**

- [ ] `makeStore()` con Redux Toolkit e provider client-side che lo monta (`src/store/`)
- [ ] `baseQuery` condiviso da tutte le API: base URL da variabile d'ambiente, header di autenticazione (predisposto, valorizzato alla issue #10), mapping delle risposte di errore del backend (`{ error: { code, message, details? } }`) in una forma unica gestibile dai componenti
- [ ] Prima API RTK Query: `filmApi` con `getFilms` e `getFilmById`, con `providesTags`
- [ ] Convenzione dei tag documentata nel README (quali tag esistono, chi li fornisce, chi li invalida)
- [ ] Una pagina di prova che consuma l'hook generato e mostra i film

**Criteri di accettazione**

- Nessun `fetch` diretto in un componente: tutte le chiamate passano dal layer RTK Query
- Lo stato server (elenco film) **non** viene copiato in uno slice Redux: vive solo nella cache di RTK Query
- Un errore del backend arriva al componente in forma tipizzata e leggibile, non come `unknown`
- Due componenti che montano lo stesso hook nello stesso momento generano **una** sola richiesta HTTP (verificalo nel Network tab, e spiega nella PR perché succede)

**Note tecniche**
La domanda da saper rispondere in review: _quando_ un dato deve stare in uno slice Redux e quando invece in RTK Query? La regola pratica del team: se il dato ha un'origine remota ed è ricaricabile, sta in RTK Query; se esiste solo nel browser (filtro selezionato, modale aperta, riga espansa), sta in uno slice — o, meglio ancora, nello stato locale del componente, se nessun altro lo deve leggere.

---

### Issue #6 — Layer di mock e fixture di dominio

**Labels**: `feature`, `testing`
**Stima**: 1g
**Dipende da**: #5

**Descrizione**
Il backend è sviluppato in parallelo: alcune API non esisteranno ancora quando ti serviranno. Serve poter sviluppare e testare l'interfaccia senza dipendere dalla disponibilità del backend.

In `mocks/fixtures/` trovi i dati di seed del backend già convertiti in JSON (8 film, 4 sale, 78 proiezioni su una settimana, oltre 1700 prenotazioni): sono **gli stessi dati** che il backend carica nel proprio database, quindi lo scenario mockato e quello reale coincidono.

**Task**

- [ ] Integrare MSW (Mock Service Worker) con gli handler per le API già esistenti, alimentati dalle fixture
- [ ] Attivazione via variabile d'ambiente (`NEXT_PUBLIC_USE_MOCKS`): con mock attivi l'applicazione è completamente navigabile senza backend
- [ ] Factory di dati con `factory.ts` + `@faker-js/faker` in `mocks/mockFactory/`, una per modello del dominio, per generare dati arbitrari nei test
- [ ] Gli stessi handler MSW riutilizzabili nei test (non due implementazioni di mock parallele che divergono)
- [ ] Documentare nel README come si lancia l'app in modalità mock

**Criteri di accettazione**

- Con `NEXT_PUBLIC_USE_MOCKS=true` e nessun backend attivo, l'applicazione parte e mostra dati coerenti
- Le factory producono oggetti che soddisfano i tipi generati da OpenAPI: se il contratto cambia, le factory smettono di compilare
- Nessun `if (isMock)` sparso nei componenti: la scelta tra mock e backend reale è invisibile al codice applicativo

**Note tecniche**
L'ultimo criterio è il punto della issue. Un mock che costringe il codice di produzione a sapere della propria esistenza non è un mock: è una seconda implementazione dell'applicazione, che diverge dalla prima al primo cambiamento.

---

## Milestone 3 — Palinsesto e area gestionale

### Issue #7 — Pagina palinsesto

**Labels**: `feature`, `ui`
**Stima**: 1.5g
**Dipende da**: #6

**Descrizione**
La pagina pubblica principale: il palinsesto di una giornata, con gli spettacoli raggruppati e ordinati in modo leggibile. È la pagina che il cliente apre dal telefono per decidere se andare al cinema stasera.

**Task**

- [ ] Rotta `/palinsesto` come **server component** che recupera i dati iniziali, con un client component che gestisce l'interazione
- [ ] Vista per giornata: gli spettacoli raggruppati per film, ciascuno con orario, sala e rating d'età ben visibile
- [ ] Selettore del giorno che copra la settimana in programmazione
- [ ] Stato di caricamento con skeleton (non uno spinner a tutta pagina: la struttura della pagina è nota prima dei dati)
- [ ] Stato vuoto ("nessuno spettacolo in questa giornata") e stato di errore con azione di retry, entrambi disegnati, non lasciati al caso
- [ ] Layout responsive, progettato prima per mobile

**Criteri di accettazione**

- La pagina è utilizzabile a 375px di larghezza e a 1440px, con layout appropriati a entrambi
- Gli stati loading / vuoto / errore sono tutti raggiungibili e verificabili con i mock
- Una proiezione già iniziata è visivamente distinguibile da una futura
- Nella PR: spiega quale parte della pagina hai reso server component e quale client, e perché — è la decisione centrale di questa issue

**Note tecniche**
Il criterio d'uso di un server component: se un pezzo di UI non ha bisogno di stato, effetti o handler di eventi, non deve essere un client component. Spedire al browser JavaScript che non serve è un costo che paga l'utente sul telefono, non tu sul laptop.

---

### Issue #8 — Filtri del palinsesto con lo stato nell'URL

**Labels**: `feature`, `ui`
**Stima**: 1g
**Dipende da**: #7

**Descrizione**
Aggiungere i filtri per data, film e sala. Il requisito che decide l'implementazione arriva direttamente dal gestore: vuole poter incollare su WhatsApp il link agli spettacoli di sabato, e chi lo apre deve vedere sabato.

Questo significa che **la fonte di verità dei filtri è la query string**, non uno stato React e non uno slice Redux.

**Task**

- [ ] Filtri per data, film e sala che leggono e scrivono i `searchParams` (`useSearchParams`, `useRouter`, `usePathname`)
- [ ] Hook dedicato che incapsula lettura/scrittura dei filtri (`src/utils/hooks/`), così che i componenti non manipolino la query string a mano
- [ ] Il server component legge i `searchParams` e recupera già i dati filtrati: aprendo il link, la prima risposta HTML è già corretta
- [ ] Aggiornamento dell'URL senza ricaricare la pagina né perdere la posizione di scroll
- [ ] Azione "azzera filtri" e conteggio dei risultati

**Criteri di accettazione**

- Copiando l'URL con i filtri attivi e aprendolo in una nuova scheda si ottiene esattamente la stessa vista
- Il pulsante "indietro" del browser ripercorre i filtri applicati, uno alla volta
- Ricaricando la pagina i filtri restano applicati
- Nessuna duplicazione dello stato: il valore di un filtro esiste in un posto solo (verificabile: non c'è `useState` che rispecchi un parametro dell'URL)

**Note tecniche**
Il caso limite da gestire esplicitamente: cosa succede se qualcuno modifica a mano l'URL mettendo `?salaId=999` o `?data=domani`? Un parametro non valido non deve rompere la pagina. Decidi il comportamento (ignorare il filtro, mostrare uno stato vuoto, ripiegare sul default) e documentalo nella PR.

---

### Issue #9 — Area admin: gestione film

**Labels**: `feature`, `ui`
**Stima**: 1.5g
**Dipende da**: #8

**Descrizione**
La prima sezione gestionale: elenco dei film in tabella, creazione, modifica ed eliminazione. Consolida il pattern "tabella + form + mutation" che verrà riusato per sale e proiezioni.

**Task**

- [ ] Rotta `/admin/film` con tabella basata su `@tanstack/react-table`: colonne ordinabili, paginazione
- [ ] Form di creazione/modifica in modale, con validazione lato client (titolo obbligatorio, durata positiva, genere e rating da enum chiuso)
- [ ] Mutation RTK Query (`createFilm`, `updateFilm`, `deleteFilm`) con `invalidatesTags` corretti
- [ ] Conferma esplicita prima dell'eliminazione
- [ ] Feedback dell'esito: successo e fallimento, con il messaggio del backend quando è utile all'utente
- [ ] Gli errori di validazione del backend (`400` con dettagli) vengono mostrati sui campi corrispondenti del form, non in un banner generico

**Criteri di accettazione**

- Dopo aver creato un film, la tabella si aggiorna senza ricaricare la pagina e senza un `refetch()` chiamato a mano (deve bastare l'invalidazione dei tag)
- La validazione client impedisce l'invio di dati palesemente invalidi, ma il form gestisce comunque un `400` del backend: la validazione client è comodità, non sicurezza
- Durante l'invio il pulsante è in stato loading e non è possibile inviare due volte

**Note tecniche**
La validazione lato client duplica in parte quella del backend: è inevitabile e va bene, ma va tenuto presente che è solo un'ottimizzazione dell'esperienza. Un client può sempre essere bypassato — se il backend si fidasse della validazione del frontend, sarebbe un problema di sicurezza, non di codice duplicato.

---

### Issue #10 — Area admin: gestione palinsesto e conflitti di sala

**Labels**: `feature`, `ui`, `business-logic`
**Stima**: 1.5g
**Dipende da**: #9

**Descrizione**
La creazione di una proiezione (film + sala + data/ora). Il backend impedisce che due proiezioni si sovrappongano nella stessa sala, considerando la durata del film più un buffer di pulizia di 15 minuti, e risponde `409` in caso di conflitto.

L'interfaccia deve rendere questo vincolo comprensibile **prima** che l'utente sbatta contro l'errore.

**Task**

- [ ] Form di creazione proiezione con selezione film, sala e data/ora di inizio
- [ ] Calcolo e visualizzazione dell'orario di fine previsto (durata del film + buffer) man mano che l'utente compila, così che il vincolo sia visibile mentre si sceglie
- [ ] Vista della giornata per sala (timeline o griglia oraria) che mostri gli slot già occupati
- [ ] Gestione della risposta `409`: messaggio che indica **quale** proiezione è in conflitto e in che orario, non un "errore generico"
- [ ] Eliminazione di una proiezione con conferma

**Criteri di accettazione**

- Provando a creare una proiezione sovrapposta a una esistente nella stessa sala, l'utente riceve un messaggio che nomina la proiezione in conflitto
- L'orario di fine mostrato coincide con quello che il backend calcola (se non coincide, la discrepanza va indagata e segnalata al backend, non "aggiustata" con un offset nel frontend)
- La stessa sovrapposizione in una sala diversa viene accettata senza errori

**Note tecniche**
Attenzione ai fusi orari. Il backend lavora in UTC (`2026-08-03T18:10:00Z`), l'utente ragiona in ora locale italiana. È il tipo di bug che non si vede in sviluppo e si vede benissimo in produzione, al cambio dell'ora legale: decidi dove avviene la conversione e scrivilo nella PR. Non inventare aritmetica sulle date a mano dove una libreria fa meglio.

---

## Milestone 4 — Autenticazione e prenotazioni

### Issue #11 — Autenticazione, sessione e protezione delle rotte

**Labels**: `feature`, `security`
**Stima**: 1.5g
**Dipende da**: #5

**Descrizione**
Il backend espone `POST /auth/register` e `POST /auth/login` e restituisce un JWT con il ruolo dell'utente (`customer` o `admin`). Il frontend deve gestire login, registrazione, persistenza della sessione e protezione delle rotte gestionali.

**Task**

- [ ] Setup `next-auth` con provider Credentials che chiama l'endpoint di login del backend
- [ ] Il JWT del backend viene propagato nell'header `Authorization` di tutte le chiamate RTK Query (aggancio al `baseQuery` predisposto nella issue #5)
- [ ] Pagine di login e registrazione, con gestione degli errori di credenziali errate
- [ ] `middleware.ts` che protegge le rotte `/admin/*`: un utente non autenticato viene rimandato al login, un `customer` autenticato riceve un rifiuto esplicito
- [ ] La navigazione mostra solo le voci pertinenti al ruolo dell'utente
- [ ] Gestione del `401` a livello di `baseQuery`: sessione scaduta → logout e redirect al login, senza che ogni componente debba occuparsene

**Criteri di accettazione**

- Un utente non autenticato che apre `/admin/film` finisce sul login, e dopo il login torna alla pagina che stava cercando di aprire
- Un `customer` autenticato non può raggiungere le rotte admin nemmeno digitando l'URL a mano
- Il token non è mai scritto in `localStorage` né loggato in console
- Nascondere una voce di menu **non** è protezione: verifica che la rotta sia protetta anche quando l'utente ci arriva direttamente

**Note tecniche**
Il punto concettuale: qualunque cosa faccia il frontend è una comodità per l'utente, non una misura di sicurezza. Un browser è sotto il controllo di chi lo usa. L'autorizzazione vera avviene nel backend, e il frontend nasconde le funzioni che l'utente non può usare per non fargli perdere tempo — non per impedirgliele. Spiegalo con parole tue nella PR.

---

### Issue #12 — Mappa dei posti interattiva

**Labels**: `feature`, `ui`, `business-logic`
**Stima**: 1.5g
**Dipende da**: #7

**Descrizione**
Il componente centrale dell'esperienza cliente: la griglia dei posti di una sala (fino a 18 file × 10 colonne), con lo stato di ciascun posto, e la selezione di uno o più posti prima di confermare la prenotazione.

**Task**

- [ ] Componente `SeatMap` che riceve la configurazione della sala (righe/colonne) e i posti già occupati, e rende la griglia
- [ ] Stati del posto distinti visivamente: libero, occupato, selezionato, non disponibile
- [ ] Selezione multipla con limite massimo configurabile e riepilogo dei posti scelti
- [ ] Indicazione dello schermo e numerazione di file e colonne, così che l'utente capisca dove si siede davvero
- [ ] **Accessibilità**: la mappa è navigabile da tastiera, ogni posto ha un nome accessibile ("Fila G, posto 4, libero"), lo stato non è comunicato dal solo colore
- [ ] Utilizzabile da mobile: su uno schermo da 375px una griglia 18×10 non ci sta — decidi come gestirlo (zoom, scroll, ridimensionamento) e motivalo nella PR

**Criteri di accettazione**

- Un utente che naviga solo da tastiera può selezionare e deselezionare posti, e capire in ogni momento quali ha selezionato
- Un posto occupato non è selezionabile, né col mouse né da tastiera
- La distinzione libero/occupato/selezionato resta comprensibile in scala di grigi (simula un utente daltonico: il colore da solo non basta mai)

**Note tecniche**
180 posti significano 180 elementi interattivi in pagina. In questa issue implementala nel modo più diretto e leggibile possibile: **non ottimizzare nulla**. Le performance di rendering sono il tema della Milestone 5, e servirà poterle misurare su un'implementazione ingenua.

---

### Issue #13 — Prenotazione posti e gestione del conflitto

**Labels**: `feature`, `business-logic`
**Stima**: 1.5g
**Dipende da**: #11, #12

**Descrizione**
La prenotazione vera e propria: l'utente autenticato seleziona i posti e conferma. Il backend garantisce con un vincolo a database che due persone non prenotino lo stesso posto e risponde `409` al secondo arrivato.

Lato frontend il caso non è teorico: **la mappa che l'utente sta guardando può essere vecchia di trenta secondi**, e in quei trenta secondi qualcun altro può aver preso quel posto. Come si comporta l'interfaccia in quel momento è il cuore di questa issue.

**Task**

- [ ] Mutation di prenotazione (`POST /proiezioni/:id/prenotazioni`) con i posti selezionati
- [ ] Aggiornamento ottimistico della mappa posti alla conferma (i posti risultano subito occupati), con **rollback** se il backend risponde con errore
- [ ] Gestione esplicita del `409`: messaggio chiaro su quale posto è stato preso da qualcun altro, mappa aggiornata con i dati freschi dal server, selezione dei posti ancora liberi mantenuta ove sensato
- [ ] Pagina "Le mie prenotazioni" con l'elenco delle prenotazioni dell'utente e il loro stato
- [ ] Cancellazione di una prenotazione: azione disabilitata quando mancano meno di 3 ore allo spettacolo, con il motivo spiegato all'utente — **e** gestione dell'errore del backend nel caso in cui il termine scada mentre la pagina è aperta

**Criteri di accettazione**

- Simulando un `409` (con i mock: è esattamente il caso d'uso per cui esistono), l'interfaccia non lascia l'utente in uno stato incoerente — nessun posto risulta prenotato quando non lo è
- L'aggiornamento ottimistico viene annullato correttamente all'errore: dopo il rollback la mappa riflette lo stato reale del server
- Il pulsante di cancellazione è disabilitato oltre il termine, ma un termine scaduto lato server produce comunque un messaggio comprensibile e non un errore silenzioso

**Note tecniche**
È l'equivalente frontend del problema di concorrenza che il backend risolve col vincolo a database. Il frontend **non può prevenire** il conflitto — può solo gestirlo bene quando accade. La domanda a cui rispondere in PR: dove sta il limite tra "l'interfaccia previene l'errore" e "l'interfaccia gestisce l'errore", e perché in un sistema con più utenti concorrenti la prevenzione lato client è per definizione insufficiente?

---

## Milestone 5 — Performance di rendering

Il browser esegue il JavaScript dell'applicazione su un **singolo thread**, lo stesso che si occupa di calcolare il layout e di disegnare la pagina. Finché il lavoro è I/O (una chiamata HTTP in attesa di risposta) non è un problema: il thread resta libero. Diventa un problema quando React deve ri-renderizzare centinaia di componenti a ogni interazione: mentre lo fa, la pagina non risponde ai click e non aggiorna l'animazione in corso — l'utente lo percepisce come "l'app scatta".

Le tre issue di questa milestone servono a fartelo vedere sul campo su una pagina che hai scritto tu, non a leggerlo su un articolo. **L'ordine conta**: prima si misura, poi si spiega, poi si ottimizza. Ottimizzare senza aver misurato è il modo più comune di rendere il codice peggiore senza renderlo più veloce.

### Issue #14 — Dashboard di occupazione e misura del problema

**Labels**: `feature`, `performance`
**Stima**: 1.5g
**Dipende da**: #12

**Descrizione**
Il gestore ha chiesto una dashboard: per un dato mese, l'occupazione di ogni sala, l'andamento nel tempo, e la possibilità di aprire la mappa posti di ogni proiezione per vedere com'era distribuito il pubblico in sala.

Implementala nel modo più diretto: nessuna memoizzazione, nessuna virtualizzazione, calcoli nei componenti, tutto renderizzato insieme. Poi **misura**.

**Task**

- [ ] Rotta `/admin/occupazione` che recupera i dati del mese dal backend (o dalle fixture: 78 proiezioni e oltre 1700 prenotazioni sono un volume sufficiente)
- [ ] Grafici con `recharts`: occupazione media per sala, andamento giornaliero, distribuzione per film
- [ ] Elenco di tutte le proiezioni del mese, ciascuna espandibile per mostrare la propria mappa posti (riusa il `SeatMap` della issue #12)
- [ ] Filtri per sala e per periodo, che ricalcolano i grafici
- [ ] **Misura** con React DevTools Profiler: quanti componenti si ri-renderizzano quando cambi un filtro? Quanto dura il commit? Quanto passa tra il click e l'aggiornamento visibile?
- [ ] Misura anche l'interazione più semplice della pagina (es. espandere una singola proiezione, o digitare in un campo di ricerca) mentre la dashboard è caricata

**Criteri di accettazione**

- I numeri della dashboard sono corretti rispetto ai dati (le percentuali di occupazione tornano con i posti prenotati e la capienza della sala)
- Le misure vengono prese **prima** di qualsiasi ottimizzazione: l'obiettivo di questa issue è misurare il problema, non risolverlo
- Nella PR riporta esplicitamente i numeri misurati (durata dei render, numero di componenti coinvolti, screenshot del Profiler) e una tua ipotesi sul perché la pagina si comporta così

**Note tecniche**
Non ottimizzare nulla in questa issue. Se ti viene istintivo aggiungere un `useMemo` mentre scrivi, fermati: serve avere un "prima" credibile da confrontare con il "dopo". La issue #15 tratta il fix.

---

### Issue #15 — Diagnosi e fix delle performance di rendering

**Labels**: `refactor`, `performance`
**Stima**: 1g
**Dipende da**: #14

**Descrizione**
Nella issue #14 hai misurato un problema reale. Questa issue chiede di spiegarlo correttamente e risolverlo.

**Task**

- [ ] Nella PR, spiega con parole tue: **quando** React ri-renderizza un componente? Perché cambiare un filtro in cima alla pagina fa ri-renderizzare anche i 180 posti di una mappa che non è cambiata? Cosa cambia se quella mappa è avvolta in `React.memo` — e cosa succede invece se le passi una prop `onSelect={() => ...}` creata inline a ogni render?
- [ ] Riduci i render inutili: `React.memo` dove serve davvero, `useMemo`/`useCallback` **sulle dipendenze che lo giustificano**, e soprattutto una migliore suddivisione dei componenti (spesso spostare lo stato più in basso vale più di qualunque memoizzazione)
- [ ] Sposta i calcoli derivati fuori dal corpo del render, o memoizzali con dipendenze corrette
- [ ] Virtualizza l'elenco lungo delle proiezioni con `@tanstack/react-virtual`: rendere solo ciò che è visibile
- [ ] Ripeti **le stesse misure** della issue #14 e confronta

**Criteri di accettazione**

- Nella PR compaiono i numeri prima/dopo, misurati nello stesso modo e sullo stesso scenario
- Cambiare un filtro non ri-renderizza più i componenti che non dipendono da quel filtro (dimostrabile col Profiler)
- Il comportamento della dashboard è invariato: stessi dati, stessi grafici, stessa interazione — solo più veloce
- Nessuna memoizzazione aggiunta "a caso": per ogni `useMemo`/`memo` introdotto devi saper dire quale misura lo giustifica

**Note tecniche**
`useMemo` e `useCallback` non sono gratis: hanno un costo di memoria e di confronto delle dipendenze, e rendono il codice più difficile da leggere. Applicarli ovunque per riflesso è un anti-pattern comune quanto non applicarli mai. La regola è la stessa dell'ottimizzazione in generale: prima la misura, poi il codice.

Nota su React Compiler: nelle versioni recenti di React una parte di questa memoizzazione può essere automatizzata dal compilatore. Non è attivo in questo progetto — ma vale la pena sapere che esiste e discuterne in PR: cosa cambierebbe, e cosa resterebbe comunque compito tuo?

---

### Issue #16 — Waterfall di richieste e caricamento parallelo

**Labels**: `refactor`, `performance`
**Stima**: 0.5g
**Dipende da**: #7

**Descrizione**
La pagina di dettaglio di una proiezione ha bisogno di tre cose: i dati della proiezione, i dati del film, la mappa dei posti occupati. Una prima implementazione naive, molto comune, fa `await` della prima, poi della seconda, poi della terza — e il tempo totale è la somma dei tre.

Implementala prima così, misura, poi correggila.

**Task**

- [ ] Implementa la versione sequenziale (tre `await` in fila nel server component) e misura il tempo di caricamento della pagina
- [ ] Identifica quali richieste sono davvero **dipendenti** l'una dall'altra e quali no (attenzione: il film si ricava dalla proiezione — è una dipendenza reale, o si può evitare?)
- [ ] Rifattorizza le richieste indipendenti con `Promise.all` e misura di nuovo
- [ ] Gestisci il fallimento parziale: se una delle tre richieste fallisce, la pagina non deve restare bianca. Valuta `Promise.allSettled` e decidi cosa mostrare
- [ ] Sperimenta con `<Suspense>` per far arrivare in streaming le parti indipendenti della pagina, invece di attendere che tutto sia pronto

**Criteri di accettazione**

- Il tempo di caricamento della versione finale è vicino a quello della richiesta più lenta, non alla somma di tutte (riporta entrambi i numeri in PR)
- Se una richiesta fallisce, il resto della pagina resta utilizzabile e il fallimento è comunicato all'utente
- La PR spiega quando `await` in sequenza è **corretto** (quando il secondo dato dipende dal primo) e quando è solo un modo lento di fare le cose

**Note tecniche**
Questa issue tocca lo stesso concetto della issue gemella nel progetto backend, da un altro lato: lì il problema era il blocco dell'event loop, qui è il tempo di attesa che si accumula. In entrambi i casi la domanda è la stessa — questa operazione deve davvero aspettare quella precedente, o l'ho solo scritta come se dovesse?

---

## Milestone 6 — Test, accessibilità e CI

### Issue #17 — Unit test di componenti e hook

**Labels**: `testing`
**Stima**: 1.5g
**Dipende da**: #13

**Descrizione**
Coprire con test la logica dell'interfaccia: componenti, hook custom e funzioni di utilità. I test verificano **il comportamento visibile all'utente**, non i dettagli implementativi.

**Task**

- [ ] Setup Jest + React Testing Library + `@testing-library/jest-dom`, con `jest-fail-on-console` (un `console.error` inatteso fa fallire il test)
- [ ] Helper di render che monta i provider necessari (store, i18n, tema), così che i test non li ricostruiscano ogni volta
- [ ] Test dei componenti chiave: `SeatMap` (selezione, posti occupati non selezionabili), filtri del palinsesto, form di creazione film
- [ ] Test degli hook custom con `renderHook`
- [ ] Test delle utility pure, inclusi i casi limite (calcoli di orario, formattazione date, conversione fusi)
- [ ] Test dei flussi di errore: `409` sulla prenotazione, `400` di validazione, `401` di sessione scaduta
- [ ] Soglia di coverage configurata e verificata in CI

**Criteri di accettazione**

- Coverage superiore all'80% (soglia indicativa, discutibile in review) escludendo il client generato da OpenAPI
- I test interrogano la UI come farebbe un utente (`getByRole`, `getByLabelText`), non tramite classi CSS o struttura del DOM
- La suite gira in pochi secondi, senza dipendere da un backend attivo
- Nessun titolo di test che riferisca numeri di issue o di requisito: i titoli descrivono il comportamento

**Note tecniche**
Il criterio "come farebbe un utente" non è stilistico: un test che seleziona `.btn-primary` si rompe quando rinomini una classe, senza che nulla sia effettivamente rotto — e un test che si rompe senza motivo insegna alla squadra a ignorare i test rossi.

---

### Issue #18 — Accessibilità

**Labels**: `testing`, `ui`
**Stima**: 1g
**Dipende da**: #17

**Descrizione**
Verificare e correggere l'accessibilità dell'applicazione. Non è un adempimento formale: la mappa posti, il componente più complesso del progetto, è anche quello che è più facile rendere inutilizzabile per chi non usa il mouse.

**Task**

- [ ] Integrare `jest-axe` e aggiungere un controllo automatico di accessibilità alle pagine e ai componenti principali
- [ ] Verificare e correggere la navigazione da tastiera sull'intero flusso di prenotazione: dal palinsesto alla conferma, senza toccare il mouse
- [ ] Gestione del focus nelle modali: focus intrappolato all'interno, `Esc` per chiudere, focus restituito all'elemento che l'ha aperta
- [ ] Verificare i contrasti di colore in tema chiaro e scuro (WCAG AA)
- [ ] Annunciare agli screen reader i cambi di stato importanti (prenotazione confermata, errore di conflitto) con le live region appropriate

**Criteri di accettazione**

- `jest-axe` non riporta violazioni sulle pagine principali
- Il flusso completo di prenotazione è percorribile da sola tastiera
- Aprendo e chiudendo una modale, il focus non finisce mai sul `body`
- Nella PR: elenca almeno un problema di accessibilità che hai trovato e corretto, e spiega chi ne era penalizzato

**Note tecniche**
`jest-axe` intercetta i problemi strutturali (label mancanti, ruoli errati, contrasti insufficienti), ma **non** può accorgersi che il focus si perde o che l'ordine di tabulazione è illogico. Quella parte va provata a mano: stacca il mouse e usa l'applicazione per cinque minuti.

---

### Issue #19 — CI su GitHub Actions

**Labels**: `ci-cd`
**Stima**: 0.5g
**Dipende da**: #18

**Descrizione**
Pipeline CI che verifica lint, tipi, test e build a ogni pull request.

**Task**

- [ ] Workflow GitHub Actions con job separati: lint, typecheck, test (con coverage), build di produzione
- [ ] Cache delle dipendenze npm per contenere i tempi
- [ ] I test girano in modalità mock: la CI non deve dipendere dalla disponibilità del backend
- [ ] Badge di stato CI nel README

**Criteri di accettazione**

- Una PR con un test rotto, un errore di tipo o un errore di lint non è mergeable (branch protection, se configurabile sul repository)
- La build di produzione (`npm run build`) è verificata in CI: un errore che si manifesta solo in build non deve arrivare in main
- L'intera pipeline gira in meno di 5 minuti

---

## Checklist di valutazione finale (trasversale a tutte le issue)

- **Type-safety**: nessun `any` non giustificato; i tipi del dominio derivano dal client generato da OpenAPI, non sono duplicati a mano
- **Stato**: nessuna duplicazione tra URL, RTK Query e slice Redux — ogni dato ha un solo posto in cui vive
- **Gestione degli errori**: coerente in tutta l'applicazione; ogni chiamata ha uno stato di errore disegnato, mai una schermata bianca o un errore silenzioso in console
- **Stati dell'interfaccia**: loading, vuoto ed errore sono progettati, non lasciati al caso — sono la maggior parte del tempo che l'utente passa su una connessione lenta
- **Server/client components**: il codice che non ha bisogno di girare nel browser non ci viene spedito, e sai spiegare per ogni `"use client"` perché è lì
- **Performance di rendering**: nessuna ottimizzazione applicata senza una misura che la giustifichi, e nessun problema misurato lasciato irrisolto
- **Accessibilità**: navigabilità da tastiera e nomi accessibili, in particolare sui componenti interattivi complessi
- **Responsive**: l'applicazione è pensata prima per mobile, che è il canale d'uso reale dei clienti
- **Test**: verificano il comportamento visibile, non l'implementazione; nessun test fragile legato a classi CSS o struttura del DOM
- **PR**: leggibili, con descrizione del problema e della soluzione, commit atomici, collegate all'issue corrispondente
