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
const interestType = document.getElementById('interestType');
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  const type = interestType.value;
  if (!email) return;
  const existing = JSON.parse(localStorage.getItem('homechef_waitlist') || '[]');
  existing.push({ email, type, createdAt: new Date().toISOString() });
  localStorage.setItem('homechef_waitlist', JSON.stringify(existing));
  formMessage.textContent = `Thank you! Your ${type.toLowerCase()} interest has been saved for launch updates.`;
  emailInput.value = '';
});
