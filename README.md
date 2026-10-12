# CALL OF PADUA / AFTERMATH

**Alpha 0.2.0 · Sector 01: Piazza delle Erbe**

Prototipo giocabile indipendente di uno sparatutto in prima persona ambientato in una **reinterpretazione post-apocalittica del centro storico di Padova**. Un piccolo settore continuo, una missione completa e supporto sperimentale al controller DualShock 4. Tutto il codice del gioco è originale, in JavaScript e Canvas 2D, senza dipendenze runtime e senza richiesta di installazione.

**[▶ Gioca nel browser](https://dreamer-archalo.github.io/call-of-padua/)**

> **Ambito reale, senza esagerazioni:** è un *vertical slice stilizzato*, non un Call of Duty e non una ricostruzione fedele della città. I monumenti hanno riferimenti riconoscibili (Palazzo della Ragione, portici, piazze), ma distanze, edifici e strade sono un blockout immaginato per il gameplay. Non ci sono al momento multiplayer, IA avanzata, mezzi guidabili, interni esplorabili o open world completo.

## Alpha 0.2 — cosa c'è di nuovo

- Piazza delle Erbe rifinita con **loggiati ad arco**, copertura curva del Palazzo della Ragione, facciate, tetti, bancarelle, detriti, barricate, mezzi abbandonati, segnali militari e nuovo cielo atmosferico. Tutta geometria creata tramite codice (non fotografie usate come sfondo).
- Missione in **tre fasi**: neutralizza quattro nemici, raggiungi il trasmettitore e premi **E / Quadrato / USA**, poi raggiungi l'estrazione durante una seconda ondata nemica.
- Due armi distinguibili anche visivamente: carabina e pistola, con munizioni, caricatore, rinculo, mira ravvicinata, granate e attacco corpo a corpo.
- **Audio sintetizzato** per spari, colpi e obiettivi, senza caricare file audio esterni (inizia dopo l'interazione dell'utente).
- HUD più leggibile, minimappa, bussola, indicatore obiettivo, messaggi radio, salute, munizioni, pause e schermate di vittoria/sconfitta.
- Supporto tastiera/mouse, controller con mappatura standard Gamepad API e controlli touch. **Corretto il bug** per cui un tocco rapido su «Spara» poteva non essere riconosciuto.

## Avvia il gioco

Da PC o smartphone apri: **https://dreamer-archalo.github.io/call-of-padua/**. La versione web non richiede un account o un server del gioco. Puoi anche aprire `index.html` direttamente in un browser moderno, senza rete.

## Controlli

| Azione | PC | Gamepad standard / DualShock 4* | Smartphone |
|---|---|---|---|
| Cammina / guarda | WASD / mouse | Stick sinistro / destro | Due stick virtuali |
| Spara / mira | Click sinistro / destro | R2 / L2 | SPARA / MIRA |
| Salta / corri | Spazio / Shift | X / L3 | SALTA / stick |
| Ricarica o usa radio | R / E | Quadrato, in base alla vicinanza | RIC. / USA |
| Cambia arma | Q o 1/2 | Triangolo | — |
| Granata / corpo a corpo | G / F | R1 / R3 | — |
| Prima / terza persona | V | — | FPS / 3P |
| Pausa | P o Esc | OPTIONS | II |

*La Gamepad API supporta controller con mappatura standard; un DualShock 4 fisico non è stato ancora testato su tutti i sistemi. Il pairing Bluetooth e le funzioni del controller variano in base a OS, browser e dispositivo. Vibrazione non implementata.*

## Test eseguiti

`smoke_test.py` contiene verifiche browser ripetibili per avvio, movimento, cambio arma, ricarica, telecamera, interazione con l'obiettivo, completamento missione, riavvio, pausa, HUD e sparo da smartphone, più riconoscimento di un controller standard simulato.

Per eseguire i test in un ambiente di sviluppo con Python, Chromium e Playwright installati:

```bash
python smoke_test.py
```

I test browser automatizzati **non sostituiscono** test reali su dispositivi, gamepad fisici e sessioni prolungate. Non viene dichiarata una garanzia di 60 FPS su tutti i dispositivi.

## Prossime priorità

1. **Fedeltà geografica:** planimetria vera della zona Piazza Erbe/Frutta, Palazzo della Ragione e vicoli di collegamento, con un modello volumetrico coerente.
2. **Qualità grafica:** passaggio a un motore 3D/WebGL, illuminazione e asset originali/CC0, LOD, texture, animazioni; il renderer Canvas attuale ha limiti visivi oggettivi.
3. **Combattimento:** coperture, animazioni di soldati, hitbox/occlusioni corrette, IA tattica e bilanciamento.
4. **Storytelling:** personaggi e fazioni originali, più missioni interconnesse.
5. **Multiplayer cooperativo:** progetto server-authoritative a sé stante; non può essere realizzato con sole pagine statiche.
6. **Profilazione mobile e gamepad:** test veri su diversi dispositivi e DualShock 4 collegato via USB/Bluetooth.

### Indipendenza

Questo repository non riutilizza codice né asset di `padova-open-world`; è un progetto autonomo. Non è affiliato con Activision né con la serie Call of Duty. Nessun asset protetto di videogiochi terzi è presente.
