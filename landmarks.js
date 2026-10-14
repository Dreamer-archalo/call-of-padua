/* CALL OF PADUA 0.7 — Piazza dei Signori architectural blockout.
   Interpretive hand-built geometry, not an architectural scan. All art original.
   Axis: tower at z=-49 (west), San Clemente at z=+43 (east).
   Ground floor front of the Palazzo faces +z, towards the square.
*/
(() => {
'use strict';
const ivory=[.93,.87,.73],plaster=[.87,.78,.64],warm=[.79,.65,.49],brick=[.73,.48,.37],slate=[.34,.42,.44],metal=[.27,.31,.29],gold=[.86,.72,.41],glass=[.28,.39,.40],marble=[.95,.91,.83];
function build({mesh,box,quad,ground,cylinder,pushCollision}) {
  const b=(x,y,z,w,h,d,t=2,c=ivory)=>box(mesh,x,y,z,w,h,d,t,c);
  const q=(a,bb,c,d,n,t=2,col=ivory)=>quad(mesh,a,bb,c,d,n,t,col,.28);
  const col=(x,y,z,r,h,segments=10,t=5,c=ivory)=>cylinder(mesh,x,y,z,r,h,segments,t,c);
  // Arch rings are actual open meshes. The passage beneath the clock is traversable.
  function archX(cx,front,span,base,top,thick=.67,color=ivory){
    const radius=span*.5, steps=12, rise=Math.min(radius*.88,top-base-.4);
    const line=(v)=>[cx+radius*Math.cos(v),base+rise*Math.sin(v),front];
    for(let i=0;i<steps;i++){
      const a=Math.PI-i*Math.PI/steps, bb=Math.PI-(i+1)*Math.PI/steps;
      let p=line(a),r=line(bb);
      let o=[cx+(radius+thick)*Math.cos(a),base+(rise+thick)*Math.sin(a),front+.02];
      let oo=[cx+(radius+thick)*Math.cos(bb),base+(rise+thick)*Math.sin(bb),front+.02];
      q(p,r,oo,o,[0,0,1],5,color);
    }
  }
  function archZ(cx,cz,frontX,span,top=6){
    const y=top*.58,r=span/2;
    for(let i=0;i<10;i++){
      const a=Math.PI-i*Math.PI/10, bb=Math.PI-(i+1)*Math.PI/10;
      const inner=(t)=>[frontX, y+r*.83*Math.sin(t),cz+r*Math.cos(t)];
      const outer=(t)=>[frontX+.04,y+(r*.83+.45)*Math.sin(t),cz+(r+.45)*Math.cos(t)];
      q(inner(a),inner(bb),outer(bb),outer(a),[cx>frontX?-1:1,0,0],5,ivory);
    }
  }
  // West end: Palazzo del Capitanio and its long symmetrical wings.
  for(const side of [-1,1]){
    const start=side<0?-166:-110, count=8, direction=side<0?1:1;
    const xWing=side<0?-149:-93;
    b(xWing,0,-51.0,35,19,14,2,ivory);pushCollision(xWing,-51,34,14);
    // Lower portico, rhythmic paired columns and large Renaissance upper windows.
    for(let j=0;j<count;j++){
      let x=xWing-16.2+(j+.5)*32.4/count;
      b(x,0,-42.7,.43,5.5,.83,5,marble);
      b(x,5.48,-42.7,.92,.35,1.05,5,ivory);
      archX(x+2.02,-42.29,3.72,3.2,5.65,.35,ivory);
      // upper floor with frame, arched window and sill
      const wx=x+1.92;
      b(wx,10.2,-43.83,1.86,3.0,.18,8,slate);
      b(wx,10.03,-43.69,2.12,.19,.29,5,marble);
      b(wx,13.2,-43.78,2.11,.24,.3,5,marble);
      b(wx,14.6,-43.85,1.18,1.8,.12,8,glass);
      b(wx,15.85,-43.78,1.98,.2,.22,5,marble);
    }
    b(xWing,6,-43.05,34.8,.4,1.16,5,ivory);
    b(xWing,18.7,-42.8,35.3,.52,1.4,5,marble);
    b(xWing,19.2,-51,35.6,1.5,15,4,brick);
  }
  // Clock tower: masonry pier + through passage, not a solid collision block.
  for(const xx of [-126.5,-115.5]){
    b(xx,0,-49,3.9,12.7,10.2,5,marble);
    pushCollision(xx,-49,3.9,10.2);
    b(xx,11.9,-43.6,4.6,1.12,1.4,5,marble);
  }
  b(-121,12.5,-49,15,5.6,10.2,5,plaster);
  archX(-121,-43.6,8.0,5.75,11.6,.95,marble);
  b(-121,17.95,-48.2,14.3,20.5,11,2,ivory);
  for(const yy of [18.7,27.8,38.0])b(-121,yy,-42.35,15.3,.46,1.1,5,marble);
  // Circular astronomical clock, rather than an unrecognizable square window.
  function ring(cx,cy,z,inside,outside,c,t=7){
    for(let i=0;i<40;i++){
      const a=i*Math.PI/20, bb=(i+1)*Math.PI/20;
      const at=(r,ang)=>[cx+r*Math.cos(ang),cy+r*Math.sin(ang),z];
      q(at(inside,a),at(inside,bb),at(outside,bb),at(outside,a),[0,0,1],t,c);
    }
  }
  ring(-121,32.8,-42.08,0,4.02,slate);
  ring(-121,32.8,-42.025,3.55,4.19,gold);
  ring(-121,32.8,-41.98,2.72,2.89,gold);
  ring(-121,32.8,-41.91,.90,1.05,gold);
  // Astronomical tick marks and symbolic gilded dial (not a fabricated exact copy).
  for(let i=0;i<24;i++){
    const a=i*Math.PI/12;
    let xx=-121+3.27*Math.sin(a),yy=32.8+3.27*Math.cos(a);
    b(xx,yy,-41.89,i%2?.10:.15,i%2?.24:.39,.11,7,gold);
  }
  b(-121,32.8,-41.83,.35,.35,.15,7,marble);
  q([-121,32.8,-41.82],[-120.64,35.18,-41.82],[-120.56,35.05,-41.82],[-121,32.8,-41.82],[0,0,1],7,gold);
  q([-121,32.8,-41.78],[-119.45,32.18,-41.78],[-119.41,32.37,-41.78],[-121,32.8,-41.78],[0,0,1],7,marble);
  // Belfry, open lancet-like apertures, parapet and domed roof.
  b(-121,38.6,-49,12.0,4.6,10.4,5,ivory);
  for(let x of [-125.2,-121,-116.8]){
    b(x,40,-43.6,2.12,2.55,.1,8,slate);
    b(x,39.6,-43.48,.42,3.3,.26,5,marble);
    archX(x,-43.45,1.78,41.8,43.4,.18,marble);
  }
  b(-121,43.7,-49,12.8,.65,11.5,5,marble);
  for(let x of [-126.6,-122.9,-119.1,-115.4])for(let z of [-54,-44.2])b(x,44.15,z,.35,1.3,.35,5,marble);
  col(-121,45.2,-49,4.6,2.2,16,5,ivory);
  for(let j=0;j<8;j++){
    const ang=j*Math.PI/4,xx=-121+Math.sin(ang)*2.9,zz=-49+Math.cos(ang)*2.9;
    col(xx,47.4,zz,.31,1.9,5,5,marble);
  }
  // Lightweight round dome approximation with layered diminishing cylinders.
  for(let i=0;i<6;i++){
    const rr=4.3*Math.sqrt(Math.max(.035,1-Math.pow((i+.5)/6,2)));
    col(-121,49.3+i*.45,-49,rr,.46,16,4,slate);
  }
  col(-121,52.3,-49,.16,1.55,8,7,gold);
  // East end: Church of San Clemente, opposing the clock, with triangular pediment.
  b(-121,0,45.6,25.5,15,13,2,plaster);pushCollision(-121,45.6,25,13);
  const face=38.9;
  b(-121,0,face,6.1,8.5,.27,7,metal);
  archX(-121,face+.19,6.0,5.8,9.1,.37,marble);
  b(-121,8.5,face+.2,8.6,1.0,.75,5,marble);
  for(const x of [-131.9,-110.1]){
    b(x,0,face-.15,1.25,15,.55,5,marble);
    b(x,14.0,face-.1,1.85,1.1,.78,5,marble);
  }
  q([-135,15.0,face],[-107,15,face],[-121,20,face],[-121,20,face],[0,0,-1],4,brick);
  q([-135,15.15,face+.12],[-121,20.2,face+.12],[-107,15.15,face+.12],[-135,15.15,face+.12],[0,0,-1],5,ivory);
  b(-121,16.0,face+.34,4,1.9,.25,5,marble);
  // Long lateral rows of shops and balconies. Keep edges open to cross-street passages.
  for(const [sx,facing] of [[-174,1],[-69,-1]]){
    for(let i=0;i<9;i++){
      const zz=-28+(i+.5)*60/9;
      const xx=sx+facing*.4;
      b(sx,0,zz,1.3,14.5,6.3,2,i%3===0?warm:ivory);
      // dark recessed arch, brighter voussoir ring, column and shop shutter
      b(xx,0,zz, .22,4.35,3.6,8,glass);
      b(xx+facing*.12,0,zz-2.65,.75,5.25,.54,5,marble);
      archZ(sx,zz,xx+facing*.11,5.1,6);
      b(xx+facing*.12,6.15,zz,1.0,.42,6.1,5,marble);
      b(xx+facing*.12,9.0,zz,.25,3.3,1.6,8,slate);
      b(xx+facing*.24,8.1,zz,.47,.23,2.4,5,ivory);
      b(xx+facing*.34,7.9,zz,.15,1.18,2.7,7,metal);
      for(let bal of [-.9,0,.9])b(xx+facing*.45,8.02,zz+bal,.22,.95,.075,7,metal);
      b(xx+facing*.21,13.35,zz,1.35,.42,6.2,5,ivory);
    }
  }
  // Gran Guardia: southern loggia and approach steps, deliberately schematic.
  b(-166,0,16,8,10,22,2,marble);
  for(let z of [8.0,14.0,20.0]){
    b(-161.4,0,z,1.0,6.0,.95,5,ivory);
    archZ(-166,z,-161,5.2);
  }
  for(let i=0;i<4;i++)b(-158.3+i*1.0,.0,-1.3,1.2,.11*(i+1),9.0,5,marble);
  // Slab joints and a deliberate drainage direction; no objects in the middle of traversal routes.
  for(let i=0;i<16;i++){
    const z=-35+i*4.42;
    ground(mesh,-121,z,86,.09,1,[.68,.65,.57],.062);
  }
  for(let i=0;i<14;i++){
    const x=-165+i*6.6;
    ground(mesh,x,0,.075,67,1,[.68,.65,.57],.064);
  }
  // Colonna Marciana, flag staff and period street lamps (recognizable civic elements).
  const lx=-151,lz=-25;
  b(lx,0,lz,3.8,.75,3.8,5,marble);
  b(lx,.75,lz,2.9,.45,2.9,5,ivory);
  col(lx,1.2,lz,.67,10.5,12,5,marble);
  b(lx,11.8,lz,2.1,.6,2.2,5,ivory);
  b(lx,12.45,lz,1.4,.52,.8,5,gold);
  b(lx,13.0,lz,.68,.65,1.23,5,gold);
  col(-101,0,-20,.16,9,10,7,metal);
  b(-101,8.7,-20,1.24,.2,.24,7,metal);
  for(const pos of [[-160,-20],[-86,16]]){
    col(pos[0],0,pos[1],.16,6.5,7,7,metal);
    b(pos[0],6.55,pos[1],.87,1.1,.65,8,ivory);
    b(pos[0],7.5,pos[1],1.15,.3,.84,7,metal);
  }
  // Post-collapse details retain spatial logic: triage under portico; blocked shop, not random ammunition.
  for(const [x,z] of [[-162,-7],[-162,2],[-85,-18]]){
    b(x,0,z,3.3,.43,1.45,6,warm);
    b(x,.5,z,2.9,.12,1.25,6,ivory);
    for(const d of [-1.0,1.0])b(x+d,.15,z,.2,.55,.22,7,metal);
  }
  for(let i=0;i<5;i++){
    const x=-161+i*.47,z=14;
    b(x,0,z,1.0,.27,.58,11,i%2?marble:warm);
  }
}
window.COP_LANDMARKS={build,version:'0.7',landmarks:['Torre dell’Orologio','Palazzo del Capitanio','Chiesa di San Clemente','Loggia della Gran Guardia','Colonna Marciana']};
})();