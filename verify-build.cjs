const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {BuildModel:M}=require('./dist/build-model.js');
const s=M.seed();
assert.equal(M.visibleRequests(s,'resident').some(r=>r.unit==='201'),false);
assert.equal(M.visibleRequests(s,'resident').some(r=>r.unit==='common'),true);
assert.equal(M.visibleRecords(s,'resident').length,1);
assert.equal(M.visibleRecords(s,'resident').some(r=>r.unit==='201'),false);
assert.equal(M.repeats(s)[0].units.length,3);
assert.throws(()=>M.publish(s,'REC-002'),/검토/);
s.records.find(r=>r.id==='REC-002').reviewed=true;
M.publish(s,'REC-002');
assert.equal(M.visibleRecords(s,'resident').some(r=>r.unit==='201'),false);
assert.equal(M.visibleRecords(s,'resident','201').length,1);
assert.throws(()=>M.transition(s,'REQ-2026-001',3,'','','manager'),/담당자/);
assert.throws(()=>M.transition(s,'REQ-2026-001',3,'담당자','','manager'),/일정/);
assert.throws(()=>M.transition(s,'REQ-2026-001',3,'담당자','2026-11-02','resident'),/관리자/);
M.transition(s,'REQ-2026-001',3,'김 담당','2026-11-02','manager');
assert.equal(s.requests[0].stage,3);
assert.equal(s.notices[0].unit,'302');
assert.throws(()=>M.transition(s,'REQ-2026-001',2,'김 담당','2026-11-02','manager'),/되돌릴/);
assert.throws(()=>M.transition(s,'REQ-2026-001',5,'김 담당','2026-11-02','manager'),/단계/);
const elements=new Map();function el(k){if(!elements.has(k))elements.set(k,{innerHTML:'',textContent:'',value:'',style:{},classList:{add(){},remove(){},toggle(){}},querySelectorAll:()=>[],querySelector:()=>el(k+'sub'),close(){},showModal(){}});return elements.get(k)}
const ctx=vm.createContext({BuildModel:M,document:{querySelector:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem:()=>null,setItem(){}},console,setTimeout,clearTimeout});
vm.runInContext(fs.readFileSync('dist/build.js','utf8'),ctx);
el('#termSelect').value='콘크리트 중성화';
vm.runInContext(`
for(const testRole of ['resident','manager','expert']){
 role=testRole;
 for(const item of menu[role]){page=item[0];render()}
}
if(esc('<img onerror="x">').includes('<img'))throw Error('Unescaped content');
if(csvValue('=1+1').charCodeAt(1)!==39)throw Error('CSV formula injection');
role='resident';page='home';render();
if(recordCards(records()).includes('전문가 원문'))throw Error('Resident sees original expert record');
`,ctx);
assert.ok(elements.get('#content').innerHTML.includes('우리 집 공간 지도'));
assert.ok(!elements.get('#content').innerHTML.includes('外壁'));
console.log('PASS: resident data filters; review/publish gate; multi-unit recurrence; state transitions; all role pages render; HTML and CSV escaping.');
