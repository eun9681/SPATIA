const fs=require('node:fs'),path=require('node:path');
const J=require('../dist/hero-journey.js'),config=require('../dist/hero-building.json');
const camera=J.cameraAt(0,1.6,config),axes=J.basis(camera),subtract=(a,b)=>a.map((n,i)=>n-b[i]),dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
const faces=J.scene(config).filter(f=>dot(f.normal,subtract(camera.eye,f.center))>0).map(face=>{
 const points=face.points.map(p=>J.cameraPoint([p[0],p[1]+face.floor*camera.spread,p[2]],camera,axes)).map(p=>[p[0]/p[2],-p[1]/p[2]]);
 return{face,points,z:face.points.reduce((n,p)=>n+J.cameraPoint(p,camera,axes)[2],0)/face.points.length};
}).sort((a,b)=>b.z-a.z);
const points=faces.flatMap(f=>f.points),min=[0,1].map(i=>Math.min(...points.map(p=>p[i]))),max=[0,1].map(i=>Math.max(...points.map(p=>p[i]))),scale=Math.min(836/(max[0]-min[0]),586/(max[1]-min[1]));
const offset=[(900-(max[0]-min[0])*scale)/2,(650-(max[1]-min[1])*scale)/2];
function tint(hex,factor){const n=parseInt(hex.slice(1),16);return'#'+[n>>16,(n>>8)&255,n&255].map(v=>Math.round(v*factor).toString(16).padStart(2,'0')).join('')}
const svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 650" fill="none"><title>발코니·창틀·옥상 설비를 갖춘 가상 포레스트 레지던스</title>'+faces.map(({face,points})=>'<polygon points="'+points.map(p=>p.map((v,i)=>(offset[i]+(v-min[i])*scale).toFixed(2)).join(',')).join(' ')+'" fill="'+tint(face.color,face.shade)+'" fill-opacity="'+(face.kind==='glass'?'.23':'1')+'" stroke="#133215" stroke-opacity=".14" stroke-width=".55"/>').join('')+'</svg>\n';
fs.writeFileSync(path.resolve(__dirname,'../dist/spatia-building.svg'),svg);
console.log('Generated detailed SVG fallback from the live 3D geometry: '+faces.length+' visible faces.');
