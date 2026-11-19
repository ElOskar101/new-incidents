# Incidents

Vite + React + TypeScript frontend for incident management. The `@/` alias points
to `src/`. Application copy and identifiers are in English.

```sh
pnpm install
pnpm dev
```

Set the backend URL in `.env` as `VITE_API_BASE_URL`. Override it per machine in
`.env.local` (gitignored) and restart Vite. Do not put secrets in `VITE_` variables:
they are embedded in the compiled frontend.

In development, relative `/api/*` requests go through the Vite proxy to
`VITE_API_BASE_URL`. Builds and tests call the backend directly, so the backend must
allow CORS for the deployed frontend origin.

`pnpm build` typechecks and writes `dist/`. `pnpm preview` serves that build.
Netlify uses an `index.html` fallback for client routes.

Local Cursor agent rules live under `.cursor/` and are gitignored.

## Auth

Entering the app requires a session. The external auth site
(`auth.controlcentralcarrier.com`) redirects back with `?key=` (the access token).
The app stores it under `incidents.auth:v1`, strips it from the URL, and loads the
signed-in user from the identity service before showing the UI. If verification is
unavailable, the app offers a retry. Missing token or HTTP 401 sends the user to
login with the current page encoded as the return `url`.

## Scripts

```sh
pnpm check          # format:check, lint, typecheck, test:coverage, build (same as CI)
pnpm format         # apply Prettier
pnpm test           # unit tests
pnpm test:coverage  # tests with coverage thresholds (see vitest.config.ts)
```

- CI (`.github/workflows/ci.yml`) runs `pnpm check` on pull requests and on `main`.
- ESLint uses type-checked strict rules, accessibility rules, and module boundary rules.
- Requests time out (30 seconds; 5 minutes for uploads). Nothing is retried automatically.
- Tests run in jsdom. Node 25+ built-in `localStorage` is disabled for tests
  (`execArgv` in `vitest.config.ts`).

## Architecture

Deep modules: import another module only through its `index.ts`. Inside a module, use
relative imports that never leave the module. `shared/ui` and `shared/lib` may be imported
file by file.

```text
src/
  App.tsx, main.tsx         app shell, theme, routes (the only place that composes features)
  features/
    auth/                   session capture, login redirect, account header
    home/                   home page placeholder
  shared/
    api/                    HTTP client, cancellable request hook
    request-error/          request failure alert and messages
    error-boundary/         route error boundary
    nav/, theme/
    ui/, lib/               generic shadcn components and utilities (no domain code)
  layouts/                  shell layout, header, page chrome
```

- `shared` never imports `features`. Features never import each other.
- Network functions are called only from `hooks/use-*-workflow.ts` or `services/`.
- Requests use `useCancellableRequest` when a feature needs cancellable mutations.
- Tests live in `tests/` and mirror `src/`.

Theme colors (Orioris oklch palette + incident status aliases) are documented in [`docs/colors.md`](docs/colors.md).
