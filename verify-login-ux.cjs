const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
(async()=>{
 const fields=new Map();let focused,observer,resolveRequest;const calls=[];
 function el(selector){if(!fields.has(selector))fields.set(selector,{value:'',hidden:false,disabled:false,textContent:'',attributes:{},validity:{typeMismatch:false},setAttribute(k,v){this.attributes[k]=v},getAttribute(k){return this.attributes[k]},removeAttribute(k){delete this.attributes[k]},addEventListener(){},focus(){focused=selector}});return fields.get(selector)}
 const ctx=vm.createContext({document:{querySelector:el},SPATIA_FIREBASE_CONFIG:{projectId:'local-test'},initializeApp:()=>({}),getAuth:()=>({}),setPersistence:async()=>{},browserSessionPersistence:{},onAuthStateChanged:(_auth,fn)=>{observer=fn;fn(null)},signInWithEmailAndPassword:async()=>calls.push('login'),createUserWithEmailAndPassword:()=>{calls.push('register');return new Promise(resolve=>{resolveRequest=resolve})},signOut:async()=>observer(null)});
 const source=fs.readFileSync('dist/login.js','utf8').replace(/^\uFEFF/,'').replace(/^import .*$/gm,'');await vm.runInContext('(async()=>{'+source+'})()',ctx);
 assert.equal(el('#sharedLogin').hidden,false);assert.equal(el('#sharedRegister').hidden,true);
 el('#sharedAuth').onsubmit({preventDefault(){}});assert.equal(calls.length,0);assert.equal(focused,'#sharedEmail');assert.equal(el('#sharedEmail').getAttribute('aria-invalid'),'true');
 el('#sharedMode').onclick();assert.equal(el('#authTitle').textContent,'계정 만들기');assert.equal(el('#sharedRegister').hidden,false);assert.equal(el('#sharedLogin').hidden,true);assert.equal(el('#sharedPassword').autocomplete,'new-password');
 el('#sharedEmail').value='test@example.com';el('#sharedPassword').value='abc';el('#sharedAuth').onsubmit({preventDefault(){}});assert.equal(calls.length,0);assert.match(el('#sharedPassword-error').textContent,/6자/);
 el('#sharedPassword').value='abcdef';el('#sharedAuth').onsubmit({preventDefault(){}});assert.deepEqual(calls,['register']);assert.equal(el('#sharedRegister').disabled,true);
 el('#sharedAuth').onsubmit({preventDefault(){}});assert.equal(calls.length,1,'Busy submit must not create a second request');
 observer({email:'test@example.com'});resolveRequest();await new Promise(resolve=>setImmediate(resolve));assert.equal(el('#sharedAuth').hidden,true);assert.equal(el('#accountActions').hidden,false);assert.equal(el('#sharedPassword').value,'');
 await el('#sharedLogout').onclick();await new Promise(resolve=>setImmediate(resolve));assert.equal(el('#sharedLogin').hidden,false);assert.equal(el('#sharedAuth').hidden,false);
 console.log('PASS: distinct login/signup actions; inline field errors; signup length validation; no duplicate request; account state and sign-out; no real Firebase calls.');
})().catch(e=>{console.error(e);process.exitCode=1});
