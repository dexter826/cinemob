# UI Standardization Phase 6 — Final verify

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:finishing-a-development-branch to complete this work after the plan steps pass.

**Goal:** Chốt toàn bộ chuỗi Phase 0-5: đóng MINOR "focus outline hai nguồn sự thật", chạy gate §8.2 toàn repo, rà lại ma trận §4, viết báo cáo cuối, rồi hoàn tất nhánh.

**Architecture:** Không thêm component hay luồng mới. Phase 6 chỉ: (1) gộp giá trị focus ring về một nguồn, (2) verify, (3) báo cáo, (4) hoàn tất nhánh.

**Tech Stack:** Prettier 3.9.9, TypeScript ~5.8.2, ESLint, Vite 6.2, Tailwind CSS 4.1.17, Git.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` §4 (ma trận), §8 (verify + gate), §9 (docs).

## Global Constraints

- Chỉ sửa `src/index.css` (token focus ring) và `DESIGN.md` (ghi chú contract). Ngoài ra chỉ sửa docs.
- Không chạy test runner, không mock, không mở browser.
- Không commit/stage/push trong các task 1-3; commit + `finishing-a-development-branch` ở task 4 (có yêu cầu rõ ràng từ người dùng).
- Không dùng PowerShell để sửa file nguồn; dùng công cụ `edit`.
- Báo cáo cuối phải phân biệt "đã sửa theo source" với "chưa kiểm chứng runtime".

---

## Task 1: Đóng MINOR — focus outline một nguồn sự thật

**Files:**

- Modify: `src/index.css` — `:root` trong `@layer base` + rule focus toàn cục + utility `focus-ring`
- Modify: `DESIGN.md` — mục Accessibility + Implementation Notes

**Interfaces:**

- Consumes: `--color-focus`.
- Produces: `--focus-ring-width`, `--focus-ring-offset`; cả global rule và utility `focus-ring` dùng chung hai giá trị này.

- [x] **Step 1: Khai báo 2 biến trong `:root`**

Trong `@layer base`, khối `:root` hiện có (chỉ có `color-scheme: light`), thêm:

```css
:root {
  color-scheme: light;
  --focus-ring-width: 2px;
  --focus-ring-offset: 3px;
}
```

- [x] **Step 2: Rule focus toàn cục dùng biến**

```diff
-    outline: 2px solid var(--color-focus);
-    outline-offset: 3px;
+    outline: var(--focus-ring-width) solid var(--color-focus);
+    outline-offset: var(--focus-ring-offset);
```

- [x] **Step 3: Utility `focus-ring` dùng biến**

```diff
 @utility focus-ring {
   &:focus-visible {
-    outline: 2px solid var(--color-focus);
-    outline-offset: 3px;
+    outline: var(--focus-ring-width) solid var(--color-focus);
+    outline-offset: var(--focus-ring-offset);
   }
 }
```

- [x] **Step 4: Ghi vào `DESIGN.md`**

Trong mục Accessibility, sửa dòng focus thành:

```md
- Focus: outline 2px `focus`, offset 3px, hiện tức thì; không `outline-none` nếu không có thay thế. Kích thước lấy từ `--focus-ring-width` / `--focus-ring-offset` nên đổi một chỗ áp dụng cho cả rule toàn cục và utility `focus-ring`.
```

- [x] **Step 5: Format, typecheck, lint, build + probe**

```powershell
npx prettier --write src/index.css DESIGN.md
npm run typecheck
npm run lint
npm run build
$css = (Get-ChildItem dist\assets\index-*.css | Select-Object -First 1).FullName
$c = Get-Content -Raw $css
$c.Contains("--focus-ring-width:2px")
$c.Contains("outline:var(--focus-ring-width) solid var(--color-focus)")
```

Expected: Prettier pass; typecheck/lint/build exit 0; cả hai kiểm tra CSS = True.

- [x] **Step 6: Review 7 trục + cập nhật log**

- [x] **Step 7: Dừng, không commit**

---

## Task 2: Gate toàn repo theo spec §8.2

- [x] **Step 1: Commands §8.1**

```powershell
npx prettier --check "src/**/*.{ts,tsx,css}" "docs/**/*.md" DESIGN.md
npm run typecheck
npm run lint
npm run build
git diff --check
```

Expected: Prettier pass; typecheck/lint/build exit 0; `git diff --check` sạch.

- [x] **Step 2: Gate §8.2**

```powershell
git grep -n -E "text-\[[0-9.]+px\]|text-(xs|sm|base|lg|xl|2xl|3xl|4xl|5xl|6xl|7xl|9xl)" -- src
git grep -n -E "rounded-(md|lg)" -- src
git grep -n -E "focus-visible:ring-[0-9]" -- src
git grep -n -E "strokeWidth=\{(1\.8|2|undefined)" -- src
git grep -n "text-white" -- src
git grep -n -E "duration-(75|300|500|1000)" -- src
git grep -n "#a16207" -- src
```

Expected: 5 lệnh đầu không có output; `text-white` chỉ còn 9 chỗ ngoại lệ media (poster-card, album-card, chip neutral) đã có tên trong spec §2.3; `duration` sai = 0; `#a16207` = 0.

- [x] **Step 3: Gate bổ sung (script quét, không dùng grep)**

Chạy 2 script kiểm tra (tạm, xoá sau khi chạy):

1. Icon Lucide thiếu `strokeWidth` → kỳ vọng 0.
2. `<img>` thiếu `width` → kỳ vọng 0.

Dùng `node` với `node:fs` (đọc/ghi UTF-8), không dùng PowerShell để ghi file.

- [x] **Step 4: Ghi kết quả gate vào log**

- [x] **Step 5: Dừng, không commit**

---

## Task 3: Rà ma trận §4 và viết báo cáo cuối

- [x] **Step 1: Rà từng dòng ma trận §4**

| Nhóm       | Kỳ vọng sau phase 0-5                                                                      |
| ---------- | ------------------------------------------------------------------------------------------ |
| Colors     | warning light `#9a5d06`; dark giữ; 2 chỗ `text-white` trên primary đặc đã đổi `on-primary` |
| Typography | 0 raw size trong toàn repo; 10 utility + 2 modifier có tên                                 |
| Spacing    | không sweep; micro-spacing giữ nguyên                                                      |
| Radius     | 0 `rounded-md`/`rounded-lg`; dùng token ngữ nghĩa                                          |
| Elevation  | `switch` đã bỏ `shadow`; token shadow = 0                                                  |
| Components | button sm/md → `body-sm`; tag radius 4; dialog X 1.5; focus ring 2px                       |
| Icons      | mọi icon Lucide có `strokeWidth` tường minh; ngoại lệ logo 3, picker 2.5, active nav 2     |
| Imagery    | mọi `<img>` có `width`/`height`; fallback một lần                                          |
| Focus      | 0 `focus-visible:ring-*`; outline 2px offset 3px từ token chung                            |
| Motion     | thang 120/150/200/250; không có 75/300/500/1000                                            |
| Loading    | L01–L17 đạt                                                                                |
| Docs       | spec mới + plan theo phase + log; 4 docs cũ đã xoá; `DESIGN.md` cập nhật                   |

Ghi bảng này vào log kèm trạng thái thực tế đo được.

- [x] **Step 2: Liệt kê giới hạn kiểm chứng**

Ghi rõ trong log và báo cáo cuối: không có test tự động, không mở trình duyệt → chưa kiểm chứng runtime cho focus bàn phím, screen reader, hai theme, mobile, layout shift, motion reduced, race condition request; build/lint/typecheck không chứng minh các điều đó; visual delta chưa đo.

- [x] **Step 3: Báo cáo cuối trong log**

Tóm tắt: số file đã sửa theo phase, số commit, gate kết quả, danh sách visual delta cần kiểm chứng bằng trình duyệt, và xác nhận không tuyên bố đạt WCAG.

- [x] **Step 4: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 5: Dừng, không commit**

---

## Task 4: Hoàn tất nhánh

- [x] **Step 1: Chốt commit cuối**

```powershell
git add -A
git status --short
git diff --cached --stat
```

Báo lại danh sách file staged trước khi commit; commit message dạng Conventional Commits, tiếng Việt, nêu lý do.

- [x] **Step 2: Chạy skill `finishing-a-development-branch`**

Dùng skill `superpowers:finishing-a-development-branch` để đưa nhánh `feat/ui-standardization` về trạng thái hoàn tất (lựa chọn merge/PR/giữ nhánh theo người dùng).

- [x] **Step 3: Báo cáo trạng thái cuối**

Báo: nhánh, commit list, gate kết quả, giới hạn kiểm chứng runtime, việc còn mở.
