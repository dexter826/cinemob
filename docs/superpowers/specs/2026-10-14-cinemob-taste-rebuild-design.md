# CineMOB Taste Rebuild — Design Spec (Option A: Taste-full)

- **Ngày:** 2026-10-14
- **Trạng thái:** Đã duyệt 5/5 sections, chờ review file
- **Phạm vi:** Toàn bộ lớp giao diện (shell + 8 trang + modals + shared primitives). Chỉ thay trình bày, giữ nguyên route, store, service, hook, Firebase, TMDB cache, PWA.
- **Chuẩn:** design-taste-frontend v2 (tasteskill) + brainstorming superpowers workflow
- **Brand:** Bỏ hết làm mới. Deal palette/type mới hoàn toàn qua `draw.mjs`. Không giữ emerald, Inter, hay glass/neon cũ. Logo chữ CineMOB giữ lại dưới dạng wordmark text.

## 1. Art direction & tokens

- Mỗi nhóm màn là 1 section role của taste: shell, dashboard-hero, search-rails, detail-fold, management-sheet, modal.
- Chạy `draw.mjs --sector entertainment --brief CineMOB` deal 3 directions, chọn 1, deal full sheet. Adopt nguyên sheet, không blend. Redraw chỉ khi mâu thuẫn asset không tồn tại.
- Tokens duy nhất trong `src/index.css` (@theme Tailwind v4): 1 ground, 1 ink, 1 accent, fields. Mọi màn chỉ dùng tokens.
- House rules: headline ≤2 dòng mọi width; không eyebrow; không mono ngoài số liệu; không index 01/02; không hairline trang trí; không gradient (trừ scrim trên backdrop); không shadow khi nghỉ; không glass pill nav; tối đa 2 font.
- Poster/backdrop TMDB tính là ảnh thật, đạt floor 4+ ảnh/màn cinematic.
- Light mode là palette ấm riêng, không đảo màu dark.

## 2. Shell + Navigation

- Desktop: thanh phẳng (wordmark trái, 4 links giữa: Tìm kiếm, Albums, Lịch chiếu, Thống kê, account phải). Active = accent + weight, không bounce/scale.
- Mobile: bottom nav 5 tab phẳng (Trang chủ, Tìm kiếm, Albums, Lịch, Cá nhân), nền solid + hairline trên, icon Lucide + label, target ≥44px, safe-area inset.
- Layout: 1 grid, gutter 16-32px, container `max-w-7xl`, gap sections 120-220px desktop. Shell ổn định khi route load, không animate toàn màn.
- Shared primitives trong `shared/`: Button, IconButton, Dialog, Dropdown, MultiSelect, DatePicker, TimePicker, Loading, EmptyState, ErrorState, SkeletonCard, Toast, Alert. Features không tạo API generic mới.

## 3. Màn cinematic (Dashboard, Search, Movie/Person detail)

- Dashboard: hero backdrop tràn viền 1 phim (`fetchpriority=high`), headline ≤32 ký tự, 1 câu phụ + 1 nút chính. Rails ngang geometry khác hero: Đang chiếu / Thịnh hành / Sắp ra mắt + thư viện cá nhân (Vừa xem, Muốn xem).
- Search: vào thẳng rail + kết quả poster `aspect-2/3`, lazy dưới fold. Filter là rows phẳng.
- Detail: photographic fold — backdrop full-bleed + scrim fade, metadata pills phẳng, cast rail ngang, actions phẳng 1 màu fill.
- Idea: poster là vật liệu chính, phóng to/crop làm motif. Không ảnh fake.

## 4. Màn quản lý + modals

Mỗi màn 1 geometry khác nhau, không share card-grid, vẫn scan được:

- Albums/AlbumDetail: spec-sheet rows + heading + khoảng trắng, poster nhỏ, không card-in-card.
- Calendar: list theo ngày, số mono tabular-nums, 1 ảnh chủ đạo tháng.
- Stats: số liệu mono lớn làm dominant, 1 field màu bẹt cho chart.
- Profile: tên full-width close, rows phẳng.
- Modals (AddMovie, RandomPicker, AlbumSelector, MemberSearch, MovieDetail fallback): centered / bottom-sheet mobile / fullscreen-form mobile, 1 transition duy nhất, giữ aria/focus-trap hiện có, confetti chỉ RandomPicker.

## 5. Motion, states, verify

- Motion: 1 signature move từ sheet. Entrance: heading → text → picture, stagger 60-90ms, rise 16-32px + opacity, trigger 1 lần. Feedback mọi control. 1 moving picture (hero drift hoặc clip muted loop). Chỉ transform/opacity. Reduced-motion → crossfade ≤150ms. Cấm `transition-all`, `hover:scale-105` toàn cục, bounce.
- States: initial/skeleton, empty, populated, no-result, error + retry, offline, auth-fail, disabled/submitting, thiếu poster, data dị. Chữ chạy nền full ink ≥16px.
- Data flow: giữ nguyên stores/services/hooks. Poster TMDB là imagery chính. Không thêm dependency (chỉ đổi Google Fonts link nếu sheet yêu cầu).
- Verify: mỗi chặng `typecheck + lint + build` xanh. Cuối: `lint.mjs + inspect.mjs` 0 FAIL (1440/768/390), critique 3 vòng, matrix 320/375/768/1024/1440 × dark/light, test tay full flow (login, CRUD phim, random picker, albums, calendar, stats, profile).

## Non-goals

Không đổi Firestore schema, auth, rules, stores, hooks, services, PWA/sw, push scripts. Không đụng `dist/`, `dev-dist/`. Không bịa proof (quotes, stats, press).
