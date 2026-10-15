# CALL OF PADUA — Rebuild Preview 0.1

[Apri il test nel browser](https://dreamer-archalo.github.io/call-of-padua/preview/rebuild/)

## Stato reale
Questa è una **scena 3D sperimentale separata** dalla campagna 0.9; NON è un export Unity e NON include la mappa/asset di Federico. Il codice usa Three.js CDN e WebGL; serve un browser compatibile e connessione per caricare la libreria. La pubblicazione GitHub Pages può risultare riuscita anche se il dispositivo presenta problemi WebGL o di caricamento asset.

### Contenuti attivi
- Movimento in prima persona, corsa Shift, mouse / Gamepad API e touch sperimentale.
- Piazza dei Signori **illustrativa** con una torre e facciate approssimate; la topografia non è fedele e non va confusa con il progetto Unity.
- Rifugio con Marta e Rocco, NPC, tre soldati ostili che pattugliano, barricate e mezzi ambientali.
- Breve missione: parlare con Marta, raggiungere il blocco, neutralizzare i nemici, interagire al checkpoint e rientrare.

### Controlli
- PC: WASD muoviti; Shift corri; mouse guarda; click sinistro spara; click destro mira; R ricarica; E parla/interagisci; Esc pausa.
- Gamepad standard: stick sinistro/destra, L3 corsa, R2 fuoco, L2 mira, Quadrato interazione (le funzionalità sono sperimentali, non certificate su PS4 fisico).
- Mobile: pulsanti touch preliminari; prestazioni e ergonomia ancora da testare.

### Criteri per la futura versione Unity
1. Verifica dei diritti di utilizzo dei modelli e dati del progetto `scandolo/padova-open-world`.
2. Verifica topografica del perimetro Centro Storico/Portello/Forcellini/Santa Rita/Madonna Pellegrina/Città Giardino.
3. Esportazione di una scena Unity con asset autorizzati e QA grafico su hardware reale.
4. Test completi controlli, missioni, IA, collisioni, prestazioni e salvataggi.
