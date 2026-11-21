(() => {
 const field = document.getElementById('pricing-network-count');
 if (!field) return;
 async function refresh() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
   const response = await fetch('https://api.delora.build/v1/chains', {cache:'no-store',signal:controller.signal});
   if (!response.ok) return;
   const data = await response.json();
   if (!Array.isArray(data.chains)) return;
   const chains = data.chains.filter(c => c && c.mainnet === true && c.id != null && typeof c.chainType === 'string');
   const count = new Set(chains.map(c => c.chainType + ':' + String(c.id))).size;
   if (count > 0) field.textContent = String(count);
  } catch {} finally { clearTimeout(timeout); }
 }
 refresh();
 setInterval(() => { if (!document.hidden) refresh(); }, 15 * 60 * 1000);
 document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
