# CALL OF PADUA / ECHI DEL SILENZIO — COMBAT UPDATE

**Alpha 0.6 | Original narrative FPS prototype for desktop/mobile browser**

[Play public build](https://dreamer-archalo.github.io/call-of-padua/)

New in 0.6: six differentiated procedural guns, animated magazine changes and bolt movement, recoil recovery, muzzle flash and shell casings, right-click/L2 aim-down-sights, articulated actor movement driven by world speed, distant-actor LOD, and adaptive resolution with an experimental Ultra quality option. The project remains procedural and is not photorealistic.

Previously in 0.5: environmental WebGL set dressing loaded into existing culling chunks (market shutters, tents, cables, memorials, barricades and triage posts); chapter-specific atmosphere; ambient location cards; radio/ally subtitles during quieter travel; personal dialogue rewrites; chapter-end story reports with consequences and previews for the next operation. All five original missions, 4 operators, 6 weapons, autosaves, map and controller support from 0.4 are retained.

This is still an **original low-poly WebGL browser prototype**, NOT a photorealistic AAA game. The world layout is a gameplay interpretation of central Padova, not an architectural survey. No external art or copyright-protected characters were copied. Speech is subtitled, not professionally voice acted.

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
- Files `director.js`, `scenery.js`, and `cinematic.css` are optional additions; both menu and 3D use the existing core game.

## Testing

Run `python smoke_test.py` with Playwright and Chromium installed. `narrative_test.py` adds smoke tests for environmental geometry, report content and zone/narrative overlays.

See `CHANGELOG.md` for details.

## 0.6 verification
Campaign smoke tests: 29/29 stages passed. Mocked renderer test: movement, six weapons, firing, recoil, casings and staged reload passed. These are not physical PS4 or real-GPU benchmarks. Avoid assuming smooth 60 FPS on mobile.
