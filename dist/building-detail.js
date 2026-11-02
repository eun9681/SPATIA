/* Display-only architecture. Analysis coordinates, IDs and IFC meshes stay unchanged. */
(function(root){
 'use strict';
 const white='#FFFFFF',green='#133215',accent='#81C784',contextCache=new WeakMap();
 function supported(model){return model.buildingId==='forest-a-demo'&&model.elements.every(e=>e.source==='synthetic')}
 function parts(e){
  if(e.type!=='wall')return[e];
  const size=e.max.map((n,i)=>n-e.min[i]),axis=size[0]>size[1]?0:1,length=size[axis],height=size[2];
  if(length<2||height<2)return[e];
  const outdoor=!!e.direction,start=length*(outdoor?.2:.25),end=length*(outdoor?.8:.52),bottom=outdoor?.85:0,top=Math.min(height-.2,2.15);
  const out=[];
  function segment(a,b,z0,z1){if(b-a<.01||z1-z0<.01)return;const min=[...e.min],max=[...e.max];min[axis]+=a;max[axis]=e.min[axis]+b;min[2]+=z0;max[2]=e.min[2]+z1;out.push({min,max})}
  segment(0,start,0,height);segment(end,length,0,height);segment(start,end,0,bottom);segment(start,end,top,height);
  return out;
 }
 function pipeMesh(e){
  const sides=10,vertices=[],faces=[],cx=(e.min[0]+e.max[0])/2,cy=(e.min[1]+e.max[1])/2,rx=(e.max[0]-e.min[0])/2,ry=(e.max[1]-e.min[1])/2;
  for(const z of [e.min[2],e.max[2]])for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2;vertices.push([cx+Math.cos(a)*rx,cy+Math.sin(a)*ry,z])}
  for(let i=0;i<sides;i++){const j=(i+1)%sides;faces.push([i,j,j+sides],[i,j+sides,i+sides]);if(i>0&&i<sides-1)faces.push([0,j,i],[sides,i+sides,j+sides])}
  return{vertices,faces};
 }
 function context(model){
  if(!supported(model))return[];
  if(contextCache.has(model))return contextCache.get(model);
  const out=[],slabs=model.elements.filter(e=>e.type==='floor'),floors=[...new Set(slabs.map(e=>e.floor))].sort((a,b)=>a-b);
  function box(x,y,z,w,d,h,floor,color=white,kind='facade',alpha=.9){out.push({min:[x,y,z],max:[x+w,y+d,z+h],floor,color,kind,alpha})}
  const minX=Math.min(...slabs.map(e=>e.min[0])),maxX=Math.max(...slabs.map(e=>e.max[0])),maxY=Math.max(...slabs.map(e=>e.max[1]));
  for(const s of slabs){
   const [x,y,z]=s.min,w=s.max[0]-x,d=s.max[1]-y,f=s.floor,unit=s.unit;
   // Solid wall bands surround the window opening, with recessed frames and balcony rails.
   box(x,y-.16,z+.2,w,.16,.65,f);
   box(x,y-.16,z+2.55,w,.16,.34,f);
   for(const dx of [0,w-.32])box(x+dx,y-.16,z+.85,.32,.16,1.7,f);
   for(const dx of [.35,w/2,w-.4])box(x+dx,y-.2,z+.86,.055,.12,1.68,f,green,'frame');
   for(const dz of [.86,2.5])box(x+.35,y-.2,z+dz,w-.7,.12,.055,f,green,'frame');
   box(x+.4,y-.13,z+.92,w-.8,.025,1.5,f,green,'glass',.09);
   box(x-.05,y-1.05,z+.04,w+.1,1.05,.13,f,white,'balcony');
   box(x+.2,y-1,z+1.17,w-.4,.055,.055,f,green,'rail');
   for(const dx of [.2,w/2,w-.25])box(x+dx,y-1,z+.2,.05,.05,.98,f,green,'rail');
   // A back corridor ties all three homes into one connected building.
   box(x,y+d,z+.05,w,1.3,.16,f,white,'corridor');
   box(x+w-.95,y+d-.04,z+.2,.85,.08,2.12,f,green,'door');
   box(x+w-.82,y+d+.05,z+1,.06,.06,.12,f,accent,'door');
   for(const dx of [.3,w-.35])box(x+dx,y+d+1.15,z+.2,.05,.05,1.1,f,green,'rail');
   box(x+.3,y+d+1.15,z+1.27,w-.6,.05,.05,f,green,'rail');
   // Furniture and service fittings are contextual only, never additional inspection objects.
   box(x+.45,y+1.1,z+.25,1.1,2.1,.38,f,accent,'furniture',.75);
   box(x+.4,y+1.1,z+.6,.2,2.1,.55,f,green,'furniture',.7);
   box(x+4.05,y+2.6,z+.95,1.6,1.1,.09,f,white,'furniture');
   for(const dx of [4.1,5.45])for(const dy of [2.65,3.5])box(x+dx,y+dy,z+.2,.065,.065,.75,f,green,'furniture');
   box(x+.4,y+d-1,z+.2,2.2,.55,.85,f,white,'furniture');
   box(x+.35,y+d-1.05,z+1.05,2.3,.65,.07,f,green,'furniture');
   box(x+w-1.3,y+.35,z+.2,.55,.55,.42,f,white,'planter');
   box(x+w-1.2,y+.45,z+.62,.35,.35,.55,f,accent,'planter');
   if(f===floors.at(-1)){
    box(x-.08,y-.15,z+3.05,w+.16,d+.3,.18,f,white,'roof',.76);
    box(x-.08,y-.15,z+3.23,w+.16,.12,.34,f,white,'roof');
    for(let i=0;i<3;i++)box(x+.9+i*2,y+2,z+3.25,1.6,2.1,.1,f,green,'solar');
   }
  }
  for(const f of floors){
   const row=slabs.filter(s=>s.floor===f).sort((a,b)=>a.min[0]-b.min[0]),z=row[0].min[2];
   box(minX,maxY,z+.05,maxX-minX,1.3,.16,f,white,'corridor');
   for(let n=0;n<row.length-1;n++){
    const x=row[n].max[0],gap=row[n+1].min[0]-x;
    if(gap>.8&&f!==floors.at(-1))for(let step=0;step<12;step++)box(x+.12,maxY-3.7+step*.28,z+.2+step*.24,gap-.24,.3,.14,f,white,'stairs');
   }
  }
  const bottom=floors[0],z=Math.min(...slabs.map(e=>e.min[2]));
  box(minX-.8,-1.5,z-.22,maxX-minX+1.6,maxY+3.5,.18,bottom,white,'site');
  for(const x of [minX-.5,maxX-.5]){box(x,-1.8,z,.8,.7,.35,bottom,white,'planter');box(x+.1,-1.7,z+.35,.6,.5,.55,bottom,accent,'planter')}
  contextCache.set(model,out);return out;
 }
 root.SpatiaBuildingDetail={supported,parts,pipeMesh,context};
})(typeof module==='object'?module.exports:globalThis);
