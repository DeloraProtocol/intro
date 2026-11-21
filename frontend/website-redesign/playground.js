(() => {
 const form = document.getElementById('quote-form');
 const code = document.getElementById('play-code');
 const copy = document.getElementById('play-copy');
 const status = document.getElementById('quote-status');
 const result = document.getElementById('quote-result');
 const summary = document.getElementById('quote-summary');
 const raw = document.getElementById('quote-raw');
 if (!form || !code || !copy || !status || !result || !summary || !raw) return;
 const amount = document.getElementById('quote-amount');
 const sender = document.getElementById('quote-sender');
 const submit = form.querySelector('.play-submit');
 const buttonLabel = submit.querySelector('span');
 const routeButtons = [...document.querySelectorAll('[data-route]')];
 const codeButtons = [...document.querySelectorAll('[data-code]')];
 const viewButtons = [...document.querySelectorAll('[data-view]')];
 const API = 'https://api.delora.build/v1/quotes';
 const routes = {
  cross: { originChainId:'8453', destinationChainId:'42161', originCurrency:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', destinationCurrency:'0xaf88d065e77c8cC2239327C5EDb3A432268e5831', fromChain:'Base', toChain:'Arbitrum', fromToken:'USDC', toToken:'USDC', decimals:6 },
  swap: { originChainId:'8453', destinationChainId:'8453', originCurrency:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', destinationCurrency:'0x4200000000000000000000000000000000000006', fromChain:'Base', toChain:'Base', fromToken:'USDC', toToken:'WETH', decimals:18 }
 };
 let route = routes.cross;
 let language = 'javascript';

 function toBaseUnits(value) {
  const trimmed = value.trim();
  if (!/^\d{1,18}(?:\.\d{1,6})?$/.test(trimmed)) return null;
  const [whole, fractional = ''] = trimmed.split('.');
  const units = BigInt(whole) * 1000000n + BigInt((fractional + '000000').slice(0, 6));
  return units > 0n ? units.toString() : null;
 }
 function parameters() {
  return { senderAddress: sender.value.trim() || 'YOUR_WALLET_ADDRESS', originChainId:route.originChainId, destinationChainId:route.destinationChainId, originCurrency:route.originCurrency, destinationCurrency:route.destinationCurrency, amount:toBaseUnits(amount.value) || 'AMOUNT_IN_BASE_UNITS' };
 }
 function buildCode() {
  const p = parameters();
  if (language === 'curl') {
   const query = new URLSearchParams(p);
   return `curl --request GET \\\n  '${API}?${query}'`;
  }
  return `const params = new URLSearchParams({\n  senderAddress: ${JSON.stringify(p.senderAddress)},\n  originChainId: "${p.originChainId}",\n  destinationChainId: "${p.destinationChainId}",\n  originCurrency: "${p.originCurrency}",\n  destinationCurrency: "${p.destinationCurrency}",\n  amount: "${p.amount}"\n});\n\nconst response = await fetch(\n  \`${API}?\${params}\`\n);\nif (!response.ok) throw new Error(\`HTTP \${response.status}\`);\nconst quote = await response.json();\nconsole.log(quote);`;
 }
 function renderCode() {
  const source = buildCode();
  const tokens = /("(?:[^"\\]|\\.)*"|'[^']*'|\b(?:const|await|new|if|throw)\b)/g;
  code.replaceChildren();
  let last = 0;
  for (const match of source.matchAll(tokens)) {
   code.append(document.createTextNode(source.slice(last, match.index)));
   const span = document.createElement('span');
   span.className = /^["']/.test(match[0]) ? 'code-string' : 'code-keyword';
   span.textContent = match[0];
   code.append(span); last = match.index + match[0].length;
  }
  code.append(document.createTextNode(source.slice(last)));
 }
 function setStatus(text, state = '') { status.textContent = text; status.dataset.state = state; }
 function message(text) { summary.replaceChildren(); const line = document.createElement('span'); line.textContent = text; summary.append(line); }
 function resetResult(text = 'Run a request to see your quote.') {
  setStatus('Ready'); message(text); result.textContent = 'Your API response will appear here.';
 }
 function setPressed(buttons, key, value) {
  for (const button of buttons) { const active = button.dataset[key] === value; button.classList.toggle('is-active', active); button.setAttribute('aria-pressed', String(active)); }
 }
 function setView(value) {
  setPressed(viewButtons, 'view', value); summary.hidden = value !== 'summary'; raw.hidden = value !== 'json';
 }
 function onEdit() {
  sender.setCustomValidity(''); amount.setCustomValidity(''); renderCode();
  if (status.textContent !== 'Ready') resetResult('Request changed. Run it to see a new response.');
 }
 function formatUnits(value, decimals) {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return '—';
  const digits = value.padStart(decimals + 1, '0');
  const whole = decimals ? digits.slice(0, -decimals) : digits;
  const fraction = decimals ? digits.slice(-decimals) : '';
  const shown = fraction.slice(0, 8).replace(/0+$/, '');
  const truncated = /[1-9]/.test(fraction.slice(8));
  return (truncated ? '≈ ' : '') + whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (shown ? '.' + shown : '');
 }
 function addRow(label, value) {
  const row = document.createElement('div'); row.className = 'play-summary-row';
  const title = document.createElement('span'); title.textContent = label;
  const detail = document.createElement('strong'); detail.textContent = value;
  row.append(title, detail); summary.append(row);
 }
 function showQuote(data) {
  if (!data || typeof data.outputAmount !== 'string') { message('Response received. View JSON for details.'); return; }
  summary.replaceChildren();
  addRow('Estimated output', `${formatUnits(data.outputAmount, route.decimals)} ${route.toToken}`);
  if (data.minOutputAmount != null) addRow('Minimum output', `${formatUnits(data.minOutputAmount, route.decimals)} ${route.toToken}`);
  if (data.adapter) addRow('Route provider', String(data.adapter));
  if (Array.isArray(data.warnings) && data.warnings.length) addRow('Warnings', `${data.warnings.length} · see JSON`);
 }
 routeButtons.forEach(button => button.addEventListener('click', () => {
  route = routes[button.dataset.route]; setPressed(routeButtons, 'route', button.dataset.route);
  document.getElementById('quote-from-chain').textContent = route.fromChain;
  document.getElementById('quote-to-chain').textContent = route.toChain;
  document.getElementById('quote-from-token').textContent = route.fromToken;
  document.getElementById('quote-to-token').textContent = route.toToken;
  resetResult(); renderCode();
 }));
 codeButtons.forEach(button => button.addEventListener('click', () => { language = button.dataset.code; setPressed(codeButtons, 'code', language); renderCode(); }));
 viewButtons.forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
 amount.addEventListener('input', onEdit); sender.addEventListener('input', onEdit);
 renderCode(); setView('summary'); submit.disabled = false;

 copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(buildCode()); copy.textContent = 'Copied'; }
  catch { copy.textContent = 'Select code to copy'; }
  setTimeout(() => { copy.textContent = 'Copy code'; }, 2000);
 });
 form.addEventListener('submit', async event => {
  event.preventDefault();
  const units = toBaseUnits(amount.value);
  amount.setCustomValidity(units ? '' : 'Enter a positive amount with up to 6 decimal places.');
  sender.setCustomValidity(/^0x[0-9a-fA-F]{40}$/.test(sender.value.trim()) ? '' : 'Enter a valid EVM address (0x followed by 40 hexadecimal characters).');
  if (!form.reportValidity()) return;
  const params = new URLSearchParams(parameters());
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);
  submit.disabled = true; amount.disabled = true; sender.disabled = true; routeButtons.forEach(b => b.disabled = true);
  buttonLabel.textContent = 'Getting quote…'; setStatus('Requesting…'); message('Waiting for Delora API…'); result.textContent = 'Waiting for Delora API…';
  try {
   const response = await fetch(`${API}?${params}`, { signal: controller.signal });
   const text = await response.text();
   let data;
   try { data = JSON.parse(text); } catch { data = { message: text || 'Empty response' }; }
   setStatus(`HTTP ${response.status}`, response.ok ? 'success' : 'error');
   result.textContent = JSON.stringify(data, null, 2);
   if (response.ok) showQuote(data); else message('The API returned an error. View JSON for details.');
  } catch (error) {
   setStatus('Request failed', 'error');
   const detail = error.name === 'AbortError' ? 'The request timed out. Please try again.' : 'Could not reach the API. Check your connection and try again.';
   message(detail); result.textContent = detail;
  } finally {
   clearTimeout(timeout); submit.disabled = false; amount.disabled = false; sender.disabled = false; routeButtons.forEach(b => b.disabled = false);
   buttonLabel.textContent = 'Get quote';
  }
 });
})();
