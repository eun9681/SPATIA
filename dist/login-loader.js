import('./login.js').catch(()=>{
 const status=document.getElementById('sharedStatus');status.textContent='로그인을 준비하지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.';status.className='status error';
 for(const id of ['sharedLogin','sharedRegister','sharedMode','sharedLogout'])document.getElementById(id).disabled=true;
});
