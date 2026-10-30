// Explicitly invoked provisioning QA. All credentials remain in memory.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {initializeApp,deleteApp} from 'firebase/app';
import {getAuth,createUserWithEmailAndPassword,deleteUser} from 'firebase/auth';
import {getFirestore,doc,setDoc,getDoc,getDocs,collection,query,where,updateDoc,serverTimestamp,onSnapshot} from 'firebase/firestore';
import '../dist/firebase-config.js';
import '../dist/geo-engine.js';
const require=createRequire(import.meta.url),cli=require(process.env.SPATIA_FIREBASE_CLI_AUTH||process.env.APPDATA+'/npm/node_modules/firebase-tools/lib/auth.js');
const account=cli.getGlobalDefaultAccount();if(!account)throw Error('Project-owner CLI login required');
const access=await cli.getAccessToken(account.tokens.refresh_token,['https://www.googleapis.com/auth/cloud-platform','https://www.googleapis.com/auth/firebase']);
const headers={Authorization:'Bearer '+access.access_token,'Content-Type':'application/json'},base='https://firestore.googleapis.com/v1/projects/spatia-550fc/databases/(default)/documents';
const building='qa-spatia-'+Date.now(),created=[],users={},checks=[],paths=new Set();
function encode(v){if(typeof v==='string')return{stringValue:v};if(Array.isArray(v))return{arrayValue:{values:v.map(encode)}};if(Number.isInteger(v))return{integerValue:String(v)};throw Error('Unsupported test fixture value')}
async function fixture(path,data){assert(path.startsWith('buildings/'+building+'/'));const r=await fetch(base+'/'+path,{method:'PATCH',headers,body:JSON.stringify({fields:Object.fromEntries(Object.entries(data).map(([k,v])=>[k,encode(v)]))}),signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error('Fixture write failed: '+r.status);paths.add(path)}
const ref=(role,kind,id)=>doc(users[role].db,'buildings',building,kind,id);
const yes=async(name,fn)=>{await fn();checks.push({name,pass:true})},no=async(name,fn)=>{let denied=false;try{await fn()}catch(e){if(e.code!=='permission-denied')throw e;denied=true}assert(denied,name);checks.push({name,pass:true})};
try{
for(const role of ['resident','neighbor','manager','expert','outsider']){const app=initializeApp(SPATIA_FIREBASE_CONFIG,'qa-'+role+'-'+Date.now()),auth=getAuth(app);const account=await createUserWithEmailAndPassword(auth,'spatia-qa-'+role+'-'+Date.now()+'@example.test','QA-'+crypto.randomUUID());created.push({app,user:account.user});users[role]={uid:account.user.uid,db:getFirestore(app)}}
for(const role of ['resident','neighbor','manager','expert'])await fixture(`buildings/${building}/members/${users[role].uid}`,{role:role==='neighbor'?'resident':role,units:[role==='neighbor'?'201':'302']});
await fixture(`buildings/${building}/elements/W302`,{buildingId:building,unitId:'302',floorId:building+'-F3',name:'QA wall',type:'wall',material:'QA synthetic',min:[0,0,0],max:[1,1,1],ifcGuid:''});
await no('실서버: 비회원 구조물 조회 차단',()=>getDoc(ref('outsider','elements','W302')));
await no('실서버: 입주자 자기 역할 승격 차단',()=>setDoc(ref('resident','members',users.resident.uid),{role:'manager',units:['302']}));
const ticket={buildingId:building,unitId:'302',elementId:'W302',ownerUid:users.resident.uid,assignedUid:'',stage:0,title:'임시 QA 요청',description:'실서버 권한 검증용 임시 합성 요청입니다.',dueDate:'',createdAt:serverTimestamp(),updatedAt:serverTimestamp()};
await yes('실서버: 로그인한 입주자의 요청 저장',()=>setDoc(ref('resident','requests','R1'),ticket));paths.add(`buildings/${building}/requests/R1`);
await no('실서버: 다른 세대의 요청 읽기 차단',()=>getDoc(ref('neighbor','requests','R1')));
await no('실서버: 입주자의 전체 요청 열람 차단',()=>getDocs(collection(users.resident.db,'buildings',building,'requests')));
await yes('실서버: 본인 요청 목록 조회',()=>getDocs(query(collection(users.resident.db,'buildings',building,'requests'),where('ownerUid','==',users.resident.uid))));
await yes('실서버: 다른 관리자 계정에서 요청 공유',()=>getDoc(ref('manager','requests','R1')));
await yes('실서버: 담당 전문가 배정',()=>updateDoc(ref('manager','requests','R1'),{assignedUid:users.expert.uid,stage:2,updatedAt:serverTimestamp()}));
await yes('실서버: 배정된 전문가 요청 조회',()=>getDoc(ref('expert','requests','R1')));
const inspection={requestId:'R1',buildingId:building,unitId:'302',elementId:'W302',authorUid:users.expert.uid,raw:'QA 비공개 점검 원문',plain:'점검 중이며 아직 원인이 확인되지 않았습니다.',next:'추가 측정 예정 · QA 예시',reviewed:true,revision:1,updatedAt:serverTimestamp()};
await yes('실서버: 전문가 비공개 기록 저장',()=>setDoc(ref('expert','inspections','I1'),inspection));paths.add(`buildings/${building}/inspections/I1`);
await no('실서버: 입주자의 비공개 원문 접근 차단',()=>getDoc(ref('resident','inspections','I1')));
await yes('실서버: 관리자 공개 승인',()=>setDoc(ref('manager','publicUpdates','I1'),{requestId:'R1',inspectionId:'I1',buildingId:building,unitId:'302',elementId:'W302',plain:inspection.plain,next:inspection.next,reviewedRevision:1,approvedBy:users.manager.uid,approvedAt:serverTimestamp()}));paths.add(`buildings/${building}/publicUpdates/I1`);
await yes('실서버: 해당 입주자의 승인 설명 조회',async()=>{const d=(await getDoc(ref('resident','publicUpdates','I1'))).data();assert.equal(d.plain,inspection.plain);assert(!('raw'in d))});
await no('실서버: 다른 세대의 승인 설명 접근 차단',()=>getDoc(ref('neighbor','publicUpdates','I1')));
await yes('실서버: 관리자 변경이 입주자에게 실시간 전달',async()=>{let stop;const changed=new Promise((resolve,reject)=>{const timer=setTimeout(()=>{stop?.();reject(Error('Realtime update timeout'))},15000);stop=onSnapshot(ref('resident','requests','R1'),snapshot=>{if(!snapshot.metadata.fromCache&&snapshot.data()?.stage===3){clearTimeout(timer);stop();resolve()}},reject)});await updateDoc(ref('manager','requests','R1'),{stage:3,dueDate:'2026-11-03',updatedAt:serverTimestamp()});await changed;});
const ownBackup=doc(users.resident.db,'users',users.resident.uid,'snapshots','model');
await yes('실서버: 개인 UID의 모델 백업 저장',()=>setDoc(ownBackup,{schemaVersion:1,kind:'model',payload:JSON.stringify(require('../dist/geo-engine.js').GeoEngine.seed()),provenance:'user_workspace_snapshot',updatedAt:serverTimestamp()}));paths.add('users/'+users.resident.uid+'/snapshots/model');
await yes('실서버: 본인 모델 백업 조회',()=>getDoc(ownBackup));
await no('실서버: 다른 UID의 개인 백업 접근 차단',()=>getDoc(doc(users.neighbor.db,'users',users.resident.uid,'snapshots','model')));
await yes('실서버: 관리자 보수 완료',()=>updateDoc(ref('manager','requests','R1'),{stage:4,dueDate:'2026-11-03',updatedAt:serverTimestamp()}));
await yes('실서버: 본인 보수 결과 확인',()=>updateDoc(ref('resident','requests','R1'),{stage:5,updatedAt:serverTimestamp()}));
await fs.mkdir('qa',{recursive:true});await fs.writeFile('qa/production-security-results.json',JSON.stringify({checkedAt:new Date().toISOString(),projectId:'spatia-550fc',environment:'production Firebase Auth + Firestore; isolated synthetic QA building and temporary accounts',checks},null,2));console.log('PASS: '+checks.length+' production Authentication and Firestore permission/workflow checks.');
}finally{
let failures=0;for(const path of [...paths].reverse()){const r=await fetch(base+'/'+path,{method:'DELETE',headers,signal:AbortSignal.timeout(20000)});if(!r.ok&&r.status!==404)failures++}for(const c of created){try{await deleteUser(c.user)}catch{failures++}await deleteApp(c.app)}assert.equal(failures,0,'Temporary QA resources cleanup must succeed');console.log('Temporary QA documents and accounts removed.');
}
