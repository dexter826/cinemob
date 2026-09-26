# CineMOB Design System

Source of truth for the Neon Cinema Lounge refinement.

## Creative North Star

CineMOB is a personal cinematic lounge: expressive and image-led when discovering
or choosing a film, but clear and efficient when managing a collection.
The system stays recognizably CineMOB while becoming calmer, more deliberate,
more accessible, and less dependent on decorative effects.

## Brand Invariants

Mandatory:

- Emerald + posters + logo + SplashScreen + Random Picker confetti are brand invariants.
- Dark is flagship; light is complete.
- Be Vietnam Pro is display; Inter is interface/body.
- CineMOB name and logo remain recognizable.
- SplashScreen artwork and Random Picker confetti artwork are never replaced in this initiative.
- Poster-led imagery stays central; cinematic screens may use stronger composition.

## Experience Principles

- Cinematic where emotion matters: Login, discovery, Random Picker, posters, Splash.
- Quiet where tasks matter: Library, albums, statistics, calendar, forms, filters, settings.
- Hierarchy before decoration: typography, spacing, alignment, and contrast come before
  cards, icon tiles, glass, shadow, or glow.
- Consistency is a contract: shared primitives own repeated behavior and accessibility;
  features own composition and content.
- Stability before motion: no animation is better than animation that flickers, remounts,
  shifts layout, or blocks input.

## Color and Theme Tokens

Semantic roles (CSS variables in `src/index.css`, exposed via Tailwind):

- `background`, `surface`, `surface-elevated`
- `text-primary`, `text-secondary`
- `border`, `focus`
- `primary`, `primary-hover`, `on-primary`
- `success`, `warning`, `danger`, `info`

Rules:

- Emerald is reserved for brand emphasis, the primary action, active state, meaningful
  selection, and approved brand moments. Do not decorate every icon or container emerald.
- Dark uses neutral zinc-like foundations so posters and emerald lead.
- Light receives purpose-built surface, text, border, and shadow values, not inverted dark values.
- All text/control token pairs target WCAG 2.2 AA contrast in both themes.
- Glass is elevated; glow is primary/active/brand only.

## Typography

- Be Vietnam Pro is display; Inter is interface/body. Covers headings, body, controls,
  labels, forms, metadata, and data-dense interfaces.
- Bounded type scale with named roles, defined line heights, and defined weights.
- Use natural Vietnamese sentence case. Never use 10px uppercase tracking-widest for
  ordinary field labels.
- Use the ellipsis character `…` instead of three periods in truncation and loading copy.
- Desktop uses available width without uncontrolled line lengths or empty sprawl.

## Spacing and Layout

- Bounded spacing scale; page gutters and max content widths defined by layout classes.
- Standard page container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Poster grids: mobile 2 cols, tablet 3–4 cols, desktop 5+ cols; always `aspect-2/3`.
- Use alignment and whitespace before container chrome.
- Management screens optimize scanability; cinematic screens optimize imagery and breathing room.

## Surfaces, Radius, Border, and Shadow

Four levels:

1. Base: application background.
2. Section: grouping through layout, spacing, or dividers.
3. Interactive surface: card/row with real hover, press, select, or navigation behavior.
4. Elevated surface: dialog, sheet, popover, or intentionally floating navigation.

- Glass is limited to elevated surfaces or compositions with a clear visual reason.
- Glow is limited to a primary call to action, meaningful active state, or approved brand moment.
- Nested glass and nested cards require a hierarchy justification.
- Radius roles: controls `rounded-xl`, cards `rounded-2xl`, dialogs `rounded-2xl/3xl`.
- Borders separate; shadows communicate elevation. Neon shadows are not content decoration.

## Iconography

- One icon family (Lucide) used consistently.
- An icon tile must communicate an action, state, or important anchor.
- Decorative icons must not appear interactive (no pointer cursor, no scale affordance).
- Icon-only controls require accessible names and visible focus treatment.

## Motion

Token ranges:

- fast: 120–150 ms (hover, press, focus, toggles).
- standard: 180–220 ms (menus, ordinary transitions).
- deliberate: 240–300 ms (dialogs, panels).

Rules:

- Central contract in `src/constants/animations.ts`: `MOTION_DURATION`, `MOTION_EASING`,
  `OVERLAY_VARIANTS`, `DIALOG_VARIANTS`, `getMotionTransition`.
- Components must not invent isolated springs or durations. Avoid `transition-all`;
  transition only changed properties.
- No complete route/tab animation. Do not bounce or spring the active navigation item.
- A modal receives one coordinated overlay and surface transition; it must not remount
  content repeatedly. If the recipe flickers, simplify or remove it.
- Honor `prefers-reduced-motion` across the system with static equivalents.

## Navigation

- Mobile retains bottom navigation; desktop retains header navigation.
- Route names and destinations unchanged.
- Semantic `<nav aria-label="Điều hướng chính">`; stable active indicator via color,
  weight, and indicator, never bounce, spring, or scale.
- Keep the shell spatially stable while route content loads.
- Account menu supports keyboard close and focus return.

## Dialogs and Overlays

Presentations by task:

- Short confirmation / focused action: centered dialog.
- Quick mobile selection: bottom sheet below `sm`, centered at `sm` and above.
- Complex forms (add/edit movie): fullscreen-mobile below `sm`, wide dialog above.
- Share and Random Picker inherit the common foundation with content-appropriate presentation.

The dialog foundation owns portal rendering, overlay, Escape handling, focus trapping,
initial focus, scroll locking (single lock, layout-preserving), accessible naming
(`role="dialog"`, `aria-modal`, labelledby/describedby), and focus restoration.
Nested overlays keep exactly one scroll lock and topmost-only keyboard handling.

## Forms and Controls

- `FormField` owns label, hint, required state, and error relationship (`${id}-hint`,
  `${id}-error`, `aria-describedby`, `aria-invalid`). Sentence case always.
- Triggers use `aria-haspopup="listbox"`, `aria-expanded`, `aria-controls`; options use
  `role="option"` + `aria-selected`. Arrow/Enter/Space/Escape fully keyboard operable.
- Date/time pickers reuse the dialog focus lifecycle; nested opening must not break
  the parent scroll lock.
- Touch targets meet practical minimums; virtual keyboards must not obscure the primary action.
- Long country, genre, album, date, and time labels truncate or wrap without overflow.

## Feedback and Application States

Tiered hierarchy:

- Small reversible update: inline state.
- Ordinary async success: short neutral toast only when confirmation is otherwise unclear.
- Recoverable failure: problem + actionable retry (`ErrorState`).
- Destructive or hard-to-reverse action: confirmation dialog.
- Easily reversible action: prefer undo or direct feedback over confirmation.
- Celebration: confetti only after Random Picker selection.

Screen states covered where relevant: initial/skeleton loading, empty, populated,
no-result, recoverable/terminal error, offline, auth failure, success, disabled/submitting,
long copy, missing posters, abnormal data. No speculative business states.

## Responsive Behavior

- Mobile-first from 320 px. Review widths: 320/375/768/1024/1440.
- Styles below `sm` are the base mobile contract. Do not depend on undeclared breakpoints
  (no `xs:`).
- Layout may change composition across breakpoints; do not merely shrink desktop UI.
- Prevent horizontal overflow; poster grids respond to usable width and density.
- Bottom padding equals the actual mobile navigation plus safe area
  (`env(safe-area-inset-bottom)`).

## Accessibility

Primary flows target WCAG 2.2 AA:

- Visible global `focus-visible` treatment; never remove an outline without a replacement.
- Keyboard access for all controls and cards; semantic buttons/links, no nested interactives.
- Dialogs: role, name, modal semantics, trap, and restoration.
- Labels, descriptions, and errors correctly associated; state never by color alone.
- Live regions for important async results without repetitive announcements.
- Document language is Vietnamese (`lang="vi"`).
- Contrast tested in both themes.

## Brand Moments

Splash:

- Full splash on app start/reload; no splash on internal navigation or /share/:uid.
- Play the full Lottie animation under normal conditions.
- Asset failure: static brand frame + non-sensitive warning, never infinite block.
- `prefers-reduced-motion`: static branded treatment, never forced animation.
- Lazy loading must not change the approved artwork.

Confetti:

- Confetti only after Random Picker selection.
- Never for create, update, delete, share, or toast success.
- Lazy-load where practical; never block the selected result.
- Reduced-motion alternative: static result, no animation.

Splash and confetti assets are protected brand assets and are not deletion candidates.

## Component Ownership

- Shared primitives require two real consumers or enforcement of a global contract
  (dialog accessibility, focus, motion, feedback semantics).
- Approved shared layer: Button, IconButton, Surface, PageHeader, FormField, Dialog,
  selection controls, Loading, EmptyState, ErrorState, SkeletonCard, Toast/Alert.
- Feature-specific components stay inside their feature.
- Never create a large generic API merely to eliminate repeated class strings.
- Keep rendering in components, behavior in hooks, remote calls in services,
  shared interfaces in `src/types`.

## Decision Gates

Implementation must pause for owner approval before:

- Adding a UI, animation, accessibility, or test dependency.
- Changing a route, feature, business rule, or user flow.
- Changing splash or confetti artwork, or the approved splash/confetti triggers.
- Deleting any production file (deletion requires an evidence-backed manifest;
  never list Splash or confetti assets as candidates).
- Replacing the approved font or primary brand color.
- Changing the supported browser scope.
- Accepting a known WCAG AA failure in a primary flow.
- Setting final numeric performance budgets after baseline measurement.
- No dependency or deletion without a decision gate.

Supported scope: current Chrome/Edge, Firefox, Safari, Android PWA, and iOS PWA
within platform limits. Glass requires a usable opaque fallback.

## Review Checklist

For every phase, verify:

- Scope and design-contract alignment; no unapproved expansion.
- Visual hierarchy and brand preservation (emerald, posters, logo, Splash, confetti intact).
- Component and API quality (naming, ownership, no `React.FC` in new code).
- Accessibility and keyboard behavior (focus, trap, restoration, labels, live regions).
- Responsive behavior at 320, 375, 768, 1024, 1440 in dark and light themes.
- Motion stability and performance (one transition, no remount, no layout shift).
- State and edge-case coverage (loading, empty, error, offline, abnormal content).
- Public share entry: /share/:uid bypasses auth and splash, handles invalid/disabled
  links without leaking private data, retains CineMOB branding in both themes.
- Documentation accuracy (`DESIGN.md` matches implementation; splash/confetti never
  listed as cleanup targets).
- Automated: `npm run typecheck`, `npm run lint`, `npm test`, `npm run build`.
- Manual: mouse, keyboard, touch, reduced motion, browser/PWA matrix, modal lifecycle,
  flicker-free route/tab changes.

Do and don't reference:

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
