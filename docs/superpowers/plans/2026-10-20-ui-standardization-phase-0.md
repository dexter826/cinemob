# UI Standardization Phase 0 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cập nhật `DESIGN.md` với utility typography và các ngoại lệ đã duyệt, rồi xoá 2 spec + 2 plan cũ; chỉ sửa docs, không sửa code.

**Architecture:** Phase 0 là bước docs-only. `DESIGN.md` vẫn là nguồn chuẩn; spec mới là tài liệu apply. Các phase 1-6 sẽ có plan riêng; plan này không triển khai static, motion hay loading.

**Tech Stack:** Markdown, Prettier, Git, PowerShell.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (đã duyệt).

## Global Constraints

- Chỉ sửa `DESIGN.md` và xoá 4 file docs cũ. Không sửa bất kỳ file nào trong `src/`.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push. Dừng sau khi báo diff và trạng thái git.
- `DESIGN.md` > spec > code. Nếu plan mâu thuẫn spec, dừng và sửa plan/spec trước.
- Giữ `docs/loading-audit-2026-10-18.md`; không sửa file này.
- Spec mới đang untracked; không xoá, không đổi tên.
- Giá trị chuẩn: 404 72 → 96px; splash 36 → 48px; chart axis 10px/700/50%; micro-spacing 2/6/10px; pagination/toolbar 36/40px; logo `strokeWidth` 3; picker chevron 2.5; warning light `#9a5d06`, dark `#fbbf24`.
- `index.css` warning light hiện là `#a16207`; đây là việc của Phase 1, không sửa trong Phase 0.
- Chạy mọi lệnh từ root repo `C:\MyProject\cinemob`.

---

## Task 1: Cập nhật `DESIGN.md` với utility và ngoại lệ

**Files:**

- Modify: `DESIGN.md` — Typography (quanh dòng 202-206)
- Modify: `DESIGN.md` — Spacing & Layout (quanh dòng 220)
- Modify: `DESIGN.md` — PosterCard (quanh dòng 300)
- Modify: `DESIGN.md` — Iconography & Imagery (quanh dòng 313-318)
- Modify: `DESIGN.md` — Implementation Notes (quanh dòng 380-389)

**Interfaces:**

- Consumes: nội dung đã duyệt trong spec §2.3, §3.1 và §9.4.
- Produces: tên utility chính xác và ranh giới ngoại lệ để các phase 1-6 áp dụng.

- [ ] **Step 1: Thêm ngoại lệ Typography**

Old:

```md
- Caps label chỉ có hai style: `label-caps` 11px và `micro-caps` 9px. Không dùng 10px, 11.5px hay 15px.
- Weight có thể tăng 600/700 cho emphasis (button, poster title); không đổi size.
```

New:

```md
- Caps label chỉ có hai style: `label-caps` 11px và `micro-caps` 9px. Không dùng 10px, 11.5px hay 15px.
- Ngoại lệ data-viz: chart axis dùng 10px/700/50%; không dùng cho text UI.
- 404 dùng utility `text-display-404` 72 → 96px; splash wordmark dùng Anton 36 → 48px, không tính vào type scale.
- `micro-caps` mặc định uppercase; metadata số/ngày được phép `normal-case`.
- Weight có thể tăng 600/700 cho emphasis (button, poster title); không đổi size.
```

- [ ] **Step 2: Thêm ngoại lệ Spacing**

Old:

```md
- Arbitrary spacing chỉ cho safe-area, hairline quang học hoặc phần trăm; không dùng để chỉnh layout.
```

New:

```md
- Arbitrary spacing chỉ cho safe-area, hairline quang học hoặc phần trăm; không dùng để chỉnh layout.
- Micro-spacing 2/6/10px chỉ để căn icon/chữ; layout vẫn theo thang 4/8/12/16/20/24/32/40/48/64.
- Pagination/toolbar compact dùng 36/40px; form control giữ 44px; icon-button 32/40/48px.
```

- [ ] **Step 3: Thêm ngoại lệ PosterCard**

Old:

```md
- Title `body-sm` 12px/700 trắng, meta `micro-caps` 9px trắng/55, progress 2px `primary`.
```

New:

```md
- Title `body-sm` 12px/700 trắng, meta `micro-caps` 9px trắng/55, progress 2px `primary`.
- Check selected nằm trên overlay `primary/25`, giữ trắng; ngoại lệ media, không áp dụng cho nền primary đặc.
```

- [ ] **Step 4: Thêm ngoại lệ Iconography và đánh dấu chart axis**

Old:

```md
- Lucide; `strokeWidth` chuẩn **1.5** cho mọi icon; active nav dùng 2. Icon hiện không set phải được chuẩn hoá về 1.5.
```

New:

```md
- Lucide; `strokeWidth` chuẩn **1.5** cho mọi icon; active nav dùng 2. Icon hiện không set phải được chuẩn hoá về 1.5.
- Ngoại lệ: logo symbol `strokeWidth` 3; picker chevron 2.5.
```

Old:

```md
- Charts dùng palette derive từ token: `primary` + mix `text-secondary`/`surface`; grid 5%, axis 10px/700/50%, bar `primary`, animation 1s có gate reduced-motion.
```

New:

```md
- Charts dùng palette derive từ token: `primary` + mix `text-secondary`/`surface`; grid 5%, axis 10px/700/50% (ngoại lệ data-viz), bar `primary`, animation 1s có gate reduced-motion.
```

- [ ] **Step 5: Thêm utility contract vào Implementation Notes**

Old:

```md
- **UI kit:** `src/shared/components/ui` (barrel `index.ts`); feedback ở `src/shared/components/feedback`; layout ở `src/shared/components/layout`.
- **Card chuẩn:** `src/features/movies/components/poster-card.tsx`; mọi card phim dùng pattern này.
```

New:

```md
- **UI kit:** `src/shared/components/ui` (barrel `index.ts`); feedback ở `src/shared/components/feedback`; layout ở `src/shared/components/layout`.
- **Type utility:** `text-display-xl`, `text-display-lg`, `text-title-lg`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`, `text-micro-caps`; modifier `text-display-stat` (48 → 60) và `text-display-404` (72 → 96). Code không dùng `text-[…px]` hoặc `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/9xl` cho size; ngoại lệ chart axis 10px.
- **Card chuẩn:** `src/features/movies/components/poster-card.tsx`; mọi card phim dùng pattern này.
```

- [ ] **Step 6: Verify docs edit**

```powershell
npx prettier --write DESIGN.md
npx prettier --check DESIGN.md
git diff --check -- DESIGN.md
git diff -- DESIGN.md
git grep -n -E "warning: '#fbbf24'|warning: '#9a5d06'|text-faint|on-primary" -- DESIGN.md
git status --short
```

Expected:

- Prettier báo `All matched files use Prettier code style!`.
- `git diff --check` không có output.
- Diff chỉ gồm các dòng vừa thêm trong 5 mục trên.
- `git grep` trả về 2 dòng warning, dòng `text-faint` trong Accessibility và các dòng `on-primary` hiện có; không sửa thêm Colors/Accessibility.
- `git status --short` có `M DESIGN.md` và spec mới untracked; không có file `src/`.

- [ ] **Step 7: Dừng, không commit**

Báo lại diff và trạng thái git. Không chạy `git add`, `git commit` hay `git push`.

---

## Task 2: Xoá 2 spec + 2 plan cũ và kiểm tra Phase 0

**Files:**

- Delete: `docs/superpowers/specs/2026-10-18-motion-standard-design.md`
- Delete: `docs/superpowers/specs/2026-10-18-loading-consistency-design.md`
- Delete: `docs/superpowers/plans/2026-10-18-motion-standard.md`
- Delete: `docs/superpowers/plans/2026-10-18-loading-consistency.md`
- Keep: `docs/loading-audit-2026-10-18.md`
- Keep: `docs/superpowers/specs/2026-10-20-ui-standardization-design.md`

**Interfaces:**

- Consumes: Task 1 đã cập nhật `DESIGN.md`.
- Produces: chỉ còn spec mới làm tài liệu apply; audit loading vẫn còn.

- [ ] **Step 1: Xác nhận 4 file tồn tại trước khi xoá**

```powershell
$paths = @(
  "docs/superpowers/specs/2026-10-18-motion-standard-design.md",
  "docs/superpowers/specs/2026-10-18-loading-consistency-design.md",
  "docs/superpowers/plans/2026-10-18-motion-standard.md",
  "docs/superpowers/plans/2026-10-18-loading-consistency.md"
)
$paths | ForEach-Object { "$_ = $(Test-Path -LiteralPath $_)" }
```

Expected: cả 4 dòng đều `= True`.

- [ ] **Step 2: Xoá đúng 4 file**

```powershell
@(
  "docs/superpowers/specs/2026-10-18-motion-standard-design.md",
  "docs/superpowers/specs/2026-10-18-loading-consistency-design.md",
  "docs/superpowers/plans/2026-10-18-motion-standard.md",
  "docs/superpowers/plans/2026-10-18-loading-consistency.md"
) | ForEach-Object { Remove-Item -LiteralPath $_ }
```

- [ ] **Step 3: Xác nhận 4 file đã biến mất**

```powershell
@(
  "docs/superpowers/specs/2026-10-18-motion-standard-design.md",
  "docs/superpowers/specs/2026-10-18-loading-consistency-design.md",
  "docs/superpowers/plans/2026-10-18-motion-standard.md",
  "docs/superpowers/plans/2026-10-18-loading-consistency.md"
) | ForEach-Object { "$_ = $(Test-Path -LiteralPath $_)" }
```

Expected: cả 4 dòng đều `= False`.

- [ ] **Step 4: Xác nhận không còn tham chiếu trong docs tracked**

```powershell
git grep -n -E "2026-10-18-(motion-standard|loading-consistency)" -- docs DESIGN.md
```

Expected: không có output. Spec mới là untracked nên `git grep` không quét; các đường dẫn trong §9.2 của spec mới là danh sách file đã xoá, không phải link.

- [ ] **Step 5: Xác nhận audit loading vẫn còn và docs đúng format**

```powershell
Test-Path -LiteralPath "docs/loading-audit-2026-10-18.md"
npx prettier --check DESIGN.md docs/superpowers/specs/2026-10-20-ui-standardization-design.md
```

Expected: `True`; Prettier pass.

- [ ] **Step 6: Gate nội dung Phase 0**

```powershell
git grep -n -E "text-display-xl|text-display-404|chart axis|Micro-spacing|Pagination/toolbar|picker chevron|strokeWidth.*3|micro-caps.*normal-case" -- DESIGN.md
git grep -n -E "warning: '#fbbf24'|warning: '#9a5d06'" -- DESIGN.md
```

Expected:

- Lệnh 1 trả về các dòng chứa utility/ngoại lệ vừa thêm.
- Lệnh 2 trả về đúng 2 dòng warning trong YAML.

- [ ] **Step 7: Kiểm tra trạng thái cuối, không commit**

```powershell
git status --short
```

Expected: `M DESIGN.md`; 4 dòng `D` cho 4 file vừa xoá; `?? docs/superpowers/specs/2026-10-20-ui-standardization-design.md`; không có file `src/`.

Không chạy `git add`, `git commit` hay `git push`. Báo lại kết quả và dừng; Phase 1 sẽ có plan riêng.
