(() => {
 const button=document.querySelector('.copy-code');
 if(!button)return;
 button.addEventListener('click',async()=>{
  try {await navigator.clipboard.writeText(document.querySelector('.code-window code').innerText);button.textContent='Copied';setTimeout(()=>button.textContent='Copy',1800)}
  catch {button.textContent='Select code to copy';setTimeout(()=>button.textContent='Copy',2000)}
 });
})();
