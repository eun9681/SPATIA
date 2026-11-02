import {initializeApp} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js';
import {getAuth,setPersistence,browserSessionPersistence,onAuthStateChanged,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js';
const $=s=>document.querySelector(s),auth=getAuth(initializeApp(SPATIA_FIREBASE_CONFIG,'build-intelligence'));
const status=(text,bad=false)=>{$('#sharedStatus').textContent=text;$('#sharedStatus').className='status'+(bad?' error':'')};
let busy=false,user=null,mode='login';
function fieldError(id,text=''){const input=$('#'+id),error=$('#'+id+'-error');error.textContent=text;error.hidden=!text;if(text)input.setAttribute('aria-invalid','true');else input.removeAttribute('aria-invalid')}
function controls(){
 $('#sharedAuth').hidden=!!user;$('#sharedMode').hidden=!!user;$('#accountActions').hidden=!user;
 $('#sharedLogin').hidden=mode!=='login';$('#sharedRegister').hidden=mode!=='register';
 $('#authTitle').textContent=user?'내 계정':mode==='register'?'계정 만들기':'로그인';
 $('#sharedMode').textContent=mode==='login'?'처음이라면 계정 만들기':'이미 계정이 있어요 · 로그인하기';
 $('#sharedPassword').autocomplete=mode==='register'?'new-password':'current-password';$('#sharedPassword').placeholder=mode==='register'?'6자 이상 입력해 주세요.':'';
 for(const id of ['sharedLogin','sharedRegister','sharedMode'])$('#'+id).disabled=busy||!!user;
 $('#sharedLogout').disabled=busy||!user;
 $('#sharedLogin').textContent=busy?'로그인하는 중이에요…':'로그인하기';
 $('#sharedRegister').textContent=busy?'계정을 만드는 중이에요…':'계정 만들기';
 $('#sharedAuth').setAttribute('aria-busy',String(busy));
}
function validFields(){
 const email=$('#sharedEmail'),password=$('#sharedPassword');
 fieldError('sharedEmail',!email.value.trim()?'이메일을 입력해 주세요.':email.validity.typeMismatch?'이메일 주소를 다시 확인해 주세요.':'');
 fieldError('sharedPassword',!password.value?'비밀번호를 입력해 주세요.':mode==='register'&&password.value.length<6?'비밀번호를 6자 이상 입력해 주세요.':'');
 const invalid=[email,password].find(input=>input.getAttribute('aria-invalid')==='true');if(invalid){invalid.focus();return false}return true;
}
try{
 await setPersistence(auth,browserSessionPersistence);
 onAuthStateChanged(auth,u=>{user=u;if(u)mode='login';$('#sharedPassword').value='';$('#sharedAccount').textContent=u?u.email:'';globalThis.SpatiaHeaderAuth?.notify(!!u,SPATIA_FIREBASE_CONFIG.projectId);controls();status(u?'로그인했어요. 워크스페이스로 이동할 수 있어요.':'')});
 async function action(fn){if(busy)return;busy=true;status('');controls();try{await fn()}catch(e){status(e.code==='auth/invalid-credential'?'이메일이나 비밀번호를 다시 확인해 주세요.':e.code==='auth/email-already-in-use'?'이미 가입한 이메일이에요. 로그인으로 바꿔 주세요.':e.code==='auth/weak-password'?'비밀번호를 6자 이상 입력해 주세요.':e.code==='auth/network-request-failed'?'인터넷 연결을 확인한 뒤 다시 시도해 주세요.':'계정 연결을 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',true)}finally{busy=false;controls()}}
 $('#sharedMode').onclick=()=>{if(busy)return;mode=mode==='login'?'register':'login';fieldError('sharedEmail');fieldError('sharedPassword');status('');controls();$('#sharedEmail').focus()};
 for(const id of ['sharedEmail','sharedPassword'])$('#'+id).addEventListener('input',()=>fieldError(id));
 $('#sharedAuth').onsubmit=e=>{e.preventDefault();if(busy||!validFields())return;action(()=> (mode==='register'?createUserWithEmailAndPassword:signInWithEmailAndPassword)(auth,$('#sharedEmail').value.trim(),$('#sharedPassword').value))};
 $('#sharedLogout').onclick=()=>action(()=>signOut(auth));
}catch{status('로그인을 준비하지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.',true)}
