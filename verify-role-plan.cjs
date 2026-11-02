const assert=require('node:assert/strict');
const {GeoEngine:G}=require('./dist/geo-engine.js');
const {SpatiaBuildingDetail:D}=require('./dist/building-detail.js');
const {SpatiaRolePlan:P}=require('./dist/role-plan.js');
const model=G.seed(),before=JSON.stringify(model);
const opts={unit:'302',selected:'A-302-W01',detail:D,requests:[{element:'A-302-W01',stage:1},{element:'A-101-W01',stage:1},{element:'A-302-W01',stage:4}]};
const svg=P.render(model,opts);
assert.ok(svg.includes('창호·가구는 가상 표현'));
assert.ok(svg.includes('data-model-element="A-302-W01"'));
assert.ok(!svg.includes('data-model-element="A-101-W01"'));
assert.ok(svg.includes('302호 벽체 진행 중 요청 1건'));
assert.ok(!svg.includes('NaN'));
for(const [,coords] of svg.matchAll(/points="([^"]+)"/g))for(const pair of coords.split(' ')){const [x,y]=pair.split(',').map(Number);assert.ok(x>=0&&x<=900&&y>=0&&y<=620)}
assert.notEqual(svg,P.render(model,{...opts,rotation:.4}));
assert.ok(P.render(model,{...opts,view:'2d'}).includes('평면 구조물'));
assert.ok(P.render(model,{...opts,selected:'A-302-C01'}).includes('stroke-dasharray="7 5"'));
const buttons=[...svg.matchAll(/role="button" tabindex="0" aria-label="([^"]+) 구조물 선택"/g)];
assert.equal(buttons.length,5); // one focus stop per visible element, never per face
const imported=JSON.parse(before);imported.buildingId='imported';imported.elements.forEach(e=>e.source='ifc');
assert.ok(!P.render(imported,opts).includes('창호·가구는 가상 표현'));
imported.elements.find(e=>e.id==='A-302-W01').name='<img onerror="bad">';
assert.ok(!P.render(imported,opts).includes('<img'));
assert.equal(JSON.stringify(model),before);
console.log('PASS: unit-scoped selection, request pins, fit bounds, 2D and rotated 3D, accessible object stops, imported-model separation, escaping and unchanged original model.');
