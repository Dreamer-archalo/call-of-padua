# Alpha 0.9 — Facciate del Centro

- Nuovo modulo `facade_update.js`: 8 famiglie di facciate originali, con finestre arcuate, imposte, vetri, negozi, balconate, cornici e intonaco usurato.
- Materiale WebGL dedicato `uFacade` e atlante procedurale 2048×1024, generato una volta all'avvio (nessuna immagine esterna né uso di fotografie protette).
- Nuove geometrie leggere sulle ali del Palazzo del Capitanio e Palazzo della Ragione; geometria dei personaggi, IA, missioni e collisioni invariata.
- Nessuna modifica al formato di salvataggio: la campagna 0.8 resta compatibile.
- Test automatizzati: percorso completo 29 stage; NPC, pattuglie, corsa, gamepad simulato, comandi, shader JavaScript, atlante 2D. Renderer WebGL su GPU reale e DualShock fisico non verificati.

## 0.8.0 — LIVING CITY (14 ottobre 2026)

- Nuovo modulo `living_city.js`: archi, vetrate, forme curve, lampioni, biciclette, tettoie piegate, fioriere e piccoli dettagli ambientali motivati dalla funzione delle diverse piazze.
- Cinque NPC civili con dialoghi opzionali e identità locali.
- Tre ronde amiche con waypoint e pause; ronda predoni lungo i margini della zona contesa.
- Corretto rilevamento GamepadList non-Array in pollPad.
- Guida comandi PC / DualShock 4 visibile nel menu, Shift corsa.
- Suite test aggiuntiva `living_test.py`: sprint, dialoghi, pattuglie e nessuna eccezione JavaScript nel browser con WebGL simulato.
- Conservate le cinque missioni, quattro classi, sei armi e salvataggi precedenti.
- Rimane un prototipo procedurale: i test non attestano fotorealismo, stabilità FPS su GPU reali o compatibilità garantita con il controller fisico.

# Changelog

## Alpha 0.7 — Piazza dei Signori e coerenza del mondo

- Ricostruiti in forma geometrica i principali riferimenti di Piazza dei Signori: Torre dell’Orologio, Palazzo del Capitanio, San Clemente, Loggia del Consiglio, Colonna Marciana, portici e selciato.
- Quadrante circolare con dettagli radiali, base ad arco passante e cupola della torre; eliminiamo un edificio che chiudeva il passaggio tra piazze e spostiamo San Clemente per mantenere libero il punto di missione.
- Veicoli procedurali rifiniti: vetri obliqui, gomme radiali, carrozzeria e danni, singolo fuoristrada persistente senza clone statico.
- Guida coerente con accelerazione/frenata e sterzata; posizione del fuoristrada persistente nel salvataggio.
- Due civili nel rifugio e passeggiate brevi, con animazioni reattive al movimento; nessuna nuova ondata nemica nell'area sicura.
- Controller standard: rilevamento anche slot successivi, accesso a diario e mappa, gestione pausa/report/scelte.
- Regression test: tutti i 29 checkpoint narrativi, sei armi, tiro/ricarica, gestione input, pattuglie, collisioni e modello di mezzi con mock WebGL.

**Nota:** test logici superati nel renderer simulato; modelli originali procedurali, non riproduzione metrica né grafica AAA. GPU reale, prestazioni sostenute e DualShock 4 fisico non certificati.


## Alpha 0.6 — Combat & Animation

- Six visually distinct procedural guns with oriented receivers, rails, sights, stocks, magazines, scopes and handguards.
- Reload animation sequence: hand movement, magazine removal/reinsertion, reciprocating bolt; weapon equip transition and aiming down sights (RMB / L2).
- Spring recoil, shell casings, muzzle-flash geometry, brief crosshair and hitmarker feedback and improved synthetic sound.
- Movement-driven walking and sprint cadence, articulated shoulders/elbows/knees, idle breathing and aiming stances.
- Distanced actor geometry simplification and adaptive rendering resolution; High / Ultra presets (Ultra is experimental).
- Automated regression coverage for all chapters and animation sequence with a mock renderer.

**Limitations:** procedural assets are not Call of Duty-grade; real GPU, hardware controller and sustained mobile performance are not certified.


## Alpha 0.5 — Director Cut

- Mission-end reports with original dialogue, consequences and next-operation preview.
- Ambient survivor/radio dialogue tied to 10 mission checkpoints; no forced interruption of NPC conversations.
- Walking/exploration chapters subtly reduce crosshair prominence and introduce location narration.
- Unique atmosphere palette across campaign chapters (including fog color).
- Detailed procedural environmental props around Duomo, Ghetto, Signori, Erbe, Frutta, Pedrocchi and Santo integrated with existing WebGL culling.
- Rewritten dialogue focused on character motivations, losses and sense of place.
- Preserves established save key and existing core gameplay; no artificial timed chapter gating.

### Known limits

Prototype-grade procedural meshes are not photorealistic, Gamepad physical test and extended mobile soak test pending.