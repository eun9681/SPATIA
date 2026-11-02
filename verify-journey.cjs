const assert=require('node:assert/strict'),fs=require('node:fs');
const J=require('./dist/hero-journey.js'),config=require('./dist/hero-building.json');
const geometry=J.scene(config);assert.ok(geometry.length>100);assert.equal(new Set(geometry.map(f=>f.floor)).size,4);
const start=J.cameraAt(0,1.8,config),turned=J.cameraAt(.4,1.8,config),end=J.cameraAt(1,1.8,config);
assert.ok(Math.abs(start.yaw-turned.yaw)>1,'The building must rotate in 3D before entry');
assert.ok(Math.hypot(...start.eye.map((v,i)=>v-config.focus.eye[i]))>15);
for(let i=0;i<3;i++)assert.ok(Math.abs(end.eye[i]-config.focus.eye[i])<1e-9);
assert.ok(end.eye[0]>5&&end.eye[0]<10&&end.eye[1]>6&&end.eye[1]<9&&end.eye[2]>0&&end.eye[2]<9,'The final camera must be inside unit 302');
assert.equal(start.spread,.42);assert.equal(end.spread,0);assert.equal(end.phase,2);
assert.deepEqual(J.cameraAt(.92,1.8,config).eye,end.eye,'Hold the interior view before the next section scrolls in');
let crossing=null;for(let i=70;i<=1000;i++){const camera=J.cameraAt(i/1000,1.8,config);if(!crossing||Math.abs(camera.eye[2]-config.depth)<Math.abs(crossing.eye[2]-config.depth))crossing=camera}
assert.ok(crossing.eye[1]>6.63&&crossing.eye[1]<8.43,'The camera must enter through the third-floor window instead of the ceiling');
// A crossing polygon stays finite, including when the camera passes the façade.
const clipped=J.clipNear([[-1,-1,-2],[1,-1,2],[1,1,2],[-1,1,-2]]);
assert.equal(clipped.length,4);assert.ok(clipped.every(p=>p[2]>=.14-1e-10&&p.every(Number.isFinite)));
assert.equal(J.clipNear([[0,0,-2],[1,0,-1],[0,1,-1]]).length,0);
for(const aspect of [.45,.8,1.2,1.8,2.5]){
 for(let i=0;i<=100;i++){
  const camera=J.cameraAt(i/100,aspect,config),axes=J.basis(camera);
  assert.ok([...camera.eye,...camera.target,...axes.forward,...axes.right,...axes.up].every(Number.isFinite));
  assert.ok(Math.abs(axes.forward.reduce((n,v,k)=>n+v*axes.right[k],0))<1e-10);
  const before=J.cameraAt(Math.max(0,i/100-.000001),aspect,config),after=J.cameraAt(Math.min(1,i/100+.000001),aspect,config);
  assert.ok(Math.hypot(...after.eye.map((v,k)=>v-before.eye[k]))<.001,'The camera path must have no position jumps');
  for(const face of geometry){const points=J.clipNear(face.points.map(p=>J.cameraPoint([p[0],p[1]+face.floor*camera.spread,p[2]],camera,axes)));assert.ok(points.flat().every(Number.isFinite))}
 }
}
const html=fs.readFileSync('dist/index.html','utf8'),css=fs.readFileSync('dist/design-system/vellum.css','utf8');
assert.match(html,/class="landing-building-svg"/);
assert.equal((html.match(/class="landing-floor" data-floor=/g)||[]).length,4);
assert.match(css,/landing-floor-breathe 8s/);
assert.match(css,/@keyframes landing-floor-breathe/);
assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
assert.doesNotMatch(html,/landing-motion-toggle|hero-journey\.js/);
console.log('PASS: current four-floor landing animation, eight-second loop and reduced-motion fallback; retained 3D camera geometry, continuity and near-plane clipping across five aspect ratios.');
