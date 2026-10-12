# CALL OF PADUA — Echi del Silenzio

**Prototype 0.3 · Independent story-driven post-apocalyptic FPS / free-roam adventure.**

[**Gioca su GitHub Pages →**](https://dreamer-archalo.github.io/call-of-padua/)

Un'esperienza originale ambientata in una versione post-apocalittica del centro storico di Padova. Prima di ogni scontro c'è un luogo dove tornare: il rifugio del Duomo. Le missioni si attivano parlando con i personaggi; il giocatore può esplorare liberamente e tornare alla campagna quando vuole.

## Che cosa funziona nella versione 0.3

- **Nuovo motore WebGL** con geometrie 3D, profondità, texture procedurali, foschia, color grading CSS e ambientazione continua. Nessuna libreria JavaScript esterna necessaria per eseguire il gioco.
- **Menu principale**, continua partita, nuova campagna, esplorazione libera, impostazioni, introduzione narrativa.
- **Tre personaggi selezionabili**: Lea Ferretti (ricognizione), Nico Valenti (resistenza), Ada Mercuri (medicina). Equipaggiamenti iniziali diversi; la storia principale è condivisa.
- **Base iniziale** presso il Duomo: la responsabile Marta, il mercante Rocco, una guardia e un rifugio accessibile. L'avventura inizia senza sparatorie obbligatorie.
- **Campagna originale articolata in un prologo, tre capitoli e un epilogo**: farmacia dei Signori, ripetitore delle Erbe, attacco dei predoni, incontro con Stefano alla Basilica e ritorno al rifugio.
- **Mondo esplorabile senza teletrasporto tra settori** con una mappa schematica del centro storico: Duomo, Piazza dei Signori, Piazza delle Erbe, Piazza della Frutta, Pedrocchi, Basilica del Santo, strade laterali, macerie, mercati e zone contese.
- **Combattimento FPS**: carabina, pistola, fucile a pompa, rinculo, ricarica, munizioni, ferite e medicazioni. Minacce IA semplici (predoni a distanza, Erranti ravvicinati).
- **Terza persona opzionale** (`V`), minimappa generale (`M`), diario (`J`), bottega/scambio, casse di materiali, munizioni, medicazioni, dialoghi.
- **Salvataggio locale automatico** nel browser, senza account. Non si sincronizza su altri dispositivi.
- **Controller standard/Gamepad API**, tastiera e mouse, due joystick virtuali e pulsanti touch. Supporto PS4 sperimentale: test fisico non ancora effettuato.

## Comandi

| Azione | Tastiera e mouse | Controller standard | Touch |
|--|--|--|--|
| Muovi / guarda | WASD / mouse | Stick sinistro / destro | Stick virtuali |
| Spara | Mouse sinistro | R2 | FUOCO |
| Interagisci / dialoghi | E / Invio | Quadrato / X nei dialoghi | USA |
| Armi | 1 / 2 / 3 / Q | Triangolo | — |
| Ricarica | R | Cerchio | RIC. |
| Medicazione | H | X | CURA |
| Scatta | Maiusc | L3 | CORRI |
| Terza persona | V | — | — |
| Mappa / Diario | M / J | Freccia su (mappa) | MAPPA |
| Pausa | P / Esc | OPTIONS | Ⅱ |

## Nota tecnica e limiti reali

Questo **non è un gioco AAA fotorealistico**, né un prodotto di livello Call of Duty / The Last of Us. È un prototipo browser in WebGL, realizzato senza modelli fotogrammetrici né asset commerciali. Le facciate, i personaggi e gli edifici sono proceduralmente semplificati: non vanno spacciati per una ricostruzione misurata di Padova. Il centro storico qui è una **interpretazione giocabile** con monumenti identificabili, non una replica geografica verificata. Le animazioni sono essenziali, l'IA è semplice, la guida è sperimentale. **Non c'è ancora cooperativa online né multiplayer**, e il DualShock 4 fisico non è stato collaudato.

Il progetto funziona completamente nel browser moderno con WebGL attivo. Il solo menu potrebbe essere visibile su sistemi senza WebGL, ma la partita richiede accelerazione WebGL. L'ambiente è progettato per PC e browser mobili moderni; prestazioni e compatibilità dipendono dall'hardware.

## Sviluppo futuro (da non considerare già realizzato)

1. Dati cartografici verificati, scala urbana coerente e ricostruzione dettagliata dei monumenti.
2. Modelli 3D umani e animazioni realistiche, motion capture, rigging, inventario visivo e coperture.
3. Asset PBR, materiali e illuminazione fisica ottimizzati, ombre dinamiche e audio spaziale professionale.
4. IA con pathfinding e cooperativa online con server autorevole.
5. Interni dettagliati, guida credibile, persistente economia rifugi e fazioni.

## File

- `index.html` interfacce e menu.
- `style.css` menu cinematografici e HUD.
- `game.js` renderer WebGL, città, IA, controller, narrativa, collisioni, missioni e salvataggi.
- `smoke_test.py` test automatici browser (richiede Python, Playwright, Chromium, GPU/software WebGL).

## Licenza e attribuzione

Progetto sperimentale originale di **Dreamer-archalo**. Non affiliato con Activision, Naughty Dog, Sony o altri titolari di proprietà intellettuali. Nessun asset tratto da Call of Duty o The Last of Us.