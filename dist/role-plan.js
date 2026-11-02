/* A selectable, display-only unit cutaway. Original model objects stay intact. */
(function(root){
 'use strict';
 const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const ink='#465a8c',accent='#8ca3ff',white='#FFFFFF';
 const names={floor:'바닥',ceiling:'천장',wall:'벽체',column:'기둥',beam:'보',pipe:'배관'};
 const corners=b=>[[0,0,0],[1,0,0],[1,1,0],[0,1,0],[0,0,1],[1,0,1],[1,1,1],[0,1,1]].map(a=>a.map((v,i)=>v?b.max[i]:b.min[i]));
 function elements(model,unit){return model.elements.filter(e=>e.unit===unit||e.unit==='common')}
 function render(model,{unit,selected,view='3d',rotation=-.62,requests=[],detail}={}){
  const list=elements(model,unit);if(!list.length)return'<text x="40" y="60">이 호실의 연결된 구조물이 없습니다.</text>';
  const synthetic=!!detail?.supported(model),min=[0,1,2].map(i=>Math.min(...list.map(e=>e.min[i]))),max=[0,1,2].map(i=>Math.max(...list.map(e=>e.max[i]))),mid=min.map((n,i)=>(n+max[i])/2),floor=list.find(e=>e.type==='floor')?.floor||list[0].floor;
  const decorations=synthetic?detail.context(model).filter(b=>b.floor===floor&&!['roof','solar','site','stairs'].includes(b.kind)&&b.min[0]>=min[0]-.12&&b.max[0]<=max[0]+.12&&b.min[1]>=min[1]-1.2&&b.max[1]<=max[1]+1.4):[];
  const faces=[];
  function project(p){const [x,y,z]=p.map((n,i)=>n-mid[i]);if(view==='2d')return{x,y,depth:z};const xx=x*Math.cos(rotation)-y*Math.sin(rotation),yy=x*Math.sin(rotation)+y*Math.cos(rotation);return{x:xx,y:yy*.54-z*.84,depth:yy*.84+z*.54}}
  function addBox(box,e,decoration){
   const points=corners(box).map(project),ids=view==='2d'?[[4,5,6,7]]:[[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7],[4,5,6,7]];
   for(const side of ids){const polygon=side.map(i=>points[i]);faces.push({e,decoration,points:polygon,depth:polygon.reduce((n,p)=>n+p.depth,0)/polygon.length,top:side[0]===4})}
  }
  for(const e of list){
   // Overhead elements remain selectable in the picker, without hiding the room below.
   if(['ceiling','beam'].includes(e.type)&&e.id!==selected)continue;
   if(e.mesh){for(const tri of e.mesh.faces){const points=tri.map(i=>project(e.mesh.vertices[i]));faces.push({e,points,depth:points.reduce((n,p)=>n+p.depth,0)/points.length,top:true})}continue}
   if(synthetic&&e.type==='pipe'&&view==='3d'){
    const mesh=detail.pipeMesh(e);for(const tri of mesh.faces){const points=tri.map(i=>project(mesh.vertices[i]));faces.push({e,points,depth:points.reduce((n,p)=>n+p.depth,0)/points.length,top:true})}continue;
   }
   const parts=synthetic?detail.parts(e):[e],slice=e.min[2]+1.2;
   for(const part of parts){if(view==='2d'&&e.type==='wall'&&(part.min[2]>slice||part.max[2]<slice))continue;addBox(part,e)}
  }
  for(const b of decorations){
   if(view==='2d'&&['rail','frame','glass'].includes(b.kind))continue;
   if(view==='2d'&&b.kind==='facade'&&b.min[2]>min[2]+1.4)continue;
   addBox(b,null,b);
  }
  const allPoints=faces.flatMap(f=>f.points),extentMin=[Math.min(...allPoints.map(p=>p.x)),Math.min(...allPoints.map(p=>p.y))],extentMax=[Math.max(...allPoints.map(p=>p.x)),Math.max(...allPoints.map(p=>p.y))];
  const scale=Math.min(740/Math.max(.5,extentMax[0]-extentMin[0]),455/Math.max(.5,extentMax[1]-extentMin[1]));
  const ox=(900-(extentMax[0]-extentMin[0])*scale)/2,oy=65+(455-(extentMax[1]-extentMin[1])*scale)/2;
  const screen=p=>[ox+(p.x-extentMin[0])*scale,oy+(p.y-extentMin[1])*scale];
  const polygon=points=>points.map(p=>screen(p).map(n=>n.toFixed(2)).join(',')).join(' ');
  const count=id=>requests.filter(r=>r.element===id&&r.stage<4).length;
  const accessibleElements=new Set();
  const drawFace=f=>{
   if(f.decoration){const b=f.decoration,fill=b.kind==='glass'?'#8ca3ff':b.color,opacity=b.kind==='glass'?.09:b.kind==='facade'?.8:.92;return`<polygon points="${polygon(f.points)}" fill="${fill}" fill-opacity="${opacity}" stroke="${ink}" stroke-opacity=".26" stroke-width=".7" pointer-events="none"/>`}
   const e=f.e,chosen=e.id===selected,overhead=['ceiling','beam'].includes(e.type),slab=e.type==='floor';
   const fill=chosen?accent:e.type==='pipe'?ink:e.type==='column'?ink:f.top?white:'#E9F2E8';
   const opacity=overhead?.06:slab?(chosen?.28:1):chosen?.95:.94;
   const accessible=accessibleElements.has(e.id)?'aria-hidden="true"':`role="button" tabindex="0" aria-label="${esc(e.name)} 구조물 선택" aria-pressed="${chosen}"`;accessibleElements.add(e.id);
   return`<g class="role-structure${chosen?' is-selected':''}" ${accessible} data-model-element="${esc(e.id)}"><title>${esc(e.name)} · ${esc(e.id)} · ${esc(e.material)}</title><polygon points="${polygon(f.points)}" fill="${fill}" fill-opacity="${opacity}" stroke="${ink}" stroke-width="${chosen?2.2:slab?1:1.2}"${overhead?' stroke-dasharray="7 5"':''}/></g>`;
  };
  // The floor is the underlay: a large slab's centroid must not cover furniture.
  faces.sort((a,b)=>(a.e?.type==='floor'?0:1)-(b.e?.type==='floor'?0:1)||a.depth-b.depth);
  const selectedObject=list.find(e=>e.id===selected)||list[0],center=e=>e.min.map((n,i)=>(n+e.max[i])/2),[sx,sy]=screen(project(center(selectedObject)));
  const pins=list.filter(e=>count(e.id)>0).map(e=>{const [x,y]=screen(project(center(e)));return`<g class="role-request-pin" role="button" tabindex="0" data-model-element="${esc(e.id)}" aria-label="${esc(e.name)} 진행 중 요청 ${count(e.id)}건"><circle cx="${x.toFixed(2)}" cy="${(y-18).toFixed(2)}" r="13" fill="${ink}" stroke="white" stroke-width="2"/><text x="${x.toFixed(2)}" y="${(y-14).toFixed(2)}" text-anchor="middle" fill="white" font-size="11" font-weight="650">${count(e.id)}</text></g>`}).join('');
  // Door swings and windows are illustrative details for the synthetic model only.
  let planDetails='';
  if(view==='2d'&&synthetic){const wall=list.find(e=>e.type==='wall'&&!e.direction);if(wall){const axis=wall.max[0]-wall.min[0]>wall.max[1]-wall.min[1]?0:1,length=wall.max[axis]-wall.min[axis],hinge=[...wall.min];hinge[axis]+=length*.25;const p=screen(project(hinge)),radius=length*.27*scale;planDetails=`<path d="M${p[0]},${p[1]}h${radius.toFixed(2)}a${radius.toFixed(2)},${radius.toFixed(2)} 0 0 1-${radius.toFixed(2)},${radius.toFixed(2)}Z" fill="none" stroke="${ink}" stroke-opacity=".55" stroke-width="1.4" pointer-events="none"/>`}}
  return`<defs><pattern id="role-plan-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M24 0H0V24" fill="none" stroke="#465a8c" stroke-opacity=".055" stroke-width=".7"/></pattern></defs><rect width="900" height="620" fill="white"/><rect width="900" height="620" fill="url(#role-plan-grid)"/><ellipse cx="450" cy="535" rx="270" ry="26" fill="#465a8c" fill-opacity=".045"/><text x="32" y="30" font-size="11" fill="${ink}" letter-spacing="1.2">${view==='3d'?'입체 구조물':'평면 구조물'}</text><text x="868" y="30" text-anchor="end" font-size="11" fill="${ink}">${esc(unit)} · ${esc(floor)}F</text>${faces.map(drawFace).join('')}${planDetails}${pins}<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="6" fill="${accent}" stroke="${ink}" stroke-width="2" pointer-events="none"/><text x="450" y="584" text-anchor="middle" font-size="13" fill="${ink}">${esc(selectedObject.name)} · ${esc(selectedObject.id)}</text><text x="450" y="605" text-anchor="middle" font-size="10" fill="${ink}" opacity=".65">${synthetic?'창호·가구는 가상 표현 · 원본 구조물 좌표·ID 유지':'가져온 구조물 형상 · 원본 객체 ID 유지'}</text>`;
 }
 root.SpatiaRolePlan={elements,render};
})(typeof module==='object'?module.exports:globalThis);
