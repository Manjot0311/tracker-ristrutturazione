# Tracker Ristrutturazione

Web app statica (PWA-ready) per tenere traccia delle spese di ristrutturazione: ditte, abitazioni/uffici, categorie di spesa, importi previsti/pagati e report visivi. Nessun backend: tutti i dati vivono nel `localStorage` del browser, con export/import JSON per backup e trasferimento tra dispositivi.

## Stack

- **Zero framework**: HTML + CSS + JavaScript vanilla, nessuna build step, nessuna dipendenza da npm.
- Font Google (`DM Sans`, `DM Serif Display`) caricati via CDN.
- `jsPDF` + `jspdf-autotable` (via CDN, solo in `pages/spese.html`) per l'export del PDF filtrato.
- Persistenza dati: `localStorage`, con schema versionato e migrazione automatica da un vecchio formato dati (vedi `runMigrationIfNeeded()` in `js/shared.js`).

## Struttura del progetto

```
.
├── index.html                # Home: recap generale, totali per abitazione, insight, backup
├── css/
│   ├── shared.css            # Design system condiviso (variabili, componenti, layout, responsive)
│   ├── home.css              # Stili specifici della Home
│   ├── spese.css             # Stili specifici della pagina Spese
│   └── anagrafiche.css       # Stili specifici della pagina Anagrafiche (attualmente vuoto, predisposto)
├── js/
│   ├── shared.js             # Logica dati: CRUD, calcoli, migrazione, backup/restore, utility UI
│   ├── home.js                # Logica specifica della Home
│   ├── spese.js               # Logica specifica della pagina Spese (incl. export PDF)
│   └── anagrafiche.js         # Logica specifica della pagina Anagrafiche
├── pages/
│   ├── spese.html             # Elenco spese: filtri, inserimento/modifica, export PDF
│   └── anagrafiche.html       # Gestione ditte, abitazioni/uffici e categorie di spesa
└── README.md
```

Ogni pagina HTML carica sempre `css/shared.css` + `js/shared.js` (base comune) più il proprio file CSS/JS dedicato. Le tre pagine condividono lo stesso header/nav (`site-header` / `topnav`), così da restare in sync tra loro. Le pagine dentro `pages/` referenziano gli asset con percorso relativo `../css/...` e `../js/...`.

## Modello dati (localStorage)

| Chiave                | Contenuto                                             |
|------------------------|--------------------------------------------------------|
| `trk_ditte_v1`         | Anagrafica ditte/fornitori                             |
| `trk_abitazioni_v1`    | Anagrafica abitazioni/uffici                           |
| `trk_categorie_v1`     | Categorie/sottocategorie di spesa                      |
| `trk_spese_v4`         | Voci di spesa (importo, importo pagato, stato, ditta, abitazione, categoria, note, date) |
| `trk_migrated_v1`      | Flag interno che evita di ripetere la migrazione dati da un vecchio formato |

Lo **stato** di ogni spesa (`previsto` / `confermato` / `pagato`) viene calcolato a runtime da `calcStato(importo, importoPagato)` in `js/shared.js`, non salvato esplicitamente.

## Funzionalità principali

- **Home (`index.html`)**: totale complessivo e per abitazione, percentuale pagato, alert automatici (`checkAlerts`), classifica categorie di spesa e top ditte per importo.
- **Spese (`pages/spese.html`)**: tabella con filtri (abitazione, ditta, stato, categoria, intervallo date), riga espandibile con dettagli, modale di inserimento/modifica, export PDF filtrato. Su schermi stretti la tabella è scrollabile in orizzontale per mantenere leggibili tutte le colonne.
- **Anagrafiche (`pages/anagrafiche.html`)**: CRUD per ditte, abitazioni/uffici e categorie di spesa, usate come opzioni nei filtri e nel form spese.
- **Backup**: esportazione/importazione di un file `.json` con l'intero dataset (`exportBackupJSON` / `importBackupJSON` in `js/shared.js`), utile per spostare i dati tra dispositivi o come copia di sicurezza periodica.

## Come usarla in locale

Essendo tutto statico, basta un server HTTP qualsiasi (necessario per far funzionare correttamente fetch dei font e comportarsi come un sito reale, non un file://):

```bash
# opzione 1: Python
python3 -m http.server 8080

# opzione 2: Node
npx serve .
```

Poi apri `http://localhost:8080/index.html`.

## Deploy

Il progetto è composto solo da file statici: puoi pubblicarlo così com'è su **GitHub Pages**, Netlify, Vercel o qualunque hosting statico, senza build.

### GitHub Pages

1. Push del repo su GitHub (vedi sotto).
2. Nelle impostazioni del repo: `Settings → Pages → Source: Deploy from a branch → main / (root)`.
3. Il sito sarà raggiungibile su `https://<utente>.github.io/<repo>/`.

## Backup dei dati

I dati non lasciano mai il browser se non tramite export manuale. Si consiglia di esportare periodicamente un backup `.json` dalla home ("Backup dati") e conservarlo in un posto sicuro (es. cloud storage personale) — **non committare i file di backup nel repo**, contengono dati personali (vedi `.gitignore`).

## Note

- Nessuna chiave API, nessun segreto: il progetto non richiede variabili d'ambiente.
- Il codice segue deliberatamente un approccio "zero framework" (vanilla JS/CSS/HTML) senza dipendenze da bundlare.
- Ogni pagina ha ora il proprio file CSS e JS dedicato (oltre a `shared.css`/`shared.js` comuni): questo rende più facile isolare modifiche e bug specifici di una singola pagina senza toccare le altre.
