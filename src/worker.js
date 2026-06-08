const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8' }
});

const clean = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim();

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/contact') {
      if (request.method !== 'POST') return json({ ok: false, error: 'Use POST.' }, 405);
      return handleContact(request, env);
    }

    return env.ASSETS.fetch(request);
  }
};

async function handleContact(request, env) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const name = clean(data.name);
  const email = clean(data.email);
  const problem = String(data.problem || '').trim();

  if (!name || !email || !problem) return json({ ok: false, error: 'Please fill out all three fields.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  if (!env.RESEND_API_KEY) return json({ ok: false, error: 'Email service is not configured yet.' }, 500);

  const subject = `Spehar Mandel Consulting inquiry from ${name}`;
  const text = [
    'New Spehar Mandel Consulting website inquiry',
    '',
    `Name: ${name}`,
    `Email: ${email}`,
    '',
    'What is the problem?',
    problem
  ].join('\n');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: env.FORM_FROM || 'Spehar Mandel Consulting <onboarding@resend.dev>',
      to: [env.FORM_TO || 'Noah.Z.Mandel@gmail.com'],
      reply_to: email,
      subject,
      text
    })
  });

  if (!response.ok) return json({ ok: false, error: 'The message could not be sent yet.' }, 502);
  return json({ ok: true });
}
