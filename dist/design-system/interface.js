'use strict';
(()=>{
 const body=document.body,kind=body.dataset.page;
 const mark='<svg class="vellum-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m3 10 13-7 13 7-13 7Z" fill="currentColor"/><path d="m3 16 13 7 13-7" stroke="currentColor" stroke-width="1.7" opacity=".45"/><path d="m3 22 13 7 13-7-13-7Z" stroke="currentColor" stroke-width="1.7"/></svg>';
 const wordmark=document.querySelector('.spatia-wordmark');if(wordmark)wordmark.innerHTML=mark+'<span>SPATIA</span>';
 const labels={twin:'구조와 위치',relations:'주변 연결',priority:'우선순위',hotspots:'결함 분포',validation:'검증'};
 for(const button of document.querySelectorAll('#navigation [data-tab]')){const span=button.querySelector('span');if(span){span.textContent=labels[button.dataset.tab];for(const node of [...button.childNodes])if(node.nodeType===3)node.remove()}}
 // The reference replaces the drawer with always-available floating tabs.
 // Keep the existing handlers, but release the old mobile drawer's inert state.
 const nav=document.querySelector('.sidebar,.rail');
 function enableTabs(){if(!nav)return;nav.inert=false;nav.removeAttribute('aria-hidden');const content=nav.querySelector('.spatia-sidebar-content');if(content){content.hidden=false;content.inert=false}document.querySelector('.spatia-backdrop')?.setAttribute('hidden','');body.classList.remove('spatia-menu-open')}
 enableTabs();matchMedia('(max-width:900px)').addEventListener('change',enableTabs);
 if(nav)nav.addEventListener('click',enableTabs);
 const siteMenu=document.querySelector('.spatia-site-menu');if(siteMenu){siteMenu.setAttribute('aria-label','사이트 메뉴');siteMenu.innerHTML='<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 5h12M4 10h12M4 15h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'}
 if(kind==='landing'){
  const services=document.querySelector('.spatia-workspaces');services?.querySelector('[href="index.html"]')?.remove();
  if(services){const guide=document.createElement('a');guide.href='guide.html';guide.textContent='사용 가이드';services.append(guide)}
  const start=document.createElement('a');start.href='workspace.html';start.className='sp-btn sp-btn--primary spatia-header-start';start.textContent='공간 분석 시작';siteMenu?.before(start);
 }
 const paths={home:'M3 9l7-6 7 6v8H4V9m4 8v-6h4v6',cube:'M3 6l7-4 7 4v8l-7 4-7-4V6m0 0 7 4 7-4m-7 4v8',link:'M7 7l6 6m-9-2-2 2a4 4 0 0 0 6 5l3-3m5-6 2-2a4 4 0 0 0-6-5L9 5',map:'M2 4l5-2 6 2 5-2v14l-5 2-6-2-5 2V4m5-2v14m6-12v14',people:'M7 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6m6-1a2 2 0 1 0 0-4m-11 13v-2a5 5 0 0 1 10 0v2m1-6a4 4 0 0 1 5 4v2'};
 function icons(root){for(const slot of root.querySelectorAll('[data-vellum-icon]')){const path=paths[slot.dataset.vellumIcon]||paths.cube;slot.innerHTML='<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="'+path+'"/></svg>'}}
 icons(document);
 // Decorative legacy symbols are replaced without changing menu labels or events.
 const cleanMenu=()=>{for(const item of document.querySelectorAll('.rail .nav'))for(const node of [...item.childNodes])if(node.nodeType===3&&/[^\s]/.test(node.textContent))node.textContent='';};
 cleanMenu();const roleNav=document.getElementById('nav');if(roleNav)new MutationObserver(cleanMenu).observe(roleNav,{childList:true});
})();
