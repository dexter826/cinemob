# Repository Guidelines

## Working Principles

- Clarify requirements when ambiguity could change the implementation.
- Prefer the simplest solution that fully satisfies the request.
- Keep changes focused on the requested behavior.
- Avoid unrelated refactors, cleanup, or formatting changes.
- Preserve existing APIs and conventions unless the task requires changing them.
- Define a concrete success criterion before implementation.
- Validate the narrowest affected scope before running broader checks.

## Project Structure & Module Organization

CineMOB is a React 19 + TypeScript PWA built with Vite. Application code lives in `src/`: the app shell and bootstrap in `app/` (`App.tsx`, `useAppInit.ts`, `app/components/` for Layout/Navbar, `app/providers/`), reusable UI in `shared/components/`, feature screens in `features/*/pages/` and `features/*/components/`, business logic in `features/*/hooks/`, Zustand state in `features/*/stores/` and `shared/stores/`, third-party initializations in `lib/`, external integrations in `features/*/services/`, and shared definitions in `types/`, `constants/`, `shared/config/`, plus colocated `utils/`. Dependency direction: `shared/` must not import from `features/`; feature wiring (feature modals, cross-feature bootstrap) belongs in `app/`. TMDB helpers shared across features live in `shared/utils/tmdb.ts`; date helpers in `shared/utils/dateFormat.ts`. Keep bundled media in `src/assets/`; place directly served icons, manifests, and JSON in `public/`. Documentation images belong in `docs/`. Firebase configuration and rules remain at the repository root. Do not edit generated `dist/` or `dev-dist/` output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts Vite on `http://localhost:3000` with PWA development support.
- `npm run build` creates the optimized production bundle in `dist/`.
- `npm run preview` serves the production bundle locally for final smoke testing.
- `npx tsc --noEmit` runs TypeScript validation without producing files.
- `npm run typecheck` is an alias for the above.
- `npm run lint` runs ESLint over `src/` (0 errors, warnings capped at 200).
- `npm run format` formats the whole repo with Prettier; `npm run format:check` only verifies.

Copy `.env.example` to `.env` before exercising Firebase, TMDB, or OpenRouter-backed features.

## Coding Style & Naming Conventions

Follow the existing TypeScript style: two-space indentation, single quotes, semicolons, and functional React components (no `React.FC`). Formatting itself is enforced by Prettier (`.prettierrc.json`, print width 100); ESLint (`eslint.config.js`) owns code quality and contains no formatting rules, so the two never conflict. Use `PascalCase` for components and pages (`MovieCard.tsx`), `camelCase` for functions and utilities, `useX` for hooks, and `xStore.ts` / `xService.ts` for Zustand stores and service modules. Keep rendering in components, reusable behavior in hooks, remote calls in services, and shared interfaces in `src/types`. ESLint (`eslint.config.js`) must stay green; avoid unrelated formatting churn.

## Validation Guidelines

Choose validation based on the scope of the change:

- Small localized change: run the narrowest relevant check.
- TypeScript or React change: run `npm run typecheck` and relevant lint checks.
- User-facing feature: run typecheck, lint, format check, build, and relevant manual smoke tests.
- Before opening a PR: run `npm run typecheck`, `npm run lint`, `npm run format:check`, and `npm run build`.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit prefixes such as `feat:` and `chore:`; also use `fix:`, `docs:`, or `refactor:` where appropriate. Keep each commit focused and write an imperative summary. PRs should explain what changed and why, link the relevant issue, list verification performed, and include before/after screenshots for visible UI changes.

## Security & Configuration

Never commit `.env`, API keys, or Firebase credentials. Variables prefixed with `VITE_` are exposed to browser code, so they must not contain privileged server-side secrets. Review `firestore.rules` carefully whenever data access behavior changes.
