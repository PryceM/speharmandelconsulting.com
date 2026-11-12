---
description: "Use when editing contact links, forms, email delivery, public/index.html, src/worker.js, or deployment code for Spehar Mandel Consulting. Covers the referral-only mailto contact and preserved legacy /api/contact Worker flow."
name: "SMC Contact Form Protection"
---
# Spehar Mandel Consulting Contact Protection

Apply these instructions whenever editing the contact section, `/api/contact`, `public/index.html`, `src/worker.js`, or deployment code.

- The approved referral-only design uses a plain `mailto:speharmandelconsulting@gmail.com` link in `public/index.html` and no intake form.
- Preserve `src/worker.js` and its existing `/api/contact` / FormSubmit forwarding and recipient fallback unchanged; the legacy endpoint is unused by the referral-only page.
- Before merge or deploy, confirm the contact email link appears and no intake form appears on the new page.
- If Pryce explicitly approves restoring a form, keep the existing Worker route rather than submitting to FormSubmit directly or changing providers without approval.
- Patch only the affected contact presentation and checks; do not rewrite unrelated site behavior.
