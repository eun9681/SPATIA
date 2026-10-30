'use strict';
import('./collaboration.js').catch(()=>{const status=document.getElementById('sharedStatus');status.textContent='Firebase 연결을 시작하지 못했습니다. 네트워크·브라우저 저장소 설정을 확인하고 새로고침하세요.';status.className='status error';for(const id of ['sharedLogin','sharedLogout','openBuilding'])document.getElementById(id).disabled=true;});
