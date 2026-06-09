const VERSION_TEXT = [
  'Spehar Mandel Consulting',
  'Version: v2026.06.09-1259',
  'Updated: 2026-06-09 12:59 ET',
  'Modified by: ChatGPT',
  'Note: Worker-served version marker after GitHub/Cloudflare reconnect.',
  'Expected live path: /version.txt',
  'Contact form target: Noah Mandel'
].join('\n') + '\n';

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
});

const clean = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/version.txt') {
      return new Response(VERSION_TEXT, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Use POST.' }, 405);
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  let data = {};
  try {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
    }
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const name = clean(data.name);
  const email = clean(data.email);
  const message = String(data.message || data.problem || '').trim();
  const honey = clean(data._honey || data.website);
  const recipient = clean(env.CONTACT_EMAIL || env.FORMSUBMIT_EMAIL || 'noah.z.mandel@gmail.com');

  if (honey) return json({ ok: true });
  if (!name || !email || !message) return json({ ok: false, error: 'Please fill out all three fields.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);

  const body = new FormData();
  body.append('name', name);
  body.append('email', email);
  body.append('message', message);
  body.append('_subject', env.CONTACT_SUBJECT || `Spehar Mandel Consulting inquiry from ${name}`);
  body.append('_template', 'table');
  body.append('_captcha', 'false');

  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.success === false) {
    return json({ ok: false, error: 'The message could not be sent right now.' }, 502);
  }

  return json({ ok: true });
}
