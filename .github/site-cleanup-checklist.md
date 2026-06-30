# Spehar Mandel Consulting Site Cleanup Checklist

Purpose: track remaining cleanup work without spending Copilot credits on broad audits.

## Current baseline

- Main branch is the working source baseline.
- Repo-specific safety instructions exist.
- Local Pryce workflow is expected to use `pryce.cmd`.
- Production deployment requires explicit Pryce approval.
- The existing contact architecture posts to `/api/contact` and is handled by the Worker.

## Remaining work

- Keep main as the baseline for new changes.
- Review old non-main branches before future branch maintenance.
- Preserve the current Worker-routed contact flow unless Pryce explicitly approves a different architecture.
- Run local check before future edits or deployments.

## Branch review later

Review old non-main branches only when needed. Do not delete branches without explicit approval.

## Budget rule

Use ChatGPT first for the plan. Use VS Code Copilot only for the narrow execution step. Do not run another broad audit unless something breaks or Pryce explicitly approves the broader budget spend.
