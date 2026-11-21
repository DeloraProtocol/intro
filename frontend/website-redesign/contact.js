(() => {
 const form = document.querySelector('#demo-form');
 if (!form || (location.hostname === 'delora.build' && form.dataset.leadEndpoint && form.dataset.turnstileSiteKey)) return;
 const submit = form.querySelector('.contact-submit');
 const note = form.querySelector('.contact-send-note');
 const result = form.querySelector('#contact-result');
 const clearButtonState = () => { if (submit.dataset.state === 'success' || submit.dataset.state === 'error') { submit.dataset.state = ''; submit.textContent = 'Send message'; } };
 form.addEventListener('input', clearButtonState);
 form.addEventListener('change', clearButtonState);
 const captchaArea = form.querySelector('#contact-verification');
 const captchaError = form.querySelector('#contact-captcha-error');
 const endpoint = form.dataset.formspreeEndpoint.trim();
 const siteKey = form.dataset.recaptchaSiteKey.trim();
 const requiredText = [form.querySelector('#contact-name'), form.querySelector('#contact-message')];
 requiredText.forEach(field => field.addEventListener('input', () => field.setCustomValidity('')));
 const configured = /^https:\/\/formspree\.io\/f\/[a-zA-Z0-9]+$/.test(endpoint) && /^6[\w-]{20,}$/.test(siteKey);
 const partiallyConfigured = Boolean(endpoint || siteKey) && !configured;
 let widgetId = null;

 function showError(message) { captchaError.textContent = message; captchaError.hidden = false; }
 function clearError() { captchaError.hidden = true; captchaError.textContent = ''; }

 if (partiallyConfigured) {
  note.textContent = 'The form is temporarily unavailable. Please email team@delora.build.';
 } else if (configured) {
  note.textContent = '';
  submit.textContent = 'Send message';
  captchaArea.hidden = false;
  const script = document.createElement('script');
  script.src = 'https://www.google.com/recaptcha/api.js?onload=deloraRecaptchaReady&render=explicit';
  script.async = true;
  script.defer = true;
  window.deloraRecaptchaReady = () => {
   if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
    showError('Verification is unavailable. Please email team@delora.build.');
    return;
   }
   try {
    widgetId = window.grecaptcha.render('contact-recaptcha', {
     sitekey: siteKey,
     callback: clearError,
     'expired-callback': () => showError('Verification expired. Please try again.'),
     'error-callback': () => showError('Verification is unavailable. Please email team@delora.build.')
    });
    submit.disabled = false;
   } catch {
    showError('Verification is unavailable. Please email team@delora.build.');
   }
  };
  script.addEventListener('error', () => showError('Verification is unavailable. Please email team@delora.build.'));
  document.head.appendChild(script);
 } else {
  submit.disabled = false;
 }

 form.addEventListener('submit', async event => {
  event.preventDefault();
  requiredText.forEach(field => field.setCustomValidity(field.value.trim() ? '' : 'Please enter a value.'));
  if (partiallyConfigured || !form.reportValidity()) return;
  const data = new FormData(form);
  if (!configured) {
   const details = [`Name: ${data.get('name')}`, `Email: ${data.get('email')}`, `Business type: ${data.get('businessType') || 'Not provided'}`, `Privacy Policy: ${data.get('privacyConsent') === 'yes' ? 'Agreed' : 'Not confirmed'}`, `Website: ${data.get('website') || 'Not provided'}`, `Social profile: ${data.get('social') || 'Not provided'}`, '', 'How can we help?', data.get('message')].join('\n');
   const url = `mailto:team@delora.build?subject=${encodeURIComponent('Delora demo request')}&body=${encodeURIComponent(details)}`;
   result.textContent = 'Your email app should open with your message. Please send it there to complete your request.';
   result.hidden = false;
   window.location.href = url;
   return;
  }
  const token = widgetId !== null && window.grecaptcha ? window.grecaptcha.getResponse(widgetId) : '';
  if (!token) { showError('Please complete the verification.'); return; }
  clearError();
  data.set('g-recaptcha-response', token);
  submit.disabled = true;
  submit.dataset.state = 'sending';
  submit.textContent = 'Sending…';
  result.hidden = true;
  try {
   const response = await fetch(endpoint, { method: 'POST', headers: { Accept: 'application/json' }, body: data });
   if (!response.ok) throw new Error('Submission failed');
   form.reset();
   window.grecaptcha.reset(widgetId);
   result.textContent = 'Thanks for getting in touch. We’ll be in touch soon.';
   result.hidden = false;
   submit.dataset.state = 'success';
  } catch {
   window.grecaptcha.reset(widgetId);
   result.textContent = 'Your message could not be sent. Please try again or email team@delora.build.';
   result.hidden = false;
   submit.dataset.state = 'error';
  } finally {
   submit.disabled = false;
   submit.textContent = submit.dataset.state === 'success' ? 'Sent' : 'Try again';
  }
 });
})();
