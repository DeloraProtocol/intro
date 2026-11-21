const billingButtons = document.querySelectorAll('[data-billing]');
billingButtons.forEach(button => button.addEventListener('click', () => {
 const annual = button.dataset.billing === 'annual';
 billingButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
 document.getElementById('starter-price').textContent = annual ? '$79' : '$99';
 document.getElementById('billing-description').textContent = `Example price · billed ${annual ? 'annually' : 'quarterly'}`;
}));
