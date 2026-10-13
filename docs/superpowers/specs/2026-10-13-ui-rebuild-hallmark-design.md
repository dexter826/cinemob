# CineMOB UI Rebuild — Hallmark "Phòng chiếu khuya" — Design Spec

- **Ngày:** 2026-10-13
- **Trạng thái:** Chờ user duyệt (sau builder-check)
- **Phạm vi:** Đập đi xây lại toàn bộ lớp giao diện của CineMOB theo chuẩn Hallmark
- **Thay thế:** Toàn bộ quyết định thị giác của `DESIGN.md` cũ (Neon Cinema Lounge) — file đó sẽ được ghi đè bằng hệ thống mới

---

## 1. Ý định & lý do

Giao diện hiện tại đọc như "AI slop": zinc lạnh đồng đều, emerald rải khắp nơi, glassmorphism, card-in-card, icon tile, heading vô danh. User yêu cầu chuẩn hóa và đập đi xây lại toàn bộ theo Hallmark — bộ quy tắc anti-AI-slop: một accent có chủ đích, pairing font có cá tính, nhịp layout không đối xứng, microinteraction có kỷ luật.

Nguyên tắc bất di bất dịch: **chỉ thay lớp trình bày**. Logic, route, store, service, hook, Firebase, TMDB cache giữ nguyên. Hai ngoại lệ được duyệt riêng (mục 4.4, 4.5).

## 2. Quyết định đã chốt (12 câu grilling)

| # | Quyết định |
|---|---|
| 1 | Hướng hình ảnh: **"Phòng chiếu khuya"** — genre atmospheric của Hallmark: nền tối ấm (nâu-đen), một accent hổ phách duy nhất, poster là nội dung chính, bỏ glassmorphism + neon glow |
| 2 | Tài sản thương hiệu giữ nguyên: logo, SplashScreen (Lottie), confetti Random Picker |
| 3 | Giữ cả hai theme: dark là flagship, light là palette ấm riêng (không phải đảo màu dark) |
| 4 | Tách trang chi tiết phim: route mới `/movie/:id` (TMDB id); `MovieDetailModal` chỉ còn fallback cho phim nhập tay không có TMDB id |
| 5 | Trang chủ rebuild thành dashboard điện ảnh: hero backdrop tràn viền + các hàng khám phá ngang (Đang chiếu / Thịnh hành / Sắp ra mắt) + thư viện cá nhân; bổ sung hàm TMDB read-only |
| 6 | Bottom nav mobile: **5 tab phẳng**, không nút giữa nổi: Trang chủ (`/`) · Tìm kiếm (`/search`) · Albums (`/albums`) · Lịch chiếu (`/calendar`) · Cá nhân (`/profile/:uid`) |
| 7 | Bàn giao theo chặng, mỗi chặng có điểm dừng để user xem trên giao diện thật |
| 8 | Git: nhánh mới `redesign/ui-hallmark`, commit theo từng phần |
| 9 | Phạm vi "toàn bộ": shell + 8 trang + shared primitives + toàn bộ modal lớn (AddMovie, RandomPicker, MovieDetailModal, AlbumSelector, MemberSearch…) |
| 10 | Hành vi giữ nguyên 100% trừ hai ngoại lệ ở mục 4 |
| 11 | Font: **Bricolage Grotesque** (display) + **Be Vietnam Pro** (body) + **JetBrains Mono** (số liệu) — cả ba có subset tiếng Việt trên Google Fonts |
| 12 | Scale: nội dung chính `max-w-7xl`; tiêu đề trang cỡ display thật; số liệu mono tabular-nums; tiếng Việt sentence case; cấm uppercase tracking-widest cho label thường |

## 3. Hệ thống thiết kế (được ghi thành `DESIGN.md` mới ở Chặng 0)

### 3.1 Theme — custom "Phòng chiếu khuya" (atmospheric)

Tất cả màu là OKLCH, khai báo trong `src/index.css` (Tailwind v4 `@theme`), dark là default của lớp `.dark` theo cơ chế ThemeProvider hiện có.

**Dark (flagship):**

- `--paper` oklch(15% 0.012 65) — nâu-đen ấm, không phải zinc lạnh
- `--paper-2` oklch(19% 0.014 65) — surface
- `--paper-3` oklch(23% 0.016 65) — surface nâng
- `--ink` oklch(93% 0.008 80) — chữ chính
- `--ink-2` oklch(72% 0.010 70) — chữ phụ
- `--rule` oklch(30% 0.012 65) — viền hairline
- `--accent` oklch(78% 0.155 70) — hổ phách đèn chiếu
- `--accent-ink` oklch(16% 0.02 70) — chữ trên nền accent
- `--focus` = accent

**Light (palette ấm riêng):** paper oklch(97.5% 0.008 85) — kem ấm; surface trắng ngà; ink oklch(21% 0.012 65); rule oklch(86% 0.010 75); accent oklch(58% 0.145 65); status colors tính riêng cho đủ tương phản AA trên nền sáng.

**Kỷ luật accent:** một hue duy nhất. Dùng cho: tab active, focus ring, link hover, sao rating, CTA chính, skeleton shimmer nhị phân. ≤5% diện tích viewport. Cấm dùng accent cho icon trang trí, nền section, chip status (status dùng ink + icon).

**Canvas atmospheric:** tối đa 2 radial bloom ấm cực nhẹ (footprint ~20–30%, fixed, không animation) ở Login và hero Dashboard — không bloom ở trang quản lý.

### 3.2 Typography

- Display: Bricolage Grotesque 700–800, tracking −0.02em, roman (không italic)
- Body: Be Vietnam Pro 400/500 (giữ nguyên, đã tốt cho tiếng Việt)
- Mono/outlier: JetBrains Mono — chỉ cho số liệu (rating, đếm số, thống kê, ngày dạng số), `font-variant-numeric: tabular-nums`
- Nạp qua Google Fonts `<link>` trong `index.html` (thay link Inter cũ; giữ subset tiếng Việt `&vietnamese=true`)
- Không nạp font weight không dùng

### 3.3 Layout & hình khối

- Spacing 4pt named scale (`--space-2xs` → `--space-3xl`)
- Radius giảm một nhịp cho bớt "rounded-AI": control 10px · card 14px · dialog 20px
- Trang quản lý (Albums, Calendar, Stats, Profile): nhịp quiet — spec-sheet rows + hairline rules, ít card; nhóm bằng khoảng trắng + heading
- Trang khám phá (Dashboard, Search): rails ngang + hero
- Trang nội dung (MovieDetailPage, PersonDetail): photographic fold — backdrop full-bleed, chữ đè gradient
- Grid poster giữ `aspect-2/3`; chiều cao cột `minmax(0,1fr)` chống tràn

### 3.4 Navigation

- **Desktop (≥md):** N5 floating pill — pill nổi detach cách mép, blur nhẹ + saturate, wordmark trái, link giữa, account phải
- **Mobile (<md):** bottom nav 5 tab phẳng: solid `--paper-2` + hairline rule trên, icon Lucide + label, tab active = accent color + weight; safe-area `env(safe-area-inset-bottom)`; mục tiêu chạm ≥44px
- Route name/đích đến giữ nguyên; thêm 5th tab "Cá nhân" trỏ `/profile/:uid` (uid lấy từ auth hiện hành — cùng cơ chế nút profile hiện có trên Navbar)

### 3.5 Motion & microinteraction

- Token easing: `--ease-out` cubic-bezier(0.16,1,0.3,1) · `--ease-in` cubic-bezier(0.7,0,0.84,0) · `--ease-in-out` cubic-bezier(0.65,0,0.35,1)
- Duration: micro 120ms · short 220ms · long 420ms; exit ≈75% enter
- Atmospheric = fade-in only cho reveal; không slide/bounce route
- Cấm: `transition-all`, `hover:scale-105` universal, bounce easing, focus ring animate-in, toast ăn mừng, carousel auto-rotate không nút pause
- Giữ nguyên: contract `src/constants/animations.ts` (MOTION_DURATION…) — chỉ nạp giá trị mới vào đúng chỗ cũ nếu tương thích; Random Picker giữ choreography 3150ms hiện có
- Stance: silent success · optimistic update + undo · tooltip hover 800ms / focus 0ms
- `prefers-reduced-motion`: collapse thành crossfade opacity ≤150ms

### 3.6 Icon & hình ảnh

- Một bộ icon duy nhất: Lucide (giữ nguyên)
- Poster/backdrop là nội dung chính; placeholder poster = khối `--paper-3` + chữ tắt tên phim, không emoji
- Ảnh hero: `fetchpriority="high"`; ảnh dưới fold `loading="lazy"`

## 4. Thay đổi cấu trúc (2 ngoại lệ được duyệt)

### 4.4 Route `/movie/:id` (mới)

- Page mới `src/features/movies/pages/MovieDetailPage.tsx`, lazy + đăng ký trong `App.tsx`
- `:id` = TMDB id. Load chi tiết qua TMDB, tra `useMovieStore.movies` map trạng thái cá nhân (đã xem/sao/review)
- Cấu trúc: backdrop full-bleed + gradient fade + nút back; metadata pills; cast rail; nút hành động (Đã xem / Muốn xem / Sửa / Thêm album)
- `MovieDetailModal` còn mở khi phim không có TMDB id (manual entry) — giữ store `movieDetailStore` cũ làm nguồn trigger; với phim có TMDB id, mọi nơi đang mở modal đổi sang `navigate(/movie/:id)`

### 4.5 TMDB client mở rộng (read-only, additive)

Bổ sung trong `src/features/search/services/tmdb/`: `getNowPlayingMovies()`, `getUpcomingMovies()`, `getTrendingMovies()`, `getMovieCredits(id)`, `getMovieRecommendations(id)` — cùng pattern cache/error của các hàm hiện có.

### 4.6 Trang chủ mới (dựng trên dữ liệu 4.5)

- Hero: 3–5 phim đang chiếu, backdrop tràn viền, auto-rotate có nút pause + swipe tay
- Rails: Đang chiếu · Thịnh hành tuần này · Sắp ra mắt
- Thư viện cá nhân: "Vừa xem gần đây" · "Muốn xem của bạn" + nút mở toàn bộ thư viện (bộ lọc/sort hiện có giữ nguyên, chỉ restyle)

## 5. Chặng triển khai (mỗi chặng commit riêng + điểm dừng review)

| Chặng | Nội dung | Dừng xem |
|---|---|---|
| 0 | `DESIGN.md` mới (ghi đè) + tokens `src/index.css` + fonts `index.html` + `theme-color` meta | So sánh dark/light nhanh |
| 1 | Shell: Layout, Navbar (N5), MobileBottomNav (5 tab), Footer (Ft2 inline) + shared primitives (Button, IconButton, Dialog, Dropdown, MultiSelect, DatePicker, TimePicker, Switch, Loading, EmptyState, ErrorState, SkeletonCard, Pagination, PageHeader, Toast, Alert) | Khung app mới, mọi nút/input/dialog ở trạng thái mặc định |
| 2 | Discovery: Dashboard hero + rails + thư viện, SearchPage, PersonDetailPage, `/movie/:id` mới | Vừa xem vừa test deep-link |
| 3 | Management: AlbumsPage, AlbumDetailPage, ReleaseCalendarPage, StatsPage, MemberProfilePage + toàn bộ modal (AddMovie + sub-forms, RandomPicker, MovieDetailModal fallback, AlbumSelector, MemberSearch) | Full smoke flow |

Sau mỗi chặng: `npm run typecheck` + `npm run lint` + `npm run build`. Cuối Chặng 3: slop-test 58 gates + review widths 320/375/768/1024/1440 dark + light.

## 6. Non-goals / Anti-goals

**Non-goals:** không đổi Firestore schema, auth, rules, stores, hooks, services (trừ 4.5), PWA/sw, push scripts; không thêm dependency mới (chỉ đổi Google Fonts link); không đụng `dist/`, `dev-dist/`.

**Anti-goals (cấm tuyệt đối — các AI tells):** gradient text; gradient tím-xanh; glassmorphism trang trí; neon glow; card-in-card; icon-tile card; 3-column feature grid đều nhau; eyebrow uppercase mọi section; heading italic; emoji làm icon; invented metrics; uppercase tracking-widest label thường; `#000`/`#fff` tuyệt đối; hover đa hiệu ứng chồng nhau.

## 7. Verification

- Tự động mỗi chặng: `npm run typecheck` (0 lỗi) · `npm run lint` (0 lỗi) · `npm run build` (xanh)
- Thủ công cuối: matrix 320/375/768/1024/1440 × dark/light; đăng nhập, thêm/sửa/xóa phim (undo), random picker, albums CRUD, calendar, stats, profile thành viên, `/movie/:id` deep-link + back
- Slop-test: 58 gates Hallmark, mọi gate phải pass
- Review code bằng subagent (`requesting-code-review`) trước khi mời merge

## 8. Builder-check — các lời gọi của builder (đã tự chốt, user chỉ cần duyệt nhanh)

1. **Tên token Tailwind giữ nguyên, chỉ đổi giá trị.** `--color-primary`, `--color-surface`… giữ tên như hiện tại trong `@theme` (amber mới nạp vào `--color-primary`), thêm alias `--color-accent`, `--color-paper`… khi cần. Lý do: 100+ file đang dùng `bg-surface`, `text-text-primary`… — đổi tên là phá build toàn cục mà không mua được gì.
2. **Chuyển hướng modal → `/movie/:id` tại một điểm duy nhất:** action mở `movieDetailStore` — có TMDB id thì `navigate`, không thì mở modal fallback. Các caller không đụng.
3. **Desktop N5 pill link set:** Tìm kiếm · Albums · Lịch chiếu · Thống kê + avatar/menu account phải (đăng xuất, đổi theme). Mobile 5 tab như đã chốt; `/stats` không vào bottom nav (đã nằm trong menu account theo quyết định cũ).
4. **ThemeProvider giữ nguyên logic default** (theo hệ thống/lưu chọn) — chỉ thay giá trị token, không đổi hành vi chọn theme.
5. **Subset font:** Bricolage Grotesque và JetBrains Mono đều có subset tiếng Việt trên Google Fonts; nếu build ra thiếu glyph nào thì phần số liệu mono vẫn an toàn (chữ số latin).

## 9. Còn lại cho builder

- Giá trị chính xác từng step light-mode status color (đạt AA) — tinh chỉnh khi viết tokens
- Cấu trúc hero carousel (số slide, interval) — chốt khi dựng Chặng 2, mặc định 3–5 slide / 6s / có pause
- Chi tiết restyle từng modal giữ nguyên DOM semantic + aria hiện có, chỉ đổi lớp trình bày
