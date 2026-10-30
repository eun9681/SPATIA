const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map();function element(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[],querySelector:()=>element(k+'sub')});return elements.get(k)}
const context=vm.createContext({document:{querySelector:element,querySelectorAll:()=>[],addEventListener(){}},console,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('dist/app.js','utf8'),context);
vm.runInContext(`
if(rooms.length!==24)throw Error('Expected 24 rooms');
for(const r of rooms){if(score(r)<0||score(r)>100||comfort(r)<0||comfort(r)>100)throw Error('Score out of range')}
const normal=findRoute('101','308','shortest');
const accessible=findRoute('101','308','wheelchair');
if(!normal||!accessible)throw Error('Missing multi-floor route');
if(accessible.path.some(k=>k.endsWith('-0')))throw Error('Wheelchair route uses stairs');
if(!accessible.path.includes('c2-5'))throw Error('Missing elevator connection');
if(findRoute('101','203','wheelchair')!==null)throw Error('Narrow doorway should block wheelchair route');
if(!findRoute('101','203','shortest'))throw Error('Normal route should reach narrow doorway');
for(const f of [1,2,3]){floor=f;for(const l of Object.keys(layerInfo)){layer=l;renderMap()}}
renderDetails();renderPriorities();renderMetrics();
console.log('PASS: 24 spaces, bounded scores, 3-floor routing, wheelchair constraints, 8 map layers.');
`,context);
assert.ok(elements.get('#floorMap').innerHTML.includes('308'));
