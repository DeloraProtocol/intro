(() => {
 const status = document.querySelector('.brand-copy-status');
 const announcement = document.querySelector('.brand-copy-announcement');
 let timer;
 document.querySelectorAll('.brand-copy').forEach(button => button.addEventListener('click', async () => {
  const format = button.dataset.format;
  try {
   if (!navigator.clipboard) throw new Error('Clipboard unavailable');
   if (format === 'png') {
    if (!window.ClipboardItem || !navigator.clipboard.write) throw new Error('Image copy unsupported');
    const png = fetch(button.dataset.file).then(response => {
     if (!response.ok) throw new Error('Asset unavailable');
     return response.blob();
    });
    await navigator.clipboard.write([new ClipboardItem({'image/png': png})]);
   } else {
    if (!navigator.clipboard.writeText) throw new Error('Text copy unsupported');
    const response = await fetch(button.dataset.file);
    if (!response.ok) throw new Error('Asset unavailable');
    await navigator.clipboard.writeText(await response.text());
   }
   status.textContent = '';
   announcement.textContent = `${button.dataset.label} ${format === 'svg' ? 'SVG code' : 'PNG image'} copied.`;
   button.classList.add('is-copied');
   clearTimeout(button.copyTimer);
   button.copyTimer = setTimeout(() => button.classList.remove('is-copied'), 2000);
  } catch {
   button.classList.remove('is-copied');
   announcement.textContent = '';
   status.textContent = `Could not copy ${format.toUpperCase()}. Please download it instead.`;
  }
  clearTimeout(timer);
  timer = setTimeout(() => { status.textContent = ''; }, 3500);
 }));
})();
