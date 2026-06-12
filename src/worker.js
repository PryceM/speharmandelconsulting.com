const VERSION_TEXT = [
  'Spehar Mandel Consulting',
  'Version: v2026.06.12-footer-cleanup',
  'Updated: 2026-06-12 ET',
  'Modified by: ChatGPT',
  'Note: Worker-served cleanup marker after stale homepage asset check.',
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

    const assetResponse = await env.ASSETS.fetch(request);
    if ((url.pathname === '/' || url.pathname === '/index.html') && isHtml(assetResponse)) {
      const html = await assetResponse.text();
      return new Response(cleanFooter(html), {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers: cleanHtmlHeaders(assetResponse.headers)
      });
    }

    return assetResponse;
  }
};

function isHtml(response) {
  return (response.headers.get('content-type') || '').toLowerCase().includes('text/html');
}

function cleanHtmlHeaders(headers) {
  const next = new Headers(headers);
  next.set('Content-Type', 'text/html; charset=utf-8');
  next.set('Cache-Control', 'no-store');
  next.delete('Content-Length');
  return next;
}

function cleanFooter(html) {
  return html
    .replace(/<p style="opacity:\.7;font-size:13px">Version marker:[\s\S]*?fallback-page marker added because \/version\.txt is routing to main page\.<\/p>/g, '')
    .replace(/<p style="opacity:\.7;font-size:13px">Sandbox HAL marker:[\s\S]*?HAL 9000<\/p>/g, '<p style="opacity:.7;font-size:13px">HAL footer marker verified — 2026-06-12.</p>')
    .replace(/Sandbox HAL marker:[\s\S]*?HAL 9000andbox HAL marker:[\s\S]*?HAL 9000/g, 'HAL footer marker verified — 2026-06-12.');
}

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
