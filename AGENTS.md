# Repository Guidelines

## Project Structure & Module Organization

CineMOB is a React 19 + TypeScript PWA built with Vite. Application code lives in `src/`: reusable UI in `components/`, route-level screens in `pages/`, business logic in `hooks/`, Zustand state in `stores/`, external integrations in `services/`, and shared definitions in `types/`, `constants/`, and `utils/`. Keep bundled media in `src/assets/`; place directly served icons, manifests, and JSON in `public/`. Documentation images belong in `docs/`. Firebase configuration and rules remain at the repository root. Do not edit generated `dist/` or `dev-dist/` output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts Vite on `http://localhost:3000` with PWA development support.
- `npm run build` creates the optimized production bundle in `dist/`.
- `npm run preview` serves the production bundle locally for final smoke testing.
- `npx tsc --noEmit` runs TypeScript validation without producing files.

Copy `.env.example` to `.env` before exercising Firebase, TMDB, or OpenRouter-backed features.

## Coding Style & Naming Conventions

Follow the existing TypeScript style: two-space indentation, single quotes, semicolons, and functional React components. Use `PascalCase` for components and pages (`MovieCard.tsx`), `camelCase` for functions and utilities, `useX` for hooks, and `xStore.ts` / `xService.ts` for Zustand stores and service modules. Keep rendering in components, reusable behavior in hooks, remote calls in services, and shared interfaces in `src/types`. No formatter or linter is configured; avoid unrelated formatting churn.

## Testing Guidelines

There is currently no automated test runner or coverage threshold. Before opening a PR, run `npx tsc --noEmit` and `npm run build`, then manually verify affected routes, responsive layouts, authentication, and relevant API failure states. If adding a test framework, include its npm script and use colocated `*.test.ts` or `*.test.tsx` files.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit prefixes such as `feat:` and `chore:`; also use `fix:`, `docs:`, or `refactor:` where appropriate. Keep each commit focused and write an imperative summary. PRs should explain what changed and why, link the relevant issue, list verification performed, and include before/after screenshots for visible UI changes.

## Security & Configuration

Never commit `.env`, API keys, or Firebase credentials. Variables prefixed with `VITE_` are exposed to browser code, so they must not contain privileged server-side secrets. Review `firestore.rules` carefully whenever data access behavior changes.
