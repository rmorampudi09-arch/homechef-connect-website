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
const formMessage = document.getElementById('formMessage');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = emailInput.value.trim();
  if (!email) return;
  const existing = JSON.parse(localStorage.getItem('homechef_waitlist') || '[]');
  if (!existing.includes(email)) existing.push(email);
  localStorage.setItem('homechef_waitlist', JSON.stringify(existing));
  formMessage.textContent = 'You are on the list — launch updates coming soon!';
  emailInput.value = '';
});
