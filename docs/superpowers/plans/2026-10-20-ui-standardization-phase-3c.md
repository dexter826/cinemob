# UI Standardization Phase 3C — Profile, search, calendar, stats, dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chốt nốt static sweep toàn app: 22 file profile/search/calendar/stats/dashboard (+2 file movies/albums chuyển từ 3B) dùng utility typography có tên, radius token, `focus-ring`, icon stroke 1.5, `width`/`height` cho ảnh.

**Architecture:** Không thêm utility/token mới. Mọi thay đổi là thay class trình bày tại đúng component; không đổi logic/state/props/motion.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (§3.1, §3.2, §4).

## Quy tắc mapping (bổ sung quy tắc giữ cỡ chữ)

| Class cũ                            | Utility mới           | Ghi chú                                    |
| ----------------------------------- | --------------------- | ------------------------------------------ |
| `text-lg` (18px) + heading          | `text-title-md`       | khớp đúng 18px                             |
| `text-xl` (20px) + heading          | `text-title-lg`       | khớp đúng 20px (giữ cỡ, không co lại)      |
| `text-[9px]`, `text-[10px]`         | `text-micro-caps`     | 9px                                        |
| `text-[11px]` label                 | `text-label-caps`     | 11px uppercase                             |
| `text-[11px]` meta số               | `text-micro-caps`     | meta số/ngày theo poster (9px)             |
| `text-xs` nội dung/giá trị          | `text-body-sm`        | 12px                                       |
| `text-xs` làm nhãn form/nhóm        | `text-label-caps`     | ưu tiên nhãn                               |
| `text-sm` nội dung/giá trị          | `text-body`           | 14px                                       |
| `text-sm` làm nhãn form             | `text-label-caps`     | ưu tiên nhãn                               |
| heading 14px (`text-sm font-bold`)  | `text-body font-bold` | giữ 14px, chỉ đổi weight theo utility      |
| `font-display text-xl` / `text-lg`  | `text-display-md`     | Anton 20px, bỏ `font-display`              |
| `font-display text-2xl sm:text-3xl` | `text-display-xl`     | Anton 30→36→48, bỏ `font-bold` (Anton 400) |
| `rounded-lg` control/chip/nút       | `rounded-control`     | 8px                                        |
| `rounded-lg` thumbnail/checkbox/dot | `rounded-poster`      | 4px                                        |
| `focus-visible:ring-N …`            | `focus-ring`          | outline 2px offset 3px                     |
| icon Lucide chưa set `strokeWidth`  | `strokeWidth={1.5}`   | giữ `size`/`className`/`aria-hidden`       |
| `text-white` trên nền đen/ảnh       | giữ nguyên            | ngoại lệ media                             |

Ngoại lệ giữ nguyên: `dashboard-filters.tsx` chip `strokeWidth={2}` (chip remove nhỏ, không nằm trong scope chuẩn 1.5 của icon chức năng) — nếu rà lại thì chuyển 1.5. `duration-*`/`animate-*` giữ nguyên cho Phase 4.

## Global Constraints

- Chỉ sửa 24 file nêu trong plan. Không sửa `src/index.css`, `DESIGN.md`, `src/shared`, `src/app`.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push.
- Không dùng PowerShell (`Get-Content`/`Set-Content`) để sửa file nguồn: PowerShell 5.1 đọc file UTF-8 không BOM theo ANSI nên làm hỏng tiếng Việt. Chỉ dùng công cụ `edit`, hoặc script Node đọc/ghi UTF-8.
- Sau mỗi task: Prettier → typecheck → lint → build → gate grep → đánh dấu checkbox bằng **công cụ edit**.
- Sau mỗi task: review 7 trục (code-refactor, chế độ A) + ghi vào `docs/ui-standardization-progress-2026-10-20.md`.

---

## Task 1: Profile (8 file)

**Files:** `own-profile-editor.tsx`, `member-profile-card.tsx`, `profile-meta.tsx`, `user/user-card.tsx`, `user/member-search-modal.tsx`, `movie-list-section.tsx`, `avatar/avatar-crop-view.tsx`, `pages/member-profile-page.tsx`

- [x] **Step 1: Áp mapping**

165 lần thay (35 + 7 + 4 + 6 + 3 + 2 + 9 + 5). Điểm đặc biệt:

- Chữ cái avatar: `own-profile-editor.tsx` và `member-profile-card.tsx` → `text-display-lg` (Anton 24/30/36, bỏ `font-bold` vì Anton chỉ có weight 400; `text-display-xl` sẽ lên 48px và tràn khung 80px).
- `user-card.tsx` chữ cái avatar 18px → `text-title-md` (giữ sans).
- Ảnh: `own-profile-editor` 80×80, `member-profile-card` 80×80, `user-card` 48×48, `avatar-crop-view` 220×220 (theo `CROP_SIZE`).
- `avatar-crop-view.tsx`: nút zoom `rounded-lg` → `rounded-control`; input range `rounded-lg` → `rounded-control` + `focus-visible:ring-2 …ring-offset-2` → `focus-ring`; vùng crop `focus-visible:ring-4 focus-visible:ring-primary` → `focus-ring`.
- Nhãn form (`Tên hiển thị`, `Giới thiệu`, `Giới tính`, `Ngày sinh`) → `text-label-caps`.
- Input tên và textarea → `text-body` + `focus-ring` (thay `focus-visible:ring-1 focus-visible:ring-primary/30`).
- 3 thanh skeleton `rounded-md` → `rounded-poster`.

- [x] **Step 2: Format, verify, gate**

```powershell
npx prettier --write src/features/profile
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl)|rounded-(md|lg)|focus-visible:ring-[0-9]" -- src/features/profile
```

Expected: grep không có output.

- [x] **Step 3: Review 7 trục + cập nhật log**

- [x] **Step 4: Dừng, không commit**

---

## Task 2: Search (5 file)

**Files:** `search/pages/person-detail-page.tsx`, `search/components/person/person-movie-section.tsx`, `search/components/search-filters.tsx`, `search/components/search-results.tsx`, `search/components/random-suggestions-section.tsx`

- [x] **Step 1: Áp mapping**

46 lần thay (19 + 12 + 9 + 2 + 4). Điểm đặc biệt:

- Nhãn field của `person-detail-page.tsx` (Ngày sinh, Tuổi, Nơi sinh) → `text-label-caps`; giá trị → `text-body`; heading tên người `text-xl font-bold` → `text-title-lg` (giữ 20px).
- Ảnh người: thêm `width={192} height={288}` (tỉ lệ 2:3 của ảnh TMDB).
- `person-movie-section.tsx`: nhãn nhóm "Sắp xếp theo", "Lọc nâng cao" và nhãn rating → `text-label-caps`; meta số → `text-micro-caps`.
- `search-filters.tsx`: thumbnail poster `w-10 h-14 rounded-lg` → `rounded-poster`; nhãn nhóm → `text-label-caps`.
- Icon: `Filter`, `Calendar`, `Type`, `ArrowUp`, `ArrowDown`, `Star`, `MapPin`, `Users`, `ChevronUp`, `ChevronDown`, `Dice5`, `RotateCcw` → stroke 1.5.

- [x] **Step 2: Format, verify, gate**

```powershell
npx prettier --write src/features/search
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl)|rounded-(md|lg)|focus-visible:ring-[0-9]" -- src/features/search
```

- [x] **Step 3: Review 7 trục + cập nhật log**

- [x] **Step 4: Dừng, không commit**

---

## Task 3: Calendar (3 file)

**Files:** `calendar/components/calendar-grid.tsx`, `calendar/components/episode-list.tsx`, `calendar/pages/release-calendar-page.tsx`

- [x] **Step 1: Áp mapping**

21 lần thay (8 + 12 + 1). Số ngày và nhãn trong lịch → `text-body-sm`; heading tháng `text-base sm:text-lg md:text-xl` → `text-title-md`; tiêu đề series `text-lg sm:text-xl` → `text-title-md`; icon `Info`, `ChevronRight` → 1.5.

- [x] **Step 2: Format, verify, gate**

```powershell
npx prettier --write src/features/calendar
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl)|rounded-(md|lg)|focus-visible:ring-[0-9]" -- src/features/calendar
```

- [x] **Step 3: Review 7 trục + cập nhật log**

- [x] **Step 4: Dừng, không commit**

---

## Task 4: Stats + dashboard (5 file)

**Files:** `stats/pages/stats-page.tsx`, `dashboard/components/dashboard-filters.tsx`, `dashboard/components/dashboard-filter-controls.tsx`, `dashboard/components/dashboard-tabs.tsx`, `dashboard/pages/dashboard-page.tsx`

- [x] **Step 1: Áp mapping**

22 lần thay (11 + 6 + 3 + 1 + 1). Heading section `text-lg` → `text-title-md`; số xếp hạng `text-xl` → `text-title-lg`; badge năm `rounded-lg` → `rounded-control`; chip filter `text-[11px]` → `text-label-caps`; badge số `text-[9px]` → `text-micro-caps`; eyebrow `text-[10px]` → `text-micro-caps`; icon `Plus` → 1.5.

- [x] **Step 2: Format, verify, gate**

```powershell
npx prettier --write src/features/stats src/features/dashboard
npm run typecheck
npm run lint
npm run build
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl)|rounded-(md|lg)|focus-visible:ring-[0-9]" -- src/features/stats src/features/dashboard
```

- [x] **Step 3: Review 7 trục + cập nhật log**

- [x] **Step 4: Dừng, không commit**

---

## Task 5: File còn lại + verify toàn phase

**Files:** `movies/components/add-movie/status-toggle.tsx` (2 nhãn tab → `text-body-sm`), `albums/components/create-album-modal.tsx` (verify: không có phát hiện → không sửa).

- [x] **Step 1: Sửa `status-toggle.tsx`**

Hai nhãn tab `text-xs font-bold` → `text-body-sm font-bold`.

- [x] **Step 2: Verify `create-album-modal.tsx`**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl)|rounded-(md|lg)|focus-visible:ring-[0-9]" -- src/features/albums/components/create-album-modal.tsx
```

Expected: không có output → không sửa.

- [x] **Step 3: Prettier + typecheck + lint + build**

```powershell
npx prettier --write src/features/movies/components/add-movie/status-toggle.tsx src/features/albums/components/create-album-modal.tsx
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 4: Gate toàn phase 3C**

```powershell
$files = @(
  "src/features/profile",
  "src/features/search",
  "src/features/calendar",
  "src/features/stats",
  "src/features/dashboard",
  "src/features/movies/components/add-movie/status-toggle.tsx",
  "src/features/albums/components/create-album-modal.tsx"
)
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)" -- $files
git grep -n -E "rounded-(md|lg)" -- $files
git grep -n -E "focus-visible:ring-[0-9]" -- $files
git grep -n -E "strokeWidth=\{(1\.8|undefined)" -- $files
git grep -n -E "á»|Ã¡" -- $files
git diff --check
git status --short
git diff --stat
```

Expected: 5 lệnh grep đầu không có output; `git diff --check` sạch; không có file ngoài phạm vi.

- [x] **Step 5: Source review**

Rà diff cho: hành vi focus/keyboard không đổi; `focus-ring` chỉ áp cho control thật; ảnh có `width`/`height` đúng khung hiển thị; không đổi copy, layout, motion timing.

- [x] **Step 6: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 7: Dừng, không commit**

Báo diff, gate, kết quả build và review. Không chạy `git add`, `git commit` hay `git push`. Phase 4 (motion) sẽ có plan riêng.
