# CALL OF PADUA — Sector 01

**Alpha 0.1** — prototipo sperimentale di sparatutto 3D post-apocalittico, ambientato in una reinterpretazione del centro storico di Padova.

## Cosa funziona adesso

- Esplorazione continua di una zona *ispirata* a Piazza delle Erbe, Piazza della Frutta, Piazza dei Signori e Palazzo della Ragione.
- Visuale in prima persona, con terza persona opzionale.
- Movimento, salto, corsa, collisioni con edifici e ostacoli.
- Due armi, munizioni, ricarica, colpi registrati sui nemici e granate.
- Soldati IA semplici: pattuglia/inseguimento, attacco, danni, respawn.
- Missione dimostrativa: neutralizzare cinque nemici e raggiungere l'estrazione.
- Controller PS4 DualShock 4 via **Gamepad API** (con mapping standard quando disponibile).
- Tastiera e mouse su PC; controlli touch su smartphone.
- HUD con obiettivi, salute, munizioni, bussola e minimappa.
- Zero dipendenze JavaScript, nessuna build necessaria. Funziona **anche offline** aprendo `index.html`.

> **Limiti:** la mappa è un *blockout originale e approssimativo*, non una ricostruzione geografica certificata. Non sono ancora implementati multiplayer online, cooperativa, guida dei mezzi militari, interni esplorabili, progressione narrativa multi-missione, servizi server o sincronizzazione salvataggi. Grafica low-poly originale, NON equivalente a un titolo AAA.

## Avvio rapido

Apri `index.html` in Chrome, Edge, Firefox o Safari recente. Puoi anche pubblicare i tre file statici con GitHub Pages (repo pubblico o privato secondo il piano e le relative impostazioni).

In alternativa, per un server locale:

```bash
python3 -m http.server 8080
```

Poi apri `http://localhost:8080`.

## Comandi

| Tastiera / mouse | Controller PS4 (mapping standard) | Azione |
|---|---|---|
| WASD | Stick sinistro | Movimento |
| Mouse | Stick destro | Mira / visuale |
| Mouse sinistro | R2 | Sparo |
| Mouse destro | L2 | Mira ravvicinata (ADS) |
| Spazio | X | Salto |
| Shift | L3 | Corsa |
| R | Quadrato | Ricarica |
| Q, 1, 2 | Triangolo | Cambia arma |
| G | R1 | Granata |
| F | R3 | Corpo a corpo |
| V | — | Prima / terza persona |
| Esc, P | OPTIONS | Pausa |

Sul telefono: due stick virtuali, pulsanti per sparo, mira, salto, ricarica, visuale e pausa.

La compatibilità dei controller Bluetooth varia in base a sistema operativo, browser e autorizzazioni. Non è garantita su tutti gli smartphone; vibrazione non implementata.

## Roadmap

1. **0.1 — Vertical slice**: esperienza locale con AI e controller (questa release).
2. **0.2 — Geografia**: cartografia di riferimento, ricostruzione dei volumi dei monumenti, percorsi più fedeli, esplorazione ottimizzata.
3. **0.3 — Combattimento**: coperture, animazioni, audio, impatto dei colpi, squadre IA.
4. **0.4 — Campagna**: personaggi originali, fazioni, dialoghi, missioni e conseguenze sul mondo.
5. **0.5 — Veicoli**: guida di camion e mezzi militari, danni, spawn controllato.
6. **0.6 — Online**: backend autorevole, lobby, partite cooperative e verifica anti-cheat.
7. **0.7 — Smartphone**: profili qualitativi, impostazioni e ottimizzazione per GPU mobili.

## Repository GitHub separato

Nome suggerito: `call-of-padua`. Non importare in `padova-open-world`: questo progetto è indipendente per struttura, codice e contenuti. Una volta creato il nuovo repository, carica **index.html**, **style.css**, **game.js** e **README.md** nella root e abilita **Settings → Pages → Deploy from a branch → main / root**. Dopo la pubblicazione, l'URL sarà normalmente `https://<utente>.github.io/call-of-padua/`.

## Licenza

Il codice e gli asset originali sono prototipali. Nessuna associazione ufficiale con Call of Duty o con i rispettivi titolari dei marchi. Non utilizzare nomi o asset protetti di franchise terzi senza permesso.