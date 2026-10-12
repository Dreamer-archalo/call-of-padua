/* CALL OF PADUA — Echi del Silenzio / 0.4
   Original WebGL 1 procedural 3D environment. No game-engine dependency.
   World plan is a gameplay interpretation of Padova, not cadastral/cartographic data.
*/
(() => {
    'use strict';
    const $ = id => document.getElementById(id), cv = $('world'), gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: true, powerPreference: 'default' });
    if (!gl) {
        $('mainMenu').innerHTML = '<div class="panel"><h2>WEBGL NON DISPONIBILE</h2><p>Questo browser non supporta WebGL. Prova Chrome o Firefox con accelerazione hardware.</p></div>';
        return;
    }
    const PI = Math.PI, TAU = PI * 2, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, t) => a + (b - a) * t, dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z), rnd = (a, b) => a + Math.random() * (b - a);
    const cfg = { quality: matchMedia('(pointer:coarse)').matches ? 'low' : 'medium', sensitivity: 1.4, autoAim: true };
    let renderHz=30, renderedAt=0, perfPenalty=0;
    let freeze = false, fullscreen = false;
    const chars = {
      lea:{name:'Lea Ferretti',role:'ESPLORATRICE',weapon:3,med:3,hp:100,coat:[.27,.39,.35],speed:1.14,accuracy:.72,smoke:2,grenades:1,ability:'PASSO LEGGERO'},
      nico:{name:'Nico Valenti',role:'ASSALTO',weapon:0,med:2,hp:120,coat:[.33,.29,.24],speed:1,accuracy:1,smoke:1,grenades:3,ability:'CARICA FRONTALE'},
      ada:{name:'Ada Mercuri',role:'MEDICO',weapon:4,med:6,hp:105,coat:[.25,.34,.32],speed:1.03,accuracy:1,smoke:2,grenades:1,ability:'PRIMO SOCCORSO'},
      elio:{name:'Elio Sartori',role:'TIRATORE SCELTO',weapon:2,med:2,hp:95,coat:[.35,.37,.36],speed:.94,accuracy:.44,smoke:1,grenades:2,ability:'COLPO PRECISO'}
    };
    const weaponData = [
      {name:'CARABINA M4',mag:30,delay:.115,damage:33,range:105,spread:.024,reload:1.75,kind:'rifle'},
      {name:'PISTOLA P12',mag:15,delay:.24,damage:43,range:55,spread:.031,reload:1.18,kind:'pistol'},
      {name:'FUCILE DMR',mag:12,delay:.43,damage:74,range:190,spread:.009,reload:2.3,kind:'dmr'},
      {name:'SMG V9',mag:36,delay:.085,damage:22,range:50,spread:.046,reload:1.55,kind:'smg'},
      {name:'FUCILE A POMPA',mag:7,delay:.73,damage:86,range:25,spread:.085,reload:2.15,kind:'shotgun'},
      {name:'CARABINA AK',mag:30,delay:.145,damage:42,range:97,spread:.036,reload:2.0,kind:'rifle'}
    ];
    // Five scripted chapters / 30 checkpoints. Target duration 3–6 minutes per chapter at normal pace;
    // times depend on player movement, difficulty and choices, not a fake completion timer.
    const chapterData=[
      {title:'01 / CENERE SOTTO I PORTICI',blurb:'Rifornire il Duomo senza attirare la Milizia delle Torri.'},
      {title:'02 / LA FREQUENZA MORTA',blurb:'Rianimare la radio delle Erbe e sopravvivere alla risposta.'},
      {title:'03 / L’ULTIMO CORRIERE',blurb:'Una staffetta scomparsa al Pedrocchi, una scelta che costa cara.'},
      {title:'04 / IL SANTO NON RISPONDE',blurb:'Un soccorso nella zona infetta che si trasforma in assedio.'},
      {title:'05 / LA NOTTE DELLE CAMPANE',blurb:'Prendere il controllo della frequenza e decidere a chi affidare Padova.'}
    ];
    const objectiveData=[
      {title:'Parla con Marta',sub:'La responsabile del rifugio ti aspetta al Duomo.',at:{x:-165,z:79},tag:'MARTA',ch:'I — CENERE',kind:'talk',speaker:'MARTA',lines:['Ci servono antibiotici. E non ci resta molto tempo.','La vecchia farmacia dei Signori è rimasta intatta, ma qualcuno sta cercando lo stesso bottino.','Se senti degli spari, non voltarti: abbiamo bisogno che tu torni.']},
      {title:'Attraversa il Ghetto',sub:'Raggiungi il passaggio a ovest dei Signori.',at:{x:-126,z:45},tag:'PASSAGGIO',ch:'I — CENERE',kind:'reach'},
      {title:'Recupera gli antibiotici',sub:'Ispeziona la farmacia in Piazza dei Signori.',at:{x:-113,z:12},tag:'FARMACIA',ch:'I — CENERE',kind:'use',action:'medicine'},
      {title:'Proteggi la via del Ghetto',sub:'Copri i civili fino al termine dell’evacuazione: 125 secondi.',at:{x:-150,z:58},tag:'EVACUAZIONE',ch:'I — CENERE',kind:'hold',seconds:125,spawn:'raiders'},
      {title:'Consegna le scorte',sub:'Rientra al Duomo e parla con Marta.',at:{x:-165,z:79},tag:'RIFUGIO',ch:'I — CENERE',kind:'talk',speaker:'MARTA',lines:['Hai salvato la piccola Anna. Non è una vittoria da poco.','Ma la farmacia non era vuota: qualcuno ha portato via le nostre frequenze radio.','Rocco vuole parlarti. Ha visto dove vanno i convogli.']},
      {title:'Ottieni le frequenze da Rocco',sub:'Preparati a uscire: potresti avere bisogno di rinforzi.',at:{x:-150,z:99},tag:'ROCCO',ch:'II — RADIO',kind:'talk',speaker:'ROCCO',lines:['Le Torri ascoltano ogni segnale. Abbiamo un vecchio ripetitore alle Erbe.','Ti affido una batteria. Quando trasmetterai, la città saprà dove sei.','La Guardia ci darà una mano, almeno finché non capirà cosa stiamo facendo.']},
      {title:'Raggiungi Piazza della Frutta',sub:'Passa a nord del Palazzo della Ragione.',at:{x:0,z:-54},tag:'FRUTTA',ch:'II — RADIO',kind:'reach'},
      {title:'Attiva il ripetitore delle Erbe',sub:'Ripristina la corrente e avvia il segnale.',at:{x:13,z:58},tag:'RADIO',ch:'II — RADIO',kind:'use',action:'radio'},
      {title:'Difendi la trasmissione',sub:'Resisti all’assalto: ondate ostili e countdown di 65 s.',at:{x:13,z:58},tag:'DIFENDI',ch:'II — RADIO',kind:'hold',seconds:65,spawn:'radio'},
      {title:'Decifra il messaggio',sub:'Torna al pannello radio e registra la voce.',at:{x:13,z:58},tag:'RIPETITORE',ch:'II — RADIO',kind:'use',action:'radio'},
      {title:'Riferisci a Marta',sub:'La registrazione contiene un nome: Irene.',at:{x:-165,z:79},tag:'MARTA',ch:'II — RADIO',kind:'talk',speaker:'MARTA',lines:['Irene era la nostra staffetta. Se è viva, conosce la via verso il Santo.','Il segnale arriva dal Pedrocchi. Vai, ma evita di farti seguire.']},
      {title:'Trova il segnale al Pedrocchi',sub:'Esplora la zona dei portici universitari.',at:{x:165,z:-40},tag:'PEDROCCHI',ch:'III — CORRIERE',kind:'reach'},
      {title:'Cerca la borsa del corriere',sub:'Il segnale arriva da una bancarella distrutta.',at:{x:175,z:-38},tag:'BORSA',ch:'III — CORRIERE',kind:'use',action:'bag'},
      {title:'Sopravvivi all’imboscata',sub:'I predoni ti hanno chiuso la via di fuga.',at:{x:160,z:-40},tag:'IMBOSCATA',ch:'III — CORRIERE',kind:'clear',spawn:'ambush'},
      {title:'Raggiungi Irene',sub:'Trova la staffetta nascosta alla Frutta.',at:{x:34,z:-58},tag:'IRENE',ch:'III — CORRIERE',kind:'talk',speaker:'IRENE',lines:['La borsa era un’esca. Ci sono riusciti: siamo circondati.','Conosco un passaggio, ma non lascerò il mio compagno ferito.', 'Se vuoi la posizione del Santo, devi prima portarmi verso un luogo sicuro.']},
      {title:'Accompagna Irene alle Erbe',sub:'Proteggi Irene durante l’attraversamento.',at:{x:-7,z:70},tag:'ESTRAZIONE',ch:'III — CORRIERE',kind:'reach',spawn:'escort'},
      {title:'Scegli cosa salvare',sub:'Irene ha due informazioni. Decidi quale seguire.',at:{x:-7,z:70},tag:'DECISIONE',ch:'III — CORRIERE',kind:'choice',choices:['METTI IN SALVO I CIVILI','RECUPERA LE ARMI DELLE TORRI']},
      {title:'Parti per la Basilica',sub:'Una nuova voce chiama dal Santo.',at:{x:125,z:145},tag:'SANTO',ch:'IV — BASILICA',kind:'reach'},
      {title:'Trova Stefano',sub:'Il sopravvissuto è accanto alla Basilica.',at:{x:135,z:179},tag:'STEFANO',ch:'IV — BASILICA',kind:'talk',speaker:'STEFANO',lines:['Sono qui da tre giorni. Hanno bloccato tutti gli accessi.','Gli Erranti hanno preso il chiostro. Servono le medicine per gli altri.','Dammi copertura e tornerò con te.']},
      {title:'Recupera il kit medico',sub:'Cerca tra i resti vicino al Santo.',at:{x:177,z:185},tag:'SCORTE',ch:'IV — BASILICA',kind:'use',action:'medicine'},
      {title:'Difendi il sopravvissuto',sub:'Resisti per 70 secondi; la polvere richiama gli Erranti.',at:{x:139,z:177},tag:'ASSEDIO',ch:'IV — BASILICA',kind:'hold',seconds:70,spawn:'infected'},
      {title:'Apri la via di fuga',sub:'Raggiungi il fuoristrada abbandonato.',at:{x:76,z:121},tag:'USCITA',ch:'IV — BASILICA',kind:'reach'},
      {title:'Riporta Stefano al Duomo',sub:'Non perderlo e raggiungi il rifugio.',at:{x:-165,z:79},tag:'MARTA',ch:'IV — BASILICA',kind:'talk',speaker:'MARTA',lines:['Stefano è vivo. Ora sappiamo che non siamo soli.','Ma le Torri preparano un attacco. Il prossimo segnale sarà l’ultimo.','Se la trasmissione parte, tutte le fazioni sapranno che siamo qui.']},
      {title:'Entra nell’avamposto delle Erbe',sub:'Raggiungi il settore conteso.',at:{x:-24,z:67},tag:'AVAMPOSTO',ch:'V — CAMPANE',kind:'reach'},
      {title:'Sabota il generatore',sub:'Disattiva le comunicazioni delle Torri alla Frutta.',at:{x:0,z:-55},tag:'GENERATORE',ch:'V — CAMPANE',kind:'use',action:'generator'},
      {title:'Elimina i rinforzi',sub:'La Milizia ha localizzato la tua posizione.',at:{x:0,z:-55},tag:'RINFORZI',ch:'V — CAMPANE',kind:'clear',spawn:'finale'},
      {title:'Resisti in Piazza dei Signori',sub:'Proteggi il segnale per 75 secondi.',at:{x:-122,z:-2},tag:'DIFENDI',ch:'V — CAMPANE',kind:'hold',seconds:75,spawn:'siege'},
      {title:'Decidi il futuro del rifugio',sub:'Pubblicare il segnale o proteggere la posizione?',at:{x:-122,z:-2},tag:'LA SCELTA',ch:'V — CAMPANE',kind:'choice',choices:['TRASMETTI A TUTTI I SOPRAVVISSUTI','NASCONDI IL RIFUGIO ALLE TORRI']},
      {title:'Torna da Marta',sub:'Racconta la tua decisione e chiudi la campagna.',at:{x:-165,z:79},tag:'RIFUGIO',ch:'V — CAMPANE',kind:'talk',speaker:'MARTA',lines:['Abbiamo perso molto, ma non il diritto di scegliere.','Ogni famiglia conoscerà la nostra decisione.','Il futuro non è sicuro, però Padova ha ricominciato a parlare.']},
      {title:'PADOVA / ESPLORAZIONE LIBERA',sub:'Campagna conclusa. Esplora la città e aiuta il rifugio.',at:{x:0,z:40},tag:'LIBERO',ch:'EPILOGO',kind:'free'}
    ];
    const missionFromStage=q=>q<5?0:q<11?1:q<17?2:q<23?3:q<29?4:5;
    const S = { mode: 'menu', char: 'lea', p: { x: -200, z: 119, yaw: 1.10, pitch: -.07, hp: 100, vy: 0 }, camera: 'fps', quest: 0, med: 2, scrap: 0, weapon: 0, ammo: [30, 15, 12, 36, 7, 30], reserve: [150, 75, 60, 180, 35, 120], reloadUntil: 0, lastShot: -20, recoil: 0, kills: 0, injured: 0, time: 0, combatTime: 0, location: '', inVehicle: false, vehicleSpeed: 0, dialogue: null, diagIndex: 0, convCallback: null, toastUntil: 0, zoneUntil: 0, shake: 0, muted: false, grenades:1,smoke:2,smokeClouds:[],grenadeFlight:[],currentChapter:0,stageStart:0,chapterStart:0,chapterTimes:[0,0,0,0,0],branch:{},waveEnd:0,waveIds:[],stageArmed:false,headbob:0,walkAmount:0,allyMode:'follow' };
    let enemies = [], allies = [], props = [], smokes = [], colliders = [], meshes = [], objects = [], npcTemplates = [], botSeq = 0;
    const key = new Set();
    const mouse = { dx: 0, dy: 0, down: false }, touchInput = { move: { x: 0, y: 0, id: null }, look: { x: 0, y: 0, id: null }, shoot: false, sprint: false }, padState = [];
    let last = performance.now(), frameCounter = 0, frameTimer = 0, frameFPS = 60, frameskip = 0, nowSec = 0, audioCtx;
    function vec(x, y, z) { return { x, y, z }; }
    function v3add(a, b) { return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }; }
    function matPerspective(fov, aspect, near, far) { const f = 1 / Math.tan(fov / 2), r = 1 / (near - far); return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * r, -1, 0, 0, 2 * far * near * r, 0]); }
    function matLookAt(e, t) { let zx = e.x - t.x, zy = e.y - t.y, zz = e.z - t.z; let l = Math.hypot(zx, zy, zz) || 1; zx /= l; zy /= l; zz /= l; let xx = zz, xz = -zx; l = Math.hypot(xx, xz) || 1; xx /= l; xz /= l; let yx = zy * xz, yy = zz * xx - zx * xz, yz = -zy * xx; return new Float32Array([xx, yx, zx, 0, 0, yy, zy, 0, xz, yz, zz, 0, -(xx * e.x + xz * e.z), -(yx * e.x + yy * e.y + yz * e.z), -(zx * e.x + zy * e.y + zz * e.z), 1]); }
    const VS = `attribute vec3 aPos; attribute vec3 aNormal; attribute vec2 aUV; attribute float aTile; attribute vec3 aColor; uniform mat4 uProj,uView; varying vec2 vUV;varying float vTile,vFog;varying vec3 vCol;void main(){vec4 v=uView*vec4(aPos,1.);gl_Position=uProj*v;vUV=aUV;vTile=aTile;float sun=max(dot(normalize(aNormal),normalize(vec3(.42,.83,.37))),0.);float diff=.52+.47*sun;vCol=aColor*diff;vFog=clamp((-v.z-18.)/205.,0.,1.);}`;
    const FS = `precision mediump float;uniform sampler2D uAtlas;uniform vec3 uFog;uniform float uOpacity;varying vec2 vUV;varying float vTile,vFog;varying vec3 vCol;void main(){float tile=floor(vTile+.5);vec2 cell=vec2(mod(tile,4.),floor(tile/4.));vec2 uv=(cell+vec2(.018)+fract(vUV)*.964)/4.;vec3 tx=texture2D(uAtlas,uv).rgb;vec3 col=tx*vCol;col=mix(col,uFog,vFog*vFog*.93);gl_FragColor=vec4(col,uOpacity);}`;
    function shader(type, src) { let s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw Error(gl.getShaderInfoLog(s)); return s; }
    const program = gl.createProgram();
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        throw Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const A = { pos: gl.getAttribLocation(program, 'aPos'), normal: gl.getAttribLocation(program, 'aNormal'), uv: gl.getAttribLocation(program, 'aUV'), tile: gl.getAttribLocation(program, 'aTile'), color: gl.getAttribLocation(program, 'aColor') };
    const U = { proj: gl.getUniformLocation(program, 'uProj'), view: gl.getUniformLocation(program, 'uView'), fog: gl.getUniformLocation(program, 'uFog'), atlas: gl.getUniformLocation(program, 'uAtlas'),opacity:gl.getUniformLocation(program,'uOpacity') };
    // 4x4 atlas: 0 road,1 stone,2 stucco,3 brick,4 roof,5 concrete,6 wood,7 dark metal,
    // 8 glass,9 foliage,10 bark,11 debris,12 canvas,13 rust,14 grass,15 earth.
    function seeded(n) { n = (n * 1664525 + 1013904223) >>> 0; return [n, n / 4294967295]; }
    function createAtlas() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const c = canvas.getContext('2d');
        let seed = 42;
        function rand() { let a = seeded(seed); seed = a[0]; return a[1]; }
        ;
        const bases = ['#555b55', '#87877b', '#b6a691', '#987869', '#6f524b', '#8c9188', '#5f503d', '#444944', '#495a59', '#556546', '#4b4030', '#777069', '#8d8971', '#70584a', '#5f6750', '#726958'];
        for (let t = 0; t < 16; t++) {
            let sx = t % 4 * 128, sy = Math.floor(t / 4) * 128;
            c.fillStyle = bases[t];
            c.fillRect(sx, sy, 128, 128);
            c.save();
            c.beginPath();
            c.rect(sx, sy, 128, 128);
            c.clip();
            // Fine irregular grain / stains.
            for (let i = 0; i < 380; i++) {
                const x = sx + rand() * 128, y = sy + rand() * 128, r = rand() * 8 + .3;
                c.globalAlpha = rand() * .16;
                c.fillStyle = rand() > .48 ? '#d9cbb2' : '#161f1c';
                c.fillRect(x, y, r, r * (rand() + .3));
            }
            c.globalAlpha = 1;
            if ([1, 3, 4, 5, 11].includes(t)) {
                const rows = t === 1 ? 11 : t === 4 ? 16 : 15, step = 128 / rows;
                for (let j = 0; j < rows; j++) {
                    let offset = j % 2 ? step * .55 : 0;
                    c.strokeStyle = t === 3 ? '#5f463d' : '#393f3c';
                    c.globalAlpha = t === 3 ? .5 : .34;
                    c.lineWidth = 1.7;
                    c.beginPath();
                    c.moveTo(sx, sy + j * step);
                    c.lineTo(sx + 128, sy + j * step);
                    c.stroke();
                    for (let x = -1; x < rows * 2 + 2; x++) {
                        const xx = sx + offset + x * step * (t === 1 ? 2 : 2.6);
                        c.beginPath();
                        c.moveTo(xx, sy + j * step);
                        c.lineTo(xx, sy + (j + 1) * step);
                        c.stroke();
                    }
                }
                c.globalAlpha = 1;
            }
            if (t === 2) {
                for (let k = 0; k < 28; k++) {
                    c.fillStyle = rand() > .5 ? '#655f50' : '#e3d5bb';
                    c.globalAlpha = rand() * .23;
                    c.beginPath();
                    c.ellipse(sx + rand() * 128, sy + rand() * 128, rand() * 35 + 5, rand() * 29 + 5, 0, 0, TAU);
                    c.fill();
                }
                c.globalAlpha = 1;
            }
            if (t === 0 || t === 15) {
                for (let i = 0; i < 15; i++) {
                    let x = sx + rand() * 128, y = sy + rand() * 128;
                    c.strokeStyle = '#292d29';
                    c.globalAlpha = .25;
                    c.beginPath();
                    c.moveTo(x, y);
                    c.lineTo(x + rand() * 24 - 12, y + rand() * 31);
                    c.stroke();
                }
                c.globalAlpha = 1;
            }
            if (t === 6 || t === 10) {
                for (let i = 0; i < 12; i++) {
                    c.strokeStyle = '#251e18';
                    c.globalAlpha = .2;
                    c.beginPath();
                    c.moveTo(sx + i * 24, sy);
                    c.lineTo(sx + i * 23 + 6, sy + 128);
                    c.stroke();
                }
                c.globalAlpha = 1;
            }
            if (t === 8) {
                c.globalAlpha = .4;
                c.fillStyle = '#131d20';
                c.fillRect(sx + 6, sy + 6, 116, 116);
                c.fillStyle = '#879a91';
                c.fillRect(sx + 18, sy + 18, 70, 4);
                c.fillRect(sx + 35, sy + 25, 4, 100);
                c.globalAlpha = 1;
            }
            if (t === 9 || t === 14) {
                for (let i = 0; i < 140; i++) {
                    let x = sx + rand() * 128, y = sy + rand() * 128;
                    c.fillStyle = rand() > .45 ? '#849271' : '#233d30';
                    c.globalAlpha = .3 + rand() * .55;
                    c.beginPath();
                    c.ellipse(x, y, rand() * 6 + 1, rand() * 3 + 1, rand() * PI, 0, TAU);
                    c.fill();
                }
                c.globalAlpha = 1;
            }
            if (t === 13) {
                for (let i = 0; i < 34; i++) {
                    c.fillStyle = rand() > .5 ? '#b5794f' : '#333a35';
                    c.globalAlpha = .2;
                    c.beginPath();
                    c.ellipse(sx + rand() * 128, sy + rand() * 128, rand() * 20 + 5, rand() * 25 + 5, 0, 0, TAU);
                    c.fill();
                }
                c.globalAlpha = 1;
            }
            c.restore();
        }
        const tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        return tex;
    }
    createAtlas();
    gl.uniform1i(U.atlas, 0);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
    gl.clearColor(.51, .59, .58, 1);
    let staticMesh = [], staticBuffer, staticChunks=[], staticCount = 0, dynamicBuffer = gl.createBuffer(), dynamicCount = 0;
    const C = { white: [1, 1, 1], tan: [.98, .92, .82], grey: [.85, .87, .82], dark: [.45, .50, .47], rust: [.8, .65, .54], green: [.63, .78, .58], blue: [.66, .75, .77], brown: [.66, .57, .46] };
    function tri(arr, a, b, c, n, uv, t, col) { for (const [p, u] of [[a, uv[0]], [b, uv[1]], [c, uv[2]]])
        arr.push(p[0], p[1], p[2], n[0], n[1], n[2], u[0], u[1], t, col[0], col[1], col[2]); }
    function quad(arr, a, b, c, d, n, t, col = C.white, scale = 1) { const w = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]) * scale, h = Math.hypot(d[0] - a[0], d[1] - a[1], d[2] - a[2]) * scale; tri(arr, a, b, c, n, [[0, 0], [w, 0], [w, h]], t, col); tri(arr, a, c, d, n, [[0, 0], [w, h], [0, h]], t, col); }
    function box(arr, x, y, z, w, h, d, t = 2, col = C.white) { let x0 = x - w / 2, x1 = x + w / 2, z0 = z - d / 2, z1 = z + d / 2, ya = y, yb = y + h; quad(arr, [x0, ya, z1], [x1, ya, z1], [x1, yb, z1], [x0, yb, z1], [0, 0, 1], t, col, .22); quad(arr, [x1, ya, z0], [x0, ya, z0], [x0, yb, z0], [x1, yb, z0], [0, 0, -1], t, col, .22); quad(arr, [x0, ya, z0], [x0, ya, z1], [x0, yb, z1], [x0, yb, z0], [-1, 0, 0], t, col, .22); quad(arr, [x1, ya, z1], [x1, ya, z0], [x1, yb, z0], [x1, yb, z1], [1, 0, 0], t, col, .22); quad(arr, [x0, yb, z0], [x0, yb, z1], [x1, yb, z1], [x1, yb, z0], [0, 1, 0], t, col, .23); }
    function ground(arr, x, z, w, d, t = 1, col = C.white, y = .02) { quad(arr, [x - w / 2, y, z - d / 2], [x + w / 2, y, z - d / 2], [x + w / 2, y, z + d / 2], [x - w / 2, y, z + d / 2], [0, 1, 0], t, col, .14); }
    function ramp(arr, x, y, z, w, d, h, t = 4, col = C.white) { quad(arr, [x - w / 2, y, z - d / 2], [x + w / 2, y, z - d / 2], [x + w / 2, y + h, z + d / 2], [x - w / 2, y + h, z + d / 2], [0, .8, -.6], t, col, .22); }
    function prismRoof(arr, x, z, w, d, y, h = 3) { const v = [x - w / 2, x + w / 2], q = [z - d / 2, z + d / 2]; for (const side of [-1, 1]) {
        let zz = side < 0 ? q[0] : q[1];
        quad(arr, [v[0], y, zz], [v[1], y, zz], [v[1], y + h, z], [v[0], y + h, z], [0, .6, side * .8], 4, C.tan, .24);
    } }
    function cylinder(arr, x, y, z, r, h, segments = 8, t = 10, col = C.white) { for (let i = 0; i < segments; i++) {
        let a = i * TAU / segments, b = (i + 1) * TAU / segments;
        let n = [Math.cos((a + b) / 2), 0, Math.sin((a + b) / 2)];
        quad(arr, [x + Math.cos(a) * r, y, z + Math.sin(a) * r], [x + Math.cos(b) * r, y, z + Math.sin(b) * r], [x + Math.cos(b) * r, y + h, z + Math.sin(b) * r], [x + Math.cos(a) * r, y + h, z + Math.sin(a) * r], n, t, col, .28);
    } }
    function foliage(arr, x, y, z, r = 2) { cylinder(arr, x - 0.35, y, z, r * .8, r * 1.5, 7, 9, C.green); cylinder(arr, x + 0.9, y + .6, z + .2, r * .74, r, 7, 9, C.green); cylinder(arr, x, y + .9, z, r * .85, r * 1.4, 7, 9, C.grey); }
    function pushCollision(x, z, w, d) { colliders.push({ x, z, w, d }); }
    function building(x, z, w, d, h, seed = 1, kind = 2) {
        box(staticMesh, x, 0, z, w, h, d, kind, [.83 + ((seed % 4) * .05), .79 + ((seed % 3) * .05), .73 + ((seed % 2) * .06)]);
        pushCollision(x, z, w + 1, d + 1);
        prismRoof(staticMesh, x, z, w + 1, d + 1, h, 2.4);
        const floors = Math.min(5, Math.floor((h - 2) / 3.6));
        for (let f = 0; f < floors; f++)
            for (const side of [0, 1, 2, 3]) {
                let length = side < 2 ? w : d, count = Math.max(1, Math.min(7, Math.floor(length / 4.5)));
                for (let i = 0; i < count; i++) {
                    if ((i + seed * 2 + f * 3) % 13 === 0)
                        continue;
                    let py = 2.7 + f * 3.65, wh = 2.12, wx = 1.36, c = (i + .5) * length / count - length / 2;
                    if (side === 0) {
                        let xx = x + c, zz = z + d / 2 + .065;
                        quad(staticMesh, [xx - wx / 2, py - wh / 2, zz], [xx + wx / 2, py - wh / 2, zz], [xx + wx / 2, py + wh / 2, zz], [xx - wx / 2, py + wh / 2, zz], [0, 0, 1], 8, C.grey, .55);
                    }
                    else if (side === 1) {
                        let xx = x + c, zz = z - d / 2 - .065;
                        quad(staticMesh, [xx + wx / 2, py - wh / 2, zz], [xx - wx / 2, py - wh / 2, zz], [xx - wx / 2, py + wh / 2, zz], [xx + wx / 2, py + wh / 2, zz], [0, 0, -1], 8, C.grey, .55);
                    }
                    else if (side === 2) {
                        let zz = z + c, xx = x + w / 2 + .065;
                        quad(staticMesh, [xx, py - wh / 2, zz + wx / 2], [xx, py - wh / 2, zz - wx / 2], [xx, py + wh / 2, zz - wx / 2], [xx, py + wh / 2, zz + wx / 2], [1, 0, 0], 8, C.grey, .55);
                    }
                    else {
                        let zz = z + c, xx = x - w / 2 - .065;
                        quad(staticMesh, [xx, py - wh / 2, zz - wx / 2], [xx, py - wh / 2, zz + wx / 2], [xx, py + wh / 2, zz + wx / 2], [xx, py + wh / 2, zz - wx / 2], [-1, 0, 0], 8, C.grey, .55);
                    }
                }
            }
        box(staticMesh, x, h - .38, z, w + .4, .3, d + .4, 5, C.grey);
        if (seed % 4 === 0)
            box(staticMesh, x, 0, z + d / 2 + .06, w, 1.15, .17, 11, C.rust);
    }
    function arcade(x, z, len, depth, height, count) {
        for (let k = 0; k < count; k++) {
            let mid = x - len / 2 + (k + .5) * len / count;
            let step = len / count;
            let seg = 9;
            for (let s = 0; s < seg; s++) {
                let left = mid - step * .41 + s * step * .82 / seg, right = mid - step * .41 + (s + 1) * step * .82 / seg;
                let theta1 = PI - (s / seg) * PI, theta2 = PI - ((s + 1) / seg) * PI;
                let y1 = height * .57 + Math.sin(theta1) * height * .33, y2 = height * .57 + Math.sin(theta2) * height * .33;
                quad(staticMesh, [left, y1, z + depth / 2 + .14], [right, y2, z + depth / 2 + .14], [right, height, z + depth / 2 + .14], [left, height, z + depth / 2 + .14], [0, 0, 1], 2, C.tan, .3);
            }
            box(staticMesh, mid - step * .47, 0, z + depth / 2 + .7, .55, height, 1.25, 5, C.tan);
            box(staticMesh, mid + step * .47, 0, z + depth / 2 + .7, .55, height, 1.25, 5, C.tan);
        }
        box(staticMesh, x, height, z + depth / 2 + .1, len + .8, .55, 2.6, 5, C.tan);
    }
    function tree(x, z, scale = 1) { cylinder(staticMesh, x, 0, z, .34 * scale, 4.9 * scale, 7, 10, C.brown); foliage(staticMesh, x, 3.1 * scale, z, 1.95 * scale); }
    function rubble(x, z, scale = 1) { for (let i = 0; i < 7; i++) {
        let a = i * 2.4, rr = (i % 3) * .7 * scale + .2;
        box(staticMesh, x + Math.sin(a) * rr, 0, z + Math.cos(a) * rr, (.55 + i % 3 * .3) * scale, (.2 + i % 3 * .16) * scale, (.8 + i % 4 * .25) * scale, 11, i % 2 ? C.grey : C.tan);
    } }
    function barrel(x, z) { cylinder(staticMesh, x, 0, z, .55, 1.2, 9, 13, C.grey); box(staticMesh, x, .31, z, 1.11, .13, 1.11, 7, C.grey); box(staticMesh, x, 1.0, z, 1.11, .12, 1.11, 7, C.grey); }
    function fence(x, z, w, d) { box(staticMesh, x, 0, z, w, 1.75, d, 6, C.brown); box(staticMesh, x, 1.32, z, w, 0.13, d + .08, 7, C.dark); }
    function wreck(x, z, angle = 0, olive = false) { const a = { x, z, angle, olive }; props.push({ ...a, type: 'wreck' }); const arr = staticMesh; function add(w, h, d, dy, mat, col) { box(arr, x, dy, z, w, h, d, mat, col); } add(3.8, .9, 6.2, .5, olive ? 7 : 13, olive ? C.green : C.rust); add(3.2, 1.15, 3.4, 1.4, 7, C.dark); for (let k of [-1, 1])
        for (let l of [-1, 1]) {
            cylinder(arr, x + k * 1.94, .25, z + l * 1.9, .61, .22, 10, 7, C.dark);
        } add(2.6, .12, 3.0, 2.58, 13, C.rust); }
    function bench(x, z) { box(staticMesh, x, .7, z, 2.7, .2, .7, 6, C.brown); for (const i of [-1, 1])
        box(staticMesh, x + i * .98, 0, z, .17, .7, .67, 7, C.dark); box(staticMesh, x, .8, z - .28, 2.7, .85, .17, 6, C.brown); }
    function water(x, z, w, d) { ground(staticMesh, x, z, w, d, 8, [.55, .63, .61], .04); }
    function lightPost(x, z) { cylinder(staticMesh, x, 0, z, .14, 7.1, 7, 7, C.dark); box(staticMesh, x, 6.8, z, .9, .25, .8, 7, C.grey); box(staticMesh, x, 6.5, z, .6, .11, .54, 12, C.tan); }
    function market(x, z) { for (let i = 0; i < 4; i++) {
        let xx = x + i * 5.4;
        box(staticMesh, xx, .9, z, 3.8, .18, 2.4, 6, C.brown);
        for (let side of [-1, 1]) {
            box(staticMesh, xx + side * 1.7, 0, z, .12, 2.5, .12, 6, C.grey);
            box(staticMesh, xx + side * 1.7, 0, z + 1, .12, 2.5, .12, 6, C.grey);
        }
        ramp(staticMesh, xx, 2.25, z, 4.4, 2.65, 1, 12, i % 2 ? C.tan : C.rust);
        rubble(xx, z + 2.2, .55);
    } }
    function loot(x, z, type = 'scrap', amount = 2) { props.push({ x, z, type, amount, taken: false }); box(staticMesh, x, 0, z, 1.05, .65, .8, type === 'med' ? 12 : 6, type === 'med' ? C.grey : C.brown); box(staticMesh, x, .35, z, 1.1, .08, .85, 7, C.dark); }
    function station(x, z) { props.push({ x, z, type: 'radio' }); box(staticMesh, x, 0, z, 2.2, 1.4, 1.8, 7, C.dark); box(staticMesh, x, 1.28, z, 1.0, .35, .2, 8, C.green); cylinder(staticMesh, x + .5, 1.4, z - .1, .05, 3.8, 6, 7, C.dark); }
    function drugstore(x, z) { props.push({ x, z, type: 'medicine', taken: false }); box(staticMesh, x, 0, z, 2.1, 1.7, 1.4, 6, C.brown); box(staticMesh, x, 1.6, z, 2.1, .2, 1.4, 11, C.grey); box(staticMesh, x, 1.8, z, 1.2, .35, .1, 12, C.tan); }
    function manor() {
        const x = 0, z = -11, w = 91, d = 30;
        box(staticMesh, x, 0, z, w, 17, d, 2, C.tan);
        pushCollision(x, z, w, d);
        for (let s of [-1, 1]) {
            const zz = z + s * (d / 2 + .15);
            arcade(x, zz, 88, 0, 7.0, 16);
            for (let i = 0; i < 15; i++) {
                let xx = -40 + i * 5.8;
                box(staticMesh, xx, 11.3, zz, 1.55, 3.1, .16, 8, C.grey);
                box(staticMesh, xx, 10.95, zz, 1.94, .22, .25, 5, C.tan);
            }
        }
        for (let i = 0; i < 24; i++) {
            let zz = z - d / 2 + (i + .5) * d / 24;
            let r = Math.sin(i / 24 * PI) * 5;
            box(staticMesh, x, 17 + r, zz, 93, .34, d / 24 + 0.1, 4, C.rust);
        }
        box(staticMesh, 0, 17, z, 92, 1, 31, 5, C.brown);
        for (let k = 0; k < 3; k++) {
            box(staticMesh, 0, 21.6, z - 8 + k * 8, 91, .2, .25, 6, C.dark);
        }
    }
    function duomo() { building(-169, 4, 54, 38, 24, 2, 5); box(staticMesh, -169, 24, 4, 56, 3, 39, 5, C.grey); box(staticMesh, -169, 27, 4, 49, 4, 30, 4, C.tan); for (let i of [-1, 1]) {
        box(staticMesh, -169 + i * 14, 0, 23.5, 7, 20, 1.1, 5, C.tan);
        box(staticMesh, -169 + i * 14, 15, 24.4, 3.5, 4, .15, 8, C.grey);
    } box(staticMesh, -169, 2, 24.3, 8, 11, .3, 7, C.dark); }
    function santo() { const x = 137, z = 214; box(staticMesh, x, 0, z, 72, 20, 49, 5, C.tan); pushCollision(x, z, 72, 49); for (let s = -1; s <= 1; s++) {
        cylinder(staticMesh, x + s * 21, 20, z, 13, 6, 16, 5, C.tan);
        cylinder(staticMesh, x + s * 21, 26, z, 8, 6, 16, 4, C.grey);
        cylinder(staticMesh, x + s * 21, 32, z, 2, 3, 10, 5, C.tan);
    } for (let j of [-1, 1]) {
        box(staticMesh, x + j * 37, 0, z, 8, 36, 8, 3, C.grey);
        box(staticMesh, x + j * 37, 37, z, 10, 4, 10, 4, C.rust);
    } }
    function city() {
        staticMesh = [];
        colliders = [];
        props = [];
        ground(staticMesh, 0, 50, 590, 720, 14, C.grey, -.08);
        ground(staticMesh, 0, 52, 490, 500, 0, C.grey, -.04);
        // Interconnecting piazzas and pedestrian alleys.
        for (const sq of [[0, 55, 115, 79], [0, -59, 115, 57], [-122, -2, 106, 76], [-169, 86, 78, 75], [138, 166, 121, 111], [163, -38, 115, 84]])
            ground(staticMesh, ...sq, 1, C.tan);
        for (const road of [[-77, 53, 50, 29], [-130, 43, 35, 18], [80, 75, 40, 18], [117, 106, 20, 90], [119, -1, 20, 134], [-52, -100, 19, 130], [-81, 137, 21, 128], [15, 133, 19, 135]])
            ground(staticMesh, ...road, 1, C.grey, .03);
        // Water canal / bridges and green edge.
        water(-207, -90, 11, 180);
        ground(staticMesh, -207, -55, 22, 10, 1, C.tan, .11);
        ground(staticMesh, -207, 36, 22, 11, 1, C.tan, .11);
        manor();
        duomo();
        santo(); // Important landmarks.
        // Torre dell'Orologio at Piazza dei Signori.
        building(-121, -49, 32, 20, 20, 3, 3);
        box(staticMesh, -121, 19, -49, 17, 24, 12, 5, C.tan);
        box(staticMesh, -121, 42, -49, 17, 3, 15, 4, C.rust);
        box(staticMesh, -121, 31, -38.8, 7, 7, .2, 8, C.blue);
        box(staticMesh, -121, 34.2, -38.66, 3.8, .22, .2, 5, C.tan);
        // Pedrocchi / university landmark.
        building(169, -100, 63, 38, 16, 7, 5);
        for (let j = 0; j < 6; j++)
            cylinder(staticMesh, 145 + j * 9.1, 0, -80, .65, 7, 10, 5, C.tan);
        // Streets lined with variable buildings: keep traversable market squares.
        let s = 12;
        for (let i = 0; i < 8; i++) {
            let x = -72 + i * 18.4;
            if (Math.abs(x) < 45)
                continue;
            building(x, 122, 17.3, 23, 14 + i % 3 * 3, s++);
        }
        for (let i = 0; i < 8; i++) {
            let x = -80 + i * 20;
            building(x, -128, 18, 29, 17 + (i % 4) * 2, s++);
        }
        for (let i = 0; i < 7; i++) {
            building(89 + i * 18, -121, 17.5, 24, 19 + (i % 3) * 2, s++);
        }
        for (let i = 0; i < 5; i++) {
            building(93 + i * 23, 37, 20, 39, 16 + (i % 3) * 3, s++);
        }
        for (let i = 0; i < 6; i++) {
            building(-231 + i * 19, 153, 16, 29, 15 + (i % 3) * 3, s++);
        }
        for (let i = 0; i < 5; i++) {
            building(-227 + i * 17, -127, 15, 28, 15 + (i % 4) * 3, s++);
        }
        for (let i = 0; i < 7; i++) {
            building(13 + i * 24, 277, 21, 21, 16 + (i % 3) * 3, s++);
        }
        for (let i = 0; i < 6; i++) {
            building(-232 + i * 19, 217, 17, 35, 17 + (i % 4) * 2, s++);
        }
        for (let i = 0; i < 8; i++) {
            building(220, -80 + i * 42, 33, 37, 13 + (i % 3) * 4, s++);
        }
        for (let i = 0; i < 6; i++) {
            building(-257, -88 + i * 40, 20, 35, 14 + (i % 3) * 4, s++);
        }
        // Additional alley buildings, deliberately sparse to keep map navigable.
        for (let i = 0; i < 4; i++) {
            building(-80 + i * 25, -36, 20, 25, 17 + i * 2, s++);
        }
        for (let i = 0; i < 3; i++) {
            building(-232 + i * 17, 22, 15, 18, 16 + i * 3, s++);
        }
        for (let i = 0; i < 3; i++) {
            building(85 + i * 29, 255, 20, 25, 16 + i * 2, s++);
        }
        // Refuge: weathered outpost near Duomo, accessible beneath canopy.
        box(staticMesh, -169, 0, 86, 27, .4, 26, 6, C.brown);
        for (let x of [-180, -158])
            for (let z of [75, 96])
                box(staticMesh, x, 0, z, .7, 7, .7, 6, C.brown);
        box(staticMesh, -169, 7, 85.5, 24, .4, 25, 12, C.rust);
        fence(-180, 91, 14, .7);
        fence(-161, 97, 14, .7);
        barrel(-171, 93);
        bench(-161, 89);
        barrel(-176, 82);
        // Camp decorations, improvised market and abandoned vehicles.
        market(-28, 73);
        market(-118, 24);
        wreck(76, 121, 0, true);
        wreck(-70, 62);
        wreck(170, -42, 0, true);
        wreck(-34, -65);
        wreck(118, 116);
        wreck(-181, -31);
        for (const [x, z] of [[-75, 86], [-50, -36], [38, 73], [73, -85], [193, 58], [109, 190], [-150, -76]]) {
            rubble(x, z, rnd(.7, 1.5));
            barrel(x + 4, z - 1);
        }
        for (const [x, z] of [[-185, 151], [-215, 151], [199, 140], [163, 129], [83, 216], [-13, 213], [85, -136], [-28, -186], [-211, -187]])
            tree(x, z, rnd(.85, 1.45));
        for (const [x, z] of [[-160, 130], [-91, 96], [65, 103], [90, 9], [139, -24], [173, 164], [-108, -64]])
            lightPost(x, z);
        for (const [x, z] of [[-41, 99], [50, -92], [-98, -84], [159, 92], [86, 190], [-184, 178]]) {
            fence(x, z, 3, .45);
            rubble(x + 2, z + 1, .5);
        }
        loot(-152, 72, 'med', 1);
        loot(-20, 91, 'scrap', 2);
        loot(122, 102, 'scrap', 2);
        loot(188, 20, 'med', 1);
        loot(-86, -80, 'scrap', 4);
        loot(68, -108, 'ammo', 2);
        station(13, 58);
        drugstore(-113, 12);
        // Exit perimeter: scattered rubble / fence rather than invisible world walls.
        for (let i = -7; i < 8; i++) {
            let z = i * 36;
            if (z > 220)
                continue;
            fence(-276, z, 1, 13);
            fence(260, z, 1, 12);
        }
        for (let i = -8; i < 8; i++) {
            let x = i * 34;
            fence(x, -208, 13, .8);
        }
        for (let i = 0; i < 35; i++) {
            let x = rnd(-240, 240), z = rnd(-175, 265);
            if (Math.abs(x + 170) < 30 && Math.abs(z - 87) < 34)
                continue;
            if (Math.random() > .46)
                tree(x, z, .45 + rnd(0, .45));
        }
        staticCount = staticMesh.length / 12;
        const groups=new Map(), stride=36, cell=85;
        for(let i=0;i<staticMesh.length;i+=stride){
          let x=(staticMesh[i]+staticMesh[i+12]+staticMesh[i+24])/3;
          let z=(staticMesh[i+2]+staticMesh[i+14]+staticMesh[i+26])/3;
          let gx=Math.floor(x/cell),gz=Math.floor(z/cell),id=gx+':'+gz;
          if(!groups.has(id))groups.set(id,{x:(gx+.5)*cell,z:(gz+.5)*cell,data:[]});
          let part=groups.get(id);for(let j=i;j<i+stride;j++)part.data.push(staticMesh[j]);
        }
        staticChunks=[];
        for(const part of groups.values()){
          const buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
          gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(part.data),gl.STATIC_DRAW);
          staticChunks.push({buffer:buf,count:part.data.length/12,x:part.x,z:part.z});
        }
        staticMesh=[];
    }
    city();
    function actor(name, x, z, friendly = true, color) { let a = { id: ++botSeq, name, x, z, yaw: 0, hp: friendly ? 100 : 80, friendly, color: color || C.green, dead: false, t: Math.random() * 100, speed: .7 + rnd(0, .5), attackAt: 0, stun: 0, follow: false }; (friendly ? allies : enemies).push(a); return a; }
    let marta = actor('MARTA', -165, 79, true, C.green), rocco = actor('ROCCO', -150, 99, true, C.brown), sentinel = actor('GUARDIA', -182, 67, true, C.blue), stefano = actor('STEFANO', 135, 179, true, C.grey), irene=actor('IRENE',34,-58,true,C.rust),tommaso=actor('TOMMASO',-185,92,true,C.grey);
    sentinel.follow=false;irene.follow=false;tommaso.follow=false;
    stefano.follow = false;
    function enemy(x, z, type = 'raider') { let a = actor(type === 'infected' ? 'ERRANTE' : 'PREDONE', x, z, false, type === 'infected' ? C.grey : C.rust); a.type = type; a.speed = type === 'infected' ? 1.9 : 1.2; a.hp = type === 'infected' ? 65 : 80; return a; }
    // Threats around contested streets; the starting refuge has a safety zone.
    // Dangerous encounters are activated by the campaign, never inside the starting safehouse.
    enemy(90,-110);enemy(186,-72,'infected');
    // Music/audio synthesized: no external assets. User gesture unlocks AudioContext.
    function sound(freq = 200, dur = .12, type = 'sine', vol = .06) { try {
        audioCtx ||= new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended')
            audioCtx.resume();
        let osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * .65), audioCtx.currentTime + dur);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    }
    catch (e) { } }
    function visibility(...ids) { const shown = new Set(ids); for (const id of ['mainMenu', 'selectMenu', 'introMenu', 'pauseMenu', 'settingsMenu', 'mapMenu', 'journalMenu', 'deathMenu', 'missionBrief', 'choiceMenu', 'hud', 'touch'])
        $(id).classList.toggle('hidden', !shown.has(id)); }
    function notify(msg, seconds = 3) { $('toast').textContent = msg; $('toast').style.opacity = 1; S.toastUntil = S.time + seconds; }
    function zoneLabel() { let p = S.p; if (p.x < -135 && p.z > 45 && p.z < 140)
        return 'DUOMO / RIFUGIO'; if (p.x < -65 && p.z > -75 && p.z < 65)
        return 'PIAZZA DEI SIGNORI'; if (Math.abs(p.x) < 70 && p.z > -16 && p.z < 125)
        return 'PIAZZA DELLE ERBE'; if (Math.abs(p.x) < 70 && p.z < -15)
        return 'PIAZZA DELLA FRUTTA'; if (p.x > 98 && p.z > 115)
        return 'BASILICA DEL SANTO'; if (p.x > 100 && p.z < 30)
        return 'CAFFÈ PEDROCCHI'; return 'CENTRO STORICO'; }
    function reveal() { let v = zoneLabel(); if (v !== S.location) {
        S.location = v;
        $('areaName').textContent = v;
        $('areaBanner').style.opacity = 1;
        S.zoneUntil = S.time + 1.8;
        $('district').textContent = v;
    } }
    function save() { try {
        localStorage.setItem('cop-save-v04', JSON.stringify({ char: S.char, quest: S.quest, med: S.med, scrap: S.scrap, hp: S.p.hp, weapon: S.weapon, ammo: S.ammo, reserve: S.reserve, position: { x: S.p.x, z: S.p.z, yaw: S.p.yaw }, kills: S.kills,grenades:S.grenades,smoke:S.smoke,branch:S.branch,chapterTimes:S.chapterTimes }));
        $('continueBtn').disabled = false;
        return true;
    }
    catch (e) {
        return false;
    } }
    function load() { try {
        let s = JSON.parse(localStorage.getItem('cop-save-v04') || 'null');
        if (!s || !chars[s.char])
            return false;
        S.char = s.char;
        S.quest = clamp(s.quest || 0, 0, objectiveData.length-1);
        S.med = s.med || 0;
        S.scrap = s.scrap || 0;
        S.p.hp = s.hp>0?s.hp:chars[S.char].hp;
        S.weapon = s.weapon || 0;
        S.ammo = Array.isArray(s.ammo)&&s.ammo.length===weaponData.length?s.ammo:weaponData.map(w=>w.mag);
        S.reserve = Array.isArray(s.reserve)&&s.reserve.length===weaponData.length?s.reserve:weaponData.map(w=>w.mag*4);
        S.kills = s.kills || 0;S.grenades=s.grenades??chars[S.char].grenades;S.smoke=s.smoke??chars[S.char].smoke;S.branch=s.branch||{};S.chapterTimes=s.chapterTimes||[0,0,0,0,0];
        S.p.x = s.position?.x ?? -200;
        S.p.z = s.position?.z ?? 119;
        S.p.yaw = s.position?.yaw ?? 1.10;
        return true;
    }
    catch (e) {
        return false;
    } }
    function start(mode = 'story', resume = false) { if (!resume) {
        S.quest = mode === 'explore' ? objectiveData.length-1 : 0;
        S.med = chars[S.char].med;S.grenades=chars[S.char].grenades;S.smoke=chars[S.char].smoke;S.branch={};
        S.scrap = 0;
        S.p.x = -200;
        S.p.z = 119;
        S.p.yaw = 1.10;
        S.p.hp = chars[S.char].hp;
        S.weapon = chars[S.char].weapon;
        S.ammo = weaponData.map(w=>w.mag);
        S.reserve = weaponData.map(w=>w.mag*4);
        S.kills = 0;S.chapterTimes=[0,0,0,0,0];
    } S.mode = 'play'; S.stageArmed=false;S.stageStart=S.time;S.chapterStart=S.time;S.waveIds=[];S.inVehicle = false; S.dialogue = null; S.p.pitch = -.07; mouse.dx = mouse.dy = 0; key.clear(); visibility('hud', ...(matchMedia('(pointer:coarse)').matches ? ['touch'] : [])); reveal(); updateHUD(); notify(S.quest === objectiveData.length-1 ? 'ESPLORAZIONE LIBERA — PADOVA CENTRO' : 'RIFUGIO DEL DUOMO · CINQUE MISSIONI DISPONIBILI', 3); save(); }
    function intro() { S.mode = 'intro'; visibility('introMenu'); $('introTitle').textContent = 'NESSUNO VIENE A SALVARCI.'; $('introText').textContent = 'Da 187 giorni Padova è isolata. Il Duomo è un rifugio. Le piazze sono territorio conteso. Marta ha intercettato una voce proveniente dal Palazzo della Ragione.'; }
    function speak(name, lines, callback) { S.mode = 'dialogue'; S.dialogue = { name, lines }; S.diagIndex = 0; S.convCallback = callback || null; $('conversation').classList.remove('hidden'); displayLine(); document.exitPointerLock?.(); }
    function displayLine() { if (!S.dialogue)
        return; $('speakerName').textContent = S.dialogue.name; $('speakerRole').textContent = S.dialogue.name === 'MARTA' ? 'COMUNICAZIONI / RIFUGIO' : 'SOPRAVVISSUTO / PADOVA'; $('speakerText').textContent = S.dialogue.lines[S.diagIndex]; }
    function advanceLine() { if (!S.dialogue)
        return; S.diagIndex++; sound(410, .035, 'sine', .015); if (S.diagIndex < S.dialogue.lines.length) {
        displayLine();
        return;
    } let cb = S.convCallback; S.dialogue = null; S.mode = 'play'; $('conversation').classList.add('hidden'); S.convCallback = null; if (cb)
        cb(); updateHUD(); save(); }
    function advanceQuest(to) { if (to <= S.quest)
        return; S.quest = to; save(); updateHUD(); notify(to === 7 ? 'CAMPAGNA ATTUALE COMPLETATA · ESPLORAZIONE SBLOCCATA' : `NUOVO OBIETTIVO · ${objectiveData[to].ch}`, 4); sound(650, .24, 'sine', .07); }
    function checkInteract() {
        if (S.mode === 'dialogue') {
            advanceLine();
            return;
        }
        if (S.mode !== 'play')
            return;
        let obj = getInteractable();
        if (!obj)
            return;
        const t = obj.type;
        if (t === 'marta') {
            if (S.quest === 0)
                speak('MARTA', [`Sei ${chars[S.char].name}. Bene. Abbiamo bisogno di persone che sappiano muoversi.`, `Il vecchio ospedale non risponde. In Piazza dei Signori c'è una farmacia con scorte abbandonate. Portami quello che trovi.`, `Non cercare una guerra. Cerca di tornare.`], () => advanceQuest(1));
            else if (S.quest === 2)
                speak('MARTA', ['Ce l’hai fatta. Queste medicine possono salvare una vita.', 'Da quando è arrivata la Cenere, gli Erranti seguono ogni rumore. Stamattina ho sentito una voce sui canali militari: viene dalle Erbe.', 'Vai al Palazzo della Ragione. Accendi il ripetitore e scopri chi ci sta chiamando.'], () => { S.med += 1; advanceQuest(3); });
            else if (S.quest === 6 && dist(S.p, stefano) < 25)
                speak('MARTA', ['Stefano! Pensavamo fossi perduto.', 'La radio è solo l’inizio. Fuori dalle mura ci sono altri rifugi, altre persone.', 'Oggi Padova ha recuperato una voce. Domani ricominceremo a cercare.'], () => { stefano.follow = false; advanceQuest(7); });
            else
                speak('MARTA', ['Qui siamo al sicuro, almeno per stanotte.', 'Controlla la mappa con M e il diario con J. Tieni sempre qualche medicazione con te.']);
        }
        else if (t === 'rocco') {
            speak('ROCCO', [S.scrap >= 3 ? 'Ho messo da parte munizioni. Tre pezzi di recupero per rifornirti.' : 'Non c’è più un negozio, ma possiamo ancora scambiare quello che trovi.', 'Tieni gli occhi aperti. I predoni rovistano tra i vicoli vicini alle Erbe.'], () => { if (S.scrap >= 3) {
                S.scrap -= 3;
                S.reserve[S.weapon] += weaponData[S.weapon].mag * 2;
                notify('SCAMBIO: +2 CARICATORI', 2);
            } });
        }
        else if (t === 'stefano') {
            if (S.quest === 5)
                speak('STEFANO', ['Pensavo che il segnale fosse un’altra trappola.', 'Ho visto i predoni e gli Erranti occupare la strada del Santo. Non posso tornare da solo.', 'Portami al rifugio vicino al Duomo. Ti seguirò.'], () => { stefano.follow = true; advanceQuest(6); });
            else
                speak('STEFANO', ['Il Santo resiste. Ci sono vie che i predoni non sorvegliano.', 'Non è finita, finché qualcuno risponde alla radio.']);
        }
        else if (t === 'guardia')
            speak('GUARDIA', ['Al rifugio puoi recuperare salute e parlare con gli altri.', 'Fuori dai portici, non fidarti dei rumori nei vicoli.']);
        else if (t === 'medicine') {
            if (S.quest === 1) {
                obj.taken = true;
                advanceQuest(2);
                notify('MEDICINE RECUPERATE', 3);
            }
            else
                notify('CASSE VUOTE', 1.5);
        }
        else if (t === 'radio') {
            if (S.quest === 3) {
                advanceQuest(4);
                for (const [x, z] of [[23, 90], [-24, 97], [56, 63]])
                    enemy(x, z);
                notify('TRASMISSIONE AVVIATA — SEI STATO LOCALIZZATO', 4);
                sound(180, .6, 'sawtooth', .035);
            }
            else
                notify(S.quest < 3 ? 'RIPETITORE FUORI SERVIZIO' : 'TRASMISSIONE ATTIVA', 1.5);
        }
        else if (t === 'med') {
            obj.taken = true;
            S.med += obj.amount;
            notify('MEDICAZIONE RECUPERATA', 2);
            sound(800, .09, 'triangle', .04);
        }
        else if (t === 'scrap') {
            obj.taken = true;
            S.scrap += obj.amount;
            notify(`MATERIALI +${obj.amount}`, 2);
            sound(690, .07, 'triangle', .04);
        }
        else if (t === 'ammo') {
            obj.taken = true;
            S.reserve[S.weapon] += weaponData[S.weapon].mag;
            notify('MUNIZIONI RECUPERATE', 2);
        }
        else if (t === 'vehicle') {
            S.inVehicle = !S.inVehicle;
            S.vehicleSpeed = 0;
            notify(S.inVehicle ? 'VEICOLO ATTIVO · WASD PER GUIDARE' : 'VEICOLO ABBANDONATO', 2);
        }
        updateHUD();
        save();
    }
    function getInteractable() { if (S.inVehicle)
        return { type: 'vehicle', d: 0, name: 'SCENDI DAL VEICOLO' }; let options = []; for (const a of allies) {
        if (!a.dead && (!a.name.includes('STEFANO') || S.quest >= 5)) {
            let d = dist(S.p, a);
            if (d < 5)
                options.push({ type: a.name === 'MARTA' ? 'marta' : a.name === 'ROCCO' ? 'rocco' : a.name === 'STEFANO' ? 'stefano' : 'guardia', d, name: a.name });
        }
    } for (const obj of props) {
        if (obj.taken || obj.type === 'wreck')
            continue;
        let d = dist(S.p, obj);
        if (d < 5.3)
            options.push({ ...obj, d, name: obj.type === 'medicine' ? 'RECUPERA MEDICINE' : obj.type === 'radio' ? 'USA RIPETITORE' : obj.type === 'scrap' ? 'RACCOGLI MATERIALI' : obj.type === 'med' ? 'PRENDI MEDICAZIONE' : 'PRENDI MUNIZIONI' });
    } let jeep = { x: 76, z: 121 }; if (dist(S.p, jeep) < 5.5)
        options.push({ type: 'vehicle', d: dist(S.p, jeep), name: S.inVehicle ? 'SCENDI DAL VEICOLO' : 'SALi SUL FUORISTRADA' }); options.sort((a, b) => a.d - b.d); return options[0] || null; }
    function heal() { if (S.mode !== 'play' || S.med < 1 || S.p.hp >= chars[S.char].hp)
        return; S.med--; S.p.hp = Math.min(chars[S.char].hp, S.p.hp + 55); notify('MEDICAZIONE APPLICATA', 2); sound(460, .14, 'triangle'); updateHUD(); }
    function reload() { if (S.mode !== 'play' || S.reloadUntil > S.time)
        return; let w = weaponData[S.weapon]; if (S.ammo[S.weapon] >= w.mag || S.reserve[S.weapon] <= 0)
        return; S.reloadUntil = S.time + w.reload; notify('RICARICA...', 1); sound(240, .18, 'square', .023); }
    function changeWeapon(i) { if (S.mode !== 'play' || i < 0 || i >= weaponData.length)
        return; S.weapon = i; S.reloadUntil = 0; S.recoil = 0; sound(180, .07, 'triangle', .018); updateHUD(); }
    function fire() {
        if (S.mode !== 'play' || S.reloadUntil > S.time || S.time - S.lastShot < weaponData[S.weapon].delay)
            return;
        if (S.ammo[S.weapon] < 1) {
            sound(110, .05, 'triangle', .03);
            reload();
            return;
        }
        let w = weaponData[S.weapon];
        S.lastShot = S.time;
        S.ammo[S.weapon]--;
        S.recoil = .12 + Math.random() * .1;
        S.shake = .055;
        S.combatTime = S.time + 8;
        sound(w.kind === 'shotgun' ? 110 : 130, w.kind === 'shotgun' ? .38 : .13, 'sawtooth', .075);
        $('crosshair').style.transform = `translate(-50%,-50%) scale(1.35)`;
        $('crosshair').style.transform='translate(-50%,-50%)';
        let hits = [];
        for (const a of enemies) {
            if (a.dead)
                continue;
            let dx = a.x - S.p.x, dz = a.z - S.p.z, d = Math.hypot(dx, dz), aimYaw = Math.atan2(dx, -dz), delta = Math.atan2(Math.sin(aimYaw - S.p.yaw), Math.cos(aimYaw - S.p.yaw));
            if (d > w.range || !clearSight(S.p,a))
                continue;
            let spread = w.spread*(chars[S.char]?.accuracy||1) + (mouse.down ? 0 : .006);
            if (Math.abs(delta) < Math.max(.022, Math.atan2(.65, d)) + spread && Math.abs(S.p.pitch) < .35)
                hits.push({ a, d });
        }
        hits.sort((a, b) => a.d - b.d);
        if (hits.length) {
            let a = hits[0].a;
            a.hp -= w.damage * (w.kind === 'shotgun' && hits[0].d < 10 ? 1.5 : 1);
            a.stun = .35; a.attackAt+=.15;
            $('hitmark').style.opacity = 1;
            $('hitmark').style.opacity = 0;
            if (a.hp <= 0) {
                a.dead = true;
                S.kills++;
                notify('MINACCIA NEUTRALIZZATA', 1.2);

            }
        }
        updateHUD();
    }
    function updateHUD() { const o = objectiveData[S.quest]; $('chapterLabel').textContent=chapterData[missionFromStage(S.quest)]?.title||'EPILOGO';$('missionProgress').textContent=missionFromStage(S.quest)<5?'MISSIONE '+(missionFromStage(S.quest)+1)+' / 5':'CAMPAGNA COMPLETATA';$('grenadeCount').textContent=S.grenades;$('smokeCount').textContent=S.smoke; $('goalTitle').textContent = o.title; $('goalSub').textContent = o.sub; $('charName').textContent = chars[S.char].name.toUpperCase(); $('healthValue').textContent = Math.ceil(S.p.hp); $('maxHealth').textContent = chars[S.char].hp; $('healthTrack').style.width = `${clamp(S.p.hp / chars[S.char].hp * 100, 0, 100)}%`; $('medCount').textContent = S.med; $('scrapCount').textContent = S.scrap; $('gunName').textContent = weaponData[S.weapon].name; $('ammoValue').textContent = S.ammo[S.weapon]; $('reserveValue').textContent = S.reserve[S.weapon]; }
    function respawn() { S.p.x = -200; S.p.z = 119; S.p.yaw = 1.10; S.p.hp = chars[S.char].hp; S.inVehicle = false; S.mode = 'play'; visibility('hud', ...(matchMedia('(pointer:coarse)').matches ? ['touch'] : [])); updateHUD(); notify('RIFUGIO / PUNTO DI RIENTRO', 3); }
    function pause() { if (S.mode === 'play') {
        S.mode = 'pause';
        visibility('pauseMenu');
        document.exitPointerLock?.();
    }
    else if (S.mode === 'pause') {
        S.mode = 'play';
        visibility('hud', ...(matchMedia('(pointer:coarse)').matches ? ['touch'] : []));
    } }
    function actorModel(arr, a, dt = 0) { let { x, z } = a, t = a.t || 0; let sway = Math.sin(S.time * 2.4 + t) * .07; if (a.dead) {
        box(arr, x, .09, z, 1.1, .28, 1.65, 12, a.color || C.brown);
        return;
    } let col = a.color || C.green; let crouch = a.stun > 0 ? .23 : 0; let headY = 2.63 - crouch + sway, torsoY = 1.26 - crouch + sway, legSwing = Math.sin(S.time * 4 + t) * .17 * (a.follow ? .9 : .25); box(arr, x - .18, .08, z, .34, 1.16, .44, 7, C.dark); box(arr, x + .19, .08, z + legSwing, .35, 1.15, .44, 7, C.dark); box(arr, x, torsoY, z, .96, 1.24, .57, 12, col); box(arr, x, torsoY + .48, z, .90, .16, .67, 7, C.brown); box(arr, x, headY - .42, z, .30, .34, .30, 2, C.tan); cylinder(arr, x, headY - .08, z, .31, .57, 9, 2, a.friendly ? C.tan : C.brown); box(arr, x, headY + .42, z, .72, .17, .70, 7, a.friendly ? C.dark : (a.type === 'infected' ? C.grey : C.rust)); box(arr, x - .71, torsoY, z, .30, .98, .38, 12, col); box(arr, x + .71, torsoY, z, .30, .98, .38, 12, col); if (a.type !== 'infected')
        box(arr, x, torsoY + .13, z + .40, .75, 1.07, .4, 6, C.brown); box(arr, x, torsoY + .47, z + .65, .72, .2, .14, 7, C.grey); if (!a.friendly && a.type !== 'infected') {
        box(arr, x + .55, torsoY + .1, z - .64, .26, .22, 1.12, 7, C.dark);
        box(arr, x + .55, torsoY + .2, z - .83, .16, .15, .85, 7, C.grey);
    } }
    function carModel(arr, x, z) { box(arr, x, .22, z, 3.4, .85, 5.5, 13, C.green); box(arr, x, 1.03, z + .25, 3.0, 1.05, 2.65, 8, C.dark); box(arr, x, 1.94, z + .2, 3.0, .13, 3.1, 7, C.dark); for (let dx of [-1.8, 1.8])
        for (let dz of [-1.8, 1.8])
            cylinder(arr, x + dx, .22, z + dz, .54, .25, 8, 7, C.dark); box(arr, x, 1.3, z - 2.6, 1.4, .2, .18, 7, C.grey); }
    function gunModel(arr, cam) {
        let a = S.p.yaw, p = S.p.pitch, r = S.recoil, ca = Math.cos(a), sa = Math.sin(a), cp = Math.cos(p), sp = Math.sin(p);
        let forward = [sa * cp, sp, -ca * cp], right = [ca, 0, sa], up = [-sa * sp, cp, ca * sp];
        let origin = { x: cam.eye.x + forward[0] * .55 + right[0] * .27 + up[0] * -.31, y: cam.eye.y + forward[1] * .55 + up[1] * -.31, z: cam.eye.z + forward[2] * .55 + right[2] * .27 + up[2] * -.31 };
        let len = S.weapon === 1 ? .45 : S.weapon === 2 ? .85 : .97;
        // Weapon geometry aligned with camera; tiny solid pieces form receiver, barrel, handguard, grip and sight.
        function gb(u, v, w, sx, sy, sz, mat, col) { const X = origin.x + right[0] * u + up[0] * v + forward[0] * w, Z = origin.z + right[2] * u + up[2] * v + forward[2] * w, Y = origin.y + up[1] * v + forward[1] * w; box(arr, X, Y, Z, sx, sy, sz, mat, col); }
        gb(0, -r * .3, .06, .12, .22, .29, 7, C.dark);
        gb(0, .02 - r * .5, .32, .15, .13, .38, 7, C.grey);
        gb(0, .08 - r * .6, len * .74, .12, .11, .4, 7, C.dark);
        gb(.02, .13 - r * .5, len, .065, .055, .18, 7, C.dark);
        gb(0, .19, .31, .03, .18, .03, 7, C.grey);
        if (S.weapon !== 1) {
            gb(.05, -.16, .26, .07, .27, .09, 6, C.brown);
            gb(-.12, -.21, .1, .18, .19, .24, 12, C.green);
        }
    }
    function drawAmbient(arr) { for (let i = 0; i < 6; i++) {
        let x = -90 + i * 53, z = -165 - ((i * 39) % 38);
        box(arr, x, 0, z, 19, 12 + i % 4 * 3, 22, 2, C.grey);
    } }
    function bindBuffer(buffer, data, usage) { gl.bindBuffer(gl.ARRAY_BUFFER, buffer); if (data)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), usage); const stride = 12 * 4; gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 3, gl.FLOAT, false, stride, 0); gl.enableVertexAttribArray(A.normal); gl.vertexAttribPointer(A.normal, 3, gl.FLOAT, false, stride, 3 * 4); gl.enableVertexAttribArray(A.uv); gl.vertexAttribPointer(A.uv, 2, gl.FLOAT, false, stride, 6 * 4); gl.enableVertexAttribArray(A.tile); gl.vertexAttribPointer(A.tile, 1, gl.FLOAT, false, stride, 8 * 4); gl.enableVertexAttribArray(A.color); gl.vertexAttribPointer(A.color, 3, gl.FLOAT, false, stride, 9 * 4); }
    function camView() {
        if (S.mode === 'menu' || S.mode === 'select' || S.mode === 'intro' || S.mode === 'settings' && settingsFrom === 'menu') {
            let phase = S.time * .055;
            let eye = { x: 65 + Math.sin(phase) * 18, y: 23, z: 137 + Math.cos(phase) * 12 };
            return { eye, target: { x: 0, y: 13, z: -7 } };
        }
        let p = S.p, eye = { x: p.x, y: 1.76 + Math.sin(S.headbob)*S.walkAmount*.064, z: p.z }, pitch = p.pitch, yaw = p.yaw;
        let fw = { x: Math.sin(yaw) * Math.cos(pitch), y: Math.sin(pitch), z: -Math.cos(yaw) * Math.cos(pitch) };
        if (S.camera === 'third' || S.inVehicle) {
            eye.x -= fw.x * 6;
            eye.z -= fw.z * 6;
            eye.y += 2.8;
            return { eye, target: { x: p.x + fw.x * 7, y: 1.6 + fw.y * 5, z: p.z + fw.z * 7 } };
        }
        return { eye, target: { x: eye.x + fw.x * 30, y: eye.y + fw.y * 30, z: eye.z + fw.z * 30 } };
    }
    let storedView, storedProj;
    function project(pt) { if (!storedView || !storedProj)
        return null; const m = storedView, p = storedProj; let vx = m[0] * pt.x + m[4] * pt.y + m[8] * pt.z + m[12], vy = m[1] * pt.x + m[5] * pt.y + m[9] * pt.z + m[13], vz = m[2] * pt.x + m[6] * pt.y + m[10] * pt.z + m[14]; let x = p[0] * vx, z = p[5] * vy, w = -vz; if (w < 1)
        return null; return { x: (x / w * .5 + .5) * window.innerWidth, y: (-.5 * z / w + .5) * window.innerHeight, visible: Math.abs(x / w) < .94 && Math.abs(z / w) < .94 }; }
    function render() {
        let w = innerWidth, h = innerHeight, quality = cfg.quality;
        let scale = quality === 'low' ? .53 : quality === 'medium' ? .69 : .88;
        let dpr = Math.min(devicePixelRatio || 1, quality === 'low' ? .88 : 1.05);
        let W = Math.max(2, Math.floor(w * scale * dpr)), H = Math.max(2, Math.floor(h * scale * dpr));
        if (cv.width !== W || cv.height !== H) {
            cv.width = W;
            cv.height = H;
        }
        gl.viewport(0, 0, W, H);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        let cam = camView();
        storedView = matLookAt(cam.eye, cam.target);
        storedProj = matPerspective(S.mode === 'menu' ? PI / 3.4 : PI / 2.9, W / H, .07, 500);
        gl.uniformMatrix4fv(U.view, false, storedView);
        gl.uniformMatrix4fv(U.proj, false, storedProj);
        gl.uniform3f(U.fog, .45, .51, .49);gl.uniform1f(U.opacity,1);
        for(const c of staticChunks){if(Math.hypot(cam.eye.x-c.x,cam.eye.z-c.z)>225)continue;bindBuffer(c.buffer);gl.drawArrays(gl.TRIANGLES,0,c.count);}
        let dyn = [];
        for (let a of allies)
            if (dist(a, S.p) < 100 || S.mode === 'menu')
                actorModel(dyn, a);
        for (let a of enemies)
            if (dist(a, S.p) < 90 || S.mode === 'menu')
                actorModel(dyn, a);
        if (S.mode === 'play' && S.camera === 'third' && !S.inVehicle)
            actorModel(dyn, { x: S.p.x, z: S.p.z, t: 1, color: chars[S.char].coat, friendly: true });
        if (S.mode === 'play' && S.inVehicle)
            carModel(dyn, S.p.x, S.p.z);
        if (S.mode === 'play' && S.camera === 'fps' && !S.inVehicle)
            gunModel(dyn, cam);
        dynamicCount = dyn.length / 12;
        bindBuffer(dynamicBuffer, dyn, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, dynamicCount);
        // Smoke grenades and throwable projectiles are visualized in the actual 3D world.
        if(S.smokeClouds.length){
          let fog=[];
          for(const smoke of S.smokeClouds){
            const age=smoke.end-S.time,scale=Math.min(1,(10-age)/1.4);
            for(let j=0;j<4;j++)ellipsoid(fog,smoke.x+Math.sin(S.time*.55+j)*1.6,1.6+j*.47,smoke.z+Math.cos(S.time*.48+j)*1.4,3.2*scale,1.6*scale,3.2*scale,9,C.grey);
          }
          if(fog.length){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);gl.uniform1f(U.opacity,.14);bindBuffer(dynamicBuffer,fog,gl.DYNAMIC_DRAW);gl.drawArrays(gl.TRIANGLES,0,fog.length/12);gl.uniform1f(U.opacity,1);gl.depthMask(true);gl.disable(gl.BLEND);}
        }
        if (S.mode === 'play' || S.mode === 'dialogue') {
            const o = objectiveData[S.quest];
            let target = project({ x: o.at.x, y: 4, z: o.at.z }), ui = $('objectiveIndicator');
            ui.style.display = target?.visible && dist(S.p, o.at) > 7 ? 'block' : 'none';
            if (target?.visible) {
                ui.style.left = target.x + 'px';
                ui.style.top = target.y + 'px';
                ui.style.transform = 'translateX(-50%)';
                $('indicatorName').textContent = o.tag;
                $('indicatorDist').textContent = Math.round(dist(S.p, o.at)) + ' M';
            }
        }
    }
    function collision(x, z, rad = .64) { if (Math.abs(x) > 269 || z < -202 || z > 290)
        return true; for (const a of colliders) {
        if (Math.abs(x - a.x) < a.w / 2 + rad && Math.abs(z - a.z) < a.d / 2 + rad)
            return true;
    } return false; }
    function clearSight(a,b){
        const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz);if(d<3)return true;
        const checks=Math.min(20,Math.floor(d/3.5));
        for(let i=1;i<checks;i++){let t=i/checks;if(collision(a.x+dx*t,a.z+dz*t,.05))return false;}
        return true;
    }
    function advance(dt) {
        if (S.mode !== 'play')
            return;
        const p = S.p;
        let mx = 0, mz = 0;
        const keyOn = (...codes) => codes.some(c => key.has(c));
        if (keyOn('KeyW', 'ArrowUp'))
            mz += 1;
        if (keyOn('KeyS', 'ArrowDown'))
            mz -= 1;
        if (keyOn('KeyA'))
            mx -= 1;
        if (keyOn('KeyD'))
            mx += 1;
        mx += touchInput.move.x;
        mz += -touchInput.move.y;
        let pad = navigator.getGamepads?.()?.[0];
        if (pad && pad.connected) {
            mx += Math.abs(pad.axes[0] || 0) > .13 ? pad.axes[0] : 0;
            mz -= Math.abs(pad.axes[1] || 0) > .13 ? pad.axes[1] : 0;
            let px = Math.abs(pad.axes[2] || 0) > .12 ? pad.axes[2] : 0, py = Math.abs(pad.axes[3] || 0) > .12 ? pad.axes[3] : 0;
            p.yaw += px * dt * cfg.sensitivity * 2.2;
            p.pitch = clamp(p.pitch - py * dt * cfg.sensitivity * 1.6, -1.0, 1.05);
        }
        p.yaw += mouse.dx * .0023 * cfg.sensitivity;
        p.pitch = clamp(p.pitch - mouse.dy * .0019 * cfg.sensitivity, -1.05, 1.07);
        mouse.dx = mouse.dy = 0;
        const len = Math.hypot(mx, mz);
        if (len > 1) {
            mx /= len;
            mz /= len;
        }
        let speed = ((keyOn('ShiftLeft', 'ShiftRight') || touchInput.sprint || pad?.buttons?.[10]?.pressed) ? 7.6 : 4.8)*(chars[S.char]?.speed||1);
        if (keyOn('ControlLeft', 'KeyC'))
            speed *= .55;
        if (S.inVehicle)
            speed = 15 + Math.abs(S.vehicleSpeed) * 7;
        const sx = Math.cos(p.yaw) * mx + Math.sin(p.yaw) * mz, sz = Math.sin(p.yaw) * mx - Math.cos(p.yaw) * mz;
        let nx = p.x + sx * speed * dt, nz = p.z + sz * speed * dt;
        if (!collision(nx, p.z, S.inVehicle ? 1.4 : .6))
            p.x = nx;
        if (!collision(p.x, nz, S.inVehicle ? 1.4 : .6))
            p.z = nz;
        if (mouse.down || touchInput.shoot)
            fire();
        if (S.reloadUntil > 0 && S.time >= S.reloadUntil) {
            let w = weaponData[S.weapon], need = Math.min(w.mag - S.ammo[S.weapon], S.reserve[S.weapon]);
            S.ammo[S.weapon] += need;
            S.reserve[S.weapon] -= need;
            S.reloadUntil = 0;
            sound(410, .06, 'triangle', .02);
            updateHUD();
        }
        campaignTick(dt);
        if (stefano.follow && dist(S.p, stefano) > 110) {
            stefano.x = p.x + 7;
            stefano.z = p.z + 7;
        }
        for (const a of allies) {
            a.t += dt;
            if (a.follow) {
                let dx = p.x - a.x, dz = p.z - a.z, d = Math.hypot(dx, dz);
                if (d > 4) {
                    let step = Math.min(d - 4, dt * 4);
                    a.x += dx / d * step;
                    a.z += dz / d * step;
                }
                a.yaw = Math.atan2(dx, -dz);
            }
            else
                a.yaw = Math.sin(S.time * .23 + a.t) * .3;
        }
        // Companion AI: covers player, picks a nearby visible threat, does not fire in safehouse.
        for(const a of allies){if(!a.follow||a.dead)continue;
          a.attackAt ||= 0;
          if(S.time<a.attackAt)continue;
          const target=enemies.filter(e=>!e.dead&&dist(a,e)<30).sort((b,c)=>dist(a,b)-dist(a,c))[0];
          if(target&&clearSight(a,target)){a.attackAt=S.time+1.2;target.hp-=22;target.stun=.18;if(target.hp<=0){target.dead=true;notify(a.name+' HA COPERTO LA TUA POSIZIONE',1.3);}}
        }
        let activeEnemies = 0;
        for (const a of enemies) {
            if (a.dead)
                continue;
            a.t += dt;
            a.stun = Math.max(0, a.stun - dt);
            let d = dist(p, a);
            if (d < 70 && !S.smokeClouds.some(s=>s.end>S.time && Math.hypot(s.x-p.x,s.z-p.z)<19)) {
                activeEnemies++;
                let dx = p.x - a.x, dz = p.z - a.z;
                a.yaw = Math.atan2(dx, -dz);
                if (d < (a.type === 'infected' ? 24 : 40) && d > (a.type === 'infected' ? 2.4 : 9) && a.stun <= 0 && dist(a, { x: -169, z: 85 }) > 31) {
                    let step = Math.min(d - 9, a.speed * 1.7 * dt);
                    if (!collision(a.x + dx / d * step, a.z + dz / d * step, .5)) {
                        a.x += dx / d * step;
                        a.z += dz / d * step;
                    }
                }
                if (d < (a.type === 'infected' ? 2.8 : 31) && S.time > a.attackAt && clearSight(a,p) && dist(p, { x: -169, z: 85 }) > 27) {
                    a.attackAt = S.time + 1.7 + rnd(0, 1.4);
                    p.hp = Math.max(0, p.hp - rnd(a.type === 'infected' ? 9 : 3, a.type === 'infected' ? 17 : 7));
                    S.injured = .8;
                    S.shake = .08;
                    $('hurt').style.opacity = .5;
                    updateHUD();
                    sound(90, .16, 'sawtooth', .03);
                    if (p.hp <= 0) {
                        S.mode = 'dead';
                        save();
                        visibility('deathMenu');
                        document.exitPointerLock?.();
                        return;
                    }
                }
            }
        }
        S.walkAmount=lerp(S.walkAmount,Math.min(1,len),Math.min(1,dt*8));S.headbob+=dt*(5+len*7);
        S.recoil = lerp(S.recoil, 0, Math.min(1, dt * 13));
        S.shake = lerp(S.shake, 0, Math.min(1, dt * 6));
        S.injured = Math.max(0, S.injured - dt);
        $('hurt').style.opacity = S.injured * .5;
        let interaction = getInteractable();
        $('interact').classList.toggle('hidden', !interaction);
        if (interaction)
            $('interactName').textContent = interaction.name;
        let o = objectiveData[S.quest];
        let d = dist(p, o.at);
        $('distance').textContent = Math.round(d) + 'M';
        $('direction').textContent = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(((p.yaw % TAU + TAU) % TAU) / TAU * 8) % 8];
        reveal();
        if (S.time > S.zoneUntil)
            $('areaBanner').style.opacity = 0;
        if (S.time > S.toastUntil)
            $('toast').style.opacity = 0;
    }
    function drawMap() {
        let cv = $('mapCanvas'), cx = cv.getContext('2d'), w = cv.width, h = cv.height;
        cx.fillStyle = '#1b2825';
        cx.fillRect(0, 0, w, h);
        const tx = x => (x + 285) / 570 * w, tz = z => (z + 220) / 530 * h;
        // Faded paper-grid and blocks, coordinate schematic.
        cx.strokeStyle = '#c2b39016';
        cx.lineWidth = 1;
        for (let i = 0; i < 18; i++) {
            cx.beginPath();
            cx.moveTo(i * w / 17, 0);
            cx.lineTo(i * w / 17, h);
            cx.stroke();
            cx.beginPath();
            cx.moveTo(0, i * h / 17);
            cx.lineTo(w, i * h / 17);
            cx.stroke();
        }
        for (const r of colliders) {
            cx.fillStyle = '#46524b';
            cx.fillRect(tx(r.x - r.w / 2), tz(r.z - r.d / 2), r.w / 570 * w, r.d / 530 * h);
        }
        for (const r of [[0, 55, 115, 79], [-122, -2, 106, 76], [-169, 86, 78, 75], [138, 166, 121, 111]]) {
            cx.strokeStyle = '#958970';
            cx.strokeRect(tx(r[0] - r[2] / 2), tz(r[1] - r[3] / 2), r[2] / 570 * w, r[3] / 530 * h);
        }
        const labels = [['DUOMO', -165, 55], ['SIGNORI', -122, -9], ['ERBE', 0, 50], ['FRUTTA', 0, -55], ['PEDROCCHI', 172, -40], ['SANTO', 135, 177]];
        cx.font = '11px monospace';
        cx.textAlign = 'center';
        for (let [label, x, z] of labels) {
            cx.fillStyle = '#c1c8b1';
            cx.fillText(label, tx(x), tz(z));
        }
        let o = objectiveData[S.quest];
        cx.fillStyle = '#e1bc84';
        cx.font = '22px monospace';
        cx.fillText('◆', tx(o.at.x), tz(o.at.z));
        cx.fillStyle = '#a9e0c1';
        cx.fillText('●', tx(S.p.x), tz(S.p.z));
        cx.fillStyle = '#aaa';
        cx.font = '10px monospace';
        cx.fillText('N ↑', w - 38, 28);
    }
    function drawJournal() { let steps = [{ title: 'PROLOGO · IL RIFUGIO', desc: 'Parla con Marta. La sicurezza comincia dalla comunità.', end: 1 }, { title: 'I · LA CITTÀ SPEZZATA', desc: 'Recupera scorte alla farmacia e proteggi il rifugio.', end: 3 }, { title: 'II · FREQUENZA MORTA', desc: 'Riaccedi al ripetitore delle Erbe e difendilo.', end: 5 }, { title: 'III · L’ULTIMA VOCE', desc: 'Ritrova Stefano alla Basilica e riportalo a casa.', end: 7 }]; $('journalBody').innerHTML = steps.map(s => `<article class="journalItem ${S.quest >= s.end ? 'complete' : ''}"><h3>${s.title} ${S.quest >= s.end ? '✓' : ''}</h3><p>${s.desc}</p></article>`).join('') + `<article class="journalItem"><h3>INVENTARIO</h3><p>Personaggio: ${chars[S.char].name}<br>Materiali: ${S.scrap} · Medicazioni: ${S.med} · Minacce neutralizzate: ${S.kills}<br>Arma: ${weaponData[S.weapon].name}</p></article>`; }
    function showMap() { if (S.mode === 'play') {
        S.mode = 'map';
        visibility('mapMenu');
        drawMap();
        document.exitPointerLock?.();
    }
    else if (S.mode === 'map') {
        S.mode = 'play';
        visibility('hud', ...(matchMedia('(pointer:coarse)').matches ? ['touch'] : []));
    } }
    function showJournal() { if (S.mode === 'play') {
        S.mode = 'journal';
        visibility('journalMenu');
        drawJournal();
        document.exitPointerLock?.();
    }
    else if (S.mode === 'journal') {
        S.mode = 'play';
        visibility('hud', ...(matchMedia('(pointer:coarse)').matches ? ['touch'] : []));
    } }
    let settingsFrom = 'menu';
    function showSettings() { settingsFrom = S.mode; S.mode = 'settings'; visibility('settingsMenu'); }
    function resetMenu() { S.mode = 'menu'; document.exitPointerLock?.(); visibility('mainMenu'); try{$('continueBtn').disabled = !localStorage.getItem('cop-save-v04');}catch(_){$('continueBtn').disabled=true;} }
    // The mission controller below is intentionally data-driven. It is completely independent
    // of the old linear tutorial checkpoints and keeps five chapters traversable in one world.
    function stage(){return objectiveData[Math.min(S.quest,objectiveData.length-1)];}
    const spawnLocations={
      raiders:[[-113,9],[-103,24],[-122,30]],
      radio:[[23,90],[-24,97],[56,63],[3,105]],
      ambush:[[175,-71],[157,-18],[126,-53],[192,-52]],
      escort:[[29,70],[38,94]],
      infected:[[117,194],[172,211],[162,158],[115,160]],
      finale:[[34,-53],[-20,-72],[27,-35],[39,-82]],
      siege:[[-143,-29],[-98,-36],[-145,42],[-88,39]]
    };
    function squadWave(kind,index=0){
      let pts=spawnLocations[kind]||spawnLocations.raiders;
      const created=[];
      for(let i=0;i<Math.min(pts.length, index?3:4);i++){
        const [x,z]=pts[(i+index)%pts.length];
        const bot=enemy(x+(index?index*1.8:0),z+(index?-index*2:0),kind==='infected'?'infected':'raider');
        bot.hp=kind==='infected'?60:65;
        created.push(bot.id);
      }
      S.waveIds.push(...created);
      notify(kind==='infected'?'ATTENZIONE — ERRANTI IN AVVICINAMENTO':'CONTATTI OSTILI — CERCA COPERTURA',2.6);
    }
    function onStageEnter(){
      if(S.stageArmed)return;
      S.stageArmed=true;S.stageStart=S.time;S.waveIds=[];S.waveSequence=0;
      const q=stage();
      if((q.spawn==='raiders'||q.spawn==='escort')&&q.kind!=='hold'){
        squadWave(q.spawn); 
      }
      if(q.kind==='clear'||q.kind==='hold'){
        squadWave(q.spawn);
        S.waveEnd=S.time+(q.kind==='hold'?q.seconds:0);
        if(q.kind==='hold')notify('MANTIENI LA POSIZIONE · '+q.seconds+' SECONDI',3);
      }
      if(S.quest===5){sentinel.follow=true;notify('LA GUARDIA SI UNISCE A TE',3);}
      if(S.quest===11){sentinel.follow=false;sentinel.x=-182;sentinel.z=67;}
      if(S.quest===15){irene.follow=true;notify('IRENE SI UNISCE ALLA SQUADRA',3);}
      if(S.quest===17){irene.follow=false;irene.x=34;irene.z=-58;}
      if(S.quest===20){stefano.follow=true;}
      if(S.quest===23){stefano.follow=false;stefano.x=135;stefano.z=179;sentinel.follow=true;}
      if(S.quest===29){sentinel.follow=false;notify('CAMPAGNA COMPLETATA · ESPLORAZIONE LIBERA',6);}
    }
    function openBrief(lastChapter,nextChapter){
      const panel=$('missionBrief');if(!panel)return;
      S.mode='brief';
      const time=S.chapterTimes[lastChapter]||0;
      $('briefEyebrow').textContent='MISSIONE '+(lastChapter+1)+' / 5 · COMPLETATA';
      $('briefTitle').textContent=chapterData[lastChapter].title.substring(5);
      $('briefBody').textContent='Operazione conclusa. Tempo: '+Math.floor(time/60)+'m '+Math.floor(time%60)+'s. '+chapterData[nextChapter].blurb;
      $('briefNext').textContent='AVVIA MISSIONE '+(nextChapter+1)+' →';
      panel.classList.remove('hidden');document.exitPointerLock?.();
      save();
    }
    function advanceQuest(to){
      if(to<=S.quest||to>=objectiveData.length)return;
      const previous=missionFromStage(S.quest);
      S.quest=to;S.stageArmed=false;S.waveIds=[];S.waveSequence=0;S.stageStart=S.time;
      const current=missionFromStage(to);
      if(current!==previous && previous<5){
        S.chapterTimes[previous]=Math.max(0,Math.round(S.time-S.chapterStart));S.chapterStart=S.time;
        if(current<5)openBrief(previous,current);
        else {S.mode='brief';$('briefEyebrow').textContent='CAMPAGNA COMPLETATA';$('briefTitle').textContent='PADOVA RISPONDE';
          $('briefBody').textContent='Hai concluso cinque operazioni. Le conseguenze delle tue decisioni restano nella memoria del rifugio. La città ora è esplorabile liberamente.';
          $('briefNext').textContent='TORNA NELLA CITTÀ →';$('missionBrief').classList.remove('hidden');document.exitPointerLock?.();}
      }else notify('NUOVO OBIETTIVO · '+stage().title,3);
      updateHUD();save();sound(520,.22,'sine',.04);
    }
    function getInteractable(){
      if(S.mode!=='play')return null;
      if(S.inVehicle)return {type:'vehicle',name:'SCENDI DAL VEICOLO',d:0};
      const q=stage(),d=dist(S.p,q.at);
      if(['talk','use','choice'].includes(q.kind)&&d<7.8)return {type:'stage',name:q.kind==='talk'?'PARLA: '+q.speaker:q.kind==='choice'?'PRENDI UNA DECISIONE':'INTERAGISCI: '+q.tag,d};
      let pickups=props.filter(a=>!a.taken&&['med','ammo','scrap'].includes(a.type)&&dist(S.p,a)<4.8)
        .map(a=>({...a,d:dist(S.p,a),name:a.type==='med'?'MEDICAZIONE':a.type==='ammo'?'MUNIZIONI':'MATERIALI',type:'pickup'}));
      if(pickups.length)return pickups.sort((a,b)=>a.d-b.d)[0];
      if(dist(S.p,rocco)<4.8)return {type:'rocco',name:'SCAMBIA CON ROCCO'};
      if(dist(S.p,marta)<4.8)return {type:'speakMarta',name:'PARLA CON MARTA'};
      if(dist(S.p,{x:76,z:121})<5.3)return {type:'vehicle',name:'FUORISTRADA · E PER GUIDARE'};
      return null;
    }
    function showChoice(){
      const q=stage();if(q.kind!=='choice')return;
      S.mode='choice';$('choiceTitle').textContent=q.title.toUpperCase();
      $('choiceContext').textContent=S.quest===16?'Un’ombra segue Irene. Salvare i civili significa perdere l’arsenale; recuperare le armi rende il rifugio più forte ma lascia i civili esposti.':'La radio raggiungerà tutta la provincia, ma attirerà anche i predoni. Restare in silenzio nasconde la base, ma i dispersi non sapranno dove cercare aiuto.';
      $('choiceA').textContent='A · '+q.choices[0];$('choiceB').textContent='B · '+q.choices[1];
      $('choiceMenu').classList.remove('hidden');document.exitPointerLock?.();
    }
    function chooseOption(idx){
      if(S.mode!=='choice')return;
      const at=S.quest;
      S.branch[at]=idx;
      $('choiceMenu').classList.add('hidden');S.mode='play';
      if(at===16){if(idx===0){S.med+=3;notify('I CIVILI SONO SALVI · +3 MEDICAZIONI',4);}else {S.reserve=S.reserve.map((n,i)=>n+weaponData[i].mag*2);notify('ARSENALE RECUPERATO · MUNIZIONI AUMENTATE',4);}}
      else if(at===27)notify(idx===0?'IL SEGNALE È STATO TRASMESSO A TUTTI':'IL RIFUGIO RESTA NASCOSTO',4);
      advanceQuest(at+1);
    }
    function checkInteract(){
      if(S.mode==='dialogue'){advanceLine();return;}
      if(S.mode!=='play')return;
      const obj=getInteractable();if(!obj)return;
      const q=stage();
      if(obj.type==='stage'){
        if(q.kind==='talk'){speak(q.speaker,q.lines,()=>{if(S.quest===18)stefano.follow=true;if(S.quest===28&&S.branch[27]===0)notify('LE RADIO DEI SOPRAVVISSUTI RISPONDONO AL TUO SEGNALE',5);if(S.quest===28&&S.branch[27]===1)notify('IL RIFUGIO RIMANE NASCOSTO ALLE TORRI',5);advanceQuest(S.quest+1);});}
        else if(q.kind==='choice')showChoice();
        else if(q.kind==='use'){
          if(q.action==='medicine')S.med+=1;
          if(q.action==='bag')S.scrap+=3;
          if(q.action==='radio')sound(500,.5,'sawtooth',.03);
          if(q.action==='generator')notify('GENERATORI DISATTIVATI · I NEMICI TI CERCANO',3);
          advanceQuest(S.quest+1);
        }
      }else if(obj.type==='pickup'){let item=props.find(p=>p.x===obj.x&&p.z===obj.z&&p.type===obj.type)||props.find(p=>p.x===obj.x&&p.z===obj.z);if(item)item.taken=true;
        if(obj.name==='MEDICAZIONE')S.med++;else if(obj.name==='MUNIZIONI')S.reserve[S.weapon]+=weaponData[S.weapon].mag;else S.scrap+=2;notify('RISORSA RECUPERATA',2);updateHUD();save();
      }else if(obj.type==='rocco')speak('ROCCO',[S.scrap>=3?'Scambio tre materiali per due caricatori.':'Non sprecare colpi, non abbiamo fabbriche per produrne altri.'],()=>{if(S.scrap>=3){S.scrap-=3;S.reserve[S.weapon]+=weaponData[S.weapon].mag*2;updateHUD();}});
      else if(obj.type==='speakMarta')speak('MARTA',['La comunità è ancora viva perché continuiamo a cercarci.','Usa la mappa per orientarti e il diario per sapere cosa devi fare.']);
      else if(obj.type==='vehicle'){S.inVehicle=!S.inVehicle;notify(S.inVehicle?'FUORISTRADA IN MOTO · WASD PER GUIDARE':'SEI SCESO DAL VEICOLO',2);}
    }
    function campaignTick(dt){
      if(S.mode!=='play')return;
      S.smokeClouds=S.smokeClouds.filter(c=>c.end>S.time);
      for(let i=S.grenadeFlight?.length-1??-1;i>=0;i--){const b=S.grenadeFlight[i];if(S.time<b.end)continue;for(const e of enemies){if(!e.dead&&Math.hypot(e.x-b.x,e.z-b.z)<13){e.hp-=110;if(e.hp<=0){e.dead=true;S.kills++;}}}S.grenadeFlight.splice(i,1);S.shake=.24;sound(67,.7,'sawtooth',.075);notify('DETONAZIONE',1.5);}
      onStageEnter();
      const q=stage();let d=dist(S.p,q.at);
      if(q.kind==='reach'&&d<9){advanceQuest(S.quest+1);return;}
      if(q.kind==='clear'){
        let live=enemies.some(e=>S.waveIds.includes(e.id)&&!e.dead);
        if(!live&&S.waveIds.length)advanceQuest(S.quest+1);
      }
      if(q.kind==='hold'){
        if(d>30){ S.waveEnd+=dt;S.stageStart+=dt;$('goalSub').textContent='RAGGIUNGI IL PUNTO DI DIFESA · '+Math.ceil(d)+'m';return; }
        if(S.time>S.stageStart+q.seconds*.32 && S.waveSequence===0){S.waveSequence=1;squadWave(q.spawn,1);}
        if(S.time>S.stageStart+q.seconds*.64 && S.waveSequence===1){S.waveSequence=2;squadWave(q.spawn,2);}
        if(S.time>=S.waveEnd){advanceQuest(S.quest+1);}
        else if(S.time%2<dt)$('goalSub').textContent=q.sub+' · '+Math.ceil(S.waveEnd-S.time)+'s';
      }
      if(S.time-S.stageStart>140 && q.kind==='clear'){for(const e of enemies){if(S.waveIds.includes(e.id))e.dead=true;}advanceQuest(S.quest+1);notify('I RINFORZI ALLEATI HANNO APERTO LA STRADA',3);}
      if(S.time%9<dt)save();
    }
    function throwGrenade(smoke){
      if(S.mode!=='play')return;
      if(smoke&&S.smoke<=0)return notify('FUMOGENE ESAURITE',1.3);
      if(!smoke&&S.grenades<=0)return notify('GRANATE ESAURITE',1.3);
      const x=S.p.x+Math.sin(S.p.yaw)*14,z=S.p.z-Math.cos(S.p.yaw)*14;
      if(smoke){S.smoke--;S.smokeClouds.push({x,z,end:S.time+10});notify('CORTINA FUMOGENA · COPERTURA 10 SECONDI',3);}
      else{S.grenades--;S.grenadeFlight.push({x,z,start:S.time,end:S.time+.75});notify('GRANATA LANCIATA',1.5);}
      updateHUD();
    }
    function drawJournal(){
      $('journalBody').innerHTML=chapterData.map((m,i)=>{
        const current=missionFromStage(S.quest),done=i<current;
        const secs=S.chapterTimes[i]||0;
        return `<article class="journalItem ${done?'complete':''}"><h3>${m.title} ${done?'✓':current===i?'· IN CORSO':''}</h3><p>${m.blurb}</p><small>${done?'Completata in '+Math.floor(secs/60)+'m '+secs%60+'s':current===i?'Obiettivo: '+stage().title:'Da sbloccare'}</small></article>`;
      }).join('')+`<article class="journalItem"><h3>INVENTARIO / SQUADRA</h3><p>${chars[S.char].name} · ${chars[S.char].role}<br>Medicazioni: ${S.med} · Granate: ${S.grenades} · Fumogene: ${S.smoke}<br>Materiali: ${S.scrap} · Nemici neutralizzati: ${S.kills}<br>Arma: ${weaponData[S.weapon].name}<br>Alleati: ${allies.filter(a=>a.follow).map(a=>a.name).join(', ')||'nessuno'}<br>Scelte: ${Object.entries(S.branch).map(([k,v])=>objectiveData[+k]?.choices?.[v]).filter(Boolean).join(' / ')||'nessuna'}</p></article>`;
    }
    function updateHUD(){
      const q=stage(),n=missionFromStage(S.quest);
      $('chapterLabel').textContent=chapterData[n]?.title||'EPILOGO';
      $('missionProgress').textContent=n<5?'MISSIONE '+(n+1)+' / 5':'CAMPAGNA COMPLETATA';
      $('goalTitle').textContent=q.title;$('goalSub').textContent=q.sub;
      $('charName').textContent=chars[S.char].name.toUpperCase();
      $('healthValue').textContent=Math.ceil(S.p.hp);$('maxHealth').textContent=chars[S.char].hp;
      $('healthTrack').style.width=clamp(S.p.hp/chars[S.char].hp*100,0,100)+'%';
      $('medCount').textContent=S.med;$('scrapCount').textContent=S.scrap;
      $('grenadeCount').textContent=S.grenades;$('smokeCount').textContent=S.smoke;
      $('gunName').textContent=weaponData[S.weapon].name;
      $('ammoValue').textContent=S.ammo[S.weapon]??0;$('reserveValue').textContent=S.reserve[S.weapon]??0;
    }
    function tube(arr,a,b,r1,r2,n,t,col){
      const axis=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],len=Math.hypot(...axis)||1;
      let ux=axis[0]/len,uy=axis[1]/len,uz=axis[2]/len;
      let cx=Math.abs(ux)>.8?0:1,cy=Math.abs(ux)>.8?1:0,cz=0;
      let px=uy*cz-uz*cy,py=uz*cx-ux*cz,pz=ux*cy-uy*cx;
      let pl=Math.hypot(px,py,pz)||1;px/=pl;py/=pl;pz/=pl;
      let qx=uy*pz-uz*py,qy=uz*px-ux*pz,qz=ux*py-uy*px;
      for(let i=0;i<n;i++){
        const ph=i*TAU/n,ph2=(i+1)*TAU/n;
        const ring=(p,r,ang)=>[p[0]+r*(px*Math.cos(ang)+qx*Math.sin(ang)),p[1]+r*(py*Math.cos(ang)+qy*Math.sin(ang)),p[2]+r*(pz*Math.cos(ang)+qz*Math.sin(ang))];
        quad(arr,ring(a,r1,ph),ring(a,r1,ph2),ring(b,r2,ph2),ring(b,r2,ph),[px,py,pz],t,col,.4);
      }
    }
    function ellipsoid(arr,x,y,z,rx,ry,rz,t,col){
      const segments=9,rows=5;
      for(let j=0;j<rows;j++)for(let i=0;i<segments;i++){
        const a=j*Math.PI/rows,b=(j+1)*Math.PI/rows,p=i*TAU/segments,q=(i+1)*TAU/segments;
        const pt=(th,ph)=>[x+rx*Math.sin(th)*Math.cos(ph),y+ry*Math.cos(th),z+rz*Math.sin(th)*Math.sin(ph)];
        quad(arr,pt(a,p),pt(a,q),pt(b,q),pt(b,p),[Math.cos(p),Math.cos(a),Math.sin(p)],t,col,.6);
      }
    }
    // Characters are assembled from articulated tapered volumes and soft profiles rather than cubes.
    // This is still procedural low-poly: not a scanned human or a mocap rig.
    function actorModel(arr,a){
      const x=a.x,z=a.z;if(a.dead){ellipsoid(arr,x,.2,z,.7,.2,.9,12,a.color||C.brown);return;}
      const t=a.t||0,walking=a.follow?1:(!a.friendly?.5:.15),step=S.time*7.3+t;
      const gait=Math.sin(step)*.22*walking,bob=Math.abs(Math.sin(step))*.04*walking;
      const infected=a.type==='infected',coat=a.color||C.green,skin=infected?C.grey:C.tan;
      const stagger=a.stun>0?.23:0,y=bob-stagger;
      // boots, knees, hips, shoulders, neck and head
      const l0=[x-.22,.1+y,z-gait],r0=[x+.22,.1+y,z+gait];
      const l1=[x-.2,.76+y,z+gait*.45],r1=[x+.2,.76+y,z-gait*.45];
      tube(arr,l0,l1,.17,.19,7,7,C.dark);tube(arr,r0,r1,.17,.19,7,7,C.dark);
      tube(arr,l1,[x-.2,1.23+y,z],.19,.22,7,12,coat);tube(arr,r1,[x+.2,1.23+y,z],.19,.22,7,12,coat);
      ellipsoid(arr,x,1.64+y,z,.49,.62,.32,12,coat);
      ellipsoid(arr,x,1.07+y,z,.40,.25,.31,7,C.brown);
      tube(arr,[x,2.07+y,z],[x,2.34+y,z],.17,.14,8,2,skin);
      ellipsoid(arr,x,2.56+y,z,.30,.38,.28,2,skin);
      ellipsoid(arr,x,2.87+y,z,.31,.13,.30,infected?9:7,infected?C.grey:C.dark);
      ellipsoid(arr,x,2.46+y,z+.265,.22,.10,.055,infected?13:8,infected?C.rust:C.dark);
      const armSwing=Math.sin(step)*.15*walking;
      const shL=[x-.48,1.94+y,z],shR=[x+.48,1.94+y,z];
      const elL=[x-.66,1.43+y,z+armSwing],elR=[x+.66,1.43+y,z-armSwing];
      tube(arr,shL,elL,.19,.15,7,12,coat);tube(arr,shR,elR,.19,.15,7,12,coat);
      tube(arr,elL,[x-.55,1.1+y,z+.35+armSwing],.15,.11,7,2,skin);
      tube(arr,elR,[x+.48,1.13+y,z+.4-armSwing],.15,.11,7,2,skin);
      if(!infected){box(arr,x,1.56+y,z+.31,.37,.52,.09,7,C.brown);box(arr,x,1.91+y,z+.32,.15,.3,.08,7,C.grey);box(arr,x+.45,1.34+y,z-.15,.21,.34,.31,7,C.dark);}
      if(!a.friendly&&!infected){tube(arr,[x+.36,1.5+y,z-.3],[x+.36,1.5+y,z-.95],.065,.05,6,7,C.dark);}
    }
    function gunModel(arr,cam){
      const a=S.p.yaw,p=S.p.pitch,r=S.recoil,ca=Math.cos(a),sa=Math.sin(a),cp=Math.cos(p),sp=Math.sin(p);
      const f=[sa*cp,sp,-ca*cp],right=[ca,0,sa],up=[-sa*sp,cp,ca*sp];
      const bob=Math.sin(S.headbob)*S.walkAmount*.018;
      const base={x:cam.eye.x+f[0]*.63+right[0]*.2+up[0]*(-.31+bob-r*.32),y:cam.eye.y+f[1]*.63+up[1]*(-.31+bob-r*.32),z:cam.eye.z+f[2]*.63+right[2]*.2+up[2]*(-.31+bob-r*.32)};
      const gun=weaponData[S.weapon],len=gun.kind==='pistol'?.44:gun.kind==='smg'?.66:gun.kind==='shotgun'?.92:gun.kind==='dmr'?1.3:1.04;
      const wp=(u,v,w)=>[base.x+right[0]*u+up[0]*v+f[0]*w,base.y+up[1]*v+f[1]*w,base.z+right[2]*u+up[2]*v+f[2]*w];
      const gb=(u,v,w,sx,sy,sz,mat,col)=>{const pt=wp(u,v,w);box(arr,pt[0],pt[1],pt[2],sx,sy,sz,mat,col);};
      const gt=(u,v,w0,w1,r0,r1,mat,col)=>tube(arr,wp(u,v,w0),wp(u,v,w1),r0,r1,9,mat,col);
      gb(0,0,.18,.18,.20,.39,7,C.dark);gb(0,.04,.46,.18,.17,.39,7,C.grey);
      gt(0,.035,len*.58,len+.1,.063,.047,7,C.dark);gt(0,.045,len*.61,len*.80,.093,.075,7,C.grey);
      gb(0,.17,.30,.11,.11,.27,7,C.dark);gb(0,.24,.31,.09,.08,.13,8,C.grey);
      gb(-.06,-.17,.2,.13,.32,.18,7,C.brown);
      if(gun.kind!=='pistol'){gb(0,-.19,.34,.13,.27,.16,7,C.dark);gb(.06,-.08,.66,.07,.18,.26,12,C.green);gb(0,-.045,.08,.19,.13,.3,7,C.dark);}
      if(gun.kind==='dmr'){gb(0,.25,.51,.18,.13,.32,7,C.dark);gb(0,.32,.51,.11,.09,.23,8,C.grey);}
      if(gun.kind==='shotgun'){gt(0,-.03,.58,.98,.09,.077,7,C.dark);}
      // Support hand and sleeve moving in the same weapon-space as the gun
      const hand=wp(-.19,-.21,.37);ellipsoid(arr,...hand,.115,.14,.14,2,C.tan);
      const sleeve=wp(-.24,-.31,.23);ellipsoid(arr,...sleeve,.18,.25,.18,12,chars[S.char].coat);
    }

    const interactions = {
        newBtn: () => { S.mode = 'select'; visibility('selectMenu'); }, exploreBtn: () => { start('explore'); }, continueBtn: () => { if (load())
            start('story', true); }, backSelect: resetMenu,
        beginBtn: intro, introNext: () => start('story'), settingsBtn: showSettings, settingsBack: () => { if (settingsFrom === 'pause') {
            S.mode = 'pause';
            visibility('pauseMenu');
        }
        else
            resetMenu(); },
        resumeBtn: pause, quitBtn: resetMenu, pauseSave: () => { save(); notify('PROGRESSO SALVATO', 1.5); }, pauseMap: () => { S.mode = 'play'; showMap(); }, pauseSettings: showSettings, mapClose: showMap, journalClose: showJournal,
        respawnBtn: respawn, touchMap: showMap, touchHeal: heal, touchReload: reload, touchUse: checkInteract, touchPause: pause, touchGrenade:()=>throwGrenade(false),touchSmoke:()=>throwGrenade(true), touchWeapon:()=>changeWeapon((S.weapon+1)%weaponData.length)
    };
    for (const [id, fn] of Object.entries(interactions))
        $(id)?.addEventListener('click', fn);
    const cardList = [...document.querySelectorAll('.character')];
    for (const c of cardList)
        c.addEventListener('click', () => { S.char = c.dataset.char; cardList.forEach(x => x.classList.toggle('selected', x === c)); sound(430, .045, 'triangle', .03); });
    $('quality').value = cfg.quality;
    $('quality').addEventListener('change', e => { cfg.quality = e.target.value; });
    $('sensitivity').addEventListener('input', e => { cfg.sensitivity = +e.target.value; });
    $('autoAim').addEventListener('change', e => cfg.autoAim = e.target.checked);
    const stopGameKeys = new Set(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);
    window.addEventListener('keydown', e => { if (stopGameKeys.has(e.code))
        e.preventDefault(); if (e.repeat && ['KeyE', 'KeyM', 'KeyJ', 'Escape', 'KeyP', 'KeyH'].includes(e.code))
        return; key.add(e.code); if (S.mode === 'intro' && e.code === 'Enter')
        return start('story'); if (S.mode === 'dialogue' && ['Enter', 'KeyE', 'Space'].includes(e.code))
        return advanceLine(); if (S.mode === 'play') {
        if (e.code === 'KeyE')
            checkInteract();
        if (e.code === 'KeyR')
            reload();
        if (e.code === 'KeyH')
            heal();
        if (e.code === 'KeyM')
            showMap();
        if (e.code === 'KeyJ')
            showJournal();
        if (e.code === 'KeyP' || e.code === 'Escape')
            pause();
        if (e.code === 'KeyV')
            S.camera = S.camera === 'fps' ? 'third' : 'fps';
        if (/^Digit[1-6]$/.test(e.code))
            changeWeapon(Number(e.code.slice(-1)) - 1);
        if (e.code === 'KeyG')throwGrenade(false);if(e.code === 'KeyT')throwGrenade(true);if(e.code === 'KeyF'){S.allyMode=S.allyMode==='follow'?'hold':'follow';if(sentinel.follow||S.allyMode==='follow')sentinel.follow=S.allyMode==='follow';notify(S.allyMode==='follow'?'SQUADRA: SEGUITEMI':'SQUADRA: MANTENETE LA POSIZIONE',2);}if(e.code === 'KeyQ')
            changeWeapon((S.weapon + 1) % weaponData.length);
    }
    else if (S.mode === 'pause' && ['Escape', 'KeyP'].includes(e.code))
        pause();
    else if (S.mode === 'map' && ['Escape', 'KeyM'].includes(e.code))
        showMap();
    else if (S.mode === 'journal' && ['Escape', 'KeyJ'].includes(e.code))
        showJournal(); });
    window.addEventListener('keyup', e => key.delete(e.code));
    window.addEventListener('blur', () => { key.clear(); mouse.down = false; touchInput.shoot = false; });
    cv.addEventListener('click', () => { if (S.mode === 'play' && !matchMedia('(pointer:coarse)').matches)
        cv.requestPointerLock?.(); });
    cv.addEventListener('mousedown', e => { if (S.mode === 'play' && e.button === 0) {
        mouse.down = true;
        fire();
    } });
    window.addEventListener('mouseup', () => mouse.down = false);
    window.addEventListener('mousemove', e => { if (S.mode === 'play' && document.pointerLockElement === cv) {
        mouse.dx += e.movementX;
        mouse.dy += e.movementY;
    } });
    cv.addEventListener('contextmenu', e => e.preventDefault());
    function analog(id, which) { let area = $(id), nub = area.querySelector('i'); area.addEventListener('pointerdown', e => { area.setPointerCapture(e.pointerId); touchInput[which].id = e.pointerId; place(e); }); area.addEventListener('pointermove', e => { if (touchInput[which].id === e.pointerId)
        place(e); }); function place(e) { let r = area.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, dx = (e.clientX - cx) / (r.width * .42), dy = (e.clientY - cy) / (r.height * .42), len = Math.max(1, Math.hypot(dx, dy)); dx /= len; dy /= len; touchInput[which].x = dx; touchInput[which].y = dy; nub.style.transform = `translate(${dx * r.width * .25}px,${dy * r.height * .25}px)`; } function release(e) { if (touchInput[which].id === e.pointerId) {
        touchInput[which].id = null;
        touchInput[which].x = touchInput[which].y = 0;
        nub.style.transform = '';
    } } area.addEventListener('pointerup', release); area.addEventListener('pointercancel', release); }
    analog('moveStick', 'move');
    analog('aimStick', 'look');
    $('touchFire').addEventListener('pointerdown', e => { touchInput.shoot = true; fire(); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave'])
        $('touchFire').addEventListener(ev, () => touchInput.shoot = false);
    $('touchRun').addEventListener('pointerdown', () => touchInput.sprint = true);
    for (const ev of ['pointerup', 'pointercancel'])
        $('touchRun').addEventListener(ev, () => touchInput.sprint = false);
    function pollPad() { const pad = navigator.getGamepads?.()?.find(p => p?.connected); if (!pad)
        return; $('padStatus').textContent = 'DUALSHOCK / GAMEPAD'; const next = pad.buttons.map(b => b.pressed); let edge = i => next[i] && !padState[i]; if (S.mode === 'play') {
        if (pad.buttons[7]?.pressed)
            fire();
        if (edge(2))
            checkInteract();
        if (edge(3))
            changeWeapon((S.weapon + 1) % weaponData.length);
        if (edge(0))
            heal();
        if (edge(1))
            reload();
        if (edge(9))
            pause();
        if (edge(12))showMap();if(edge(4))throwGrenade(true);if(edge(5))throwGrenade(false);
    }
    else if (S.mode === 'dialogue' && edge(0))
        advanceLine();
    else if (S.mode === 'pause' && edge(9))
        pause();
    else if (S.mode === 'intro' && edge(0))
        start('story');
    else if (S.mode === 'menu' && edge(0)) {
        $('newBtn').click();
    }
    else if (S.mode === 'select' && edge(0))
        intro(); padState.splice(0, padState.length, ...next); }
    function step(t) { let dt = Math.min((t - last) / 1000, .05); last = t; S.time += dt; frameTimer += dt; if (frameTimer >= 1) {
        frameFPS = Math.round(frameCounter / frameTimer);
        frameCounter = 0;
        frameTimer = 0;
        $('fps').textContent = frameFPS + ' FPS';
        if(S.mode==='play'&&frameFPS>0&&frameFPS<18){perfPenalty++;if(perfPenalty>=4&&cfg.quality!=='low'){cfg.quality='low';$('quality').value='low';notify('MODALITÀ PRESTAZIONI ATTIVATA',3);perfPenalty=0;}}else perfPenalty=Math.max(0,perfPenalty-1);
    } pollPad(); if (S.mode === 'play') {
        S.p.yaw += touchInput.look.x * dt * 2.2 * cfg.sensitivity;
        S.p.pitch = clamp(S.p.pitch - touchInput.look.y * dt * 1.5 * cfg.sensitivity, -1.0, 1.0);
    } advance(dt); if(!document.hidden && t-renderedAt>1000/renderHz){renderedAt=t;render();frameCounter++;} requestAnimationFrame(step); }
    $('briefNext').addEventListener('click',()=>{if(S.mode==='brief'){$('missionBrief').classList.add('hidden');S.mode='play';visibility('hud',...(matchMedia('(pointer:coarse)').matches?['touch']:[]));updateHUD();}});
    $('choiceA').addEventListener('click',()=>chooseOption(0));
    $('choiceB').addEventListener('click',()=>chooseOption(1));
    resetMenu();
    requestAnimationFrame(step);
    // Exposed read-only instrumentation supports deterministic browser smoke tests.
    window.COP_DEBUG = { get state() { return { mode: S.mode, quest: S.quest, chapter: missionFromStage(S.quest), char: S.char, weapon:S.weapon, grenades:S.grenades, smoke:S.smoke, choices:S.branch, x: S.p.x, z: S.p.z, health: S.p.hp, enemies: enemies.filter(a => !a.dead).length, drawnTriangles: staticCount / 3, webgl: true }; }, setPosition(x, z) { S.p.x = x; S.p.z = z; }, setQuest(q) { S.quest = clamp(q, 0, objectiveData.length-1);S.stageArmed=false;updateHUD(); }, endEnemies() { for (let a of enemies) {
            if (S.waveIds.includes(a.id))
                a.dead = true;
        } },interact:checkInteract,choose:chooseOption,throwGrenade,advance:()=>advanceQuest(S.quest+1),get objective(){return stage().title;},get triangles(){return staticCount/3;},get stageInfo(){const q=stage();return {index:S.quest,kind:q.kind,at:q.at,dialogueLines:q.lines?.length||0,seconds:q.seconds||0};},skipTime(n){S.time+=n;},tick(){campaignTick(.017);},setQuality(v){cfg.quality=v;}};
})();