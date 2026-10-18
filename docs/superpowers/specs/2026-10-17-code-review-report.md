# Báo cáo Code-Review toàn bộ src/ — 7 trục (code-refactor)

**Ngày:** 2026-10-17 · **Phạm vi:** toàn bộ `src/` (~17.000 dòng, ~100 file)
**Phương pháp:** deep-read nhóm logic đậm đặc (services, stores, hooks chính, pages lớn — phần lớn đã qua tay trong các đợt refactor vừa rồi) + red-flag sweep 7 trục trên 100% file. File thuần CSS/JSX trình bày đã được review trong các đợt trước.

## Tóm tắt

Code nền **tốt**: phân lớp sạch (không có Firestore/API call nào trong .tsx UI), services có defensive mapping + timeout/abort, stores có guard race condition (pendingDeleteIds), không hard-code secret, không innerHTML/eval, error handling có log kèm ngữ cảnh. **0 BLOCKER, 2 MAJOR, 4 MINOR.**

## Blocker

Không có.

## Major

### 1. Lỗi snapshot Firestore biến thành "kho trống" — `src/features/movies/services/movie-service.ts:133-136`

**Vấn đề:** `subscribeToMovies` callback lỗi → `callback([])`.
**Vì sao:** Lỗi mạng/quyền Firestore khiến store set `movies=[], loading=false` — UI hiển thị "Chưa có phim" + EmptyState thay vì báo lỗi. Người dùng nghĩ bộ sưu tập bị mất.
**Cách sửa:** Thêm `onError` callback riêng → `movie-store` giữ state `error`; Dashboard/EmptyState phân biệt `error` vs `empty`.

### 2. Hai `catch {}` nuốt lỗi im lặng

- `src/app/providers/theme-provider.tsx:66` (localStorage parse)
- `src/features/profile/hooks/use-user-search.ts:45`

**Vì sao:** Trục 4 — lỗi bị nuốt, không log không ngữ cảnh; khi có sự cố không truy vết được.
**Cách sửa:** `console.warn` kèm ngữ cảnh + comment giải thích vì sao an toàn khi bỏ qua (private-mode localStorage, profile lookup).

## Minor

1. ~~`client.ts:44` re-export `API_KEY`~~ — **RÚT LẠI** sau khi kiểm: export hợp lệ, 2 consumer dùng thật (search-service, movie-service guard `if (!API_KEY)`).
2. **`push-notification-service.ts:5-7`** — fallback hard-code VAPID public key. Là public key (không phải secret) nên không phải blocker, nhưng key stale nếu CI đổi key mà env thiếu → bỏ fallback, `console.warn` + disable push khi thiếu env.
3. **`movie-detail-page.tsx`** — runtime xuất hiện 2 lần (meta caps đầu + dòng Clock cuối trang) — đúng loại trùng lặp thông tin như hình 2 bạn bắt. Bỏ dòng Clock cuối.
4. **File render khổng lồ**: `own-profile-editor.tsx` (507), `add-movie-modal.tsx` (466), `date-picker.tsx` (412), `use-add-movie-form.ts` (389) — nhiều trạng thái nội bộ trong 1 hàm render/hook. Tách subcomponent/hook **khi chạm tới lần tới** (không tách ồ ạt trong đợt này — rủi ro regression cao hơn lợi ích).

## Nit (tùy chọn)

- Log console.error tiếng Anh trộn UI tiếng Việt — thống nhất một ngôn ngữ log (khuyến nghị tiếng Anh cho log, giữ tiếng Việt cho UI).
- `mapDocToMovie` fallback `watched_at ?? new Date()` — im lặng gán "bây giờ" cho dữ liệu hỏng; nên `?? ''` + nơi hiển thị tự xử lý.

## Đã kiểm và SẠCH (đáng ghi nhận)

- Phân lớp: 0 call Firestore/API trong tầng UI (`grep addDoc|updateDoc|collection(` trong *.tsx = 0).
- `tmdb/client.ts`: timeout 10s + AbortSignal.any + decoder validation + concurrency limiter `withLimit` — viết đúng.
- `movie-store`: optimistic delete với `pendingDeleteIds` chặn race với snapshot.
- `movie-service.deleteMovie`: guard batch 499 albums + batch atomic.
- Không hard-code secret (keys từ `import.meta.env`; VAPID là public key).
- Không `dangerouslySetInnerHTML`/`eval`; `window.open` có `noopener`.

## Ủu tiên xử lý

1. Major #1 (snapshot error → error state) — ảnh hưởng trực tiếp nhận thức "mất dữ liệu".
2. Major #2 (2 empty catch).
3. Minor 1-3 (5 phút).
4. Minor 4 (tách file lớn) — để đợt chạm tới từng file.
