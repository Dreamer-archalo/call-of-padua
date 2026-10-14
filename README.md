# CALL OF PADUA — Echi del Silenzio (Alpha 0.9)

**Aggiornamento Facciate del Centro | GitHub Pages: https://dreamer-archalo.github.io/call-of-padua/**

## Nuovo in 0.9 — superficie e architettura

- Rivestimenti di facciata colorati e più dettagliati, dipinti proceduralmente all'avvio in un atlante WebGL **2048×1024**: intonaco invecchiato, aperture ad arco, finestre con vetri, imposte, ringhiere, cornici in pietra, negozi al piano terra e variazioni di materiali.
- Piazza dei Signori: rivestimento specifico delle ali del Palazzo del Capitanio, balconi e cornici tridimensionali. La Torre dell'Orologio mantiene quadrante astronomico e passaggio libero.
- Palazzo della Ragione: bay modulari con portici dettagliati sui due fronti lunghi, senza cambiare le collisioni.
- Case lungo la città: fronti e fianchi variati, con proporzioni verticali leggibili e tessiture non più uniformi.
- Le texture sono **arte procedurale originale**, non fotografie di edifici e non scansioni reali: migliorano la ricchezza visiva, ma la città non è ancora una replica architettonica e non ha la qualità di Call of Duty.
- Mantiene le cinque missioni, quattro personaggi/classi, pattuglie, dialoghi, controller e salvataggi della 0.8. Nessun obiettivo o collider è spostato.
- Performance: una sola texture atlas GPU, renderizzato una volta per avvio; texture e decal non si aggiornano in ogni frame. Alcuni dispositivi possono richiedere qualità BILANCIATA.

## Controlli

PC: WASD movimento, Shift corsa, mouse visuale, sinistro spara, destro mira, E interagisci, R ricarica, 1-6 selezione armi, M mappa, J diario, G granata, T fumogena, Esc pausa.

Controller Gamepad API (DualShock 4 con mappatura standard dove supportato): stick sinistro movimento, stick destro visuale, L3 corsa, L2 mira, R2 spara; gli altri comandi sono illustrati nelle impostazioni.

## Verifiche

`facades_test.py`, `smoke_test.py`, `animation_test.py`, `world_test.py` e `narrative_test.py` sono test automatizzati con WebGL simulato, non benchmark grafici. Validati: avvio, cambio personaggio, 29 passaggi di campagna, navigazione/percorsi, corsa, armi, dialoghi, mappa, controller simulato, assenza di punti obiettivo dentro ostacoli. L'atlante è generato e renderizzato da un canvas 2D nei test.

**Limiti:** non è fotorealistico, i modelli tridimensionali di base restano procedurali; GPU WebGL reale, browser smartphone e DualShock 4 fisico devono ancora essere verificati sul dispositivo di destinazione. Non è affiliazione ufficiale di Call of Duty.

## Sviluppi tecnici futuri

Per un salto verso grafica AAA servono modelli glTF/GLB professionali, texture PBR, facciate modellate con elementi in profondità e fotogrammetria o misure della città (con licenze adeguate), scheletri e animazioni di personaggi, ombre dinamiche e profilazione GPU.

# CALL OF PADUA / ECHI DEL SILENZIO — COMBAT UPDATE

**Alpha 0.8 · Living City | FPS narrativo originale per browser PC e smartphone**

[Play public build](https://dreamer-archalo.github.io/call-of-padua/)

New in 0.6: animated weapon reload stages (magazine removal/insertion and bolt), recoil spring and muzzle flash, brass casings, six distinct procedural weapon silhouettes, articulated actors with movement-speed-driven strides and low-detail distant actors, optional mouse-right/PS4 L2 aim-down-sights and an experimental Ultra HD setting. Quality steps down automatically after repeated low FPS. Desktop aims at up to 50 render updates/s where available. No physically captured human motion or scanned weapon assets; this is not AAA photorealism.

Earlier in 0.5: environmental WebGL set dressing loaded into existing culling chunks (market shutters, tents, cables, memorials, barricades and triage posts); chapter-specific atmosphere; ambient location cards; radio/ally subtitles during quieter travel; personal dialogue rewrites; chapter-end story reports with consequences and previews for the next operation. All five original missions, 4 operators, 6 weapons, autosaves, map and controller support from 0.4 are retained.

This is still an **original low-poly WebGL browser prototype**, NOT a photorealistic AAA game. The world layout is a gameplay interpretation of central Padova, not an architectural survey. No external art or copyright-protected characters were copied. Speech is subtitled, not professionally voice acted.

## Novità 0.7 — Luoghi reali, comportamento credibile

- **Piazza dei Signori:** nuovo blockout architettonico originale basato sulla disposizione reale degli elementi principali: **Palazzo del Capitanio e Torre dell’Orologio con quadrante circolare e passaggio**, **Chiesa di San Clemente**, fronti porticati, **Gran Guardia** e **Colonna Marciana**. La posizione della chiesa è adattata per non ostruire il punto di passaggio della missione nel Ghetto. Il mondo **non** è una riproduzione metrica / fotogrammetrica.
- **Mezzi:** berline/fuoristrada con cristalli inclinati, ruote laterali, fari, specchi, portiere, cofano e danni localizzati; il fuoristrada guidabile non si duplica quando si sale. **W/S accelerano/frenano e A/D sterzano** (prima lo sterzo era uno spostamento laterale).
- **Persone:** due nuovi civili nel rifugio e ronde limitate a una zona coerente. Gli alleati continuano a seguire e difendere il giocatore; gli NPC non si muovono casualmente nelle aree di combattimento.
- **Controller:** riconoscimento di controller collegati anche in uno slot successivo al primo; D-pad su/giù per mappa/diario, uscita dai pannelli, passaggio tra i report di missione e selezioni narrative, oltre a movimento, mira, fuoco, ricarica e cambio arma.
- **Affidabilità:** test del movimento e della progressione attraverso tutti i 29 checkpoint delle 5 missioni; test di controller standard simulato e rilevamento di eventuali obiettivi dentro collisioni (0 nel test).

**Limiti espliciti:** questo resta un prototipo browser **procedurale**, non fotorealistico e non paragonabile agli asset di un Call of Duty moderno. Non sono stati eseguiti test con controller PS4 fisico o GPU reale nell'ambiente di prova; nessuna garanzia universale di FPS/assenza di bug. Il multiplayer online non è presente.

## How to play

From the main menu choose New Campaign, an operator and Enter Refuge. On PC use WASD + mouse, E to interact, J journal, M map, R reload, H heal, 1–6 weapons. A standard Gamepad API controller is supported where the platform provides mapping. Touch joysticks are available on mobile. Dialogue advances using E / Enter.

## Content

1. *Cenere sotto i portici*: collect antibiotics, escort supplies, defend evacuees, return to Marta.
2. *La frequenza morta*: restore the radio, survive a siege, decode a message.
3. *L'ultimo corriere*: explore Pedrocchi, face an ambush, escort Irene, make a choice.
4. *Il Santo non risponde*: reach the Basilica, rescue Stefano, survive infected attackers.
5. *La notte delle campane*: sabotage, defend, decide whether to transmit or hide.

The storytelling has noncombat walking sections and scripted subtitled conversations. Chapter transitions present field reports; the player decides when to continue. Mission duration varies with exploration and combat; there is no arbitrary 3-minute lockout.

## Technical choices and limitations

- Renderer: small custom WebGL 1 mesh engine, procedural assets, chunk culling and adaptive quality.
- Textures: procedurally generated local atlas. No external network dependencies.
- Gamepad physical testing and sustained mobile performance still require device tests.
- No cooperative multiplayer backend, motion captured animation, realistic cutscenes or surveyed buildings.
- Saved games use browser localStorage (`cop-save-v04`) to retain compatibility with alpha 0.4.
- Files `director.js`, `scenery.js`, `landmarks.js`, `vehicles.js`, `living_city.js` and `cinematic.css` are loaded as auxiliary modules; both menu and 3D use the existing core game.

## Testing

Run `python smoke_test.py` with Playwright and Chromium installed. `narrative_test.py` adds smoke tests for environmental geometry, report content and zone/narrative overlays.

See `CHANGELOG.md` for details.

## Verification for 0.6
`smoke_test.py` validates 29 campaign checkpoints; `animation_test.py` uses a mocked WebGL renderer to exercise geometry, movement, shooting and weapon reload. Browser automation cannot verify real GPU performance, texture realism or physical DualShock hardware.

## Test aggiuntivi 0.7

`world_test.py` verifica landmark, numero di triangoli, checkpoint percorribili, NPC del rifugio, controller simulato (movimento, arma, mappa, diario, pausa) e ingresso nel veicolo. Usare `python world_test.py`. Questi test usano una **mock GPU** e non certificano una resa grafica finale sul dispositivo.