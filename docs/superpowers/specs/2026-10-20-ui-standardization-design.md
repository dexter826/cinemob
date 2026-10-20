# Chuẩn hoá toàn bộ UI CineMOB theo DESIGN.md

Ngày: 20/10/2026. Trạng thái: thiết kế và spec đã được người dùng duyệt; Phase 0-1 đã hoàn tất, Phase 2-6 chưa.

## 1. Mục tiêu và phạm vi

- Audit ngày 20/10/2026 đối chiếu code với `DESIGN.md`, phát hiện lệch ở token, typography, radius, elevation, component, icon, focus, motion và loading.
- Mục tiêu: đưa code khớp `DESIGN.md`; `DESIGN.md` là nguồn chuẩn duy nhất.
- Spec này gộp motion 2026-10-18 và loading 2026-10-18; xoá 2 spec + 2 plan cũ; giữ `docs/loading-audit-2026-10-18.md` làm bằng chứng.
- Phạm vi: toàn bộ phần tĩnh (colors, typography, spacing, radius, elevation, components, icons, imagery, focus) + motion + loading; áp dụng theo phase.
- Không redesign layout/IA/copy; không đổi business logic, API, schema, dependency; không thêm tính năng.
- Verify: không test tự động, không browser; chỉ prettier, typecheck, lint, build, grep/diff và rà source.
- Hoàn tất khi mọi dòng ma trận §4 là “đã sửa” hoặc “ngoại lệ có tên”; `DESIGN.md` đã cập nhật; docs cũ đã xoá; gate §8 pass; báo cáo cuối phân biệt rõ phần chưa kiểm chứng runtime.

## 2. Nguồn chuẩn, quyết định và ngoại lệ

### 2.1 Quyết định đã chốt

1. Gộp toàn bộ static + motion + loading vào một spec.
2. Xoá 2 spec và 2 plan cũ.
3. Áp dụng toàn bộ lệch, theo phase.
4. Verify không test, không browser.
5. Ngoại lệ có tên cho 404/splash.
6. Chuẩn hoá typography bằng utility class.
7. Spec theo ma trận tuân thủ + phase.

### 2.2 Thứ tự ưu tiên nguồn

- `DESIGN.md` > spec này > code hiện tại. Nếu spec mâu thuẫn `DESIGN.md`, sửa spec.
- `src/index.css` là baseline implementation; khi lệch, sửa code theo `DESIGN.md`.
- Thay đổi token màu phải cập nhật đồng thời YAML, bảng Colors trong `DESIGN.md` và `src/index.css`; token khác cập nhật `src/index.css` và mục `DESIGN.md` tương ứng.

### 2.3 Ngoại lệ có tên

| Ngoại lệ                   | Phạm vi                       | Ghi chú                                                      |
| -------------------------- | ----------------------------- | ------------------------------------------------------------ |
| 404                        | 72/96px                       | `text-display-404`; không thuộc 8 utility                    |
| Splash wordmark            | Anton, kích thước brand       | không tính vào type scale                                    |
| Logo symbol                | `strokeWidth` 3               | `cinemob-symbol.tsx`                                         |
| Picker chevron             | `strokeWidth` 2.5             | `picker-wheel.tsx`                                           |
| Micro-spacing              | 2/6/10px cho căn icon/chữ     | không dùng cho layout; layout vẫn theo thang 4/8/…           |
| Pagination/toolbar compact | 36/40px                       | form control vẫn 44px; icon-button theo 32/40/48             |
| Poster selected overlay    | check trắng trên `primary/25` | media overlay, không phải nền primary đặc                    |
| `text-faint`               | decorative/large              | token giữ, không dùng cho nội dung cần đọc                   |
| `micro-caps` normal-case   | metadata số/ngày              | mặc định utility uppercase; metadata được phép `normal-case` |
| Chart axis                 | 10px/700/50%                  | nhãn trục Recharts; ngoại lệ data-viz                        |

Mọi ngoại lệ mới phải được thêm vào `DESIGN.md` trước khi áp dụng.

## 3. Kiến trúc chuẩn hoá

### 3.1 Typography utility

Thêm 8 utility trong `src/index.css` (Tailwind v4 `@utility`) theo bảng Typography của `DESIGN.md`:

| Utility           | Font           | Size | Weight | Line-height | Tracking | Uppercase |
| ----------------- | -------------- | ---- | ------ | ----------- | -------- | --------- |
| `text-display-xl` | Anton          | 48px | 400    | 1.0         | .025em   | không     |
| `text-display-lg` | Anton          | 36px | 400    | 1.05        | .025em   | không     |
| `text-title-lg`   | Be Vietnam Pro | 20px | 700    | 1.3         | 0        | không     |
| `text-title-md`   | Be Vietnam Pro | 18px | 700    | 1.35        | 0        | không     |
| `text-body`       | Be Vietnam Pro | 14px | 500    | 1.5         | 0        | không     |
| `text-body-sm`    | Be Vietnam Pro | 12px | 500    | 1.5         | 0        | không     |
| `text-label-caps` | Be Vietnam Pro | 11px | 600    | 1.2         | .1em     | có        |
| `text-micro-caps` | Be Vietnam Pro | 9px  | 700    | 1.2         | .06em    | có        |

- `display-xl` responsive: detail 30 → 36 → 48; stat modifier `text-display-stat` 48 → 60.
- `display-lg` responsive: 24 → 30 → 36.
- `text-display-404` cho 404: 72 → 96.
- Feature code không dùng `text-[…px]`, `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/9xl` cho size; chỉ dùng 8 utility và modifier có tên.
- Display dùng title case như hiện tại; chỉ `label-caps`/`micro-caps` uppercase.
- Weight emphasis 600/700 được phép; không đổi size.
- `tabular-nums` giữ cho số liệu; `text-wrap: balance/pretty` giữ theo `DESIGN.md`.
- `micro-caps` mặc định uppercase; metadata số/ngày được phép `normal-case`.
- Chart axis Recharts dùng 10px/700/50% theo `DESIGN.md`; là ngoại lệ data-viz, không dùng utility.

### 3.2 Token và utility khác

- `--color-warning`: light `#9a5d06`, dark `#fbbf24` (giữ nguyên).
- `focus-ring`: outline 2px `--color-focus`, offset 3px, hiện tức thì; thay toàn bộ `focus-visible:ring-1` cục bộ. Underline field giữ ngoại lệ border-bottom theo `DESIGN.md`.
- Radius: dùng token `rounded-control`/`rounded-card`/`rounded-dialog` (8) và `rounded-poster` (4); `rounded-md` (6) bị cấm; `rounded-lg` thô thay bằng token ngữ nghĩa; `rounded-full` cho pill/avatar/slider track.
- Elevation: không shadow; `switch` bỏ `shadow`; các token `--shadow-*` bằng 0 giữ nguyên vì không tạo bóng.
- Icon: Lucide `strokeWidth=1.5` toàn bộ; active nav 2; ngoại lệ logo/picker; không để mặc định (2) hoặc `undefined`.
- Imagery: `<img>` có width/height hoặc aspect wrapper; lazy-load; poster above-fold `fetchpriority="high"`; fallback một lần, không vòng lặp `onError`.
- `--ease-standard/enter/exit`, `--animate-page-enter`, `--color-skeleton` đã có; phase 1 chỉ verify, không thêm lại.

### 3.3 Nguyên tắc sửa

- Sửa tại nguồn: token/utility ở `index.css`; primitive ở `src/shared/components/ui`; pattern ở feature.
- Không sao chép style mới vào feature nếu primitive đã có.
- Mọi thay đổi phải giữ hành vi focus/keyboard hiện có; không đổi layout/IA/copy.

## 4. Ma trận tuân thủ

| Nhóm       | Bằng chứng hiện tại                                                               | Đích                                                                  | Loại              | Phase   |
| ---------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------- | ------- |
| Colors     | warning light `#a16207`; dark `#fbbf24` đúng; 2 chỗ `text-white` trên primary đặc | `#9a5d06`; dark `#fbbf24` giữ; `text-on-primary`                      | Sửa               | 1, 3    |
| Typography | 36 size thô; 11.5 nav, 10 footer/filter/meta, 11 title/button, 15 body            | 8 utility + modifier; caps 9/11; body 12/14; chart axis 10px ngoại lệ | Sửa               | 1, 3    |
| Spacing    | layout đúng scale; micro 2/6/10                                                   | giữ micro; layout theo thang; không sweep                             | Đạt/ngoại lệ      | —       |
| Radius     | 5 `rounded-md` (6px); 25 `rounded-lg` thô                                         | token 4/8; media/checkbox nhỏ → 4; skeleton → 8                       | Sửa/token hygiene | 1, 3    |
| Elevation  | `switch` còn `shadow`; shadow token đều 0                                         | bỏ shadow; token 0 giữ                                                | Sửa               | 2       |
| Components | button sm 11, poster/album title 11, tag 6, dialog X 1.8, focus ring 1px          | theo `DESIGN.md` §Components                                          | Sửa               | 2, 3    |
| Icons      | 1.8 / 2 / undefined / 2.5                                                         | 1.5; active nav 2; logo 3; picker 2.5                                 | Sửa/ngoại lệ      | 2, 3    |
| Imagery    | chưa xác nhận thiếu width/height                                                  | rà `<img>`; bổ sung nếu thiếu                                         | Verify            | 3       |
| Focus      | 17 chỗ `focus-visible:ring-1`; switch/action thiếu                                | `focus-ring` 2px, offset 3px                                          | Sửa               | 1, 2, 3 |
| Motion     | token/route/overlay/LazyDialog phần lớn đã áp dụng; 23 `duration-*` cần phân loại | 120/150/200/250; bảng overlay §5                                      | Verify/sửa        | 4       |
| Loading    | L01–L17 theo audit 18/10                                                          | bảng trạng thái + luật theo flow §6                                   | Verify/apply      | 5       |
| Docs       | 2 spec + 2 plan cũ                                                                | spec mới; xoá cũ; cập nhật `DESIGN.md`                                | Docs              | 0       |

Ghi chú:

- 5 `rounded-md`: multi-select tag → `rounded-poster` (4); skeleton line → `rounded-control` (8).
- 25 `rounded-lg` đúng 8px nhưng dùng class thô; thay token ngữ nghĩa, không đổi hình học; thumbnail poster và checkbox nhỏ dùng 4.
- Poster selected check nằm trên overlay ảnh `primary/25`, giữ trắng làm ngoại lệ media; chỉ 2 chỗ nền primary đặc đổi `on-primary`.
- Motion đã vượt spec cũ ở token, route, LazyDialog, overlay; phase 4 chỉ còn sweep `duration-200` micro, verify bảng overlay và dọn dead code.

## 5. Motion (hợp nhất)

### 5.1 Token và constants

- `--ease-standard/enter/exit` đã có trong `index.css`; `MOTION_DURATION`, `MOTION_EASING`, `getMotionTransition` đã đúng. Phase 4 verify, không thêm lại.
- Thang 120/150/200/250; mặc định 150; chỉ khai báo duration khi khác base.
- Tailwind `transition-*` mặc định 150; `duration-200` chỉ cho role medium; `duration-250` cho role slow/progress; không có 300/500/75.

### 5.2 Bảng overlay (normative)

| Lớp                     | Enter                                  | Exit                        | Cơ chế                   |
| ----------------------- | -------------------------------------- | --------------------------- | ------------------------ |
| Dialog — backdrop       | fade 200, ease-enter                   | fade 150, ease-exit         | framer                   |
| Dialog — panel          | fade + y8 200, ease-enter              | fade + y8 150, ease-exit    | framer                   |
| Sheet — panel           | trượt đáy y 100%→0, 250, ease-enter    | trượt xuống, 200, ease-exit | framer                   |
| Sheet — backdrop        | fade 250                               | fade 200                    | framer                   |
| Dropdown / MultiSelect  | fade + y4 hướng panel, 120, ease-enter | fade 120, ease-exit         | framer + AnimatePresence |
| Suggestions             | như dropdown, 120                      | 120                         | framer                   |
| Popover                 | fade + y4, 120                         | 120                         | framer                   |
| Menu tài khoản (navbar) | fade + y4, 120                         | 120                         | framer                   |
| Toast                   | fade + y8, 200, ease-enter             | fade + y8, 150, ease-exit   | framer                   |
| Route                   | fade + y8, 200, ease-enter             | — (chủ ý không có exit)     | CSS `motion-safe`        |

### 5.3 Engine và reduced motion

- Framer chỉ cho overlay enter/exit, `layoutId` (tab underline), stagger, toast; hover/focus/micro và route enter là CSS + token.
- `useReducedMotion` cho component framer; CSS dùng `motion-safe:`; global reduce rule giữ.
- Splash, confetti, picker, charts: đặc thù, gate reduced-motion; không đổi timing.

### 5.4 Việc còn lại ở phase 4

- Sweep `duration-200` micro hover về default 150; giữ 200 cho poster/album zoom, dialog/toast enter, route enter, sheet exit; dialog/toast exit 150. Giữ `duration-250` cho progress/slow.
- Verify bảng overlay với từng lớp code; LazyDialog đã sửa (`shouldRender` + `onExitComplete`), giữ nguyên.
- Xoá dead code nếu còn (`--animate-slide-in-right`/`slide-down`/`fade-in`/`splash-rule`, `layoutId` poster, helper cũ); hiện đã sạch, verify lại.
- Kiểm tra `duration-200`/`duration-250` có được Tailwind sinh; nếu không, dùng token hoặc giá trị tương đương.

## 6. Loading (hợp nhất)

### 6.1 Quy tắc trạng thái dữ liệu

Mỗi vùng dữ liệu phải phân biệt: chưa có dữ liệu hợp lệ, đang tải, thành công có dữ liệu, thành công rỗng, lỗi. Một kết quả chỉ hợp lệ với đúng user và tham số đã tạo ra nó; request cũ không được cập nhật data/error/loading của request mới.

| Trường hợp                                       | Hành vi đã chọn                                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Lần đầu tải nội dung có bố cục biết trước        | Skeleton theo vùng; shell và phần độc lập vẫn dùng được                                                   |
| Cùng ngữ cảnh, đang refresh và có dữ liệu hợp lệ | Giữ nội dung, báo “Đang cập nhật…” cục bộ; thất bại giữ data cũ kèm thông báo chưa cập nhật được và retry |
| Sang query/filter/page/month/profile/user khác   | Không trình bày data ngữ cảnh cũ như kết quả mới; vùng mới có skeleton/loading của nó                     |
| Đọc thành công trả rỗng/không tồn tại            | Empty/not-found đúng ngữ cảnh; chỉ xuất hiện sau khi các nguồn bắt buộc đã đọc thành công                 |
| Đọc lỗi, chưa có dữ liệu                         | ErrorState với nút thử lại ở vùng liên quan; không để skeleton tiếp tục vô hạn                            |
| Request hủy vì ngữ cảnh đã đổi hoặc unmount      | Không toast lỗi; pending của request bị bỏ không còn điều khiển UI                                        |
| Lọc/sort dữ liệu đã có trong máy                 | Cập nhật trực tiếp, không dựng loading mạng giả                                                           |

Không dùng timeout tùy tiện để coi Firestore offline là danh sách rỗng hoặc lỗi terminal; giữ cache/reconnect của Firebase và xử lý lỗi terminal qua callback lỗi.

### 6.2 Luật theo flow

- **Auth, startup, modal lazy:** auth chưa xác định có khung thương hiệu “Đang xác thực…”, lỗi có retry, không trả null trống; không giữ splash 1.500ms. Sau auth, navbar/footer/navigation ổn định trong khi route tải collection. Route chunk chờ có Loading local trong main; route đã mount đang tải data dùng skeleton theo layout. Modal lazy có shell tiêu đề + status + đóng; đóng trước khi chunk xong không mở lại; chunk lỗi có retry/đóng qua ErrorBoundary.
- **Search, discovery, AI, person:** mode theo state/params (search/discover/home), không suy từ độ dài results. Discover thành công `[]` hiện “Không có phim khớp bộ lọc” và xóa lọc, không hiện AI/trending thay kết quả lọc. Clear filter/query, submit, đổi mode phải bỏ pending/error cũ; response cũ không khôi phục. AI/trending lần đầu skeleton vùng riêng; refresh giữ cards, khóa nút, báo cập nhật cục bộ; lỗi có retry, không xóa nội dung cũ. Person detail skeleton profile + grid; lỗi có ErrorState/retry; not-found chỉ khi không tồn tại.
- **Hồ sơ:** readiness tách khỏi `profile === null`; null sau read thành công nghĩa chưa có hồ sơ, được phép bắt đầu điền; lỗi read thì không cho sửa từ bản rỗng. Edit/save/toggle phải đợi read thành công; guard ở UI và handler. Draft chỉ khởi tạo từ snapshot đã đọc thành công; response muộn không đè thao tác đang nhập. Public profile lỗi không coi là not-found; danh sách phim nhận loading/error của collection, chỉ kết luận rỗng khi đủ nguồn thành công.
- **Movie form/detail:** khởi tạo form cần TMDB có skeleton nền, disable lưu, handler từ chối khi thiếu dữ liệu; lỗi có retry/đóng và giữ input; form thêm thủ công không phụ thuộc TMDB. Edit phim giữ form khi refresh tiến độ TV; chỉ vùng season/episode pending; disable điều khiển/lưu phụ thuộc; không ghi đè field đã sửa; lỗi giữ snapshot đã lưu + retry, chặn lưu nếu snapshot không đủ validation. Movie detail lần đầu dùng layout poster + thông tin; collection lỗi có ErrorState/retry; đọc thành công không tìm thấy mới not-found; extras loading trong vùng extras.
- **Album và mutations:** list/detail subscription có callback lỗi, pending kết thúc ở lỗi terminal; retry tái đăng ký listener và hủy listener cũ; list retry qua nguồn album chung của app-init, không tạo subscription song song. Album header có thể hiện trước; grid chờ cả album và movie collection; chỉ báo trống khi cả hai thành công và phép kết hợp rỗng. Thêm/gỡ phim dùng pending theo `docId`, disable thao tác lặp, giữ item khác dùng được; phản ánh qua subscription; lỗi/đổi scope giải phóng pending đúng item; giữ undo-toast 7s; không optimistic.
- **Calendar, stats, random picker:** grid dùng cùng cách tính số ô ở pending và loaded; grid/list/totals chia sẻ scope và trạng thái; pending hiển thị placeholder cho total, lỗi hiển thị “Chưa tải được” hoặc dấu gạch kèm thông báo, không dùng 0; đổi tháng không giữ số liệu tháng trước. Stats/calendar truyền lỗi collection và có retry; stats lọc năm trên data local không thêm skeleton/delay. Picker dùng spinner có text khi tải pool; thành công rỗng khác lỗi; lỗi có retry trong modal và đóng luôn hoạt động; watchlist hợp lệ dùng ngay, không đợi trending.
- **Button, upload, ảnh:** `Button loading` disable thao tác và dùng spinner trang trí chung; nhãn pending do caller truyền; spinner thay leading icon, không hiển thị hai icon chờ; rà caller để bỏ spinner tự dựng trùng. Nút icon-only giữ accessible name diễn đạt hành động và trạng thái. Poster/album image giữ aspect ratio và lazy loading; URL lỗi dùng fallback một lần, không vòng lặp `onError`, không thay card bằng skeleton; không thêm `onLoad` state/animation riêng; avatar fallback giữ.

### 6.3 Hình thức và accessibility

- `SkeletonCard` khớp `PosterCard`; primitive skeleton dùng chung cho màu, radius, pulse; composition ở feature; skeleton token tham chiếu palette, không hex trong TSX.
- Skeleton và content chia sẻ breakpoint, số cột, gap, chiều rộng poster, cách tính số hàng.
- `Loading` chỉ biểu diễn trạng thái; mặc định local, fullscreen chỉ auth/bootstrap; không side effect global `isPageLoading` từ primitive; footer/navigation thuộc layout readiness.
- Một vùng đang tải có một status ngắn và `aria-busy` khi phù hợp; skeleton/spinner trang trí `aria-hidden`; không lồng nhiều `role=status`; live status nằm ngoài vùng `aria-busy`; kết quả tìm kiếm thông báo số kết quả.
- Reduced motion giữ placeholder tĩnh và text/status; không dời focus khi dữ liệu tải xong; modal giữ focus trong dialog.

### 6.4 Việc còn lại ở phase 5

- Đối chiếu L01–L17 trong `docs/loading-audit-2026-10-18.md` với code; sửa phần còn thiếu; giữ hành vi đã đúng.
- Không thêm test, mock, fixture, dependency test; không mở browser; báo cáo source-level.

## 7. Thứ tự triển khai

- **Phase 0 — Docs:** viết spec này; xoá 2 spec + 2 plan cũ; cập nhật `DESIGN.md` (tên utility, ngoại lệ, chart axis, warning light). Verify: file cũ không còn, link trong `DESIGN.md` đúng.
- **Phase 1 — Foundation:** thêm 8 utility + `text-display-stat`/`text-display-404`; `focus-ring`; warning light (dark giữ `#fbbf24`); radius token mapping. Verify: build, typecheck, lint, grep token.
- **Phase 2 — Shared primitives:** Button, TextField, SearchField, Dropdown, MultiSelect, Date/Time, Switch, Dialog, Toast, Pagination, Chip, Skeleton, PosterCard/AlbumCard. Sửa button sm 12, tag radius 4, switch shadow, dialog X 1.5, focus-ring, icon 1.5, on-primary. Verify: source + build.
- **Phase 3 — Static sweep toàn app:** navbar/footer/mobile nav, stats, movie detail, album, profile, add-movie, filters, search/person, calendar. Thay size thô bằng utility; icon 1.5; focus-ring; on-primary; ảnh width/height. Verify: matrix grep.
- **Phase 4 — Motion:** sweep `duration-200`; verify bảng overlay; dead code; constants. Verify: grep duration + source.
- **Phase 5 — Loading:** đối chiếu L01–L17; sửa flow; primitive. Verify: source; không test/browser.
- **Phase 6 — Final verify:** prettier, typecheck, lint, build; gate §8; báo cáo.

Mỗi phase chạy `npx prettier --write` trên file đã sửa, rồi typecheck, lint, build; review diff trước khi sang phase sau.

## 8. Verify và tiêu chí hoàn tất

### 8.1 Commands

- `npx prettier --write` file đã sửa.
- `npm run typecheck`.
- `npm run lint`.
- `npm run build`.

### 8.2 Gate grep

Dùng `git grep` hoặc grep trong `src/`; các mục sau phải đạt:

- `rounded-md` → 0.
- `text-\[[0-9.]+px\]` → 0 ngoài class modifier có tên.
- Chart axis Recharts 10px là ngoại lệ; kiểm tra inline `fontSize: 10` riêng.
- `#a16207` → 0; dark `#fbbf24` là giá trị đúng, không thay.
- `focus-visible:ring-1` → 0.
- `strokeWidth={1.8` → 0; `strokeWidth={undefined` → 0; `strokeWidth={2` chỉ active nav; `2.5` chỉ picker; `3` chỉ logo.
- `duration-300` → 0; `duration-200` chỉ role medium; `duration-250` chỉ role slow/progress.
- `text-white` trên `bg-primary` đặc → 0 (rà tay).
- `text-faint` chỉ decorative/large (rà tay).
- `rounded-lg` thô → 0 (đã thay token).

### 8.3 Source review

- Mỗi phase rà diff cho hành vi focus/keyboard, overlay enter/exit, loading state; không tuyên bố runtime.
- Báo cáo cuối phân biệt “đã sửa theo source” với “chưa kiểm chứng runtime”; không tuyên bố đạt WCAG hoặc đã đo visual.

### 8.4 Stop condition

- Mọi dòng §4 là đã sửa hoặc ngoại lệ có tên.
- `DESIGN.md` đã cập nhật; docs cũ đã xoá.
- Gate §8.2 pass; commands §8.1 pass.
- Không còn pending treo, lỗi giả empty, primitive sai trong phạm vi đã đụng.

## 9. Tài liệu thay thế và cập nhật DESIGN.md

### 9.1 File mới

- `docs/superpowers/specs/2026-10-20-ui-standardization-design.md` (file này).

### 9.2 File xoá

- `docs/superpowers/specs/2026-10-18-motion-standard-design.md`
- `docs/superpowers/specs/2026-10-18-loading-consistency-design.md`
- `docs/superpowers/plans/2026-10-18-motion-standard.md`
- `docs/superpowers/plans/2026-10-18-loading-consistency.md`

### 9.3 File giữ

- `docs/loading-audit-2026-10-18.md` (bằng chứng L01–L17).
- `DESIGN.md` (cập nhật, không thay thế).

### 9.4 Cập nhật DESIGN.md

- Thêm vào Implementation Notes: tên 8 utility + `text-display-stat`/`text-display-404`; luật không dùng font-size thô.
- Thêm ngoại lệ §2.3 vào đúng mục (Colors, Typography, Spacing, Components, Iconography, Accessibility).
- Đảm bảo `index.css` dùng warning light `#9a5d06`; dark `#fbbf24` giữ nguyên (đã khớp YAML/bảng).
- Không thêm đường dẫn spec/plan vào `DESIGN.md`; file này chỉ chứa quy chuẩn thiết kế.

## 10. Ngoài phạm vi và rủi ro

### 10.1 Ngoài phạm vi

- Không redesign layout/IA/copy; không đổi logic/API/schema/dependency; không thêm test runner; không mở browser.
- Không quét thay raw black/white hợp lệ (ghost hover, scrim, overlay, switch knob).
- Không xoá `text-faint`; không sửa nội bộ Recharts; không đổi timing picker/confetti/splash ngoài gate reduced-motion.
- Không refactor lân cận ngoài diff.

### 10.2 Rủi ro

- Thay đổi thị giác có chủ đích: button sm 11→12, poster/album title 11→12, nav 11.5→11, footer 10→9, tag 6→4, warning light `#a16207`→`#9a5d06`.
- Motion/loading apply nhiều file; phase order giảm rủi ro.
- Không browser: lệch visual có thể lọt; báo cáo rõ.
- Xoá docs cũ mất chi tiết tại chỗ; git history và loading audit bù.
