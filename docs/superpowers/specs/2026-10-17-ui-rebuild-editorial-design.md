# CineMOB — Đập đi xây lại toàn bộ UI theo hướng "Editorial Print"

**Ngày:** 2026-10-17 · **Trạng thái:** Đã duyệt bởi chủ dự án (mockup 5 cảnh + tổng kết) · **Design system:** [design-system/cinemob/MASTER.md](../../../design-system/cinemob/MASTER.md) là nguồn sự thật cho tokens/màu/font — tài liệu này mô tả phạm vi, IA và tiêu chí nghiệm thu.

---

## 1. Ý định & lý do

CineMOB là PWA quản lý bộ sưu tập phim cá nhân (React 19 + Vite + Tailwind v4, react-router v7, Zustand, Firebase auth Google-only, dữ liệu TMDB). Chủ dự án muốn **đập đi xây lại toàn bộ lớp giao diện** vì:

1. Giao diện nhàm chán (emerald admin-dashboard), thiếu chất điện ảnh.
2. Muốn cảm giác hiện đại, chuyên nghiệp để demo/mở cho người khác.
3. Tổ chức màn hình chưa tiện.

**Kết quả mong muốn:** một UI mang "diện mạo in ấn / editorial" (tham chiếu Mubi, Criterion) — flat tuyệt đối, typography làm hero, poster là nguồn màu duy nhất. Hai vòng duyệt mockup đầu (Liquid Glass, rồi "Rạp chiếu đêm") đã bị loại vì mang dấu hiệu thiết kế AI cliché (gradient khí quyển, glow, bóng mềm) — những thủ pháp đó bị **cấm rõ ràng** (xem Anti-goals).

## 2. Goals / Non-goals / Anti-goals

**Goals**
- Toàn bộ màn hình + modal (8 routes, 5 modal, login, 404) mang đúng ngôn ngữ Editorial Print theo MASTER.md.
- IA mới: chi tiết phim thành trang riêng `/movie/:id`; dashboard phân cấp lại bằng typography (hero số + tabs + lưới poster + dải "tiếp tục xem").
- Dark mode mặc định + light mode trắng thuần đầy đủ (tokens có sẵn trong MASTER).
- Mobile và desktop ngang tầm quan trọng.
- Accessibility giữ mức hiện có hoặc tốt hơn (app đã có skip-link, focus trap, focus-visible, reduced-motion).

**Non-goals (không làm trong đợt này)**
- Không đổi logic, state (Zustand stores), API, Firebase, schema Firestore, service worker push.
- Không thêm tính năng mới ngoài thay đổi IA đã nêu.
- Không thêm dependency mới (chỉ thêm font Anton vào Google Fonts link; bỏ Inter nếu không còn dùng).
- Không i18n — UI vẫn tiếng Việt hardcode như hiện tại.
- Không redesign animation splash (chỉ đổi màu nền container cho khớp tokens).

**Anti-goals (cấm — thất bại nếu xuất hiện)**
- Gradient **trang trí** (radial "khí quyển", blob), spotlight/vignette, glow, text-shadow phát sáng. Ngoại lệ được phép: scrim tối chức năng trên ảnh poster để chữ đọc được, và gradient poster-art trong mockup (placeholder cho ảnh poster TMDB thật).
- Bóng mềm float trong app UI (modal/dropdown dùng nền đặc + hairline).
- Bo pill 999px cho mọi thứ; bo góc > 12px; serif-italic + gold trên nền navy.
- Màu sắc trong chrome (chrome = đen/trắng/hairline; màu chỉ ở poster + gold accent).
- Emoji làm icon (chỉ Lucide stroke 1.5).

## 3. Ràng buộc

- Stack cố định: Tailwind v4 (`@theme` tokens trong `src/index.css`), framer-motion (motion), react-router v7, Zustand, lucide-react. Không thêm lib.
- Fonts: **Anton** (display, CHỈ uppercase, 1 weight) + **Be Vietnam Pro** (body/labels) — cả hai đã verify subset tiếng Việt trên Google Fonts. Bỏ Inter.
- Hiệu năng: không `backdrop-filter`; framer-motion chỉ transform/opacity; tôn trọng `prefers-reduced-motion` ở mọi animation.
- Quy ước repo: file kebab-case (vừa rename xong theo chuẩn dự án), comment tiếng Việt như code hiện có.

## 4. Các quyết định đã chốt (theo thứ tự phỏng vấn)

| # | Quyết định | Giá trị |
|---|-----------|---------|
| 1 | Độ sâu | Đập lại UX + hình thức toàn bộ; giữ logic/state/API/routing paths (trừ IA mới dưới đây) |
| 2 | Hướng thiết kế | Editorial Print (Mubi/Criterion) — flat, typography-led, poster-only color |
| 3 | Nền tảng | Mobile + desktop ngang nhau |
| 4 | Theme | Dark mặc định (thiết kế kỹ nhất) + light "giấy in" đầy đủ |
| 5 | Font | Anton (display) + Be Vietnam Pro (body) |
| 6 | Accent | Vàng mực `#CA8A04` phẳng (thay emerald); light mode dùng `#8F6400` |
| 7 | Motion | 7/10 thi hành editorial: hero transition (`layoutId`), stagger fade 40–60ms, underline trượt; KHÔNG parallax; không overshoot/back.out |
| 8 | IA | Chi tiết phim thành trang riêng `/movie/:id` (Back/share được) — đã duyệt qua mockup |
| 9 | Nav | Giữ 5 mục: Thư viện, Tìm phim, Thống kê, Album, Lịch |
| 10 | Quy trình | Mockup duyệt trước (đã xong) → design doc → plan → code theo phase |

**Palette dark (tóm tắt — đầy đủ trong MASTER.md):** background `#0A0A0A`, foreground `#F5F5F2`, surface `#141414`, muted-fg `#8A8A85`, hairline `rgba(255,255,255,.14)` / mềm `.07`, accent `#CA8A04` (on-accent `#0A0A0A`), destructive `#DC2626`. Light: nền trắng `#FFFFFF`, mực `#141414`, hairline đen, accent `#8F6400`.

## 5. IA: trước → sau

**Routes giữ nguyên vị trí, đổi nội dung/bề mặt:**

| Route | Hiện tại | Sau |
|-------|----------|-----|
| `/` | Dashboard thư viện (filters + tabs chồng lớp) | Hero thống kê chữ lớn (số phim Anton 72–84px + stats caps) → tabs caps gạch chân vàng (kèm số lượng) → lưới poster → dải "TIẾP TỤC XEM" (progress 2px). Theo đúng mockup "Thư viện · Desktop/Mobile" đã duyệt |
| `/search` | TMDB search & discovery | Giữ chức năng; bề mặt editorial: kết quả = lưới/danh sách poster cùng component với dashboard |
| `/stats` | 3 stat cards + recharts | Stat chữ lớn kiểu editorial (số Anton); recharts giữ nhưng flat: grid hairline, series gold/neutral, không gradient fill, tooltip nền đặc |
| `/albums`, `/albums/:albumId` | Albums + detail | Giữ chức năng; bề mặt editorial; poster grid dùng chung component |
| `/calendar` | Lịch phát sóng + push | Giữ chức năng; hàng/ngày phân tách hairline, label caps |
| `/person/:personId` | Chi tiết người | Giữ chức năng; filmography = poster grid dùng chung |
| `/profile/:uid` | Profile thành viên | Giữ chức năng; inline editing giữ nguyên logic, bề mặt editorial |
| `*` | Not found | Editorial: "404" Anton lớn + liên kết về Thư viện |

**Thay đổi IA duy nhất (đã duyệt):**
- **Mới:** `/movie/:id` — trang chi tiết phim theo mockup "Chi tiết phim · Desktop/Mobile": poster lớn trái (desktop) / giữa (mobile), tiêu đề Anton, meta caps, điểm số Anton vàng, actions (Đánh giá / Thêm vào Album / Yêu thích), overview, cast (thumb vuông hairline), dải "TƯƠNG TỰ". Back button trong app bar; URL share được.
- **MovieDetailModal:** ngừng sử dụng — mọi điểm mở chi tiết phim điều hướng đến `/movie/:id`. Sau khi thay xong, nếu component không còn tham chiếu thì xóa file.
- **Các modal khác giữ nguyên chức năng** (AddMovieModal, RandomPickerModal, MemberSearchModal, AlbumSelectorModal), chỉ đổi bề mặt theo tokens: overlay `rgba(0,0,0,.72)`, modal nền đặc `#141414` + hairline + radius 8px.

## 6. Design language (tóm tắt thi công — chi tiết trong MASTER.md)

- **Phân cấp bằng typography + hairline,** không bằng hộp: hero số/tiêu đề đặt thẳng trên nền; section phân tách bằng `border-top` hairline + label caps 11px `letter-spacing .1em`.
- **Component UI cần rebuild trong `src/shared/components/ui/`:** button (primary gold đặc / outline hairline / ghost; caps 12px 700 `letter-spacing .08em`), icon-button (ô vuông hairline), dialog, dropdown, multi-select-dropdown, date-picker, time-picker, switch, pagination, page-header (Anton title + label caps), empty-state, error-state, loading, skeleton-card, scroll-to-top. Feedback components (toast, alert, error-boundary, splash) đổi palette.
- **Nav:** desktop app bar flat (wordmark Anton "CINEMOB" + nav caps gạch chân active + icon vuông); mobile bottom nav flat đặc `#0C0C0C` + hairline top, active = chữ vàng + gạch vàng trên cạnh; bỏ pill nổi và FAB (mobile thêm phim = nút vàng vuông nhỏ trên app bar).
- **Poster card:** aspect 2/3, radius 4px, hairline border; hover = viền gold 1px + scale ảnh 1.03 bên trong frame (không lift); rating `★ x.x` vàng góc phải trên; title caps 11px dưới scrim tối.
- **Motion (framer-motion):** hero transition poster → trang chi tiết bằng `layoutId`; stagger lưới fade 200ms cách 40–60ms `easeOut`; tab underline dùng `layoutId`; mọi transition 150–250ms; tắt hết khi `prefers-reduced-motion`.
- **Tokens migration trong `src/index.css`:** thay bộ emerald/zinc bằng palette MASTER (giữ tên vai trò `--color-primary`, `--color-background`… để component map gọn); radii mới 8px/4px; xóa shadows mềm & keyframes glow nếu có; cập nhật `public/manifest.json` theme-color → `#0A0A0A` và `<meta name="theme-color">`.

## 7. Điều để builder tự quyết (không cần hỏi lại)

- Chia file component chi tiết, tên hook/helper nội bộ, thứ tự refactor trong 1 phase.
- Khoảng cách cụ thể trong khung spacing MASTER (4/8/16/24/32/48).
- Trang `design-system/cinemob/pages/<page>.md` cho từng màn nếu cần override (theo quy trình MASTER.md).
- Cách map chart recharts sang tokens (miễn flat + contrast đạt).
- Việc xóa file/asset thừa do thay đổi tạo ra (vd. Inter khỏi Google Fonts link, MovieDetailModal).
- **Scroll restoration:** Back từ `/movie/:id` về Dashboard phải giữ đúng vị trí scroll của lưới (nghe criterion 7) — tự chọn cơ chế (manual restore qua store/router state).
- **Hero transition fallback:** nếu `layoutId` qua route (AnimatePresence + router) không ổn định trên mobile Safari, hạ cấp thành fade+scale 200ms — ghi rõ trong plan khi chọn.
- **Modal → navigate:** khi mở chi tiết từ trong một modal đang mở (vd. kết quả trong AddMovieModal): đóng modal rồi navigate; không xếp chồng.
- **Active nav mapping:** route con (/person, /albums/:id, /movie) ánh về mục nav cha nào (Tìm phim / Album) — tự quyết, ghi trong plan.
- **Font loading:** Anton chỉ 1 weight — dùng `display=swap` + preconnect; fallback stack `system-ui` giữ CLS thấp.

## 8. Tiêu chí nghiệm thu (verify)

1. `npm run typecheck` và `npm run build` pass; `npm run lint` không tăng warning.
2. Từng route + modal đối chiếu được với mockup đã duyệt (Thư viện, Chi tiết phim, Login) hoặc với MASTER.md (các màn còn lại).
3. Checklist chống AI-slop trong MASTER.md pass trên từng màn: **0 gradient/glow/bóng mềm trang trí** trong app UI (grep `box-shadow`, `gradient`, `backdrop-filter` trong src/ — chỉ được phép còn scrim chức năng trên ảnh poster).
4. Contrast: các cặp chữ/nền mới đạt ≥ 4.5:1 (dark: `#F5F5F2`/`#0A0A0A`, `#8A8A85`/`#0A0A0A` chỉ meta, `#CA8A04`/`#0A0A0A` 6.4:1; light tương ứng).
5. `prefers-reduced-motion: reduce` → app dùng được hoàn toàn, mọi animation tắt.
6. Mobile 375px & desktop 1440px: không scroll ngang, không nội dung bị che sau bar cố định.
7. Flows kiểm thử tay: đăng nhập → thêm phim (TMDB) → mở chi tiết từ grid (hero transition, Back về đúng vị trí) → đánh giá → thêm vào album → chọn ngẫu nhiên → đổi theme light → đăng xuất.

## 9. Phạm vi code phase (gợi ý — plan sẽ chốt chi tiết)

1. Tokens + fonts + app shell (app bar, bottom nav, theme, splash palette) → verify: shell flat đúng chuẩn trên mọi route cũ.
2. Design system components (`shared/components/ui` + poster card) → verify: dùng được độc lập, a11y.
3. Routes theo thứ tự: Dashboard (`/`) → `/movie/:id` mới + chuyển MovieDetailModal → Search → Albums → Calendar → Person → Profile → Stats → 404/Login.
4. Dọn dẹp: Inter/MovieDetailModal/asset thừa, checklist 1–8 toàn app.
