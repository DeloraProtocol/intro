(() => {
 document.querySelectorAll('.api-flow').forEach(flow => {
  const tabs = [...flow.querySelectorAll('[role="tab"]')];
  const panels = [...flow.querySelectorAll('[role="tabpanel"]')];
  const rail = flow.querySelector('.flow-steps');
  if (!tabs.length || tabs.length !== panels.length || !rail) return;
  // Tokenize text nodes without changing the request a visitor can select or copy.
  function highlight(code, json) {
   const source = code.textContent;
   const tokens = json
    ? /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|\b(?:true|false|null)\b|-?\b\d+(?:\.\d+)?\b/g
    : /'[^']*'|--[\w-]+|\bcurl\b/g;
   const fragment = document.createDocumentFragment();
   let cursor = 0;
   for (const match of source.matchAll(tokens)) {
    fragment.append(document.createTextNode(source.slice(cursor, match.index)));
    const token = document.createElement('span');
    const value = match[0];
    token.className = json
     ? (value.startsWith('\"') ? (/^\s*:/.test(source.slice(match.index + value.length)) ? 'token-key' : 'token-string') : (/^(true|false|null)$/.test(value) ? 'token-literal' : 'token-number'))
     : (value === 'curl' ? 'token-command' : value.startsWith('--') ? 'token-option' : 'token-shell-string');
    const param = !json && value.startsWith("'") && !value.startsWith("'http")
     ? value.match(/^'([^=:]+)([=:])(.*)'$/s) : null;
    if (param) {
     token.className = 'token-shell-param';
     const name = document.createElement('span');
     name.className = 'token-param-name';
     name.textContent = param[1];
     const paramValue = document.createElement('span');
     paramValue.className = 'token-param-value';
     paramValue.textContent = param[3];
     token.append(document.createTextNode("'"), name, document.createTextNode(param[2]), paramValue, document.createTextNode("'"));
    } else token.textContent = value;
    fragment.append(token);
    cursor = match.index + value.length;
   }
   fragment.append(document.createTextNode(source.slice(cursor)));
   code.replaceChildren(fragment);
  }
  panels.forEach(panel => {
   const request = panel.querySelector('.flow-code-side:not(.flow-response) code');
   const response = panel.querySelector('.flow-response code');
   if (request) highlight(request, false);
   if (response) highlight(response, true);
   const copy = panel.querySelector('.terminal-copy');
   if (copy && request && navigator.clipboard?.writeText) {
    copy.hidden = false;
    let reset;
    copy.addEventListener('click', async () => {
     clearTimeout(reset);
     try { await navigator.clipboard.writeText(request.textContent); copy.textContent = 'Copied'; }
     catch { copy.textContent = 'Unavailable'; }
     reset = setTimeout(() => { copy.textContent = 'Copy'; }, 1800);
    });
   }
  });
  function select(index, focus = false) {
   tabs.forEach((tab, i) => {
    const active = i === index;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    tab.classList.toggle('is-complete', i < index);
    panels[i].hidden = !active;
   });
   rail.style.setProperty('--flow-progress', index);
   if (focus) tabs[index].focus();
  }
  tabs.forEach((tab, i) => {
   tab.addEventListener('click', () => select(i));
   tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (i + 1) % tabs.length;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (i + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    select(next, true);
   });
  });
  select(0);
 });
})();
