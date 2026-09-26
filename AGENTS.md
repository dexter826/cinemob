# Repository Guidelines

## Project Structure & Module Organization

CineMOB is a React 19 + TypeScript PWA built with Vite. Application code lives in `src/`: reusable UI in `shared/components/`, feature screens in `features/*/pages/` and `features/*/components/`, business logic in `features/*/hooks/`, Zustand state in `features/*/stores/` and `shared/stores/`, third-party initializations in `lib/`, external integrations in `features/*/services/`, and shared definitions in `types/`, `constants/`, plus colocated `utils/`. Keep bundled media in `src/assets/`; place directly served icons, manifests, and JSON in `public/`. Documentation images belong in `docs/`. Firebase configuration and rules remain at the repository root. Do not edit generated `dist/` or `dev-dist/` output.

## Build, Test, and Development Commands

- `npm install` installs the locked dependencies from `package-lock.json`.
- `npm run dev` starts Vite on `http://localhost:3000` with PWA development support.
- `npm run build` creates the optimized production bundle in `dist/`.
- `npm run preview` serves the production bundle locally for final smoke testing.
- `npx tsc --noEmit` runs TypeScript validation without producing files.
- `npm run typecheck` is an alias for the above.
- `npm test` runs Vitest once (`vitest run`) over colocated `*.test.ts` files.
- `npm run lint` runs ESLint over `src/` (0 errors, warnings capped at 200).

Copy `.env.example` to `.env` before exercising Firebase, TMDB, or OpenRouter-backed features.

## Coding Style & Naming Conventions

Follow the existing TypeScript style: two-space indentation, single quotes, semicolons, and functional React components (no `React.FC`). Use `PascalCase` for components and pages (`MovieCard.tsx`), `camelCase` for functions and utilities, `useX` for hooks, and `xStore.ts` / `xService.ts` for Zustand stores and service modules. Keep rendering in components, reusable behavior in hooks, remote calls in services, and shared interfaces in `src/types`. ESLint (`eslint.config.js`) must stay green; avoid unrelated formatting churn.

## Testing Guidelines

Vitest is configured for colocated Node-based `src/**/*.test.ts` tests with the `@/` alias. Testing is risk-based rather than one-test-file-per-production-file: add automated tests for pure utilities, business rules, parsers/normalizers, data mapping/validation, and service behavior with meaningful cache, retry, error, privacy, or state semantics. Keep tests beside the module that owns the behavior; do not place another module's contract tests in an unrelated test file. Trivial constants/types and presentation-only components do not require unit tests solely for coverage.

The current suite does not include a DOM/component runner, browser E2E framework, or Firestore emulator test dependency. Verify component interaction, responsive/theme behavior, authentication flows, PWA/browser behavior, and other browser-only contracts manually until the project explicitly adopts the appropriate test layer. Firestore security rules require emulator-backed verification rather than mocked client tests. Before opening a PR, run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`, then perform the manual checks relevant to the affected scope.

## Commit & Pull Request Guidelines

Recent history follows Conventional Commit prefixes such as `feat:` and `chore:`; also use `fix:`, `docs:`, or `refactor:` where appropriate. Keep each commit focused and write an imperative summary. PRs should explain what changed and why, link the relevant issue, list verification performed, and include before/after screenshots for visible UI changes.

## Security & Configuration

Never commit `.env`, API keys, or Firebase credentials. Variables prefixed with `VITE_` are exposed to browser code, so they must not contain privileged server-side secrets. Review `firestore.rules` carefully whenever data access behavior changes.
