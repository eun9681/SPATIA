const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),{GeoEngine:G}=require('./dist/geo-engine.js');
const elements=new Map(),ctx2d=new Proxy({},{get:(o,k)=>o[k]||(()=>{}),set:(o,k,v)=>(o[k]=v,true)});
function el(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:k==='#typeFilter'?'all':'',style:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[],querySelector:()=>el(k+' child'),getContext:()=>ctx2d,getBoundingClientRect:()=>({left:0,top:0,width:700,height:440}),setPointerCapture(){},close(){},showModal(){this.open=true}});return elements.get(k)}
const ctx=vm.createContext({GeoEngine:G,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{devicePixelRatio:1,addEventListener(){}},ResizeObserver:class{observe(){}disconnect(){}},localStorage:{getItem:()=>null,setItem(){}},console,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('dist/geo-app.js','utf8'),ctx);
vm.runInContext(`
for(const key of Object.keys(tabNames)){tab=key;render()}
tab='twin';render();
$('#regionMode').onclick();
const canvas=$('#modelCanvas');
canvas.onpointerdown({clientX:0,clientY:0,pointerId:1});
canvas.onpointermove({clientX:700,clientY:440});
canvas.onpointerup({clientX:700,clientY:440});
if(!$('#dialogContent').innerHTML.includes('21개'))throw Error('Region selection should cover 21 floor elements');
if(esc('<script>').includes('<script>'))throw Error('HTML escaping failed');
`,ctx);
assert.ok(elements.get('#dialogContent').innerHTML.includes('A-302-C01'));
console.log('PASS: all six analytical pages render; 3D canvas projection; drag rectangle selects the expected 21 floor elements; escaped output.');
