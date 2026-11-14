# IEC Process Tracker

This repository is a React + Vite application used for collecting IEC process assessments.

Quick start
- Install dependencies:

```bash
npm ci
```

- Run dev server:

```bash
npm run dev
```

- Run ESLint:

```bash
npm run lint
```

- Auto-fix lint problems:

```bash
npm run lint:fix
```

- Run unit tests (Vitest):

```bash
npm run test
```

Notes
- Environment variables: copy `.env.example` to `.env.local`, then set `VITE_SUPABASE_URL`, `VITE_SUPABASE_KEY`, `VITE_GOOGLE_SHEET_URL`, `VITE_APP_ORIGIN`, `VITE_FORCE_DEV_AUTH`, and `VITE_DEV_USER_EMAIL` as needed.
- CI: A basic GitHub Actions workflow is included at `.github/workflows/ci.yml` that runs lint, tests and build on PRs and pushes to `main`.
- Accessibility: Decorative images are marked `aria-hidden` and images use `loading="lazy"` / `decoding="async"`.
- Performance: Step components are lazy-loaded with `React.lazy` + `Suspense` to reduce initial bundle size.

Want changes?
- Tell me which improvements to apply next: add more unit tests, convert images to WebP, or migrate to TypeScript.
