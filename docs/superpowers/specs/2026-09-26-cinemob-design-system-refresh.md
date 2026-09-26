# CineMOB Design System Refresh Specification

**Status:** Approved  
**Date:** 2026-09-26  
**Scope:** Product-wide UI system audit remediation and controlled redesign  
**Implementation owner:** Product owner  
**Review owner:** Codex  

## 1. Purpose

This specification defines how CineMOB will refine its existing design language without erasing its identity. The work covers the design system, shared UI primitives, application shell, feature screens, modal behavior, motion, responsive behavior, accessibility, performance, PWA presentation, and evidence-based cleanup.

The redesign is not a visual replacement. It is a controlled refinement of the existing **“The Neon Cinema Lounge”** direction.

## 2. Current Problems to Solve

The audit identified several systemic issues rather than one isolated visual defect:

- Modal opening and route/tab transitions can visibly flicker.
- Motion is fragmented across Framer Motion, Tailwind classes, custom keyframes, and Lottie.
- Some animation and breakpoint utilities are referenced but do not exist in compiled CSS.
- Glass, glow, rounded cards, icon tiles, uppercase labels, and active scaling are used too broadly to create meaningful hierarchy.
- Several shared motion variants are currently static while consumers still retain animation wrappers.
- Focus visibility, dialog semantics, keyboard interaction, and text contrast are inconsistent.
- Dark and light themes do not yet operate as equally complete variants of one system.
- Page structures frequently repeat the same header, icon tile, and nested card composition regardless of content purpose.
- Feedback is not consistently tiered between inline state, toast, dialog, and celebration.
- PWA metadata and manifests have conflicting sources and language/theme values.
- Asset and file cleanup lacks a formal evidence and approval boundary.

These observations are inputs to the redesign, not authorization to remove brand assets or product behavior.

## 3. Product and Brand Contract

### 3.1 Creative North Star

CineMOB is a personal cinematic lounge: expressive and image-led when discovering or choosing a film, but clear and efficient when managing a collection.

The refined direction must feel recognizably CineMOB while being calmer, more deliberate, more accessible, and less dependent on decorative effects.

### 3.2 Brand Invariants

The following are mandatory:

- Emerald remains the primary brand color.
- Movie posters and cinematic imagery remain central to the experience.
- The CineMOB name and logo remain recognizable.
- The splash screen remains a first-class brand moment.
- Confetti remains a first-class brand moment for Random Picker.
- Dark mode remains the flagship presentation.
- Be Vietnam Pro remains the display and heading face.
- Inter remains the body, form, metadata, and interface face.

### 3.3 Areas That May Be Refined

- Glass, glow, shadow, border, and radius intensity
- Type scale, line height, tracking, and weight usage
- Spacing and visual hierarchy
- Composition inside an existing screen
- Desktop and mobile layout treatment
- Modal presentation by task and device
- Implementation, loading strategy, fallback, and accessibility behavior for brand animations
- Vietnamese UX copy
- Light-theme treatment

### 3.4 Non-Goals

- Do not change routes, business rules, feature meaning, or established user flows.
- Do not add or remove product features as part of visual cleanup.
- Do not replace splash or confetti artwork.
- Do not introduce a new UI dependency without a separate decision gate.
- Do not build internationalization in this initiative.
- Do not delete files without an approved deletion manifest.
- Do not perform commits, pushes, branch operations, or other Git mutations on behalf of the product owner.

## 4. Experience Principles

### 4.1 Cinematic Where Emotion Matters

Login, discovery, Random Picker, posters, and the splash experience may use stronger imagery, composition, and branded motion.

### 4.2 Quiet Where Tasks Matter

Library management, albums, statistics, calendars, forms, filters, and settings prioritize scanning, clarity, alignment, and predictable interaction.

### 4.3 Hierarchy Before Decoration

Use typography, spacing, alignment, grouping, and contrast before adding cards, icon tiles, glass, shadow, or glow.

### 4.4 Consistency Is a Contract

Shared primitives own repeated behavior and accessibility. Feature components own feature-specific composition and content. A shared abstraction must have real reuse or enforce a global contract.

### 4.5 Stability Before Motion

No animation is preferable to animation that flickers, remounts content, shifts layout, blocks input, or behaves inconsistently across supported devices.

## 5. Visual Foundation

### 5.1 Semantic Color Model

Implementation will move toward semantic roles rather than component-specific raw colors:

- `background`
- `surface`
- `surface-elevated`
- `text-primary`
- `text-secondary`
- `border`
- `primary`
- `primary-hover`
- `success`
- `warning`
- `danger`

Emerald is reserved for brand emphasis, the primary action, active state, meaningful selection, and approved brand moments. It must not be the default decoration for every icon and container.

Dark mode uses neutral zinc-like foundations that allow poster artwork and emerald accents to lead. Light mode receives purpose-built surface, text, border, and shadow values rather than mechanically inverted dark values.

All final token values must be tested against WCAG 2.2 AA contrast requirements for their intended text or control role.

### 5.2 Typography

- Be Vietnam Pro: display text, page titles, section headings, and short brand statements.
- Inter: body copy, controls, labels, forms, metadata, and data-dense interfaces.
- Use a bounded type scale with named roles, defined line heights, and defined weights.
- Avoid broad use of tiny uppercase text with wide tracking.
- Preserve natural Vietnamese casing and readability.
- Use the ellipsis character `…` instead of three periods in user-facing truncation and loading copy.

### 5.3 Surface Hierarchy

The system recognizes four levels:

1. **Base:** application background.
2. **Section:** content grouping expressed primarily through layout, spacing, or dividers.
3. **Interactive surface:** a card or row with a real hover, press, select, or navigation behavior.
4. **Elevated surface:** dialog, sheet, popover, or intentionally floating navigation.

Glass is limited to elevated surfaces or compositions with a clear visual reason. Glow is limited to a primary call to action, meaningful active state, or approved brand moment. Nested glass and nested cards require a hierarchy justification.

### 5.4 Spacing and Layout

- Use a bounded spacing scale.
- Define page gutters and maximum content widths by layout class.
- Use alignment and whitespace before container chrome.
- Management screens optimize scanability and comparison.
- Cinematic screens optimize imagery, focus, and breathing room.
- Desktop uses available width without allowing uncontrolled line lengths or empty sprawl.

### 5.5 Radius, Border, and Shadow

- Limit radius to a small set of roles for controls, cards, and elevated surfaces.
- Not every container requires a visible rounded boundary.
- Borders provide separation; shadows communicate elevation.
- Neon shadows are not standard content decoration.

### 5.6 Iconography

- Use one existing icon family consistently.
- An icon tile must communicate an action, state, or important anchor.
- Decorative icons must not appear interactive.
- Icon-only controls require accessible names and visible focus treatment.

## 6. Motion and Brand Moments

### 6.1 Motion Purposes

Motion is allowed only to:

- Explain spatial or state relationships
- Acknowledge input
- Deliver an approved brand moment

### 6.2 Motion Token Ranges

- `fast`: approximately 120–150 ms for hover, press, focus, and toggles
- `standard`: approximately 180–220 ms for menus and ordinary state transitions
- `deliberate`: approximately 240–300 ms for dialogs and panels

Final values are verified in context. Components must not invent isolated springs or durations. Avoid `transition-all`; transition only the properties that change.

### 6.3 Route and Navigation Motion

- Do not animate opacity or transform on the entire route or tab screen.
- Do not bounce or spring the active navigation item.
- Keep the application shell spatially stable while route content loads.
- Use a restrained active indicator, color, and weight change.

### 6.4 Modal Motion

- A modal receives one coordinated overlay and surface transition.
- It must not remount its content repeatedly during one open cycle.
- Motion must not interfere with focus, scrolling, measurement, or input.
- If the approved recipe flickers on a target device, simplify or remove that transition.

### 6.5 Splash Screen

- Display on every PWA/application start and full page reload.
- Do not replay during internal route or tab navigation.
- Do not display on the public `/share/:uid` route; public recipients must reach shared content directly.
- Play the full Lottie animation under normal conditions.
- Use a failure timeout or static fallback only when the animation asset cannot load or execute.
- Under `prefers-reduced-motion`, show a static branded treatment or other non-moving equivalent instead of forcing the full animation.
- Lazy loading and implementation optimization may not change the approved artwork.

### 6.6 Confetti

- Trigger only after Random Picker has selected a film.
- Do not use for ordinary create, update, delete, share, or toast success states.
- Lazy-load where practical.
- Do not block or delay access to the selected result.
- Provide a reduced-motion alternative.

## 7. Interaction and Feedback

### 7.1 Feedback Hierarchy

- Small reversible update: reflect directly in the component.
- Ordinary asynchronous success: short, neutral toast when confirmation is otherwise unclear.
- Recoverable failure: state the problem and offer an actionable retry.
- Destructive or hard-to-reverse action: confirmation dialog.
- Easily reversible action: prefer undo or direct state feedback over confirmation.
- Celebration: Random Picker confetti only.

### 7.2 Required Interactive States

Each applicable primitive defines:

- Default
- Hover on devices that support hover
- Active or pressed
- Focus-visible
- Disabled
- Loading or submitting
- Error or invalid

Strong scale changes are not the default feedback mechanism. Prefer color, border, shadow, and minimal displacement.

### 7.3 Screen and Workflow States

Each affected screen or workflow must account for relevant states:

- Initial loading
- Partial or skeleton loading when justified
- Empty
- Populated
- No search or filter results
- Recoverable error
- Non-recoverable error
- Offline or disconnected when relevant
- Authentication or permission failure
- Success
- Disabled or submitting
- Long copy, missing posters, and abnormal data

Do not invent speculative business states that cannot occur in the product.

## 8. UI Architecture

### 8.1 Shared Primitives

The redesign may create or normalize:

- Button and IconButton
- Input, Textarea, Select, and FormField
- Dialog and modal foundation
- Surface and Card
- Badge and Chip
- PageHeader
- Toast and feedback components
- LoadingState, EmptyState, and ErrorState
- A small number of proven layout primitives

A shared primitive must either have at least two real consumers or enforce a global behavior such as dialog accessibility.

### 8.2 Feature Ownership

Feature-specific components stay within their feature. The redesign must not create a large generic component API merely to eliminate a few repeated class strings.

### 8.3 Page Composition

- The application shell owns navigation, theme, page container, and the main content region.
- Page headers need not repeat the same decorative icon-tile formula.
- Informational and interactive surfaces must be visually distinguishable.
- Clickable cards use semantic interactive elements or complete keyboard semantics.
- Sections use structure and spacing before adding another card boundary.

### 8.4 Modal Presentation by Task

- Short confirmation or focused action: centered dialog.
- Quick mobile selection: bottom sheet when appropriate.
- Complex forms such as add/edit movie: full-screen modal on mobile and wide dialog on desktop.
- Share and Random Picker use presentations appropriate to their content while inheriting the common dialog foundation.

The dialog foundation owns portal rendering, overlay, Escape handling, focus trapping, initial focus, scroll locking, accessible naming, and focus restoration.

## 9. Responsive and Theme Contract

### 9.1 Responsive Strategy

- Mobile-first from 320 px.
- Required review widths: 320, 375, 768, 1024, and 1440 px.
- Do not depend on undeclared breakpoints.
- Layout may change composition across breakpoints; do not merely shrink desktop UI.
- Prevent accidental horizontal overflow.
- Ensure virtual keyboards do not obscure the primary form action.
- Poster grids respond to usable width and content density.
- Controls meet practical touch-target requirements.

### 9.2 Navigation by Device

- Mobile retains bottom navigation.
- Desktop retains horizontal navigation or application header navigation.
- Route names and destinations remain unchanged.
- Active states are stable and do not use bounce animation.

### 9.3 Theme Strategy

- Dark mode is the flagship visual experience.
- Light mode remains complete, intentional, and accessible.
- Every shared primitive is reviewed in both themes before broad migration.
- Themes may use different shadow, border, surface, and emerald shades while preserving semantic roles.

## 10. Accessibility Contract

Primary flows target WCAG 2.2 AA:

- Restore a visible global `focus-visible` treatment.
- Never remove an outline without an equivalent accessible replacement.
- Provide keyboard access for all interactive controls and cards.
- Give dialogs a role, accessible name, modal semantics, focus trap, and focus restoration.
- Associate form labels, descriptions, and errors correctly.
- Do not communicate state using color alone.
- Use appropriate live regions for important asynchronous loading, result, or error messages without repetitive announcements.
- Honor `prefers-reduced-motion` across the system.
- Set document language metadata to Vietnamese.
- Test contrast for both themes.

## 11. Supported Environment

Support current stable versions of:

- Chrome and Edge
- Firefox
- Safari on macOS and iOS
- Android and iOS PWA behavior within platform limitations

Glass effects require a usable opaque fallback when backdrop filtering is unsupported or visually unreliable.

## 12. Performance Contract

Performance work begins with measurement rather than arbitrary budgets:

- Record initial JavaScript and CSS bundle sizes.
- Record large route and animation chunks.
- Measure cold load, modal opening, and route/tab changes on a representative mobile environment.
- Record layout shifts and visible flicker.
- Lazy-load heavy brand assets and feature code where doing so preserves approved behavior.
- Establish numeric budgets only after baseline data exists.
- Treat the approved full splash duration as branded experience time, not an accidental loading delay.

The final experience must not introduce avoidable layout shift, duplicate loading, or main-thread work that makes controls visibly unresponsive.

## 13. Cleanup and Deletion Policy

No production file may be removed merely because it is large, old-looking, unused by a static import, or inconsistent with the redesign.

A deletion manifest must include:

- Exact path
- Evidence that the file or code is unused
- Checks for dynamic loading, public URL references, PWA references, and runtime configuration
- Expected impact
- Recovery method
- Explicit owner approval

Splash and Random Picker confetti assets are protected brand assets and are not deletion candidates in this initiative.

## 14. PWA and Metadata Alignment

The implementation must converge on one authoritative manifest and consistent metadata:

- Vietnamese document and manifest language
- Intentional theme and background colors
- No duplicate or conflicting manifest declarations
- Correct PWA icons and display behavior
- Splash behavior tested for cold start, reload, internal navigation, asset failure, and reduced motion

## 15. Rollout Strategy

### Phase 0 — Baseline and Evidence

- Capture representative screens and states.
- Record performance and bundle baselines.
- Reproduce modal and tab flicker.
- Inventory tokens, components, animations, assets, invalid utilities, manifests, and accessibility gaps.
- Do not redesign in this phase.

### Phase 1 — Design Contract and Foundations

- Replace `DESIGN.md` with a complete source of truth aligned to this specification.
- Implement semantic tokens and theme foundations.
- Normalize typography, spacing, radius, border, shadow, focus, and language metadata.
- Review foundations before feature redesign.

### Phase 2 — Shared Primitives

- Build or normalize the approved primitives.
- Complete themes, responsive behavior, keyboard behavior, reduced motion, and component states.
- Avoid broad feature migration until primitives pass review.

### Phase 3 — Representative Vertical Slice

Apply the system to:

- Movie Library
- Mobile and desktop navigation
- Add Movie
- Share

This slice validates posters, data display, search/filter where present, forms, short and complex modal presentations, feedback, state coverage, responsive behavior, accessibility, motion, and the existing flicker problem.

Do not expand the redesign until the slice passes review.

### Phase 4 — Feature Expansion

Migrate approved patterns to Albums, Statistics, Calendar, and other management-oriented screens. Preserve feature ownership and allow different page compositions where the content requires them.

### Phase 5 — Cinematic Experiences

Refine Login, Random Picker, Splash, and other emotion-led experiences. Preserve approved brand assets and triggers.

### Phase 6 — Cleanup, PWA, and Release Hardening

- Remove ineffective utilities and obsolete implementation only when safe.
- Align PWA metadata and manifest ownership.
- Re-measure performance.
- Prepare and obtain approval for the deletion manifest.
- Run cross-route, theme, breakpoint, browser, input, and state regression.

## 16. Review and Verification Gates

The product owner implements each phase. Codex reviews the working diff after each phase. Codex does not perform Git operations.

Each checkpoint includes:

- Scope and design-contract alignment
- Visual hierarchy and brand preservation
- Component and API quality
- Accessibility and keyboard behavior
- Responsive behavior
- Theme completeness
- Motion stability and performance
- State and edge-case coverage
- Documentation accuracy

Required automated verification:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Required manual verification includes:

- Dark and light themes
- 320, 375, 768, 1024, and 1440 px widths
- Mouse, keyboard, and touch behavior
- Reduced motion
- Chrome/Edge, Firefox, and Safari smoke tests
- Modal open/close, Escape, focus trap, focus restoration, and scroll lock
- Route/tab changes without flicker
- PWA cold start, reload, internal navigation, full splash playback, asset failure, and reduced-motion fallback

## 17. Definition of Done

A phase is complete only when:

- Its acceptance criteria are satisfied.
- No review blocker remains unresolved.
- Relevant automated checks pass.
- Required manual checks have evidence.
- No unapproved scope expansion occurred.
- Documentation matches actual implementation.
- Remaining risks are recorded explicitly.

The initiative is complete only when all phases pass their gates and the final application remains recognizably CineMOB while meeting the approved consistency, accessibility, responsive, motion, performance, and cleanup contracts.

## 18. Decision Gates Requiring New Approval

Implementation must pause for owner approval before:

- Adding a UI or accessibility dependency
- Changing a route, feature, business rule, or user flow
- Changing splash or confetti artwork
- Changing the approved splash/confetti triggers
- Deleting any production file
- Replacing the approved font or primary brand color
- Changing the supported browser scope
- Accepting a known WCAG AA failure in a primary flow
- Setting final numeric performance budgets after baseline measurement

## 19. Confirmed Decisions

- Refine, rather than replace, “The Neon Cinema Lounge.”
- Preserve core brand invariants while allowing controlled system refinement.
- Cover the whole product through reviewed phases.
- Restructure layouts within screens without changing routes or user flows.
- Use deliberate, systematized motion.
- Apply glass and glow through hierarchy.
- Keep Be Vietnam Pro and Inter in distinct roles.
- Make dark mode flagship and light mode complete.
- Target WCAG 2.2 AA for primary flows.
- Design mobile-first from 320 px through desktop.
- Build a controlled shared primitive layer.
- Add no UI dependency by default.
- Preserve splash/confetti artwork and optimize implementation only.
- Limit confetti to Random Picker.
- Play the full splash on application start or reload.
- Bypass splash on the public `/share/:uid` route while retaining CineMOB branding on that page.
- Tier feedback by consequence and context.
- Balance cinematic discovery with efficient collection management.
- Keep mobile bottom navigation and desktop horizontal navigation.
- Choose modal presentation by task and device.
- Use Vietnamese as the sole product language in this initiative.
- Delete only with evidence and an approved manifest.
- Establish performance budgets after baseline measurement.
- Review and verify after every phase.
- Leave all Git operations to the product owner.
- Replace `DESIGN.md` with a complete, current source of truth.
- Validate the system first through Library, navigation, Add Movie, and Share.
- Support modern Chrome/Edge, Firefox, Safari, and mobile PWA environments.
- Cover all relevant loading, empty, populated, error, offline, auth, success, and abnormal-content states.
- Produce a task-, file-, and acceptance-criteria-level implementation plan after this specification is approved.
