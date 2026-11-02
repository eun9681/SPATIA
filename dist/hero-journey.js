/* A scroll-driven camera through actual 3D faces, rendered without a runtime dependency. */
(function(root){
 'use strict';
 const clamp=(n,a=0,b=1)=>Math.min(b,Math.max(a,n));
 const smooth=(a,b,n)=>{const t=clamp((n-a)/(b-a));return t*t*(3-2*t)};
 const mix=(a,b,t)=>a+(b-a)*t,lerp=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
 const subtract=(a,b)=>a.map((v,i)=>v-b[i]),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const normal=v=>{const length=Math.hypot(...v)||1;return v.map(n=>n/length)};
 const timeline=progress=>clamp(progress/.88);
 function cameraAt(progress,aspect,config){
  const p=timeline(progress),orbit=smooth(0,.49,p),entry=smooth(.43,1,p),align=smooth(.38,.72,p);
  const yaw=mix(mix(.78,-.62,orbit),0,align);
  const radius=aspect<1.3?49:31;
  const target=lerp([config.width/2,config.storey*1.65,config.depth/2],config.focus.lookAt,entry);
  const outside=[target[0]+Math.sin(yaw)*radius,target[1]+radius*.49,target[2]+Math.cos(yaw)*radius];
  const eye=lerp(outside,config.focus.eye,entry);
  // Reach window height before crossing the façade; do not pass through the floor slab.
  eye[1]=mix(outside[1],config.focus.eye[1],smooth(.4,.83,p));
  return{eye,target,yaw,entry,spread:.42*(1-smooth(.18,.62,p)),centerX:mix(aspect>1.3?.67:.5,.5,smooth(.08,.65,p)),centerY:mix(aspect<1.3?.67:.53,.53,entry),phase:p<.35?0:p<.9?1:2};
 }
 function basis(camera){const forward=normal(subtract(camera.target,camera.eye)),right=normal(cross(forward,[0,1,0])),up=cross(right,forward);return{forward,right,up}}
 function cameraPoint(point,camera,axes){const v=subtract(point,camera.eye);return[dot(v,axes.right),dot(v,axes.up),dot(v,axes.forward)]}
 function clipNear(points,near=.14){
  const out=[];for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],insideA=a[2]>=near,insideB=b[2]>=near;if(insideA)out.push(a);if(insideA!==insideB)out.push(lerp(a,b,(near-a[2])/(b[2]-a[2])))}return out;
 }
 function scene(config){
  const faces=[],c=config.palette,w=config.width,d=config.depth,h=config.storey;
  function box(x,y,z,sx,sy,sz,color,floor,kind='solid'){
   const vertices=[[x,y,z],[x+sx,y,z],[x+sx,y+sy,z],[x,y+sy,z],[x,y,z+sz],[x+sx,y,z+sz],[x+sx,y+sy,z+sz],[x,y+sy,z+sz]];
   const sides=[[[0,3,2,1],[0,0,-1],.78],[[4,5,6,7],[0,0,1],.94],[[0,4,7,3],[-1,0,0],.86],[[1,2,6,5],[1,0,0],.9],[[3,7,6,2],[0,1,0],1],[[0,1,5,4],[0,-1,0],.7]];
   for(const [ids,n,shade]of sides)faces.push({points:ids.map(i=>vertices[i]),normal:n,center:[x+sx/2,y+sy/2,z+sz/2],color,shade,floor,kind});
  }
  // A stepped forecourt, planted edges and the entrance give the building a ground level.
  box(-1,-.38,-.8,w+2,.2,d+3.2,c.wall,0,'site');
  box(w/2-1.1,-.17,d+.7,2.2,.07,3,c.paper,0,'site');
  for(let i=0;i<3;i++)box(w/2-1.4,-.14+i*.045,d+.35-i*.18,2.8,.045,.5,c.paper,0,'site');
  for(const x of [-.5,w-.45]){
   box(x,-.16,d+.45,.85,.32,1.4,c.paper,0,'site');
   box(x+.1,.15,d+.55,.65,.4,1.2,c.olive,0,'site');
  }
  for(let f=0;f<config.floors;f++){
   const y=f*h,accent=f===config.focus.floor-1?c.orange:c.wall;
   box(-.2,y-.18,-.2,w+.4,.18,d+.4,c.paper,f,'slab');
   box(0,y,0,w,2.62,.14,c.paper,f);
   box(0,y,0,.15,2.62,d,c.wall,f);
   box(w-.15,y,0,.15,2.62,d,c.wall,f);
   box(0,y,d-.15,w,.58,.15,accent,f,'facade');
   box(0,y+2.48,d-.15,w,.18,.15,accent,f,'facade');
   for(let unit=0;unit<config.unitsPerFloor;unit++){
    const x=unit*w/config.unitsPerFloor;
    if(unit)box(x,y,.1,.12,2.62,d-.25,c.paper,f);
    box(x,y,d-.23,.15,2.62,.23,accent,f,'facade');
    const uw=w/config.unitsPerFloor;
    box(x+.17,y+.63,d-.13,uw-.34,1.8,.025,c.glass,f,'glass');
    // Recessed glazing, actual frame members and a projecting balcony.
    for(const dx of [.15,uw/3,uw*2/3,uw-.2])box(x+dx,y+.57,d-.19,.055,1.96,.1,c.teal,f,'frame');
    for(const dy of [.57,2.48])box(x+.15,y+dy,d-.19,uw-.3,.055,.1,c.teal,f,'frame');
    box(x+.12,y-.1,d-.1,uw-.24,.14,1.05,c.paper,f,'balcony');
    box(x+.2,y+1.08,d+.8,uw-.4,.055,.055,c.teal,f,'rail');
    for(const dx of [.2,uw/2,uw-.25])box(x+dx,y+.12,d+.8,.045,.96,.045,c.teal,f,'rail');
    box(x+.2,y+.18,d+.8,uw-.4,.84,.018,c.glass,f,'glass');
    // A furnished living/dining space remains visible as the camera enters 302.
    box(x+.35,y+.025,1.25,uw-.8,.025,4.15,c.paper,f,'interior');
    box(x+.3,y+.23,1.45,1.05,.3,2.2,c.olive,f,'interior');
    box(x+.3,y+.5,1.45,.18,.58,2.2,c.olive,f,'interior');
    for(const dz of [1.65,2.65])box(x+.5,y+.52,dz,.7,.12,.8,c.orange,f,'interior');
    box(x+2.25,y+.77,2.25,1.5,.1,1.05,c.paper,f,'interior');
    for(const dx of [2.35,3.5])for(const dz of [2.35,3.1])box(x+dx,y,dz,.07,.77,.07,c.teal,f,'interior');
    box(x+2.65,y+.42,3.65,.6,.12,.6,c.olive,f,'interior');
    box(x+2.65,y+.53,4.16,.6,.57,.08,c.olive,f,'interior');
    box(x+1.6,y+.38,4.1,.9,.08,.62,c.gold,f,'interior');
    box(x+1.94,y,4.33,.15,.38,.15,c.teal,f,'interior');
    box(x+.5,y,.22,3.15,.86,.55,c.paper,f,'interior');
    box(x+.45,y+.86,.18,3.25,.07,.65,c.teal,f,'interior');
    for(const dx of [.55,1.6,2.65])box(x+dx,y+.1,.8,.95,.65,.025,c.wall,f,'interior');
    box(x+.65,y+1.45,.16,1.35,.65,.06,c.orange,f,'detail');
    box(x+2.88,y+2.05,2.68,.06,.45,.06,c.teal,f,'interior');
    box(x+2.65,y+2.03,2.45,.52,.06,.52,c.paper,f,'interior');
    box(x+4.05,y,.6,.48,.5,.48,c.paper,f,'interior');
    box(x+4.17,y+.45,.73,.1,.8,.1,c.olive,f,'interior');
    box(x+3.94,y+.85,.55,.55,.45,.45,c.olive,f,'interior');
   }
   // End-wall windows and horizontal floor reveals break up the blank side elevation.
   for(const z of [1.2,4.1,7]){
    box(w,y+.85,z,.028,1.18,1.25,c.teal,f,'frame');
    box(w+.03,y+.93,z+.08,.025,1.02,1.09,c.glass,f,'glass');
   }
   box(-.04,y+2.72,-.04,w+.08,.075,d+.08,c.wall,f,'facade');
  }
  // A complete roof reads as architecture from outside, then fades for the cutaway journey.
  const roof=config.floors*h,top=config.floors-1;
  box(-.22,roof-.2,-.22,w+.44,.2,d+.44,c.paper,top,'roof');
  for(const z of [-.12,d-.04])box(-.12,roof,z,w+.24,.4,.12,c.paper,top,'roof');
  for(const x of [-.12,w])box(x,roof,0,.12,.4,d,c.paper,top,'roof');
  box(.7,roof,.6,2.5,1.05,2.3,c.wall,top,'roof');
  box(.58,roof+1.05,.48,2.74,.12,2.54,c.paper,top,'roof');
  for(let i=0;i<4;i++)box(5.1+i*1.7,roof+.14,1.3,1.4,.1,2.2,c.teal,top,'roof');
  for(let i=0;i<3;i++){
   box(5.2+i*2.6,roof,6.6,2,.28,1.15,c.paper,top,'roof');
   box(5.35+i*2.6,roof+.28,6.75,1.7,.3,.85,c.olive,top,'roof');
  }
  box(w/2-1.65,2.4,d-.1,3.3,.16,1.45,c.paper,0,'canopy');
  box(w/2-.75,0,d-.23,1.5,2.35,.08,c.teal,0,'entry');
  box(w/2-.63,.15,d-.14,1.26,2.05,.028,c.glass,0,'glass');
  return faces;
 }
 function tint(hex,factor){const n=parseInt(hex.slice(1),16);return 'rgb('+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*factor)).join(',')+')'}
 const api={cameraAt,basis,cameraPoint,clipNear,scene,smooth};
 if(typeof module==='object'&&module.exports){module.exports=api;return}
 const doc=root.document,section=doc.querySelector('.spatia-journey'),stage=doc.querySelector('.spatia-hero'),canvas=doc.getElementById('journeyCanvas');if(!section||!canvas)return;
 const context=canvas.getContext('2d',{alpha:true});if(!context)return;
 const reduced=root.matchMedia('(prefers-reduced-motion: reduce)');
 let config,faces,width=0,height=0,targetProgress=0,progress=0,raf=0,visible=true;
 function draw(p){
  const motion=timeline(p);
  const camera=cameraAt(p,width/height,config),axes=basis(camera),focal=height/(2*Math.tan(23*Math.PI/180)),cx=width*camera.centerX,cy=height*camera.centerY;
  stage.dataset.layout=width/height>1.3?'wide':'compact';
  context.clearRect(0,0,width,height);
  const gridOpacity=.24*(1-camera.entry);context.strokeStyle='rgba(255,255,255,'+gridOpacity+')';context.lineWidth=.7;
  function project(point){const v=cameraPoint(point,camera,axes);return v[2]>.14?[cx+v[0]*focal/v[2],cy-v[1]*focal/v[2]]:null}
  for(let i=-8;i<=24;i+=2){for(const pair of [[[i,-.23,-7],[i,-.23,24]],[[-8,-.23,i],[24,-.23,i]]]){const clipped=clipNear(pair.map(point=>cameraPoint(point,camera,axes)));if(clipped.length<2)continue;context.beginPath();clipped.slice(0,2).forEach((v,index)=>context[index?'lineTo':'moveTo'](cx+v[0]*focal/v[2],cy-v[1]*focal/v[2]));context.stroke()}}
  const painted=[];
  for(const face of faces){
   const offset=face.floor*camera.spread,center=[face.center[0],face.center[1]+offset,face.center[2]];
   if(dot(face.normal,subtract(camera.eye,center))<=0)continue;
   let opacity=face.kind==='glass'?.23*(1-smooth(.42,.73,motion)):1;
   if(face.kind==='roof')opacity*=1-smooth(.2,.57,motion);
   if(['rail','frame','canopy'].includes(face.kind))opacity*=1-smooth(.43,.76,motion);
   if(face.kind==='site')opacity*=1-smooth(.5,.82,motion);
   if(opacity<.005)continue;
   const points=clipNear(face.points.map(point=>cameraPoint([point[0],point[1]+offset,point[2]],camera,axes)));if(points.length<3)continue;
   painted.push({face,points,opacity,z:points.reduce((n,v)=>n+v[2],0)/points.length});
  }
  painted.sort((a,b)=>b.z-a.z);
  for(const {face,points,opacity}of painted){
   context.globalAlpha=opacity;context.beginPath();points.forEach((v,index)=>context[index?'lineTo':'moveTo'](cx+v[0]*focal/v[2],cy-v[1]*focal/v[2]));context.closePath();context.fillStyle=tint(face.color,face.shade);context.fill();context.strokeStyle=face.kind==='glass'?'rgba(255,255,255,.25)':'rgba(19,50,21,.14)';context.lineWidth=.6;context.stroke();
  }
  context.globalAlpha=1;
  const marker=project([7.5,7.05+2*camera.spread,9.02]);
  if(marker&&motion<.65){context.globalAlpha=1-smooth(.35,.65,motion);context.fillStyle=config.palette.gold;context.beginPath();context.arc(marker[0],marker[1],4,0,Math.PI*2);context.fill();context.globalAlpha=1}
  stage.style.setProperty('--journey-copy-opacity',String(1-smooth(.06,.3,motion)));
  stage.style.setProperty('--journey-copy-shift',(-32*smooth(.06,.3,motion)).toFixed(2)+'px');
  stage.style.setProperty('--journey-inside-opacity',String(smooth(.9,.985,motion)));
  stage.style.setProperty('--journey-progress',(p*100).toFixed(2)+'%');
  stage.dataset.motion=camera.phase===2?'inside':camera.phase===1?'entering':'orbit';
  const copy=doc.querySelector('.spatia-hero-copy'),room=doc.querySelector('.journey-room');copy.inert=motion>=.3;room.inert=camera.phase!==2;room.setAttribute('aria-hidden',String(camera.phase!==2));
 }
 function tick(){
  raf=0;if(!config||!visible||doc.hidden||section.closest('[hidden]'))return;
  progress=reduced.matches?0:Math.abs(targetProgress-progress)<.0005?targetProgress:mix(progress,targetProgress,.16);draw(progress);
  if(Math.abs(targetProgress-progress)>.0005&&!reduced.matches)raf=requestAnimationFrame(tick);
 }
 function schedule(){if(!raf)raf=requestAnimationFrame(tick)}
 function measure(){
  if(section.closest('[hidden]'))return;
  const rect=stage.getBoundingClientRect();width=rect.width;height=rect.height;if(!width||!height)return;
  const ratio=Math.min(root.devicePixelRatio||1,1.8);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);context.setTransform(ratio,0,0,ratio,0,0);update();
 }
 function update(){
  if(section.closest('[hidden]'))return;
  const rect=section.getBoundingClientRect(),top=parseFloat(getComputedStyle(stage).top)||0;
  visible=rect.bottom>top&&rect.top<root.innerHeight;
  targetProgress=reduced.matches?0:clamp((top-rect.top)/Math.max(1,section.offsetHeight-stage.offsetHeight));
  if(visible)schedule();
 }
 root.addEventListener('scroll',update,{passive:true});root.addEventListener('resize',measure);root.addEventListener('spatia:activate',()=>requestAnimationFrame(measure));root.addEventListener('pageshow',measure);doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)update()});reduced.addEventListener('change',measure);
 new ResizeObserver(measure).observe(stage);
 fetch(new URL('hero-building.json',doc.baseURI)).then(response=>{if(!response.ok)throw Error('Scene unavailable');return response.json()}).then(data=>{
  if(!Number.isFinite(data.width)||!data.focus||data.floors!==4)throw Error('Invalid scene');config=data;faces=scene(config);stage.dataset.scene='ready';measure();
 }).catch(()=>{stage.dataset.scene='fallback';doc.getElementById('journeyPhase').textContent='건물 콘셉트 이미지 · 공간 분석으로 바로 이동할 수 있습니다.'});
})(typeof window==='object'?window:globalThis);
