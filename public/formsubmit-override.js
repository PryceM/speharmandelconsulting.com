const smcForm = document.getElementById('contact-form');
const smcStatus = document.getElementById('form-status');

function smcSetStatus(message, isError = false) {
  if (!smcStatus) return;
  smcStatus.textContent = message;
  smcStatus.dataset.state = isError ? 'error' : 'ok';
}

if (smcForm) {
  smcForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const submitButton = smcForm.querySelector('button[type="submit"]');
    const name = document.getElementById('contact-name')?.value.trim() || '';
    const email = document.getElementById('contact-email')?.value.trim() || '';
    const problem = document.getElementById('contact-problem')?.value.trim() || '';

    if (!name || !email || !problem) {
      smcSetStatus('Please fill out all three fields before sending.', true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      smcSetStatus('Sending message...');

      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('message', problem);
      data.append('_subject', 'New Spehar Mandel Consulting website message');
      data.append('_template', 'table');
      data.append('_captcha', 'false');

      const response = await fetch('https://formsubmit.co/ajax/noah.z.mandel@gmail.com', {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.success === false) throw new Error();

      smcForm.reset();
      smcSetStatus('Message sent. Thank you.');
    } catch {
      smcSetStatus('The message could not be sent right now. Please try again shortly.', true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send the Problem';
      }
    }
  }, true);
}
