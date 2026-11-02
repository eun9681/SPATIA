import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,setPersistence,browserSessionPersistence,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
const $=s=>document.querySelector(s),auth=getAuth(initializeApp(SPATIA_FIREBASE_CONFIG,'build-intelligence'));
const status=(text,bad=false)=>{$('#sharedStatus').textContent=text;$('#sharedStatus').className='status'+(bad?' error':'')};
let busy=false,user=null;
function controls(){for(const id of ['sharedLogin','sharedRegister'])$('#'+id).disabled=busy||!!user;$('#sharedLogout').disabled=busy||!user}
try{
 await setPersistence(auth,browserSessionPersistence);
 onAuthStateChanged(auth,u=>{user=u;controls();$('#sharedPassword').value='';$('#sharedAccount').textContent=u?u.email+' · 로그인됨':'로그인 전';globalThis.SpatiaHeaderAuth?.notify(!!u,SPATIA_FIREBASE_CONFIG.projectId);status(u?'로그인되었습니다.':'')});
 async function action(fn){if(busy)return;busy=true;controls();try{await fn()}catch(e){status(e.code==='auth/invalid-credential'?'이메일 또는 비밀번호를 확인하세요.':e.code==='auth/email-already-in-use'?'이미 등록된 이메일입니다. 로그인해 주세요.':e.code==='auth/weak-password'?'비밀번호는 6자 이상 입력하세요.':'로그인 설정·네트워크·계정 상태를 확인하세요.',true)}finally{busy=false;controls()}}
 $('#sharedAuth').onsubmit=e=>{e.preventDefault();const register=e.submitter?.id==='sharedRegister';action(()=> (register?createUserWithEmailAndPassword:signInWithEmailAndPassword)(auth,$('#sharedEmail').value.trim(),$('#sharedPassword').value))};
 $('#sharedLogout').onclick=()=>action(()=>signOut(auth));
}catch{status('로그인을 시작하지 못했습니다. 네트워크 설정을 확인하고 새로고침하세요.',true)}
