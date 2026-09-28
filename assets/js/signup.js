// PinkAlert launch list sign-up.
// Sends the form to the endpoint in data-endpoint (a Formspree form, which emails each sign-up
// to Arshia and keeps a list that can be exported).
(() => {
  const form = document.getElementById('signup-form');
  if (!form) return;
  const msg = document.getElementById('su-msg');
  const btn = form.querySelector('button[type="submit"]');
  const email = form.elements.email;
  const consent = form.elements.consent;
  const endpoint = form.dataset.endpoint || '';
  const connected = endpoint && !endpoint.includes('YOUR_FORM_ID');

  const say = (text, kind) => { msg.textContent = text; msg.className = 'form-msg ' + (kind || ''); };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const value = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { say('Please enter a valid email address.', 'err'); email.focus(); return; }
    if (!consent.checked) { say('Please tick the box to confirm you are 13 or older and agree to receive emails.', 'err'); consent.focus(); return; }
    if (form.elements._gotcha.value) return; // bot trap

    if (!connected) {
      // Not wired to a form service yet: show what visitors will see, without pretending it was saved.
      done('Preview only: sign-ups are not being saved yet.');
      return;
    }
    btn.disabled = true; btn.textContent = 'Signing you up…'; say('');
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(String(res.status));
      done();
    } catch {
      btn.disabled = false; btn.textContent = 'Notify me at launch';
      say('Something went wrong and your sign-up was not saved. Please try again in a moment.', 'err');
    }
  });

  function done(note) {
    const first = (form.elements.name.value || '').trim();
    form.innerHTML = `
      <div class="signup-done">
        <span class="done-mark" aria-hidden="true">✓</span>
        <h2>You're on the list${first ? ', ' + first.replace(/[<>&"]/g, '') : ''}.</h2>
        <p>We'll email you the moment PinkAlert launches. Thank you for supporting early breast health.</p>
        ${note ? `<p class="fineprint-note">${note}</p>` : ''}
        <a class="btn btn-ghost" href="/demo">Try the live demo while you wait</a>
      </div>`;
  }
})();
