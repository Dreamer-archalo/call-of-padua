## 0.8.0 — LIVING CITY

- Nuovo `living_city.js`: finestre ad arco, cupole, lampioni rotondi, fioriere, biciclette, tettoie in tela incurvata e oggetti coerenti per zona.
- Cinque nuovi NPC con dialoghi opzionali; tre ronde alleate che seguono punti di controllo; un predone con itinerario di pattuglia.
- Corretto il rilevamento di GamepadList; menu con guida Shift/L3 e comando corsa.
- Test automatici di regressione della campagna, corsa, dialogo e ronde in ambiente senza GPU.
- Limiti: grafica procedurale, nessun fotorealismo o equivalenza AAA.

# Changelog

## Alpha 0.7 — Piazza dei Signori / World Coherence

- Landmark originali: Palazzo del Capitanio, torre con apertura passante, orologio circolare e cupola, San Clemente, Loggia, Colonna Marciana, portici e giunti del selciato.
- Collisori corretti: punto missione Ghetto accessibile (zero obiettivi bloccati al test); rimosso l'edificio che chiudeva il collegamento tra piazze.
- Mezzi: geometrie più credibili con ruote, fari, finestrini, specchi e danni; fuoristrada senza clone, sterzo/accelerazione realistici per il livello del prototipo e posizione salvata.
- Due civili aggiuntivi nel rifugio con passeggiate autonome e limitate; alleati già presenti conservati.
- Controller: ricerca di slot collegati, mappa/diario, navigazione nei pannelli, conferma di scelte/report.
- Test manualmente eseguiti con renderer simulato: 29 checkpoint della campagna, sei armi, movimento, ricarica, regressione gamepad e accessibilità obiettivi.

**Limiti:** non fotorealistico; mappatura interpretativa di Padova, non rilievo metrico. Rendering GPU reale, FPS prolungati, joystick PS4 fisico e compatibilità cross-device non certificati.

## Alpha 0.6 — Combat & Animation

- Six weapon silhouettes: receivers, magazines, sights, handguards, optics, barrel details and suppressor-like muzzle geometry.
- Reload staged animation: remove/insert magazine, support hand follows and bolt cycles; weapon swap has a draw transition.
- Procedural muzzle flashes, shell ejection, spring recoil and hitmarker feedback. Synthetic layered shot sounds.
- Actors turn with their heading, shift weight, alternate footfalls and coordinate arm movement with actual speed. Idle breathing and aiming stance.
- Distance-based actor level-of-detail, quality settings High / experimental Ultra and automatic resolution step-down on persistent low frame rate.
- Preserves all five missions and save compatibility.

**Limits:** This is still procedural WebGL and cannot honestly be called AAA photorealism. Headless regression tests are not a substitute for real GPU or DualShock testing.


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