(() => {
 const form=document.querySelector('#demo-form'); if(!form || location.hostname !== 'delora.build' || !form.dataset.leadEndpoint || !form.dataset.turnstileSiteKey) return;
 const button=form.querySelector('.contact-submit'), note=form.querySelector('.contact-send-note'), result=form.querySelector('#contact-result'), area=form.querySelector('#contact-verification');
 const error=form.querySelector('#contact-captcha-error'), widget=document.createElement('div'), retry=document.createElement('button'); area.prepend(widget); area.hidden=false; retry.type='button';retry.className='contact-retry';retry.textContent='Try again';retry.hidden=true;error.after(retry);retry.addEventListener('click',()=>{error.hidden=true;retry.hidden=true;try{window.turnstile.reset(widgetId);}catch{say('Verification is unavailable. Please email team@delora.build.');}});
 let widgetId=null, token='', last='', id='';
 const say=message=>{result.textContent=message;result.hidden=false;};
 const requiredText=[form.querySelector('#contact-name'),form.querySelector('#contact-message')];
 requiredText.forEach(field=>field.addEventListener('input',()=>field.setCustomValidity('')));
 note.textContent='We’ll use your details to respond to your request.';button.textContent='Send message';button.disabled=true;
 window.deloraTurnstileReady=()=>{
  try {widgetId=window.turnstile.render(widget,{sitekey:form.dataset.turnstileSiteKey,action:'contact',appearance:'interaction-only',callback:value=>{token=value;button.disabled=false;error.hidden=true;retry.hidden=true;},'expired-callback':()=>{token='';button.disabled=true;error.textContent='Security check expired. Please try again.';error.hidden=false;retry.hidden=false;},'error-callback':()=>{token='';button.disabled=true;error.textContent='We couldn’t complete the security check. Please try again or email team@delora.build.';error.hidden=false;retry.hidden=false;}});}
  catch {say('Verification is unavailable. Please email team@delora.build.');}
 };
 const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?onload=deloraTurnstileReady&render=explicit';script.async=true;script.defer=true;script.onerror=()=>say('Verification is unavailable. Please email team@delora.build.');document.head.appendChild(script);
 form.addEventListener('submit',async event=>{
  event.preventDefault();requiredText.forEach(field=>field.setCustomValidity(field.value.trim() ? '' : 'Please enter a value.'));if(!form.reportValidity()||!token)return;
  const data=new FormData(form), fields=Object.fromEntries(['name','email','businessType','website','social','message','privacyConsent'].map(key=>[key,String(data.get(key)||'').trim()]));
  const fingerprint=JSON.stringify(fields);if(last!==fingerprint){id=crypto.randomUUID();last=fingerprint;}
  button.disabled=true;button.textContent='Sending…';result.hidden=true;
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);let sent=false;
  try {const res=await fetch(form.dataset.leadEndpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...fields,id,token}),signal:controller.signal});const body=await res.json();if(!res.ok||!body.ok)throw Error();sent=true;form.reset();id='';last='';say('Thanks for getting in touch. We’ll be in touch soon.');}
  catch {say('We couldn’t confirm your message was sent. Please try again or email team@delora.build.');}
  finally {clearTimeout(timer);button.textContent='Send message';token='';try{window.turnstile.reset(widgetId);}catch{button.disabled=true;error.textContent=sent?'To send another message, reload this page or email team@delora.build.':'Please reload this page or email team@delora.build.';error.hidden=false;}}
 });
})();
