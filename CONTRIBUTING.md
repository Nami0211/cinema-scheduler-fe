# Contributing — Cinema Scheduler FE

Queste sono le convenzioni di squadra da seguire per ogni issue del progetto. Trattale come faresti con le regole di un progetto reale: non sono suggerimenti, sono lo standard su cui verrà valutata ogni PR.

---

## Workflow

1. Assegnati l'issue prima di iniziare (evita sovrapposizioni)
2. Crea un branch dedicato dall'ultimo `main` aggiornato
3. Lavora con commit piccoli e frequenti, non un unico commit finale
4. Apri la PR quando il lavoro è pronto per la review, collegandola all'issue (`Closes #N`)
5. Non fare merge da solo: aspetta l'approvazione in review

## Naming dei branch

Formato: `<tipo>/<numero-issue>-<breve-descrizione>`

Tipi ammessi: `feature`, `fix`, `refactor`, `test`, `chore`, `docs`

Esempi:

- `feature/8-filtri-palinsesto-url`
- `fix/13-rollback-optimistic-update`
- `refactor/15-memoizzazione-seatmap`

## Commit message

Formato [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<scope opzionale>): <descrizione breve, imperativo, minuscolo>

[corpo opzionale: perché, non solo cosa]
```

Tipi: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `style`, `perf`

Esempi:

- `feat(palinsesto): sposta i filtri nella query string`
- `fix(prenotazioni): annulla l'optimistic update quando il backend risponde 409`
- `perf(seatmap): memoizza il singolo posto per evitare 180 render a ogni selezione`

Evita commit come `fix`, `wip`, `aggiornamenti vari`: ogni commit deve spiegare da solo cosa cambia e perché, guardando solo l'oggetto.

## Struttura della PR

Ogni PR deve contenere, nella descrizione:

- **Cosa cambia**: riassunto in 2-3 righe
- **Perché**: il problema che risolve, non solo la soluzione tecnica
- **Come testarlo**: passi per verificare manualmente, e se serve il backend reale o basta la modalità mock
- **Screenshot / registrazione**: obbligatori quando la PR tocca l'interfaccia. Una descrizione testuale di un cambiamento visivo fa perdere tempo a chi revisiona
- **Decisioni prese**: se l'issue lasciava aperta una scelta di design (capita spesso in questo progetto), spiega qui cosa hai deciso e perché — è la parte più importante della PR, non un dettaglio

Dimensione: se una PR supera indicativamente le 400 righe di diff (esclusi file generati), valuta se va spezzata. Non è un limite rigido, ma un campanello d'allarme.

## Definition of Done

Una issue si considera chiusa solo quando:

- [ ] Il codice compila senza errori (`npm run compile`)
- [ ] Il linter non riporta warning (`npm run lint`)
- [ ] Tutti i test esistenti passano, inclusi quelli nuovi richiesti dall'issue (`npm run unit`)
- [ ] La build di produzione passa (`npm run build`) — alcuni errori si manifestano solo lì
- [ ] I criteri di accettazione elencati nell'issue sono soddisfatti uno per uno (verificali esplicitamente prima di chiedere review, non a occhio)
- [ ] La funzionalità è stata provata **anche da mobile** (o almeno con il device emulator del browser a 375px): il traffico atteso è per l'80% da smartphone
- [ ] La funzionalità è raggiungibile e usabile **da tastiera**
- [ ] Gli stati di caricamento, vuoto ed errore sono gestiti e verificati, non solo il caso in cui tutto va bene
- [ ] Il README è aggiornato se il setup locale cambia (nuove variabili d'ambiente, nuovi comandi, nuove dipendenze)
- [ ] La PR è stata aperta collegata all'issue e revisionata da almeno una persona

## Convenzioni di codice

### TypeScript

- **Niente `any`** senza commento che ne giustifichi il motivo. Se serve un tipo che non conosci, chiedi in review invece di aggirarlo. `unknown` + narrowing è quasi sempre la risposta giusta.
- **I tipi del dominio si derivano dal client generato da OpenAPI**, non si riscrivono a mano in parallelo: altrimenti il contratto del backend e i tipi del frontend divergono in silenzio, ed è esattamente il tipo di bug che si scopre in produzione.
- Preferisci dati immutabili (`const`, `readonly`), optional chaining (`?.`) e nullish coalescing (`??`).
- Le props di un componente si dichiarano in un'interface con suffisso `Props` (`SeatMapProps`, non `ISeatMapProps`), sopra il componente.

### React e Next.js

- Componenti funzionali con hook, sempre. Rispetta le regole degli hook: nessun hook condizionale.
- **`"use client"` è una decisione, non un riflesso.** Aggiungilo solo quando il componente ha davvero bisogno di stato, effetti o handler di eventi. Ogni componente client è JavaScript che l'utente scarica ed esegue sul telefono.
- Un componente, una responsabilità. Se un file supera le ~200 righe, quasi sempre contiene due componenti che non sono stati ancora separati.
- **Nessuna chiamata `fetch` diretta nei componenti**: tutte le chiamate passano dal layer RTK Query.
- La logica riutilizzabile va in un hook custom (`src/utils/hooks/`), non copiata in due componenti.

### Stato

- Ogni dato vive **in un posto solo**. Prima di aggiungere uno `useState`, chiediti se quel valore non esista già nell'URL, nella cache RTK Query o in uno slice.
- Dati che arrivano dal server → cache RTK Query. Non copiarli in uno slice Redux.
- Stato di interfaccia condiviso tra componenti lontani → slice Redux.
- Stato che serve a un solo componente → stato locale. Non tutto deve finire in Redux.
- Stato che deve sopravvivere a un refresh o essere condivisibile via link (filtri, pagina corrente) → query string.

### Stile

- **CSS Modules**, un file per componente (`Button/Button.module.css`). Niente CSS globale oltre a `globals.css`.
- Nessun colore, spaziatura o dimensione hardcoded: si usano le custom properties CSS definite nella issue #2.
- Classi condizionali con `classnames`, non con concatenazioni di stringhe.

### Internazionalizzazione

- **Nessuna stringa visibile all'utente scritta nel JSX.** Tutte le label passano da `src/messages/it.json`, con namespace per componente.
- Vale anche per i messaggi di errore e per gli `aria-label`.

### Commenti

Il codice si spiega con nomi chiari e funzioni piccole, non con i commenti. Scrivi un commento quando serve spiegare **perché** una scelta non ovvia è stata fatta (un workaround, un vincolo del browser, una decisione presa in review) — mai per descrivere cosa fa una riga che si legge da sola.

## Accessibilità

Non è una issue sola alla fine del progetto (la #18 verifica il lavoro, non lo fa al posto tuo):

- Ogni elemento interattivo è raggiungibile e attivabile da tastiera
- Ogni controllo ha un nome accessibile (label, `aria-label`)
- Lo stato non è mai comunicato dal solo colore
- Si usano gli elementi semantici giusti: un pulsante è un `<button>`, non un `<div onClick>`

## Come chiedere aiuto

Se sei bloccato su un'issue da più di un'ora senza progressi, chiedi. Non è un fallimento: fa parte del processo, ed è molto meglio di una PR che gira intorno al problema senza affrontarlo. Nella richiesta di aiuto, spiega cosa hai già provato: aiuta chi ti risponde e ti abitua a strutturare il problema prima di chiedere.

Vale anche verso il backend: se un'API non si comporta come documentato, **parlane con chi sviluppa il backend** invece di aggirare il problema nel frontend con una patch silenziosa. Le patch silenziose sono il modo in cui due progetti che dovrebbero condividere un contratto smettono di condividerlo.
