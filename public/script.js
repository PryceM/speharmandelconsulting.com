const problemData = {
  growth: {
    title: 'Growth is stuck.',
    broken: 'The team has activity, but not a clear growth system: positioning, channels, metrics, decision rules, and operating cadence are disconnected.',
    does: 'We map the revenue system, identify constraints, sharpen positioning, and turn priorities into a practical growth plan.',
    output: 'A concise diagnostic memo, prioritized growth opportunities, and a practical execution roadmap.'
  },
  funding: {
    title: 'We need funding.',
    broken: 'The story, numbers, market logic, and use-of-funds case are not aligned tightly enough for lenders, investors, or internal decision-makers.',
    does: 'We organize the business case, refine the narrative, pressure-test assumptions, and prepare materials for review.',
    output: 'A funding-readiness checklist, revised narrative, and materials roadmap for business plans, decks, and diligence.'
  },
  tech: {
    title: 'Our tech stack is messy.',
    broken: 'Tools were added without a workflow map. Data, ownership, training, and reporting now sit in separate places.',
    does: 'We map current workflows, identify friction points, select practical tools, and design an implementation plan the team can actually adopt.',
    output: 'A workflow map, tool recommendations, cleanup priorities, and a phased implementation plan.'
  },
  ai: {
    title: 'We need AI, not chaos.',
    broken: 'People are experimenting with AI, but there is no shared process, quality standard, data boundary, or adoption plan.',
    does: 'We identify high-leverage AI use cases, match tools to tasks, create prompts and guardrails, and train teams on practical use.',
    output: 'An AI workflow playbook, pilot use cases, prompt structures, and adoption plan.'
  },
  deal: {
    title: 'We are evaluating a deal.',
    broken: 'The opportunity may look attractive, but operating risk, integration burden, and post-close execution are under-defined.',
    does: 'We review the opportunity from an operator’s perspective and identify risks, missing diligence, integration needs, and execution requirements.',
    output: 'A deal-risk memo, integration questions, red flags, and a post-decision action plan.'
  },
  owner: {
    title: 'A project needs an owner.',
    broken: 'The work matters, but nobody has the bandwidth or structure to convert it into decisions, tasks, timelines, and accountability.',
    does: 'We step in as temporary strategic capacity: organizing the project, clarifying decisions, building materials, and driving progress.',
    output: 'A project operating system: priorities, owners, milestones, risks, and next actions.'
  }
};

const buttons = document.querySelectorAll('.problem-card');
const title = document.getElementById('problem-title');
const broken = document.getElementById('problem-broken');
const does = document.getElementById('problem-does');
const output = document.getElementById('problem-output-text');

buttons.forEach((button) => {
  button.addEventListener('click', () => {
    const key = button.dataset.problem;
    const item = problemData[key];
    buttons.forEach((b) => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
    title.textContent = item.title;
    broken.textContent = item.broken;
    does.textContent = item.does;
    output.textContent = item.output;
  });
});

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

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
    const payload = {
      name: document.getElementById('contact-name')?.value.trim() || '',
      email: document.getElementById('contact-email')?.value.trim() || '',
      problem: document.getElementById('contact-problem')?.value.trim() || ''
    };

    if (!payload.name || !payload.email || !payload.problem) {
      setFormStatus('Please fill out all three fields before sending.', true);
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
      }
      setFormStatus('Sending securely...');

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
      setFormStatus('Message sent. Noah will receive it by email.');
    } catch (error) {
      setFormStatus(error.message || 'The message could not be sent. Please try again.', true);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Send the Problem';
      }
    }
  });
}
