/* CALL OF PADUA — Sector 01. Dependency-free canvas 3D prototype.
 * Original geometry and gameplay; city blockout is illustrative, not a surveyed map.
 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const canvas = $('world'), ctx = canvas.getContext('2d', { alpha:false, desynchronized:true });
  const mapCanvas = $('minimap'), mctx = mapCanvas.getContext('2d');
  const touchDevice = matchMedia('(pointer:coarse)').matches;
  const TAU = Math.PI*2, clamp = (v,a,b) => Math.max(a,Math.min(b,v));
  const rand = (a,b) => a+(b-a)*Math.random();
  const hypot = Math.hypot;
  const state = {mode:'menu',p:{x:0,z:67,y:1.7,vy:0,yaw:Math.PI,pitch:-.045,health:100},camera:'fps',input:'TASTIERA + MOUSE',kills:0,phase:0,weapon:0,ammo:[30,15],reserve:[180,90],grenades:2,lastShot:0,reloading:0,reloadUntil:0,run:false,aim:false,recoil:0,hurt:0,hit:0,muzzle:0,noticeUntil:0,gamepadId:null,dead:false,sensitivity:1.4,time:0,fps:60};
  const weapons=[{name:'CARABINA MK18',mag:30,damage:36,delay:.12,reload:1.6},{name:'PISTOLA M9',mag:15,damage:53,delay:.27,reload:1.1}];
  let W=0,H=0,dpr=1,near=.08,lastFrame=0,frames=0,fpsClock=0,mapTick=0;
  let polygons=[], collision=[], enemies=[], particles=[], props=[];
  const keys=new Set(), pointer={dx:0,dy:0,down:false}, touches={move:{id:null,x:0,y:0},look:{id:null,x:0,y:0}}, padPrevious=[];
  const palette={wall:'#b4a294',wall2:'#90887c',wall3:'#7e8985',roof:'#5d5b56',road:'#454e4e',stone:'#747c77',dark:'#283436',arch:'#3c3b37',glass:'#343f40',gold:'#d7a86a'};
  const v = (x,y,z)=>[x,y,z];
  function addFace(pts, fill, detail=false){
    const mx=pts.reduce((s,p)=>s+p[0],0)/pts.length, mz=pts.reduce((s,p)=>s+p[2],0)/pts.length;
    polygons.push({pts,fill,mx,mz,detail});
  }
  function ground(x,z,sx,sz,color){const X=x-sx/2,Z=z-sz/2;addFace([v(X,.004,Z),v(X+sx,.004,Z),v(X+sx,.004,Z+sz),v(X,.004,Z+sz)],color);}
  function wallBox(x,z,sx,sz,h,cols,coll=true){
    const x0=x-sx/2,x1=x+sx/2,z0=z-sz/2,z1=z+sz/2;
    addFace([v(x0,0,z1),v(x1,0,z1),v(x1,h,z1),v(x0,h,z1)],cols[0]);
    addFace([v(x1,0,z0),v(x0,0,z0),v(x0,h,z0),v(x1,h,z0)],cols[1]||cols[0]);
    addFace([v(x0,0,z0),v(x0,0,z1),v(x0,h,z1),v(x0,h,z0)],cols[2]||cols[0]);
    addFace([v(x1,0,z1),v(x1,0,z0),v(x1,h,z0),v(x1,h,z1)],cols[3]||cols[0]);
    addFace([v(x0,h,z0),v(x0,h,z1),v(x1,h,z1),v(x1,h,z0)],cols[4]||'#63594f');
    if(coll) collision.push({x,z,w:sx+0.7,d:sz+0.7});
  }
  function windowRow(x,z,sx,sz,h,stories,seed=0){
    for(let side=0;side<4;side++){
      const count=Math.max(1,Math.floor((side<2?sx:sz)/7));
      for(let j=0;j<count;j++) for(let k=0;k<stories;k++){
        if((j+seed+k*3)%11===0)continue;
        let w=1.45,hh=2.3,Y=3.8+k*3.35, p, dx=1.2;
        if(Y+hh/2>h-1)continue;
        if(side===0){const X=x-sx/2+(j+.5)*sx/count, Z=z+sz/2+.06; p=[v(X-w/2,Y-hh/2,Z),v(X+w/2,Y-hh/2,Z),v(X+w/2,Y+hh/2,Z),v(X-w/2,Y+hh/2,Z)];}
        else if(side===1){const X=x-sx/2+(j+.5)*sx/count, Z=z-sz/2-.06;p=[v(X+w/2,Y-hh/2,Z),v(X-w/2,Y-hh/2,Z),v(X-w/2,Y+hh/2,Z),v(X+w/2,Y+hh/2,Z)];}
        else if(side===2){const X=x-sx/2-.06,Z=z-sz/2+(j+.5)*sz/count;p=[v(X,Y-hh/2,Z+w/2),v(X,Y-hh/2,Z-w/2),v(X,Y+hh/2,Z-w/2),v(X,Y+hh/2,Z+w/2)];}
        else {const X=x+sx/2+.06,Z=z-sz/2+(j+.5)*sz/count;p=[v(X,Y-hh/2,Z-w/2),v(X,Y-hh/2,Z+w/2),v(X,Y+hh/2,Z+w/2),v(X,Y+hh/2,Z-w/2)];}
        addFace(p,(j+k+seed)%8===0?'#544f43':'#303a3b',true);
      }
    }
  }
  function oldBuilding(x,z,w,d,h,seed){
    const tones=[['#c2ae91','#ac937b','#937f6e','#e0c29f','#5e5d58'],['#b8aaa0','#a89989','#9d8b80','#d1c2ad','#555a5b'],['#c1b7a4','#a59f91','#817c71','#d7ceba','#57514b'],['#bd9881','#aa836e','#937562','#d1b6a0','#504e49']];
    wallBox(x,z,w,d,h,tones[seed%tones.length]);windowRow(x,z,w,d,h,Math.floor((h-2)/3.3),seed);
    for(let j=0;j<Math.floor(w/9);j++){
      const X=x-w/2+(j+.5)*9;
      if((j+seed)%4===0) addFace([v(X-2,0,z+d/2+.07),v(X+2,0,z+d/2+.07),v(X+2,3.3,z+d/2+.07),v(X-2,3.3,z+d/2+.07)],'#292d2b',true);
    }
  }
  function tower(x,z,r,h,seed){wallBox(x,z,r,r,h,['#b2a48f','#988978','#91806d','#afa28e','#6f6758']);windowRow(x,z,r,r,h,Math.floor(h/6),seed);ground(x,z,r+4,r+4,'#656a60');
    for(let s=-1;s<=1;s+=2){addFace([v(x-r/2, h,z+s*r/2),v(x+r/2,h,z+s*r/2),v(x,h+4,z)],'#534a45');}}
  function pillar(x,z,h=7,width=.85){wallBox(x,z,width,width,h,['#b4a388','#a19078','#938373','#b1a18a','#bba990'],false)}
  function scene(){
    polygons=[]; collision=[]; props=[];
    ground(0,0,500,500,'#5f6867');
    // Color-block paved landmarks: geographic arrangement is an illustrative starting blockout.
    ground(0,43,113,74,'#898678'); // Piazza delle Erbe, south of Palazzo
    ground(0,-49,113,51,'#858379'); // Piazza della Frutta, north
    ground(-86,-10,70,72,'#87847a'); // Piazza dei Signori to west
    ground(86,39,58,145,'#626c68');
    ground(-15,118,18,130,'#666c67');
    for(let i=-6;i<=6;i++){ ground(i*8.4,43,.11,74,'#807e74');ground(i*8.4,-49,.11,50,'#77786f');}
    for(let j=0;j<12;j++)ground(0,10+j*7.1,112,.12,'#7b7a70');
    for(let j=0;j<7;j++)ground(-86,-46+j*11.5,69,.12,'#73776e');
    // Palazzo della Ragione: signature long mass, pitched roof, lower loggias.
    wallBox(0,-7,79,29,17,['#beaf93','#aa967e','#9f927e','#c5b699','#716c60']);
    for(let side of [-1,1]) {
      for(let i=0;i<13;i++){
        const xx=-36.8+i*6.15, zz=-7+side*14.58;
        addFace([v(xx-2.1,1.2,zz+side*.1),v(xx+2.1,1.2,zz+side*.1),v(xx+2.1,6.7,zz+side*.1),v(xx-2.1,6.7,zz+side*.1)],'#494744',true);
        pillar(xx-2.65,zz+side*.5,7, .9);
        addFace([v(xx-3.1,7,zz+side*.5),v(xx+3.1,7,zz+side*.5),v(xx+3.1,8.4,zz+side*.5),v(xx-3.1,8.4,zz+side*.5)],'#d0b897');
        if(i%2===0)addFace([v(xx-1,11.4,zz+side*.15),v(xx+1,11.4,zz+side*.15),v(xx+1,14.4,zz+side*.15),v(xx-1,14.4,zz+side*.15)],'#333b38',true);
      }
    }
    for(let side of [-1,1])addFace([v(-41,17,-7+side*15),v(41,17,-7+side*15),v(41,23,-7),v(-41,23,-7)],side>0?'#6e6660':'#62615d');
    // Nearby row houses, leaving traversable square and side alleys.
    let seed=10;
    for(let i=0;i<6;i++){
      const x=-106+i*19.1;
      if(x>-49)continue;
      oldBuilding(x,42,18,48,rand(16,24),seed++);
    }
    for(let i=0;i<7;i++){
      const x=54+i*18.6;
      oldBuilding(x,41,17.3,57,16+(i%4)*3,seed++);
    }
    for(let i=0;i<9;i++){
      const x=-107+i*25;
      if(Math.abs(x)<20)continue;
      oldBuilding(x,-103,23,38,17+(i%4)*3,seed++);
    }
    for(let i=0;i<7;i++){
      const x=-113+i*25;
      if(Math.abs(x)<15)continue;
      oldBuilding(x,114,22,36,14+(i%4)*3,seed++);
    }
    oldBuilding(-81,-57,34,22,19,4);oldBuilding(-105,-58,26,22,23,3);
    oldBuilding(81,-50,39,20,20,7);oldBuilding(109,-52,19,20,24,5);
    tower(-116,-9,16,39,3); // Piazza dei Signori bell tower marker
    tower(127,107,14,32,4);
    // Arcades, clock sign, shuttered stalls and central well.
    for(let z of [82,-75])for(let x=-43;x<44;x+=12){
      if(z===82 && Math.abs(x)<14)continue;
      pillar(x,z,5,1.1);
      addFace([v(x-5,5,z),v(x+5,5,z),v(x+5,6,z),v(x-5,6,z)],'#9d917f');
    }
    wallBox(-22,44,3,3,1.4,['#c1b29a','#897d71','#9e8b78','#a99b82','#998d7c'],true);
    // The military wreck and roadblocks provide cover (not yet drivable).
    wreck(-28,69,0);wreck(28,83,Math.PI/2);wreck(35,8,0);
    for(let i=0;i<5;i++){
      let bx=-30+i*14,bz=23+(i%2)*7;
      wallBox(bx,bz,3.9,1.3,1.5,['#87836e','#6c6c5b','#6b6b59','#929079','#847a65']);
      addFace([v(bx-2,1.55,bz),v(bx+2,1.55,bz),v(bx+1.7,2.15,bz),v(bx-1.7,2.15,bz)],'#9d957b');
    }
    for(let i=0;i<5;i++){
      let bx=68+i*8,bz=-30+i*8;
      wallBox(bx,bz,3,1.5,1.3,['#716c55','#5d5a4e','#67644f','#78745c']);
    }
    // Draw simple metal fences and ruined signage.
    for(let i=0;i<6;i++){
      const x=-24+i*9;
      addFace([v(x,0,89),v(x+7,0,89),v(x+7,2,89),v(x,2,89)],'rgba(65,70,67,.75)');
      for(let j=0;j<4;j++)addFace([v(x+j*2,0,89.03),v(x+j*2+.14,0,89.03),v(x+j*2+.14,2.4,89.03),v(x+j*2,2.4,89.03)],'#a5a59a',true);
    }
    // Faded grass beds on side streets and soft warm lamps.
    for(let i=0;i<23;i++){
      const x=rand(-130,135),z=rand(-140,145);
      if(Math.abs(x)<51&&Math.abs(z)<87)continue;
      if(Math.random()<.4)ground(x,z,rand(2,6),rand(2,7),'#68715e');
    }
    for(const [x,z] of [[-46,73],[47,72],[-43,-56],[42,-56],[-113,35],[118,66]]){
      addFace([v(x,0,z),v(x+.25,0,z),v(x+.25,8,z),v(x,8,z)],'#434949');
      addFace([v(x-.75,8,z),v(x+.75,8,z),v(x+.75,8.4,z),v(x-.75,8.4,z)],'#d5b47c');
    }
  }
  function wreck(x,z,angle){ // low-poly abandoned armored truck
    wallBox(x,z,8.8,4.6,2.7,['#515b55','#434b46','#3e4842','#545c4f','#444743']);
    wallBox(x-2,z,2.5,4.1,3.5,['#565e56','#464b46','#414c45','#65695e','#666960'],false);
    for(let dx of [-3,3])for(let dz of [-2.3,2.3]){
      wallBox(x+dx,z+dz,.85,.75,1.2,['#262e2b','#252e2e','#303333'],false);
    }
    props.push({x,z,type:'wreck'});
  }
  function spawnEnemy(x,z){enemies.push({x,z,hp:100,alive:true,respawn:0,nextShot:rand(1,3),stride:rand(0,6),angle:rand(0,TAU),hurt:0});}
  function reset(){state.p={x:0,z:67,y:1.7,vy:0,yaw:Math.PI,pitch:-.045,health:100};state.kills=0;state.phase=0;state.weapon=0;state.ammo=[30,15];state.reserve=[180,90];state.grenades=2;state.lastShot=0;state.reloading=0;state.recoil=0;state.hurt=0;state.dead=false;state.aim=false;state.camera='fps';state.time=0;enemies=[];particles=[];spawnEnemy(-21,36);spawnEnemy(17,23);spawnEnemy(13,53);spawnEnemy(-27,-48);$('missionTitle').textContent='Metti in sicurezza Piazza delle Erbe';$('missionMeta').textContent='Elimina i predoni · 0 / 5';$('missionBar').style.width='0%';$('resultMenu').classList.add('hidden');$('pauseMenu').classList.add('hidden');}
  function resize(){W=innerWidth;H=innerHeight;dpr=Math.min(devicePixelRatio||1,touchDevice?1.15:1.5);canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
  function viewCamera(){const p=state.p, f=state.camera==='third', forwardX=Math.sin(p.yaw),forwardZ=Math.cos(p.yaw);
    return {x:p.x-(f?forwardX*4.6:0),z:p.z-(f?forwardZ*4.6:0),y:p.y+(f?1.65:0),yaw:p.yaw,pitch:p.pitch+(f?-.07:0),focal:(H*.5)/Math.tan((state.aim?57:79)*Math.PI/360)};}
  function transformed(pt,c){const dx=pt[0]-c.x,dy=pt[1]-c.y,dz=pt[2]-c.z,cy=Math.cos(c.yaw),sy=Math.sin(c.yaw),cp=Math.cos(c.pitch),sp=Math.sin(c.pitch), xx=dx*cy-dz*sy,z0=dx*sy+dz*cy;return [xx,dy*cp-z0*sp,dy*sp+z0*cp]}
  function clipNear(pts){let out=[];for(let i=0;i<pts.length;i++){let a=pts[i],b=pts[(i+1)%pts.length],ain=a[2]>near,bin=b[2]>near;
    if(ain)out.push(a);
    if(ain!==bin){let t=(near-a[2])/(b[2]-a[2]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,near]);}}
    return out;}
  function projected(pt,c){const t=transformed(pt,c);if(t[2]<near)return null;return [W/2+t[0]*c.focal/t[2],H/2-t[1]*c.focal/t[2],t[2]]}
  function drawWorld(c){
    const horizon=H/2+Math.tan(c.pitch)*c.focal;
    const sky=ctx.createLinearGradient(0,0,0,Math.max(H,horizon+80));sky.addColorStop(0,'#425b66');sky.addColorStop(.4,'#9b9790');sky.addColorStop(.65,'#d2ad82');sky.addColorStop(1,'#4b5e5a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Smog skyline with distant fragments / minimal draw over ground horizon.
    ctx.fillStyle='rgba(37,47,47,.28)';for(let i=0;i<25;i++){let sx=(i*97+Math.sin(c.yaw+i)*53+W)%W,yy=horizon-18-i%4*4;ctx.fillRect(sx,yy,25+i%3*19,40+i%5*15)}
    const visible=[];const maxDist=touchDevice?117:155,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);
    for(const poly of polygons){const dx=poly.mx-c.x,dz=poly.mz-c.z,d2=dx*dx+dz*dz;
      if(d2>maxDist*maxDist||dx*fx+dz*fz < -17||poly.detail&&d2>(touchDevice?86:125)**2)continue;
      const pts=clipNear(poly.pts.map(pt=>transformed(pt,c)));if(pts.length<3)continue;
      let sp=[],bad=false, minX=1e8,minY=1e8,maxX=-1e8,maxY=-1e8,depth=0;
      for(const t of pts){const X=clamp(W/2+t[0]*c.focal/t[2],-W*12,W*12),Y=clamp(H/2-t[1]*c.focal/t[2],-H*12,H*12);minX=Math.min(minX,X);maxX=Math.max(maxX,X);minY=Math.min(minY,Y);maxY=Math.max(maxY,Y);sp.push([X,Y]);depth+=t[2];}
      if(maxX<0||minX>W||maxY<0||minY>H)continue;
      visible.push({pts:sp,color:poly.fill,depth:depth/pts.length});
    }
    // Human enemies as low-poly billboards sorted into the same painter pass.
    for(const e of enemies){if(!e.alive)continue;const dx=e.x-c.x,dz=e.z-c.z,dist=hypot(dx,dz);if(dist>maxDist||dx*fx+dz*fz < -.5)continue;
      const a= Math.atan2(c.z-e.z,c.x-e.x),rx=Math.cos(a+Math.PI/2),rz=Math.sin(a+Math.PI/2);
      const fig=(x0,y0,x1,y1,color,depthAdj=0)=>{
        const xx=e.x, zz=e.z, quad=[v(xx+rx*x0,y0,zz+rz*x0),v(xx+rx*x1,y0,zz+rz*x1),v(xx+rx*x1,y1,zz+rz*x1),v(xx+rx*x0,y1,zz+rz*x0)];
        const pts=clipNear(quad.map(t=>transformed(t,c)));if(pts.length<3)return;
        const sp=pts.map(t=>[W/2+t[0]*c.focal/t[2],H/2-t[1]*c.focal/t[2]]);
        visible.push({pts:sp,color,depth:dist+depthAdj});
      };
      fig(-.62,.6,.62,1.55,e.hurt>0?'#b66d56':'#52625c');fig(-.37,1.55,.37,2.05,'#7c7565');fig(-.5,1.94,.5,2.2,'#303b39');fig(-.52,0,-.1,.65,'#303d3c');fig(.1,0,.52,.65,'#303d3c');fig(-.82,.77,-.58,1.43,'#4d544c');fig(.58,.77,.82,1.43,'#4d544c');fig(-.24,1.04,.8,1.2,'#292b29',-.2);
    }
    // Third-person player representation.
    if(state.camera==='third'){
      const p=state.p,rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
      const drawPart=(x0,y0,x1,y1,color)=>{
        const q=[v(p.x+rx*x0,y0,p.z+rz*x0),v(p.x+rx*x1,y0,p.z+rz*x1),v(p.x+rx*x1,y1,p.z+rz*x1),v(p.x+rx*x0,y1,p.z+rz*x0)];
        let sp=q.map(pt=>projected(pt,c));if(sp.some(t=>!t))return;visible.push({pts:sp.map(t=>t.slice(0,2)),color,depth:4.6});};
      drawPart(-.5,.72,.5,1.65,'#374943');drawPart(-.35,1.65,.35,2.05,'#a39576');drawPart(-.48,1.96,.48,2.16,'#323f38');drawPart(-.5,0,-.08,.7,'#323832');drawPart(.08,0,.5,.7,'#323832');drawPart(.5,.9,1,1.12,'#202a2b');
    }
    visible.sort((a,b)=>b.depth-a.depth);
    for(let o of visible){ctx.globalAlpha= o.depth>115?clamp(1-(o.depth-115)/70,.25,1):1;ctx.fillStyle=o.color;ctx.beginPath();ctx.moveTo(o.pts[0][0],o.pts[0][1]);for(let i=1;i<o.pts.length;i++)ctx.lineTo(o.pts[i][0],o.pts[i][1]);ctx.closePath();ctx.fill();}
    ctx.globalAlpha=1;
    // Atmosphere: horizon haze, sparks, waypoints, dark corners.
    const haze=ctx.createLinearGradient(0,horizon-140,0,horizon+H*.4);haze.addColorStop(0,'rgba(158,147,128,0)');haze.addColorStop(.5,'rgba(181,165,144,.09)');haze.addColorStop(1,'rgba(55,57,52,0)');ctx.fillStyle=haze;ctx.fillRect(0,Math.max(0,horizon-140),W,H);
    if(state.phase===1){const t=projected(v(-40,2.5,73),c);if(t)beacon(t[0],t[1],t[2]);}
    if(state.phase===0){for(const e of enemies){if(!e.alive)continue;const t=projected(v(e.x,2.7,e.z),c);if(t&&t[2]<65)enemyMarker(t,e);}}
    if(state.camera==='fps')drawWeapon();
    for(const fx of particles){const t=projected(v(fx.x,fx.y,fx.z),c);if(!t)continue;ctx.globalAlpha=clamp(fx.life,0,1);ctx.fillStyle=fx.type==='blood'?'#d36a5e':'#e7c48b';ctx.fillRect(t[0],t[1],Math.max(2,8/t[2]*10),Math.max(2,8/t[2]*10));}ctx.globalAlpha=1;
  }
  function beacon(x,y,d){const r=Math.max(13,350/d);ctx.strokeStyle='#92e3d0';ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(x,y,r,r*.35,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-r*1.5);ctx.lineTo(x,y+r*.2);ctx.stroke();ctx.fillStyle='#c7ffee';ctx.textAlign='center';ctx.font='bold 13px monospace';ctx.fillText('ESTRAZIONE',x,y-r*1.9);ctx.textAlign='left';ctx.globalAlpha=1}
  function enemyMarker(t,e){let r=Math.max(8,110/t[2]);ctx.fillStyle='#ee6e57';ctx.beginPath();ctx.moveTo(t[0],t[1]-7);ctx.lineTo(t[0]-4,t[1]-13);ctx.lineTo(t[0]+4,t[1]-13);ctx.closePath();ctx.fill();if(e.hurt>0){ctx.fillStyle='#1a2020';ctx.fillRect(t[0]-12,t[1]-20,24,3);ctx.fillStyle='#e36c5b';ctx.fillRect(t[0]-12,t[1]-20,24*e.hp/100,3);}}
  function drawWeapon(){
    const w=W,h=H,s=Math.min(W/1200,H/800)*1.25;
    const recoil=state.recoil*22*s,baseX=w*.65,baseY=h-90*s+recoil;
    ctx.save();ctx.translate(baseX,baseY);ctx.scale(s,s);ctx.rotate(-.045-state.recoil*.045);
    // Angular silhouettes: hands, matte receiver, rail, sight, barrel.
    const poly=(pts,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fill();};
    poly([[-22,-8],[53,-47],[179,-22],[178,55],[-8,92]],'#282c2b');
    poly([[28,10],[173,-39],[319,-35],[324,-15],[145,29]],'#131a1b');
    poly([[170,-43],[337,-46],[343,-37],[178,-29]],'#4b5552');
    poly([[192,-48],[335,-50],[338,-45],[195,-42]],'#1e2929');
    poly([[50,-5],[140,-35],[176,-23],[88,14]],'#65716a');
    poly([[104,2],[158,8],[122,107],[95,110]],'#181f20');
    poly([[16,18],[103,-1],[82,34],[14,67]],'#827c69');
    poly([[35,64],[97,32],[98,107],[33,128]],'#575847');
    poly([[96,26],[122,35],[124,72],[96,62]],'#151f21');
    poly([[205,-50],[239,-60],[260,-53],[254,-44]],'#15191b');
    poly([[216,-64],[242,-65],[242,-58],[216,-58]],'#47524d');
    ctx.strokeStyle='#8d9688';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(167,-30);ctx.lineTo(287,-37);ctx.stroke();ctx.restore();
    if(state.muzzle>0){ctx.globalAlpha=clamp(state.muzzle/.075,0,1);ctx.fillStyle='#ffcf72';ctx.beginPath();ctx.arc(baseX+330*s,baseY-46*s,23*s,0,TAU);ctx.fill();ctx.globalAlpha=1;}
  }
  function collide(x,z,rad=.7){if(Math.abs(x)>245||Math.abs(z)>245)return true;for(const b of collision){if(Math.abs(x-b.x)<b.w/2+rad&&Math.abs(z-b.z)<b.d/2+rad)return true;}return false;}
  function updateMove(dt,mx,mz,sprint,jump){const p=state.p, mag=Math.hypot(mx,mz);if(mag>1){mx/=mag;mz/=mag;}let speed=sprint?10:6.3;if(keys.has('ControlLeft')||keys.has('KeyC'))speed*=.56;
    const rightX=Math.cos(p.yaw),rightZ=-Math.sin(p.yaw),fwdX=Math.sin(p.yaw),fwdZ=Math.cos(p.yaw);
    const dx=(mx*rightX-mz*fwdX)*speed*dt,dz=(mx*rightZ-mz*fwdZ)*speed*dt;
    if(!collide(p.x+dx,p.z,.62))p.x+=dx;
    if(!collide(p.x,p.z+dz,.62))p.z+=dz;
    if(jump&&p.y<=1.701)p.vy=6.1;
    p.vy-=16*dt;p.y=Math.max(1.7,p.y+p.vy*dt);if(p.y<=1.7)p.vy=0;
  }
  function look(dx,dy,sensitivity=1){const p=state.p;p.yaw=(p.yaw+dx*sensitivity+TAU)%TAU;p.pitch=clamp(p.pitch-dy*sensitivity,-1.15,1.15);}
  function currentPad(){const pads=navigator.getGamepads?.()||[];return Array.from(pads).find(p=>p?.connected&&p.mapping==='standard')||Array.from(pads).find(p=>p?.connected)||null;}
  function buttonEdge(p,index,fn){const down=!!p?.buttons[index]?.pressed;if(down&&!padPrevious[index])fn();padPrevious[index]=down;}
  function inputStep(dt){
    const pad=currentPad();let mx=0,mz=0,lookX=0,lookY=0,sprint=false,jump=false,shootHeld=pointer.down,aimHeld=keys.has('MouseRight');
    if(keys.has('KeyA')||keys.has('ArrowLeft'))mx--;
    if(keys.has('KeyD')||keys.has('ArrowRight'))mx++;
    if(keys.has('KeyW')||keys.has('ArrowUp'))mz--;
    if(keys.has('KeyS')||keys.has('ArrowDown'))mz++;
    sprint=keys.has('ShiftLeft')||keys.has('ShiftRight');jump=keys.has('Space');
    if(pad){if(state.gamepadId!==pad.index){state.gamepadId=pad.index;state.input='CONTROLLER PS4';$('gamepadHint').classList.remove('hidden');setTimeout(()=>$('gamepadHint').classList.add('hidden'),2200);}
      let dead=a=>Math.abs(a)>.12?Math.sign(a)*(Math.abs(a)-.12)/.88:0;
      mx+=dead(pad.axes[0]||0);mz+=dead(pad.axes[1]||0);
      lookX=dead(pad.axes[2]||0);lookY=dead(pad.axes[3]||0);
      look(lookX*dt*2.55*state.sensitivity, lookY*dt*2.15*state.sensitivity);
      sprint=sprint||!!pad.buttons[10]?.pressed;
      jump=jump||!!pad.buttons[0]?.pressed;
      shootHeld=shootHeld||!!pad.buttons[7]?.pressed||pad.buttons[7]?.value>.6;
      aimHeld=aimHeld||!!pad.buttons[6]?.pressed;
      buttonEdge(pad,2,doReload);buttonEdge(pad,3,switchWeapon);buttonEdge(pad,9,togglePause);buttonEdge(pad,5,throwGrenade);buttonEdge(pad,11,melee);
    } else {state.gamepadId=null;padPrevious.fill(false);}
    mx+=touches.move.x;mz-=touches.move.y;
    look(touches.look.x*dt*2.7,touches.look.y*dt*2.3);
    if(touches.shoot)shootHeld=true;
    if(touches.aim)aimHeld=true;
    if(touches.jump)jump=true;
    if(touchDevice&&!pad)state.input='TOUCH';else if(!pad)state.input='TASTIERA + MOUSE';
    if(pointer.dx||pointer.dy){look(pointer.dx*.00225,pointer.dy*.00225);pointer.dx=pointer.dy=0;}
    state.aim=aimHeld;
    updateMove(dt,mx,mz,sprint,jump);
    if(shootHeld)fire();
  }
  function aliveLOS(x,z){ // simple segment/box occlusion, excludes small debris
    const p=state.p;let steps=Math.ceil(hypot(x-p.x,z-p.z)/3);
    for(let i=1;i<steps;i++){const t=i/steps,xx=p.x+(x-p.x)*t,zz=p.z+(z-p.z)*t;
      for(const b of collision){if(b.w>6&&b.d>6&&Math.abs(xx-b.x)<b.w/2&&Math.abs(zz-b.z)<b.d/2)return false;}}
    return true;
  }
  function fire(){const t=state.time,w=weapons[state.weapon];if(state.reloading||t-state.lastShot<w.delay)return;
    if(state.ammo[state.weapon]<=0){doReload();return;}
    state.lastShot=t;state.ammo[state.weapon]--;state.recoil=.9;state.muzzle=.065;
    const p=state.p;let hit=null,score=Infinity;
    for(const e of enemies){if(!e.alive)continue;const dx=e.x-p.x,dz=e.z-p.z,dist=hypot(dx,dz);if(dist>88||dist<.6)continue;
      const a=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(a-p.yaw),Math.cos(a-p.yaw));
      const targetPitch=Math.atan2(1.7-1.28,dist);
      const diff=Math.sqrt((delta/Math.max(.25,Math.cos(p.pitch)))**2+((p.pitch-targetPitch)*.85)**2);
      if(diff<.063+1.5/dist&&diff<score&&aliveLOS(e.x,e.z)){score=diff;hit=e;}
    }
    if(hit){hit.hp-=w.damage;hit.hurt=.28;state.hit=.14;
      for(let i=0;i<5;i++)particles.push({x:hit.x+rand(-.4,.4),z:hit.z+rand(-.4,.4),y:rand(.8,2),vx:rand(-1,1),vz:rand(-1,1),vy:rand(-.2,1.5),life:rand(.3,.6),type:'blood'});
      if(hit.hp<=0){hit.alive=false;hit.respawn=state.time+4.6;state.kills++;
        showNotice('BERSAGLIO NEUTRALIZZATO   +100');
        if(state.kills>=5&&state.phase===0){state.phase=1;showNotice('AREA LIBERATA — RAGGIUNGI L’ESTRAZIONE',3.5);}
      }
    }
  }
  function doReload(){const id=state.weapon,w=weapons[id];if(state.reloading||state.ammo[id]===w.mag||state.reserve[id]===0)return;state.reloading=1;state.reloadUntil=state.time+w.reload;showNotice('RICARICA IN CORSO',.75)}
  function switchWeapon(){state.weapon=(state.weapon+1)%weapons.length;state.reloading=0;showNotice(state.weapon?'PISTOLA M9':'CARABINA MK18',.8)}
  function throwGrenade(){if(!state.grenades)return;state.grenades--;const p=state.p,x=p.x+Math.sin(p.yaw)*13,z=p.z+Math.cos(p.yaw)*13;
    for(let i=0;i<25;i++)particles.push({x,z,y:rand(.4,4),vx:rand(-8,8),vz:rand(-8,8),vy:rand(1,5),life:rand(.4,.9),type:'spark'});
    for(const e of enemies){if(e.alive&&hypot(e.x-x,e.z-z)<9){e.hp-=95;e.hurt=.6;if(e.hp<=0){e.alive=false;e.respawn=state.time+5;state.kills++;}}}
    showNotice('GRANATA — AREA COLPITA',1);
    if(state.kills>=5&&state.phase===0){state.phase=1;showNotice('AREA LIBERATA — RAGGIUNGI L’ESTRAZIONE',3.5)}
  }
  function melee(){const p=state.p;for(const e of enemies){if(e.alive&&hypot(e.x-p.x,e.z-p.z)<3){e.hp-=55;e.hurt=.5;if(e.hp<=0){e.alive=false;state.kills++;e.respawn=state.time+5;if(state.kills>=5&&state.phase===0)state.phase=1;}break;}}}
  function showNotice(s,d=1.3){$('notice').textContent=s;state.noticeUntil=state.time+d;$('notice').style.opacity='1'}
  function aiStep(dt){const p=state.p;
    for(const e of enemies){
      if(!e.alive){if(e.respawn<state.time&&state.phase===0&&state.kills<5){e.alive=true;e.hp=100;e.x=rand(-34,36);e.z=rand(12,52);}continue;}
      e.stride+=dt;e.hurt=Math.max(0,e.hurt-dt);
      let d=hypot(p.x-e.x,p.z-e.z);
      if(d<65&&d>8.5){let sp=d>24?1.9:1.1,dx=(p.x-e.x)/d*sp*dt,dz=(p.z-e.z)/d*sp*dt;
        if(!collide(e.x+dx,e.z,.5))e.x+=dx;if(!collide(e.x,e.z+dz,.5))e.z+=dz;}
      if(d<35&&state.time>e.nextShot&&aliveLOS(e.x,e.z)){
        e.nextShot=state.time+rand(1.2,2.7);
        if(Math.random()<.69){p.health=Math.max(0,p.health-rand(5,11));state.hurt=.48;}
        particles.push({x:e.x,z:e.z,y:1.4,vx:0,vz:0,vy:0,life:.1,type:'spark'});
      }
    }
    if(state.phase===1&&hypot(p.x+40,p.z-73)<7){state.phase=2;end(true);}
    if(p.health<=0&&!state.dead){state.dead=true;end(false);}
  }
  function end(success){state.mode='result';document.exitPointerLock?.();$('resultTag').textContent=success?'MISSIONE COMPLETATA':'OPERATORE ABBATTUTO';$('resultTitle').textContent=success?'SETTORE LIBERATO':'MISSIONE FALLITA';$('resultDescription').textContent=success?'Piazza delle Erbe è stata messa in sicurezza. La città continuerà a cambiare nelle prossime missioni.':'La tua squadra ha perso il controllo del settore. Riprova l’operazione.';$('resultMenu').classList.remove('hidden');$('mobileControls').classList.add('hidden');}
  function update(dt){state.time+=dt;inputStep(dt);aiStep(dt);if(state.reloading&&state.time>=state.reloadUntil){let id=state.weapon,need=weapons[id].mag-state.ammo[id],num=Math.min(need,state.reserve[id]);state.reserve[id]-=num;state.ammo[id]+=num;state.reloading=0;}
    state.recoil=Math.max(0,state.recoil-dt*4);state.hurt=Math.max(0,state.hurt-dt);state.muzzle=Math.max(0,state.muzzle-dt);state.hit=Math.max(0,state.hit-dt);
    for(const a of particles){a.life-=dt;a.x+=a.vx*dt;a.z+=a.vz*dt;a.y+=a.vy*dt;a.vy-=4*dt;}particles=particles.filter(a=>a.life>0);
    $('missionBar').style.width=(state.phase?100:Math.min(100,state.kills/5*100))+'%';
    $('missionMeta').textContent=state.phase?'Raggiungi il punto di estrazione':`Elimina i predoni · ${state.kills} / 5`;
    $('missionTitle').textContent=state.phase?'Evacua il settore':'Metti in sicurezza Piazza delle Erbe';
    $('healthText').textContent=Math.ceil(state.p.health);$('healthBar').style.width=state.p.health+'%';$('ammoText').textContent=state.reloading?'··':state.ammo[state.weapon];$('reserveText').textContent=state.reserve[state.weapon];$('weaponName').textContent=weapons[state.weapon].name;$('cameraMode').textContent=state.camera==='fps'?'FPS':'TERZA PERSONA';
    $('inputDevice').textContent=state.input;$('heading').textContent=(Math.round((state.p.yaw*180/Math.PI+180)%360)).toString().padStart(3,'0')+'°';
    $('hitFlash').style.opacity=state.hurt*1.1;$('hitmarker').style.opacity=state.hit*7;$('notice').style.opacity=state.time<state.noticeUntil?'1':'0';$('muzzle').style.opacity=state.muzzle>0?'.7':'0';
  }
  function drawMinimap(){mctx.clearRect(0,0,170,170);mctx.fillStyle='#182528';mctx.fillRect(0,0,170,170);
    const scale=1.08,cx=85,cz=85,p=state.p;let tx=x=>cx+(x-p.x)*scale,tz=z=>cz+(z-p.z)*scale;
    mctx.fillStyle='#69716d';mctx.fillRect(tx(-51),tz(5),102*scale,78*scale);mctx.fillStyle='#8a8478';mctx.fillRect(tx(-40),tz(-21.5),80*scale,29*scale);
    mctx.fillStyle='#9d917d';for(const b of collision){if(b.w>8&&b.d>8)mctx.fillRect(tx(b.x-b.w/2),tz(b.z-b.d/2),b.w*scale,b.d*scale)}
    mctx.fillStyle='#de715d';for(const e of enemies){if(e.alive){mctx.beginPath();mctx.arc(tx(e.x),tz(e.z),3,0,TAU);mctx.fill();}}
    if(state.phase===1){mctx.fillStyle='#9ee2cb';mctx.fillRect(tx(-40)-4,tz(73)-4,8,8)}
    mctx.save();mctx.translate(cx,cz);mctx.rotate(-state.p.yaw+Math.PI);mctx.fillStyle='#f9cf8f';mctx.beginPath();mctx.moveTo(0,-9);mctx.lineTo(6,6);mctx.lineTo(0,3);mctx.lineTo(-6,6);mctx.closePath();mctx.fill();mctx.restore();
    mctx.strokeStyle='#d4aa65';mctx.strokeRect(.5,.5,169,169);
  }
  function menuPadStep(){
    const pad=currentPad();if(!pad)return;
    for(const index of [0,9]){
      const down=!!pad.buttons[index]?.pressed;
      if(down&&!padPrevious[index]){
        if(state.mode==='menu'||state.mode==='result')start();
        else if(state.mode==='paused')togglePause();
      }
      padPrevious[index]=down;
    }
  }
  function tick(time){let dt=Math.min(.036,(time-lastFrame)/1000||.016);lastFrame=time;frames++;fpsClock+=dt;if(fpsClock>=.6){state.fps=Math.round(frames/fpsClock);$('fps').textContent=state.fps+' FPS';frames=0;fpsClock=0;}
    if(state.mode==='playing')update(dt);else menuPadStep();
    drawWorld(viewCamera());if(state.mode==='playing'){mapTick+=dt;if(mapTick>.1){drawMinimap();mapTick=0;}}
    requestAnimationFrame(tick);
  }
  function setMode(mode){state.mode=mode;$('menu').classList.toggle('hidden',mode!=='menu');$('gameUI').classList.toggle('hidden',mode==='menu');$('mobileControls').classList.toggle('hidden',mode!=='playing'||!touchDevice);$('pauseMenu').classList.toggle('hidden',mode!=='paused');$('resultMenu').classList.toggle('hidden',mode!=='result');}
  function start(){reset();setMode('playing');if(!touchDevice)canvas.requestPointerLock?.().catch(()=>{});}
  function togglePause(){if(state.mode==='playing'){setMode('paused');document.exitPointerLock?.();}else if(state.mode==='paused'){setMode('playing');if(!touchDevice)canvas.requestPointerLock?.().catch(()=>{});}}
  $('startBtn').addEventListener('click',start);$('restartBtn').addEventListener('click',start);$('resumeBtn').addEventListener('click',togglePause);$('returnBtn').addEventListener('click',()=>{setMode('menu');document.exitPointerLock?.()});$('resultMenuBtn').addEventListener('click',()=>setMode('menu'));$('sensitivity').addEventListener('input',e=>state.sensitivity=+e.target.value);
  canvas.addEventListener('click',()=>{if(state.mode==='playing'&&!touchDevice&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.().catch(()=>{})});
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&state.mode==='playing'){pointer.dx+=e.movementX;pointer.dy+=e.movementY;}});
  document.addEventListener('mousedown',e=>{if(state.mode!=='playing')return;if(e.button===0)pointer.down=true;if(e.button===2)keys.add('MouseRight');});document.addEventListener('mouseup',e=>{if(e.button===0)pointer.down=false;if(e.button===2)keys.delete('MouseRight')});document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyP')togglePause();if(state.mode!=='playing')return;if(e.code==='KeyR')doReload();if(e.code==='KeyV')state.camera=state.camera==='fps'?'third':'fps';if(e.code==='KeyG')throwGrenade();if(e.code==='KeyQ')switchWeapon();if(e.code==='KeyF')melee();if(e.code==='Digit1'){state.weapon=0;state.reloading=0;}if(e.code==='Digit2'){state.weapon=1;state.reloading=0;}});
  document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();pointer.down=false;pointer.dx=pointer.dy=0;if(state.mode==='playing')togglePause()});
  window.addEventListener('gamepadconnected',e=>{$('inputDevice').textContent='CONTROLLER CONNESSO';$('gamepadHint').classList.remove('hidden');setTimeout(()=>$('gamepadHint').classList.add('hidden'),2100)});
  window.addEventListener('gamepaddisconnected',()=>{state.gamepadId=null;padPrevious.fill(false)});
  function bindHold(id,key,fn){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);touches[key]=true;fn?.();});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{e.preventDefault();touches[key]=false;});}
  bindHold('shootBtn','shoot');bindHold('aimBtn','aim');bindHold('jumpBtn','jump');$('reloadBtn').addEventListener('pointerdown',e=>{e.preventDefault();doReload()});$('cameraBtn').addEventListener('pointerdown',e=>{e.preventDefault();state.camera=state.camera==='fps'?'third':'fps'});$('mobilePause').addEventListener('pointerdown',e=>{e.preventDefault();togglePause()});
  function initStick(id,key){const el=$(id),nub=el.querySelector('.nub'),s=touches[key];
    function move(e){const b=el.getBoundingClientRect(),X=e.clientX-(b.left+b.width/2),Y=e.clientY-(b.top+b.height/2),r=b.width*.38,mag=hypot(X,Y)||1,k=Math.min(1,r/mag);s.x=X*k/r;s.y=Y*k/r;nub.style.left=`calc(50% + ${X*k}px)`;nub.style.top=`calc(50% + ${Y*k}px)`;}
    el.addEventListener('pointerdown',e=>{e.preventDefault();if(s.id!==null)return;s.id=e.pointerId;el.setPointerCapture?.(e.pointerId);move(e)});
    el.addEventListener('pointermove',e=>{if(s.id===e.pointerId){e.preventDefault();move(e)}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{if(s.id===e.pointerId){s.id=null;s.x=s.y=0;nub.style.left='50%';nub.style.top='50%';}});
  }initStick('moveStick','move');initStick('lookStick','look');
  resize();addEventListener('resize',resize);scene();reset();setMode('menu');requestAnimationFrame(tick);
})();