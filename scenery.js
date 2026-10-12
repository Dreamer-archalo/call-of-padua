/* CALL OF PADUA — modular environmental set dressing, 0.5.
 * Uses existing WebGL mesh helpers. Low polygon count, streamed in core chunks.
 */
(() => {
'use strict';
function build(api){
 const {mesh,box,cylinder,quad,ground,C}=api;
 const stone=[.71,.66,.57],ivory=[.86,.83,.71],tarp=[.36,.42,.34],moss=[.47,.55,.39],rust=[.59,.38,.29],metal=[.43,.48,.48],dark=[.24,.28,.27];
 const add=(x,y,z,w,h,d,t,col)=>box(mesh,x,y,z,w,h,d,t,col);
 // Fragile physical history: road paint, blocked doorways, shop signs and rain-damaged posters.
 function shutter(x,z,w=3){add(x,0,z,w,3.3,.15,7,metal);for(let j=0;j<5;j++)add(x,.32+j*.53,z+.1,w,.055,.045,11,dark);}
 function posters(x,z){for(let i=0;i<3;i++){const col=i===0?ivory:i===1?rust:tarp;add(x+(i-1)*.88,2.1+i*.19,z+.04,.63,1.0,.055,12,col);}}
 function sandbags(x,z,wide=3){for(let j=0;j<2;j++)for(let i=0;i<wide;i++){let shift=j?.46:0;add(x+(i-wide/2)*1.12+shift,j*.36,z,.97,.36,.55,11,j?ivory:stone);}}
 function tarpTent(x,z){
  for(let dx of [-3,3])for(let dz of [-2,2])cylinder(mesh,x+dx,0,z+dz,.055,3.4,5,7,dark);
  quad(mesh,[x-3,2,z-2],[x+3,2,z-2],[x+3,3.5,z],[x-3,3.5,z],[0,.65,-.65],12,tarp);
  quad(mesh,[x-3,3.5,z],[x+3,3.5,z],[x+3,2,z+2],[x-3,2,z+2],[0,.65,.65],12,ivory);
  add(x,0,z,5.7,.09,3.7,6,stone);
 }
 function brokenGlass(x,z){for(let i=0;i<6;i++){const t=i*1.73;add(x+Math.cos(t)*(i*.19),.02,z+Math.sin(t)*(i*.23),.2+i*.07,.025,.22+i*.04,8,metal);}}
 function lightCable(x,z,len=7){add(x,5.7,z,len,.04,.06,7,dark);for(let i=0;i<4;i++)add(x-len*.4+i*len*.27,5.51,z,.08,.3,.08,12,ivory);}
 function walkway(x,z,w=7,d=24){ground(mesh,x,z,w,d,1,stone,.035);for(let i=0;i<Math.floor(d/3);i++)add(x-w/2+.2,.05,z-d/2+1.5+i*3,.08,.025,1.15,11,ivory);}
 function vines(x,z,height=8){for(let i=0;i<5;i++){const y=1.5+i*1.25;add(x,y,z,.07,.8,.07,10,moss);add(x+(.35*(i%2?1:-1)),y+.2,z+.07,.7,.08,.5,9,tarp);}}
 function radioCamp(x,z){add(x,0,z,3.4,1.4,1.8,6,ivory);add(x,1.4,z,.9,.55,.55,7,dark);cylinder(mesh,x+.7,1.4,z,.035,4.2,5,7,dark);add(x+.7,5.5,z,1.2,.08,.09,7,dark);sandbags(x+4,z,3);}
 function benchPair(x,z){for(let i=0;i<2;i++){add(x+i*3.1,.43,z,2.4,.16,.65,6,stone);for(let p of [-.8,.8])add(x+i*3.1+p,0,z,.14,.44,.4,7,dark);}}
 function chapelCandles(x,z){add(x,.35,z,1.8,.52,.63,1,stone);for(let i=0;i<5;i++)add(x-.7+i*.35,.91,z,.055,.13,.055,12,ivory);}
 // Duomo: inhabited refuge, notice boards, tents, radios and low light rather than a military arena.
 for(const t of [[-188,109],[-177,115],[-145,107]])tarpTent(...t);
 radioCamp(-151,105);benchPair(-172,111);chapelCandles(-162,113);
 posters(-156,66);shutter(-150,65,3);sandbags(-180,108,3);lightCable(-169,95,15);
 // Ghetto: narrow alleys and walking passages punctuated by interrupted lives.
 for(const [x,z] of [[-130,44],[-113,38],[-112,60],[-94,41]]){shutter(x,z,2.8);brokenGlass(x,z+3);}
 walkway(-132,56,5,28);
 for(const [x,z] of [[-96,64],[-126,15],[-77,33]]){posters(x,z);vines(x+2,z,6);}
 // Signori: discarded communal space and a field triage post.
 for(const [x,z] of [[-129,-18],[-102,7],[-113,22]])sandbags(x,z,4);
 add(-124,.03,-10,6,.07,1.5,12,ivory);add(-130,.3,-16,3,1.2,.7,6,rust);
 chapelCandles(-113,-24);brokenGlass(-110,-18);benchPair(-106,-5);
 // Erbe / Frutta: shuttered market, rubble and abandoned deliveries.
 for(const [x,z] of [[-42,48],[-23,84],[18,92],[41,37],[-15,-76],[34,-51]]){
  add(x,.05,z,4.1,.2,2.7,6,stone);add(x,1.4,z,3.6,.11,2.1,6,rust);sandbags(x+2.7,z,2);
 }
 for(const [x,z] of [[-35,73],[27,42],[1,-90],[-27,-60]]){brokenGlass(x,z);posters(x+1,z+1);}
 lightCable(0,113,9);lightCable(-4,-91,10);
 // University / Pedrocchi: improvised bulletin boards, steel shutters, personal belongings.
 for(const [x,z] of [[154,-23],[181,-28],[189,-59],[148,-59]]){shutter(x,z,3);posters(x+3,z);}
 add(172,0,-21,3.6,1.2,2,6,stone);chapelCandles(168,-33);brokenGlass(171,-40);
 // Santo: emergency aid & evacuation, remnant of religious architecture in fog.
 for(const [x,z] of [[113,153],[157,175],[151,208]])tarpTent(x,z);
 radioCamp(164,196);chapelCandles(143,194);
 for(const [x,z] of [[113,160],[148,192],[176,169]]){sandbags(x,z,3);brokenGlass(x+3,z);}
 // A few muted painted lines establish scale while remaining cheap on low-end devices.
 for(const [x,z,d] of [[65,65,40],[-90,112,26],[87,131,28],[105,-24,35]])walkway(x,z,3,d);
}
window.COP_SCENERY={build};
})();