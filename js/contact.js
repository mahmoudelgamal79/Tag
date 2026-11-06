/* TAG — Contact form submission */
(function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const status = document.getElementById('contactFormStatus');
  const submitButton = form.querySelector('button[type="submit"]');
  const defaultButtonLabel = submitButton.textContent;

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `company-form-status is-${type}`;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    showStatus('', '');

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (!window.TAG?.api?.sendContact) {
      showStatus('We could not send your message. Please try again later.', 'error');
      return;
    }

    const fields = new FormData(form);
    const payload = {
      name: fields.get('name').trim(),
      email: fields.get('email').trim(),
      subject: fields.get('subject').trim(),
      message: fields.get('message').trim(),
    };

    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    try {
      const response = await TAG.api.sendContact(payload);
      form.reset();
      showStatus(response?.message || 'Thank you — we received your message.', 'success');
    } catch (error) {
      showStatus(error.message || 'We could not send your message. Please try again.', 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = defaultButtonLabel;
    }
  });
})();
