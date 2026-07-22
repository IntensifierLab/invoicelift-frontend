# Contributing to InvoiceLift frontend

This guide is specific to the Next.js frontend in this repository. It documents the local setup, component conventions, test commands, and pull request checks expected for UI changes.

## Local development setup

1. Install Node.js 22. The CI workflow uses `actions/setup-node@v4` with `node-version: "22"`.
2. Install dependencies from the lockfile:

   ```bash
   npm install
   ```

3. Start the Next.js development server:

   ```bash
   npm run dev
   ```

4. Open the local app at `http://localhost:3000`.

The static scaffold does not require secrets. If a future feature needs public browser configuration, keep it in `.env.local` and use only `NEXT_PUBLIC_*` names. Do not commit private keys, RPC secrets, KYB documents, or production credentials.

## Project map

- `app/layout.tsx` owns the shared shell, metadata, and navigation.
- `app/page.tsx` owns the landing page and renders the expected-pages table.
- `app/<route>/page.tsx` owns route-level pages such as `/smes`, `/liquidity`, `/risk`, `/roadmap`, and `/docs`.
- `components/` contains reusable UI components shared across pages.
- `app/globals.css` contains design tokens, layout styles, and component classes.

## Component creation conventions

- Create route pages as `app/<route>/page.tsx` and keep route-specific copy close to that page.
- Put reusable UI in `components/` with PascalCase exports and kebab-case file names, following `components/brand-logo.tsx` and `components/expected-pages.tsx`.
- Prefer semantic HTML before adding custom roles. Use real headings, lists, tables, links, and buttons where possible.
- Keep protocol language consistent with the README: invoice registry, pool manager, repayment waterfall, SME onboarding, liquidity, and risk.
- Keep styling aligned with `app/globals.css` tokens instead of introducing one-off inline color values. Inline styles should stay rare and scoped to small layout adjustments.
- Keep browser-safe configuration explicit. Anything secret or server-only belongs in the backend or secure wallet flow, not in `NEXT_PUBLIC_*` values.

## Accessibility checks for UI changes

Before requesting review for a visual or interaction change:

- Verify each page has a useful heading structure and visible focus states.
- Check keyboard access for links, buttons, tables, and any future form controls.
- Confirm meaningful image or logo usage has accessible text or is marked decorative.
- Avoid color-only status indicators; pair status color with text.
- Capture a screenshot for UI changes and include it in the PR description.

## Quality commands

Run the same checks that CI runs before opening a PR:

```bash
npm run lint
npm run build
```

There is no dedicated test script in `package.json` yet. When tests are added, document the command here and include it in the PR checklist.

## Pull request checklist

- [ ] Local setup steps still match `package.json` and `.github/workflows/ci.yml`.
- [ ] New components follow the route/component conventions above.
- [ ] `npm run lint` passes or any failure is explained.
- [ ] `npm run build` passes or any failure is explained.
- [ ] UI changes include before/after screenshots or a preview deployment link.
- [ ] Accessibility checks were performed for keyboard navigation, headings, focus, and non-color status cues.
- [ ] README or route documentation was updated when navigation, routes, or public configuration changed.
- [ ] No secrets, private documents, wallet keys, or production RPC credentials were committed.