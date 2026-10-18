# CineMOB UI Rebuild — Editorial Print Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native) or superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đập đi xây lại toàn bộ UI CineMOB theo hướng Editorial Print (flat, typography-led, poster-only color) đã duyệt trong mockup, giữ nguyên logic/state/API.

**Architecture:** Đổi giá trị design tokens trong `src/index.css` (mọi component đã tiêu thụ token ngữ nghĩa nên recolor lan tỏa tự động) → rebuild app shell + UI kit → tạo `PosterCard` + `/movie/:id` (thay MovieDetailModal) → chuyển từng trang sang ngôn ngữ mới. Motion bằng framer-motion với `useReducedMotion` bắt buộc.

**Tech Stack:** React 19 + Vite + Tailwind v4 (`@theme`), react-router v7, framer-motion, Zustand, lucide-react. Không thêm dependency.

**Spec:** [docs/superpowers/specs/2026-10-17-ui-rebuild-editorial-design.md](../specs/2026-10-17-ui-rebuild-editorial-design.md) + [design-system/cinemob/MASTER.md](../../../design-system/cinemob/MASTER.md) (nguồn sự thật tokens).

## Global Constraints

- **KHÔNG `git commit`** — quy ước dự án của chủ dự án: chỉ `git add` (staging) nếu cần; commit chỉ khi được yêu cầu rõ ràng. _(Các step "Commit" của quy trình được thay bằng "Stage + Verify".)_
- **KHÔNG thêm dependency/package mới** (chỉ thay Google Fonts link). Repo không có unit-test runner → kiểm chứng bằng `npm run typecheck`, `npm run build`, `npm run lint`, grep, và kiểm thử tay có mốc rõ ràng.
- File **kebab-case**, comment **tiếng Việt**, UI text tiếng Việt.
- Màu chỉ lấy từ tokens trong `src/index.css`; cấm hex mới trong components (ngoại lệ duy nhất: scrim đen chức năng `rgba(0,0,0,…)` trên ảnh poster).
- Cấm trong app UI: `backdrop-filter`, gradient trang trí, bóng mềm, pill `rounded-full` cho khối nội dung, glow. Nâng tầng = hairline + khoảng trắng.
- Motion: framer-motion, chỉ transform/opacity, 150–250ms, `easeOut`; mọi animation phải qua `useReducedMotion()`; stagger 40–60ms.
- Bo góc: control/dialog 8px (`--radius-control/card/dialog: 8px`), poster/thumb 4px (`--radius-poster: 4px`).
- Mobile: target chạm ≥ 44px; giữ focus-visible outline hiện có trong `index.css` (`--color-focus`).
- Đổi font: **Anton** = `--font-display` (CHỈ dùng cho display số/tiêu đề, áp `uppercase` ở component), **Be Vietnam Pro** = `--font-sans` (body + labels caps).

## Review Focus

1. **`prefers-reduced-motion: reduce`** — người dùng mong đợi app dùng được hoàn toàn, không animation. → Test: Task 10 Bước 3 (emulate reduce, chạy đủ flow chính).
2. **Back từ `/movie/:id`** — mong đợi quay về đúng vị trí scroll của lưới Dashboard. → Test: Task 6 Bước 6.
3. **Light "giấy" contrast** — `--color-text-secondary` `#6B6B66` trên `#F4F1EA` phải ≥ 4.5:1; muted chỉ dùng cho meta. → Test: Task 1 Bước 5 + Task 10 Bước 2.
4. **375px + tiêu đề Anton dài** ("Bản Giao Hưởng Cuối Cùng") — mong đợi xuống dòng/truncate, không scroll ngang. → Test: Task 5 Bước 5 + Task 10 Bước 4.
5. **HỦY MovieDetailModal** — 5 call-site chuyển sang navigate; rating/album/progress vẫn hoạt động từ trang mới. → Test: Task 6 Bước 4–5 (grep 0 tham chiếu + flow tay).

---

### Task 1: Tokens + fonts + manifest

**Files:**

- Modify: `src/index.css`
- Modify: `index.html`
- Modify: `public/manifest.json`

**Interfaces:**

- Consumes: cấu trúc `@theme` hiện có (giữ nguyên tên biến vai trò).
- Produces: token values mới mà mọi task sau dựa vào — `--font-sans: 'Be Vietnam Pro'`, `--font-display: 'Anton'`, `--color-primary: #CA8A04` (dark)/`#8F6400` (light), `--radius-poster: 4px`, shadow tokens = none.

- [ ] **Bước 1: Sửa `index.html`** — thay Google Fonts link bằng `https://fonts.googleapis.com/css2?family=Anton&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap` (thêm `preconnect` fonts.gstatic.com nếu chưa có); cập nhật `<meta name="theme-color">` → `#0A0A0A`; bỏ mọi tham chiếu Inter.
- [ ] **Bước 2: Sửa `public/manifest.json`** — `theme_color` và `background_color` → `#0A0A0A`.
- [ ] **Bước 3: Sửa `src/index.css` `@theme`** — giữ tên biến, đổi giá trị:

```css
--font-sans: 'Be Vietnam Pro', sans-serif;
--font-display: 'Anton', sans-serif;

/* Light = giấy in */
--color-background: #f4f1ea;
--color-surface: #ffffff;
--color-surface-elevated: #ffffff;
--color-primary: #8f6400;
--color-primary-hover: #7a5600;
--color-on-primary: #ffffff;
--color-secondary: #6b6b66;
--color-text-primary: #141414;
--color-text-secondary: #6b6b66;
--color-border: rgb(20 20 20 / 0.16);
--color-focus: #8f6400;
--color-border-default: rgb(20 20 20 / 0.07);
/* success/warning/danger/info giữ giá trị hiện có */

--radius-control: 8px;
--radius-card: 8px;
--radius-dialog: 8px;
--radius-poster: 4px;

--shadow-card: 0 0 #0000;
--shadow-elevated: 0 0 #0000;
--shadow-premium: 0 0 #0000;
--shadow-premium-hover: 0 0 #0000;
--shadow-glass: 0 0 #0000;
```

Khối `.dark` ghi đè:

```css
.dark {
  --color-background: #0a0a0a;
  --color-surface: #141414;
  --color-surface-elevated: #1a1a1a;
  --color-primary: #ca8a04;
  --color-primary-hover: #dfa60b;
  --color-on-primary: #0a0a0a;
  --color-secondary: #8a8a85;
  --color-text-primary: #f5f5f2;
  --color-text-secondary: #8a8a85;
  --color-border: rgb(255 255 255 / 0.14);
  --color-focus: #ca8a04;
  --color-border-default: rgb(255 255 255 / 0.07);
}
```

- [ ] **Bước 4: Sửa 2 rule trong `@layer base`** — `h1, h2, h3 { font-family: var(--font-sans); }` (thẻ heading mặc định = body font; display Anton áp qua class `font-display uppercase` ở Task 2+); `.font-display { font-family: var(--font-display); }`. Đổi giá trị `.center-card-glow` thành `0 0 0 1px var(--color-border)` (hairline — giữ tên class vì random picker/login đang dùng).
- [ ] **Bước 5: Verify** — `npm run typecheck` PASS; `npm run build` PASS; chạy `npm run dev`: app nền đen (#0A0A0A) chữ trắng ấm, accent vàng, mọi nút bo 8px, không còn bóng mềm; chuyển light → nền giấy; đo contrast `#6B6B66` trên `#F4F1EA` ≥ 4.5:1 (kết quả tham chiếu ≈ 4.9:1).
- [ ] **Bước 6: Stage** — `git add src/index.css index.html public/manifest.json` (KHÔNG commit).

### Task 2: App shell — app bar, bottom nav, layout, footer, splash

**Files:**

- Modify: `src/app/components/navbar.tsx`
- Modify: `src/app/components/layout.tsx`
- Modify: `src/shared/components/layout/mobile-bottom-nav.tsx`
- Modify: `src/shared/components/layout/footer.tsx`
- Modify: `src/shared/components/feedback/splash-screen.tsx` (chỉ màu container)

**Interfaces:**

- Consumes: tokens Task 1 (`font-display`, `--color-primary`, `--radius-control`), `useLocation` (react-router) cho active state.
- Produces: app bar flat + bottom nav flat mà mọi route dùng; hằng active-map `NAV_PARENT_BY_PATTERN` (xuất từ `navbar.tsx`, mobile nav import lại dùng chung): `/person/*` và `/search*` → 'search'; `/albums*` → 'albums'; còn lại khớp path tuyệt đối.

- [ ] **Bước 1: `navbar.tsx` (desktop)** — bỏ pill nổi/glass/shadow: app bar cao 56px, nền `bg-background`, `border-b border-border`; wordmark chữ: `<span className="font-display text-xl uppercase tracking-wide">Cine<span className="text-primary">MOB</span></span>` (thay ảnh logo; giữ file `logo_text.png` — xóa ở Task 10 nếu hết tham chiếu); nav items caps `text-[11.5px] font-semibold uppercase tracking-[0.08em]`, item active `text-text-primary` + gạch chân vàng 2px (`after:absolute after:-bottom-px` — dùng `relative` trên item); icon button + avatar bo `rounded-control`; dùng `NAV_PARENT_BY_PATTERN` để `/person/:id` sáng đúng mục.
- [ ] **Bước 2: `mobile-bottom-nav.tsx`** — bỏ pill nổi: bar full-width đặc `bg-[#0C0C0C] dark`/`bg-surface` light, `border-t border-border`, cao 54px + safe-area; item = icon + label caps 9px, active `text-primary` + vạch vàng 2px trên cạnh item (`before:absolute before:top-[-1px]`); import `NAV_PARENT_BY_PATTERN`.
- [ ] **Bước 3: `layout.tsx` + `footer.tsx`** — điều chỉnh padding cho bar flat mới; footer: caps 10px + `border-t border-border`, bỏ gradient/glow nếu còn.
- [ ] **Bước 4: `splash-screen.tsx`** — nền container `bg-background`, giữ nguyên lottie/logic.
- [ ] **Bước 5: Verify** — `npm run typecheck` PASS; `npm run dev`: desktop app bar flat với gạch chân vàng đúng mục (vào `/person/1` để test mapping); mobile bar flat, active vàng; không còn phần tử pill nổi.
- [ ] **Bước 6: Stage** — `git add` 5 file trên (KHÔNG commit).

### Task 3: UI kit + feedback restyle

**Files:**

- Modify: toàn bộ `src/shared/components/ui/` — `button.tsx`, `icon-button.tsx`, `dialog.tsx`, `dropdown.tsx`, `multi-select-dropdown.tsx`, `date-picker.tsx`, `time-picker.tsx`, `switch.tsx`, `pagination.tsx`, `page-header.tsx`, `empty-state.tsx`, `error-state.tsx`, `loading.tsx`, `skeleton-card.tsx`, `scroll-to-top.tsx`
- Modify: `src/shared/components/feedback/` — `toast-container.tsx`, `alert-container.tsx`, `error-boundary.tsx`

**Interfaces:**

- Consumes: tokens Task 1.
- Produces: **API component giữ nguyên 100%** (props/variant names như cũ — không sửa call-site nào); `page-header` mới render `<h1 class="font-display uppercase …">` + label caps; dialog nền đặc `bg-surface-elevated border border-border rounded-dialog` + overlay `bg-black/72` (bỏ mọi `backdrop-blur`).

- [ ] **Bước 1: `button.tsx`** — giữ prop API; đổi `variantClasses`/`sizeClasses`: base thêm `font-bold uppercase tracking-[0.08em] text-xs`; `primary` = `bg-primary text-on-primary hover:bg-primary-hover border border-transparent`; `secondary` = outline `bg-transparent border-border hover:border-primary hover:text-primary`; `ghost`, `danger` giữ cấu trúc, bỏ bóng; radius `rounded-control` mọi size.
- [ ] **Bước 2: `dialog.tsx` + `alert-container.tsx`** — overlay `bg-black/72` (không blur); panel `bg-surface-elevated border border-border rounded-dialog p-8`, bỏ glass/shadow; animation giữ `--animate-*` hiện có (functional).
- [ ] **Bước 3: `page-header.tsx`** — title `font-display uppercase text-3xl md:text-4xl tracking-wide`; phụ đề/label caps `text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary`; `border-b border-border` dưới header.
- [ ] **Bước 4: các file còn lại** — thay mọi pill `rounded-full` (chỉ giữ cho chip trạng thái nhỏ nếu đang là pill có chủ đích — ghi chú từng chỗ trong commit message); dropdown/panel nền `bg-surface-elevated border-border rounded-control`; skeleton = `bg-surface-elevated` pulse; scroll-to-top = ô vuông hairline; xóa mọi `bg-gradient-*`, `backdrop-blur`, `shadow-*` mềm gặp phải (grep từng file).
- [ ] **Bước 5: Verify** — `npm run typecheck` PASS; `grep -rn "backdrop-filter\|backdrop-blur\|shadow-card\|shadow-elevated\|shadow-premium\|shadow-glass" src/shared/components` → 0 kết quả; `npm run dev`: mở AddMovieModal + toast + alert → nền đặc, viền hairline, bo 8px.
- [ ] **Bước 6: Stage** — `git add src/shared` (KHÔNG commit).

### Task 4: PosterCard + motion presets

**Files:**

- Create: `src/features/movies/components/poster-card.tsx`
- Create: `src/shared/utils/motion-presets.ts`
- Modify: `src/features/movies/components/movie-card.tsx` (đổi内部 dùng PosterCard hoặc xóa nếu PosterCard thay thế hoàn toàn — quyết định theo mức tham chiếu, grep `movie-card`)

**Interfaces:**

- Consumes: `useNavigate` (react-router), tokens Task 1, `useReducedMotion` (framer-motion).
- Produces (Task 5/7/8/9 tiêu thụ — dùng đúng chữ ký này):

```tsx
interface PosterCardProps {
  id: number | string; // TMDB id (Movie.id)
  title: string;
  posterPath: string | null;
  mediaType?: 'movie' | 'tv';
  rating?: number; // điểm người dùng; fallback TMDB vote_average
  meta?: string; //vd "Tâm lý · 2025" — caps 9px dưới title
  progress?: { current: number; total: number } | null; // TV: vẽ thanh 2px dưới title
  className?: string;
}
// Hành vi: click → navigate(`/movie/${id}${mediaType === 'tv' ? '?type=tv' : ''}`)
// Cấu trúc: aspect-[2/3], rounded-poster, border-border, overflow-hidden;
// hover: outline vàng 1px (outline-offset -1) + scale ảnh 1.03 bên trong;
// scrim: bg-gradient-to-t from-black/80 (chức năng); title caps 11px;
// rating: ★ x.x text-primary góc phải trên; layoutId chỉ thêm khi Task 6 bật hero transition.
```

`motion-presets.ts`:

```ts
export const staggerContainer = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
export const staggerItem = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};
// Component grid bọc: <motion.div variants={staggerContainer} initial="hidden" animate="show">
// và item <motion.div variants={staggerItem}> — tự tắt khi useReducedMotion (animate="show" tĩnh).
```

- [ ] **Bước 1: viết `motion-presets.ts` + `poster-card.tsx`** theo chữ ký trên.
- [ ] **Bước 2: Verify** — `npm run typecheck` PASS; render thử PosterCard trong Dashboard tạm (sửa 1 chỗ, sẽ thay ở Task 5): poster đúng tỉ lệ, hover viền vàng không lift, click điều hướng (sẽ 404 cho đến Task 6 — chấp nhận ở bước này, ghi rõ).
- [ ] **Bước 3: Stage** — `git add` 3 file (KHÔNG commit).

### Task 5: Dashboard `/` — hero + tabs + grid + "Tiếp tục xem"

**Files:**

- Modify: `src/features/dashboard/pages/dashboard-page.tsx`
- Modify: `src/features/dashboard/components/` — `dashboard-tabs.tsx`, `dashboard-filters.tsx`, `dashboard-actions.tsx` (tổ chức lại; xóa file thừa nếu component gộp)
- Modify: `src/features/dashboard/hooks/use-dashboard.ts` (bỏ openDetailModal — xem Task 6 nếu chồng)
- Create: `src/shared/hooks/use-scroll-restore.ts`

**Interfaces:**

- Consumes: PosterCard (Task 4), motion presets (Task 4), tokens, `useMovieStore`/`useDashboard` hiện có (không đổi logic dữ liệu).
- Produces: `use-scroll-restore(key: string)` — lưu `scrollY` vào `sessionStorage` (`scroll:<key>`) throttle 200ms khi scroll, restore sau mount khi document sẵn sàng; Dashboard dùng `use-scroll-restore('dashboard')`.

- [ ] **Bước 1: `use-scroll-restore.ts`** theo interface trên (guard `sessionStorage` try/catch, `requestAnimationFrame` sau mount).
- [ ] **Bước 2: Hero band** — bỏ card bọc: khối padding 26/32 + `border-b border-border`; số tổng phim `font-display uppercase text-7xl md:text-8xl` (=72–84px); label caps "Phim trong bộ sưu tập"; stats hàng caps cách nhau `border-l border-border` (`2.340 giờ xem · 46 lần ra rạp · N album` — dữ liệu từ store hiện có); CTA phải: `Button` primary "Thêm phim" + outline "Ngẫu nhiên" (mở RandomPickerModal như cũ).
- [ ] **Bước 3: Tabs** — caps 12px + số lượng muted; active gạch chân vàng 2px bằng `layoutId="dash-tab-underline"` (framer-motion, tắt khi reduced-motion); filters/sort chuyển thành hàng caps + icon vuông (bỏ pill).
- [ ] **Bước 4: Grid + band** — grid `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5` PosterCard + stagger presets; dải "Tiếp tục xem": `border-t border-border`, label caps trái, 4 cột `border-l border-line-soft`: TV có `progress` → meta "S{current_season} · E{current_episode}/{total}" + thanh 2px vàng `width: watched/total%`; phim không progress → meta status + ngày thêm (không bịa %).
- [ ] **Bước 5: Verify** — `npm run typecheck` PASS; `npm run dev` 375px: hero số không tràn, title poster dài xuống dòng/truncate, không scroll ngang; tabs underline chạy mượt; click poster → điều hướng (404 nếu Task 6 chưa xong).
- [ ] **Bước 6: Stage** — `git add src/features/dashboard src/shared/hooks` (KHÔNG commit).

### Task 6: `/movie/:id` + chuyển call-site + HỦY MovieDetailModal

**Files:**

- Create: `src/features/movies/pages/movie-detail-page.tsx`
- Create: `src/features/movies/hooks/use-movie-detail.ts` (nếu modal có logic fetch inline — tách ra để page dùng)
- Modify: `src/app/index.tsx` (thêm route lazy + xóa mount MovieDetailModal + import)
- Modify: `src/features/dashboard/hooks/use-dashboard.ts`, `src/features/albums/pages/album-detail-page.tsx`, `src/features/calendar/hooks/use-release-calendar.ts`, `src/features/movies/hooks/use-random-picker.ts` (đổi openDetailModal → navigate)
- Delete: `src/features/movies/components/movie-detail-modal.tsx`, `src/features/movies/stores/movie-detail-store.ts`

**Interfaces:**

- Consumes: PosterCard, `use-scroll-restore`, `movie-service`/TMDB services hiện có (đọc `movie-detail-modal.tsx` trước khi xóa để tái sử dụng đúng service/hàm — các section đánh giá/album/progress di chuyển thành component con trong `src/features/movies/components/movie-detail/`, giữ logic).
- Produces: route `/movie/:id` (`:id` = TMDB id; `?type=tv` cho TV). Page resolve: entry bộ sưu tập từ `useMovieStore` theo id (nếu `source: 'manual'` → chỉ dùng dữ liệu bộ sưu tập, không fetch TMDB); TMDB detail cho enrichment; actions Đánh giá/Album/progress giữ nguyên hành vi cũ.

- [ ] **Bước 1: Đọc `movie-detail-modal.tsx`** — liệt kê service/hàm nó gọi (fetch TMDB, lưu rating, thêm album, cập nhật progress) và tái sử dụng nguyên khối; tạo `use-movie-detail.ts` nếu cần.
- [ ] **Bước 2: `movie-detail-page.tsx`** — layout theo mockup đã duyệt: poster 280px trái (desktop)/176px giữa (mobile) + `layoutId={`poster-${id}`}`; tiêu đề `font-display uppercase text-4xl md:text-5xl`; meta caps; điểm `font-display text-primary`; actions Button primary "Đánh giá" + outline "Thêm vào Album" + iconbox; overview 60ch; cast thumb vuông hairline; dải "Tương tự" = PosterCard từ recommendation-service; Back = icon arrow-left navigate(-1).
- [ ] **Bước 3: `src/app/index.tsx`** — thêm `<Route path="/movie/:id" element={<MovieDetailPage />} />`; xóa import/mount MovieDetailModal + khối `useMovieDetailStore`; bọc `AnimatedRoutes` bằng `<AnimatePresence mode="popLayout" initial={false}>` + `<LayoutGroup>` để hero transition chạy qua route (nếu bất ổn trên Safari theo spec §7 → bỏ layoutId pairing, giữ fade của stagger).
- [ ] **Bước 4: Chuyển 4 call-site** — `use-dashboard.ts`, `album-detail-page.tsx`, `use-release-calendar.ts`, `use-random-picker.ts`: thay `openDetailModal(movie)` bằng `navigate(\`/movie/${movie.id}${movie.media_type === 'tv' ? '?type=tv' : ''}\`)`; modal đang mở (AddMovie/random picker) đóng trước rồi mới navigate. Random picker: chọn xong → navigate tới phim trúng.
- [ ] **Bước 5: Xóa file + verify sạch** — `grep -rn "openDetailModal\|useMovieDetailStore\|movie-detail-modal\|movie-detail-store" src` → 0 kết quả rồi mới xóa 2 file.
- [ ] **Bước 6: Verify** — `npm run typecheck` PASS; `npm run build` PASS; flow tay: thêm phim → mở chi tiết từ grid (hero transition hoặc fade) → Back về đúng vị trí scroll Dashboard → Đánh giá → Thêm vào album → share URL `/movie/<id>` mở tab mới được → random picker điều hướng đúng phim.
- [ ] **Bước 7: Stage** — `git add -A src` (KHÔNG commit).

### Task 7: Search + Person

**Files:**

- Modify: `src/features/search/pages/search-page.tsx`, `src/features/search/components/search-results.tsx`, `src/features/search/components/search-filters.tsx`, `src/features/search/components/tmdb-movie-card.tsx`
- Modify: `src/features/search/pages/person-detail-page.tsx`, `src/features/search/components/person/person-movie-section.tsx`

**Interfaces:**

- Consumes: PosterCard (Task 4), tokens.
- Produces: không — chỉ tiêu thụ; `tmdb-movie-card` chuyển thành wrapper mỏng quanh PosterCard hoặc bị thay trực tiếp (giữ export nếu file khác import).

- [ ] **Bước 1: Search** — filters thành hàng caps + control Task 3; kết quả = lưới PosterCard (TMDB result → props: `id, title, posterPath, mediaType, rating: vote_average, meta: năm`); bỏ `tmdb-movie-card` riêng nếu wrapper không còn giá trị.
- [ ] **Bước 2: Person** — header editorial (tên `font-display uppercase`, meta caps); filmography = lưới PosterCard `?type=tv` đúng media_type.
- [ ] **Bước 3: Verify** — `npm run typecheck` PASS; flow tay: tìm phim → click poster → trang chi tiết đúng TMDB-only movie (không có entry bộ sưu tập → phần actions bộ sưu tập ẩn/hiển thị "Thêm vào bộ sưu tập" theo logic hiện có của modal); person → filmography mở được.
- [ ] **Bước 4: Stage** — `git add src/features/search` (KHÔNG commit).

### Task 8: Albums + Calendar

**Files:**

- Modify: `src/features/albums/pages/albums-page.tsx`, `src/features/albums/pages/album-detail-page.tsx`, modal album selector (`src/features/movies/components/add-movie/album-section.tsx` nếu chứa)
- Modify: `src/features/calendar/pages/release-calendar-page.tsx` + component ngày/tuần của nó

**Interfaces:**

- Consumes: PosterCard, UI kit Task 3, tokens.
- Produces: không mới.

- [ ] **Bước 1: Albums** — danh sách album = hàng hairline (tên caps + số phim + ngày); album detail = page-header editorial + lưới PosterCard; mọi modal liên quan đã flat qua Task 3.
- [ ] **Bước 2: Calendar** — nhóm ngày: label caps + hairline; mỗi mục = hàng flat (poster thumb vuông 4px + tên + giờ caps + cờ push); toggle thông báo giữ logic, bề mặt switch Task 3.
- [ ] **Bước 3: Verify** — `npm run typecheck` PASS; flow tay: tạo/xóa album, thêm/bỏ phim khỏi album, lịch render đúng ngày + bật/tắt thông báo.
- [ ] **Bước 4: Stage** — `git add src/features/albums src/features/calendar` (KHÔNG commit).

### Task 9: Profile + Stats + 404 + Login

**Files:**

- Modify: `src/features/profile/pages/member-profile-page.tsx` + `own-profile-editor`, `avatar-crop`, `member-profile-card`, `common-movies` (surface)
- Modify: `src/features/stats/pages/stats-page.tsx`, `src/features/stats/components/stats-card.tsx`
- Modify: `src/shared/pages/not-found-page.tsx`
- Modify: `src/features/auth/components/login.tsx`

**Interfaces:**

- Consumes: PosterCard, UI kit, tokens; `recharts` (đã có).
- Produces: không mới.

- [ ] **Bước 1: Profile** — header editorial (avatar vuông bo 8 + tên `font-display uppercase` + meta caps); grid "phim chung" dùng PosterCard; form inline-editing giữ logic, input theo Task 3.
- [ ] **Bước 2: Stats** — số liệu lớn `font-display` đặt thẳng trên nền (không card); recharts flat: `stroke`/grid = `var(--color-border)`, series = `var(--color-primary)` + neutral, KHÔNG `fill` gradient/defs gradient, tooltip nền `bg-surface-elevated border-border`.
- [ ] **Bước 3: 404** — `font-display` "404" cỡ lớn + caps line + Button outline về Thư viện.
- [ ] **Bước 4: Login** — stark theo mockup: vạch vàng 44×3px, wordmark `font-display` lớn, tagline caps, Button primary Google full-width, fine-print caps; XÓA tilted poster showcase + mọi gradient/glass của màn login.
- [ ] **Bước 5: Verify** — `npm run typecheck` PASS; flow tay: login Google → profile edit + avatar crop → stats render đúng số liệu, hover chart mượt → 404 ok; đăng xuất.
- [ ] **Bước 6: Stage** — `git add src/features src/shared/pages` (KHÔNG commit).

### Task 10: Quét chống-slop + nghiệm thu toàn app

**Files:**

- Modify: bất kỳ file còn sót (theo kết quả grep)
- Delete: asset thừa (vd. `src/assets/images/logo_text.png` nếu đã 0 tham chiếu; font Inter còn sót)

**Interfaces:**

- Consumes: mọi task trước.
- Produces: app đạt checklist §8 của spec.

- [ ] **Bước 1: Grep quét** — `grep -rn "backdrop-filter\|backdrop-blur" src` → 0; `grep -rn "bg-gradient\|bg-\[gradient" src` → chỉ còn scrim chức năng trên ảnh poster (xem spec §2 Anti-goals ngoại lệ); `grep -rn "Inter" index.html src` → 0; `grep -rn "shadow-" src --include="*.tsx" | grep -v "shadow-none"` → chỉ utility hợp lệ; sửa mọi điểm vi phạm.
- [ ] **Bước 2: Contrast** — kiểm tra cặp mới: dark (`#F5F5F2`/`#0A0A0A`, `#8A8A85`/`#0A0A0A` chỉ meta, `#CA8A04`/`#0A0A0A`), light (`#141414`/`#F4F1EA`, `#6B6B66`/`#F4F1EA` chỉ meta, `#8F6400`/`#F4F1EA`) — tất cả ≥ 4.5:1 cho nội dung chính.
- [ ] **Bước 3: Reduced-motion** — DevTools emulate `prefers-reduced-motion: reduce`: mọi animation tắt, đủ flow chính (login → dashboard → chi tiết → album → random picker) dùng được.
- [ ] **Bước 4: Responsive** — 375px và 1440px từng route: không scroll ngang, không nội dung bị che sau bar cố định, title Anton dài xuống dòng/truncate.
- [ ] **Bước 5: Nghiệm thu tổng** — `npm run typecheck && npm run build && npm run lint` PASS (lint không tăng warning); chạy đủ 7 flow trong spec §8.8; đối chiếu từng route với mockup đã duyệt / MASTER.md.
- [ ] **Bước 6: Stage toàn bộ** — `git add -A` (KHÔNG commit — chờ chủ dự án yêu cầu).
