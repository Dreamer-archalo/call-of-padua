/* CALL OF PADUA — Living City 0.8.
 * Lightweight hand-authored geometry and contextual props; no borrowed 3D assets.
 * Locations correspond to the playable level's approximate blockout, not a survey.
 */
(() => {
  'use strict';
  const PI=Math.PI, TAU=2*PI;
  const plaster=[.81,.76,.65],stone=[.77,.75,.67],marble=[.88,.85,.76],
    iron=[.22,.24,.23],wood=[.43,.32,.25],moss=[.39,.49,.35],
    canvas=[.67,.62,.49],rust=[.56,.37,.28],dark=[.30,.32,.29],
    brick=[.64,.48,.39],lamp=[.78,.70,.52];
  function build({mesh,quad,box,cylinder,ground}){
    const q=(a,b,c,d,color=stone,t=5)=>quad(mesh,a,b,c,d,[0,1,0],t,color,.23);
    const b=(x,y,z,w,h,d,color=stone,t=5)=>box(mesh,x,y,z,w,h,d,t,color);
    const cyl=(x,y,z,r,h,color=stone,seg=12,t=5)=>cylinder(mesh,x,y,z,r,h,seg,t,color);
    const tube=(a,end,r,color=iron,sides=8)=>{
      const dx=end[0]-a[0],dy=end[1]-a[1],dz=end[2]-a[2],len=Math.hypot(dx,dy,dz)||1;
      let ux=dx/len,uy=dy/len,uz=dz/len;
      const guide=Math.abs(uy)<.85?[0,1,0]:[1,0,0];
      let vx=uy*guide[2]-uz*guide[1],vy=uz*guide[0]-ux*guide[2],vz=ux*guide[1]-uy*guide[0];
      const vl=Math.hypot(vx,vy,vz)||1;vx/=vl;vy/=vl;vz/=vl;
      const wx=uy*vz-uz*vy,wy=uz*vx-ux*vz,wz=ux*vy-uy*vx;
      const pt=(p,theta)=>[p[0]+r*(vx*Math.cos(theta)+wx*Math.sin(theta)),p[1]+r*(vy*Math.cos(theta)+wy*Math.sin(theta)),p[2]+r*(vz*Math.cos(theta)+wz*Math.sin(theta))];
      for(let i=0;i<sides;i++){
        const phi=i*TAU/sides,next=(i+1)*TAU/sides;
        q(pt(a,phi),pt(a,next),pt(end,next),pt(end,phi),color,7);
      }
    };
    const dome=(x,y,z,rx,ry,rz,color=stone,segments=14,rings=5)=>{
      const pt=(theta,phi)=>[x+rx*Math.sin(theta)*Math.cos(phi),y+ry*Math.cos(theta),z+rz*Math.sin(theta)*Math.sin(phi)];
      for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){
        const a=j*PI/(2*rings),c=(j+1)*PI/(2*rings),p=i*TAU/segments,n=(i+1)*TAU/segments;
        q(pt(a,p),pt(a,n),pt(c,n),pt(c,p),color,5);
      }
    };
    const ringXY=(x,y,z,r,color=iron,seg=16)=>{
      // Flat double-sided bicycle rim: 32 triangles instead of a heavy tubular mesh.
      for(let i=0;i<seg;i++){
        const t=i*TAU/seg,v=(i+1)*TAU/seg;
        const pt=(a,rr)=>[x+Math.cos(a)*rr,y+Math.sin(a)*rr,z];
        q(pt(t,r-.055),pt(v,r-.055),pt(v,r+.055),pt(t,r+.055),color,7);
      }
    };
    function archedWindow(x,z,y,width=1.5,height=2.4){
      // Readable dark glazed window with a genuine curved stone voussoir frame.
      const base=y+height*.59,span=width*.5;
      b(x,y,z,width,height*.66,.10,dark,8);
      for(let i=0;i<10;i++){
        const a=PI-i*PI/10,d=PI-(i+1)*PI/10;
        const p=t=>[x+Math.cos(t)*span,base+Math.sin(t)*span,z];
        const o=t=>[x+Math.cos(t)*(span+.18),base+Math.sin(t)*(span+.18),z+.016];
        q(p(a),p(d),o(d),o(a),marble);
      }
      b(x,y-.21,z+.08,width+.36,.13,.22,marble);
    }
    function lampPost(x,z,broken=false){
      cyl(x,0,z,.23,.36,iron,14,7);
      cyl(x,.38,z,.13,4.3,iron,12,7);
      for(const h of [.7,2.7,4.2])cyl(x,h,z,.19,.10,iron,12,7);
      tube([x,4.64,z],[x+.65,4.82,z],.075,iron,8);
      if(!broken){
        dome(x+.65,4.48,z,.38,.32,.38,lamp,14,4);
        dome(x+.65,4.86,z,.43,.22,.43,iron,14,4);
      }else tube([x+.65,4.82,z],[x+.92,4.33,z+.13],.06,iron,7);
    }
    function planter(x,z){
      cyl(x,.04,z,.67,.58,marble,14);
      cyl(x,.62,z,.57,.08,dark,14);
      tube([x,.72,z],[x+.08,1.65,z],.12,wood);
      for(let n=0;n<5;n++){
        const a=n*TAU/5;
        dome(x+Math.sin(a)*.28,1.5+(n%2)*.25,z+Math.cos(a)*.28,.57,.75,.55,moss,10,4);
      }
    }
    function bicycle(x,z){
      // Two functional-scale circular wheels and triangular frame, leaned against a shop.
      ringXY(x-1.12,.54,z,.51,iron,16);ringXY(x+1.12,.54,z,.51,iron,16);
      tube([x-1.12,.54,z],[x-.26,1.23,z],.045,rust);
      tube([x-.26,1.23,z],[x+.16,.57,z],.05,rust);
      tube([x+.16,.57,z],[x-1.12,.54,z],.042,rust);
      tube([x-.26,1.23,z],[x+.63,1.25,z],.048,rust);
      tube([x+.63,1.25,z],[x+1.12,.54,z],.055,rust);
      tube([x-.26,1.24,z],[x-.29,1.44,z],.045,iron);
      tube([x-.49,1.45,z],[x-.08,1.45,z],.065,iron);
      tube([x+.61,1.25,z],[x+.75,1.49,z],.054,iron);
      tube([x+.50,1.52,z],[x+1.00,1.52,z],.05,iron);
    }
    function clothStall(x,z){
      for(const dx of [-2,2])for(const dz of [-1.5,1.5]){
        tube([x+dx,0,z+dz],[x+dx,2.57,z+dz],.07,wood);
      }
      // Sagging awning broken into curved segments, not a flat solid roof.
      const divs=8;
      for(let i=0;i<divs;i++){
        const u=-2+i*4/divs,v=-2+(i+1)*4/divs;
        const level=t=>2.82-.32*(1-(t/2)**2);
        q([x+u,level(u),z-1.7],[x+v,level(v),z-1.7],
          [x+v,level(v)-.11,z+1.7],[x+u,level(u)-.11,z+1.7],i%2?canvas:plaster,12);
      }
      b(x,.70,z,3.25,.16,1.0,wood);
      for(let j=0;j<4;j++)b(x-1.2+j*.78,.91,z,.42,.19,.42,j%2?rust:canvas,12);
    }
    function coiledWire(x,z,len=8){
      for(let i=0;i<8;i++){
        const a=i*TAU/8,d=(i+1)*TAU/8;
        tube([x+i*len/8,2.9+Math.cos(a)*.35,z+Math.sin(a)*.35],
          [x+(i+1)*len/8,2.9+Math.cos(d)*.35,z+Math.sin(d)*.35],.035,iron,5);
      }
    }
    function flag(x,z){
      tube([x,0,z],[x,5.3,z],.10,iron,8);
      for(let j=0;j<5;j++){
        const xa=x+Math.sin(j*.62)*.1,xb=x+Math.sin((j+1)*.62)*.1;
        q([xa,4.9-j*.12,z],[xb,4.9-(j+1)*.12,z],
          [xb+1,4.55-(j+1)*.12,z+.09],[xa+1,4.55-j*.12,z+.07],rust,12);
      }
    }
    // Piazza dei Signori: correctly oriented toward the tower and civic buildings.
    for(const [x,z] of [[-156,-24],[-103,-24],[-154,25],[-80,21]])lampPost(x,z);
    for(const [x,z] of [[-152,8],[-92,17]])planter(x,z);
    bicycle(-138,30);bicycle(-87,28);
    clothStall(-145,13);flag(-101,-15);
    for(let i=0;i<6;i++)archedWindow(-151+i*9,-42.26,9.7,1.65,2.3);
    // Piazza delle Erbe: deserted market furniture, framed under existing porticoes.
    for(const [x,z] of [[-32,77],[-8,77],[22,77]])clothStall(x,z);
    bicycle(-49,95);lampPost(46,87,true);coiledWire(-25,69);
    // Piazza della Frutta: supply point and collapsed awnings, fewer details in combat lane.
    clothStall(-29,-77);clothStall(18,-80);planter(50,-80);bicycle(-47,-85);
    // Duomo, safe refuge: medical supplies, controlled lighting and personal belongings.
    for(const [x,z] of [[-191,109],[-149,122]])lampPost(x,z);
    b(-185,.04,113,3,.4,1.2,wood);b(-185,.48,113,2,.5,1.0,canvas,12);
    for(let i=0;i<3;i++)cyl(-186+i*.55,.93,113,.12,.35,marble,12);
    // Pedrocchi: ironwork, former café seating and recognizable civilian traces.
    for(const [x,z] of [[154,-55],[186,-54]])lampPost(x,z);
    for(const [x,z] of [[153,-24],[188,-24]]){
      cyl(x,.0,z,.20,1.1,iron,12,7);cyl(x,1.08,z,1.14,.08,wood,16,6);
      for(let i=0;i<3;i++){const a=i*TAU/3;tube([x+.70*Math.cos(a),0,z+.70*Math.sin(a)],
         [x+.70*Math.cos(a),1.02,z+.70*Math.sin(a)],.055,iron);}
    }
    // Santo: stone planters and protected triage, keep the basilica approach open.
    for(const [x,z] of [[82,167],[194,172]])planter(x,z);
    lampPost(90,189,true);flag(172,160);
  }
  window.COP_LIVING={build,version:'0.8',zones:6};
})();
