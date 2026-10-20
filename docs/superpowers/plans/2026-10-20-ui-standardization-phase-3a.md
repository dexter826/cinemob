# UI Standardization Phase 3A — App shell, shared UI, auth

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hoá app shell, shared UI và auth theo `DESIGN.md`: thay raw size bằng utility có tên, radius token, `focus-ring`, icon stroke 1.5, `on-primary`, thêm `width`/`height` cho ảnh. Không đụng movies/albums/profile/search/calendar/stats/dashboard (Phase 3B-3C).

**Architecture:** Sửa tại nguồn của từng lớp: token/utility ở `src/index.css`, shared primitive ở `src/shared/components/ui`, shell ở `src/app/components`, auth ở `src/features/auth`. Mọi thay đổi chỉ ở lớp trình bày, không đổi logic/state/props.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (§3.1, §3.2, §4). Người dùng đã chốt: chữ Anton ở size chưa có trong scale dùng 2 utility có tên mới (`text-display-md`, `text-brand`).

## Bảng mapping (áp dụng cho mọi task)

| Class cũ (ngữ cảnh)                                           | Utility mới              |
| ------------------------------------------------------------- | ------------------------ |
| `text-3xl sm:text-4xl md:text-5xl` (h1 Anton)                 | `text-display-xl`        |
| `text-2xl sm:text-3xl md:text-4xl` (h1 Anton)                 | `text-display-lg`        |
| `text-2xl` / `text-xl` (wordmark Anton)                       | `text-brand` (24→36)     |
| `text-4xl sm:text-5xl` (wordmark splash Anton)                | `text-brand` (36→48)     |
| `font-display text-xl` / `font-display text-lg` (Anton 20/18) | `text-display-md`        |
| `text-5xl sm:text-6xl` (số liệu Anton)                        | `text-display-stat`      |
| `text-7xl md:text-9xl` (404)                                  | `text-display-404`       |
| `text-lg` / `text-xl` (tiêu đề sans)                          | `text-title-md` (18)     |
| `text-sm` (nội dung 14px)                                     | `text-body`              |
| `text-xs` (nội dung 12px)                                     | `text-body-sm`           |
| `text-[11px]`, `text-[11.5px]`, `text-[10px] uppercase`       | `text-label-caps` (11)   |
| `text-[9px]`, `text-[10px]` (meta nhỏ)                        | `text-micro-caps` (9)    |
| `text-[11px] font-semibold uppercase tracking-[0.1em]`        | `text-label-caps`        |
| `rounded-lg` (control, chip, icon button)                     | `rounded-control`        |
| `rounded-md` (bar skeleton nhỏ)                               | `rounded-poster`         |
| `focus-visible:ring-1 focus-visible:ring-primary/*`           | `focus-ring`             |
| icon Lucide không set `strokeWidth` (mặc định 2)              | thêm `strokeWidth={1.5}` |

Ngoại lệ giữ nguyên: `mobile-bottom-nav.tsx` icon `strokeWidth={isActive ? 2 : 1.5}`; `cinemob-symbol.tsx` 3; `picker-wheel.tsx` chevron 2.5; `text-white` trên nền đen/ảnh; `confetti-burst.tsx` `rounded-[1px]` (hạt trang trí).

## Global Constraints

- Chỉ sửa các file nêu trong plan. Không sửa `src/features/movies`, `src/features/albums`, `src/features/profile`, `src/features/search`, `src/features/calendar`, `src/features/stats`, `src/features/dashboard` — thuộc Phase 3B/3C.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push. Dừng sau khi báo diff, gate và review.
- `DESIGN.md` > spec > plan. Lệch ảnh hưởng scope thì dừng hỏi người dùng.
- Không dùng `text-[…px]` hay `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/9xl` cho size trong file đã sửa. `tracking-[…]`/`leading-[…]` giữ nguyên nếu không thuộc size.
- Không đổi layout, IA, copy, logic, state, props, ref, event.
- Icon Lucide: `strokeWidth={1.5}` trừ ngoại lệ nêu trên.
- Ảnh: thêm `width`/`height` theo kích thước hiển thị thực tế; ảnh above-the-fold thêm `fetchpriority="high"`.
- Sau mỗi task: Prettier file đã sửa → `npm run typecheck` → `npm run lint` → `npm run build` → gate grep → đánh dấu checkbox của task đó bằng **công cụ edit** (không dùng shell: `Set-Content` làm hỏng encoding UTF-8 của file tiếng Việt).
- Sau mỗi task: review 7 trục (skill `code-refactor`, chế độ A) + ghi vào `docs/ui-standardization-progress-2026-10-20.md`. BLOCKER/MAJOR sửa ngay rồi chạy lại gate.
- Chạy mọi lệnh từ root repo `C:\MyProject\cinemob`.

---

## Task 1: Thêm 2 utility có tên + cập nhật DESIGN.md và spec

**Files:**

- Modify: `src/index.css` — append sau `@utility focus-ring`
- Modify: `DESIGN.md` — mục Typography (utility contract) và Implementation Notes
- Modify: `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` — §3.1 và §2.3

**Interfaces:**

- Consumes: `--font-display`.
- Produces: `text-display-md` (Anton 20px), `text-brand` (Anton 36→48px).

- [x] **Step 1: Append 2 utility vào `src/index.css`**

```css
@utility text-display-md {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
  line-height: 1.2;
  letter-spacing: 0.02em;
}

@utility text-brand {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.02em;

  @media (min-width: 40rem) {
    font-size: 48px;
  }
}
```

- [x] **Step 2: Ghi utility mới vào `DESIGN.md`**

Trong mục Typography, sau dòng liệt kê caps label, thêm:

```md
- Chữ display có tên đầy đủ: `text-display-xl` (30→36→48), `text-display-lg` (24→30→36), `text-display-md` (20px), `text-display-stat` (48→60), `text-display-404` (72→96), `text-brand` (36→48).
- `text-brand` là wordmark thương hiệu: splash 36→48px, login 24→36px. `text-display-md` là display title 20px (brand navbar/footer, tên phim/người dùng hiển thị lớn).
```

Trong Implementation Notes, sửa dòng "**Type utility:**" để thêm `text-display-md` và `text-brand` vào danh sách.

- [x] **Step 3: Cập nhật spec §3.1 và §2.3**

- Thêm 2 dòng vào bảng §3.1:

| `text-display-md` | Anton | 20px | 400 | 1.2 | .02em | không |
| `text-brand` | Anton | 36px (48px) | 400 | 1.0 | .02em | không |

- Ở §2.3, sửa dòng "Splash wordmark" thành: `Splash wordmark | Anton 36→48px qua `text-brand` | wordmark thương hiệu, không tính vào type scale`.

- [x] **Step 4: Format, typecheck, lint, build**

```powershell
npx prettier --write src/index.css DESIGN.md docs/superpowers/specs/2026-10-20-ui-standardization-design.md
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 5: Gate Task 1**

```powershell
git grep -n -E "@utility text-(display-md|brand)" -- src/index.css
git grep -n -E "text-display-md|text-brand" -- DESIGN.md docs/superpowers/specs/2026-10-20-ui-standardization-design.md
git status --short
```

Expected: 2 dòng `@utility` trong index.css; `DESIGN.md` và spec có cả 2 tên; không có file `src/` nào ngoài index.css bị đụng.

- [x] **Step 6: Review 7 trục + cập nhật log**

Review diff theo 7 trục, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 3A — Task 1).

- [x] **Step 7: Dừng, không commit**

---

## Task 2: Shared UI primitives còn lại

**Files:**

- Modify: `src/shared/components/ui/page-header.tsx`
- Modify: `src/shared/components/ui/stat.tsx`
- Modify: `src/shared/components/ui/section-header.tsx`
- Modify: `src/shared/components/ui/empty-state.tsx`
- Modify: `src/shared/components/ui/error-state.tsx`
- Modify: `src/shared/components/ui/loading.tsx`
- Verify only: `src/shared/components/ui/loading-status.tsx`
- Verify only: `src/shared/components/ui/scroll-to-top.tsx`
- Verify only: `src/shared/components/ui/lazy-dialog.tsx`
- Verify only: `src/shared/components/ui/spinner.tsx`

**Interfaces:**

- Consumes: `text-display-lg`, `text-display-stat`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`, `text-micro-caps`.
- Produces: page title/stat/label theo contract; không đổi props.

- [x] **Step 1: `page-header.tsx`**

```diff
- <h1 className="font-display tracking-wide text-2xl sm:text-3xl md:text-4xl text-text-primary truncate">
+ <h1 className="text-display-lg tracking-wide text-text-primary truncate">
...
- <p className="text-xs sm:text-sm text-text-secondary font-medium line-clamp-2 mt-0.5">
+ <p className="text-body-sm sm:text-body text-text-secondary font-medium line-clamp-2 mt-0.5">
```

- [x] **Step 2: `stat.tsx`**

```diff
- <p className="text-text-secondary text-[11px] font-semibold tracking-[0.1em] mb-1.5">
+ <p className="text-label-caps text-text-secondary mb-1.5">
...
- <p className="font-display tracking-wide text-5xl sm:text-6xl text-text-primary leading-none tabular-nums">
+ <p className="text-display-stat tracking-wide text-text-primary leading-none tabular-nums">
...
- <p className="text-[11px] font-semibold tracking-[0.08em] text-text-secondary mt-2 tabular-nums">
+ <p className="text-micro-caps text-text-secondary mt-2 tabular-nums">
```

- [x] **Step 3: `section-header.tsx`**

```diff
- 'text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary',
+ 'text-label-caps text-text-secondary',
```

- [x] **Step 4: `empty-state.tsx` và `error-state.tsx`**

```diff
- <h3 className="text-lg font-bold text-text-primary tracking-tight text-balance">{title}</h3>
+ <h3 className="text-title-md text-text-primary tracking-tight text-balance">{title}</h3>
...
- <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed mt-1">
+ <p className="text-text-secondary text-body mb-6 max-w-xs leading-relaxed mt-1">
```

Trong `empty-state.tsx`, nút primary:

```diff
- className="inline-flex items-center justify-center font-semibold cursor-pointer transition bg-primary text-on-primary hover:bg-primary-hover border border-transparent px-4 py-2.5 text-sm gap-2 rounded-control"
+ className="inline-flex items-center justify-center font-semibold cursor-pointer transition bg-primary text-on-primary hover:bg-primary-hover border border-transparent px-4 py-2.5 text-body-sm gap-2 rounded-control"
```

- [x] **Step 5: `loading.tsx`**

```diff
- <span className="text-xs font-medium text-text-secondary">{text}</span>
+ <span className="text-body-sm font-medium text-text-secondary">{text}</span>
```

- [x] **Step 6: Verify 4 file không cần sửa**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl)|rounded-(md|lg)|focus-visible:ring" -- src/shared/components/ui/loading-status.tsx src/shared/components/ui/scroll-to-top.tsx src/shared/components/ui/lazy-dialog.tsx src/shared/components/ui/spinner.tsx
```

Expected: không có output → không sửa 4 file này.

- [x] **Step 7: Format, typecheck, lint, build**

```powershell
npx prettier --write src/shared/components/ui/page-header.tsx src/shared/components/ui/stat.tsx src/shared/components/ui/section-header.tsx src/shared/components/ui/empty-state.tsx src/shared/components/ui/error-state.tsx src/shared/components/ui/loading.tsx
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 8: Gate Task 2**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)" -- src/shared/components/ui/page-header.tsx src/shared/components/ui/stat.tsx src/shared/components/ui/section-header.tsx src/shared/components/ui/empty-state.tsx src/shared/components/ui/error-state.tsx src/shared/components/ui/loading.tsx
git status --short
```

Expected: lệnh grep không có output; chỉ 6 file `M` + docs Task 1.

- [x] **Step 9: Review 7 trục + cập nhật log**

- [x] **Step 10: Dừng, không commit**

---

## Task 3: Feedback + trang 404

**Files:**

- Modify: `src/shared/components/feedback/splash-screen.tsx`
- Modify: `src/shared/components/feedback/alert-container.tsx`
- Modify: `src/shared/components/feedback/error-boundary.tsx`
- Modify: `src/shared/pages/not-found-page.tsx`
- Verify only: `src/shared/components/feedback/confetti-burst.tsx`

**Interfaces:**

- Consumes: `text-brand`, `text-display-404`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`.
- Produces: wordmark/404/dialog theo contract; icon 1.5.

- [x] **Step 1: `splash-screen.tsx`**

```diff
- <span className="font-display text-4xl sm:text-5xl tracking-wide text-text-primary">
+ <span className="text-brand tracking-wide text-text-primary">
...
- <LoadingStatus className="text-sm text-text-secondary">Đang xác thực…</LoadingStatus>
+ <LoadingStatus className="text-body text-text-secondary">Đang xác thực…</LoadingStatus>
```

- [x] **Step 2: `alert-container.tsx`**

```diff
- <h2 id={TITLE_ID} className="text-xl font-bold text-text-primary tracking-tight">
+ <h2 id={TITLE_ID} className="text-title-md text-text-primary tracking-tight">
```

Icon `AlertTriangle` và `Info` trong file: thêm `strokeWidth={1.5}` (đọc đúng chỗ hiện tại, không đổi size).

- [x] **Step 3: `error-boundary.tsx`**

```diff
- <p className="text-lg font-bold">Đã xảy ra lỗi khi hiển thị</p>
+ <p className="text-title-md">Đã xảy ra lỗi khi hiển thị</p>
...
- <p className="text-sm text-text-secondary">Thử tải lại trang hoặc quay về trang chủ.</p>
+ <p className="text-body text-text-secondary">Thử tải lại trang hoặc quay về trang chủ.</p>
...
- className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary-hover transition-colors cursor-pointer"
+ className="rounded-control bg-primary px-4 py-2 text-body-sm font-bold text-on-primary hover:bg-primary-hover transition-colors cursor-pointer"
...
- className="rounded-lg border border-border-default px-4 py-2 text-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
+ className="rounded-control border border-border-default px-4 py-2 text-body-sm font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
```

- [x] **Step 4: `not-found-page.tsx`**

```diff
- <p className="font-display leading-none text-7xl md:text-9xl text-text-primary tabular-nums">
+ <p className="text-display-404 leading-none text-text-primary tabular-nums">
...
- <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-text-secondary">
+ <p className="mt-4 text-label-caps text-text-secondary">
...
- className="inline-flex items-center justify-center font-semibold cursor-pointer transition px-4 py-2.5 text-xs gap-2 rounded-control bg-transparent text-text-primary border border-border hover:border-primary hover:text-primary"
+ className="inline-flex items-center justify-center font-semibold cursor-pointer transition px-4 py-2.5 text-body-sm gap-2 rounded-control bg-transparent text-text-primary border border-border hover:border-primary hover:text-primary"
```

- [x] **Step 5: Format, typecheck, lint, build + gate**

```powershell
npx prettier --write src/shared/components/feedback/splash-screen.tsx src/shared/components/feedback/alert-container.tsx src/shared/components/feedback/error-boundary.tsx src/shared/pages/not-found-page.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)|rounded-(md|lg)" -- src/shared/components/feedback src/shared/pages/not-found-page.tsx
```

Expected: grep không có output (trừ `rounded-[1px]` hạt confetti — không nằm trong mẫu trên).

- [x] **Step 6: Review 7 trục + cập nhật log**

- [x] **Step 7: Dừng, không commit**

---

## Task 4: App shell — navbar, mobile nav, footer, layout

**Files:**

- Modify: `src/app/components/navbar.tsx`
- Modify: `src/shared/components/layout/mobile-bottom-nav.tsx`
- Modify: `src/shared/components/layout/footer.tsx`
- Modify: `src/app/components/layout.tsx`

**Interfaces:**

- Consumes: `text-display-md`, `text-label-caps`, `text-micro-caps`, `text-body`, `text-body-sm`.
- Produces: shell dùng utility có tên; avatar có `width`/`height`; icon 1.5.

- [x] **Step 1: `navbar.tsx`**

```diff
- <span className="font-display text-xl tracking-wide select-none">
+ <span className="text-display-md tracking-wide select-none">
...
- className={`relative flex items-center h-full px-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap ${
+ className={`relative flex items-center h-full px-3 text-label-caps transition-colors cursor-pointer whitespace-nowrap ${
...
- <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold shrink-0">
+ <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-body-sm font-bold shrink-0">
...
- <p className="text-sm font-semibold text-text-primary truncate">
+ <p className="text-body font-semibold text-text-primary truncate">
```

3 dòng menu tài khoản (`text-sm` → `text-body`), `ChevronDown` (dòng ~179) thêm `strokeWidth={1.5}`.

Ảnh avatar (dòng ~168): thêm `width={28} height={28}` (khung `w-7 h-7`) và `loading="lazy"` nếu chưa có. Không đổi `src`/`alt`.

- [x] **Step 2: `mobile-bottom-nav.tsx`**

```diff
- className={`text-[9px] font-semibold uppercase tracking-[0.05em] ${
+ className={`text-micro-caps ${
```

Giữ `strokeWidth={isActive ? 2 : 1.5}` (ngoại lệ active nav).

- [x] **Step 3: `footer.tsx`**

```diff
- <span className="font-display text-lg tracking-wide select-none">
+ <span className="text-display-md tracking-wide select-none">
...
- <div className="flex-1 text-[10px] font-medium tracking-[0.1em] text-text-secondary flex items-center justify-center md:justify-end">
+ <div className="flex-1 text-micro-caps text-text-secondary flex items-center justify-center md:justify-end">
```

- [x] **Step 4: `layout.tsx`**

```diff
- className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-on-primary"
+ className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:font-semibold focus:text-on-primary"
```

- [x] **Step 5: Format, typecheck, lint, build + gate**

```powershell
npx prettier --write src/app/components/navbar.tsx src/shared/components/layout/mobile-bottom-nav.tsx src/shared/components/layout/footer.tsx src/app/components/layout.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl)" -- src/app/components/navbar.tsx src/shared/components/layout src/app/components/layout.tsx
```

Expected: grep không có output.

- [x] **Step 6: Review 7 trục + cập nhật log**

- [x] **Step 7: Dừng, không commit**

---

## Task 5: Auth — login

**Files:**

- Modify: `src/features/auth/components/login.tsx`
- Verify only: `src/features/auth/components/auth-provider.tsx`

**Interfaces:**

- Consumes: `text-brand`, `text-display-xl`, `text-body`, `text-body-sm`, `text-micro-caps`.
- Produces: login dùng utility có tên; hero poster có `width`/`height` + `fetchpriority="high"`.

- [x] **Step 1: `login.tsx`**

```diff
- <p className="font-display text-2xl tracking-wide">
+ <p className="text-display-lg tracking-wide">
...
- <h1 className="font-display tracking-wide leading-[1.05] text-3xl sm:text-4xl mt-9">
+ <h1 className="text-display-xl tracking-wide leading-[1.05] mt-9">
...
- <p className="mt-3 text-sm text-text-secondary leading-relaxed">
+ <p className="mt-3 text-body text-text-secondary leading-relaxed">
...
- className="mt-10 w-full flex items-center justify-center gap-3 h-11 px-6 rounded-control bg-primary text-on-primary border border-transparent hover:bg-primary-hover font-bold tracking-[0.08em] text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
+ className="mt-10 w-full flex items-center justify-center gap-3 h-11 px-6 rounded-control bg-primary text-on-primary border border-transparent hover:bg-primary-hover font-bold tracking-[0.08em] text-body-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
...
- <footer className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 text-[10px] font-semibold tracking-[0.08em] text-text-secondary shrink-0">
+ <footer className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 text-micro-caps text-text-secondary shrink-0">
```

Ảnh trong `PosterTile` (dòng ~57, dải poster trang trí): thêm `width={500} height={750}` theo tỉ lệ ảnh TMDB w500 (2:3) để chặn layout shift. Không thêm `fetchpriority="high"`: đây là dải poster trang trí, không phải ảnh chính above-the-fold.

- [x] **Step 2: Verify `auth-provider.tsx`**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl)|rounded-(md|lg)" -- src/features/auth/components/auth-provider.tsx
```

Expected: không có output → không sửa.

- [x] **Step 3: Format, typecheck, lint, build + gate**

```powershell
npx prettier --write src/features/auth/components/login.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl)" -- src/features/auth
```

- [x] **Step 4: Review 7 trục + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 6: Verify Phase 3A + review toàn phase

**Files:** toàn bộ file đã sửa Task 1-5.

- [x] **Step 1: Prettier toàn bộ file Phase 3A**

```powershell
npx prettier --write src/index.css DESIGN.md docs/superpowers/specs/2026-10-20-ui-standardization-design.md src/shared/components/ui/page-header.tsx src/shared/components/ui/stat.tsx src/shared/components/ui/section-header.tsx src/shared/components/ui/empty-state.tsx src/shared/components/ui/error-state.tsx src/shared/components/ui/loading.tsx src/shared/components/feedback/splash-screen.tsx src/shared/components/feedback/alert-container.tsx src/shared/components/feedback/error-boundary.tsx src/shared/pages/not-found-page.tsx src/app/components/navbar.tsx src/shared/components/layout/mobile-bottom-nav.tsx src/shared/components/layout/footer.tsx src/app/components/layout.tsx src/features/auth/components/login.tsx
npx prettier --check src/index.css DESIGN.md docs/superpowers/specs/2026-10-20-ui-standardization-design.md src/shared/components/ui/page-header.tsx src/shared/components/ui/stat.tsx src/shared/components/ui/section-header.tsx src/shared/components/ui/empty-state.tsx src/shared/components/ui/error-state.tsx src/shared/components/ui/loading.tsx src/shared/components/feedback/splash-screen.tsx src/shared/components/feedback/alert-container.tsx src/shared/components/feedback/error-boundary.tsx src/shared/pages/not-found-page.tsx src/app/components/navbar.tsx src/shared/components/layout/mobile-bottom-nav.tsx src/shared/components/layout/footer.tsx src/app/components/layout.tsx src/features/auth/components/login.tsx
```

- [x] **Step 2: Typecheck, lint, build**

```powershell
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 3: Gate toàn phase**

```powershell
$files = @(
  "src/shared/components/ui/page-header.tsx",
  "src/shared/components/ui/stat.tsx",
  "src/shared/components/ui/section-header.tsx",
  "src/shared/components/ui/empty-state.tsx",
  "src/shared/components/ui/error-state.tsx",
  "src/shared/components/ui/loading.tsx",
  "src/shared/components/feedback/splash-screen.tsx",
  "src/shared/components/feedback/alert-container.tsx",
  "src/shared/components/feedback/error-boundary.tsx",
  "src/shared/pages/not-found-page.tsx",
  "src/app/components/navbar.tsx",
  "src/shared/components/layout/mobile-bottom-nav.tsx",
  "src/shared/components/layout/footer.tsx",
  "src/app/components/layout.tsx",
  "src/features/auth/components/login.tsx"
)
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)" -- $files
git grep -n -E "rounded-(md|lg)" -- $files
git grep -n -E "focus-visible:ring-1|focus-visible:ring-4" -- $files
git grep -n -E "strokeWidth=\{(1\.8|2|2\.5|undefined)" -- $files
git grep -n "text-white" -- $files
git diff --check
git status --short
git diff --stat
```

Expected: 4 lệnh grep đầu không có output; `text-white` chỉ còn ở nền đen/ảnh; `git diff --check` sạch; không có file ngoài phạm vi.

- [x] **Step 4: Source review**

Rà diff cho: không đổi hành vi focus/keyboard; `font-display` bị thay bằng utility có tên thì phải giữ đúng font Anton; ảnh có `width`/`height` đúng tỉ lệ hiển thị; không đổi copy, layout, logic.

Probe CSS: xác nhận `.text-display-md`, `.text-brand`, `.text-display-xl`, `.text-display-lg` đều emit và `font-semibold` vẫn emit sau `.text-body*`.

- [x] **Step 5: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 6: Dừng, không commit**

Báo diff, gate, kết quả build và review. Không chạy `git add`, `git commit` hay `git push`. Phase 3B sẽ có plan riêng.
