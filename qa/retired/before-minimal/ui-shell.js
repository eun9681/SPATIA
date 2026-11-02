'use strict';
(()=>{
 const body=document.body,kind=body.dataset.page,main=document.querySelector('main');
 if(!main)return;
 if(window.parent!==window&&new URLSearchParams(location.search).get('embed')==='1')body.classList.add('spatia-embedded');
 main.id='main-content';main.tabIndex=-1;
 const skip=document.createElement('a');skip.className='spatia-skip';skip.href='#main-content';skip.textContent='본문으로 건너뛰기';body.prepend(skip);
 const pages=[['landing','index.html','홈'],['geo','workspace.html','공간 분석'],['gis','gis.html','GIS 입지'],['management','management.html','역할 체험'],['guide','guide.html','사용 가이드']];
 const nav=document.createElement('nav');nav.className='spatia-workspaces';nav.setAttribute('aria-label','주요 서비스');
 for(const [id,href,label]of pages){const a=document.createElement('a');a.href=href;a.textContent=label;if(id===kind)a.setAttribute('aria-current','page');nav.append(a)}
 const sidebar=document.querySelector('.sidebar,.rail');const inertAreas=sidebar?.closest('main')?[...main.children].filter(e=>!e.contains(sidebar)).concat([...main.querySelectorAll('.spatia-analysis-content,.spatia-section-intro')]):[main];
 if(sidebar){
  main.prepend(nav);sidebar.id='spatia-sidebar';sidebar.setAttribute('aria-label',kind==='geo'?'공간 분석 메뉴':'유지관리 메뉴');
  const bar=document.createElement('div');bar.className='spatia-mobile-bar';bar.innerHTML='<a class="spatia-mobile-brand" href="index.html"><span aria-hidden="true">S</span>SPATIA</a><button class="spatia-menu-toggle" type="button" aria-controls="spatia-sidebar" aria-expanded="false"><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>메뉴</button>';const analysisLayout=document.querySelector('.spatia-analysis-layout');if(analysisLayout)analysisLayout.before(bar);else skip.after(bar);
  const toggle=bar.querySelector('button'),close=document.createElement('button');close.type='button';close.className='spatia-drawer-close';close.textContent='×';close.setAttribute('aria-label','메뉴 닫기');sidebar.prepend(close);
  const backdrop=document.createElement('button');backdrop.type='button';backdrop.className='spatia-backdrop';backdrop.hidden=true;backdrop.setAttribute('aria-label','메뉴 닫기');backdrop.tabIndex=-1;body.append(backdrop);
  const mobile=window.matchMedia('(max-width:900px)');let open=false;
  function setOpen(next,restore=true){open=next&&mobile.matches;sidebar.classList.toggle('is-open',open);toggle.setAttribute('aria-expanded',String(open));backdrop.hidden=!open;body.classList.toggle('spatia-menu-open',open);for(const area of inertAreas)area.inert=open;for(const shell of document.querySelectorAll('.spatia-site-header,.spatia-site-footer'))shell.inert=open;if(open){sidebar.removeAttribute('aria-hidden');close.focus()}else{if(mobile.matches)sidebar.setAttribute('aria-hidden','true');else sidebar.removeAttribute('aria-hidden');if(restore)toggle.focus()}}
  toggle.onclick=()=>setOpen(!open);close.onclick=backdrop.onclick=()=>setOpen(false);
  sidebar.addEventListener('click',event=>{if(mobile.matches&&event.target.closest('nav button,nav a,.side-tool,.old-link,.help'))setOpen(false)});
  document.addEventListener('keydown',event=>{if(!open)return;if(event.key==='Escape'){event.preventDefault();setOpen(false)}if(event.key==='Tab'){const controls=[...sidebar.querySelectorAll('a[href],button:not([disabled]),select,input,[tabindex="0"]')].filter(e=>e.getClientRects().length);const first=controls[0],last=controls.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}});
  const resize=()=>{setOpen(false,false);sidebar.inert=mobile.matches;};
  // A closed mobile drawer must also be absent from keyboard navigation.
  const original=setOpen;setOpen=(next,restore=true)=>{sidebar.inert=!(next&&mobile.matches)&&mobile.matches;original(next,restore)};
  mobile.addEventListener('change',resize);resize();
  if(kind==='geo'){
   // Keep the analysis controls after the workspace in reading order, on its right visually.
   analysisLayout?.append(sidebar);
   const content=document.createElement('div');content.id='spatia-sidebar-content';content.className='spatia-sidebar-content';
   while(sidebar.firstChild)content.append(sidebar.firstChild);sidebar.append(content);
   const collapse=document.createElement('button');collapse.type='button';collapse.className='spatia-sidebar-collapse';collapse.setAttribute('aria-controls',content.id);
   collapse.innerHTML='<span class="spatia-collapse-text">분석 메뉴 접기</span><svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="m7 4 6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
   sidebar.prepend(collapse);
   const preference='spatia-analysis-sidebar-collapsed';let collapsed=false;
   try{collapsed=localStorage.getItem(preference)==='true'}catch{}
   function syncCollapse(){
    const compact=!mobile.matches&&collapsed;
    content.hidden=compact;content.inert=compact;
    sidebar.classList.toggle('is-collapsed',compact);analysisLayout?.classList.toggle('is-sidebar-collapsed',compact);
    collapse.setAttribute('aria-expanded',String(!compact));
    collapse.setAttribute('aria-label',compact?'분석 메뉴 펼치기':'분석 메뉴 접기');collapse.title=compact?'분석 메뉴 펼치기':'분석 메뉴 접기';
   }
   collapse.onclick=()=>{collapsed=!collapsed;try{localStorage.setItem(preference,String(collapsed))}catch{}syncCollapse()};
   mobile.addEventListener('change',syncCollapse);syncCollapse();
  }
  for(const el of sidebar.querySelectorAll('.side-label,.rail-label,.workspace-label')){if(/SPATIAL|WORKSPACE/.test(el.textContent))el.textContent='분석 메뉴';if(el.textContent==='PROJECT')el.textContent='현재 건물'}
 }else{document.querySelector('.top')?.after(nav)}
 body.classList.add('spatia-enhanced');
 const siteHeader=document.createElement('header');siteHeader.className='spatia-site-header';
 const wordmark=document.createElement('a');wordmark.className='spatia-wordmark';wordmark.href='index.html';wordmark.setAttribute('aria-label','SPATIA 홈');wordmark.innerHTML='SPATIA<sup>↗</sup><small>SPATIAL + INTELLIGENCE</small>';
 const accountLink=document.createElement('a');accountLink.className='spatia-header-action';accountLink.href='login.html';accountLink.textContent='로그인';accountLink.dataset.authState='signed-out';
 const siteMenu=document.createElement('button');siteMenu.className='spatia-site-menu';siteMenu.type='button';siteMenu.textContent='☰ 사이트 메뉴';siteMenu.setAttribute('aria-expanded','false');siteMenu.setAttribute('aria-controls','spatia-services');nav.id='spatia-services';
 siteHeader.append(wordmark,nav,accountLink,siteMenu);skip.after(siteHeader);document.querySelector('body>.top')?.remove();
 const authHeaderReady=import('./auth-header.js').then(()=>{globalThis.SpatiaHeaderAuth.bind(accountLink);return globalThis.SpatiaHeaderAuth}).catch(()=>{accountLink.dataset.authUnavailable='true';return null});
 function closeSiteMenu(){siteHeader.classList.remove('is-menu-open');siteMenu.setAttribute('aria-expanded','false')}
 siteMenu.onclick=()=>{const open=siteMenu.getAttribute('aria-expanded')!=='true';siteHeader.classList.toggle('is-menu-open',open);siteMenu.setAttribute('aria-expanded',String(open))};nav.addEventListener('click',closeSiteMenu);document.addEventListener('keydown',event=>{if(event.key==='Escape'&&siteMenu.getAttribute('aria-expanded')==='true'){closeSiteMenu();siteMenu.focus()}});window.matchMedia('(max-width:900px)').addEventListener('change',closeSiteMenu);
 const toolsButton=document.querySelector('.spatia-menu-toggle');if(toolsButton)toolsButton.lastChild.textContent=kind==='geo'?'분석 메뉴':'분석 도구';
 const siteFooter=document.createElement('footer');siteFooter.className='spatia-site-footer';siteFooter.innerHTML='<div><strong>SPATIA</strong>공간의 관계를 분석하고, 지능적으로 관리하다.<br>Spatial + Intelligence</div><div><nav aria-label="하단 메뉴"><a href="guide.html">사용 가이드</a><a href="login.html">계정</a></nav><p>© SPATIA</p></div>';main.after(siteFooter);
 if(kind==='geo'&&new URLSearchParams(window.location.search).has('element'))requestAnimationFrame(()=>document.getElementById('workspace')?.scrollIntoView({block:'start',behavior:'auto'}));
 const dialogs=document.querySelectorAll('dialog');
 function enhanceForms(root){
  for(const input of root.querySelectorAll('input,textarea,select')){
   if(input.dataset.spatiaEnhanced)continue;input.dataset.spatiaEnhanced='true';
   if(input.id==='assignee'||input.id==='recordAuthor'){input.autocomplete='name';input.setAttribute('list','spatia-known-people')}
   if(input.type==='email')input.autocomplete='username';
   if(input.type==='password')input.autocomplete='current-password';
  }
  for(const img of root.querySelectorAll('img')){img.loading=img.classList.contains('spatia-hero-building')?'eager':'lazy';img.decoding='async'}
 }
 enhanceForms(document);
 for(const dialog of dialogs){new MutationObserver(()=>enhanceForms(dialog)).observe(dialog,{childList:true,subtree:true})}
 const list=document.createElement('datalist');list.id='spatia-known-people';
 try{const stored=JSON.parse(localStorage.getItem('build-intelligence-demo-v2'));const names=[...new Set((stored?.requests||window.BuildModel?.seed()?.requests||[]).map(r=>r.assignee).filter(Boolean))];for(const name of names){const option=document.createElement('option');option.value=name;list.append(option)}}catch{}
 body.append(list);
})();
