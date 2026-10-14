# CineMOB Taste Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild toàn bộ lớp giao diện CineMOB theo chuẩn taste-frontend v2 (Option A Taste-full), giữ nguyên logic.

**Architecture:** 1 direction sheet duy nhất từ `draw.mjs` làm art direction; tokens tập trung trong `src/index.css` (@theme Tailwind v4); shell ổn định, mỗi nhóm màn 1 composition khác nhau; poster TMDB là imagery chính.

**Tech Stack:** React 19 + TypeScript 5.8 + Vite 6 + Tailwind CSS v4 + Zustand 5 + Firebase 12 + TMDB API + Lucide icons. Node 22+, Chrome/Edge/Chromium cho `inspect.mjs`.

## Global Constraints

- Không đổi Firestore schema, auth, rules, stores, hooks, services (trừ khi plan ghi rõ), PWA/sw, push scripts.
- Không thêm dependency npm mới (chỉ đổi Google Fonts `<link>` trong `index.html`).
- Không đụng `dist/`, `dev-dist/`.
- Giữ `lang="vi"`, sentence case tiếng Việt, không uppercase tracking-widest cho label thường.
- Headline ≤2 dòng mọi width; không eyebrow; không mono ngoài số liệu; không gradient (trừ scrim backdrop); không shadow khi nghỉ; không glass trang trí; tối đa 2 font.
- Mỗi task xong phải chạy `npm run typecheck`, `npm run lint`, `npm run build` xanh mới commit.
- Mỗi task kết thúc bằng code-refactor mode A (review report: Blocker/Major/Minor, tối đa 3 Nit, không bịa lỗi). Sửa Blocker + Major trước khi sang task tiếp theo. Giữ nguyên hành vi khi refactor; bug phát hiện riêng, không trộn vào diff cấu trúc.
- Commit message Conventional Commits (`docs:`, `feat:`, `refactor:`, `style:`).
- Mọi implementation chạy trên nhánh `redesign/taste-full` trong isolated worktree (chưa tạo — tạo ở bước khởi động implementation, không làm trên `master`).

---

## Prerequisites (chưa thực hiện — làm ở bước khởi động implementation)

- [ ] Tạo isolated worktree tại `.worktrees/redesign-taste-full` + nhánh `redesign/taste-full` (verify `git check-ignore`, `npm ci`, baseline `npm test` xanh mới bắt đầu Task 0).
- [ ] Code-refactor áp dụng 7 trục (naming, kích thước/trách nhiệm, DRY có chừng mực, lỗi, cấu trúc/phụ thuộc, bảo mật/PII, testability) + refs React/TS của skill; giữ style codebase hiện tại (quotes, import, naming).

---

### Task 0: Direction deal + tokens + fonts

**Files:**
- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `DESIGN.md`
- Create: `.taste-skill/direction.md` (paste direction sheet)

**Interfaces:**
- Consumes: Không có (task đầu tiên).
- Produces: CSS tokens `--color-*`, `--radius-*`, font links mà Task 1-4 chỉ dùng qua tokens (không hardcode hex).

- [ ] **Step 1: Deal direction và ghi sheet**

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --list sectors
node .agents/skills/design-taste-frontend/scripts/draw.mjs --sector entertainment --brief "CineMOB personal cinema lounge" --sections showcase,list,stats,faq,contact --options 3
```

- [ ] **Step 2: Chốt direction và deal full sheet, paste vào `.taste-skill/direction.md`**

```bash
node .agents/skills/design-taste-frontend/scripts/draw.mjs --sector entertainment --brief "CineMOB personal cinema lounge" --sections showcase,list,stats,faq,contact --direction <id-da-chon>
```

- [ ] **Step 3: Thay tokens trong `src/index.css` theo sheet (giữ tên, đổi giá trị)**

```css
@theme {
  --font-sans: 'Be Vietnam Pro', sans-serif;
  --font-display: 'Bricolage Grotesque', sans-serif;
  --color-background: oklch(15% 0.012 65);
  --color-surface: oklch(19% 0.014 65);
  --color-surface-elevated: oklch(23% 0.016 65);
  --color-text-primary: oklch(93% 0.008 80);
  --color-text-secondary: oklch(72% 0.01 70);
  --color-border: oklch(30% 0.012 65);
  --color-primary: oklch(78% 0.155 70);
  --color-on-primary: oklch(16% 0.02 70);
  --color-focus: oklch(78% 0.155 70);
  --radius-control: 10px;
  --radius-card: 14px;
  --radius-dialog: 20px;
}
```

- [ ] **Step 4: Đổi fonts + theme-color trong `index.html`**

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@700;800&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap&vietnamese=true"
  rel="stylesheet"
/>
```

Run: `npm run typecheck`
Expected: 0 lỗi.

Run: `npm run build`
Expected: build xanh, fonts load đúng trong Network tab.

- [ ] **Step 5: Commit**

```bash
git add src/index.css index.html DESIGN.md .taste-skill/direction.md
git commit -m "feat: deal taste direction and swap global tokens"
```

### Task 1: Shell + shared primitives

**Files:**
- Modify: `src/app/components/Layout.tsx`
- Modify: `src/app/components/Navbar.tsx`
- Modify: `src/shared/components/layout/MobileBottomNav.tsx`
- Modify: `src/shared/components/layout/Footer.tsx`
- Modify: `src/shared/components/ui/Button.tsx`
- Modify: `src/shared/components/ui/IconButton.tsx`
- Modify: `src/shared/components/ui/Dialog.tsx`
- Modify: `src/shared/components/ui/Dropdown.tsx`
- Modify: `src/shared/components/ui/MultiSelectDropdown.tsx`
- Modify: `src/shared/components/ui/DatePicker.tsx`
- Modify: `src/shared/components/ui/TimePicker.tsx`
- Modify: `src/shared/components/ui/Loading.tsx`
- Modify: `src/shared/components/ui/EmptyState.tsx`
- Modify: `src/shared/components/ui/ErrorState.tsx`
- Modify: `src/shared/components/ui/SkeletonCard.tsx`
- Modify: `src/shared/components/ui/PageHeader.tsx`
- Modify: `src/shared/components/ui/Pagination.tsx`

**Interfaces:**
- Consumes: Tokens từ Task 0 (`bg-background`, `bg-surface`, `text-text-primary`, `text-text-secondary`, `bg-primary`, `rounded-control/card/dialog`).
- Produces: Shell phẳng + primitives phẳng mà Task 2-3 dùng nguyên, không override trang trí tại feature.

- [ ] **Step 1: Restyle Navbar thành thanh phẳng**

```tsx
// src/app/components/Navbar.tsx — giữ route/destinations, đổi lớp trình bày
<nav aria-label="Điều hướng chính" className="bg-surface border-b border-border">
  <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
    <a href="/" className="font-display text-xl">CineMOB</a>
    <div className="flex gap-6">{/* links Tìm kiếm, Albums, Lịch chiếu, Thống kê */}</div>
  </div>
</nav>
```

- [ ] **Step 2: Restyle MobileBottomNav 5 tab phẳng**

```tsx
// src/shared/components/layout/MobileBottomNav.tsx — 5 tabs, active = text-primary font-semibold
<nav className="bg-surface border-t border-border pb-[env(safe-area-inset-bottom)]">
  {/* Trang chủ, Tìm kiếm, Albums, Lịch, Cá nhân — icon Lucide + label, min-h 44px */}
</nav>
```

- [ ] **Step 3: Dọn primitives (bỏ glass/glow/icon-tile, 1 fill phẳng, radius token)**

```tsx
// src/shared/components/ui/Button.tsx — ví dụ primary
<button className="bg-primary text-on-primary rounded-control px-4 py-3 font-medium focus-visible:outline-2 outline-focus">
  {children}
</button>
```

- [ ] **Step 4: Verify shell**

Run: `npm run typecheck`
Expected: 0 lỗi.

Run: `npm run lint`
Expected: 0 errors.

Run: `npm run build`
Expected: xanh. Mở app, check header + bottom nav ở 390px và 1440px, tab active rõ, không glass/glow.

- [ ] **Step 5: Commit**

```bash
git add src/app/components src/shared/components
git commit -m "feat: rebuild shell and shared primitives in taste style"
```

### Task 2: Màn cinematic (Login, Dashboard, Search, PersonDetail)

**Files:**
- Modify: `src/features/auth/components/Login.tsx`
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`
- Modify: `src/features/dashboard/components/DashboardActions.tsx`
- Modify: `src/features/dashboard/components/DashboardFilters.tsx`
- Modify: `src/features/dashboard/components/DashboardTabs.tsx`
- Modify: `src/features/search/pages/SearchPage.tsx`
- Modify: `src/features/search/components/SearchFilters.tsx`
- Modify: `src/features/search/components/SearchResults.tsx`
- Modify: `src/features/search/components/TMDBMovieCard.tsx`
- Modify: `src/features/search/pages/PersonDetailPage.tsx`
- Modify: `src/features/search/components/person/PersonMovieSection.tsx`
- Modify: `src/features/movies/components/MovieCard.tsx`

**Interfaces:**
- Consumes: Shell + primitives từ Task 1.
- Produces: Hero/rail/fold patterns cho màn cinematic. Không export mới cho Task 3.

- [ ] **Step 1: Rebuild Dashboard hero + rails**

```tsx
// src/features/dashboard/pages/DashboardPage.tsx — hero 1 phim backdrop full-bleed + scrim
<section className="relative -mx-4 md:-mx-6">
  <img src={backdrop} fetchPriority="high" className="w-full aspect-video object-cover" alt="" />
  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
  <h1 className="font-display text-5xl tracking-tight">{title}</h1>
</section>
```

- [ ] **Step 2: Rebuild Search + PersonDetail (rail + fold, không hero)**

Giữ `SearchFilters`, `SearchResults`, `TMDBMovieCard` logic; đổi sang rows phẳng + poster `aspect-2/3` + `loading="lazy"` dưới fold.

- [ ] **Step 3: Rebuild Login cinematic nhẹ**

Giữ auth flow; 1 field màu bẹt, headline ≤32 ký tự, 1 nút chính.

- [ ] **Step 4: Verify cinematic**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: xanh hết. Check 390/768/1440: hero tràn viền, headline ≤2 dòng, mỗi rail 1 composition khác nhau.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard src/features/search src/features/auth
git commit -m "feat: rebuild cinematic screens in taste style"
```

### Task 3: Màn quản lý + toàn bộ modals

**Files:**
- Modify: `src/features/albums/pages/AlbumsPage.tsx`
- Modify: `src/features/albums/pages/AlbumDetailPage.tsx`
- Modify: `src/features/albums/components/AlbumSelectorModal.tsx`
- Modify: `src/features/calendar/pages/ReleaseCalendarPage.tsx`
- Modify: `src/features/calendar/components/CalendarGrid.tsx`
- Modify: `src/features/calendar/components/CalendarStats.tsx`
- Modify: `src/features/calendar/components/EpisodeList.tsx`
- Modify: `src/features/stats/pages/StatsPage.tsx`
- Modify: `src/features/stats/components/StatsCard.tsx`
- Modify: `src/features/profile/pages/MemberProfilePage.tsx`
- Modify: `src/features/profile/components/MemberProfileCard.tsx`
- Modify: `src/features/profile/components/MovieListSection.tsx`
- Modify: `src/features/profile/components/OwnProfileEditor.tsx`
- Modify: `src/features/profile/components/ProfileMeta.tsx`
- Modify: `src/features/profile/components/ProfileMovieCard.tsx`
- Modify: `src/features/profile/components/user/MemberSearchModal.tsx`
- Modify: `src/features/movies/components/AddMovieModal.tsx`
- Modify: `src/features/movies/components/MovieDetailModal.tsx`
- Modify: `src/features/movies/components/RandomPickerModal.tsx`
- Modify: `src/features/movies/components/add-movie/AlbumSection.tsx`
- Modify: `src/features/movies/components/add-movie/MovieFormFields.tsx`
- Modify: `src/features/movies/components/add-movie/PosterPreview.tsx`
- Modify: `src/features/movies/components/add-movie/RatingSection.tsx`
- Modify: `src/features/movies/components/add-movie/StatusToggle.tsx`
- Modify: `src/features/movies/components/add-movie/TVProgressSection.tsx`
- Modify: `src/features/movies/components/random-picker/PickerWheel.tsx`

**Interfaces:**
- Consumes: Shell + primitives (Task 1), patterns cinematic (Task 2, chỉ tham khảo).
- Produces: App hoàn chỉnh về mặt trình bày. Không đổi store/service signatures.

- [ ] **Step 1: Restyle Albums, Calendar, Stats, Profile thành spec-sheet quiet**

```tsx
// Ví dụ AlbumsPage — rows + heading + khoảng trắng, không card-in-card
<section className="max-w-7xl mx-auto px-4 md:px-6">
  <h1 className="font-display text-4xl">Albums</h1>
  <ul className="divide-y divide-border">{/* rows */}</ul>
</section>
```

- [ ] **Step 2: Restyle toàn bộ modals (giữ DOM semantic + aria, đổi lớp trình bày)**

Centered dialog / bottom-sheet mobile / fullscreen-form mobile; 1 transition duy nhất; confetti chỉ RandomPicker.

- [ ] **Step 3: Verify management**

Run: `npm run typecheck`
Expected: 0 lỗi.

Run: `npm run lint`
Expected: 0 errors, ≤200 warnings.

Run: `npm run build`
Expected: xanh. Smoke tay: albums CRUD, calendar, stats, profile, add/edit movie, random picker.

- [ ] **Step 4: Commit**

```bash
git add src/features/albums src/features/calendar src/features/stats src/features/profile src/features/movies
git commit -m "feat: rebuild management screens and modals in taste style"
```

### Task 4: Motion + gate + report

**Files:**
- Modify: `src/constants/animations.ts` (nạp giá trị mới vào đúng chỗ cũ nếu tương thích)
- Modify: các file còn `transition-all` / `hover:scale-105` toàn cục (tìm bằng lint)

**Interfaces:**
- Consumes: Toàn bộ UI từ Task 0-3.
- Produces: Motion layer + gate xanh + report.

- [ ] **Step 1: Thêm motion layer (signature move + entrance stagger + feedback + 1 moving picture)**

```css
/* Tokens: micro 120ms, short 220ms, long 420ms, ease-out cubic-bezier(0.16,1,0.3,1) */
.reveal { opacity: 0; translate: 0 24px; transition: opacity 220ms, translate 220ms; }
.reveal.is-visible { opacity: 1; translate: 0 0; }
@media (prefers-reduced-motion: reduce) { .reveal { transition: opacity 150ms; translate: none; } }
```

- [ ] **Step 2: Chạy gate**

```bash
node .agents/skills/design-taste-frontend/scripts/lint.mjs src
node .agents/skills/design-taste-frontend/scripts/inspect.mjs dist/index.html
```

Expected: 0 FAIL. WARN nào cũng phải giải thích 1 câu hoặc fix.

- [ ] **Step 3: Look 3 vòng + fix top 3**

Mở screenshots `.taste-skill/inspect/` ở 1440/768/390, critique theo `references/critique.md`, fix, chạy lại inspect.

- [ ] **Step 4: Final verify + commit**

Run: `npm test`
Expected: pass.

Run: `npm run typecheck && npm run lint && npm run format:check && npm run build`
Expected: xanh hết.

```bash
git add src/constants docs
git commit -m "feat: add taste motion layer and pass gate"
```
