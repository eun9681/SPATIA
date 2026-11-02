/* Header presentation follows Firebase Auth. This never grants building permissions. */
(function(root){
 'use strict';
 const links=new Set();let started,latest=false,known=false,resolveSession;
 const initialSession=new Promise(resolve=>{resolveSession=resolve});
 function presentation(signedIn){return signedIn?{text:'내 워크스페이스',href:'management.html',state:'signed-in'}:{text:'로그인',href:'login.html',state:'signed-out'}}
 function paint(link,signedIn){const p=presentation(signedIn);link.textContent=p.text;link.href=p.href;link.dataset.authState=p.state;link.setAttribute('aria-label',p.text)}
 function trustedMessage(event,origin,frames){return event.origin===origin&&event.data?.type==='spatia:auth-state'&&typeof event.data.signedIn==='boolean'&&frames.some(frame=>frame.contentWindow===event.source)}
 function updateSession(signedIn){
  latest=!!signedIn;known=true;resolveSession(latest);
  for(const link of links){paint(link,latest);link.dataset.authReady='true'}
 }
 function notify(signedIn,projectId){
  if(projectId!==root.SPATIA_FIREBASE_CONFIG?.projectId)return;
  updateSession(signedIn);
  if(root.parent&&root.parent!==root)root.parent.postMessage({type:'spatia:auth-state',signedIn:!!signedIn},root.location.origin);
 }
 function observe(auth,onAuthStateChanged,update=notify){return onAuthStateChanged(auth,user=>update(!!user,auth.app.options.projectId))}
 function whenReady(){if(known)return Promise.resolve(latest);if(!started)return Promise.resolve(false);return started.then(()=>initialSession).then(()=>latest)}
 function requestShared(proceed,requireLogin,ready=whenReady){return Promise.resolve().then(ready).then(signedIn=>signedIn?proceed():requireLogin())}
 async function start(){
  if(!root.SPATIA_FIREBASE_CONFIG)await import('./firebase-config.js');
  const [App,Auth]=await Promise.all([import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),import('https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js')]);
  const app=App.getApps().find(app=>app.name==='build-intelligence')||App.initializeApp(root.SPATIA_FIREBASE_CONFIG,'build-intelligence');
  const auth=Auth.getAuth(app);await Auth.setPersistence(auth,Auth.browserSessionPersistence);
  observe(auth,Auth.onAuthStateChanged);
 }
 function bind(link){
  links.add(link);paint(link,latest);
  if(!started){
   root.addEventListener('message',event=>{if(trustedMessage(event,root.location.origin,[...root.document.querySelectorAll('.spatia-workspace-frame')]))updateSession(event.data.signedIn)});
   // A failed SDK load leaves a usable link to the login screen, with no fake session.
   started=start().catch(()=>{link.dataset.authUnavailable='true';resolveSession(false)});
  }
  return started;
 }
 const api={presentation,paint,trustedMessage,notify,observe,whenReady,requestShared,bind};
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SpatiaHeaderAuth=api;
})(typeof window==='object'?window:globalThis);
