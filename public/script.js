const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

function setFormStatus(message, isError = false) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.dataset.state = isError ? 'error' : 'ok';
}

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const previousLabel = submitButton ? submitButton.innerHTML : '';
    const payload = {
      name: document.getElementById('contact-name')?.value.trim() || '',
      email: document.getElementById('contact-email')?.value.trim() || '',
      problem: document.getElementById('contact-problem')?.value.trim() || ''
    };

    if (!payload.name || !payload.email || !payload.problem) {
      setFormStatus('Please complete all three fields.', true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
      }
      setFormStatus('Sending your inquiry…');

      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'The message could not be sent.');
      }

      contactForm.reset();
      setFormStatus('Your message has been sent. Thank you.');
    } catch (error) {
      setFormStatus(error.message || 'Unable to send your message. Please try again.', true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = previousLabel;
      }
    }
  });
}
