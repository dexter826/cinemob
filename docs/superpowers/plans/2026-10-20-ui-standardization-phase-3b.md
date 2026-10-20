# UI Standardization Phase 3B — Movies + Albums

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hoá 11 file movies + albums theo `DESIGN.md`: raw size → utility có tên, radius token, `focus-ring`, icon stroke 1.5, `on-primary`, `width`/`height` cho ảnh. Không đụng profile/search/calendar/stats/dashboard (Phase 3C) và không sửa motion timing (Phase 4).

**Architecture:** Sửa tại từng component theo bảng mapping Phase 3A; không thêm utility/token mới, không đổi logic/state/props.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (§3.1, §3.2, §4).

## Bảng mapping (giống Phase 3A, thêm vài quy tắc riêng)

| Ngữ cảnh                                                           | Utility mới                                                   |
| ------------------------------------------------------------------ | ------------------------------------------------------------- |
| Tiêu đề 14px (`text-sm font-bold` h3/section)                      | `text-body font-bold` (giữ size, chỉ đổi weight theo utility) |
| Nhãn form 14px (`text-sm font-semibold` + icon)                    | `text-label-caps`                                             |
| Nội dung 14px (`text-sm`)                                          | `text-body`                                                   |
| Nội dung 12px (`text-xs`)                                          | `text-body-sm`                                                |
| Meta 11px có tracking (`text-[11px] ... tracking-…`)               | `text-label-caps`                                             |
| Meta 10px / 9px (`text-[10px]`, `text-[9px]`)                      | `text-micro-caps`                                             |
| H2 18/20px (`text-lg sm:text-xl`)                                  | `text-title-lg`                                               |
| H2 modal 20/24px (`text-xl sm:text-2xl`)                           | `text-title-lg`                                               |
| Anton 20px (`font-display text-xl`)                                | `text-display-md`                                             |
| Anton 30/36/48px (`font-display text-3xl sm:text-4xl md:text-5xl`) | `text-display-xl`                                             |
| Icon button 40px (`rounded-lg`)                                    | `rounded-control`                                             |
| Checkbox nhỏ (`rounded-lg` trên `w-5 h-5`)                         | `rounded-poster`                                              |
| `focus-visible:ring-1 focus-visible:ring-primary/*`                | `focus-ring`                                                  |
| Icon Lucide chưa set `strokeWidth`                                 | thêm `strokeWidth={1.5}`                                      |

Ngoại lệ giữ nguyên: `picker-wheel.tsx` chevron `strokeWidth={2.5}`; `text-white` trên nền đen (`album-detail-page.tsx` nút xoá overlay); `duration-*` giữ nguyên cho Phase 4.

## Global Constraints

- Chỉ sửa 11 file nêu trong plan. Không đụng `src/features/profile`, `src/features/search`, `src/features/calendar`, `src/features/stats`, `src/features/dashboard`, `src/shared`, `src/index.css`, `DESIGN.md`.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push.
- Không dùng `text-[…px]` hay `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl` cho size trong file đã sửa.
- Không đổi layout, IA, copy, logic, state, props, ref, event, motion timing.
- Icon Lucide: `strokeWidth={1.5}` trừ ngoại lệ nêu trên.
- Sau mỗi task: Prettier → typecheck → lint → build → gate grep → đánh dấu checkbox bằng **công cụ edit** (không dùng `Set-Content` — làm hỏng UTF-8).
- Không dùng PowerShell (`Get-Content`/`Set-Content`/`[IO.File]::WriteAllText`) để sửa nội dung file nguồn: PowerShell 5.1 đọc file UTF-8 không BOM theo ANSI nên làm hỏng tiếng Việt. Chỉ dùng công cụ `edit`.
- Sau mỗi task: review 7 trục (code-refactor, chế độ A) + ghi vào `docs/ui-standardization-progress-2026-10-20.md`.

---

## Task 1: Movie detail page

**File:** `src/features/movies/pages/movie-detail-page.tsx`

- [x] **Step 1: Typography**

| Dòng | Element            | Cũ                                                | Mới                                                      |
| ---- | ------------------ | ------------------------------------------------- | -------------------------------------------------------- |
| 114  | meta dưới poster   | `text-[10px] font-semibold tracking-[0.08em]`     | `text-micro-caps`                                        |
| 122  | h1 tên phim        | `font-display … text-3xl sm:text-4xl md:text-5xl` | `text-display-xl …` (giữ `tracking-wide leading-[1.02]`) |
| 126  | tagline            | `text-base sm:text-lg`                            | `text-body`                                              |
| 129  | hàng meta          | `text-[11px] font-semibold tracking-[0.08em]`     | `text-label-caps`                                        |
| 148  | số điểm            | `font-display text-3xl`                           | `text-display-lg`                                        |
| 207  | điểm chi tiết      | `font-display text-xl`                            | `text-display-md`                                        |
| 212  | đơn vị điểm        | `font-sans font-medium text-xs`                   | `text-body-sm`                                           |
| 231  | meta (năm/ngày)    | `text-[10px] font-semibold tracking-[0.08em]`     | `text-micro-caps`                                        |
| 245  | nội dung review    | `text-sm md:text-[15px] leading-[1.7]`            | `text-body leading-[1.7]`                                |
| 256  | nội dung mô tả     | `text-sm leading-[1.7]`                           | `text-body leading-[1.7]`                                |
| 269  | nhãn chi tiết      | `text-[11px] font-semibold`                       | `text-label-caps`                                        |
| 272  | giá trị chi tiết   | `text-sm`                                         | `text-body`                                              |
| 282  | nhãn chi tiết 2    | `text-[11px] font-semibold`                       | `text-label-caps`                                        |
| 285  | danh sách thể loại | `text-sm`                                         | `text-body`                                              |

- [x] **Step 2: Icon stroke 1.5**

Thêm `strokeWidth={1.5}` cho: `ArrowLeft` (100), `Calendar` (115), `Star` (143), `Play` (158, 170), `FolderPlus` (176), `Pencil` (186), `Trash2` (194), `Star` (253). Không đổi `size`.

- [x] **Step 3: Format, verify, gate**

```powershell
npx prettier --write src/features/movies/pages/movie-detail-page.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)" -- src/features/movies/pages/movie-detail-page.tsx
```

Expected: grep không có output. Ảnh poster đã có `width`/`height` → không sửa.

- [x] **Step 4: Review 7 trục + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 2: Add movie — modal, form fields, các section

**Files:**

- Modify: `src/features/movies/components/add-movie-modal.tsx`
- Modify: `src/features/movies/components/add-movie/movie-form-fields.tsx`
- Modify: `src/features/movies/components/add-movie/album-section.tsx`
- Modify: `src/features/movies/components/add-movie/rating-section.tsx`
- Modify: `src/features/movies/components/add-movie/poster-preview.tsx`

- [x] **Step 1: `add-movie-modal.tsx` — typography**

| Dòng                         | Element          | Cũ                              | Mới                          |
| ---------------------------- | ---------------- | ------------------------------- | ---------------------------- |
| 127                          | h2 modal         | `text-xl sm:text-2xl font-bold` | `text-title-lg`              |
| 174                          | tên phim đã chọn | `text-xs font-semibold`         | `text-body-sm font-semibold` |
| 178                          | phụ đề           | `text-xs`                       | `text-body-sm`               |
| 195, 204                     | tab              | `text-xs sm:text-sm`            | `text-body-sm sm:text-body`  |
| 217, 249, 270, 359, 382, 396 | nhãn field       | `text-sm font-semibold`         | `text-label-caps`            |
| 233, 261, 283                | input            | `text-sm font-bold`             | `text-body font-bold`        |
| 240                          | lỗi              | `text-xs font-medium`           | `text-body-sm font-medium`   |
| 320                          | h3 xem review    | `text-sm font-bold`             | `text-body font-bold`        |
| 321                          | mô tả preview    | `text-xs`                       | `text-body-sm`               |
| 371                          | textarea review  | `text-sm font-medium`           | `text-body font-medium`      |

- [x] **Step 2: `add-movie-modal.tsx` — focus + icon**

- 4 input/textarea (`233`, `261`, `283`, `371`) đang có `focus-visible:ring-1 focus-visible:ring-primary/20` → thay bằng `focus-ring`. Riêng textarea (371) đang `focus-visible:ring-4 focus-visible:ring-primary/5` → thay bằng `focus-ring` cho đồng bộ.
- Icon thêm `strokeWidth={1.5}`: `X` (133), `Film` (197), `Star` (206), `Type` (219, 251), `Image` (272), `MessageSquare` (317, 361), `Calendar` (384), `Clock` (398), `Save` (463). `MessageSquare` tại 317 chưa có `aria-hidden` → thêm `aria-hidden="true"` (icon trang trí).

- [x] **Step 3: `movie-form-fields.tsx`**

| Dòng                       | Element        | Cũ                      | Mới                                                                                                  |
| -------------------------- | -------------- | ----------------------- | ---------------------------------------------------------------------------------------------------- |
| 68, 99, 125, 150, 198, 230 | nhãn field     | `text-sm font-semibold` | `text-label-caps`                                                                                    |
| 89                         | dòng read-only | `text-sm font-semibold` | `text-body font-semibold`                                                                            |
| 180                        | input runtime  | `text-sm font-semibold` | `text-body font-semibold` + `focus-ring` (thay `focus-visible:ring-1 focus-visible:ring-primary/20`) |
| 184                        | lỗi            | `text-xs font-medium`   | `text-body-sm font-medium`                                                                           |
| 242                        | textarea       | `text-sm font-medium`   | `text-body font-medium` + `focus-ring`                                                               |

Icon `strokeWidth={1.5}`: `Film` (70), `Globe` (101), `Calendar` (127), `Tv` (153), `Clock` (155), `Film` (200), `AlignLeft` (232).

- [x] **Step 4: `album-section.tsx`**

- 62 nhãn: `text-xs font-medium` → `text-label-caps`.
- 69 nút toggle: `text-xs font-semibold … rounded-lg` → `text-body-sm font-semibold … rounded-control`.
- 100 input: `text-sm font-medium` → `text-body font-medium` + `focus-ring`.
- 106 nút "Tạo": `text-sm font-bold` → `text-body-sm font-bold`.
- Icon `strokeWidth={1.5}`: `FolderPlus` (63), `X` (73), `Plus` (77).

- [x] **Step 5: `rating-section.tsx`**

- 44 nhãn: `text-sm font-semibold` → `text-label-caps`.
- 49 số điểm: `text-xs font-bold` → `text-body-sm font-bold`.
- 78 nút sao: `rounded-lg` → `rounded-control`.
- Icon `strokeWidth={1.5}`: `Star` (46), `Star` (80).

- [x] **Step 6: `poster-preview.tsx`**

- 26 nhãn "Chưa có ảnh": `text-xs font-bold` → `text-body-sm font-bold`.
- 24 `ImageIcon` → `strokeWidth={1.5}`.
- 15 `<img>`: thêm `width={500} height={750}` (tỉ lệ 2:3 của ảnh TMDB w500).

- [x] **Step 7: Format, verify, gate**

```powershell
npx prettier --write src/features/movies/components/add-movie-modal.tsx src/features/movies/components/add-movie/movie-form-fields.tsx src/features/movies/components/add-movie/album-section.tsx src/features/movies/components/add-movie/rating-section.tsx src/features/movies/components/add-movie/poster-preview.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl)" -- src/features/movies/components/add-movie-modal.tsx src/features/movies/components/add-movie
git grep -n -E "focus-visible:ring-[0-9]" -- src/features/movies/components/add-movie-modal.tsx src/features/movies/components/add-movie
git grep -n -E "rounded-(md|lg)" -- src/features/movies/components/add-movie
```

Expected: 3 lệnh grep không có output.

- [x] **Step 8: Review 7 trục + cập nhật log**

- [x] **Step 9: Dừng, không commit**

---

## Task 3: TV progress section

**File:** `src/features/movies/components/add-movie/tv-progress-section.tsx`

- [x] **Step 1: Typography**

| Dòng | Element          | Cũ                      | Mới                          |
| ---- | ---------------- | ----------------------- | ---------------------------- |
| 54   | h3 "Tiến độ xem" | `text-sm font-bold`     | `text-body font-bold`        |
| 71   | nhãn tập         | `text-xs font-bold`     | `text-body-sm font-bold`     |
| 80   | nhãn mùa         | `text-xs font-semibold` | `text-label-caps`            |
| 97   | giá trị bước     | `text-sm font-bold`     | `text-body font-bold`        |
| 113  | nhãn tập 2       | `text-xs font-semibold` | `text-label-caps`            |
| 130  | giá trị bước 2   | `text-sm font-bold`     | `text-body font-bold`        |
| 152  | ghi chú cuối     | `text-xs font-semibold` | `text-body-sm font-semibold` |
| 159  | nhãn gợi ý       | `text-xs font-semibold` | `text-label-caps`            |
| 165  | nhãn tiến trình  | `text-xs font-bold`     | `text-body-sm font-bold`     |

- [x] **Step 2: Radius + màu + icon**

- 63 checkbox `w-5 h-5 rounded-lg` → `rounded-poster` (checkbox nhỏ 4px).
- 65 dấu tick trên nền `checked:bg-primary`: `text-white` → `text-on-primary`.
- 92, 106, 125, 142 nút bước 40px: `rounded-lg` → `rounded-control`.
- 55 `Tv` → `strokeWidth={1.5}`.

- [x] **Step 3: Format, verify, gate**

```powershell
npx prettier --write src/features/movies/components/add-movie/tv-progress-section.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl)|rounded-(md|lg)|text-white" -- src/features/movies/components/add-movie/tv-progress-section.tsx
```

Expected: grep không có output.

- [x] **Step 4: Review 7 trục + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 4: Album detail page

**File:** `src/features/albums/pages/album-detail-page.tsx`

- [x] **Step 1: Typography**

| Dòng     | Element         | Cũ                                            | Mới                                                                                                    |
| -------- | --------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| 96, 114  | nút hành động   | `text-xs sm:text-sm`                          | `text-body-sm sm:text-body`                                                                            |
| 142      | nhãn đếm        | `text-xs font-medium`                         | `text-body-sm font-medium`                                                                             |
| 155      | input tên album | `text-xs sm:text-sm`                          | `text-body-sm sm:text-body` + `focus-ring` (thay `focus-visible:ring-1 focus-visible:ring-primary/20`) |
| 163      | nút ghost       | `text-xs sm:text-sm`                          | `text-body-sm sm:text-body`                                                                            |
| 170      | nút primary     | `text-xs sm:text-sm`                          | `text-body-sm sm:text-body`                                                                            |
| 194, 269 | h2              | `text-lg sm:text-xl`                          | `text-title-lg`                                                                                        |
| 196, 279 | đếm             | `text-[11px] font-semibold tracking-[0.08em]` | `text-label-caps`                                                                                      |
| 253      | nhãn đang gỡ    | `text-[9px]`                                  | `text-micro-caps`                                                                                      |

- [x] **Step 2: Verify ngoại lệ**

`text-white` tại nút xoá overlay (nền `bg-black/60`) là ngoại lệ media → giữ nguyên. Icon đã có `strokeWidth={1.5}` → không sửa.

- [x] **Step 3: Format, verify, gate**

```powershell
npx prettier --write src/features/albums/pages/album-detail-page.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl)|focus-visible:ring-[0-9]" -- src/features/albums/pages/album-detail-page.tsx
```

- [x] **Step 4: Review 7 trục + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 5: Random picker + album selector modal

**Files:**

- Modify: `src/features/movies/components/random-picker-modal.tsx`
- Modify: `src/features/movies/components/random-picker/picker-wheel.tsx`
- Modify: `src/features/albums/components/album-selector-modal.tsx`

- [x] **Step 1: `random-picker-modal.tsx`**

- 87 h2: `text-lg font-semibold` → `text-title-md`.
- 90 mô tả: `text-xs` → `text-body-sm`.
- 110 glyph xúc xắc: `text-lg leading-none` → `text-title-md leading-none`.
- Icon `strokeWidth={1.5}`: `Dice5` (84, 158), `VolumeX` (103), `Volume2` (105).

- [x] **Step 2: `picker-wheel.tsx`**

- 58 nhãn pool: `text-xs` → `text-body-sm`.
- 61 tên phim: `text-xl … font-display` → `text-display-md` (bỏ `font-display`).
- 64 phụ đề: `text-sm` → `text-body`.
- 71 h3 rảnh: `text-xl … font-display` → `text-display-md`.
- 72 phụ đề rảnh: `text-sm` → `text-body`.
- Giữ `strokeWidth={2.5}` của chevron (ngoại lệ picker).
- 3 `<img>` (30, 37, 45): thêm `width`/`height` theo tỉ lệ 2:3 của ảnh TMDB (đọc kích thước ảnh dùng trong file để đặt `width`/`height` đúng).

- [x] **Step 3: `album-selector-modal.tsx`**

| Dòng | Element               | Cũ                                    | Mới                                                                                               |
| ---- | --------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 111  | nhãn "Thêm vào album" | `text-xs font-semibold`               | `text-label-caps`                                                                                 |
| 114  | tên phim              | `text-xl … font-display`              | `text-display-md` (bỏ `font-display`)                                                             |
| 128  | h3 "Tạo album mới"    | `text-sm font-semibold`               | `text-body font-semibold`                                                                         |
| 147  | input tên album       | `text-…`                              | giữ size → `text-body` + `focus-ring` (thay `focus-visible:ring-1 focus-visible:ring-primary/20`) |
| 180  | "Tạo album mới"       | `font-bold text-primary text-lg`      | `text-title-md font-bold text-primary`                                                            |
| 195  | ghi chú tải           | `text-xs font-semibold`               | `text-body-sm font-semibold`                                                                      |
| 210  | h3 "Chọn album"       | `text-xs font-semibold`               | `text-label-caps`                                                                                 |
| 228  | tên album             | `font-bold text-text-primary text-lg` | `text-title-md font-bold text-text-primary`                                                       |
| 231  | mô tả album           | `text-sm`                             | `text-body`                                                                                       |
| 235  | số phim               | `text-xs`                             | `text-body-sm`                                                                                    |

Icon: `FolderPlus` (177), `Film` (225) → `strokeWidth={1.5}`; `X` (121) đang `strokeWidth={1.8}` → `1.5`. Ảnh poster (101) đã có `width`/`height` → không sửa.

- [x] **Step 4: Format, verify, gate**

```powershell
npx prettier --write src/features/movies/components/random-picker-modal.tsx src/features/movies/components/random-picker/picker-wheel.tsx src/features/albums/components/album-selector-modal.tsx
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl)|focus-visible:ring-[0-9]|rounded-(md|lg)|strokeWidth=\{1\.8" -- src/features/movies/components/random-picker-modal.tsx src/features/movies/components/random-picker src/features/albums/components/album-selector-modal.tsx
```

- [x] **Step 5: Review 7 trục + cập nhật log**

- [x] **Step 6: Dừng, không commit**

---

## Task 6: Verify Phase 3B + review toàn phase

- [x] **Step 1: Prettier toàn bộ 11 file**

```powershell
npx prettier --write src/features/movies/pages/movie-detail-page.tsx src/features/movies/components/add-movie-modal.tsx src/features/movies/components/add-movie/movie-form-fields.tsx src/features/movies/components/add-movie/album-section.tsx src/features/movies/components/add-movie/rating-section.tsx src/features/movies/components/add-movie/poster-preview.tsx src/features/movies/components/add-movie/tv-progress-section.tsx src/features/albums/pages/album-detail-page.tsx src/features/movies/components/random-picker-modal.tsx src/features/movies/components/random-picker/picker-wheel.tsx src/features/albums/components/album-selector-modal.tsx
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
  "src/features/movies/pages/movie-detail-page.tsx",
  "src/features/movies/components/add-movie-modal.tsx",
  "src/features/movies/components/add-movie/movie-form-fields.tsx",
  "src/features/movies/components/add-movie/album-section.tsx",
  "src/features/movies/components/add-movie/rating-section.tsx",
  "src/features/movies/components/add-movie/poster-preview.tsx",
  "src/features/movies/components/add-movie/tv-progress-section.tsx",
  "src/features/albums/pages/album-detail-page.tsx",
  "src/features/movies/components/random-picker-modal.tsx",
  "src/features/movies/components/random-picker/picker-wheel.tsx",
  "src/features/albums/components/album-selector-modal.tsx"
)
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl)" -- $files
git grep -n -E "rounded-(md|lg)" -- $files
git grep -n -E "focus-visible:ring-[0-9]" -- $files
git grep -n -E "strokeWidth=\{(1\.8|2|undefined)" -- $files
git grep -n "text-white" -- $files
git diff --check
git status --short
git diff --stat
```

Expected: 4 lệnh grep đầu không có output; `text-white` chỉ còn ở nút xoá overlay `album-detail-page` (ngoại lệ media); `git diff --check` sạch; không có file ngoài 11 file trên.

- [x] **Step 4: Source review**

Rà diff cho: hành vi focus/keyboard không đổi; `focus-ring` chỉ áp cho input boxed; `text-on-primary` chỉ trên nền primary đặc; ảnh có `width`/`height` đúng tỉ lệ; motion timing giữ nguyên.

- [x] **Step 5: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 6: Dừng, không commit**

Báo diff, gate, kết quả build và review. Không chạy `git add`, `git commit` hay `git push`. Phase 3C sẽ có plan riêng.
