# UI Standardization Phase 5 — Loading

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đối chiếu L01–L17 của `docs/loading-audit-2026-10-18.md` với code hiện tại và sửa các phần còn lệch. Không thêm test/mock/dependency, không mở browser.

**Architecture:** Loading đã được chuẩn hoá phần lớn từ 2026-10-18. Phase này là **verify + vá lỗ hổng**: 14/17 mục đã đúng, 3 mục còn lệch, 0 mục thiếu. Không refactor lại luồng loading; chỉ sửa 7 file, 8 điểm.

**Tech Stack:** React 19.2, TypeScript ~5.8.2, Vite 6.2, Tailwind CSS 4.1.17, zustand, firestore, Prettier 3.9.9.

**Spec nguồn:** `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` §6 (luật trạng thái, luật theo flow, hình thức & accessibility). Audit: `docs/loading-audit-2026-10-18.md` (L01–L17).

## Kết quả đối chiếu (2026-10-20)

| Trạng thái | Mục                                                                  | Số lượng |
| ---------- | -------------------------------------------------------------------- | -------- |
| DONE       | L01, L02, L03, L04, L07, L09, L10, L11, L12, L13, L14, L15, L16, L17 | 14       |
| PARTIAL    | L05, L06, L08                                                        | 3        |
| MISSING    | —                                                                    | 0        |

## Global Constraints

- Chỉ sửa 7 file nêu ở Task 1. Không sửa store/hook/service, không đổi API, schema, dependency.
- Không chạy test runner, không mock, không mở browser.
- Không commit, không stage, không push.
- Không dùng PowerShell để sửa file nguồn (hỏng UTF-8); dùng công cụ `edit`.
- Giữ nguyên mọi hành vi đã đúng; không thêm toast mới, không thêm delay/skeleton giả.
- Một vùng đang tải chỉ có **một** thông báo; live status nằm ngoài vùng `aria-busy`.
- Sau mỗi task: Prettier → typecheck → lint → build → rà diff → đánh dấu checkbox bằng **công cụ edit**.
- Sau mỗi task: review 7 trục (code-refactor, chế độ A) + ghi vào `docs/ui-standardization-progress-2026-10-20.md`.

---

## Task 1: Vá 8 điểm lệch

**Files:**

- Modify: `src/features/profile/components/user/member-search-modal.tsx` (L06)
- Modify: `src/features/search/components/random-suggestions-section.tsx` (L08 ×2)
- Modify: `src/features/search/pages/person-detail-page.tsx` (L05)
- Modify: `src/app/index.tsx` (L11)
- Modify: `src/features/albums/components/album-selector-modal.tsx` (L09)
- Modify: `src/features/movies/pages/movie-detail-page.tsx` (L09)
- Modify: `src/features/calendar/components/calendar-stats.tsx` (L12)

- [x] **Step 1: L06 — lỗi tìm thành viên phải là ErrorState có retry**

`member-search-modal.tsx`: nhánh `error` đang dùng `EmptyState` (đọc như "không tìm thấy ai") → đổi sang `ErrorState` kèm nút thử lại gọi lại `submit()`.

```diff
- import EmptyState from '@/shared/components/ui/empty-state';
+ import { ErrorState } from '@/shared/components/ui/error-state';
...
-          <EmptyState
+          <ErrorState
             compact
             className="flex-1"
             title="Không tải được danh sách"
             description="Không tải được danh sách thành viên. Thử lại."
+            retry={{ label: 'Thử lại', onClick: () => void submit() }}
           />
```

`EmptyState` không còn được dùng trong file → xoá import (không để import thừa).

- [x] **Step 2: L08 — refresh lỗi vẫn giữ card, kèm thông báo + retry**

`random-suggestions-section.tsx`: khi `error` có mặt **và** đã có card, hiện thông báo cục bộ + nút thử lại, không xoá card.

```diff
+      {error && movies.length > 0 && (
+        <div role="status" className="mb-3 flex items-center gap-2 text-body-sm text-danger">
+          <span>Không cập nhật được gợi ý mới.</span>
+          <button
+            type="button"
+            onClick={onRefresh}
+            className="font-bold text-primary hover:underline cursor-pointer"
+          >
+            Thử lại
+          </button>
+        </div>
+      )}
```

Đặt ngay sau khối header, trước nhánh `isInitialLoading`.

- [x] **Step 3: L08 — dùng spinner primitive chung thay `animate-spin` tự dựng**

```diff
-          <RotateCcw
-            size={16}
-            strokeWidth={1.5}
-            aria-hidden="true"
-            className={isLoading ? 'animate-spin' : undefined}
-          />
+          {isLoading ? (
+            <Spinner size={16} className="text-current" />
+          ) : (
+            <RotateCcw size={16} strokeWidth={1.5} aria-hidden="true" />
+          )}
```

Thêm import `Spinner` từ `@/shared/components/ui/spinner`.

- [x] **Step 4: L05 — skeleton grid của person phải khớp content grid**

`person-detail-page.tsx` đang là `lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5`; content ở `person-movie-section.tsx` là `lg:grid-cols-6 gap-3.5` → sửa skeleton cho khớp:

```diff
-            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
+            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
```

- [x] **Step 5: L11 — route chunk chờ bằng Loading local trong main**

`app/index.tsx`:

```diff
-        <Suspense fallback={<Loading fullScreen={false} contain />}>
+        <Suspense fallback={<Loading text="Đang tải trang…" />}>
```

Bỏ biến thể `contain` (overlay phủ toàn trang) theo §6.2 "Route chunk chờ có Loading local trong main".

- [x] **Step 6: L09 — album selector chỉ có một thông báo pending**

`album-selector-modal.tsx`: `Loading` đã tự hiện "Đang tải…" và còn thêm `<p>Đang tải album…</p>` → gộp:

```diff
-            <Loading size={40} fullScreen={false} />
-            <p className="text-body-sm font-semibold text-text-secondary">Đang tải album…</p>
+            <Loading size={40} text="Đang tải album…" fullScreen={false} />
```

- [x] **Step 7: L09 — vùng extras đang tải cần trạng thái cho trình đọc màn hình**

`movie-detail-page.tsx`:

```diff
-          {extrasLoading ? (
-            <SectionHeader className="mt-7">Đang tải diễn viên…</SectionHeader>
+          {extrasLoading ? (
+            <div role="status" aria-busy="true">
+              <SectionHeader className="mt-7">Đang tải diễn viên…</SectionHeader>
+            </div>
```

- [x] **Step 8: L12 — số liệu lỗi phải kèm chú thích**

`calendar-stats.tsx`: thêm dòng chú thích dưới dải số liệu khi có lỗi (không lặp lại message vốn đã hiện ở trang, không thêm `role="status"` để tránh hai live region):

```diff
+      {episodesError && (
+        <p className="-mt-4 mb-6 sm:-mt-6 sm:mb-8 text-body-sm text-danger">
+          Số liệu tập chưa tải được.
+        </p>
+      )}
```

- [x] **Step 9: Format, typecheck, lint, build**

```powershell
npx prettier --write src/features/profile/components/user/member-search-modal.tsx src/features/search/components/random-suggestions-section.tsx src/features/search/pages/person-detail-page.tsx src/app/index.tsx src/features/albums/components/album-selector-modal.tsx src/features/movies/pages/movie-detail-page.tsx src/features/calendar/components/calendar-stats.tsx
npm run typecheck
npm run lint
npm run build
```

- [x] **Step 10: Rà diff**

Đọc lại diff của 7 file: không đổi logic/store/hook; không thêm request; lỗi vẫn giữ dữ liệu cũ; không có hai live status lồng nhau; mọi thông báo mới có nhãn tiếng Việt rõ ràng.

- [x] **Step 11: Review 7 trục + cập nhật log**

- [x] **Step 12: Dừng, không commit**

---

## Task 2: Verify toàn phase + đối chiếu lại L01–L17

- [x] **Step 1: Gate**

```powershell
git grep -n -E "role=\"status\"|aria-busy" -- src/features/profile/components/user/member-search-modal.tsx src/features/search/components/random-suggestions-section.tsx src/features/movies/pages/movie-detail-page.tsx src/features/calendar/components/calendar-stats.tsx
git grep -n "EmptyState" -- src/features/profile/components/user/member-search-modal.tsx
git grep -n "contain" -- src/app/index.tsx
git diff --check
git status --short
git diff --stat
```

Expected: `member-search-modal.tsx` không còn dùng `EmptyState`; `app/index.tsx` không còn `contain`; `git diff --check` sạch; chỉ 7 file được đổi.

- [x] **Step 2: Rà lại 3 mục PARTIAL**

Xác nhận sau khi vá: L05 (skeleton khớp content), L06 (lỗi có retry), L08 (refresh lỗi có thông báo + retry, spinner dùng primitive chung) → chuyển sang DONE trong log.

- [x] **Step 3: Review 7 trục toàn phase + cập nhật log**

- [x] **Step 4: Dừng, không commit**

Báo diff, gate, kết quả build và review. Không chạy `git add`, `git commit` hay `git push`. Phase 6 (final verify) sẽ có plan riêng.
