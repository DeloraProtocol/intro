(() => {
 const card = document.querySelector('.reference-swap');
 const scene = document.querySelector('.real-swap');
 const reduce = matchMedia('(prefers-reduced-motion: reduce)');
 if (!card || !scene || reduce.matches) return;
 const input = card.querySelector('.ref-input');
 const inputUsd = card.querySelector('.ref-input-usd');
 const output = card.querySelector('.ref-output');
 const outputUsd = card.querySelector('.ref-output-usd');
 const fee = card.querySelector('.ref-fee');
 const status = card.querySelector('.ref-status');
 const steps = [
  {amount: '500', received: '0.13266', usd: '499.97'},
  {amount: '250', received: '0.06633', usd: '249.99'},
  {amount: '750', received: '0.19899', usd: '749.96'},
  {amount: '100', received: '0.02653', usd: '99.99'}
 ];
 let active = false, timer = null, run = 0, last = -1;
 function stop(){run++;clearTimeout(timer);status.classList.remove('is-visible');output.classList.remove('is-loading')}
 function begin(){
  if(!active || document.hidden || reduce.matches)return;
  const id=++run; let next = Math.floor(Math.random() * steps.length); if (next === last) next = (next + 1) % steps.length; last = next; const example=steps[next];
  const schedule=(ms,fn)=>{timer=setTimeout(()=>{if(id!==run || !active || document.hidden)return;fn()},ms)};
  input.textContent='0';inputUsd.textContent='$0.00';output.textContent='—';outputUsd.textContent='';fee.textContent='—';
  let at=0;function type(){at++;const v=example.amount.slice(0,at);input.textContent=v;inputUsd.textContent='$'+Number(v).toFixed(2);if(at<example.amount.length)schedule(220,type);else schedule(600,quote)}
  function quote(){status.textContent='Getting quote…';status.classList.add('is-visible');output.classList.add('is-loading');schedule(1200,()=>{output.classList.remove('is-loading');output.textContent=example.received;outputUsd.textContent='$'+example.usd;fee.textContent='$11.65';status.textContent='Review swap';schedule(1200,()=>{status.textContent='Confirm in wallet';schedule(1600,()=>{status.textContent='Transaction complete';schedule(1600,()=>{status.classList.remove('is-visible');schedule(1400,begin)})})})})}
  schedule(600,type);
 }
 if ('IntersectionObserver' in window) new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)begin();else stop()},{threshold:.25}).observe(scene);else{active=true;begin()}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();else if(active)begin()});
 reduce.addEventListener('change',()=>{if(reduce.matches)stop();else if(active)begin()});
})();
