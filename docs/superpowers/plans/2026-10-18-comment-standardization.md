# Chuẩn hóa Comment — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task (chạy inline trong session; Task 1 có checkpoint bắt buộc với người dùng). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hóa toàn bộ comment trong `src/**` + `.github/scripts/**` về tiếng Việt theo AGENTS.md §5: xoá comment hiển nhiên/lặp code, giữ và rút gọn comment giải thích lý do, chuyển hết comment tiếng Anh sang tiếng Việt — không đổi một dòng code nào.

**Architecture:** Một chuẩn chung duy nhất (spec §3) + quy trình batch theo thư mục vật lý. Pilot `src/shared/components/ui` (27 file) để chốt chuẩn với người dùng trước, sau đó sweep tự động theo cây thư mục, mỗi batch verify tĩnh (prettier theo file + typecheck + lint) và báo cáo. Không thêm dependency, không test mới; commit từng batch ngay sau khi verify xanh (không push, chỉ stage file thuộc batch).

**Tech Stack:** TypeScript 5.8 / React 19 / Vite 6 / Tailwind 4 (chỉ đọc). Công cụ verify: `tsc --noEmit`, ESLint 9, Prettier 3, `node --check`, `node --test` (có sẵn).

**Spec nguồn:** `docs/superpowers/specs/2026-10-18-comment-standardization-design.md` (đã chốt qua phỏng vấn 2026-10-18).

## Global Constraints

- Phạm vi: chỉ comment trong `src/**` (.ts/.tsx/.css) + `.github/scripts/*.js` — 159 file (156 src + 3 scripts). Không đụng docs, UI copy, string, config, `.agents/`, file sinh tự động.
- Chuẩn: spec §3 là nguồn sự thật duy nhất khi phân vân. Đọc spec §3 trước khi bắt đầu bất kỳ batch nào.
- Chuẩn bổ sung 18/10 (sau phản hồi người dùng, spec §3.2–3.3): xoá tham chiếu quy trình (spec/gate/task), mô tả design trang trí; đánh giá theo toàn cảnh file (file tự mô tả → xoá comment lẻ; mức comment nhất quán); hạn chế trailing comment. Áp hồi tố cho cả file đã xử lý ở batch trước (fix bằng commit riêng).
- Trước khi sửa mỗi file: đọc trọn file đó (bắt buộc đề phán đoán comment lỗi thời/hiển nhiên theo ngữ cảnh).
- Không sửa code/identifier/type/string/import; không thêm comment mới; xoá comment thì dọn dòng trắng do chính việc xoá tạo ra; dòng trắng đôi có sẵn từ trước chỉ báo cáo.
- Tồn đọng prettier — file CHƯA chạm chỉ báo cáo, không sửa. 12 file src đang đỏ sẵn: `theme-provider.tsx`, `use-app-init.ts`, `create-album-modal.tsx`, `dashboard-tabs.tsx`, `use-movie-validation.ts`, `use-avatar-crop.ts`, `use-search.ts`, `splash-screen.tsx`, `cinemob-symbol.tsx`, `page-header.tsx`, `stat.tsx`, `text-field.tsx` (11 file docs cũng đỏ — ngoài phạm vi). RIÊNG file đã chạm (sửa comment) phải chạy `prettier --write` để để lại prettier-clean — format đi kèm comment (điều chỉnh 18/10/2026).
- Verify mỗi batch: `npx prettier --check` theo file/folder đã sửa (tiêu chí: không lỗi MỚI) + `npm run typecheck` + `npm run lint` (baseline: xanh, 0 warning). Không dùng `npm run format:check` toàn repo làm cổng (đỏ sẵn 23 file).
- Baseline 18/10/2026 trước đợt: typecheck xanh; lint xanh 0 warning; format:check đỏ 23 file (tồn đọng).
- Commit từng batch: sau khi verify xanh, stage ĐÚNG các file thuộc batch rồi commit message `chore(comments): ...` ghi ở từng task. Không push; không stage file ngoài phạm vi (docs, `AGENTS.md`, config gốc). Verify đỏ → không commit, báo người dùng.
- Không mở browser/dev server; không thêm dependency/test/mock; `npm test` chỉ chạy trong Task 13 (test có sẵn của `.github/scripts`).

## Quy trình chuẩn cho mọi batch

Với từng file trong batch:

- [ ] Step A: Đọc trọn file. Phân loại từng comment vào 4 nhóm: **xoá** / **viết lại** / **EN→VI** / **giữ nguyên** (theo spec §3.3).
- [ ] Step B: Sửa chỉ tại dòng comment. Tự soát lại ranh giới spec §3.4 trước khi rời file (không chạm code/string/whitespace ngoài phạm vi; không để 2 dòng trắng liền kề do việc xoá gây ra). File sau khi sửa chạy `npx prettier --write` để để lại prettier-clean (format đi kèm comment).
- [ ] Step C: Verify xanh → báo cáo batch theo template → commit `chore(comments): <message của task>` (không push).

Verify chuẩn cho batch `src/**` thuần ts/tsx:

```powershell
npx prettier --check "<glob folder của batch>"
npm run typecheck
npm run lint
```

Expected: prettier chỉ còn đúng các lỗi tồn đọng đã biết (không lỗi mới); typecheck pass; lint pass 0 warning.

Template báo cáo batch (số liệu + 5–8 dòng before/after; pilot 10–15 dòng):

```markdown
Batch <tên>: quét <N> file · sửa <M> · xoá <X> comment · viết lại <Y> · EN→VI <Z>

| File | Trước | Sau | Loại |
| ---- | ----- | --- | ---- |
| ...  | ...   | ... | xoá/viết lại/EN→VI |

Ngoài phạm vi: <ghi chú nếu có>
Verify: prettier (tồn đọng: ...) · typecheck pass · lint pass
```

---

### Task 1: PILOT — `src/shared/components/ui` (27 file) + checkpoint người dùng

**Files:**
- Modify (theo quy trình chuẩn): `src/shared/components/ui/` — 26 file .tsx + `index.ts`

**Hotspot đã biết:**
- Comment EN cần chuyển VI: `skeleton-card.tsx:2`, `lazy-dialog.tsx:15`, `loading.tsx:9`
- JSDoc: `chip.tsx:8-20` (giữ, làm gọn)
- JSX section label dày: `date-picker.tsx` (~257-397) — áp quy tắc file dài/ngắn
- `@deprecated` "Remove in Task 23": `page-header.tsx:12,14` — GIỮ nguyên tag, ghi chú nghi lỗi thời vào báo cáo
- Prettier đỏ sẵn (chỉ báo cáo): `cinemob-symbol.tsx`, `page-header.tsx`, `stat.tsx`, `text-field.tsx`

- [x] **Step 1: Chạy Quy trình chuẩn cho cả 27 file**

- [x] **Step 2: Verify**

```powershell
npx prettier --check "src/shared/components/ui/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

Expected: prettier chỉ còn 4 lỗi tồn đọng đã biết (trừ khi dòng comment ta sửa nằm đúng lỗi tồn đọng — ghi nhận đã xử lý); typecheck/lint pass.

- [x] **Step 3: Báo cáo pilot (10–15 before/after + số liệu)** theo template, ưu tiên đủ dạng: EN→VI, xoá, rút gọn, JSDoc, JSX label.

- [x] **Step 4: CHECKPOINT — DỪNG.** Trình báo cáo, chờ người dùng duyệt hoặc hiệu chỉnh chuẩn. Nếu có hiệu chỉnh: cập nhật spec §3 trước, rồi mới sang Task 2. Không tự chạy tiếp.

- [x] **Step 5: Commit** `chore(comments): standardize shared ui comments` (6 file đã sửa, commit `5833ee9`)

---

### Task 2: `src` root + `src/app` (9 file)

**Files:**
- Modify: `src/index.tsx`, `src/vite-env.d.ts`, `src/index.css`, `src/sw.ts` (4)
- Modify: `src/app/` (2 file) + `src/app/components/` (2) + `src/app/providers/` (1)

**Hotspot đã biết:**
- `use-app-init.ts`: có comment VI + dòng trắng đôi có sẵn (:32, :75) — chỉ báo cáo
- `index.css`: nếu có comment CSS thì chuẩn hóa; batch này BẮT BUỘC thêm `npm run build`
- Prettier đỏ sẵn (chỉ báo cáo): `theme-provider.tsx`, `use-app-init.ts`

- [x] **Step 1: Chạy Quy trình chuẩn cho 9 file** (chú ý: `sw.ts`/`vite-env.d.ts` nhiều khả năng no-op)

- [x] **Step 2: Verify** (thêm build vì có CSS)

```powershell
npx prettier --check "src/*.{ts,tsx,css}" "src/app/**/*.{ts,tsx}"
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 3: Báo cáo batch** theo template

- [x] **Step 4: Commit** `chore(comments): standardize app entry comments` (2 file đã sửa)

---

### Task 3: `src/constants` + `src/types` (11 file)

**Files:**
- Modify: `src/constants/` (6 file) + `src/types/` (5 file)

**Hotspot đã biết:**
- `src/constants/messages.ts`: CHỈ sửa comment — tuyệt đối không đụng string UI

- [x] **Step 1: Chạy Quy trình chuẩn cho 11 file**

- [x] **Step 2: Verify**

```powershell
npx prettier --check "src/constants/**/*.ts" "src/types/**/*.ts"
npm run typecheck
npm run lint
```

- [x] **Step 3: Báo cáo batch**

- [x] **Step 4: Commit** `chore(comments): standardize constants and types comments` (5 file, tất cả prettier-clean, xử lý theo toàn cảnh file)

---

### Task 4: `src/shared` phần còn lại A — components (ngoài ui) + config + lib + pages (10 file)

**Files:**
- Modify: `src/shared/components/feedback/` (5) + `src/shared/components/layout/` (2)
- Modify: `src/shared/config/` (1) + `src/shared/lib/` (1) + `src/shared/pages/` (1)

**Hotspot đã biết:**
- Prettier đỏ sẵn (chỉ báo cáo): `splash-screen.tsx`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 10 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/shared/components/feedback/**/*.{ts,tsx}" "src/shared/components/layout/**/*.{ts,tsx}" "src/shared/config/**/*.ts" "src/shared/lib/**/*.ts" "src/shared/pages/**/*.tsx"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize shared component comments`

---

### Task 5: `src/shared` phần còn lại B — hooks + stores + utils (10 file)

**Files:**
- Modify: `src/shared/hooks/` (4) + `src/shared/stores/` (2) + `src/shared/utils/` (4)

**Hotspot đã biết:**
- `use-scroll-restore.ts` có `/* ignore */` (:24, :38) — đọc kỹ ngữ nghĩa trước khi dịch; giữ đúng nghĩa gốc

- [ ] **Step 1: Chạy Quy trình chuẩn cho 10 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/shared/hooks/**/*.{ts,tsx}" "src/shared/stores/**/*.ts" "src/shared/utils/**/*.ts"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize shared hooks, stores, utils comments`

---

### Task 6: `src/features/albums` (10 file)

**Files:**
- Modify: `src/features/albums/` — components (3), hooks (2), pages (2), services (1), stores (1), utils (1)

**Hotspot đã biết:**
- `album-selector-modal.tsx:24`: comment EN
- Prettier đỏ sẵn (chỉ báo cáo): `create-album-modal.tsx`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 10 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/albums/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize albums feature comments`

---

### Task 7: `src/features/auth` + `src/features/stats` (5 file)

**Files:**
- Modify: `src/features/auth/` (2) + `src/features/stats/` (hooks 1, pages 1, utils 1)

- [ ] **Step 1: Chạy Quy trình chuẩn cho 5 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/auth/**/*.{ts,tsx}" "src/features/stats/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize auth and stats comments`

---

### Task 8: `src/features/calendar` (8 file)

**Files:**
- Modify: `src/features/calendar/` — components (3), hooks (1), pages (1), services (2), stores (1)

**Hotspot đã biết:**
- `services/calendar-service.ts` (:53, :69, :95): comment VI rationale — giữ ý, rút gọn nếu dài dòng

- [ ] **Step 1: Chạy Quy trình chuẩn cho 8 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/calendar/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize calendar feature comments`

---

### Task 9: `src/features/dashboard` (8 file)

**Files:**
- Modify: `src/features/dashboard/` — components (4), hooks (3), pages (1)

**Hotspot đã biết:**
- Prettier đỏ sẵn (chỉ báo cáo): `dashboard-tabs.tsx`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 8 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/dashboard/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize dashboard feature comments`

---

### Task 10: `src/features/movies` (22 file)

**Files:**
- Modify: `src/features/movies/` — components (3), components/add-movie (6), components/random-picker (1), hooks (6), pages (1), services (1), stores (3), utils (1)

**Hotspot đã biết:**
- `poster-card.tsx:11-38`: JSDoc props — giữ cấu trúc, rút gọn từng dòng
- `movie-detail-page.tsx` (:99-272): nhiều JSX section label VI — áp quy tắc file dài/ngắn
- Prettier đỏ sẵn (chỉ báo cáo): `use-movie-validation.ts`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 22 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/movies/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize movies feature comments`

---

### Task 11: `src/features/profile` (19 file)

**Files:**
- Modify: `src/features/profile/` — components (4), components/avatar (1), components/user (2), constants (1), hooks (3), pages (1), services (4), utils (3)

**Hotspot đã biết:**
- `services/member-profile-service.ts` (:14-213): nhiều comment rationale dài — giữ ý, rút gọn câu chữ
- Prettier đỏ sẵn (chỉ báo cáo): `use-avatar-crop.ts`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 19 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/profile/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize profile feature comments`

---

### Task 12: `src/features/search` (17 file)

**Files:**
- Modify: `src/features/search/` — components (2), components/person (1), hooks (4), pages (2), services/tmdb (7), utils (1)

**Hotspot đã biết:**
- `services/tmdb/client.ts` (:4, :46, :82): comment VI — `:46` kiểu lặp tên hàm, cân nhắc xoá
- Prettier đỏ sẵn (chỉ báo cáo): `use-search.ts`

- [ ] **Step 1: Chạy Quy trình chuẩn cho 17 file**

- [ ] **Step 2: Verify**

```powershell
npx prettier --check "src/features/search/**/*.{ts,tsx}"
npm run typecheck
npm run lint
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize search feature comments`

---

### Task 13: `.github/scripts` (3 file .js)

**Files:**
- Modify: `.github/scripts/check-episodes.js`, `.github/scripts/notification-targets.js`, `.github/scripts/notification-targets.node-test.js`

**Hotspot đã biết:**
- `check-episodes.js:1-5`: JSDoc EN + banner section EN; `:100` comment VI — thống nhất VI toàn file
- Không sửa `package.json`/lockfile trong folder này

- [ ] **Step 1: Chạy Quy trình chuẩn cho 3 file**

- [ ] **Step 2: Verify** (khác batch src — không dùng typecheck/lint)

```powershell
npx prettier --check ".github/scripts/*.js"
node --check .github/scripts/check-episodes.js
node --check .github/scripts/notification-targets.js
node --check .github/scripts/notification-targets.node-test.js
npm test
```

- [ ] **Step 3: Báo cáo batch**

Commit khi verify xanh: `chore(comments): standardize ci script comments`

---

### Task 14: Audit cuối + build + báo cáo tổng

**Files:**
- Audit (không sửa): toàn bộ `src/**`, `.github/scripts/*.js`

- [ ] **Step 1: Build cuối**

```powershell
npm run build
```

- [ ] **Step 2: Audit diff**

```powershell
git diff --stat
git status --porcelain
```

Xác nhận: diff chỉ chạm file trong phạm vi (ngoài 2 thay đổi có trước: `AGENTS.md` và `docs/logo/` untracked của người dùng — không được chạm vào). Đọc lướt diff từng file đã sửa, xác nhận chỉ dòng comment thay đổi.

- [ ] **Step 3: Grep hotspot tiếng Anh**

Kiểm tra các file từng có comment EN giờ còn câu tiếng Anh:

```powershell
git diff --name-only
rg -n "(//|/\*).*\b(the|with|and|for|when|this|from|should|must|use|data)\b" src/shared/components/ui src/shared/components/feedback .github/scripts
```

Đọc tay kết quả grep — thuật ngữ kỹ thuật lẫn trong câu tiếng Việt là hợp lệ; câu/đoạn tiếng Anh thuần là lỗi phải về 0 (quay lại file sửa nếu còn).

- [ ] **Step 4: Báo cáo tổng**: tổng số liệu toàn đợt, danh sách tồn đọng ngoài phạm vi (23 file prettier đỏ, dòng trắng đôi, tag "Remove in Task 23" ở `page-header.tsx` nghi lỗi thời), trạng thái verify cuối.

Các batch đã được commit riêng ngay khi verify xanh (xem `git log`). Nếu muốn gộp một commit duy nhất `chore(comments): standardize code comments to Vietnamese`, dùng squash tuỳ ý — ghi chú trong báo cáo tổng.

---

## Acceptance (theo spec §5)

- Cả 159 file trong phạm vi đã được đọc và xử lý (no-op hợp lệ với file không comment); báo cáo từng batch có đủ.
- Không còn câu/đoạn comment tiếng Anh sau Task 14 Step 3 (thuật ngữ trong câu VI được phép).
- `git diff` chỉ chạm file trong phạm vi + chỉ dòng comment (không sửa code/string); không thêm comment mới.
- `npm run typecheck`, `npm run lint`, `npm run build` xanh; `npm test` xanh (Task 13).
- Prettier không phát sinh lỗi mới ngoài danh sách tồn đọng đã biết.
- Báo cáo cuối liệt kê rõ tồn đọng ngoài phạm vi thay vì âm thầm bỏ qua.
