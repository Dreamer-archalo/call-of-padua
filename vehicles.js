/* Original lightweight procedural vehicle silhouettes for the Padova open-world prototype.
   These are not scans or branded car models. Each body uses sloped glazed faces,
   visible tires, frames, bumpers, mirrors, plates and damage variations. */
(() => {
'use strict';
function build({mesh,quad,box},x,z,angle=0,olive=false,damaged=false){
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const body=olive?[.36,.43,.34]:[.51,.39,.35],paint=olive?[.40,.46,.37]:[.65,.58,.48];
  const glass=[.25,.35,.36],dark=[.18,.20,.20],rubber=[.14,.16,.16],metal=[.59,.59,.54],headlights=[.84,.82,.68];
  const at=(u,y,w)=>[x+cos*u+sin*w,y,z-sin*u+cos*w];
  const face=(a,b,c,d,t,col)=>quad(mesh,at(...a),at(...b),at(...c),at(...d),[0,1,0],t,col,.37);
  const cube=(u,y,w,wu,h,d,t,col)=>{
    const X=u-wu/2,U=u+wu/2,Z=w-d/2,V=w+d/2;
    face([X,y,V],[U,y,V],[U,y+h,V],[X,y+h,V],t,col);
    face([U,y,Z],[X,y,Z],[X,y+h,Z],[U,y+h,Z],t,col);
    face([X,y,Z],[X,y,V],[X,y+h,V],[X,y+h,Z],t,col);
    face([U,y,V],[U,y,Z],[U,y+h,Z],[U,y+h,V],t,col);
    face([X,y+h,Z],[X,y+h,V],[U,y+h,V],[U,y+h,Z],t,col);
  };
  // Wheel cylinders: actual radial geometry oriented across car width (not vertical posts).
  function wheel(sx,zz){
    const side=sx<0?-1:1,u=sx*1.94,cy=.61,r=.61,n=12;
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
      const radial=(uu,angle)=>[uu,cy+Math.sin(angle)*r,zz+Math.cos(angle)*r];
      face(radial(u-side*.23,a),radial(u-side*.23,b),radial(u+side*.13,b),radial(u+side*.13,a),7,rubber);
    }
    for(let i=0;i<n;i++){
      const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
      face([u+side*.14,cy+Math.sin(a)*r,zz+Math.cos(a)*r],
           [u+side*.14,cy+Math.sin(b)*r,zz+Math.cos(b)*r],
           [u+side*.16,cy+Math.sin(b)*r*.49,zz+Math.cos(b)*r*.49],
           [u+side*.16,cy+Math.sin(a)*r*.49,zz+Math.cos(a)*r*.49],7,rubber);
    }
    cube(u+side*.17,cy-.18,zz,.045,.36,.38,7,metal);
  }
  // Lower body with hood and rear cargo, bumper in dark plastic.
  cube(0,.46,0,3.65,.85,6.12,13,body);
  cube(0,1.21,-2.10,3.52,.17,1.8,13,paint);
  cube(0,1.18,2.28,3.45,.23,1.36,13,paint);
  cube(0,.38,-3.13,3.65,.31,.31,7,dark);
  cube(0,.38,3.16,3.65,.31,.31,7,dark);
  // Cabin geometry with raked glass; two side windows on each flank.
  const windshield=[[-1.48,1.46,-1.28],[1.48,1.46,-1.28],[1.31,2.42,-.72],[-1.31,2.42,-.72]];
  const rear=[[-1.32,2.42,1.36],[1.32,2.42,1.36],[1.48,1.46,2.03],[-1.48,1.46,2.03]];
  face(...windshield,8,glass);face(...rear,8,glass);
  face([-1.31,2.42,-.72],[1.31,2.42,-.72],[1.31,2.42,1.36],[-1.31,2.42,1.36],13,body);
  for(const side of [-1,1]){
    // Sloped A/B pillars, detailed doors, handles and mirrors.
    face([side*1.48,1.45,-1.28],[side*1.31,2.38,-.72],[side*1.31,2.38,.31],[side*1.48,1.46,.31],8,glass);
    face([side*1.48,1.46,.40],[side*1.31,2.38,.42],[side*1.31,2.38,1.36],[side*1.48,1.46,2.03],8,glass);
    cube(side*1.50,1.37,.34,.055,.17,.15,7,dark);
    cube(side*1.83,1.69,-.85,.26,.2,.44,7,dark);
    cube(side*1.86,1.03,-.45,.04,.055,.26,7,metal);
    cube(side*1.86,1.02,1.05,.04,.055,.26,7,metal);
    cube(side*1.84,.77,.36,.035,.49,.05,7,metal);
    for(const zz of [-1.91,1.98])wheel(side,zz);
  }
  // Front and rear light clusters, grille, license plate.
  cube(0,.82,-3.09,1.35,.33,.13,7,dark);
  for(const side of [-1,1]){
    cube(side*1.21,.99,-3.085,.57,.19,.11,7,damaged&&side<0?dark:headlights);
    cube(side*1.18,.92,3.092,.49,.18,.11,13,[.79,.32,.23]);
  }
  cube(0,.49,-3.30,.80,.16,.07,5,metal);
  // Damage is localized: split windscreen and dented hood, not random decorative rubble.
  if(damaged){
    face([-.81,1.66,-1.10],[-.25,2.12,-.84],[-.31,2.14,-.83],[-.84,1.72,-1.07],7,metal);
    face([-.36,2.08,-.87],[.20,1.77,-1.10],[.22,1.79,-1.10],[-.34,2.12,-.87],7,metal);
    cube(.81,1.39,-2.23,.88,.055,.59,11,dark);
  }
  // Utility vehicle has meaningful extra cargo rather than a generic green cube.
  if(olive){
    for(const side of [-1,1]){
      cube(side*1.31,2.45,.25,.08,.16,2.3,7,metal);
      cube(side*1.31,2.43,-.94,.11,.10,.25,7,metal);
    }
    cube(0,2.51,1.49,1.18,.23,.65,6,metal);
    cube(.9,1.22,2.64,.31,.42,.44,6,[.42,.37,.26]);
  }
}
window.COP_VEHICLES={build,version:'0.7'};
})();