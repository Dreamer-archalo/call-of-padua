/* CALL OF PADUA 0.9 / Original detailed Venetian facade surfaces.
 * Atlas painted by createAtlas() in this file; no third-party imagery.
 * Decoration has no collision and cannot alter objectives or navigation.
 */
(() => {
  'use strict';
  const tone=[1.12,1.12,1.1];
  const p=(arr, point, normal, uv, tile)=>arr.push(point[0],point[1],point[2],normal[0],normal[1],normal[2],uv[0],uv[1],tile,...tone);
  function face(arr,a,b,c,d,normal,tile){
    p(arr,a,normal,[0,0],tile);p(arr,b,normal,[1,0],tile);p(arr,c,normal,[1,1],tile);
    p(arr,a,normal,[0,0],tile);p(arr,c,normal,[1,1],tile);p(arr,d,normal,[0,1],tile);
  }
  function building({mesh},x,z,w,d,h,seed){
    const tile=16+(Math.abs(Math.floor(seed))%8), t2=16+((Math.abs(Math.floor(seed))+3)%8);
    // Insets are still geometry from the core world; overlay at a small depth offset
    // prevents Z fighting, while keeping world colliders and paths untouched.
    face(mesh,[x-w/2,0,z+d/2+.19],[x+w/2,0,z+d/2+.19],[x+w/2,h,z+d/2+.19],[x-w/2,h,z+d/2+.19],[0,0,1],tile);
    face(mesh,[x+w/2,0,z-d/2-.19],[x-w/2,0,z-d/2-.19],[x-w/2,h,z-d/2-.19],[x+w/2,h,z-d/2-.19],[0,0,-1],t2);
    face(mesh,[x+w/2+.19,0,z+d/2],[x+w/2+.19,0,z-d/2],[x+w/2+.19,h,z-d/2],[x+w/2+.19,h,z+d/2],[1,0,0],t2);
    face(mesh,[x-w/2-.19,0,z-d/2],[x-w/2-.19,0,z+d/2],[x-w/2-.19,h,z+d/2],[x-w/2-.19,h,z-d/2],[-1,0,0],tile);
  }
  function landmark({mesh,box,cylinder}){
    // Palazzo del Capitanio: two Renaissance flanks. The tower arch remains uncovered.
    for(const cx of [-149,-93]){
      face(mesh,[cx-17.1,.25,-42.27],[cx+17.1,.25,-42.27],[cx+17.1,18.45,-42.27],[cx-17.1,18.45,-42.27],[0,0,1],16);
      // Real dimensional balcony / entablature rather than texture alone.
      box(mesh,cx,8.0,-42.03,34.2,.31,.88,5,[.95,.9,.8]);
      box(mesh,cx,16.38,-42.1,34.2,.26,.6,5,[.93,.85,.76]);
      box(mesh,cx,17.97,-42.04,34.5,.42,.92,5,[.89,.84,.76]);
      for(let j=0;j<8;j++){
        const xx=cx-15.0+j*4.32;
        box(mesh,xx,7.96,-41.48,.11,1.04,.11,7,[.3,.32,.29]);
        for(let k of [-.83,0,.83])box(mesh,xx+k,8.02,-41.32,.075,.7,.09,7,[.27,.29,.27]);
      }
    }
    // Rows of intimate shopfronts along the long sides of the piazza.
    // Existing architecture and lanes preserved; texture plates add visual depth.
    for(const [x,normal] of [[-174,1],[-69,-1]]){
      for(let j=0;j<9;j++){
        const z=-28+(j+.5)*60/9;
        let xx=x+normal*.9;
        face(mesh,[xx,.5,z-3],[xx,.5,z+3],[xx,14.1,z+3],[xx,14.1,z-3],[normal,0,0],16+(j%4));
      }
    }
  }
  function manor({mesh},x,z,w,d){
    // Palazzo della Ragione: repeated arched bays on both long historic market sides.
    // Repeating a BAY image (rather than stretching the whole building) preserves proportion.
    const len=w/10;
    for(let i=0;i<10;i++){
      const a=x-w/2+i*len,b=a+len;
      face(mesh,[a,0,z+d/2+.44],[b,0,z+d/2+.44],[b,17,z+d/2+.44],[a,17,z+d/2+.44],[0,0,1],23);
      face(mesh,[b,0,z-d/2-.44],[a,0,z-d/2-.44],[a,17,z-d/2-.44],[b,17,z-d/2-.44],[0,0,-1],23);
    }
  }

  function createAtlas(){
    // A real texture atlas, painted at runtime on a single offscreen canvas.
    // Facade panels have shading, apertures, stone relief and damage; unlike
    // repeating bare boxes they retain human-scale architectural proportions.
    const size=512, W=384,canvas=document.createElement('canvas');
    canvas.width=size*4;canvas.height=size*2;
    const c=canvas.getContext('2d');
    let seed=931241;
    const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const palettes=[
      ['#afa795','#ded5c2','#252b2a','#5e665d','#a89d8a'],
      ['#a46c55','#d9b79d','#302d2b','#526253','#bea083'],
      ['#c4ae7f','#f1d19c','#262f30','#42635b','#d0b791'],
      ['#b18e82','#e6c4b6','#343032','#545f5c','#c8a99b'],
      ['#999787','#d6c9aa','#303734','#5c6965','#beb49d'],
      ['#888981','#c7beb0','#282f34','#4b5b58','#aaa69d'],
      ['#c1b9a7','#eee5d2','#313736','#645443','#ccc3b5'],
      ['#b6a894','#e8d9c2','#2c3335','#5b5f55','#bcae96']
    ];
    function shape(x,y,w,h,color){c.fillStyle=color;c.fillRect(x,y,w,h);}
    function line(x,y,xx,yy,color,width=2){c.strokeStyle=color;c.lineWidth=width;c.beginPath();c.moveTo(x,y);c.lineTo(xx,yy);c.stroke();}
    function windowArch(cx,top,w,h,color){
      const r=w*.5;
      c.beginPath();c.moveTo(cx-w/2,top+r);
      c.arc(cx,top+r,r,Math.PI,Math.PI*2,false);
      c.lineTo(cx+w/2,top+h);c.lineTo(cx-w/2,top+h);c.closePath();
      c.fillStyle=color;c.fill();
    }
    palettes.forEach((p,idx)=>{
      let [wall,trim,glass,shutter,iron]=p;
      const ox=(idx%4)*size,oy=Math.floor(idx/4)*size;
      c.save();c.translate(ox,oy);c.scale(size/W,size/W);c.beginPath();c.rect(0,0,W,W);c.clip();
      const grad=c.createLinearGradient(0,0,W,W);
      grad.addColorStop(0,trim);grad.addColorStop(.24,wall);grad.addColorStop(1,wall);
      c.fillStyle=grad;c.fillRect(0,0,W,W);
      // Grain / masonry wear: narrow marks, water streaks and diffuse stains.
      for(let k=0;k<1900;k++){
        const x=rand()*W,y=rand()*W;
        c.globalAlpha=.03+rand()*.11;
        c.fillStyle=rand()>.44?'#f4ecdb':'#262c29';
        c.fillRect(x,y,1+rand()*8,1+rand()*4);
      }
      c.globalAlpha=1;
      for(let k=0;k<58;k++){
        let x=rand()*W,y=rand()*W;c.globalAlpha=.11;
        for(let step=0;step<3+Math.floor(rand()*7);step++){
          let xx=x+(rand()-.5)*7,yy=y+2+rand()*8;
          line(x,y,xx,yy,'#30332e',.7);x=xx;y=yy;
        }
      }
      c.globalAlpha=1;
      // Render shadow behind every raised string course.
      for(const y of [11,32,145,161,260,273,365]){
        shape(0,y+4,size,5,'rgba(32,35,34,.39)');
        shape(0,y,W,4,trim);shape(0,y,W,1,'#f3e6d1');
      }
      const bays=idx===0||idx===7?5:4;
      const step=W/bays;
      for(let row=0;row<2;row++){
        const top=row===0?53:172,bottom=row===0?138:248;
        for(let i=0;i<bays;i++){
          const cx=(i+.5)*step,w=step*.34,hh=bottom-top;
          // Carved stone surround and shadowed recess, rounded Roman arches.
          windowArch(cx+2,top-7,w+12,hh+10,'rgba(24,23,18,.38)');
          windowArch(cx,top-10,w+11,hh+11,trim);
          windowArch(cx,top,w,hh,glass);
          const g=c.createLinearGradient(cx-w/2,0,cx+w/2,0);
          g.addColorStop(0,'#102e31');g.addColorStop(.39,'#36474a');g.addColorStop(.48,'#869c9a');g.addColorStop(.7,'#293a3d');g.addColorStop(1,glass);
          windowArch(cx,top+4,w-9,hh-8,g);
          line(cx,top+w*.5,cx,bottom-3,trim,3);
          line(cx-w*.45,top+hh*.64,cx+w*.45,top+hh*.64,trim,2);
          if(idx!==0&&idx!==6&&idx!==7){
            for(const side of [-1,1]){
              const xx=side===-1?cx-w*.92:cx+w*.55;
              shape(xx,top+11,w*.38,hh-15,shutter);
              for(let a=0;a<8;a++)line(xx+2,top+16+a*(hh-20)/8,xx+w*.35,top+14+a*(hh-20)/8,'rgba(220,216,188,.4)',1.4);
            }
          }
          // Deep sill and believable balcony wrought metal.
          shape(cx-w*.68,bottom+3,w*1.36,4,'#4c4b43');
          shape(cx-w*.75,bottom+1,w*1.50,3,trim);
          if(row===0&&idx!==5){
            line(cx-w*.75,bottom-17,cx+w*.75,bottom-17,iron,3);
            line(cx-w*.75,bottom+2,cx+w*.75,bottom+2,iron,2.2);
            for(let b=-6;b<=6;b++){
              const x=cx+b*w*.115;
              line(x,bottom-16,x,bottom+2,iron,1.8);
              if(b%2===0){c.beginPath();c.ellipse(x,bottom-8,3,5,0,0,Math.PI*2);c.strokeStyle=iron;c.lineWidth=1.2;c.stroke();}
            }
          }
        }
      }
      for(let i=0;i<bays;i++){
        const cx=(i+.5)*step,wide=step*.67;
        windowArch(cx,276,wide+13,83,trim);
        windowArch(cx,282,wide,73,'#2a2f2b');
        if(i%3===0){
          shape(cx-wide*.39,326,wide*.78,30,shutter);
          line(cx,325,cx,356,iron,1.8);
        }else if(i%3===1){
          for(let k=0;k<9;k++)line(cx-wide*.38,318+k*5,cx+wide*.38,318+k*5,'#51605a',2.3);
        }else{
          const shine=c.createLinearGradient(cx-wide*.5,0,cx+wide*.5,0);
          shine.addColorStop(0,'#213237');shine.addColorStop(.48,'#3c5552');shine.addColorStop(1,'#172629');
          shape(cx-wide*.41,318,wide*.82,37,shine);
          line(cx-wide*.30,321,cx+wide*.25,348,'rgba(171,190,173,.26)',3);
        }
        // Voussoirs: individual shaped blocks follow the arch crest.
        for(let j=0;j<9;j++){
          const angle=Math.PI+j*Math.PI/8,x=cx+(wide*.55)*Math.cos(angle),y=282+(wide*.48)*Math.sin(angle);
          line(x,y,x+Math.cos(angle)*6,y+Math.sin(angle)*6,'rgba(55,53,49,.47)',1);
        }
        shape(cx-wide*.55,358,wide*1.1,5,'#514f43');
      }
      for(const x of [7,W-16]){
        shape(x,28,9,330,trim);
        for(const y of [151,262])shape(x-3,y,14,8,'#ddd0b6');
      }
      c.restore();
    });
    return canvas;
  }

  window.COP_FACADES={building,landmark,manor,createAtlas,version:'0.9'};
})();