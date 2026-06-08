const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8'
  }
});

const clean = (value) => String(value || '').replace(/[\r\n]+/g, ' ').trim();

export async function onRequestPost(context) {
  const { request, env } = context;

  let data;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'Invalid form submission.' }, 400);
  }

  const name = clean(data.name);
  const email = clean(data.email);
  const problem = String(data.problem || '').trim();

  if (!name || !email || !problem) {
    return json({ ok: false, error: 'Please fill out all three fields.' }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: 'Please enter a valid email address.' }, 400);
  }

  if (!env.RESEND_API_KEY) {
    return json({ ok: false, error: 'Email service is not configured yet.' }, 500);
  }

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

  const html = `
    <h2>New Spehar Mandel Consulting website inquiry</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <h3>What is the problem?</h3>
    <p>${escapeHtml(problem).replace(/\n/g, '<br>')}</p>
  `;

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
      text,
      html
    })
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Resend error:', detail);
    return json({ ok: false, error: 'The message could not be sent yet.' }, 502);
  }

  return json({ ok: true });
}

export async function onRequestGet() {
  return json({ ok: false, error: 'Use POST.' }, 405);
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
