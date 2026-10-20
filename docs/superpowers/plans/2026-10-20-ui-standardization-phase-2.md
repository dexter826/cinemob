# UI Standardization Phase 2 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Áp dụng type utility, radius token, focus-ring, icon 1.5 và `on-primary` cho shared primitives cùng PosterCard/AlbumCard. Không sweep feature ngoài hai card, không sửa motion/loading.

**Architecture:** Sửa tại primitive trong `src/shared/components/ui` và hai card chuẩn. Utility typography/focus đã có từ Phase 1; phase này chỉ thay class, không thêm token/utility mới và không đổi hành vi.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (Phase 2 §7; matrix §4).

## Global Constraints

- Chỉ sửa các file nêu trong plan. Không sửa `src/index.css`, route, store, hook, API, dependency.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push. Dừng sau khi báo diff và trạng thái git.
- `DESIGN.md` > spec > plan. Nếu class đích mâu thuẫn `DESIGN.md`, dừng và sửa plan/spec trước.
- Chỉ dùng utility typography đã có: `text-display-*`, `text-title-*`, `text-body*`, `text-label-caps`, `text-micro-caps`.
- Không dùng `text-[…px]` hoặc `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/9xl` cho size trong file đã sửa. Không đổi weight trừ khi cần giữ emphasis.
- Display title case; chỉ `text-label-caps`/`text-micro-caps` uppercase. `normal-case` chỉ dùng cho metadata số/ngày.
- Radius: control/card/dialog 8; poster/tag/checkbox nhỏ 4. Không `rounded-md` (6), không `rounded-lg` thô.
- Focus: thay ring 1px cục bộ bằng `focus-ring`; global outline 2px offset 3 vẫn giữ. Underline field giữ ngoại lệ `focus-visible:outline-none` + border-bottom.
- Icon Lucide: `strokeWidth={1.5}`. Không đổi kích thước icon, trừ khi plan ghi rõ.
- `text-on-primary` cho chữ/icon trên nền primary đặc. Giữ trắng trên overlay ảnh/black của PosterCard/AlbumCard.
- Không sửa `width`/`height` ảnh, loading, motion timing trong phase này; các việc đó thuộc Phase 3-5.
- Sau mỗi task: Prettier các file đã sửa → `npm run typecheck` → `npm run lint` → `npm run build` → gate grep → đánh dấu checkbox của chính task đó trong plan.
- Sau mỗi task bắt buộc review code theo 7 trục của skill `code-refactor` (chế độ A): naming, kích thước & trách nhiệm, DRY, xử lý lỗi, cấu trúc & phụ thuộc, bảo mật & dữ liệu cá nhân, khả năng test. Phân loại BLOCKER/MAJOR/MINOR/NIT; không bịa phát hiện khi code sạch.
- Kết quả review ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục của task tương ứng). Phát hiện BLOCKER/MAJOR sửa ngay trong task đó rồi chạy lại gate.
- Chạy mọi lệnh từ root repo `C:\MyProject\cinemob`.

---

## Task 1: Button, Chip và primitive nền

**Files:**

- Modify: `src/shared/components/ui/button.tsx`
- Modify: `src/shared/components/ui/chip.tsx`
- Verify only: `src/shared/components/ui/icon-button.tsx`
- Verify only: `src/shared/components/ui/skeleton.tsx`
- Verify only: `src/shared/components/ui/skeleton-card.tsx`

**Interfaces:**

- Consumes: `text-body-sm`, `text-body`, `text-micro-caps` từ `src/index.css`.
- Produces: Button size đúng `body-sm` 12/`body` 14; Chip đúng `micro-caps` 9, radius 4.

- [ ] **Step 1: Đổi Button size**

Old:

```ts
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-[11px] gap-1.5 rounded-control',
  md: 'px-4 py-2.5 text-xs gap-2 rounded-control',
  lg: 'px-6 py-3 text-sm gap-2 rounded-control',
};
```

New:

```ts
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-body-sm gap-1.5 rounded-control',
  md: 'px-4 py-2.5 text-body-sm gap-2 rounded-control',
  lg: 'px-6 py-3 text-body gap-2 rounded-control',
};
```

- [ ] **Step 2: Đổi Chip sang `micro-caps`**

Old:

```ts
'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-[9px] font-bold uppercase tracking-[0.06em] whitespace-nowrap',
```

New:

```ts
'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-micro-caps whitespace-nowrap',
```

- [ ] **Step 3: Verify primitive không cần sửa**

```powershell
git grep -n -E "rounded-(control|card|poster)|w-8 h-8|w-10 h-10|w-12 h-12" -- src/shared/components/ui/icon-button.tsx src/shared/components/ui/skeleton.tsx src/shared/components/ui/skeleton-card.tsx
```

Expected:

- `IconButton` vẫn 32/40/48px (`w-8 h-8`, `w-10 h-10`, `w-12 h-12`) và radius token.
- `Skeleton` dùng `rounded-control` (8).
- `SkeletonCard` dùng `rounded-poster` (4) và `aspect-2/3`.

Không sửa ba file này nếu output đúng.

- [ ] **Step 4: Format, typecheck, lint, build**

```powershell
npx prettier --write src/shared/components/ui/button.tsx src/shared/components/ui/chip.tsx
npm run typecheck
npm run lint
npm run build
```

Expected: Prettier pass; typecheck/lint exit 0; build hoàn tất.

- [ ] **Step 5: Gate Task 1**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base)" -- src/shared/components/ui/button.tsx src/shared/components/ui/chip.tsx
git grep -n -E "rounded-(md|lg)" -- src/shared/components/ui/button.tsx src/shared/components/ui/chip.tsx
git status --short
```

Expected: hai lệnh grep đầu không có output; `M button.tsx`, `M chip.tsx`; không có file ngoài plan.

- [ ] **Step 6: Review 7 trục (code-refactor, chế độ A) + cập nhật log**

Review diff của Task 1 theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Task 1). Sửa BLOCKER/MAJOR ngay trong task này rồi chạy lại gate.

- [ ] **Step 7: Dừng, không commit**

Báo diff, kết quả build và kết quả review. Không chạy `git add`, `git commit` hay `git push`.

---

## Task 2: Form controls

**Files:**

- Modify: `src/shared/components/ui/text-field.tsx`
- Modify: `src/shared/components/ui/search-field.tsx`
- Modify: `src/shared/components/ui/listbox-search-input.tsx`
- Modify: `src/shared/components/ui/dropdown.tsx`
- Modify: `src/shared/components/ui/multi-select-dropdown.tsx`
- Modify: `src/shared/components/ui/switch.tsx`

**Interfaces:**

- Consumes: `text-label-caps`, `text-body`, `text-body-sm`, `text-micro-caps`, `focus-ring`.
- Produces: field/dropdown/multiselect đúng type, focus, radius; switch không shadow.

- [ ] **Step 1: TextField**

Đổi label:

```diff
- className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary mb-1.5"
+ className="block text-label-caps text-text-secondary mb-1.5"
```

Đổi input và boxed focus:

```diff
- 'w-full h-11 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary transition-colors',
+ 'w-full h-11 bg-transparent text-body font-medium text-text-primary placeholder:text-text-secondary transition-colors',
...
- : 'rounded-control border focus-visible:border-primary',
+ : 'rounded-control border focus-visible:border-primary focus-ring',
```

Đổi error:

```diff
- className="mt-1.5 text-xs text-danger"
+ className="mt-1.5 text-body-sm text-danger"
```

Giữ underline `focus-visible:outline-none` và `border-b`.

- [ ] **Step 2: SearchField và ListboxSearchInput**

SearchField:

```diff
- 'w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary transition-colors',
+ 'w-full bg-transparent text-body font-medium text-text-primary placeholder:text-text-secondary transition-colors',
...
- : 'h-11 rounded-control border border-border focus-visible:border-primary',
+ : 'h-11 rounded-control border border-border focus-visible:border-primary focus-ring',
```

Nút xóa:

```diff
- strokeWidth={isUnderline ? 1.5 : undefined}
+ strokeWidth={1.5}
```

ListboxSearchInput:

```diff
- className="w-full bg-surface border border-border-default rounded-control px-3 py-2 text-sm focus-visible:ring-1 focus-visible:ring-primary/50 text-text-primary placeholder:text-text-muted"
+ className="w-full bg-surface border border-border-default rounded-control px-3 py-2 text-body focus-ring text-text-primary placeholder:text-text-muted"
```

- [ ] **Step 3: Dropdown**

Trigger:

```diff
- focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20
+ focus-ring
```

Text và icon:

```diff
- <span className={`text-sm font-medium ...`}>
+ <span className={`text-body font-medium ...`}>
...
- <ChevronDown size={16} aria-hidden="true"
+ <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true"
```

Empty và option:

```diff
- className="px-4 py-4 text-sm text-text-secondary text-center italic opacity-60"
+ className="px-4 py-4 text-body text-text-secondary text-center italic opacity-60"
...
- className={`w-full px-4 py-2.5 text-left text-sm rounded-control ...`}
+ className={`w-full px-4 py-2.5 text-left text-body rounded-control ...`}
```

Giữ `ring-1 ring-primary/20` của trạng thái open; đó không phải focus ring.

- [ ] **Step 4: MultiSelect**

Trigger:

```diff
- className="flex flex-1 min-w-0 items-center justify-between px-3 py-2 text-left rounded-card focus-visible:ring-1 focus-visible:ring-primary/20 disabled:cursor-not-allowed"
+ className="flex flex-1 min-w-0 items-center justify-between px-3 py-2 text-left rounded-card focus-ring disabled:cursor-not-allowed"
```

Placeholder, tag, `+N`:

```diff
- <span className="text-text-secondary text-sm">{placeholder}</span>
+ <span className="text-text-secondary text-body">{placeholder}</span>
...
- className="inline-flex items-center px-2 py-0.5 bg-primary text-on-primary rounded-md text-xs font-medium truncate max-w-28"
+ className="inline-flex items-center px-2 py-0.5 bg-primary text-on-primary rounded-poster text-body-sm truncate max-w-28"
...
- className="inline-flex items-center px-2 py-0.5 bg-black/10 dark:bg-white/10 text-text-secondary rounded-md text-xs font-medium"
+ className="inline-flex items-center px-2 py-0.5 bg-black/10 dark:bg-white/10 text-text-secondary rounded-poster text-body-sm"
```

Chevron, clear, header, empty, option:

```diff
- <ChevronDown size={16} aria-hidden="true"
+ <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true"
...
- className="self-center mr-2 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors focus-visible:ring-1 focus-visible:ring-primary/40"
+ className="self-center mr-2 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors focus-ring"
...
- <X size={14} className="text-text-secondary" aria-hidden="true" />
+ <X size={14} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
...
- <span className="text-xs text-text-secondary">Đã chọn {values.length} mục</span>
+ <span className="text-body-sm text-text-secondary">Đã chọn {values.length} mục</span>
...
- className="text-xs text-primary hover:text-primary/80 transition-colors"
+ className="text-body-sm text-primary hover:text-primary/80 transition-colors"
...
- className="px-4 py-3 text-sm text-text-secondary text-center"
+ className="px-4 py-3 text-body text-text-secondary text-center"
...
- className={`w-full px-4 py-2.5 text-left text-sm hover:bg-primary/10 rounded-control ...`}
+ className={`w-full px-4 py-2.5 text-left text-body hover:bg-primary/10 rounded-control ...`}
```

Checkbox và check:

```diff
- className={`w-4 h-4 rounded border-2 ...`}
+ className={`w-4 h-4 rounded-poster border-2 ...`}
...
- <Check size={12} className="text-white" aria-hidden="true" />
+ <Check size={12} strokeWidth={1.5} className="text-on-primary" aria-hidden="true" />
```

- [ ] **Step 5: Switch**

```diff
- 'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
+ 'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform',
```

- [ ] **Step 6: Format, typecheck, lint, build**

```powershell
npx prettier --write src/shared/components/ui/text-field.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/listbox-search-input.tsx src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx src/shared/components/ui/switch.tsx
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 7: Gate Task 2**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base)" -- src/shared/components/ui/text-field.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/listbox-search-input.tsx src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx
git grep -n -E "rounded-(md|lg)|focus-visible:ring-1|shadow" -- src/shared/components/ui/text-field.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/listbox-search-input.tsx src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx src/shared/components/ui/switch.tsx
git grep -n "text-white" -- src/shared/components/ui/multi-select-dropdown.tsx
git status --short
```

Expected: ba lệnh grep đầu không có output; các file nêu trên là `M`; không có file ngoài plan.

- [ ] **Step 8: Review 7 trục (code-refactor, chế độ A) + cập nhật log**

Review diff của Task 2 theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Task 2). Sửa BLOCKER/MAJOR ngay trong task này rồi chạy lại gate.

- [ ] **Step 9: Dừng, không commit**

---

## Task 3: DatePicker và TimePicker

**Files:**

- Modify: `src/shared/components/ui/date-picker.tsx`
- Modify: `src/shared/components/ui/time-picker.tsx`

**Interfaces:**

- Consumes: `text-title-md`, `text-label-caps`, `text-body`, `text-body-sm`, `focus-ring`.
- Produces: trigger focus đúng; date/time cell dùng body-sm; icon 1.5; radius token.

- [ ] **Step 1: DatePicker typography và focus**

Các thay đổi class:

```diff
- className="text-sm font-bold text-text-primary"
+ className="text-title-md text-text-primary"
...
- className="text-center text-xs font-bold text-text-muted py-1 uppercase"
+ className="text-center text-label-caps text-text-muted py-1"
...
- className="text-sm font-semibold text-text-primary"
+ className="text-body font-semibold text-text-primary"
...
- className="text-sm font-medium text-text-primary"
+ className="text-body font-medium text-text-primary"
...
- aspect-square w-full text-xs sm:text-sm rounded-lg transition-colors duration-150
+ aspect-square w-full text-body-sm rounded-control transition-colors duration-150
...
- className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent"
+ className="w-full py-2.5 text-body-sm font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent"
...
- w-full h-11 border border-border-default rounded-card px-4 text-left
- focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20
+ w-full h-11 border border-border-default rounded-card px-4 text-left
+ focus-ring
...
- className={`text-sm font-medium truncate ...`}
+ className={`text-body font-medium truncate ...`}
```

Các nút điều hướng/đóng:

```diff
- className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
+ className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control cursor-pointer"
...
- className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center"
+ className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors flex items-center"
...
- className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
+ className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors"
```

Icon:

```diff
- <X size={20} className="text-text-secondary" aria-hidden="true" />
+ <X size={20} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
...
- <Calendar size={16} className="text-text-secondary shrink-0" aria-hidden="true" />
+ <Calendar size={16} strokeWidth={1.5} className="text-text-secondary shrink-0" aria-hidden="true" />
```

Thêm `strokeWidth={1.5}` cho mọi `ChevronLeft`/`ChevronRight` trong file (bốn nút: năm trước/sau, tháng trước/sau; hai nút năm có hai icon mỗi bên).

- [ ] **Step 2: TimePicker typography và focus**

```diff
- className="text-sm font-bold text-text-primary"
+ className="text-title-md text-text-primary"
...
- className="text-xs text-text-secondary text-center mb-1 sticky top-0 bg-surface font-bold"
+ className="text-label-caps text-text-secondary text-center mb-1 sticky top-0 bg-surface"
...
- w-full py-2.5 text-sm rounded-lg transition-colors
+ w-full py-2.5 text-body-sm rounded-control transition-colors
...
- className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent"
+ className="w-full py-2.5 text-body-sm font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent"
...
- w-full h-11 border border-border-default rounded-card px-4 text-left
- focus-visible:border-primary/50 focus-visible:ring-1 focus-visible:ring-primary/20
+ w-full h-11 border border-border-default rounded-card px-4 text-left
+ focus-ring
...
- className={`text-sm font-medium ${value ? 'text-text-primary' : 'text-text-secondary'}`}
+ className={`text-body font-medium ${value ? 'text-text-primary' : 'text-text-secondary'}`}
```

Nút đóng:

```diff
- className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
+ className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-control cursor-pointer"
...
- <X size={20} className="text-text-secondary" aria-hidden="true" />
+ <X size={20} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
...
- <Clock size={16} className="text-text-secondary" aria-hidden="true" />
+ <Clock size={16} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
```

- [ ] **Step 3: Format, typecheck, lint, build**

```powershell
npx prettier --write src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 4: Gate Task 3**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base)" -- src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx
git grep -n -E "rounded-(md|lg)|focus-visible:ring-1" -- src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx
git grep -n "strokeWidth" -- src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx
git status --short
```

Expected: hai lệnh grep đầu không có output; mọi icon có `strokeWidth` tường minh 1.5; chỉ hai file picker là `M` ngoài plan.

- [ ] **Step 5: Review 7 trục (code-refactor, chế độ A) + cập nhật log**

Review diff của Task 3 theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Task 3). Sửa BLOCKER/MAJOR ngay trong task này rồi chạy lại gate.

- [ ] **Step 6: Dừng, không commit**

---

## Task 4: Dialog, Toast, Pagination

**Files:**

- Modify: `src/shared/components/ui/dialog.tsx`
- Modify: `src/shared/components/feedback/toast-container.tsx`
- Modify: `src/shared/components/ui/pagination.tsx`

**Interfaces:**

- Consumes: `text-title-md`, `text-body-sm`, `text-body`, `focus-ring`.
- Produces: dialog title/description đúng type; toast icon 1.5; pagination compact dùng body-sm.

- [ ] **Step 1: Dialog**

```diff
- <h2 id={titleId} className="text-base sm:text-lg font-bold tracking-wide truncate">
+ <h2 id={titleId} className="text-title-md truncate">
...
- <p id={descriptionId} className="text-xs sm:text-sm text-text-secondary mt-0.5">
+ <p id={descriptionId} className="text-body-sm text-text-secondary mt-0.5">
...
- <X size={18} strokeWidth={1.8} aria-hidden="true" />
+ <X size={18} strokeWidth={1.5} aria-hidden="true" />
```

Không thêm shadow/border; overlay `black/72` và panel hiện có giữ nguyên.

- [ ] **Step 2: Toast**

Icon:

```diff
- <CheckCircle size={18} className={`${iconClass} text-success`} aria-hidden="true" />
+ <CheckCircle size={18} strokeWidth={1.5} className={`${iconClass} text-success`} aria-hidden="true" />
...
- <AlertCircle size={18} className={`${iconClass} text-danger`} aria-hidden="true" />
+ <AlertCircle size={18} strokeWidth={1.5} className={`${iconClass} text-danger`} aria-hidden="true" />
...
- <AlertTriangle size={18} className={`${iconClass} text-warning`} aria-hidden="true" />
+ <AlertTriangle size={18} strokeWidth={1.5} className={`${iconClass} text-warning`} aria-hidden="true" />
...
- return <Info size={18} className={`${iconClass} text-info`} aria-hidden="true" />;
+ return <Info size={18} strokeWidth={1.5} className={`${iconClass} text-info`} aria-hidden="true" />;
```

Message, action, close:

```diff
- <span className="text-xs sm:text-sm font-semibold flex-1 tracking-tight mr-4 leading-tight">
+ <span className="text-body-sm sm:text-body font-semibold flex-1 mr-4">
...
- className="text-xs font-bold text-primary hover:underline mr-2 shrink-0 cursor-pointer"
+ className="text-body-sm font-bold text-primary hover:underline mr-2 shrink-0 cursor-pointer"
...
- <X size={14} aria-hidden="true" />
+ <X size={14} strokeWidth={1.5} aria-hidden="true" />
```

- [ ] **Step 3: Pagination**

```diff
- className={`min-w-10 h-10 px-3 rounded-control text-sm font-bold tabular-nums transition-colors cursor-pointer ${
+ className={`min-w-10 h-10 px-3 rounded-control text-body-sm font-bold tabular-nums transition-colors cursor-pointer ${
...
- <ChevronLeft size={18} aria-hidden="true" />
+ <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
...
- <span className="text-xs font-medium text-text-secondary">Trang</span>
+ <span className="text-body-sm font-medium text-text-secondary">Trang</span>
...
- className="w-11 h-9 text-center border-none rounded-lg text-xs font-bold text-text-primary focus-visible:ring-1 focus-visible:ring-primary/50"
+ className="w-11 h-9 text-center border-none rounded-control text-body-sm font-bold text-text-primary focus-ring"
...
- <span className="text-xs font-bold text-text-secondary opacity-50 tabular-nums">
+ <span className="text-body-sm font-bold text-text-secondary opacity-50 tabular-nums">
...
- <ChevronRight size={18} aria-hidden="true" />
+ <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
```

Giữ height 40px (`h-10`) cho nút trang; input compact 36px (`h-9`) theo ngoại lệ pagination.

- [ ] **Step 4: Format, typecheck, lint, build**

```powershell
npx prettier --write src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/components/ui/pagination.tsx
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 5: Gate Task 4**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base)" -- src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/components/ui/pagination.tsx
git grep -n -E "rounded-(md|lg)|focus-visible:ring-1|strokeWidth=\{1\.8" -- src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/components/ui/pagination.tsx
git status --short
```

Expected: hai lệnh grep đầu không có output; ba file là `M` ngoài plan.

- [ ] **Step 6: Review 7 trục (code-refactor, chế độ A) + cập nhật log**

Review diff của Task 4 theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Task 4). Sửa BLOCKER/MAJOR ngay trong task này rồi chạy lại gate.

- [ ] **Step 7: Dừng, không commit**

---

## Task 5: PosterCard và AlbumCard

**Files:**

- Modify: `src/features/movies/components/poster-card.tsx`
- Modify: `src/features/albums/components/album-card.tsx`

**Interfaces:**

- Consumes: `text-body-sm`, `text-micro-caps`, `text-label-caps`, `text-on-primary`.
- Produces: card title 12/700; meta/credit micro-caps; rating micro-caps; icon 1.5; tag/checkbox radius 4.

- [ ] **Step 1: PosterCard icon**

Thêm `strokeWidth={1.5}` cho `Bookmark`, `Star`, `Eye`:

```diff
- icon={<Bookmark size={9} className="fill-current" aria-hidden="true" />}
+ icon={<Bookmark size={9} strokeWidth={1.5} className="fill-current" aria-hidden="true" />}
...
- <Star size={9} className="fill-primary" aria-hidden="true" />
+ <Star size={9} strokeWidth={1.5} className="fill-primary" aria-hidden="true" />
...
- <Chip icon={<Eye size={9} aria-hidden="true" />}>Review</Chip>
+ <Chip icon={<Eye size={9} strokeWidth={1.5} aria-hidden="true" />}>Review</Chip>
```

`CheckCircle` và `X` đã có 1.5; giữ.

- [ ] **Step 2: PosterCard typography**

```diff
- <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-poster bg-black/60 border border-white/10 text-[10px] font-bold text-primary tabular-nums">
+ <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-poster bg-black/60 border border-white/10 text-micro-caps text-primary tabular-nums">
...
- className="text-[11px] font-bold tracking-[0.05em] leading-[1.35] text-white line-clamp-2"
+ className="text-body-sm font-bold text-white line-clamp-2"
...
- <p className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] text-white/55 truncate">
+ <p className="mt-0.5 text-micro-caps text-white/55 truncate">
...
- <p className="mt-1 pt-1 border-t border-white/15 text-[9px] font-semibold tracking-[0.08em] text-primary truncate">
+ <p className="mt-1 pt-1 border-t border-white/15 text-micro-caps text-primary truncate">
```

Giữ `text-white` cho check overlay và nút trên ảnh; đó là ngoại lệ media.

- [ ] **Step 3: AlbumCard typography**

```diff
- className="text-[11px] font-bold tracking-[0.05em] leading-[1.35] text-white line-clamp-2"
+ className="text-body-sm font-bold text-white line-clamp-2"
...
- <p className="mt-0.5 text-[9px] font-semibold tracking-[0.08em] text-white/55 uppercase tabular-nums">
+ <p className="mt-0.5 text-micro-caps text-white/55 tabular-nums">
...
- <span className="text-[10px] font-semibold tracking-[0.1em] text-text-secondary opacity-60 uppercase">
+ <span className="text-label-caps text-text-secondary opacity-60">
```

`Trash2` đã có `strokeWidth={1.5}`; giữ. Không đổi `text-white` trên nút xóa/ảnh.

- [ ] **Step 4: Format, typecheck, lint, build**

```powershell
npx prettier --write src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 5: Gate Task 5**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base)" -- src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
git grep -n -E "rounded-(md|lg)" -- src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
git grep -n "text-white" -- src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
git status --short
```

Expected:

- Hai lệnh đầu không có output.
- `text-white` chỉ còn ở check overlay/nút ảnh của PosterCard và nút xóa/ảnh AlbumCard (ngoại lệ media).
- Chỉ hai card là `M` ngoài plan.

- [ ] **Step 6: Review 7 trục (code-refactor, chế độ A) + cập nhật log**

Review diff của Task 5 theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Task 5). Sửa BLOCKER/MAJOR ngay trong task này rồi chạy lại gate.

- [ ] **Step 7: Dừng, không commit**

---

## Task 6: Verify Phase 2

**Files:** toàn bộ file đã sửa trong Task 1-5.

- [ ] **Step 1: Prettier toàn bộ file Phase 2**

```powershell
npx prettier --write src/shared/components/ui/button.tsx src/shared/components/ui/chip.tsx src/shared/components/ui/text-field.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/listbox-search-input.tsx src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx src/shared/components/ui/switch.tsx src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/components/ui/pagination.tsx src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
npx prettier --check src/shared/components/ui/button.tsx src/shared/components/ui/chip.tsx src/shared/components/ui/text-field.tsx src/shared/components/ui/search-field.tsx src/shared/components/ui/listbox-search-input.tsx src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx src/shared/components/ui/switch.tsx src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/components/ui/pagination.tsx src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
```

- [ ] **Step 2: Typecheck, lint, build**

```powershell
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 3: Gate toàn phase**

```powershell
$files = @(
  "src/shared/components/ui/button.tsx",
  "src/shared/components/ui/chip.tsx",
  "src/shared/components/ui/text-field.tsx",
  "src/shared/components/ui/search-field.tsx",
  "src/shared/components/ui/listbox-search-input.tsx",
  "src/shared/components/ui/dropdown.tsx",
  "src/shared/components/ui/multi-select-dropdown.tsx",
  "src/shared/components/ui/switch.tsx",
  "src/shared/components/ui/date-picker.tsx",
  "src/shared/components/ui/time-picker.tsx",
  "src/shared/components/ui/dialog.tsx",
  "src/shared/components/feedback/toast-container.tsx",
  "src/shared/components/ui/pagination.tsx",
  "src/features/movies/components/poster-card.tsx",
  "src/features/albums/components/album-card.tsx"
)
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)" -- $files
git grep -n -E "rounded-(md|lg)" -- $files
git grep -n "focus-visible:ring-1" -- $files
git grep -n -E "strokeWidth=\{1\.8|strokeWidth=\{undefined" -- $files
git grep -n "text-white" -- $files
git diff --check
git status --short
git diff --stat
```

Expected:

- Raw size, `rounded-md/lg`, `focus-visible:ring-1`, stroke 1.8/undefined → không có output.
- `text-white` chỉ còn ngoại lệ media: Chip neutral, PosterCard, AlbumCard.
- `git diff --check` sạch.
- Chỉ các file Phase 2 + docs đang mở; không có file ngoài phạm vi.

- [ ] **Step 4: Source review**

Rà diff cho:

- Focus/keyboard của field, dropdown, multiselect, switch, picker, dialog, pagination không đổi hành vi.
- `focus-ring` không áp cho underline field; underline vẫn `focus-visible:outline-none` + border-bottom.
- `text-on-primary` chỉ trên nền primary đặc; trắng trên overlay ảnh giữ nguyên.
- Không đổi logic, state, listener, timing motion, loading.

- [ ] **Step 5: Review 7 trục cho toàn phase (code-refactor, chế độ A) + cập nhật log**

Review diff toàn phase theo 7 trục, phân loại BLOCKER/MAJOR/MINOR/NIT, ghi vào `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 2 — Verify). Sửa BLOCKER/MAJOR rồi chạy lại toàn bộ gate.

- [ ] **Step 6: Dừng, không commit**

Báo diff, gate, kết quả build và kết quả review. Không chạy `git add`, `git commit` hay `git push`. Phase 3 sẽ có plan riêng.
