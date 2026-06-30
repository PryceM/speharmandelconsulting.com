---
description: "Use when editing contact, forms, email delivery, public/index.html, src/worker.js, or deployment code for Spehar Mandel Consulting. Covers the current /api/contact Worker form flow and FormSubmit forwarding."
name: "SMC Contact Form Protection"
---
# Spehar Mandel Consulting Contact Form Protection

Apply these instructions whenever editing the contact section, `/api/contact`, `public/index.html`, `src/worker.js`, or deployment code.

- Preserve the current architecture: `public/index.html` posts to `/api/contact` and `src/worker.js` forwards messages using FormSubmit AJAX.
- Before merge or deploy, confirm the source contains:
  - `/api/contact` in the form action
  - FormSubmit AJAX handling in `src/worker.js`
  - the current contact recipient fallback in the worker
- Do not replace the Worker route with a direct form post or a different provider unless Pryce explicitly approves it.
- Patch the existing contact flow only; do not rewrite unrelated site sections.
