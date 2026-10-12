/* CALL OF PADUA — Sector 01 / AFTERMATH. Dependency-free canvas 3D prototype.
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
    enrichScene();
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

  // All environment art is procedural and self-contained. The arches, paving,
  // masonry, and improvised defenses are geometry, not a background illustration.
  function faceRect(x,z,w,y0,y1,color,front=true,detail=true){
    const zz=z+(front?.11:-.11),dx=w/2;
    addFace([v(x-dx,y0,zz),v(x+dx,y0,zz),v(x+dx,y1,zz),v(x-dx,y1,zz)],color,detail);
  }
  function arcOpening(cx,z,width,height,front=1){
    const R=width/2,base=height-width*.42, pts=[v(cx-R,.35,z) ,v(cx+R,.35,z),v(cx+R,base,z)];
    for(let i=0;i<=10;i++){let t=i*Math.PI/10;pts.push(v(cx+Math.cos(t)*R,base+Math.sin(t)*R*.83,z));}
    addFace(pts,'#242d2e',true);
    // Stone arch with subtle alternating voussoirs, deep reveals and pillars.
    for(let i=0;i<10;i++){
      let a=i*Math.PI/10,b=(i+1)*Math.PI/10;
      let arc=(r,t)=>v(cx+Math.cos(t)*r,base+Math.sin(t)*r*.83,z+front*.026);
      addFace([arc(R+.33,a),arc(R+.33,b),arc(R+.04,b),arc(R+.04,a)],i%2?'#cfb99b':'#bda88b',true);
    }
    faceRect(cx-R,z,.32,.4,base,'#bda993',front>0,true);
    faceRect(cx+R,z,.32,.4,base,'#bda993',front>0,true);
    faceRect(cx,z,width,0,.27,'#6e6c5f',front>0,true);
  }
  function pennant(x,z,y,unit=1){
    addFace([v(x,y,z),v(x+3.5*unit,y-.25,z+.25),v(x+3.2*unit,y-2.4*unit,z+.4),v(x+2.4*unit,y-3.2*unit,z+.45),v(x+1.6*unit,y-2.5*unit,z+.4),v(x,y-2.7*unit,z)],'#8e463d',true);
    addFace([v(x,y,z+.03),v(x+3.45*unit,y-.28,z+.3),v(x+2.9*unit,y-.5,z+.3),v(x,y-.25,z+.03)],'#b27855',true);
  }
  function marketStall(x,z,side=1){
    wallBox(x,z,4.7,2.4,1.4,['#484a42','#45463f','#4f5149','#58594d','#71604d'],false);
    for(let xx of [-2.1,2.1])pillar(x+xx,z+side*.8,2.6,.2);
    addFace([v(x-2.9,2.7,z-1.25),v(x+2.9,2.7,z-1.25),v(x+2.7,2.25,z+2.1),v(x-2.7,2.25,z+2.1)],'#785e4c',true);
    addFace([v(x-2.7,2.25,z+2.13),v(x+2.7,2.25,z+2.13),v(x+2.7,1.78,z+2.13),v(x-2.7,1.78,z+2.13)],'#a36d50',true);
    for(let k=0;k<3;k++)wallBox(x-1.55+k*1.55,z,1.3,1,.6,['#777761','#696a56','#676853','#8c8272','#978976'],false);
  }
  function rubble(x,z,seed=1){
    for(let k=0;k<7;k++){
      let a=(k*2.399+seed),rr=(k%4+1)*.35;
      const X=x+Math.cos(a)*rr,Z=z+Math.sin(a)*rr;
      const h=.17+(k%3)*.17;
      addFace([v(X-.48,.04,Z-.31),v(X+.55,.04,Z-.29),v(X+.15,h,Z+.27)],k%3===0?'#6b675c':k%3===1?'#a29a83':'#555e5a',true);
    }
  }
  function vehicle(x,z,w=6.5,d=3.1,tone='#53605b'){
    // Abandoned civilian car with tilted windshield and wheel silhouettes.
    wallBox(x,z,w,d,1.3,[tone,'#333b39','#37413f','#6a6d5d','#696963'],false);
    wallBox(x-.4,z,w*.47,d*.8,2.1,['#3f514f','#3a4747','#435653','#6a6e61','#505956'],false);
    for(let side of [-1,1])for(let dx of [-w*.31,w*.31]){
      wallBox(x+dx,z+side*d*.49,1.1,.27,.78,['#202526','#202526'],false);
    }
    faceRect(x+.65,z+d/2+.11,1.4,1.4,1.9,'#273a40',true,true);
    wallBox(x+w*.38,z+d/2+.08,.75,.2,.26,['#bc6853','#9f5147'],false);
  }
  function barricade(x,z){
    for(let i=0;i<4;i++){
      let xx=x+(i-1.5)*1.45;
      wallBox(xx,z,1.5,1.4,.55,[i%2?'#686b55':'#817f68','#636650','#606352','#8d8c73','#99907b'],false);
      wallBox(xx+.3,z,.95,1.3,1.01,['#807b65','#726f5d','#75715e','#9d9579','#847e67'],false);
    }
  }
  function streetLamp(x,z){
    wallBox(x,z,.21,.21,7.9,['#333b3b','#292e2f','#323838','#444744','#333836'],false);
    wallBox(x+.6,z,.95,.17,.25,['#414542','#303635','#414542','#414542','#4b5149'],false);
    addFace([v(x+.3,7.32,z+.17),v(x+1.12,7.32,z+.17),v(x+1.1,7.49,z+.17),v(x+.36,7.49,z+.17)],'#d9ba83',true);
  }
  function enrichScene(){
    // Long vaulted roof profile: the iconic 'salone' silhouette has multiple curved segments.
    const zc=-7,zradius=15;
    for(let i=0;i<12;i++){
      let a=Math.PI*i/12,b=Math.PI*(i+1)/12;
      let z0=zc-Math.cos(a)*zradius,z1=zc-Math.cos(b)*zradius;
      let y0=17+8*Math.sin(a),y1=17+8*Math.sin(b);
      addFace([v(-41,y0,z0),v(41,y0,z0),v(41,y1,z1),v(-41,y1,z1)],i%3===0?'#65534a':i%3===1?'#775e50':'#705a4c');
      if(i%2===0)addFace([v(-41.18,y0+.18,z0),v(41.18,y0+.18,z0),v(41.18,y0+.24,z0+.22),v(-41.18,y0+.24,z0+.22)],'#493f39',true);
    }
    // Add large Gothic loggias on the two piazza-facing elevations.
    for(const side of [-1,1]){
      const faceZ=-7+side*14.78;
      for(let i=0;i<12;i++){
        let x=-33.8+i*6.14;
        arcOpening(x,faceZ+side*.15,4.1,6.35,side);
        faceRect(x,faceZ+side*.22,5.8,7.35,7.7,'#d7bea0',side===1,true);
        if(i%2===0){
          faceRect(x,faceZ+side*.22,2.15,10.2,13.05,'#3a4643',side===1,true);
          faceRect(x,faceZ+side*.26,2.5,13.05,13.33,'#ddd0b2',side===1,true);
          faceRect(x-1.15,faceZ+side*.26,.14,10.15,13.35,'#cbbb9d',side===1,true);
          faceRect(x+1.15,faceZ+side*.26,.14,10.15,13.35,'#cbbb9d',side===1,true);
        }
      }
    }
    // Continuous roofline and exposed stone details on the end facades.
    for(let side of [-1,1]){
      let x=side*41.15;
      for(let j=0;j<6;j++)addFace([v(x,8,-18+j*3.5),v(x,8,-16+j*3.5),v(x,16,-16+j*3.5),v(x,16,-18+j*3.5)],j%2?'#bba68a':'#9d8c77',true);
    }
    // The central front of the square is more densely paved, weathered, and inhabited.
    for(let i=0;i<20;i++){
      let x=-48+i*5.1;ground(x,52,.055,57,i%3?'#a19883':'#8e8978');
    }
    for(let i=0;i<14;i++){
      let z=12+i*5;ground(0,z,101,.045,i%3?'#9d9887':'#aaa28d');
    }
    // Facade trim, shutters, broken plaster and signage on street-facing blocks.
    for(let i=0;i<7;i++){
      let x=57+i*18.6, bz=41+28.6,yy=4.2+(i%3)*3.1;
      faceRect(x,bz+ .03,6,yy,yy+.42,'#cec0a5',true,true);
      faceRect(x-3.3,bz+.07,.32,yy-1,yy+3.3,'#97816e',true,true);
      faceRect(x+3.3,bz+.07,.32,yy-1,yy+3.3,'#97816e',true,true);
      if(i%2===0){faceRect(x,bz+.18,4.4,.8,3,'#344044',true,true);pennant(x-3,bz+.42,5.8,.8)}
    }
    for(let i=0;i<4;i++){
      let x=-106+i*19.1;
      faceRect(x,66.35,12,3.1,3.55,'#d7c3a7',true,true);
      faceRect(x,66.48,9,1.1,2.85,i%2?'#756b5d':'#73554b',true,true);
    }
    marketStall(-14,68);marketStall(20,61);marketStall(26,39);
    vehicle(-42,94,6.5,3.1,'#696b59');vehicle(43,101,7.3,3.2,'#78665c');
    barricade(-7,23);barricade(27,26);barricade(-36,62);
    for(let i=0;i<40;i++){
      let a=i*7.31,x=Math.sin(a)*45,z=15+(i*19)%75;
      if(Math.abs(x)<5&&z>56)continue;
      rubble(x,z,i);
    }
    for(const [x,z] of [[-47,80],[47,85],[-47,28],[48,23],[-55,-45],[62,-53]])streetLamp(x,z);
    for(let j=0;j<8;j++){
      let x=-44+j*13;
      addFace([v(x,.04,106),v(x+2,.04,105.65),v(x+1.72,.04,105.47),v(x-.2,.04,105.55)],'#343e3c',true);
    }
    // Soot scars and exposed masonry — geometry deliberately sparse for low-end phones.
    for(let j=0;j<14;j++){
      let x=55+j*9.1,z=69.7,y=7+(j%3)*2.9;
      faceRect(x,z,1.6+(j%3),y,y+1.6,j%3?'#8c7d70':'#71665c',true,true);
    }
    // Intel cache: lit tent and radio terminal south-west of the portico.
    wallBox(-34,29,4,3,1.4,['#354744','#34413e','#424e47','#3b4844','#55605a'],false);
    wallBox(-34,29,1.2,1.1,2,['#8f9a78','#78836c','#75846c','#b9b597','#a59a7c'],false);
    addFace([v(-36.5,2,26),v(-31.5,2,26),v(-34,3.7,29)],'#565e4e',true);
    addFace([v(-36.5,2,32),v(-31.5,2,32),v(-34,3.7,29)],'#525b4d',true);
  }

  function spawnEnemy(x,z){enemies.push({x,z,hp:100,alive:true,respawn:0,nextShot:rand(1,3),stride:rand(0,6),angle:rand(0,TAU),hurt:0});}
  function reset(){state.p={x:0,z:67,y:1.7,vy:0,yaw:Math.PI,pitch:-.045,health:100};state.kills=0;state.phase=0;state.weapon=0;state.ammo=[30,15];state.reserve=[180,90];state.grenades=2;state.lastShot=-10;state.reloading=0;state.recoil=0;state.hurt=0;state.dead=false;state.aim=false;state.camera='fps';state.time=0;enemies=[];particles=[];spawnEnemy(-21,36);spawnEnemy(17,23);spawnEnemy(13,53);spawnEnemy(-27,-48);$('missionTitle').textContent='Metti in sicurezza Piazza delle Erbe';$('missionMeta').textContent='Neutralizza la pattuglia · 0 / 4';$('missionBar').style.width='0%';$('resultMenu').classList.add('hidden');$('pauseMenu').classList.add('hidden');}
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
    const sky=ctx.createLinearGradient(0,0,0,Math.max(H,horizon+80));sky.addColorStop(0,'#182b35');sky.addColorStop(.32,'#465b5d');sky.addColorStop(.62,'#b9a18a');sky.addColorStop(1,'#8c816a');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    // Smog skyline with distant fragments / minimal draw over ground horizon.
    ctx.fillStyle='rgba(28,39,40,.31)';for(let i=0;i<25;i++){let sx=(i*97+Math.sin(c.yaw+i)*53+W)%W,yy=horizon-18-i%4*4;ctx.fillRect(sx,yy,25+i%3*19,40+i%5*15)}
    const sunX=W*.8-Math.sin(c.yaw)*W*.36,sunY=horizon-215;
    const sun=ctx.createRadialGradient(sunX,sunY,5,sunX,sunY,Math.min(W,H)*.7);
    sun.addColorStop(0,'rgba(253,207,155,.45)');sun.addColorStop(.18,'rgba(241,175,120,.14)');sun.addColorStop(1,'rgba(240,175,120,0)');
    ctx.fillStyle=sun;ctx.fillRect(0,0,W,H);
    for(let i=0;i<6;i++){let yy=horizon-170+i*29;ctx.fillStyle=`rgba(26,38,43,${.06+i*.012})`;ctx.fillRect(0,yy,W,4+i%3*4);}
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
      fig(-.62,.6,.62,1.55,e.hurt>0?'#b66d56':'#52625c');fig(-.37,1.55,.37,2.05,'#7c7565');fig(-.5,1.94,.5,2.2,'#303b39');fig(-.52,0,-.1,.65,'#303d3c');fig(.1,0,.52,.65,'#303d3c');fig(-.82,.77,-.58,1.43,'#4d544c');fig(.58,.77,.82,1.43,'#4d544c');fig(-.24,1.04,.8,1.2,'#292b29',-.2);fig(-.26,1.38,.26,1.53,'#7f886f',-.12);fig(-.23,1.76,.23,1.83,'#b49b79',-.15);fig(-.8,.82,-.59,.94,'#806c52',-.1);
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

    if(state.phase===0||state.phase===2){for(const e of enemies){if(!e.alive)continue;const t=projected(v(e.x,2.7,e.z),c);if(t&&t[2]<65)enemyMarker(t,e);}}
    // 3D mission markers, threat direction, and ballistic flashes.
    if(state.phase===1){const t=projected(v(-34,3.1,29),c);if(t)beacon(t[0],t[1],t[2],'RECUPERA DATI');}
    if(state.phase===2){const t=projected(v(-40,2.5,73),c);if(t)beacon(t[0],t[1],t[2],'ESTRAZIONE');}
    if(state.camera==='fps')drawWeapon();
    for(const fx of particles){const t=projected(v(fx.x,fx.y,fx.z),c);if(!t)continue;ctx.globalAlpha=clamp(fx.life,0,1);ctx.fillStyle=fx.type==='blood'?'#d36a5e':'#e7c48b';ctx.fillRect(t[0],t[1],Math.max(2,8/t[2]*10),Math.max(2,8/t[2]*10));}ctx.globalAlpha=1;
  }
  function beacon(x,y,d,label='ESTRAZIONE'){const r=Math.max(13,350/d);ctx.strokeStyle='#92e3d0';ctx.lineWidth=2;ctx.globalAlpha=.8;ctx.beginPath();ctx.ellipse(x,y,r,r*.35,0,0,TAU);ctx.stroke();ctx.beginPath();ctx.moveTo(x,y-r*1.5);ctx.lineTo(x,y+r*.2);ctx.stroke();ctx.fillStyle='#c7ffee';ctx.textAlign='center';ctx.font='bold 13px monospace';ctx.fillText(label+' · '+Math.round(d)+' M',x,y-r*1.9);ctx.textAlign='left';ctx.globalAlpha=1}
  function enemyMarker(t,e){let r=Math.max(8,110/t[2]);ctx.fillStyle='#ee6e57';ctx.beginPath();ctx.moveTo(t[0],t[1]-7);ctx.lineTo(t[0]-4,t[1]-13);ctx.lineTo(t[0]+4,t[1]-13);ctx.closePath();ctx.fill();if(e.hurt>0){ctx.fillStyle='#1a2020';ctx.fillRect(t[0]-12,t[1]-20,24,3);ctx.fillStyle='#e36c5b';ctx.fillRect(t[0]-12,t[1]-20,24*e.hp/100,3);}}
  function drawWeapon(){
    const w=W,h=H,zoom=state.aim, scale=Math.min(W/1350,H/820)*(touchDevice?.98:1.15),p=state.recoil;
    const x=w*(zoom?.52:.66), y=h+(-68+p*31+Math.sin(state.time*1.7)*2.5)*scale;
    ctx.save();ctx.translate(x,y);ctx.scale(scale*(zoom?1.13:1),scale*(zoom?1.13:1));ctx.rotate((zoom?-.04:-.085)+p*.045);
    const poly=(arr,col,stroke)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(...arr[0]);for(let i=1;i<arr.length;i++)ctx.lineTo(...arr[i]);ctx.closePath();ctx.fill();if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.6;ctx.stroke()}};
    if(state.weapon===0){
      // Illustrated tactical rifle with an identifiable stock, top rail, receiver,
      // iron sight, magwell, magazine, barrel, grip and gloved supporting hand.
      poly([[-110,-18],[-35,-66],[17,-69],[44,-45],[-47,7]],'#1c2527');
      poly([[-112,-14],[-66,-24],[-52,-4],[-94,13]],'#3a4545');
      poly([[-27,-69],[94,-78],[135,-54],[77,-18],[-11,-21]],'#363f3e','#151f21');
      poly([[50,-59],[256,-91],[290,-75],[107,-43]],'#222a2b','#111b1d');
      poly([[123,-75],[314,-108],[323,-103],[126,-67]],'#687370');
      poly([[289,-107],[364,-121],[370,-111],[316,-93]],'#232b2c');
      poly([[345,-122],[363,-123],[370,-118],[351,-115]],'#919a88');
      poly([[188,-85],[208,-95],[215,-88],[195,-80]],'#1e2626');
      poly([[38,-76],[70,-90],[113,-84],[114,-68],[44,-60]],'#161f22');
      poly([[58,-96],[91,-98],[90,-88],[57,-84]],'#56615c');
      poly([[40,-48],[118,-62],[120,-25],[50,-7],[-6,-20]],'#4b5450','#242d2c');
      poly([[109,-58],[191,-71],[180,-47],[122,-34]],'#35413f');
      poly([[50,-9],[78,-11],[70,87],[38,92]],'#20292a');
      poly([[69,-5],[91,-5],[88,32],[66,36]],'#68736e');
      poly([[12,-12],[44,0],[30,18],[-2,22]],'#111c1f');
      poly([[10,15],[26,16],[25,92],[-2,97]],'#2b3334');
      poly([[27,42],[77,33],[116,45],[115,82],[77,102],[26,82]],'#8a8270');
      poly([[55,90],[97,74],[141,92],[145,138],[64,150]],'#3c4544');
      for(let i=0;i<7;i++){ctx.fillStyle='#111a1c';ctx.fillRect(143+i*19,-80-i*2.5,10,3)}
      for(let i=0;i<4;i++){ctx.fillStyle='#1a2224';ctx.fillRect(143+i*24,-56-i*2.2,12,4)}
      ctx.strokeStyle='#a6ac98';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(113,-61);ctx.lineTo(288,-91);ctx.stroke();
      ctx.fillStyle='#a5a992';ctx.beginPath();ctx.arc(55,-34,3,0,TAU);ctx.fill();
    }else{
      // A separate visible pistol model — weapon switching is not purely cosmetic.
      poly([[-35,-54],[169,-78],[194,-69],[188,-42],[-32,-18]],'#1d272b','#626c68');
      poly([[-32,-45],[171,-67],[177,-53],[-30,-30]],'#52605e');
      poly([[57,-29],[104,-30],[95,76],[63,85],[42,-6]],'#252e31');
      poly([[76,10],[95,5],[86,80],[71,76]],'#444e4a');
      poly([[-2,-19],[56,-25],[61,-5],[15,13]],'#303939');
      poly([[164,-79],[170,-91],[179,-91],[184,-78]],'#171e21');
      poly([[-11,-45],[-9,-60],[2,-61],[5,-45]],'#1f282b');
      poly([[27,32],[55,21],[81,37],[66,112],[37,123]],'#8c826e');
      poly([[45,108],[71,91],[92,109],[84,151],[39,155]],'#444a42');
    }
    ctx.restore();
    if(state.muzzle>0){
      const alpha=clamp(state.muzzle/.075,0,1),xx=x+(state.weapon===0?374:196)*scale, yy=y-(state.weapon===0?116:72)*scale;
      ctx.save();ctx.globalAlpha=alpha;ctx.translate(xx,yy);ctx.rotate(state.time*15);
      let grad=ctx.createRadialGradient(0,0,2,0,0,36*scale);grad.addColorStop(0,'#ffffdf');grad.addColorStop(.22,'#ffdaa0');grad.addColorStop(1,'rgba(252,147,62,0)');ctx.fillStyle=grad;
      ctx.beginPath();ctx.arc(0,0,36*scale,0,TAU);ctx.fill();ctx.restore();
    }
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
      buttonEdge(pad,2,()=>{if(state.phase===1&&hypot(state.p.x+34,state.p.z-29)<7.5)interact();else doReload()});buttonEdge(pad,3,switchWeapon);buttonEdge(pad,9,togglePause);buttonEdge(pad,5,throwGrenade);buttonEdge(pad,11,melee);
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

  let audioCtx=null,shotBuffer=null;
  function ensureAudio(){
    if(audioCtx){if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return;}
    try{audioCtx=new (window.AudioContext||window.webkitAudioContext)();
      shotBuffer=audioCtx.createBuffer(1,Math.floor(audioCtx.sampleRate*.21),audioCtx.sampleRate);
      const data=shotBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*Math.pow(1-i/data.length,3);
    }catch(_){audioCtx=null;}
  }
  function playCue(type){
    if(!audioCtx||audioCtx.state!=='running')return;
    const now=audioCtx.currentTime;
    if(type==='shot'&&shotBuffer){
      let node=audioCtx.createBufferSource(),gain=audioCtx.createGain(),filter=audioCtx.createBiquadFilter();
      node.buffer=shotBuffer;filter.type='lowpass';filter.frequency.value=950;
      gain.gain.setValueAtTime(.16,now);gain.gain.exponentialRampToValueAtTime(.003,now+.19);
      node.connect(filter);filter.connect(gain);gain.connect(audioCtx.destination);node.start(now);node.stop(now+.20);
    }else{
      let osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type='triangle';
      osc.frequency.setValueAtTime(type==='objective'?680:390,now);
      osc.frequency.exponentialRampToValueAtTime(type==='objective'?930:280,now+.14);
      gain.gain.setValueAtTime(.048,now);gain.gain.exponentialRampToValueAtTime(.001,now+.2);
      osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+.21);
    }
  }

  function fire(){const t=state.time,w=weapons[state.weapon];if(state.reloading||t-state.lastShot<w.delay)return;
    if(state.ammo[state.weapon]<=0){doReload();return;}
    state.lastShot=t;state.ammo[state.weapon]--;state.recoil=.9;state.muzzle=.065;playCue('shot');
    const p=state.p;let hit=null,score=Infinity;
    for(const e of enemies){if(!e.alive)continue;const dx=e.x-p.x,dz=e.z-p.z,dist=hypot(dx,dz);if(dist>88||dist<.6)continue;
      const a=Math.atan2(dx,dz),delta=Math.atan2(Math.sin(a-p.yaw),Math.cos(a-p.yaw));
      const targetPitch=Math.atan2(1.7-1.28,dist);
      const diff=Math.sqrt((delta/Math.max(.25,Math.cos(p.pitch)))**2+((p.pitch-targetPitch)*.85)**2);
      if(diff<.063+1.5/dist&&diff<score&&aliveLOS(e.x,e.z)){score=diff;hit=e;}
    }
    if(hit){hit.hp-=w.damage;hit.hurt=.28;state.hit=.14;playCue('hit');
      for(let i=0;i<5;i++)particles.push({x:hit.x+rand(-.4,.4),z:hit.z+rand(-.4,.4),y:rand(.8,2),vx:rand(-1,1),vz:rand(-1,1),vy:rand(-.2,1.5),life:rand(.3,.6),type:'blood'});
      if(hit.hp<=0){hit.alive=false;hit.respawn=state.time+4.6;state.kills++;
        showNotice('BERSAGLIO NEUTRALIZZATO   +100');
        if(state.kills>=4&&state.phase===0){state.phase=1;showNotice('AREA LIBERATA — RECUPERA I DATI NELLA TENDA',3.5);}
      }
    }
  }
  function doReload(){const id=state.weapon,w=weapons[id];if(state.reloading||state.ammo[id]===w.mag||state.reserve[id]===0)return;state.reloading=1;state.reloadUntil=state.time+w.reload;showNotice('RICARICA IN CORSO',.75)}
  function switchWeapon(){state.weapon=(state.weapon+1)%weapons.length;state.reloading=0;showNotice(state.weapon?'PISTOLA M9':'CARABINA MK18',.8)}
  function throwGrenade(){if(!state.grenades)return;state.grenades--;const p=state.p,x=p.x+Math.sin(p.yaw)*13,z=p.z+Math.cos(p.yaw)*13;
    for(let i=0;i<25;i++)particles.push({x,z,y:rand(.4,4),vx:rand(-8,8),vz:rand(-8,8),vy:rand(1,5),life:rand(.4,.9),type:'spark'});
    for(const e of enemies){if(e.alive&&hypot(e.x-x,e.z-z)<9){e.hp-=95;e.hurt=.6;if(e.hp<=0){e.alive=false;e.respawn=state.time+5;state.kills++;}}}
    showNotice('GRANATA — AREA COLPITA',1);
    if(state.kills>=4&&state.phase===0){state.phase=1;showNotice('AREA LIBERATA — RECUPERA I DATI NELLA TENDA',3.5)}
  }
  function interact(){
    if(state.mode!=='playing')return;
    if(state.phase===1&&hypot(state.p.x+34,state.p.z-29)<7.5){
      state.phase=2;showNotice('FREQUENZA RECUPERATA — AGGUATO! RAGGIUNGI L’ESTRAZIONE',4);
      spawnEnemy(9,50);spawnEnemy(-15,55);spawnEnemy(21,70);
      playCue('objective');
    } else if(state.phase===1)showNotice('TRASMETTITORE: RAGGIUNGI IL SEGNALE',1.2);
  }
  function melee(){const p=state.p;for(const e of enemies){if(e.alive&&hypot(e.x-p.x,e.z-p.z)<3){e.hp-=55;e.hurt=.5;if(e.hp<=0){e.alive=false;state.kills++;e.respawn=state.time+5;if(state.kills>=4&&state.phase===0)state.phase=1;}break;}}}
  function showNotice(s,d=1.3){$('notice').textContent=s;state.noticeUntil=state.time+d;$('notice').style.opacity='1'}
  function aiStep(dt){const p=state.p;
    for(const e of enemies){
      if(!e.alive){if(e.respawn<state.time&&state.phase===0&&state.kills<4){e.alive=true;e.hp=100;e.x=rand(-34,36);e.z=rand(12,52);}continue;}
      e.stride+=dt;e.hurt=Math.max(0,e.hurt-dt);
      let d=hypot(p.x-e.x,p.z-e.z);
      if(d<65&&d>8.5){let sp=d>24?1.9:1.1,dx=(p.x-e.x)/d*sp*dt,dz=(p.z-e.z)/d*sp*dt;
        if(!collide(e.x+dx,e.z,.5))e.x+=dx;if(!collide(e.x,e.z+dz,.5))e.z+=dz;}
      if(d<35&&state.time>2.5&&state.time>e.nextShot&&aliveLOS(e.x,e.z)){
        e.nextShot=state.time+rand(1.2,2.7);
        if(Math.random()<.69){p.health=Math.max(0,p.health-rand(3,7));state.hurt=.48;}
        particles.push({x:e.x,z:e.z,y:1.4,vx:0,vz:0,vy:0,life:.1,type:'spark'});
      }
    }
    if(state.phase===2&&hypot(p.x+40,p.z-73)<7){state.phase=3;end(true);}
    if(p.health<=0&&!state.dead){state.dead=true;end(false);}
  }
  function end(success){state.mode='result';document.exitPointerLock?.();$('resultTag').textContent=success?'MISSIONE COMPLETATA':'OPERATORE ABBATTUTO';$('resultTitle').textContent=success?'SETTORE LIBERATO':'MISSIONE FALLITA';$('resultDescription').textContent=success?'Piazza delle Erbe è stata messa in sicurezza. La città continuerà a cambiare nelle prossime missioni.':'La tua squadra ha perso il controllo del settore. Riprova l’operazione.';$('resultMenu').classList.remove('hidden');$('mobileControls').classList.add('hidden');}
  function update(dt){state.time+=dt;inputStep(dt);aiStep(dt);if(state.reloading&&state.time>=state.reloadUntil){let id=state.weapon,need=weapons[id].mag-state.ammo[id],num=Math.min(need,state.reserve[id]);state.reserve[id]-=num;state.ammo[id]+=num;state.reloading=0;}
    state.recoil=Math.max(0,state.recoil-dt*4);state.hurt=Math.max(0,state.hurt-dt);state.muzzle=Math.max(0,state.muzzle-dt);state.hit=Math.max(0,state.hit-dt);
    for(const a of particles){a.life-=dt;a.x+=a.vx*dt;a.z+=a.vz*dt;a.y+=a.vy*dt;a.vy-=4*dt;}particles=particles.filter(a=>a.life>0);
    $('missionBar').style.width=(state.phase?100:Math.min(100,state.kills/4*100))+'%';
    $('missionMeta').textContent=state.phase===1?'Recupera il trasmettitore · E / □':state.phase===2?'Raggiungi il punto di estrazione':`Neutralizza la pattuglia · ${state.kills} / 4`;
    $('missionTitle').textContent=state.phase===1?'Intercetta le comunicazioni':state.phase>=2?'Evacua il settore':'Metti in sicurezza Piazza delle Erbe';
    $('radioCall').style.opacity=state.time>11&&state.phase===0?'0':'.93';$('radioCall').querySelector('strong').textContent=state.phase===1?'TRASMETTITORE INDIVIDUATO':state.phase>=2?'ESTRAZIONE / ZONA SUD':'SETTORE 01';$('radioCall').querySelector('p').textContent=state.phase===1?'Premi E / □ vicino alla radio.':state.phase>=2?'Raggiungi il segnale e sopravvivi.':'Neutralizza la pattuglia ostile.';
    $('healthText').textContent=Math.ceil(state.p.health);$('healthBar').style.width=state.p.health+'%';$('ammoText').textContent=state.reloading?'··':state.ammo[state.weapon];$('reserveText').textContent=state.reserve[state.weapon];$('weaponName').textContent=weapons[state.weapon].name;$('cameraMode').textContent=state.camera==='fps'?'FPS':'TERZA PERSONA';
    $('inputDevice').textContent=state.input;$('heading').textContent=(Math.round((state.p.yaw*180/Math.PI+180)%360)).toString().padStart(3,'0')+'°';
    $('hitFlash').style.opacity=state.hurt*1.1;$('hitmarker').style.opacity=state.hit*7;$('notice').style.opacity=state.time<state.noticeUntil?'1':'0';$('muzzle').style.opacity=state.muzzle>0?'.7':'0';
  }
  function drawMinimap(){mctx.clearRect(0,0,170,170);mctx.fillStyle='#182528';mctx.fillRect(0,0,170,170);
    const scale=1.08,cx=85,cz=85,p=state.p;let tx=x=>cx+(x-p.x)*scale,tz=z=>cz+(z-p.z)*scale;
    mctx.fillStyle='#69716d';mctx.fillRect(tx(-51),tz(5),102*scale,78*scale);mctx.fillStyle='#8a8478';mctx.fillRect(tx(-40),tz(-21.5),80*scale,29*scale);
    mctx.fillStyle='#9d917d';for(const b of collision){if(b.w>8&&b.d>8)mctx.fillRect(tx(b.x-b.w/2),tz(b.z-b.d/2),b.w*scale,b.d*scale)}
    mctx.fillStyle='#de715d';for(const e of enemies){if(e.alive){mctx.beginPath();mctx.arc(tx(e.x),tz(e.z),3,0,TAU);mctx.fill();}}
    if(state.phase===1||state.phase===2){mctx.fillStyle='#9ee2cb';mctx.fillRect(tx(state.phase===1?-34:-40)-4,tz(state.phase===1?29:73)-4,8,8)}
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
  function start(){ensureAudio();reset();setMode('playing');if(!touchDevice)canvas.requestPointerLock?.().catch(()=>{});}
  function togglePause(){if(state.mode==='playing'){setMode('paused');document.exitPointerLock?.();}else if(state.mode==='paused'){setMode('playing');if(!touchDevice)canvas.requestPointerLock?.().catch(()=>{});}}
  $('startBtn').addEventListener('click',start);$('restartBtn').addEventListener('click',start);$('resumeBtn').addEventListener('click',togglePause);$('returnBtn').addEventListener('click',()=>{setMode('menu');document.exitPointerLock?.()});$('resultMenuBtn').addEventListener('click',()=>setMode('menu'));$('sensitivity').addEventListener('input',e=>state.sensitivity=+e.target.value);
  canvas.addEventListener('click',()=>{if(state.mode==='playing'&&!touchDevice&&document.pointerLockElement!==canvas)canvas.requestPointerLock?.().catch(()=>{})});
  document.addEventListener('mousemove',e=>{if(document.pointerLockElement===canvas&&state.mode==='playing'){pointer.dx+=e.movementX;pointer.dy+=e.movementY;}});
  document.addEventListener('mousedown',e=>{if(state.mode!=='playing')return;if(e.button===0)pointer.down=true;if(e.button===2)keys.add('MouseRight');});document.addEventListener('mouseup',e=>{if(e.button===0)pointer.down=false;if(e.button===2)keys.delete('MouseRight')});document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('keydown',e=>{if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.repeat)return;if(e.code==='Escape'||e.code==='KeyP')togglePause();if(state.mode!=='playing')return;if(e.code==='KeyR')doReload();if(e.code==='KeyE')interact();if(e.code==='KeyV')state.camera=state.camera==='fps'?'third':'fps';if(e.code==='KeyG')throwGrenade();if(e.code==='KeyQ')switchWeapon();if(e.code==='KeyF')melee();if(e.code==='Digit1'){state.weapon=0;state.reloading=0;}if(e.code==='Digit2'){state.weapon=1;state.reloading=0;}});
  document.addEventListener('keyup',e=>keys.delete(e.code));window.addEventListener('blur',()=>{keys.clear();pointer.down=false;pointer.dx=pointer.dy=0;if(state.mode==='playing')togglePause()});
  window.addEventListener('gamepadconnected',e=>{$('inputDevice').textContent='CONTROLLER CONNESSO';$('gamepadHint').classList.remove('hidden');setTimeout(()=>$('gamepadHint').classList.add('hidden'),2100)});
  window.addEventListener('gamepaddisconnected',()=>{state.gamepadId=null;padPrevious.fill(false)});
  function bindHold(id,key,fn){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture?.(e.pointerId);touches[key]=true;fn?.();});for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{e.preventDefault();touches[key]=false;});}
  bindHold('shootBtn','shoot',()=>{if(state.mode==='playing')fire()});bindHold('aimBtn','aim');bindHold('jumpBtn','jump');$('reloadBtn').addEventListener('pointerdown',e=>{e.preventDefault();doReload()});$('interactBtn')?.addEventListener('pointerdown',e=>{e.preventDefault();interact()});$('cameraBtn').addEventListener('pointerdown',e=>{e.preventDefault();state.camera=state.camera==='fps'?'third':'fps'});$('mobilePause').addEventListener('pointerdown',e=>{e.preventDefault();togglePause()});
  function initStick(id,key){const el=$(id),nub=el.querySelector('.nub'),s=touches[key];
    function move(e){const b=el.getBoundingClientRect(),X=e.clientX-(b.left+b.width/2),Y=e.clientY-(b.top+b.height/2),r=b.width*.38,mag=hypot(X,Y)||1,k=Math.min(1,r/mag);s.x=X*k/r;s.y=Y*k/r;nub.style.left=`calc(50% + ${X*k}px)`;nub.style.top=`calc(50% + ${Y*k}px)`;}
    el.addEventListener('pointerdown',e=>{e.preventDefault();if(s.id!==null)return;s.id=e.pointerId;el.setPointerCapture?.(e.pointerId);move(e)});
    el.addEventListener('pointermove',e=>{if(s.id===e.pointerId){e.preventDefault();move(e)}});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(type,e=>{if(s.id===e.pointerId){s.id=null;s.x=s.y=0;nub.style.left='50%';nub.style.top='50%';}});
  }initStick('moveStick','move');initStick('lookStick','look');
  resize();addEventListener('resize',resize);scene();reset();setMode('menu');requestAnimationFrame(tick);
})();
