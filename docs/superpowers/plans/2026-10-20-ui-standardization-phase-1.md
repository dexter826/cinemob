# UI Standardization Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Thêm 8 typography utility + 2 modifier, `focus-ring`, sửa warning light sang `#9a5d06`; xác nhận radius token đã đúng. Không sweep component.

**Architecture:** Tailwind v4 custom utility trong `src/index.css` là nguồn duy nhất cho type scale và focus. Các phase sau chỉ thay class ở component; phase này không sửa file component.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17 (`@utility`), Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (đã duyệt; display utility đã sửa thành title case, không uppercase).

## Global Constraints

- Chỉ sửa `src/index.css`. Không sửa component, route, store, test hay dependency.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push. Dừng sau khi báo diff và trạng thái git.
- Type scale cố định: display 24/30/36/48/60/72/96; title 18/20; body 12/14; caps 9/11.
- Display dùng title case. Chỉ `label-caps` và `micro-caps` có `text-transform: uppercase`.
- Warning: light `#9a5d06`, dark `#fbbf24` giữ nguyên.
- Radius token đã đúng: control/card/dialog 8px; poster 4px. Không thêm token mới.
- Không thêm comment vào utility mới; tên utility và giá trị tự mô tả.
- Sau mỗi task: `npx prettier --write src/index.css` → `npm run typecheck` → `npm run lint` → `npm run build` → grep/source review.
- Build là kiểm chứng CSS compile; không tuyên bố đã kiểm tra visual/runtime.

---

## Task 1: Thêm typography utility

**Files:**

- Modify: `src/index.css` — append sau `@utility cv-auto` (quanh dòng 253-257)

**Interfaces:**

- Consumes: token `--font-display`, `--font-sans` trong `@theme`.
- Produces: `text-display-xl`, `text-display-lg`, `text-display-stat`, `text-display-404`, `text-title-lg`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`, `text-micro-caps`.

- [x] **Step 1: Append 10 utility vào cuối `src/index.css`**

```css
@utility text-display-xl {
  font-family: var(--font-display);
  font-size: 30px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.025em;

  @media (min-width: 40rem) {
    font-size: 36px;
  }

  @media (min-width: 48rem) {
    font-size: 48px;
  }
}

@utility text-display-lg {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 400;
  line-height: 1.05;
  letter-spacing: 0.025em;

  @media (min-width: 40rem) {
    font-size: 30px;
  }

  @media (min-width: 48rem) {
    font-size: 36px;
  }
}

@utility text-display-stat {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0.025em;

  @media (min-width: 40rem) {
    font-size: 60px;
  }
}

@utility text-display-404 {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: 0;

  @media (min-width: 48rem) {
    font-size: 96px;
  }
}

@utility text-title-lg {
  font-family: var(--font-sans);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  letter-spacing: 0;
}

@utility text-title-md {
  font-family: var(--font-sans);
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: 0;
}

@utility text-body {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0;
}

@utility text-body-sm {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.5;
  letter-spacing: 0;
}

@utility text-label-caps {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@utility text-micro-caps {
  font-family: var(--font-sans);
  font-size: 9px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
```

- [x] **Step 2: Format CSS**

```powershell
npx prettier --write src/index.css
npx prettier --check src/index.css
```

Expected: `All matched files use Prettier code style!`.

- [x] **Step 3: Typecheck, lint, build**

```powershell
npm run typecheck
npm run lint
npm run build
```

Expected:

- `typecheck`: exit 0.
- `lint`: exit 0, không có error.
- `build`: `tsc --noEmit` pass; `vite build` hoàn tất, CSS được compile.

- [x] **Step 4: Gate utility và casing**

```powershell
git grep -n -E "@utility text-(display-xl|display-lg|display-stat|display-404|title-lg|title-md|body|body-sm|label-caps|micro-caps)" -- src/index.css
git grep -n "text-transform: uppercase" -- src/index.css
git status --short
```

Expected:

- Lệnh 1 trả về đúng 10 dòng `@utility`.
- Lệnh 2 trả về đúng 2 dòng: `text-label-caps`, `text-micro-caps`.
- `git status --short` có `M src/index.css`; ngoài ra chỉ có docs đang mở (spec correction/plan), không có file `src/` khác.

- [x] **Step 5: Dừng, không commit**

Báo diff và kết quả build. Không chạy `git add`, `git commit` hay `git push`.

---

## Task 2: Thêm `focus-ring`, sửa warning light, xác nhận radius

**Files:**

- Modify: `src/index.css` — warning light (dòng 27)
- Modify: `src/index.css` — append `focus-ring` sau `text-micro-caps`
- Verify only: `src/index.css` — radius token (dòng 34-37)

**Interfaces:**

- Consumes: `--color-focus`, `--color-warning`, radius token hiện có.
- Produces: utility `focus-ring`; warning light đúng contrast token.

- [x] **Step 1: Sửa warning light**

Old:

```css
--color-warning: #a16207; /* yellow-700 */
```

New:

```css
--color-warning: #9a5d06; /* warning trên nền sáng */
```

Giữ nguyên `--color-warning: #fbbf24` trong `.dark`.

- [x] **Step 2: Append `focus-ring` sau block `text-micro-caps`**

```css
@utility focus-ring {
  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 3px;
  }
}
```

- [x] **Step 3: Xác nhận radius token, không sửa**

```powershell
git grep -n -E -e "--radius-(control|card|dialog|poster)" -- src/index.css
```

Expected: đúng 4 dòng, giá trị `8px`, `8px`, `8px`, `4px`.

- [x] **Step 4: Format, typecheck, lint, build**

```powershell
npx prettier --write src/index.css
npx prettier --check src/index.css
npm run typecheck
npm run lint
npm run build
```

Expected: Prettier pass; typecheck/lint exit 0; build hoàn tất.

- [x] **Step 5: Gate warning, focus, radius**

```powershell
git grep -n "#a16207" -- src
git grep -n -E "#9a5d06|#fbbf24" -- src/index.css
git grep -n "@utility focus-ring" -- src/index.css
git grep -n -E -e "--radius-(control|card|dialog|poster)" -- src/index.css
git status --short
```

Expected:

- `#a16207` → không có output.
- Warning values → đúng 2 dòng: `#9a5d06`, `#fbbf24`.
- `focus-ring` → đúng 1 dòng.
- Radius → đúng 4 dòng.
- `git status --short` có `M src/index.css`; ngoài ra chỉ có docs đang mở (spec correction/plan), không có file `src/` khác.

- [x] **Step 6: Dừng, không commit**

Báo diff, gate và kết quả build. Không chạy `git add`, `git commit` hay `git push`. Phase 2 sẽ có plan riêng.

---

## Task 3: Review 7 trục và kiểm chứng CSS thực sự được sinh

- [x] **Step 1: Probe emit CSS**

Tạo file tạm `src/temp-utility-probe.ts` chứa đủ 10 tên utility + `focus-ring`, chạy `npm run build`, kiểm tra `dist/assets/index-*.css`, rồi xoá file tạm và build lại.

Kết quả: 10/10 utility + `focus-ring` có trong CSS; media query lồng trong `@utility` compile đúng (`text-display-xl` 30→36→48, `text-display-lg` 24→30→36, `text-display-stat` 48→60, `text-display-404` 72→96); `focus-ring` → `.focus-ring:focus-visible{outline:2px solid var(--color-focus);outline-offset:3px}`.

Phát hiện phụ: Tailwind v4 auto-detect quét cả `.md`, nên tên utility trong plan/spec khiến utility được emit dù chưa component nào dùng.

- [x] **Step 2: Review 7 trục (code-refactor, chế độ A)**

Kết quả: 0 BLOCKER, 0 MAJOR, 2 MINOR, 1 NIT — ghi tại `docs/ui-standardization-progress-2026-10-20.md` (mục Phase 1). MINOR: focus ring có hai nguồn sự thật (base layer `src/index.css:141-144` và utility `focus-ring`); `.font-display` trong base layer trùng utility Tailwind tự sinh (code có sẵn, ngoài diff).

- [x] **Step 3: Cập nhật log triển khai**

Ghi Phase 0-1 vào `docs/ui-standardization-progress-2026-10-20.md`, gồm quy trình chuẩn, bảng lệch so với `executing-plans` và giới hạn kiểm chứng runtime.
