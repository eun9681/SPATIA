'use strict';
(()=>{
 const body=document.body,kind=body.dataset.page,main=document.querySelector('main');
 if(!main)return;
 main.id='main-content';main.tabIndex=-1;
 const skip=document.createElement('a');skip.className='spatia-skip';skip.href='#main-content';skip.textContent='본문으로 건너뛰기';body.prepend(skip);
 const pages=[['geo','index.html','공간 분석'],['management','management.html','유지관리'],['indoor','indoor.html','실내 환경'],['guide','guide.html','사용 가이드'],['cloud','cloud.html','개인 백업']];
 const nav=document.createElement('nav');nav.className='spatia-workspaces';nav.setAttribute('aria-label','주요 서비스');
 for(const [id,href,label]of pages){const a=document.createElement('a');a.href=href;a.textContent=label;if(id===kind)a.setAttribute('aria-current','page');if(id==='cloud')a.className='spatia-backup';nav.append(a)}
 const sidebar=document.querySelector('.sidebar,.rail');
 if(sidebar){
  main.prepend(nav);sidebar.id='spatia-sidebar';sidebar.setAttribute('aria-label',kind==='geo'?'공간 분석 메뉴':kind==='management'?'유지관리 메뉴':'실내 환경 메뉴');
  const bar=document.createElement('div');bar.className='spatia-mobile-bar';bar.innerHTML='<a class="spatia-mobile-brand" href="index.html"><span aria-hidden="true">S</span>SPATIA</a><button class="spatia-menu-toggle" type="button" aria-controls="spatia-sidebar" aria-expanded="false"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>메뉴</button>';skip.after(bar);
  const toggle=bar.querySelector('button'),close=document.createElement('button');close.type='button';close.className='spatia-drawer-close';close.textContent='×';close.setAttribute('aria-label','메뉴 닫기');sidebar.prepend(close);
  const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='spatia-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label','메뉴 닫기');backdrop.tabIndex=-1;body.append(backdrop);
  const mobile=window.matchMedia('(max-width:900px)');let open=false;
  function setOpen(next,restore=true){open=next&&mobile.matches;sidebar.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));backdrop.hidden=!open;body.classList.toggle('spatia-menu-open',open);main.inert=open;if(open){sidebar.removeAttribute('aria-hidden');close.focus()}else{if(mobile.matches)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');if(restore)toggle.focus()}}
  toggle.onclick=()=>setOpen(!open);close.onclick=backdrop.onclick=()=>setOpen(false);
  sidebar.addEventListener('click',event=>{if(event.target.closest('nav button,nav a,.side-tool,.old-link,.help'))setOpen(false)});
  document.addEventListener('keydown',event=>{if(!open)return;if(event.key==='Escape'){event.preventDefault();setOpen(false)}if(event.key==='Tab'){const controls=[...sidebar.querySelectorAll('a[href],button:not([disabled]),select,input,[tabindex="0"]')].filter(e=>e.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}});
  const resize=()=>{setOpen(false,false);sidebar.inert=mobile.matches;};
  // A closed mobile drawer must also be absent from keyboard navigation.
  const original=setOpen;setOpen=(next,restore=true)=>{sidebar.inert=!(next&&mobile.matches)&&mobile.matches;original(next,restore)};
  mobile.addEventListener('change',resize);resize();
  for(const el of sidebar.querySelectorAll('.side-label,.rail-label,.workspace-label')){if(/SPATIAL|WORKSPACE/.test(el.textContent))el.textContent='분석 메뉴';if(el.textContent==='PROJECT')el.textContent='현재 건물'}
 }else{document.querySelector('.top')?.after(nav)}
 body.classList.add('spatia-enhanced');
 const dialogs=document.querySelectorAll('dialog');
 function enhanceForms(root){
  for(const input of root.querySelectorAll('input,textarea,select')){
   if(input.dataset.spatiaEnhanced)continue;input.dataset.spatiaEnhanced='true';
   if(input.id==='assignee'||input.id==='recordAuthor'){input.autocomplete='name';input.setAttribute('list','spatia-known-people')}
   if(input.type==='email')input.autocomplete='username';
   if(input.type==='password')input.autocomplete='current-password';
  }
  for(const img of root.querySelectorAll('img')){img.loading='lazy';img.decoding='async'}
 }
 enhanceForms(document);
 for(const dialog of dialogs){new MutationObserver(()=>enhanceForms(dialog)).observe(dialog,{childList:true,subtree:true})}
 const list=document.createElement('datalist');list.id='spatia-known-people';
 try{const stored=JSON.parse(localStorage.getItem('build-intelligence-demo-v2'));const names=[...new Set((stored?.requests||window.BuildModel?.seed()?.requests||[]).map(r=>r.assignee).filter(Boolean))];for(const name of names){const option=document.createElement('option');option.value=name;list.append(option)}}catch{}
 body.append(list);
})();
