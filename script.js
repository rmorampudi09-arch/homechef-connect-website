const form = document.getElementById('waitlistForm');
const emailInput = document.getElementById('emailInput');
const interestType = document.getElementById('interestType');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const type = interestType.value;

  if (!email) return;

  formMessage.textContent = 'Sending...';

  try {
    const response = await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email,
        interestType: type
      })
    });

    const result = await response.json();

    if (result.success) {
      formMessage.textContent = 'Thank you! We have received your interest and sent a confirmation email.';
      emailInput.value = '';
    } else {
      formMessage.textContent = result.message || 'Something went wrong. Please try again.';
    }
  } catch (error) {
    formMessage.textContent = 'Something went wrong. Please try again.';
  }
});
