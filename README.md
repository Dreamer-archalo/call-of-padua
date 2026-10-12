# CALL OF PADUA — Echi del Silenzio

**Alpha 0.4 · Cinque operazioni narrative · WebGL browser game · Progetto originale di Dreamer-archalo**

[Gioca alla versione pubblicata](https://dreamer-archalo.github.io/call-of-padua/)

Un FPS con visuale in prima/terza persona, una reinterpretazione post-apocalittica **stilizzata** di Padova, quattro personaggi, sei armi e una campagna narrativa in cinque missioni. **Il gioco inizia in un rifugio presso il Duomo, non durante un combattimento.** L'area di gioco comprende versioni giocabili di Piazza delle Erbe, Piazza della Frutta, Piazza dei Signori, il Ghetto e il Duomo, il Caffè Pedrocchi e la Basilica del Santo, collegate senza cambiare schermata.

> **Limiti precisi:** non è un prodotto AAA, fotorealistico o un facsimile topografico di Padova. Gli edifici restano procedurali e semplificati; non ci sono ancora motion capture, cinematics registrate, doppiaggio, cooperativa online, IA con navigazione completa, mappe 1:1 o modelli professionali acquisiti tramite scansione. I tempi di missione, progettati intorno a circa 3–6 minuti di gioco normale, variano con velocità e scelte del giocatore; non sono tempi minimi imposti artificialmente.

## Campagna: cinque missioni

| # | Missione | Luoghi | Eventi distintivi |
|---|---|---|---|
| 01 | **Cenere sotto i Portici** | Duomo, Ghetto, Piazza dei Signori | Incontro con Marta, recupero antibiotici, pattuglia, difesa dell'evacuazione (125 s), consegna |
| 02 | **La Frequenza Morta** | Piazza della Frutta, Piazza delle Erbe | Rocco, alleato della Guardia, radio, difesa a ondate (65 s), decodifica e ritorno |
| 03 | **L'Ultimo Corriere** | Caffè Pedrocchi, Frutta, Erbe | Borsa-trappola, imboscata, ritrovamento di Irene, scorta, scelta civili o armi |
| 04 | **Il Santo non Risponde** | Basilica del Santo, Erbe, Duomo | Ritrovamento Stefano, scorte, assedio degli Erranti (70 s), scorta e rientro |
| 05 | **La Notte delle Campane** | Erbe, Frutta, Signori, Duomo | Sabotaggio, combattimento, difesa (75 s), trasmissione pubblica o segreta, epilogo |

La storia è guidata, ma tra gli obiettivi la città è percorribile, con rifornimenti da raccogliere, zone occupate e personaggi alleati. Il progresso e le due decisioni narrative sono salvati localmente nel browser. Non usare la navigazione in incognito se vuoi conservare il salvataggio.

## Quattro protagonisti e classi

- **Lea Ferretti** — Esploratrice: velocità superiore, SMG, fumogene.
- **Nico Valenti** — Assalto: maggiore salute, M4, più granate.
- **Ada Mercuri** — Medico: più medicazioni, fucile a pompa.
- **Elio Sartori** — Tiratore scelto: maggiore precisione, DMR.

Sei armi equipaggiabili: carabina M4, pistola P12, fucile DMR, SMG V9, fucile a pompa e carabina AK. Munizioni, rinculo, tempi di ricarica, gittata e danni differenziati. Granate a frammentazione e fumogene sono disponibili in numero limitato. Alleati partecipano ai combattimenti; Marta, Rocco, Irene e Stefano intervengono nella storia.

## Comandi

| Azione | PC | Controller standard / DualShock 4* | Touch |
|---|---|---|---|
| Muoversi / visuale | WASD / mouse | Stick sinistro / destro | Stick virtuali |
| Sparare | Click sinistro | R2 | FUOCO |
| Ricaricare | R | Cerchio | RIC. |
| Interagire | E | Quadrato | USA |
| Cambiare arma | Q, tasti 1–6 | Triangolo | ARMA |
| Granata | G | R1 | GRAN. |
| Fumogena | T | L1 | FUMO |
| Cura | H | X | CURA |
| Correre | Shift | L3 | CORRI |
| Visuale | V | — | — |
| Mappa / diario | M / J | Freccia su / — | MAPPA / menu |
| Pausa | P / Esc | OPTIONS | Ⅱ |

*DualShock 4 fisico **non verificato** su tutte le combinazioni dispositivo/browser. La mappatura può variare fra browser e sistema operativo.

## Prestazioni e affidabilità

- Renderer 3D WebGL 1 autonomo, senza librerie JavaScript online; nessuna installazione e nessuna dipendenza runtime.
- La geometria statica è suddivisa in porzioni spaziali, disegnate soltanto entro un raggio di distanza dalla camera.
- Rendering limitato a 30 frame al secondo, qualità bassa predefinita sui dispositivi touch, scala dinamica al variare della qualità e riduzione automatica se gli FPS rimangono bassi.
- Umani procedurali più arrotondati e con arti animati, movimento della telecamera durante il passo, sagoma armi più dettagliata, fumo 3D.
- Verifiche di progressione automatizzate per **tutti i 29 checkpoint** della campagna, movimento, classi, inventario, scelte, mappa e pausa.

**Limite dei test:** l'ambiente automatizzato usato per la verifica non offre un contesto WebGL reale. I test JavaScript ricreano le interfacce GPU con un mock e verificano la logica, ma **non dimostrano** FPS reali, assenza di blocchi grafici o stabilità su uno specifico telefono, PC o controller fisico. Non viene promessa assenza assoluta di bug. Il tuo test sul dispositivo resta importante.

## Test

Serve Python, Chromium e Playwright installati; esegui:

```bash
python smoke_test.py
```

Lo script utilizza un contesto grafico simulato per testare la logica: non è un benchmark GPU.

## Direzione e attribuzione

CALL OF PADUA è un progetto indipendente, distinto da `padova-open-world`. È un'opera originale, non affiliata ad Activision o ai creatori di *The Last of Us*. Non vengono inclusi asset o personaggi protetti di altri giochi. Padova è un luogo reale; la storia e le fazioni sono inventate.

Per avvicinarsi alla qualità visiva richiesta serve una successiva pipeline professionale per modelli 3D architettonici, personaggi skinnati, animazioni e lightmaps/illuminazione moderna: non basta aggiungere poligoni al prototipo.
