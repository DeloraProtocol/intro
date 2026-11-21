(() => {
 const form = document.querySelector('#demo-form');
 if (!form) return;
 const key = 'delora-contact-draft-v1';
 const names = ['name', 'email', 'businessType', 'website', 'social', 'message'];
 const save = () => {
  const values = {};
  for (const name of names) values[name] = new FormData(form).get(name) || '';
  values.privacyConsent = Boolean(form.elements.namedItem('privacyConsent')?.checked);
  try { sessionStorage.setItem(key, JSON.stringify(values)); } catch {}
 };
 try {
  const saved = JSON.parse(sessionStorage.getItem(key) || 'null');
  if (saved && typeof saved === 'object') {
   for (const name of names) {
    if (typeof saved[name] !== 'string') continue;
    const field = form.elements.namedItem(name);
    if (field) field.value = saved[name];
   }
   const consent = form.elements.namedItem('privacyConsent');
   if (consent) consent.checked = saved.privacyConsent === true;
   const chosen = form.querySelector('input[name="businessType"]:checked');
   const label = form.querySelector('#business-selected');
   if (chosen && label) label.textContent = chosen.value;
  }
 } catch {}
 form.addEventListener('input', save);
 form.addEventListener('change', save);
 form.addEventListener('reset', () => { try { sessionStorage.removeItem(key); } catch {} });
})();
