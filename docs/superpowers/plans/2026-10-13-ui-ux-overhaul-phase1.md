# CineMOB UI/UX Overhaul — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform CineMOB into an immersive, native-feeling cinema PWA with a 5-tab frosted-glass navigation bar, an Apple TV/Netflix-style unified cinematic dashboard, and a dedicated full-screen movie details page (`/movie/:id`).

**Architecture:** Extend existing Tailwind CSS v4 design tokens with cinema dark mode and glassmorphism utilities; decouple mobile bottom navigation to provide 5 slots with a central Search-to-Log action button; expand the TMDB read service with discovery endpoints; integrate a combined streaming-discovery and personal library dashboard on `/`; and introduce a dedicated `/movie/:id` route that correlates remote TMDB details with the user's local Firestore movie records.

**Tech Stack:** React 19, TypeScript ~5.8, Vite 6, Tailwind CSS v4, Zustand 5, Framer Motion 12, Lucide React, Firebase Auth/Firestore, TMDB API.

**Spec:** [`docs/superpowers/specs/2026-10-13-ui-ux-overhaul-phase1-design.md`](file:///c:/MyProject/cinemob/docs/superpowers/specs/2026-10-13-ui-ux-overhaul-phase1-design.md)

## Global Constraints

- React 19 + TypeScript strict mode with 0 compilation errors (`npm run typecheck`).
- ESLint must remain clean with 0 errors (`npm run lint`).
- Tailwind CSS v4 using CSS `@theme` variables in `src/index.css`.
- Preserve existing Firebase Firestore rules, authentication listeners, and `movieStore` reactivity without breaking mutations.
- Mobile-first responsive layouts supporting 375px–430px iPhone viewports and scaling smoothly to desktop viewports with `max-w-7xl` containers.
- All high-res backdrop images must include graceful skeleton/gradient fallbacks to prevent layout shifts.

## Review Focus

1. **Backdrop Image Loading Failure:** High-res TMDB backdrop fails or takes 3+ seconds on 3G; component must gracefully display an animated pulse skeleton and dark cinema gradient without layout jumping.
2. **Missing TMDB ID on Manual Movie Entries:** User navigates to a movie entry without a valid numeric TMDB ID; system must gracefully fallback to the existing `MovieDetailModal` without crashing the route.
3. **PWA Safe-Area Clipping on Dynamic Island / Home Bar:** Bottom navigation must never overlap the home indicator or get cropped by browser bars across Safari iOS and Chrome Android.
4. **Duplicate Quick Log Submission:** User spam-taps the "Lưu nhật ký" button during network latency; must disable submission via ref-guard or loading state to prevent duplicate Firestore writes.
5. **Route Transition State Retention:** Navigating from `/` to `/movie/:id` and pressing back must preserve the user's scroll position and library filter state.

---

### Task 1: Theme Foundations & Glassmorphism Design Tokens

**Files:**

- Modify: `src/index.css:7-120`

**Interfaces:**

- Consumes: Tailwind CSS v4 `@theme` block.
- Produces: CSS utility tokens `--color-surface-glass`, `--shadow-glass-elevated`, `--backdrop-blur-glass`, and cinema deep-black values for `.dark`.

- [ ] **Step 1: Inspect and add glassmorphism & cinema tokens to `src/index.css`**
      Add `--color-surface-glass: rgba(20, 20, 23, 0.75)` and `--border-glass: rgba(255, 255, 255, 0.08)` under `@theme` and `.dark` block to support frosted glass navigation and card overlays.
- [ ] **Step 2: Verify CSS token compilation**
      Run: `npm run typecheck && npm run build`
      Expected: Build succeeds with 0 errors and output bundle generated in `dist/`.
- [ ] **Step 3: Commit theme foundations**

```bash
git add src/index.css
git commit -m "style: add cinema dark mode and frosted glass design tokens"
```

---

### Task 2: TMDB Service Extensions for Discovery & Recommendations

**Files:**

- Modify: `src/features/search/services/tmdb/movieService.ts`
- Modify: `src/features/search/services/tmdb/discoveryService.ts`
- Modify: `src/features/search/services/tmdb/index.ts`
- Test: `src/features/search/services/tmdb/discoveryService.test.ts` (or node verification script)

**Interfaces:**

- Consumes: `tmdbFetch` client from `src/features/search/services/tmdb/client.ts`.
- Produces:
  - `getNowPlayingMovies(page?: number): Promise<TMDBResponse<TMDBMovieResult>>`
  - `getUpcomingMovies(page?: number): Promise<TMDBResponse<TMDBMovieResult>>`
  - `getTopRatedMovies(page?: number): Promise<TMDBResponse<TMDBMovieResult>>`
  - `getMovieCredits(movieId: number): Promise<{ cast: TMDBCastMember[]; crew: TMDBCrewMember[] }>`
  - `getMovieRecommendations(movieId: number): Promise<TMDBResponse<TMDBMovieResult>>`

- [ ] **Step 1: Write verification script for new TMDB endpoints**
      Create temporary verification test `src/features/search/services/tmdb/endpoints.test.ts` asserting signatures and expected response schemas.
- [ ] **Step 2: Implement read functions in `discoveryService.ts` and `movieService.ts`**
      Implement `getNowPlayingMovies`, `getUpcomingMovies`, `getTopRatedMovies`, `getMovieCredits`, and `getMovieRecommendations` utilizing existing `tmdbFetch`.
- [ ] **Step 3: Export functions via `src/features/search/services/tmdb/index.ts`**
      Re-export the new functions and update types in `src/types/tmdb.ts` if cast/crew types are missing.
- [ ] **Step 4: Verify typecheck passes**
      Run: `npm run typecheck`
      Expected: PASS with 0 errors.
- [ ] **Step 5: Commit TMDB service extensions**

```bash
git add src/features/search/services/tmdb/ src/types/tmdb.ts
git commit -m "feat(tmdb): add discovery endpoints for now playing, upcoming and recommendations"
```

---

### Task 3: 5-Tab Frosted Glass Mobile Bottom Navigation

**Files:**

- Modify: `src/shared/config/navigation.ts`
- Modify: `src/shared/components/layout/MobileBottomNav.tsx`
- Modify: `src/app/components/Layout.tsx:30`
- Create: `src/features/movies/stores/quickLogStore.ts`

**Interfaces:**

- Consumes: `useLocation` from `react-router-dom`, `useAuth` from `AuthProvider`.
- Produces: `useQuickLogStore` with `{ isOpen: boolean; openQuickLog: () => void; closeQuickLog: () => void }`, and modernized 5-tab `MobileBottomNav`.

- [ ] **Step 1: Create `quickLogStore.ts` for quick action state**
      Implement Zustand store managing the Quick Log modal open/close state.
- [ ] **Step 2: Update `src/shared/config/navigation.ts`**
      Decouple desktop `NAV_ITEMS` from `MOBILE_NAV_ITEMS` to support the 5 slots: Home (`/`), Search (`/search`), Quick Log (action), Collections (`/albums`), and Profile (`/profile/me`).
- [ ] **Step 3: Redesign `MobileBottomNav.tsx` with frosted glass & center (+) button**
      Implement floating bar with `backdrop-blur-md bg-surface/80 border border-white/10 rounded-2xl`, 4 icon links and a prominent center circular button with elevated shadow and Emerald accent.
- [ ] **Step 4: Update safe-area bottom padding in `Layout.tsx`**
      Adjust `main` padding to `pb-[calc(5.5rem+env(safe-area-inset-bottom,16px))]` to ensure zero overlap.
- [ ] **Step 5: Verify typecheck and lint**
      Run: `npm run typecheck && npm run lint`
      Expected: PASS with 0 errors.
- [ ] **Step 6: Commit navigation overhaul**

```bash
git add src/shared/config/navigation.ts src/shared/components/layout/MobileBottomNav.tsx src/app/components/Layout.tsx src/features/movies/stores/quickLogStore.ts
git commit -m "feat(navigation): implement 5-tab frosted glass bottom nav with quick-log trigger"
```

---

### Task 4: Quick Log Bottom Sheet (Search-to-Log)

**Files:**

- Create: `src/features/movies/components/quick-log/QuickLogSheet.tsx`
- Modify: `src/app/components/Layout.tsx` (embed sheet container)

**Interfaces:**

- Consumes: `useQuickLogStore`, `searchMovies` from TMDB service, `addMovie` from `movieService.ts`, `useAuth`.
- Produces: Interactive Letterboxd-style modal/bottom-sheet: Search input with 300ms debounce $\rightarrow$ TMDB search preview $\rightarrow$ Rating/Date log step $\rightarrow$ Instant save to Firestore.

- [ ] **Step 1: Create `QuickLogSheet.tsx` with two-step state machine**
      Step A: Instant movie search with live poster thumbnails.
      Step B: Rating stars (1-5 stars with 0.5 step granularity), watch date picker, note field, and submit button.
- [ ] **Step 2: Mount `QuickLogSheet` in `Layout.tsx`**
      Ensure it renders conditionally based on `useQuickLogStore.isOpen` with smooth Framer Motion slide-up animation and backdrop overlay.
- [ ] **Step 3: Add duplicate submission guard & toast feedback**
      Use ref-guard in `handleSubmit` to prevent duplicate clicks; display success toast using `useToastStore`.
- [ ] **Step 4: Verify typecheck and lint**
      Run: `npm run typecheck && npm run lint`
      Expected: PASS with 0 errors.
- [ ] **Step 5: Commit Quick Log sheet**

```bash
git add src/features/movies/components/quick-log/QuickLogSheet.tsx src/app/components/Layout.tsx
git commit -m "feat(movies): add Letterboxd-style search-to-log quick sheet"
```

---

### Task 5: Dedicated Full-Screen Movie Detail Page (`/movie/:id`)

**Files:**

- Create: `src/features/movies/pages/MovieDetailPage.tsx`
- Create: `src/features/movies/components/detail/MovieDetailHeader.tsx`
- Create: `src/features/movies/components/detail/MovieActionPills.tsx`
- Create: `src/features/movies/components/detail/MovieCastList.tsx`
- Create: `src/features/movies/components/detail/MovieRecommendations.tsx`
- Modify: `src/App.tsx:32-42` (register route `/movie/:id`)

**Interfaces:**

- Consumes: `useParams<{ id: string }>`, `getMovieDetails`, `getMovieCredits`, `getMovieRecommendations` from TMDB, `useMovieStore`.
- Produces: Full-bleed `/movie/:id` experience with translucent top bar, poster blur header, Letterboxd 5-star rating conversion ($vote\_average / 2$), action bar, cast avatars, and similar movies carousel.

- [ ] **Step 1: Build subcomponents in `src/features/movies/components/detail/`**
- `MovieDetailHeader.tsx`: Full-bleed backdrop (h-80 to h-96), gradient fade-to-background, floating back arrow button, and title overlay.
- `MovieActionPills.tsx`: Status chips ("Đã xem", "Muốn xem", "Đánh giá") mapped to current user's local `movieStore`.
- `MovieCastList.tsx`: Horizontal carousel of cast members with photos.
- `MovieRecommendations.tsx`: Swimlane of recommended movies with click navigation to `/movie/:newId`.
- [ ] **Step 2: Build `MovieDetailPage.tsx` combining subcomponents**
      Handle loading skeleton, error fallback when TMDB movie is not found, and back navigation handler (`navigate(-1)`).
- [ ] **Step 3: Register `/movie/:id` route in `src/App.tsx`**
      Add `<Route path="/movie/:id" element={<MovieDetailPage />} />` wrapped in Suspense.
- [ ] **Step 4: Verify typecheck, lint, and build**
      Run: `npm run typecheck && npm run lint`
      Expected: PASS with 0 errors.
- [ ] **Step 5: Commit Movie Detail Page**

```bash
git add src/features/movies/pages/MovieDetailPage.tsx src/features/movies/components/detail/ src/App.tsx
git commit -m "feat(movies): implement dedicated full-screen movie detail page at /movie/:id"
```

---

### Task 6: Unified Cinematic Dashboard (`DashboardPage.tsx`)

**Files:**

- Create: `src/features/dashboard/components/DashboardHero.tsx`
- Create: `src/features/dashboard/components/MovieSwimlane.tsx`
- Create: `src/features/dashboard/components/UserLibrarySection.tsx`
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`

**Interfaces:**

- Consumes: `useDashboard` (existing Firestore library state), `getNowPlayingMovies`, `getTrendingMovies`, `getUpcomingMovies` from TMDB.
- Produces: Unified home experience: Apple TV-style auto-rotating Hero Banner + horizontal Discovery Swimlanes + Personal Library section with quick access and expander.

- [ ] **Step 1: Create `DashboardHero.tsx`**
      Auto-advancing carousel (5s interval, pause on hover/touch) displaying top 5 featured movies with high-res backdrop, rating badge, overview snippet, and "Chi tiết" / "Lưu vào Watchlist" buttons.
- [ ] **Step 2: Create `MovieSwimlane.tsx`**
      Reusable horizontal scroll container with title, "Xem tất cả" link, smooth scroll-snap, and movie cards with hover/tap animations.
- [ ] **Step 3: Create `UserLibrarySection.tsx`**
      Extract and package existing user library components: "Vừa xem gần đây" and "Danh sách muốn xem" rows with quick status toggles, plus a collapsible "Bộ lọc & Thư viện đầy đủ" container.
- [ ] **Step 4: Assemble `DashboardPage.tsx`**
      Compose `DashboardHero` at the top $\rightarrow$ `MovieSwimlane` (Đang chiếu rạp, Thịnh hành) $\rightarrow$ `UserLibrarySection` $\rightarrow$ `MovieSwimlane` (Sắp ra mắt).
- [ ] **Step 5: Verify typecheck and lint**
      Run: `npm run typecheck && npm run lint`
      Expected: PASS with 0 errors.
- [ ] **Step 6: Commit Unified Dashboard**

```bash
git add src/features/dashboard/components/DashboardHero.tsx src/features/dashboard/components/MovieSwimlane.tsx src/features/dashboard/components/UserLibrarySection.tsx src/features/dashboard/pages/DashboardPage.tsx
git commit -m "feat(dashboard): transform home into unified cinematic discovery and personal library"
```

---

### Task 7: Aesthetic Polish with Mobbin & End-to-End Verification

**Files:**

- Modify: `src/features/movies/components/MovieCard.tsx` (aspect ratio, poster shadows, title truncation)
- Modify: `src/shared/components/layout/MobileBottomNav.tsx` (glass reflection highlights)

**Interfaces:**

- Consumes: Design patterns extracted from Apple TV & Letterboxd.
- Produces: High-fidelity visual finish across all Phase 1 components.

- [ ] **Step 1: Polish card typography and elevation**
      Ensure poster cards use `aspect-2/3`, rounded corners (`rounded-xl`), smooth hover scale (`group-hover:scale-105`), and subtle gradient backdrop overlays.
- [ ] **Step 2: Run complete repository verification suite**
      Run:

```bash
npm run typecheck
npm run lint
npm run build
```

Expected: All 3 commands pass with exit code 0.

- [ ] **Step 3: Commit visual polish**

```bash
git add src/features/movies/components/MovieCard.tsx src/shared/components/layout/MobileBottomNav.tsx
git commit -m "style: polish movie card elevation and mobile navigation glass highlights"
```
