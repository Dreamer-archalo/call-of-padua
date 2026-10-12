/* CALL OF PADUA — Narrative director / 0.5
 * No network, no tracking, optional hooks for the core game.
 * All story passages are original and interrupt gameplay only at scripted chapter breaks.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const voices = [
    {who:'MARTA',text:'Non siamo qui per riconquistare una città. Siamo qui per riportare le persone a casa.',at:1},
    {who:'LEA',text:'Questi vicoli erano pieni di studenti. Adesso riconosco le vie solo dal rumore del vento.',at:2},
    {who:'ROCCO',text:'Se la radio prende, parla piano. Le Torri ascoltano anche il silenzio tra due parole.',at:6},
    {who:'LA GUARDIA',text:'Vedo del fumo dietro il Palazzo. Non è nostro. Resta sotto i portici.',at:7},
    {who:'IRENE',text:'Passavo di qui ogni mattina. Il Pedrocchi apriva prima che arrivasse il sole.',at:11},
    {who:'IRENE',text:'Cammina con me. Non serve correre sempre. Se abbiamo ancora paura, siamo ancora vivi.',at:15},
    {who:'ADA',text:'Le medicine non sono un premio. Sono il tempo che resta a qualcuno.',at:17},
    {who:'STEFANO',text:'Non ho più contato i giorni. Contavo i passi fino alla porta, nella speranza che qualcuno tornasse.',at:21},
    {who:'MARTA',text:'I bambini dormono quando il generatore funziona. Non sanno quanto ci costa tenerlo acceso.',at:23},
    {who:'ROCCO',text:'Tutte le strade arrivano alle Erbe. Stanotte, anche le nostre scelte.',at:26}
  ];
  const zones = {
    'DUOMO / RIFUGIO':{label:'IL RIFUGIO',note:'Sotto i teloni si condividono scorte, paura e un posto dove dormire.',tone:'Il rumore della città qui è un sussurro.'},
    'PIAZZA DEI SIGNORI':{label:'I SIGNORI',note:'Tra le facciate annerite, gli avvisi di evacuazione sono rimasti alle pareti.',tone:'Carta bagnata, vetrine spente, passi nel vuoto.'},
    'PIAZZA DELLE ERBE':{label:'LE ERBE',note:'Bancarelle rovesciate. Un mercato che ha smesso di aprire.',tone:'Qui il vento porta le voci molto lontano.'},
    'PIAZZA DELLA FRUTTA':{label:'LA FRUTTA',note:'Le tende lacerate pendono sotto il Palazzo della Ragione.',tone:'I portici custodiscono il suono dei tuoi passi.'},
    'CAFFÈ PEDROCCHI':{label:'IL PEDROCCHI',note:'La piazza dell’incontro è diventata una rete di passaggi sorvegliati.',tone:'Qualcuno lascia ancora messaggi scritti sui muri.'},
    'BASILICA DEL SANTO':{label:'IL SANTO',note:'Le cupole emergono dalla foschia. Le campane tacciono da mesi.',tone:'Un luogo familiare che non riesce più a rassicurare.'}
  };
  const chapters = [
    {eyebrow:'CAPITOLO I · LE PERSONE PRIMA DELLE SCORTE',title:'QUELLO CHE RESTA',outcome:'Al Duomo arrivano gli antibiotici. Marta li divide tra chi ha aspettato tutta la notte. Anna finalmente smette di tremare.',quote:'«Hai portato indietro qualcosa di più delle medicine.» — Marta',next:'LA FREQUENZA MORTA',preview:'Dalla piazza arriva un segnale debole. Qualcuno continua a trasmettere, nonostante la Milizia delle Torri ascolti ogni frequenza.',location:'PIAZZA DELLA FRUTTA → PALAZZO DELLA RAGIONE'},
    {eyebrow:'CAPITOLO II · OGNI VOCE È UN RISCHIO',title:'IL SUONO DELLA CITTÀ',outcome:'Il ripetitore torna in funzione. Non risponde il comando militare: si sente il nome di Irene, pronunciato da una voce sconosciuta.',quote:'«Se ci sentite, non accendete tutte le luci.» — Trasmissione intercettata',next:'L’ULTIMO CORRIERE',preview:'La registrazione conduce al Pedrocchi. Marta sa che Irene è partita con una notizia che non può cadere nelle mani sbagliate.',location:'PORTICI UNIVERSITARI → CAFFÈ PEDROCCHI'},
    {eyebrow:'CAPITOLO III · UNA SCELTA HA SEMPRE UN VOLTO',title:'IL PREZZO DEL PASSAGGIO',outcome:'Irene è salva. Ma il gruppo si è diviso, e la scelta sulle scorte continuerà a pesare sui prossimi giorni.',quote:'«Non è il coraggio che ci separa. È ciò che decidiamo di non vedere.» — Irene',next:'IL SANTO NON RISPONDE',preview:'Una famiglia chiede aiuto dalla Basilica. Al Santo qualcuno aspetta da giorni, senza sapere se il rifugio esista ancora.',location:'RIVIERA → BASILICA DEL SANTO'},
    {eyebrow:'CAPITOLO IV · NON LASCIARE NESSUNO INDIETRO',title:'IL RITORNO',outcome:'Stefano rivede il Duomo. Racconta alla comunità della gente rimasta isolata oltre il chiostro. Il rifugio non è più il solo punto di resistenza.',quote:'«Pensavo che avreste girato la testa come tutti gli altri.» — Stefano',next:'LA NOTTE DELLE CAMPANE',preview:'Le Torri preparano un’operazione finale. Rocco ha una soluzione, ma chiede una scelta irreversibile: trasmettere o restare nascosti.',location:'DUOMO → PIAZZA DELLE ERBE'},
    {eyebrow:'EPILOGO · PADOVA TORNA A PARLARE',title:'UNA CITTÀ, NON UN ESERCITO',outcome:'Il rifugio sopravvive a un’altra notte. Chi ascolta la radio sentirà quello che il gruppo ha deciso di diventare.',quote:'«Non sappiamo se domani andrà meglio. Sappiamo che oggi siamo ancora qui.» — Marta',next:'ESPLORAZIONE LIBERA',preview:'La campagna è finita. Puoi continuare a esplorare, raccogliere rifornimenti e tornare dai superstiti.',location:'CENTRO STORICO · PADOVA'}
  ];
  let lastQuest=-1,lastZone='',lastVoice=-1,quietUntil=0,hideAt=0,clock=0,lastInt=0;
  let caption,foot,chapterDetail;
  function boot(){
    if($('storyCaption'))return;
    caption=document.createElement('div');caption.id='storyCaption';caption.setAttribute('aria-live','polite');
    caption.innerHTML='<small id="storySpeaker">COMUNICAZIONI</small><p id="storyLine"></p>';
    foot=document.createElement('div');foot.id='storyEnvironment';foot.innerHTML='<div id="storyLocation"></div><p id="storyLocationInfo"></p>';
    document.body.append(caption,foot);
    chapterDetail=document.createElement('section');chapterDetail.id='chapterDetail';
    chapterDetail.innerHTML='<div class="fieldLine">RAPPORTO / ARCHIVIO DEL RIFUGIO</div><p id="chapterOutcome"></p><blockquote id="chapterQuote"></blockquote><div class="fieldLine">PROSSIMA OPERAZIONE</div><strong id="chapterNext"></strong><p id="chapterPreview"></p><div class="fieldLine" id="chapterLocation"></div>';
    const panel=$('missionBrief')?.querySelector('.chapterPanel');
    if(panel)panel.insertBefore(chapterDetail,$('briefNext'));
  }
  function whisper(who,text,time=6.4){boot(); if(!caption)return;
    $('storySpeaker').textContent=who;$('storyLine').textContent=text;
    caption.classList.add('visible');hideAt=clock+time;
  }
  function begin(s){boot();lastQuest=-1;lastZone='';lastVoice=-1;quietUntil=s.time+7;caption.classList.remove('visible');
    if(s.quest===0)whisper('DIARIO DI '+s.char.toUpperCase(),'Siamo ancora qui. Questa mattina non ci sono stati spari. Forse è abbastanza per cominciare.',7);
  }
  function zone(s,label){boot();if(label===lastZone)return;lastZone=label;
    const info=zones[label];if(!info)return;
    $('storyLocation').textContent=info.label;$('storyLocationInfo').textContent=info.note;
    foot.classList.remove('reveal');void foot.offsetWidth;foot.classList.add('reveal');
  }
  function stage(s,objective){if(s.quest===lastQuest)return;lastQuest=s.quest;
    const entry=voices.find(v=>v.at===s.quest);
    if(entry && s.mode==='play' && lastVoice!==s.quest){lastVoice=s.quest;quietUntil=s.time+7;whisper(entry.who,entry.text,7.5);}
  }
  function tick(s){if(!caption)return;clock=s.time;
    if(caption.classList.contains('visible') && clock>hideAt)caption.classList.remove('visible');
    if(s.mode==='play' && (s.time-lastInt)>1.5){
      lastInt=s.time;
      const peaceful=[1,6,11,15,17,21,23].includes(s.quest);
      document.body.classList.toggle('cop-quiet',peaceful);
    }
    // Tick doesn't schedule dialogue over interactive NPC dialogue, and never advances quests.
  }
  function dialogue(s,name,line){boot();caption.classList.remove('visible');
    $('conversation')?.classList.add('cinematicConversation');
    const role={MARTA:'COORDINATRICE DEL DUOMO',ROCCO:'RADIO E RIFORNIMENTI',IRENE:'STAFFETTA DEL CENTRO',STEFANO:'SOPRAVVISSUTO DEL SANTO'};
    if($('speakerRole'))$('speakerRole').textContent=role[name]||'SOPRAVVISSUTI · PADOVA';
  }
  function finish(last,next,s){boot();const entry=chapters[Math.min(last,4)];
    $('briefEyebrow').textContent=entry.eyebrow;$('briefTitle').textContent=entry.title;
    $('chapterOutcome').textContent=entry.outcome;$('chapterQuote').textContent=entry.quote;
    $('chapterNext').textContent=entry.next;$('chapterPreview').textContent=entry.preview;
    $('chapterLocation').textContent=entry.location;
    $('briefBody').textContent=`TEMPO OPERAZIONE: ${Math.floor((s.chapterTimes[last]||0)/60)} MIN ${Math.floor((s.chapterTimes[last]||0)%60)} SEC · ${s.kills} MINACCE NEUTRALIZZATE`;caption.classList.remove('visible');
  }
  function events(){return {zone:lastZone,quest:lastQuest,caption:caption?.classList.contains('visible')||false,report:!!chapterDetail};}
  window.COP_DIRECTOR={boot,begin,zone,stage,tick,dialogue,finish,whisper,events};
})();