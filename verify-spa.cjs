const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {destination,address,readAddress}=require('./dist/spa-router.js');
const base='https://spatia.example/app/index.html';
assert.equal(destination('https://other.example/gis.html',base),null);
assert.equal(destination('../gis.html',base),null);
assert.equal(destination('javascript:alert(1)',base),null);
assert.equal(destination('spatia-user-guide.pdf',base),null);
assert.deepEqual(destination('management.html?element=A-302#expert',base),{id:'management',search:'?element=A-302',anchor:'#expert'});
assert.deepEqual(readAddress(address(destination('guide.html#records',base))),{id:'guide',search:'',anchor:'#records'});
assert.equal(address(destination('workspace.html#workspace',base)),'#workspace');
assert.equal(destination('gis.html?embed=1',base).search,'');
assert.equal(destination('cloud.html',base),null);
assert.equal(destination('index.html',base).id,'landing');
assert.equal(destination('workspace.html',base).id,'geo');
assert.equal(readAddress('#/unknown').id,'geo');

// Execute the real shell with a small DOM adapter. No network or Firebase writes.
class Node{
 constructor(tag='div'){this.tag=tag;this.children=[];this.attributes=new Map();this.events={};this.hidden=false;this.style={setProperty(){}};this._classes=new Set();this.classList={contains:c=>this._classes.has(c),toggle:(c,on)=>on?this._classes.add(c):this._classes.delete(c)};}
 append(...nodes){for(const node of nodes){if(node.parent)node.remove();node.parent=this;this.children.push(node)}}
 get firstChild(){return this.children[0]}
 set className(value){this._classes=new Set(value.split(' '))}
 get className(){return [...this._classes].join(' ')}
 setAttribute(k,v){this.attributes.set(k,v)}removeAttribute(k){this.attributes.delete(k)}hasAttribute(k){return this.attributes.has(k)}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn)}
 emit(type,event={}){for(const fn of this.events[type]||[])fn(event)}
 remove(){if(this.parent){this.parent.children.splice(this.parent.children.indexOf(this),1);this.parent=null}}
 getBoundingClientRect(){return{height:86}}
 querySelectorAll(){return []}
 querySelector(){return null}
 scrollIntoView(){this.scrolled=true}
}
const body=new Node('body');body.dataset={page:'geo'};
const main=new Node('main'),header=new Node('header'),footer=new Node('footer'),workspace=new Node('section');
main.append(workspace);body.append(header,main,footer);
const nav=['index','workspace','gis','management'].map(file=>Object.assign(new Node('a'),{href:new URL(file+'.html',base).href}));header.querySelectorAll=()=>nav;
const doc={baseURI:base,title:'SPATIA 홈',body,querySelector:selector=>selector==='main'?main:selector==='.spatia-site-header'?header:selector==='.spatia-site-footer'?footer:null,getElementById:id=>id==='workspace'?workspace:null};
const createdFrames=[];
doc.createElement=tag=>{const node=new Node(tag);if(tag==='iframe'){node.contentWindow={messages:[],postMessage(data,origin){this.messages.push({data,origin})}};node.contentDocument={querySelector:()=>new Node('main')};createdFrames.push(node)}return node};
doc.createTextNode=text=>({textContent:text});doc.events={};doc.addEventListener=Node.prototype.addEventListener;
const root={document:doc,location:{origin:'https://spatia.example',hash:'',search:'',pathname:'/app/index.html'},events:{},addEventListener:Node.prototype.addEventListener,dispatchEvent(event){this.emit(event.type,event)},emit:Node.prototype.emit,scrollTo(){}};
root.parent=root;root.history={pushState(_state,_title,hash){root.location.hash=hash}};
const Event=class{constructor(type){this.type=type}},CustomEvent=class extends Event{constructor(type,options){super(type);this.detail=options.detail}};
vm.runInNewContext(fs.readFileSync('dist/spa-router.js','utf8'),{window:root,URL,URLSearchParams,Event,CustomEvent,ResizeObserver:class{observe(){}},requestAnimationFrame:fn=>fn(),console});
const shell=root.SpatiaNavigation;
assert.ok(shell.open('gis.html'));const gis=createdFrames[0];assert.equal(root.location.hash,'#/gis');assert.ok(footer.hidden);
gis.emit('load');gis.draft='아직 저장하지 않은 좌표';assert.ok(!gis.hidden);
shell.open('guide.html#records');const guide=createdFrames[1];guide.emit('load');assert.ok(gis.hidden);
shell.open('gis.html');assert.equal(createdFrames.length,2);assert.equal(createdFrames[0],gis);assert.equal(gis.draft,'아직 저장하지 않은 좌표');assert.ok(!gis.hidden);
root.location.hash='#/guide#records';root.emit('popstate');assert.ok(!guide.hidden&&gis.hidden);assert.equal(guide.contentWindow.messages.at(-1).data.anchor,'#records');
root.emit('message',{origin:'https://evil.example',source:gis.contentWindow,data:{type:'spatia:navigate',href:new URL('login.html',base).href}});assert.equal(root.location.hash,'#/guide#records');
root.emit('message',{origin:root.location.origin,source:{},data:{type:'spatia:navigate',href:new URL('shared-setup.html',base).href}});assert.equal(createdFrames.length,2);
root.emit('message',{origin:root.location.origin,source:guide.contentWindow,data:{type:'spatia:navigate',href:new URL('management.html#manager',base).href}});assert.equal(root.location.hash,'#/management#manager');
shell.open('workspace.html#workspace');assert.ok(!footer.hidden);assert.ok(workspace.scrolled);assert.equal(body.children[0],header);assert.equal(header.querySelectorAll().length,4);
assert.equal(shell.open('https://other.example/gis.html'),false);

shell.open('index.html');assert.equal(root.location.href,new URL('index.html',base).href);

assert.equal(destination('collaboration.html',base),null);
assert.equal(destination('shared-setup.html',base),null);
shell.open('login.html');assert.equal(root.location.hash,'#/login');

// Every structural polygon now fits inside the illustration's viewBox.
const svg=fs.readFileSync('dist/spatia-building.svg','utf8');const [x,y,w,h]=svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
for(const polygon of svg.matchAll(/<polygon points="([^"]+)"/g))for(const pair of polygon[1].split(/\s+/)){const [px,py]=pair.split(',').map(Number);assert.ok(px>=x&&px<=x+w&&py>=y&&py<=y+h,'Building polygon must not be clipped')}
for(const file of ['index','workspace','gis','management','login','guide'])assert.match(fs.readFileSync('dist/'+file+'.html','utf8'),/ui-shell\.js.*spa-router\.js/);
console.log('PASS: persistent SPA shell; lazy workspace loading; draft retention; back navigation; anchors; trusted-frame messages; unsupported links; complete building illustration. Browser layout QA remains separate.');
