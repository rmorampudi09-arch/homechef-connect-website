const revealItems = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach((item) => observer.observe(item));

const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const nameInput = document.getElementById('nameInput');
const phoneInput = document.getElementById('phoneInput');
const interestType = document.getElementById('interestType');
const formMessage = document.getElementById('formMessage');

if (form && emailInput && interestType && formMessage) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();
    const name = nameInput ? nameInput.value.trim() : '';
    const phone = phoneInput ? phoneInput.value.trim() : '';
    const type = interestType.value;

    if (!email) return;

    formMessage.textContent = 'Sending...';

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone,
          interestType: type
        })
      });

      const result = await response.json();

      if (result.success) {
        formMessage.textContent = 'Thank you! We have received your interest and sent a confirmation email.';
        emailInput.value = '';
        if (nameInput) nameInput.value = '';
        if (phoneInput) phoneInput.value = '';
      } else {
        formMessage.textContent = result.message || 'Something went wrong. Please try again.';
      }
    } catch (error) {
      formMessage.textContent = 'Something went wrong. Please try again.';
    }
  });
}
