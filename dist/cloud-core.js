(function(root){'use strict';
const KEYS={model:'build-intelligence-geo-v3',operations:'build-intelligence-demo-v2'},MAX_BYTES=800000;
function parseConfig(text){
 if(/private_key|BEGIN (RSA )?PRIVATE KEY|service_account/.test(text))throw Error('서비스 계정 키는 입력하지 마세요. 웹 앱 firebaseConfig만 필요합니다.');
 let raw=text.trim().replace(/^```(?:json|javascript|js)?\s*/,'').replace(/```$/,'').trim();
 if(/^const\s+firebaseConfig\s*=/.test(raw))raw=raw.slice(raw.indexOf('{')).replace(/;\s*$/,'');
 raw=raw.replace(/([{,]\s*)(apiKey|authDomain|projectId|appId|storageBucket|messagingSenderId|measurementId)(\s*:)/g,'$1"$2"$3');
 let c;try{c=JSON.parse(raw)}catch{throw Error('firebaseConfig 객체만 입력하세요. SDK import 코드는 제외하고 값은 큰따옴표로 감싸세요.')}
 if(!c||Array.isArray(c)||typeof c!=='object')throw Error('Firebase 웹 앱 설정 객체가 필요합니다.');
 const allowed=['apiKey','authDomain','projectId','appId','storageBucket','messagingSenderId','measurementId'];
 if(Object.keys(c).some(k=>!allowed.includes(k)))throw Error('웹 앱 설정 이외의 필드가 있습니다.');
 for(const k of ['apiKey','authDomain','projectId','appId'])if(typeof c[k]!=='string'||!c[k].trim())throw Error(k+' 값이 필요합니다.');
 if(!/^[a-z0-9][a-z0-9-]{4,61}[a-z0-9]$/.test(c.projectId)||!/^[a-zA-Z0-9.-]+$/.test(c.authDomain)||!/^1:\d+:web:[a-zA-Z0-9]+$/.test(c.appId))throw Error('projectId, authDomain, appId 형식을 확인하세요.');
 return Object.fromEntries(allowed.filter(k=>typeof c[k]==='string').map(k=>[k,c[k].trim()]));
}
function validatePayload(kind,text,G){
 if(!Object.hasOwn(KEYS,kind))throw Error('지원하지 않는 백업 종류입니다.');
 if(typeof text!=='string'||new TextEncoder().encode(text).length>MAX_BYTES)throw Error('백업은 UTF-8 기준 800KB 이하만 지원합니다. IFC 원본·큰 사진은 JSON 파일로 별도 보관하세요.');
 const obj=JSON.parse(text);
 if(kind==='model')return G.validate(obj);
 if(!obj||obj.version!==2||!['requests','records','materials','notices'].every(k=>Array.isArray(obj[k])))throw Error('유지관리 데이터 형식이 올바르지 않습니다.');
 for(const r of obj.requests)if(!r||typeof r.id!=='string'||!Number.isInteger(r.stage)||r.stage<0||r.stage>5||!Array.isArray(r.events)||!['before','after'].every(k=>Array.isArray(r[k])))throw Error('요청 이력·처리 단계·사진 형식을 확인하세요.');
 for(const k of ['requests','records','materials','notices'])for(const r of obj[k])if(!r||typeof r!=='object'||typeof r.id!=='string')throw Error('관리 데이터의 ID를 확인하세요.');
 return obj;
}
function validateDocument(doc,kind,G){if(!doc||doc.schemaVersion!==1||doc.kind!==kind||doc.provenance!=='user_workspace_snapshot')throw Error('지원하는 클라우드 백업이 아닙니다.');return validatePayload(kind,doc.payload,G)}
root.CloudCore={KEYS,MAX_BYTES,parseConfig,validatePayload,validateDocument};
})(typeof module==='object'?module.exports:globalThis);
