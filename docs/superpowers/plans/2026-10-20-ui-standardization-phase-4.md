# UI Standardization Phase 4 — Motion

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hoá motion theo spec §5: micro hover về 150ms, giữ 200ms cho role medium, 250ms cho progress/slow; verify bảng overlay §5.2, constants và dọn dead code. Không đổi layout/typography/loading.

**Architecture:** `src/constants/animations.ts` là nguồn duy nhất cho duration/easing của framer; `src/index.css` giữ token `--ease-*` và `--animate-page-enter`. Phase này chỉ sửa class `duration-*` trong component và verify các bảng, không thêm token.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, framer-motion, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (§5.1-§5.4, bảng overlay §5.2).

## Bảng role duration

| Role                     | Duration      | Nơi dùng                                                              |
| ------------------------ | ------------- | --------------------------------------------------------------------- |
| fast                     | 120ms         | dropdown, multi-select, popover, menu tài khoản, suggestions          |
| base                     | 150ms         | mặc định; micro hover, focus, toast exit, dialog exit                 |
| medium                   | 200ms         | poster/album zoom, dialog enter, toast enter, route enter, sheet exit |
| slow                     | 250ms         | progress bar, sheet enter                                             |
| picker / pickerAudioTail | 3.15s / 1.95s | random picker (ngoại lệ, không đổi)                                   |

## Global Constraints

- Chỉ sửa class `duration-*` trong 10 file nêu ở Task 1. Không đổi `src/constants/animations.ts`, `src/index.css`, `DESIGN.md`, spec.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push.
- Không dùng PowerShell để sửa file nguồn (hỏng UTF-8); dùng công cụ `edit` hoặc script Node đọc/ghi UTF-8.
- Sau mỗi task: Prettier → typecheck → lint → build → gate grep → đánh dấu checkbox bằng **công cụ edit**.
- Sau mỗi task: review 7 trục (code-refactor, chế độ A) + ghi vào `docs/ui-standardization-progress-2026-10-20.md`.

---

## Task 1: Sweep micro hover `duration-200` → `duration-150`

**Files:** `src/app/components/navbar.tsx`, `src/features/albums/components/album-card.tsx`, `src/features/calendar/components/episode-list.tsx`, `src/features/dashboard/components/dashboard-filters.tsx`, `src/features/movies/components/add-movie/movie-form-fields.tsx`, `src/features/movies/components/poster-card.tsx`, `src/shared/components/layout/footer.tsx`, `src/shared/components/ui/search-field.tsx`, `src/shared/components/ui/date-picker.tsx`, `src/shared/components/ui/time-picker.tsx`

16 site đổi (hover/opacity/scale micro):

| File                    | Dòng          | Cũ                                                                        | Mới            |
| ----------------------- | ------------- | ------------------------------------------------------------------------- | -------------- |
| `navbar.tsx`            | 212, 222, 242 | `transition-colors duration-200 cursor-pointer rounded-control`           | `duration-150` |
| `album-card.tsx`        | 120           | `transition-[opacity,color,background-color] duration-200 cursor-pointer` | `duration-150` |
| `episode-list.tsx`      | 121           | `hover:bg-primary/5 transition-colors duration-200 cursor-pointer`        | `duration-150` |
| `dashboard-filters.tsx` | 62            | `transition-opacity duration-200`                                         | `duration-150` |
| `dashboard-filters.tsx` | 252           | `transition-colors duration-200 cursor-pointer`                           | `duration-150` |
| `dashboard-filters.tsx` | 272           | `transition-opacity duration-200`                                         | `duration-150` |
| `movie-form-fields.tsx` | 106, 132, 160 | `transition-transform duration-200 `                                      | `duration-150` |
| `poster-card.tsx`       | 153           | `transition-opacity duration-200`                                         | `duration-150` |
| `footer.tsx`            | 29            | `hover:text-primary transition-colors duration-200`                       | `duration-150` |
| `search-field.tsx`      | 77            | `transition-opacity duration-200`                                         | `duration-150` |
| `date-picker.tsx`       | 403           | `hover:border-primary/30 transition-colors duration-200`                  | `duration-150` |
| `time-picker.tsx`       | 268           | `hover:border-primary/30 transition-colors duration-200`                  | `duration-150` |

Giữ nguyên `duration-200`: `album-card.tsx` 23 + 95 (zoom/rotate album), `poster-card.tsx` 102 (zoom poster), `poster-preview.tsx` 20 (zoom poster). Giữ `duration-250`: `movie-detail-page.tsx` 225, `stats-page.tsx` 270 (progress bar).

- [x] **Step 1: Áp 16 thay đổi**

- [x] **Step 2: Format, typecheck, lint, build**

```powershell
npx prettier --write src/app/components/navbar.tsx src/features/albums/components/album-card.tsx src/features/calendar/components/episode-list.tsx src/features/dashboard/components/dashboard-filters.tsx src/features/movies/components/add-movie/movie-form-fields.tsx src/features/movies/components/poster-card.tsx src/shared/components/layout/footer.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 3: Gate duration**

```powershell
git grep -n -E "duration-[0-9]+" -- src
```

Expected: còn đúng 6 site `duration-200` (4 zoom + 2 giữ theo bảng role) — thực tế còn **4** site 200 (album-card 23, album-card 95, poster-card 102, poster-preview 20) và **2** site 250 (movie-detail-page 225, stats-page 270); mọi site còn lại là `duration-150` hoặc `duration-200` đã duyệt; không có `duration-300`/`duration-500`/`duration-75`.

- [x] **Step 4: Review 7 trục + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 2: Verify bảng overlay, constants và dead code (không sửa trừ khi lệch)

**Files (verify only):** `src/shared/components/ui/dialog.tsx`, `src/shared/components/ui/lazy-dialog.tsx`, `src/shared/components/ui/dropdown.tsx`, `src/shared/components/ui/multi-select-dropdown.tsx`, `src/shared/components/feedback/toast-container.tsx`, `src/app/index.tsx`, `src/app/components/navbar.tsx`, `src/constants/animations.ts`, `src/index.css`, `src/features/search/components/random-suggestions-section.tsx`

- [x] **Step 1: Verify bảng overlay §5.2**

Đối chiếu từng lớp với code:

| Lớp                        | Kỳ vọng                   | Nơi kiểm tra                                                     |
| -------------------------- | ------------------------- | ---------------------------------------------------------------- |
| Dialog backdrop            | fade enter 200 / exit 150 | `dialog.tsx` `buildDialogVariants` (enter `medium`, exit `base`) |
| Dialog panel               | fade + y8 200 / 150       | cùng hàm (`y: 8`)                                                |
| Sheet backdrop + panel     | enter 250 / exit 200      | cùng hàm (`isSheet` → `slow` / `medium`)                         |
| Dropdown / MultiSelect     | 120 / 120                 | `getPanelMotion` (`MOTION_DURATION.fast`)                        |
| Popover (date/time picker) | 120 / 120                 | `getPanelMotion`                                                 |
| Menu tài khoản             | 120 / 120                 | `navbar.tsx` `getPanelMotion`                                    |
| Toast                      | enter 200 / exit 150      | `toast-container.tsx` (`toastTransition` = medium; exit = base)  |
| Route                      | enter 200, không có exit  | `src/index.css` `--animate-page-enter: page-enter 0.2s`          |

Ghi kết quả từng dòng vào log.

- [x] **Step 2: Verify constants và token**

```powershell
git grep -n -E "MOTION_DURATION|MOTION_EASING|getMotionTransition|getPanelMotion" -- src
git grep -n -E "ease-standard|ease-enter|ease-exit|animate-page-enter" -- src/index.css
```

Expected: `MOTION_DURATION` có `fast 0.12`, `base 0.15`, `medium 0.2`, `slow 0.25` (+ picker 3.15 / pickerAudioTail 1.95 ngoại lệ); `MOTION_EASING` có `standard`/`enter`/`exit`; `index.css` có `--ease-standard/enter/exit` và `--animate-page-enter`.

- [x] **Step 3: Verify Tailwind sinh duration cần dùng**

```powershell
$css = (Get-ChildItem dist\assets\index-*.css | Select-Object -First 1).FullName
$c = Get-Content -Raw $css
foreach ($k in @(".duration-150{", ".duration-200{", ".duration-250{")) { "$k => " + $c.Contains($k) }
```

Expected: cả 3 = True.

- [x] **Step 4: Verify dead code**

```powershell
git grep -n -E "slide-in-right|slide-down|fade-in|splash-rule|layoutId" -- src
```

Expected: không có token animation chết; chỉ còn `layoutId` hợp lệ (tab underline dashboard) — xác nhận nó phục vụ `layoutId` chuyển tab, không phải poster.

- [x] **Step 5: Format, typecheck, lint, build**

```powershell
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 6: Review 7 trục + cập nhật log**

- [x] **Step 7: Dừng, không commit**

---

## Task 3: Verify toàn phase + review

- [x] **Step 1: Gate toàn phase**

```powershell
git grep -n -E "duration-[0-9]+" -- src
git grep -n -E "duration-(75|300|500|1000)" -- src
git diff --check
git status --short
git diff --stat
```

Expected: không có `duration-75/300/500/1000`; `git diff --check` sạch; chỉ 10 file của Task 1 bị đổi.

- [x] **Step 2: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 3: Dừng, không commit**

Báo diff, gate, kết quả build và review. Không chạy `git add`, `git commit` hay `git push`. Phase 5 (loading) sẽ có plan riêng.
