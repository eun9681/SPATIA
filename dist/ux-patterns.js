/* Shared interaction patterns: clear form feedback and an explicit dialog exit. */
(()=>{
 let sequence=0;
 const message=input=>input.validity.valueMissing?'이 항목을 입력해 주세요.':input.validity.typeMismatch&&input.type==='email'?'이메일 주소를 다시 확인해 주세요.':input.validity.rangeUnderflow?`${input.min} 이상 입력해 주세요.`:input.validity.rangeOverflow?`${input.max} 이하로 입력해 주세요.`:input.validity.tooShort?`${input.minLength}자 이상 입력해 주세요.`:'입력한 내용을 다시 확인해 주세요.';
 function feedback(input){
  if(!input.id)input.id='spatia-field-'+(++sequence);
  let error=document.getElementById(input.id+'-error');
  if(!error){error=document.createElement('span');error.id=input.id+'-error';error.className='ux-field-error';error.hidden=true;error.setAttribute('aria-live','polite');input.after(error);const ids=new Set((input.getAttribute('aria-describedby')||'').split(' ').filter(Boolean));ids.add(error.id);input.setAttribute('aria-describedby',[...ids].join(' '))}
  return error;
 }
 document.addEventListener('invalid',event=>{const input=event.target;if(!input.matches('input,select,textarea')||input.form?.id==='sharedAuth')return;event.preventDefault();const error=feedback(input);input.setAttribute('aria-invalid','true');error.textContent=message(input);error.hidden=false;
  if(input.form){const invalid=[...input.form.elements].find(el=>el.willValidate&&!el.validity.valid);invalid?.focus()}
 },true);
 document.addEventListener('input',event=>{const input=event.target;if(!input.matches('input,select,textarea')||input.getAttribute('aria-invalid')!=='true'||!input.validity.valid)return;input.removeAttribute('aria-invalid');const error=document.getElementById(input.id+'-error');if(error)error.hidden=true});
 function dialogActions(){for(const dialog of document.querySelectorAll('dialog')){const actions=dialog.querySelector('.dialog-actions');if(!actions||actions.querySelector('[data-ux-close]'))continue;const close=document.createElement('button');close.type='button';close.className='secondary ux-dialog-close';close.dataset.uxClose='';close.textContent='닫기';close.onclick=()=>dialog.close();actions.prepend(close)}}
 new MutationObserver(dialogActions).observe(document.body,{subtree:true,childList:true});dialogActions();
})();
