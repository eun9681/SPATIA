/* One persistent shell; legacy workspaces keep their own scripts and draft state. */
(function(root){
 'use strict';
 const pages={landing:['index.html','홈'],geo:['workspace.html','공간 분석'],gis:['gis.html','GIS 입지'],management:['management.html','역할 체험'],login:['login.html','로그인'],guide:['guide.html','사용 가이드']};
 function destination(href,base){
  try{
   const url=new URL(href,base),directory=new URL('.',base);
   if(url.origin!==directory.origin||!url.pathname.startsWith(directory.pathname))return null;
   const file=url.pathname.slice(directory.pathname.length)||'index.html';
   const id=Object.keys(pages).find(key=>pages[key][0]===file);if(!id)return null;
   url.searchParams.delete('embed');
   return{id,search:url.search,anchor:url.hash};
  }catch{return null}
 }
 function address(target){return target.id==='geo'&&!target.search?(target.anchor||'#home'):'#/'+target.id+target.search+target.anchor}
 function readAddress(hash){
  if(!hash.startsWith('#/'))return{id:'geo',search:'',anchor:hash};
  try{const url=new URL(hash.slice(1),'https://spatia.local');const id=url.pathname.slice(1);return pages[id]?{id,search:url.search,anchor:url.hash}:{id:'geo',search:'',anchor:'#home'}}catch{return{id:'geo',search:'',anchor:'#home'}}
 }
 if(typeof module==='object'&&module.exports){module.exports={pages,destination,address,readAddress};return}
 const {document,location}=root,body=document.body;
 const embedded=body.classList.contains('spatia-embedded');
 function linkTarget(event){
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return null;
  const a=event.target.closest('a[href]');
  return !a||a.hasAttribute('download')||(a.target&&a.target!=='_self')?null:a;
 }
 if(embedded){
  // Only the parent shell owns browser history and cross-service navigation.
  const open=href=>{if(!destination(href,document.baseURI))return false;root.parent.postMessage({type:'spatia:navigate',href:new URL(href,document.baseURI).href},location.origin);return true};
  root.SpatiaNavigation={open};
  document.addEventListener('click',event=>{const a=linkTarget(event);if(a&&open(a.href))event.preventDefault()});
  root.addEventListener('message',event=>{
   if(event.origin!==location.origin||event.source!==root.parent||event.data?.type!=='spatia:activate')return;
   const anchor=event.data.anchor||'';
   if(anchor){
    root.history.replaceState(null,'',location.pathname+location.search+anchor);
    const role=anchor.slice(1),button=document.querySelector('#roles [data-role="'+( ['resident','manager','expert'].includes(role)?role:'none')+'"]');
    if(button){if(!button.classList.contains('active'))button.click()}else{let id;try{id=decodeURIComponent(role)}catch{id=role}document.getElementById(id)?.scrollIntoView({block:'start',behavior:'instant'});if(id==='sharedAuth')document.querySelector('#sharedEmail')?.focus({preventScroll:true})}
   }
   root.dispatchEvent(new Event('spatia:activate'));
  });
  return;
 }
 if(body.dataset.page!=='geo')return;
 const main=document.querySelector('main'),header=document.querySelector('.spatia-site-header'),footer=document.querySelector('.spatia-site-footer');
 const home=document.createElement('div');home.className='spatia-home-view';
 while(main.firstChild)home.append(main.firstChild);main.append(home);
 const outlet=document.createElement('section');outlet.className='spatia-spa-outlet';outlet.hidden=true;outlet.setAttribute('aria-label','서비스 워크스페이스');main.append(outlet);
 const status=document.createElement('p');status.className='spatia-route-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');outlet.append(status);
 const announcement=document.createElement('span');announcement.className='spatia-sr-only';announcement.setAttribute('role','status');announcement.setAttribute('aria-live','polite');body.append(announcement);
 const frames=new Map(),title=document.title;let current='geo',lastAddress=null;
 function measureHeader(){body.style.setProperty('--site-header-height',header.getBoundingClientRect().height+'px')}
 new ResizeObserver(measureHeader).observe(header);measureHeader();
 // The home is already rendered. Supporting workspaces load once, only when opened.
 function frameFor(target){
  let record=frames.get(target.id);
  if(record&&(!target.search||record.search===target.search))return record;
  if(record)record.frame.remove();
  const frame=document.createElement('iframe');frame.className='spatia-workspace-frame';frame.title=pages[target.id][1]+' 워크스페이스';frame.hidden=true;
  const url=new URL(pages[target.id][0],document.baseURI);url.search=target.search;url.searchParams.set('embed','1');url.hash=target.anchor;
  record={frame,search:target.search,ready:false,anchor:target.anchor};frames.set(target.id,record);
  frame.addEventListener('load',()=>{
   if(frames.get(target.id)!==record)return;
   try{
    if(!frame.contentDocument?.querySelector('#main-content'))throw Error('Workspace unavailable');
    record.ready=true;
    if(current===target.id){status.hidden=true;frame.hidden=false;outlet.removeAttribute('aria-busy');activateFrame(record)}
   }catch{if(current===target.id){status.replaceChildren(document.createTextNode('화면을 불러오지 못했습니다. '));const retry=document.createElement('button');retry.type='button';retry.textContent='다시 불러오기';retry.onclick=()=>{frames.delete(target.id);frame.remove();lastAddress=null;render()};status.append(retry);outlet.removeAttribute('aria-busy')}}
  });
  frame.src=url.href;outlet.append(frame);return record;
 }
 function activateFrame(record){record.frame.contentWindow.postMessage({type:'spatia:activate',anchor:record.anchor},location.origin)}
 function render(){
  const target=readAddress(location.hash),key=location.hash;if(key===lastAddress)return;lastAddress=key;
  const changed=current!==target.id;current=target.id;home.hidden=current!=='geo';outlet.hidden=current==='geo';body.classList.toggle('spatia-spa-active',current!=='geo');footer.hidden=current!=='geo';
  for(const [id,record]of frames)record.frame.hidden=id!==current||!record.ready;
  for(const a of header.querySelectorAll('.spatia-workspaces a')){const d=destination(a.href,document.baseURI);if(d&&(d.id===current))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current')}
  document.title=current==='geo'?title:pages[current][1]+' · SPATIA';announcement.textContent=pages[current][1]+' 화면';
  if(current==='geo'){
   status.hidden=true;
   root.dispatchEvent(new Event('spatia:activate'));
   const element=new URLSearchParams(target.search||location.search).get('element');if(element)root.dispatchEvent(new CustomEvent('spatia:element',{detail:{id:element}}));
   let id;try{id=decodeURIComponent(target.anchor.slice(1))}catch{id='home'}
   const anchor=id==='home'?null:document.getElementById(id|| (element?'workspace':''));
   requestAnimationFrame(()=>{root.dispatchEvent(new Event('resize'));if(anchor)anchor.scrollIntoView({block:'start',behavior:'instant'});else if(changed||id==='home')root.scrollTo({top:0,behavior:'instant'})});
  }else{
   root.scrollTo({top:0,behavior:'instant'});const record=frameFor(target);record.anchor=target.anchor;
   status.hidden=record.ready;status.textContent=pages[current][1]+' 화면을 불러오는 중입니다…';outlet.setAttribute('aria-busy',String(!record.ready));
   if(record.ready){record.frame.hidden=false;activateFrame(record)}
  }
 }
 function navigate(target){if(target.id==='landing'){location.href=new URL('index.html'+target.search+target.anchor,document.baseURI).href;return}const hash=address(target);if(location.hash!==hash)root.history.pushState(null,'',hash);else lastAddress=null;render()}
 function open(href){const target=destination(href,document.baseURI);if(!target)return false;navigate(target);return true}
 root.SpatiaNavigation={open};
 // Keep real hrefs usable with modifier keys, downloads, and standalone pages.
 document.addEventListener('click',event=>{const a=linkTarget(event);if(!a)return;if(a.classList.contains('spatia-skip')){event.preventDefault();main.focus();return}let href=a.href;if(a.matches('.spatia-workspaces a')&&destination(href,document.baseURI)?.id==='geo')href='workspace.html#workspace';if(open(href))event.preventDefault()});
 root.addEventListener('message',event=>{if(event.origin!==location.origin||![...frames.values()].some(record=>record.frame.contentWindow===event.source)||event.data?.type!=='spatia:navigate'||typeof event.data.href!=='string')return;open(event.data.href)});
 root.addEventListener('hashchange',render);root.addEventListener('popstate',render);render();
})(typeof window==='object'?window:globalThis);
