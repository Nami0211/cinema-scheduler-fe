# Contesto di progetto — Multiplex Aurora, interfaccia web

## Chi siamo

Multiplex Aurora è una catena cinematografica di medie dimensioni con una sola struttura, situata in un centro commerciale di periferia. Il cinema ha **4 sale**:

| Sala   | Capienza                         | Note                                                          |
| ------ | -------------------------------- | ------------------------------------------------------------- |
| Sala 1 | 180 posti (18 file × 10 colonne) | Sala principale, schermo grande, usata per le uscite di punta |
| Sala 2 | 120 posti (12 file × 10 colonne) |                                                               |
| Sala 3 | 90 posti (9 file × 10 colonne)   |                                                               |
| Sala 4 | 60 posti (10 file × 6 colonne)   | La più piccola, spesso usata per film di nicchia o repliche   |

Il cinema proietta in media 6-8 film diversi a settimana, con più spettacoli al giorno per titolo (tipicamente pomeriggio/sera nei giorni feriali, aggiunta di mattinate nel weekend).

## Da dove arriva questo progetto

La prima fase del lavoro è stata il **servizio backend** (`cinema-scheduler-be`): centralizzare palinsesto e prenotazioni per risolvere i problemi che il vecchio foglio Excel condiviso generava — doppie prenotazioni sullo stesso posto, film programmati in sovrapposizione nella stessa sala, nessuna vista consolidata dell'occupazione, nessuno storico.

Il backend ora c'è (o sta arrivando: i due progetti procedono in parallelo, vedi più avanti), ma **nessuno degli utenti finali sa usare una API REST**. Oggi la biglietteria interroga il backend tramite un collega che gli lancia le chiamate da Postman, e i clienti continuano a telefonare per farsi leggere gli orari. È la fase due del progetto: l'interfaccia web.

## Il problema che questa applicazione deve risolvere

1. **I clienti non hanno modo di vedere il palinsesto.** Oggi telefonano, o guardano una foto del foglio Excel pubblicata su Facebook una volta a settimana, spesso già superata. Serve una pagina pubblica del palinsesto, consultabile per giorno, filtrabile per film e per sala, e soprattutto **linkabile**: il gestore vuole poter incollare su WhatsApp il link agli spettacoli di sabato e sapere che chi lo apre vede esattamente sabato.

2. **La scelta del posto avviene a voce.** "Fila G, verso il centro" — con il risultato che il cliente scopre solo in sala dove è finito davvero. Serve una **mappa dei posti** visuale, che mostri cosa è libero e cosa è occupato e permetta di selezionare i posti prima di confermare.

3. **La biglietteria lavora ancora su un altro strumento.** Il personale di sala deve poter gestire film, sale e palinsesto dall'interfaccia, senza passare dal backend a mano — e senza che un cliente possa raggiungere quelle stesse funzioni.

4. **Il gestore non ha una vista di sintesi.** Vuole aprire una pagina e capire, per il mese in corso, quanto sono piene le sale e quali film/orari stanno performando meglio, per decidere se aggiungere spettacoli. Il backend espone i dati; nessuno finora li ha mai guardati in forma di grafico.

## Cosa ci serve

Un'**applicazione web** che copra due esperienze molto diverse sopra lo stesso backend:

- **Area pubblica / cliente**: consultazione del palinsesto, dettaglio proiezione con mappa posti, registrazione e login, prenotazione posti, elenco delle proprie prenotazioni con possibilità di cancellarle entro i termini.
- **Area gestionale (ruolo `admin`)**: CRUD film, configurazione sale, creazione e modifica del palinsesto con feedback immediato sui conflitti di orario, dashboard di occupazione.

## Vincoli di business da rispettare (raccolti parlando con lo staff)

Sono gli stessi vincoli che il backend già applica. L'interfaccia **non è la fonte di verità**: non deve reimplementare queste regole come se fossero sue, ma deve renderle comprensibili all'utente _prima_ che il backend risponda con un errore.

- Tra una proiezione e la successiva nella stessa sala serve un **buffer di pulizia di 15 minuti**: se un film dura 120 minuti e inizia alle 18:00, la sala è occupata fino alle 20:15. Quando l'admin crea una proiezione in una sala già occupata, il backend risponde `409` — l'interfaccia deve spiegare _con quale proiezione_ è in conflitto, non limitarsi a "errore".
- Una prenotazione può essere **cancellata gratuitamente fino a 3 ore prima** dell'inizio dello spettacolo; dopo, la cancellazione non è permessa. Il pulsante "Cancella" non deve essere attivo se il termine è passato, ma la risposta del backend resta l'unica autorità: se l'utente ha la pagina aperta da un'ora, il termine può essere scaduto nel frattempo.
- I film hanno un **rating d'età** (es. "T", "14+", "18+") da mostrare in modo visibile. Non è richiesta alcuna verifica in fase di prenotazione: il controllo resta umano, all'ingresso in sala.
- **Due clienti non devono mai poter prenotare lo stesso posto.** Il backend lo garantisce con un vincolo a database e risponde `409` al secondo arrivato. Lato interfaccia il caso è tutt'altro che teorico: la mappa posti che l'utente sta guardando può essere vecchia di trenta secondi, e in quei trenta secondi qualcun altro può aver preso il posto che sta per selezionare. Come si comporta l'interfaccia in quel momento è uno dei punti più importanti di questo progetto.

## Chi userà il sistema

- **Clienti**: da mobile, quasi sempre. Il traffico del sito del cinema oggi è per oltre l'80% da smartphone. Non è un "nice to have" responsive: è il caso d'uso principale.
- **Personale di sala / gestore (ruolo `admin`)**: da desktop, in biglietteria, spesso di fretta tra un cliente e l'altro.

## Rapporto con il backend

Il backend è un progetto separato (`cinema-scheduler-be`), sviluppato in parallelo da un altro sviluppatore. Questo ha due conseguenze concrete, che sono parte dell'esercizio e non un incidente:

1. **Il contratto API è la fonte di verità condivisa.** Il backend espone uno spec OpenAPI 3.1 su `/openapi.json`: da lì si genera il client tipizzato, non si scrivono i tipi a mano. Se il contratto cambia, il frontend se ne accorge in fase di compilazione, non in produzione.
2. **Il frontend non può aspettare il backend.** Quando inizi, alcune API potrebbero non esistere ancora, o comportarsi diversamente da come sono documentate. Per questo il progetto prevede fin da subito un **layer di mock** con dati realistici (gli stessi dati di seed del backend, in `mocks/fixtures/`): si sviluppa contro il mock, si verifica contro il backend reale. Saper lavorare senza avere il backend pronto è una competenza, non un ripiego.

Se durante il lavoro trovi una discrepanza tra quello che il contratto promette e quello che il backend fa davvero, **non aggirarla nel frontend con una patch silenziosa**: segnalala allo sviluppatore backend, esattamente come faresti in un team reale. Se poi decidi comunque di gestire il caso lato frontend, scrivilo nella PR.

## Perché un'applicazione su misura

Il gestore aveva valutato i portali di prenotazione già pronti sul mercato, ma vincolano a un circuito di ticketing con commissione sul venduto, non giustificabile per una singola struttura a 4 sale. Da qui la scelta di costruire l'interfaccia sopra il backend che già possediamo.

---

_Questo documento descrive il contesto di business fittizio usato come riferimento per le user story del progetto didattico. In caso di dubbi su un requisito non specificato, è legittimo e incoraggiato fare ipotesi ragionevoli partendo da questo contesto e documentarle nella PR, esattamente come si farebbe con un cliente reale che non ha pensato a tutti i casi limite._
