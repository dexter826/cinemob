# CineMOB Design System Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the complete CineMOB interface into a consistent, accessible, responsive “Neon Cinema Lounge” system while preserving routes, behavior, splash, confetti, and other approved brand invariants.

**Architecture:** Establish evidence and a written design contract first, then build a small shared primitive layer, validate it through the Library/navigation/Add Movie/Share vertical slice, and only then migrate the remaining feature screens. Finish with branded experiences, PWA alignment, evidence-based cleanup, performance measurement, and a full regression gate.

**Tech Stack:** React 19.2, TypeScript 5.8, React Router 7.9, Tailwind CSS 4.1, Framer Motion 12.23, Zustand 5, Vite 6, Vitest 5, vite-plugin-pwa 1.2, Lottie React 2.4, Lucide React 0.554

**Spec:** `docs/superpowers/specs/2026-09-26-cinemob-design-system-refresh.md`

## Global Constraints

- Read the approved spec and current `DESIGN.md` before changing source code.
- Preserve routes, business rules, feature meaning, stores, services, and established user flows.
- Preserve emerald, poster-led imagery, CineMOB name/logo, SplashScreen artwork, Random Picker confetti artwork, Be Vietnam Pro, and Inter.
- Dark mode is flagship; light mode must remain complete and accessible.
- Target WCAG 2.2 AA for primary flows.
- Support current Chrome/Edge, Firefox, Safari, Android PWA, and iOS PWA behavior within platform limits.
- Use mobile-first CSS and verify at 320, 375, 768, 1024, and 1440 px.
- Do not add a UI, animation, accessibility, or test dependency without a separate owner decision.
- Do not remove a production file without an approved deletion manifest.
- Do not change SplashScreen or confetti artwork.
- Play the full splash on application start and full reload, never on internal navigation, and never on public `/share/:uid`.
- Trigger confetti only after Random Picker selects a film.
- Do not animate the complete route or tab screen.
- Keep feature-specific components inside their feature; add a shared primitive only for two real consumers or a global contract.
- Use two-space indentation, single quotes, semicolons, and functional components without `React.FC` in new code.
- Do not edit generated `dist/` or `dev-dist/` output.
- Do not stage, commit, push, create a branch, squash, or perform any other Git mutation. The product owner handles Git.
- Before editing the initially modified files below, inspect their current working diff and preserve owner changes:
  - `src/features/movies/components/AddMovieModal.tsx`
  - `src/features/movies/hooks/useAddMovieForm.ts`
  - `src/shared/components/layout/MobileBottomNav.tsx`
- The existing Vitest configuration supports Node tests matching `src/**/*.test.ts`; do not silently introduce DOM-test dependencies. Pure logic receives automated tests; component interaction receives explicit browser QA until a separate test-dependency gate is approved.

## Review Focus

1. **Nested overlays and focus:** opening a picker inside Add Movie or Album Selector must keep exactly one scroll lock, trap focus in the topmost surface, close in the correct order, and restore focus to the launching control.
2. **Narrow mobile and virtual keyboards:** at 320 px, long Vietnamese labels and mobile keyboards must not hide the primary action, create horizontal overflow, or make full-screen forms impossible to close.
3. **Reduced motion:** modal transitions, Random Picker, confetti, loading indicators, and splash must stop non-essential movement while preserving a clear static result and usable controls.
4. **Abnormal content:** missing posters, long movie/album/person names, missing dates, empty result sets, and large collections must preserve layout and expose complete accessible names.
5. **Public share entry:** `/share/:uid` must bypass auth and splash, handle invalid/disabled links without leaking private data, and retain CineMOB branding in both themes.

---

## Locked File Structure

### New shared files

- `src/shared/utils/classNames.ts` — dependency-free conditional class composition.
- `src/shared/utils/classNames.test.ts` — pure unit tests for class composition.
- `src/shared/components/ui/Button.tsx` — primary, secondary, ghost, and danger button contract.
- `src/shared/components/ui/IconButton.tsx` — icon-only button with mandatory accessible label.
- `src/shared/components/ui/Surface.tsx` — bounded base, interactive, and elevated surface recipes.
- `src/shared/components/ui/FormField.tsx` — label, hint, required state, and error relationship.
- `src/shared/components/ui/Dialog.tsx` — portal, overlay, presentation, semantics, motion, Escape, and focus lifecycle.
- `src/shared/hooks/useFocusTrap.ts` — focus containment and restoration for the topmost dialog.
- `src/shared/components/ui/ErrorState.tsx` — recoverable and terminal error presentation.
- `src/shared/components/layout/navigation.ts` — navigation definitions and pure active-route matching.
- `src/shared/components/layout/navigation.test.ts` — active-route behavior tests.
- `src/constants/animations.test.ts` — tests for the centralized motion contract.
- `src/shared/utils/splashPolicy.ts` — pure route/reduced-motion splash policy.
- `src/shared/utils/splashPolicy.test.ts` — splash policy tests including `/share/:uid`.
- `docs/design-refresh/baseline.md` — measured pre-change evidence.
- `docs/design-refresh/deletion-manifest.md` — evidence and approval record for deletion candidates.
- `docs/design-refresh/release-verification.md` — final automated and manual evidence.

### Existing foundation files

- `DESIGN.md`
- `src/index.css`
- `tailwind.config.js`
- `src/constants/animations.ts`
- `src/App.tsx`
- `src/app/providers/ThemeProvider.tsx`
- `src/shared/components/layout/Layout.tsx`
- `src/shared/components/layout/Navbar.tsx`
- `src/shared/components/layout/MobileBottomNav.tsx`
- `src/shared/components/layout/Footer.tsx`
- `src/shared/components/feedback/SplashScreen.tsx`
- `src/shared/components/feedback/ToastContainer.tsx`
- `src/shared/components/feedback/AlertContainer.tsx`
- `src/shared/components/ui/PageHeader.tsx`
- `src/shared/components/ui/Loading.tsx`
- `src/shared/components/ui/EmptyState.tsx`
- `src/shared/components/ui/SkeletonCard.tsx`
- `src/shared/components/ui/CustomDropdown.tsx`
- `src/shared/components/ui/MultiSelectDropdown.tsx`
- `src/shared/components/ui/CustomDatePicker.tsx`
- `src/shared/components/ui/CustomTimePicker.tsx`

### Vertical-slice files

- `src/features/dashboard/pages/Dashboard.tsx`
- `src/features/dashboard/components/DashboardActions.tsx`
- `src/features/dashboard/components/DashboardFilters.tsx`
- `src/features/dashboard/components/DashboardTabs.tsx`
- `src/features/movies/components/MovieCard.tsx`
- `src/features/movies/components/AddMovieModal.tsx`
- `src/features/movies/components/add-movie/AlbumSection.tsx`
- `src/features/movies/components/add-movie/MovieFormFields.tsx`
- `src/features/movies/components/add-movie/PosterPreview.tsx`
- `src/features/movies/components/add-movie/RatingSection.tsx`
- `src/features/movies/components/add-movie/StatusToggle.tsx`
- `src/features/movies/components/add-movie/TVProgressSection.tsx`
- `src/features/share/components/ShareModal.tsx`
- `src/features/share/pages/SharePage.tsx`

### Feature-expansion files

- Search: `src/features/search/pages/*.tsx`, `src/features/search/components/*.tsx`, `src/features/search/components/person/*.tsx`
- Albums: `src/features/albums/pages/*.tsx`, `src/features/albums/components/AlbumSelectorModal.tsx`
- Statistics: `src/features/stats/pages/StatsPage.tsx`, `src/features/stats/components/StatsCard.tsx`
- Calendar: `src/features/calendar/pages/ReleaseCalendarPage.tsx`, `src/features/calendar/components/*.tsx`
- Remaining movie surfaces: `MovieDetailModal.tsx`, `ExportModal.tsx`
- Authentication surfaces: `Login.tsx`, `ChangeAvatarModal.tsx`, `auth/components/avatar/*.tsx`
- Cinematic experience: `RandomPickerModal.tsx`, `random-picker/PickerWheel.tsx`, `SplashScreen.tsx`

---

## Phase 0 — Baseline and Evidence

### Task 1: Protect the Worktree and Capture the Baseline

**Files:**
- Create: `docs/design-refresh/baseline.md`
- Read only: the complete repository

**Interfaces:**
- Consumes: current source, current browser behavior, current build output.
- Produces: an evidence document used by every later review gate.

- [ ] **Step 1: Record the worktree before touching source**

Run:

```powershell
git status --short
git diff -- src/features/movies/components/AddMovieModal.tsx src/features/movies/hooks/useAddMovieForm.ts src/shared/components/layout/MobileBottomNav.tsx
```

Expected: the three known files may appear modified; copy the exact status and diff observations into the baseline document. Do not normalize line endings or overwrite them.

- [ ] **Step 2: Run the complete automated baseline**

Run each command separately:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: record the exit code, test count, warning count, build duration shown by Vite, and every emitted asset size. A pre-existing failure is evidence, not permission to weaken a rule.

- [ ] **Step 3: Inventory known invalid or fragmented styling**

Run:

```powershell
rg -n "animate-in|slide-in-from-|fade-in|zoom-in-95|xs:|bg-primary-hover|text-primary-dark|transition-all|active:scale|backdrop-blur|uppercase.*tracking" src
rg -n "AnimatePresence|motion\.|MODAL_VARIANTS|OVERLAY_VARIANTS" src
rg -n "role=.?dialog|aria-modal|focus-visible" src
```

Expected: `baseline.md` groups results under invalid utilities, motion consumers, modal semantics, focus treatment, glass/glow, and typography drift.

- [ ] **Step 4: Capture current visual evidence**

Create screenshots under `docs/images/design-refresh/baseline/` for:

```text
login-dark-375.png
login-light-375.png
library-dark-320.png
library-dark-1440.png
add-movie-dark-375.png
share-dark-375.png
stats-dark-1440.png
albums-light-1024.png
calendar-dark-375.png
random-picker-result-375.png
```

Record the route, theme, viewport, data state, browser, and whether authentication or seeded data was required for each screenshot.

- [ ] **Step 5: Reproduce the flicker with an explicit matrix**

Test Add Movie, Share, Movie Detail, Random Picker, Export, Album Selector, Change Avatar, and route/tab navigation. For every case record:

```text
trigger → visible symptom → number of flashes → browser → viewport → theme → first open or repeated open
```

Expected: evidence distinguishes overlay flashing, content remounting, full-screen route flashing, layout shift, and StrictMode-only behavior.

- [ ] **Step 6: Record the performance baseline**

Use a production build and browser Performance panel. Record:

- Initial JS/CSS transfer sizes from the Vite build output
- Lottie chunk size
- Cold navigation to `/`
- Modal open scripting/rendering time for Add Movie and Share
- Route change from Library to Statistics
- Visible layout shift or long task observations

Do not set final budgets in this task.

- [ ] **Step 7: Stop for Phase 0 review**

Review gate: baseline evidence exists, the flicker is categorized, no source code changed, and owner work remains untouched.

---

## Phase 1 — Design Contract and Foundations

### Task 2: Replace `DESIGN.md` with the Approved Source of Truth

**Files:**
- Modify: `DESIGN.md`
- Read: `docs/superpowers/specs/2026-09-26-cinemob-design-system-refresh.md`

**Interfaces:**
- Consumes: approved specification and measured baseline.
- Produces: the authoritative design contract used by all later tasks.

- [ ] **Step 1: Replace the document outline**

Use these top-level sections in this exact order:

```markdown
# CineMOB Design System
## Creative North Star
## Brand Invariants
## Experience Principles
## Color and Theme Tokens
## Typography
## Spacing and Layout
## Surfaces, Radius, Border, and Shadow
## Iconography
## Motion
## Navigation
## Dialogs and Overlays
## Forms and Controls
## Feedback and Application States
## Responsive Behavior
## Accessibility
## Brand Moments
## Component Ownership
## Decision Gates
## Review Checklist
```

- [ ] **Step 2: Copy every approved contract into the appropriate section**

The document must explicitly state:

```text
Emerald + posters + logo + SplashScreen + Random Picker confetti are brand invariants.
Dark is flagship; light is complete.
Be Vietnam Pro is display; Inter is interface/body.
Glass is elevated; glow is primary/active/brand only.
No complete route/tab animation.
Full splash on app start/reload; no splash on internal navigation or /share/:uid.
Confetti only after Random Picker selection.
WCAG 2.2 AA primary-flow target.
320/375/768/1024/1440 review widths.
No dependency or deletion without a decision gate.
```

- [ ] **Step 3: Add concrete do/don’t examples**

Include at least these pairs:

```text
Do: group a section with spacing and a heading.
Don't: wrap every section in a rounded glass card.

Do: use emerald for a primary action or active selection.
Don't: make every decorative icon emerald.

Do: animate one dialog surface once.
Don't: animate the overlay, route, child sections, and button simultaneously.

Do: use natural Vietnamese sentence case.
Don't: use 10px uppercase tracking-widest for ordinary field labels.
```

- [ ] **Step 4: Validate coverage and terminology**

Run:

```powershell
rg -n "Splash|confetti|share/:uid|WCAG 2.2 AA|320|1440|Be Vietnam Pro|Inter|glass|glow|deletion|dependency" DESIGN.md
```

Expected: every approved invariant and decision gate has an explicit match.

- [ ] **Step 5: Stop for documentation review**

Review gate: `DESIGN.md` is complete, current, internally consistent, and does not claim that splash/confetti are removable cleanup targets.

### Task 3: Introduce Semantic Tokens and Restore Global Accessibility

**Files:**
- Modify: `src/index.css`
- Modify: `tailwind.config.js`
- Modify: `index.html`
- Modify: `src/app/providers/ThemeProvider.tsx`

**Interfaces:**
- Consumes: token names from `DESIGN.md`.
- Produces: stable Tailwind utilities for every later component.

- [ ] **Step 1: Expand the CSS variable contract**

Keep legacy aliases during migration, but define these semantic variables for both `:root` and `.dark`:

```css
--color-background
--color-surface
--color-surface-elevated
--color-primary
--color-primary-hover
--color-on-primary
--color-text-primary
--color-text-secondary
--color-border
--color-focus
--color-success
--color-warning
--color-danger
--color-info
--shadow-card
--shadow-elevated
--radius-control
--radius-card
--radius-dialog
```

Keep `--color-text-main`, `--color-text-muted`, and `--border-default` as aliases until all feature files migrate. Do not break the application in the foundation task.

- [ ] **Step 2: Expose semantic variables through Tailwind**

Update the `colors`, `borderRadius`, and `boxShadow` extensions so later code can use this vocabulary:

```javascript
colors: {
  background: 'rgb(var(--color-background) / <alpha-value>)',
  surface: 'rgb(var(--color-surface) / <alpha-value>)',
  'surface-elevated': 'rgb(var(--color-surface-elevated) / <alpha-value>)',
  primary: 'rgb(var(--color-primary) / <alpha-value>)',
  'primary-hover': 'rgb(var(--color-primary-hover) / <alpha-value>)',
  'on-primary': 'rgb(var(--color-on-primary) / <alpha-value>)',
  'text-primary': 'rgb(var(--color-text-primary) / <alpha-value>)',
  'text-secondary': 'rgb(var(--color-text-secondary) / <alpha-value>)',
  border: 'rgb(var(--color-border) / <alpha-value>)',
  focus: 'rgb(var(--color-focus) / <alpha-value>)',
  success: 'rgb(var(--color-success) / <alpha-value>)',
  warning: 'rgb(var(--color-warning) / <alpha-value>)',
  danger: 'rgb(var(--color-danger) / <alpha-value>)',
  info: 'rgb(var(--color-info) / <alpha-value>)'
}
```

Keep the existing `text-main`, `text-muted`, `border-default`, `error`, and other legacy mappings during migration so this foundation task does not break existing consumers. New primitives use the semantic names; Task 23 removes aliases only after `rg` proves zero consumers. Do not add an `xs` breakpoint. Styles below `sm` are the base mobile contract.

- [ ] **Step 3: Remove the global outline suppression**

Replace the current button reset with a reset that preserves focus and add a universal keyboard focus recipe:

```css
button {
  -webkit-appearance: none;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
}

:where(button, a, input, textarea, select, [role='button'], [tabindex]):focus-visible {
  outline: 2px solid rgb(var(--color-focus));
  outline-offset: 3px;
}
```

- [ ] **Step 4: Add reduced-motion protection**

Add a global safety net without disabling meaningful loading state:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    scroll-behavior: auto !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

Brand components will provide explicit static alternatives in later tasks.

- [ ] **Step 5: Correct root language and theme-safe body text**

Set `lang="vi"` in `index.html` and change the body classes from hard-coded white text to semantic text:

```html
<body class="bg-background font-sans text-text-primary antialiased">
```

- [ ] **Step 6: Make system theme changes reactive**

When `theme === 'system'`, subscribe to `matchMedia('(prefers-color-scheme: dark)')` and update the root class when the operating-system theme changes. Remove the listener on cleanup.

- [ ] **Step 7: Verify the foundation**

Run:

```powershell
npm run typecheck
npm run lint
npm run build
rg -n "outline:\s*none|xs:" src index.html
```

Expected: build passes; focus is visible by keyboard; `index.html` is Vietnamese; no new use of undeclared `xs` is introduced.

### Task 4: Centralize the Motion Contract and Stabilize the App Shell

**Files:**
- Modify: `src/constants/animations.ts`
- Create: `src/constants/animations.test.ts`
- Modify: `src/shared/components/layout/Layout.tsx`
- Modify: `src/index.css`

**Interfaces:**
- Consumes: Framer Motion `Variants` and `Transition`.
- Produces: `MOTION_DURATION`, `MOTION_EASING`, `OVERLAY_VARIANTS`, `DIALOG_VARIANTS`, and `getMotionTransition(reducedMotion)`.

- [ ] **Step 1: Write the failing motion-contract test**

Create assertions that lock the approved properties:

```typescript
import { describe, expect, it } from 'vitest';
import { DIALOG_VARIANTS, MOTION_DURATION, OVERLAY_VARIANTS } from './animations';

describe('motion contract', () => {
  it('keeps dialog movement small and never scales the dialog', () => {
    expect(DIALOG_VARIANTS.closed).toMatchObject({ opacity: 0, y: 8 });
    expect(DIALOG_VARIANTS.open).toMatchObject({ opacity: 1, y: 0 });
    expect(DIALOG_VARIANTS.closed).not.toHaveProperty('scale');
    expect(DIALOG_VARIANTS.open).not.toHaveProperty('scale');
  });

  it('uses bounded motion durations', () => {
    expect(MOTION_DURATION.fast).toBeGreaterThanOrEqual(0.12);
    expect(MOTION_DURATION.deliberate).toBeLessThanOrEqual(0.3);
    expect(OVERLAY_VARIANTS.closed).toEqual({ opacity: 0 });
  });
});
```

- [ ] **Step 2: Run the focused test and observe failure**

Run:

```powershell
npm test -- src/constants/animations.test.ts
```

Expected: fail because the new exports and state names do not exist.

- [ ] **Step 3: Implement the centralized contract**

Use stable, non-spring transitions and no modal scale:

```typescript
import type { Transition, Variants } from 'framer-motion';

export const MOTION_DURATION = {
  fast: 0.14,
  standard: 0.2,
  deliberate: 0.28,
} as const;

export const MOTION_EASING = {
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
} as const;

export const OVERLAY_VARIANTS: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1 },
};

export const DIALOG_VARIANTS: Variants = {
  closed: { opacity: 0, y: 8 },
  open: { opacity: 1, y: 0 },
};

export const getMotionTransition = (reducedMotion: boolean): Transition => ({
  duration: reducedMotion ? 0 : MOTION_DURATION.deliberate,
  ease: MOTION_EASING.enter,
});
```

Keep temporary compatibility exports only if required to keep the app compiling during migration; mark their removal in Task 23.

- [ ] **Step 4: Remove decorative footer mounting animation**

In `Layout.tsx`, render `<Footer />` directly when `showFooter` is true. Remove `AnimatePresence` and `motion` imports. Do not animate the full layout, route content, or footer mount.

- [ ] **Step 5: Run focused and complete checks**

Run:

```powershell
npm test -- src/constants/animations.test.ts
npm run typecheck
npm run lint
```

Expected: all pass.

---

## Phase 2 — Shared Primitives

### Task 5: Build Class Composition, Button, and IconButton

**Files:**
- Create: `src/shared/utils/classNames.ts`
- Create: `src/shared/utils/classNames.test.ts`
- Create: `src/shared/components/ui/Button.tsx`
- Create: `src/shared/components/ui/IconButton.tsx`

**Interfaces:**
- Produces: `classNames(...values): string`, `Button`, and `IconButton`.
- Button props: native button props plus `variant`, `size`, `loading`, `leadingIcon`, and `trailingIcon`.
- IconButton props: native button props plus mandatory `label`, `size`, and `variant`.

- [ ] **Step 1: Write the class-composition test**

```typescript
import { describe, expect, it } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('keeps truthy classes in order', () => {
    expect(classNames('base', false, undefined, 'active', null, 'compact')).toBe('base active compact');
  });
});
```

- [ ] **Step 2: Verify the test fails, then implement the utility**

Run `npm test -- src/shared/utils/classNames.test.ts`; expect a missing-module failure. Then implement:

```typescript
export const classNames = (
  ...values: Array<string | false | null | undefined>
): string => values.filter(Boolean).join(' ');
```

- [ ] **Step 3: Implement `Button` with a bounded variant map**

Use this public contract:

```typescript
type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}
```

Required behavior:

- Default `type="button"` unless explicitly supplied.
- `aria-busy="true"` while loading.
- Disable interaction while loading without replacing the accessible name.
- Primary buttons use the tested `on-primary` foreground token rather than assuming white text has sufficient contrast in both themes.
- Use semantic token classes, explicit transition properties, and no default scale transform.
- Keep one focus-visible treatment supplied by the global contract.

- [ ] **Step 4: Implement `IconButton` with a mandatory label**

Use this contract:

```typescript
interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'danger';
}
```

Render `aria-label={label}` and `title={title ?? label}`. Do not accept unlabeled icon-only controls.

- [ ] **Step 5: Verify**

Run:

```powershell
npm test -- src/shared/utils/classNames.test.ts
npm run typecheck
npm run lint
```

Expected: pass with no `React.FC` in the new components.

### Task 6: Build Surface, PageHeader, and State Primitives

**Files:**
- Create: `src/shared/components/ui/Surface.tsx`
- Modify: `src/shared/components/ui/PageHeader.tsx`
- Modify: `src/shared/components/ui/Loading.tsx`
- Modify: `src/shared/components/ui/EmptyState.tsx`
- Create: `src/shared/components/ui/ErrorState.tsx`
- Modify: `src/shared/components/ui/SkeletonCard.tsx`

**Interfaces:**
- Produces: `Surface`, revised `PageHeader`, `Loading`, `EmptyState`, `ErrorState`, and `SkeletonCard` recipes.

- [ ] **Step 1: Implement a narrow Surface API**

```typescript
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'base' | 'interactive' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

Map `base` to quiet separation, `interactive` to a visible hover/focus contract, and `elevated` to dialog/popover elevation. Do not add glass to `base` or `interactive` by default.

- [ ] **Step 2: Replace PageHeader’s mandatory icon-tile composition**

Use this contract:

```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
}
```

During migration, also accept the current `icon` and `children` props as compatibility inputs: map `children` to `actions` and render `icon` as an unboxed leading icon. Render title/description as the primary hierarchy. `leading` is optional and never receives an automatic icon tile. Back navigation uses `IconButton`. Remove compatibility props in Task 23 only after all consumers migrate.

- [ ] **Step 3: Make loading states stable and reduced-motion safe**

- Remove backdrop blur from contained loading.
- Use one spinner rotation only under normal motion.
- Under reduced motion, render a static progress glyph plus visible loading text.
- Keep full-screen loading for true application blocking only.
- Do not mutate `isPageLoading` for a small inline loader.

- [ ] **Step 4: Make EmptyState quiet and semantic**

- Remove entrance motion, hover decoration, and pulsing placeholder.
- Treat icon as optional supporting content.
- Use `Button` for the action.
- Allow `compact` presentation for filters and small panels.

- [ ] **Step 5: Add ErrorState**

Use this contract:

```typescript
interface ErrorStateProps {
  title: string;
  description: string;
  retry?: { label: string; onClick: () => void };
  compact?: boolean;
}
```

Use `role="alert"` only for a newly surfaced blocking error; do not force all static error pages into a live region.

- [ ] **Step 6: Normalize SkeletonCard**

Match MovieCard geometry exactly and disable shimmer under reduced motion. Skeleton layout must reserve final poster and metadata space to avoid shift.

- [ ] **Step 7: Verify both themes and widths**

Run `npm run typecheck`, `npm run lint`, and `npm run build`. Manually inspect the primitives wherever currently consumed at 320 and 1440 px in both themes.

### Task 7: Build the Accessible Dialog Foundation

**Files:**
- Create: `src/shared/hooks/useFocusTrap.ts`
- Create: `src/shared/components/ui/Dialog.tsx`
- Modify: `src/shared/hooks/usePreventScroll.ts`
- Modify: `src/constants/animations.ts`

**Interfaces:**
- Produces: `Dialog`, `DialogHeader`, `DialogBody`, and `DialogFooter`.
- Dialog presentations: `dialog`, `sheet`, and `fullscreen-mobile`.

- [ ] **Step 1: Implement focus containment and restoration**

`useFocusTrap` must:

```typescript
interface FocusTrapOptions {
  active: boolean;
  containerRef: React.RefObject<HTMLElement | null>;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  onEscape: () => void;
}
```

- Give every active trap a stable `Symbol` token and maintain a module-level token stack.
- Push the token on activation, remove that exact token on cleanup, and respond to Escape/Tab only when the token is the final stack entry.
- Save the previously focused `HTMLElement` when activated.
- Focus `initialFocusRef`, otherwise the first enabled focusable element, otherwise the dialog container.
- Cycle Tab and Shift+Tab within the current container.
- Handle Escape only for the topmost dialog.
- Restore focus on cleanup if the saved element remains connected.

- [ ] **Step 2: Make scroll locking preserve layout**

Extend `usePreventScroll` so the first lock:

- Stores original `overflow` and `paddingRight`.
- Computes scrollbar width as `window.innerWidth - document.documentElement.clientWidth`.
- Adds equivalent right padding only when needed.
- Restores exact original values after the final nested lock closes.

Retain the existing reference count for nested overlays.

- [ ] **Step 3: Implement the Dialog public contract**

```typescript
interface DialogProps {
  open: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  presentation?: 'dialog' | 'sheet' | 'fullscreen-mobile';
  initialFocusRef?: React.RefObject<HTMLElement | null>;
  closeOnOverlay?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

Required structure:

```tsx
<AnimatePresence>
  {open && createPortal(
    <motion.div role="presentation" className="fixed inset-0 ...">
      <motion.section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
      >
        {children}
      </motion.section>
    </motion.div>,
    document.body
  )}
</AnimatePresence>
```

Use `useReducedMotion()`, centralized variants, and one transition. Overlay click closes only when `event.target === event.currentTarget`.

- [ ] **Step 4: Implement presentation recipes**

- `dialog`: centered, bounded height and width.
- `sheet`: bottom-aligned below `sm`, centered at `sm` and above.
- `fullscreen-mobile`: fills the viewport below `sm`, becomes a wide centered dialog at `sm` and above.
- Include `env(safe-area-inset-bottom)` in mobile footer spacing.

- [ ] **Step 5: Inspect the stack and cleanup paths before adding a consumer**

Confirm that deactivating a non-topmost nested trap removes only its own token, that an unmounted trigger does not receive focus, and that all document listeners are removed on cleanup. Task 9 supplies the first production consumer; do not create a hidden demo route.

- [ ] **Step 6: Verify**

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

### Task 8: Normalize FormField and Selection Controls

**Files:**
- Create: `src/shared/components/ui/FormField.tsx`
- Modify: `src/shared/components/ui/CustomDropdown.tsx`
- Modify: `src/shared/components/ui/MultiSelectDropdown.tsx`
- Modify: `src/shared/components/ui/CustomDatePicker.tsx`
- Modify: `src/shared/components/ui/CustomTimePicker.tsx`

**Interfaces:**
- Produces: consistent label/hint/error relationships and keyboard/focus behavior.

- [ ] **Step 1: Implement FormField IDs and relationships**

```typescript
interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}
```

Expose helper IDs `${id}-hint` and `${id}-error` in rendered markup. Consumers must connect `aria-describedby` and `aria-invalid` to the actual input. Use sentence case, not automatic uppercase tracking.

- [ ] **Step 2: Fix dropdown semantics and keyboard behavior**

For `CustomDropdown` and `MultiSelectDropdown`:

- Trigger is a button with `aria-haspopup="listbox"`, `aria-expanded`, and `aria-controls`.
- Options use `role="option"` and `aria-selected`.
- Arrow keys move active option; Enter/Space selects; Escape closes and restores trigger focus.
- The popup has a stable opaque fallback plus optional elevated glass.
- Remove ineffective `animate-in` classes.

- [ ] **Step 3: Migrate date and time pickers to the dialog foundation**

- Use `Dialog` or the same focus lifecycle when the picker is modal.
- Keep calendar/time selection behavior unchanged.
- Replace tiny uppercase labels with sentence case.
- Ensure nested opening from Add Movie does not break the parent scroll lock.

- [ ] **Step 4: Test at narrow width and with long values**

At 320 px verify long country, genre, album, date, and time labels truncate or wrap without pushing controls outside the viewport. Verify all selection paths using only the keyboard.

- [ ] **Step 5: Verify**

Run `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`.

### Task 9: Normalize Toast and Confirmation Feedback

**Files:**
- Modify: `src/shared/components/feedback/ToastContainer.tsx`
- Modify: `src/shared/components/feedback/AlertContainer.tsx`
- Modify: `src/shared/stores/toastStore.ts`
- Modify: `src/shared/stores/alertStore.ts`

**Interfaces:**
- Consumes: `Dialog`, `Button`, and `IconButton`.
- Produces: tiered feedback behavior without changing existing store call sites.

- [ ] **Step 1: Make toast announcements semantic**

- Success/info container: `role="status"`, `aria-live="polite"`.
- Warning/error container: `role="alert"`, `aria-live="assertive"` only when immediate attention is required.
- Use `aria-atomic="true"` per message.
- Preserve manual dismissal and timed dismissal.
- Remove scale animation; use a small vertical/opacity transition through centralized motion tokens.
- Use elevated opaque surface with restrained blur, not color-washed translucent text.

- [ ] **Step 2: Migrate AlertContainer to Dialog**

Use a stable title ID and description ID, focus the safest action by default, and return focus after close. Keep existing `showAlert` API intact so business call sites do not change.

- [ ] **Step 3: Prove the dialog focus lifecycle with the first production consumer**

Open AlertContainer and verify Tab loop, Shift+Tab loop, Escape, overlay policy, scroll lock, and focus restoration. Then open it from a context with another overlay active and verify only the topmost surface handles keyboard input.

- [ ] **Step 4: Verify destructive and ordinary cases**

Manually trigger logout, movie deletion, album deletion, an info confirmation, a success toast, and an error toast. Confirm that only destructive/hard-to-reverse actions use confirmation.

- [ ] **Step 5: Run the Phase 2 gate**

Run:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Review gate: primitives work in both themes, focus is visible, Dialog passes keyboard checks, and no feature-wide migration has started.

---

## Phase 3 — Representative Vertical Slice

### Task 10: Stabilize Navigation and App Shell

**Files:**
- Create: `src/shared/components/layout/navigation.ts`
- Create: `src/shared/components/layout/navigation.test.ts`
- Modify: `src/shared/components/layout/Navbar.tsx`
- Modify: `src/shared/components/layout/MobileBottomNav.tsx`
- Modify: `src/shared/components/layout/Layout.tsx`
- Modify: `src/shared/components/layout/Footer.tsx`

**Interfaces:**
- Produces: `NAV_ITEMS` and `isNavItemActive(pathname, item)` used by desktop and mobile navigation.

- [ ] **Step 1: Write active-route tests**

```typescript
import { describe, expect, it } from 'vitest';
import { isNavItemActive } from './navigation';

describe('isNavItemActive', () => {
  it('matches exact routes without activating unrelated routes', () => {
    expect(isNavItemActive('/stats', { to: '/stats', match: 'exact' })).toBe(true);
    expect(isNavItemActive('/stats-extra', { to: '/stats', match: 'exact' })).toBe(false);
  });

  it('matches album detail routes by prefix', () => {
    expect(isNavItemActive('/albums/abc', { to: '/albums', match: 'prefix' })).toBe(true);
  });
});
```

- [ ] **Step 2: Implement one navigation definition**

```typescript
export interface NavigationItem {
  to: string;
  label: string;
  match: 'exact' | 'prefix';
}

export const NAV_ITEMS: NavigationItem[] = [
  { to: '/', label: 'Thư viện', match: 'exact' },
  { to: '/search', label: 'Tìm phim', match: 'exact' },
  { to: '/stats', label: 'Thống kê', match: 'exact' },
  { to: '/albums', label: 'Album', match: 'prefix' },
  { to: '/calendar', label: 'Lịch', match: 'exact' },
];
```

Associate Lucide icons in the rendering components rather than putting JSX in this pure test module.

- [ ] **Step 3: Refactor desktop navigation**

- Render semantic `<nav aria-label="Điều hướng chính">` and links/buttons with stable active state.
- Retain Random Picker, Export, theme, avatar, and logout actions.
- Remove active scale and decorative motion.
- Use `Button`/`IconButton` where applicable.
- Ensure account dropdown has keyboard close and focus behavior.

- [ ] **Step 4: Refactor mobile bottom navigation**

- Keep it fixed and safe-area aware.
- Remove the spring/animated active background.
- Use color, weight, and a stable indicator for active state.
- Ensure each target is at least a practical touch size and has visible focus.
- Preserve any current owner changes in this initially modified file.

- [ ] **Step 5: Quiet the shell**

- Use one page container rhythm.
- Keep bottom padding equal to the actual mobile navigation plus safe area.
- Remove Footer pulse animation and the decorative “Made with ♥” motion; retain footer content in a quiet treatment.
- Confirm route changes do not remount or fade the complete shell.

- [ ] **Step 6: Verify Review Focus navigation cases**

At every required width, move between all routes repeatedly with mouse and keyboard. Expected: no flash, no shell jump, correct active route, no covered final content, and no horizontal overflow.

### Task 11: Redesign the Movie Library and MovieCard

**Files:**
- Modify: `src/features/dashboard/pages/Dashboard.tsx`
- Modify: `src/features/dashboard/components/DashboardActions.tsx`
- Modify: `src/features/dashboard/components/DashboardFilters.tsx`
- Modify: `src/features/dashboard/components/DashboardTabs.tsx`
- Modify: `src/features/movies/components/MovieCard.tsx`
- Modify: `src/shared/components/ui/Pagination.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `Button`, `IconButton`, `Surface`, `EmptyState`, and existing `useDashboard` API.
- Produces: the approved management-screen composition and poster-card recipe used later by Album and Search.

- [ ] **Step 1: Recompose the page hierarchy without changing data flow**

Use this structural order:

```tsx
<main className="page-container">
  <PageHeader title="Thư viện điện ảnh" description="Quản lý bộ sưu tập phim cá nhân." actions={...} />
  <DashboardActions ... />
  <section aria-labelledby="library-content-title">
    <DashboardTabs ... />
    <DashboardFilters ... />
    {/* loading, empty, grid, pagination */}
  </section>
</main>
```

Do not wrap the complete content section in an additional card.

- [ ] **Step 2: Establish clear action priority**

- “Tìm phim” is primary.
- “Thêm thủ công” is secondary.
- “Chia sẻ” is a header action.
- Remove large nested icon tiles and repeated promotional copy.
- Keep actions usable at 320 px without truncating their meaning.

- [ ] **Step 3: Normalize tabs and filters**

- Tabs use semantic buttons with `aria-selected` or tab semantics when panel ownership is explicit.
- Active state uses indicator/color, not scale.
- Filter count and clear action remain visible when filters are active.
- Filter popup uses the elevated surface recipe and no invalid animation utility.
- Search/filter controls have labels or accessible names.

- [ ] **Step 4: Make MovieCard semantically correct**

Use a real button or link for the main card action instead of a clickable `div`. Keep nested delete/edit/watched actions outside that main interactive element so interactive elements are not nested.

Required card order:

```text
poster → essential status badges → title/subtitle → compact metadata → independent actions
```

Keep missing-poster fallback, TV progress, rating, review status, and all existing callbacks. Reduce simultaneous badges when the same information is present in metadata.

- [ ] **Step 5: Test all Library states**

Verify:

- Loading skeleton geometry matches final cards.
- Empty history and empty watchlist have distinct copy and valid actions.
- No-results state clears active filters.
- Missing poster and 80-character Vietnamese title do not break the grid.
- Delete/edit/watch actions do not open Movie Detail.
- Main card works with Enter and Space.
- 100+ items paginate without layout jump.

- [ ] **Step 6: Verify**

Run complete automated checks and capture before/after screenshots at 320, 375, 1024, and 1440 px in both themes.

### Task 12: Migrate Add Movie to the Dialog and Form System

**Files:**
- Modify: `src/features/movies/components/AddMovieModal.tsx`
- Read/preserve: `src/features/movies/hooks/useAddMovieForm.ts`
- Modify: `src/features/movies/components/add-movie/AlbumSection.tsx`
- Modify: `src/features/movies/components/add-movie/MovieFormFields.tsx`
- Modify: `src/features/movies/components/add-movie/PosterPreview.tsx`
- Modify: `src/features/movies/components/add-movie/RatingSection.tsx`
- Modify: `src/features/movies/components/add-movie/StatusToggle.tsx`
- Modify: `src/features/movies/components/add-movie/TVProgressSection.tsx`

**Interfaces:**
- Consumes: `Dialog presentation="fullscreen-mobile"`, `FormField`, `Button`, selection controls, and existing add-movie store/hook behavior.
- Produces: the reference complex-form modal.

- [ ] **Step 1: Inspect and preserve owner changes**

Run:

```powershell
git diff -- src/features/movies/components/AddMovieModal.tsx src/features/movies/hooks/useAddMovieForm.ts
```

Do not reformat or rewrite `useAddMovieForm.ts` unless a verified UI contract requires a small behavior change.

- [ ] **Step 2: Replace local overlay/motion wrappers**

Wrap the existing form content with:

```tsx
<Dialog
  open={isOpen}
  onClose={closeAddModal}
  titleId="add-movie-title"
  descriptionId="add-movie-description"
  presentation="fullscreen-mobile"
>
  {/* header, body, sticky action footer */}
</Dialog>
```

Remove local `AnimatePresence`, overlay variants, modal variants, and duplicate scroll locking.

- [ ] **Step 3: Rebuild the form hierarchy**

- Mobile: one scroll region, persistent header, safe-area-aware action footer.
- Desktop: poster/context column plus form column when width permits.
- “Thông tin” and “Đánh giá” navigation remains understandable and keyboard operable.
- Use sentence-case field labels and visible required/error relationships.
- Do not move validation or submission logic into render components.

- [ ] **Step 4: Normalize specialized fields**

- `StatusToggle`: semantic two-option control without spring layout animation.
- `RatingSection`: keyboard-operable rating with readable current value.
- Review checkbox/toggle: real checkbox or switch, not a clickable container.
- `TVProgressSection`: numeric constraints remain visible and errors associate with fields.
- `AlbumSection`: nested create/select UI works with the parent dialog focus and scroll locks.
- `PosterPreview`: missing/broken image state remains stable.

- [ ] **Step 5: Test complex form states**

Verify add, edit, duplicate movie, manual movie, TMDB movie, movie, TV, history, watchlist, validation error, submitting, service error, nested date/time picker, album create/select, dirty close, and virtual keyboard behavior.

- [ ] **Step 6: Prove the original flicker is gone**

Open and close Add Movie ten times from Library at 320, 375, and 1440 px in dark/light themes. Record video or frame evidence. Expected: one stable overlay transition, no full-screen flash, no content double mount, no scrollbar jump.

- [ ] **Step 7: Verify**

Run complete automated checks. Compare `useAddMovieForm.ts` against its pre-task diff to confirm no owner behavior was lost.

### Task 13: Migrate Share Modal and Public Share Page

**Files:**
- Modify: `src/features/share/components/ShareModal.tsx`
- Modify: `src/features/share/pages/SharePage.tsx`
- Read only unless a verified bug exists: `src/features/share/hooks/useShare.ts`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Dialog`, shared buttons/fields/states, and existing `useShare`.
- Produces: the reference short dialog and branded public page.

- [ ] **Step 1: Migrate ShareModal to `Dialog presentation="dialog"`**

Remove local overlay/motion/scroll-lock code. Keep enable/disable, copy, preview, refresh, timestamps, and privacy explanation behavior unchanged.

- [ ] **Step 2: Correct responsive copy actions**

Remove undeclared `xs:inline`/`xs:hidden`. Use one concise label at base width and allow the icon/button layout to adapt naturally:

```tsx
<Button leadingIcon={copied ? <Check /> : <Copy />} onClick={handleCopy}>
  {copied ? 'Đã sao chép' : 'Sao chép'}
</Button>
```

- [ ] **Step 3: Recompose the public SharePage**

- Keep direct public access and current search/sort behavior.
- Add clear CineMOB logo/wordmark without app navigation chrome.
- Use semantic header, search label, shared empty/error/loading states, and the approved poster recipe.
- Do not make static public movie cards appear clickable.
- Handle missing image, missing year, missing rating, long title, no movies, no matches, disabled link, missing link, and fetch failure.

- [ ] **Step 4: Lock direct public routing**

Verify `/share/:uid` renders outside `AuthProvider` and outside splash gating. It must never flash Login or private app content.

- [ ] **Step 5: Test privacy and entry behavior**

- Valid enabled link: direct content.
- Disabled/missing/malformed ID: neutral unavailable state.
- Reload public link: no splash.
- Open app CTA: normal main-app flow and full splash on actual main-app reload.
- Search and sort remain local and reveal no private fields beyond the share snapshot.

- [ ] **Step 6: Run the Phase 3 gate**

Run all automated checks and capture the vertical slice in both themes at all required widths. Review gate: Library, navigation, Add Movie, and Share pass; do not continue if their primitives or motion recipes still need redesign.

---

## Phase 4 — Feature Expansion

### Task 14: Migrate Search and Person Discovery

**Files:**
- Modify: `src/features/search/pages/SearchPage.tsx`
- Modify: `src/features/search/pages/PersonDetailPage.tsx`
- Modify: `src/features/search/components/SearchHeader.tsx`
- Modify: `src/features/search/components/SearchFilters.tsx`
- Modify: `src/features/search/components/SearchResults.tsx`
- Modify: `src/features/search/components/TMDBMovieCard.tsx`
- Modify: `src/features/search/components/PersonCard.tsx`
- Modify: `src/features/search/components/person/PersonMovieSection.tsx`

**Interfaces:**
- Consumes: approved PageHeader, form controls, poster recipe, Surface, and state components.
- Produces: cinematic discovery composition without changing TMDB/search hooks or service behavior.

- [ ] **Step 1: Recompose SearchPage around search intent**

Make the query field and submit action the clear primary focus. Keep advanced filters secondary and collapsible. Preserve suggestions, discovery, AI recommendations, trending, pagination, watched status, and remove-recommendation behavior.

- [ ] **Step 2: Fix card keyboard semantics**

`TMDBMovieCard` currently has `role="button"` and `tabIndex` without a keyboard handler. Convert the main card action to a button/link or add Enter/Space handling without nesting the remove button.

- [ ] **Step 3: Reduce badge and glass density**

Show status, rating, and media type with a clear priority. Use opaque poster badges where readability requires them; do not stack three glass chips by default.

- [ ] **Step 4: Remove ineffective filter animations**

Replace `animate-in`/`slide-in-from-*` utilities with the centralized popup transition or no transition. Replace tiny uppercase field labels with FormField labels.

- [ ] **Step 5: Test discovery states**

Verify initial recommendations, loading, query results, no result, service failure, suggestion keyboard navigation, person results, long biography, missing profile/poster, and remove recommendation.

- [ ] **Step 6: Verify**

Run all automated checks and manual theme/width/keyboard checks before continuing.

### Task 15: Migrate Albums and Album Detail

**Files:**
- Modify: `src/features/albums/pages/AlbumsPage.tsx`
- Modify: `src/features/albums/pages/AlbumDetailPage.tsx`
- Modify: `src/features/albums/components/AlbumSelectorModal.tsx`

**Interfaces:**
- Consumes: Button, IconButton, Dialog, FormField, MovieCard recipe, and shared states.
- Produces: management-oriented Album screens with correct interactive semantics.

- [ ] **Step 1: Redesign AlbumsPage hierarchy**

Keep create, open, and delete behavior. Replace clickable album `div` elements with semantic actions; keep delete independent. Use poster artwork as the visual anchor and avoid nested icon tiles.

- [ ] **Step 2: Redesign AlbumDetailPage modes**

Keep rename, manage movies, search, pagination, add, remove, and Movie Detail behavior. Replace invalid entrance utility classes. Ensure “add movie” overlays do not wrap one interactive MovieCard inside another button.

- [ ] **Step 3: Migrate AlbumSelectorModal**

Use `Dialog presentation="sheet"` on mobile and centered dialog above `sm`. Preserve create-album, select-album, loading, and error behavior. Make list options keyboard selectable and keep focus in the topmost dialog when opened from Movie Detail.

- [ ] **Step 4: Test Album states**

Verify no albums, create error, empty album, missing album, long album name, rename, all movies already included, filtered no-result, nested selector, add/remove, and deletion confirmation.

- [ ] **Step 5: Verify**

Run all automated checks and capture Albums at 320, 768, and 1440 px in both themes.

### Task 16: Migrate Statistics

**Files:**
- Modify: `src/features/stats/pages/StatsPage.tsx`
- Modify: `src/features/stats/components/StatsCard.tsx`

**Interfaces:**
- Consumes: PageHeader, Surface, selection controls, and semantic tokens.
- Produces: a data-dense screen that does not render every datum as an equal card.

- [ ] **Step 1: Establish information hierarchy**

Order content as summary metrics, trend/comparison charts, then supporting breakdowns. Reserve card surfaces for coherent data groups, not every label or icon.

- [ ] **Step 2: Normalize chart and filter presentation**

Keep all existing stats computations and Recharts data. Use theme tokens for axes, grids, labels, and tooltip surfaces. Ensure chart color is not the only state indicator.

- [ ] **Step 3: Test data extremes**

Verify zero data, one item, large values, long country/genre labels, dark/light chart contrast, keyboard-operable filters, and 320 px overflow.

- [ ] **Step 4: Verify**

Run all automated checks and capture summary and chart sections in both themes.

### Task 17: Migrate Release Calendar

**Files:**
- Modify: `src/features/calendar/pages/ReleaseCalendarPage.tsx`
- Modify: `src/features/calendar/components/CalendarGrid.tsx`
- Modify: `src/features/calendar/components/CalendarStats.tsx`
- Modify: `src/features/calendar/components/EpisodeList.tsx`

**Interfaces:**
- Consumes: PageHeader, Surface, shared states, buttons, and semantic tokens.
- Produces: responsive calendar/list compositions without nested-card overload.

- [ ] **Step 1: Separate overview from schedule**

Use summary information as one compact region, then make calendar/list the dominant task. Do not give equal visual weight to every statistic.

- [ ] **Step 2: Adapt mobile composition**

At mobile widths use a readable schedule/list presentation when the full calendar grid cannot preserve touch targets and text. Preserve date selection and episode actions.

- [ ] **Step 3: Test calendar states**

Verify loading, no upcoming episodes, partial metadata, very long series title, multiple episodes on one day, timezone/date boundaries, push-permission states, and 320 px behavior.

- [ ] **Step 4: Verify**

Run all automated checks and manually compare desktop grid with mobile list behavior.

### Task 18: Migrate Remaining Dialogs and Movie Detail

**Files:**
- Modify: `src/features/movies/components/MovieDetailModal.tsx`
- Modify: `src/features/movies/components/ExportModal.tsx`
- Modify: `src/features/auth/components/ChangeAvatarModal.tsx`
- Modify: `src/features/auth/components/avatar/AvatarPickView.tsx`
- Modify: `src/features/auth/components/avatar/AvatarCropView.tsx`

**Interfaces:**
- Consumes: Dialog, Button, IconButton, FormField, selection controls, and feedback hierarchy.
- Produces: completion of the common modal migration.

- [ ] **Step 1: Migrate MovieDetailModal**

Use `fullscreen-mobile`; preserve poster, metadata, edit, status, album selector, and nested dialog behavior. Keep the poster cinematic while making actions and metadata scan-friendly.

- [ ] **Step 2: Migrate ExportModal**

Use centered dialog, shared selection controls, explicit submitting state, and error feedback. Preserve export formats and filters.

- [ ] **Step 3: Migrate ChangeAvatarModal**

Use fullscreen-mobile/desktop-dialog presentation. Preserve pick, crop, upload, validation, and cancellation. Make the avatar target keyboard operable and announce upload errors.

- [ ] **Step 4: Remove local modal wrappers only after migration**

For each migrated file remove local `AnimatePresence`, overlay variants, duplicate `usePreventScroll`, and duplicated header/footer chrome. Never remove the global motion constants until `rg` confirms zero consumers.

- [ ] **Step 5: Run the Phase 4 gate**

Run all automated checks. Open every modal from every launch point, including nested Album Selector and date/time pickers. Expected: one scroll lock, correct close order, focus restoration, and no flicker.

---

## Phase 5 — Cinematic Experiences

### Task 19: Refine Login Without Removing Its Cinematic Identity

**Files:**
- Modify: `src/features/auth/components/Login.tsx`

**Interfaces:**
- Consumes: Button, semantic tokens, reduced-motion contract, and existing authentication behavior.
- Produces: the flagship unauthenticated screen.

- [ ] **Step 1: Preserve the asymmetric poster-led composition**

Keep the poster imagery, CineMOB branding, Google sign-in, and cinematic atmosphere. Refine spacing, type hierarchy, contrast, and responsive arrangement rather than replacing the concept.

- [ ] **Step 2: Remove false affordances**

Poster cards that do not navigate or perform an action must not use pointer cursor or interaction-like scaling. If a poster remains decorative, mark it appropriately for assistive technology and retain only subtle non-interactive depth.

- [ ] **Step 3: Bound ambient effects**

Use at most one ambient glow composition and ensure it does not reduce text contrast. Replace `transition-all` and strong hover scale with explicit, restrained properties.

- [ ] **Step 4: Test Login states**

Verify dark/light, 320/375/768/1440, loading sign-in, auth error, keyboard focus, reduced motion, slow poster loading, and missing poster assets.

- [ ] **Step 5: Verify**

Run all automated checks and capture both themes at 320, 375, and 1440 px.

### Task 20: Preserve and Harden Random Picker and Confetti

**Files:**
- Modify: `src/features/movies/components/RandomPickerModal.tsx`
- Modify: `src/features/movies/components/random-picker/PickerWheel.tsx`
- Modify: `src/index.css`
- Preserve: `public/data/confetti.json`
- Preserve: `src/assets/audio/random.MP3`

**Interfaces:**
- Consumes: Dialog, reduced-motion preference, existing movie pools, Howler, and Lottie.
- Produces: one approved celebration flow.

- [ ] **Step 1: Migrate the outer surface to Dialog**

Keep watchlist-first selection, trending fallback, res spin, open-detail/add-movie actions, and result behavior. Remove duplicated overlay/motion/scroll-lock code.

- [ ] **Step 2: Load celebration assets only when needed**

Do not fetch confetti on application mount. Start the fetch when Random Picker opens or when shuffle begins; cache the parsed result for the current component lifetime. A fetch failure must still show the selected movie and actions.

- [ ] **Step 3: Enforce the single trigger**

Render confetti only when `hasResult === true` after a completed selection. Reset it before every res spin and on close. Do not trigger it for pool loading, opening, or ordinary button actions.

- [ ] **Step 4: Implement reduced-motion behavior**

When reduced motion is requested:

- Skip rapid wheel cycling and land directly on a selected result.
- Do not render confetti animation.
- Do not run infinite float/pulse CSS.
- Keep a static branded result treatment and all actions.
- Preserve the existing Random Picker audio behavior; changing sound policy requires a separate owner decision.

- [ ] **Step 5: Test Random Picker states**

Verify watchlist pool, empty watchlist trending fallback, network failure, empty remote result, repeated res spin, close during shuffle, reopen, asset failure, audio cleanup, reduced motion, and selected result actions.

- [ ] **Step 6: Verify brand protection**

Confirm `public/data/confetti.json` and `src/assets/audio/random.MP3` are unchanged. Capture the normal result and reduced-motion static result.

### Task 21: Implement the Approved Splash Lifecycle

**Files:**
- Create: `src/shared/utils/splashPolicy.ts`
- Create: `src/shared/utils/splashPolicy.test.ts`
- Modify: `src/shared/components/feedback/SplashScreen.tsx`
- Modify: `src/App.tsx`
- Preserve: `public/data/splashscreen.json`

**Interfaces:**
- Produces: `getSplashMode(pathname, reducedMotion)` returning `'none' | 'static' | 'animated'`.

- [ ] **Step 1: Write splash-policy tests**

```typescript
import { describe, expect, it } from 'vitest';
import { getSplashMode } from './splashPolicy';

describe('getSplashMode', () => {
  it('bypasses the public share route', () => {
    expect(getSplashMode('/share/user-1', false)).toBe('none');
  });

  it('plays the full animation on a normal app load', () => {
    expect(getSplashMode('/', false)).toBe('animated');
  });

  it('uses a static brand frame for reduced motion', () => {
    expect(getSplashMode('/albums', true)).toBe('static');
  });
});
```

- [ ] **Step 2: Implement the pure policy**

```typescript
export type SplashMode = 'none' | 'static' | 'animated';

export const getSplashMode = (pathname: string, reducedMotion: boolean): SplashMode => {
  if (pathname.startsWith('/share/')) return 'none';
  return reducedMotion ? 'static' : 'animated';
};
```

- [ ] **Step 3: Remove session-only behavior**

In `App.tsx`, remove `sessionStorage.getItem('splashScreenShown')` and `sessionStorage.setItem(...)`. Determine splash mode from the initial pathname and reduced-motion preference. Internal React Router navigation must not recreate splash state.

- [ ] **Step 4: Preserve full normal playback**

For animated mode:

- Fetch `/data/splashscreen.json`.
- Keep the splash visible through the animation’s `onComplete`.
- After completion, keep a quiet loading indication only while private app initialization remains incomplete.
- Do not shorten or skip a successfully loaded animation.

- [ ] **Step 5: Add explicit failure and static behavior**

- Asset fetch/parse failure: show a static CineMOB brand frame, log a non-sensitive warning, then continue initialization without an infinite block.
- Reduced motion: never mount the Lottie animation; show the static brand frame until app initialization is ready.
- Public share: mount neither animated nor static splash.

- [ ] **Step 6: Test lifecycle cases**

Verify cold `/`, reload `/`, Login load, authenticated load, internal route changes, public share deep link, public share reload, reduced motion, failed JSON request, slow app initialization after completed animation, and logout/login transitions.

- [ ] **Step 7: Run the Phase 5 gate**

Run all automated checks. Confirm `public/data/splashscreen.json` is unchanged, the full animation plays normally, and `/share/:uid` remains direct.

---

## Phase 6 — PWA, Cleanup, Performance, and Release Hardening

### Task 22: Establish One PWA Manifest and Consistent Metadata

**Files:**
- Modify: `vite.config.ts`
- Modify: `index.html`
- Modify: `public/manifest.json`
- Modify only if required by measured behavior: `src/sw.ts`

**Interfaces:**
- Produces: one authoritative `/manifest.json` and consistent Vietnamese metadata.

- [ ] **Step 1: Keep `public/manifest.json` as the authority**

Set `manifest: false` in the `VitePWA` options so the plugin does not generate a competing `manifest.webmanifest`. Retain the explicit `/manifest.json` link in `index.html`.

- [ ] **Step 2: Align manifest metadata**

Update the manifest to include:

```json
{
  "short_name": "CineMOB",
  "name": "CineMOB - Người bạn đồng hành điện ảnh",
  "lang": "vi",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#09090b",
  "background_color": "#09090b"
}
```

Preserve all valid icon entries.

- [ ] **Step 3: Align document metadata**

Keep `lang="vi"`, add a matching `<meta name="theme-color" content="#09090b">`, and verify Open Graph/Twitter descriptions remain Vietnamese and accurate.

- [ ] **Step 4: Verify production output**

Run `npm run build`, then:

```powershell
rg -n "manifest\.json|manifest\.webmanifest|theme-color|lang=\"vi\"" dist index.html public/manifest.json
```

Expected: exactly one manifest link and no generated competing manifest declaration.

- [ ] **Step 5: Test installed behavior**

Use production preview to verify installability, launch URL, standalone display, icon, theme/background color, offline shell behavior already supported by the service worker, and update behavior.

### Task 23: Remove Dead Styling and Prepare the Deletion Manifest

**Files:**
- Modify: all migrated `.tsx` files containing obsolete utilities
- Modify: `src/constants/animations.ts`
- Modify: `tailwind.config.js`
- Modify: `src/index.css`
- Create: `docs/design-refresh/deletion-manifest.md`
- Candidate only, no deletion without approval:
  - `public/data/loading_suggest.json`
  - `public/data/splashscreen.json.backup`

**Interfaces:**
- Consumes: completed migrations and `rg` evidence.
- Produces: zero known invalid utilities and an owner-reviewable deletion manifest.

- [ ] **Step 1: Prove animation compatibility exports are unused**

Run:

```powershell
rg -n "MODAL_VARIANTS|DIALOG_VARIANTS|OVERLAY_VARIANTS|AnimatePresence|motion\." src
```

Remove only exports and imports with zero remaining consumers. Keep Framer Motion because approved Dialog, toast, loading, or brand experiences may still use it.

- [ ] **Step 2: Remove invalid and obsolete classes**

Run:

```powershell
rg -n "animate-in|slide-in-from-|xs:|text-primary-dark|transition-all" src
```

For every match, replace it with an approved token/recipe or remove it when it has no behavioral purpose. Build after each feature group rather than doing an unreviewable global replacement.

- [ ] **Step 3: Audit remaining decorative patterns**

Run:

```powershell
rg -n "active:scale|animate-pulse|backdrop-blur|uppercase.*tracking|rounded-3xl" src
```

Every remaining occurrence must have a reason consistent with `DESIGN.md`; record intentional exceptions in the deletion/cleanup document.

- [ ] **Step 4: Prepare deletion evidence without deleting**

For each candidate asset record:

- Exact path and size
- `rg` results for filename and URL references
- Checks of `index.html`, `vite.config.ts`, `src/sw.ts`, manifests, and public fetch calls
- Whether dynamic/runtime access is possible
- Expected effect of removal
- Recovery method from version control
- Owner decision field

Never list `public/data/splashscreen.json` or `public/data/confetti.json` as candidates.

- [ ] **Step 5: Stop for deletion approval**

Do not remove `loading_suggest.json`, `splashscreen.json.backup`, or any other file until the owner approves each exact manifest entry.

- [ ] **Step 6: Apply only approved deletions**

After explicit approval, remove only the approved paths, rerun the reference search, and run the full automated suite. Report what was removed and how it can be recovered.

### Task 24: Set Measured Budgets and Complete Release Verification

**Files:**
- Modify: `docs/design-refresh/baseline.md`
- Create: `docs/design-refresh/release-verification.md`
- Modify only when evidence requires a narrow fix: affected source/config files

**Interfaces:**
- Consumes: completed implementation, baseline evidence, approved spec, and `DESIGN.md`.
- Produces: final performance budgets, regression evidence, and residual-risk record.

- [ ] **Step 1: Re-run the complete automated suite**

Run separately and record exact output:

```powershell
npm run typecheck
npm run lint
npm test
npm run build
```

Expected: all pass. Do not describe a warning as a pass unless it is within the repository’s documented lint cap and is recorded.

- [ ] **Step 2: Compare production assets to baseline**

Record total initial JS, initial CSS, Lottie chunk, charts chunk, largest route chunk, and build duration. Set final numeric budgets from the measured final values plus a small documented regression allowance. Owner approval is required before those budgets become contractual.

- [ ] **Step 3: Run the complete viewport/theme matrix**

For every primary route, test dark and light at 320, 375, 768, 1024, and 1440 px. Record overflow, truncation, layout shift, sticky/fixed overlap, poster behavior, and touch-target findings.

- [ ] **Step 4: Run the complete input/accessibility matrix**

Use keyboard only to traverse navigation, filters, cards, pagination, all dialogs, date/time pickers, album selection, alerts, and forms. Verify focus visibility, focus order, Escape, focus restoration, labels, errors, live regions, and reduced motion.

- [ ] **Step 5: Run the browser/PWA matrix**

Smoke test current Chrome/Edge, Firefox, Safari, Android PWA, and iOS PWA within available hardware. Record platform limitations separately from application defects.

- [ ] **Step 6: Re-test the five Review Focus cases**

Record evidence for nested overlays, narrow mobile/keyboard, reduced motion, abnormal content, and public share entry. A missing case is a release blocker.

- [ ] **Step 7: Re-audit against the approved spec and DESIGN.md**

For every section of the spec, link the implementing task and evidence. Record any intentional exception with owner approval; do not silently reinterpret the design contract.

- [ ] **Step 8: Complete final review handoff**

Provide the working diff, automated outputs, screenshot set, performance comparison, deletion decisions, and residual risks to Codex for review. Do not perform Git operations; the product owner decides when and how to commit.

---

## Phase Checkpoint Summary

| Checkpoint | Required result before continuing |
|---|---|
| Phase 0 | Baseline, flicker classification, screenshots, performance evidence; no source edits |
| Phase 1 | New `DESIGN.md`, semantic tokens, focus/reduced-motion foundation, centralized motion |
| Phase 2 | Shared primitives work in both themes and pass keyboard/dialog checks |
| Phase 3 | Library/navigation/Add Movie/Share vertical slice approved at all target widths |
| Phase 4 | Remaining management/discovery screens and modals use approved patterns |
| Phase 5 | Login, Random Picker, confetti, and splash preserve the approved brand contract |
| Phase 6 | One manifest, approved cleanup only, measured budgets, full regression evidence |

## Review Handoff Format

At the end of each phase, send:

```text
Phase:
Tasks completed:
Files changed:
Behavior intentionally changed:
Behavior explicitly preserved:
Automated commands and results:
Manual matrix completed:
Screenshots/evidence:
Known risks or open decisions:
Working diff ready for review: yes/no
```

Codex reviews the working diff and evidence. The product owner retains responsibility for every Git operation.
