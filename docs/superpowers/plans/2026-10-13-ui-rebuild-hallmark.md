# CineMOB UI Rebuild "Phòng chiếu khuya" — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đập đi xây lại toàn bộ lớp trình bày của CineMOB theo hệ thống Hallmark "Phòng chiếu khuya" (atmospheric, accent hổ phách, dark ấm flagship), giữ nguyên 100% logic.

**Architecture:** 4 chặng có điểm dừng — (0) token nền tảng, (1) shell + primitives, (2) màn hình khám phá + route `/movie/:id`, (3) màn hình quản lý + modals. Mỗi task một commit trên nhánh `redesign/ui-hallmark`. Token giữ nguyên tên Tailwind hiện có (`--color-primary`…), chỉ đổi giá trị; thêm alias mới khi cần.

**Tech Stack:** React 19 + TypeScript + Tailwind v4 (`@theme` trong `src/index.css`) + zustand + framer-motion + lucide-react + Vite PWA. Không thêm dependency nào.

**Spec:** `docs/superpowers/specs/2026-10-13-ui-rebuild-hallmark-design.md` (đọc cùng plan này; spec thắng khi mơ hồ).

**Về kiểm thử:** Repo chỉ có test cho notification scripts (`.github/scripts`), không có test UI. Vì vậy mỗi task dùng chuỗi kiểm chứng: `npm run typecheck` → `npm run lint` → `npm run build` → kiểm tra thị giác nêu rõ. Không viết test mới (quyết định của spec mục 7).

## Global Constraints

- Nhánh `redesign/ui-hallmark`; mỗi task một commit, format Conventional Commits (`feat:`/`refactor:`/`style:`), summary tiếng Anh ngắn, imperative.
- CẤM thêm npm dependency. Chỉ thay Google Fonts link trong `index.html`.
- Giữ nguyên TÊN token hiện có trong `@theme`: `--color-background, --color-surface, --color-surface-elevated, --color-primary, --color-primary-hover, --color-on-primary, --color-secondary, --color-text-primary, --color-text-secondary, --color-border, --color-focus, --color-success, --color-on-success, --color-warning, --color-danger, --color-on-danger, --color-info, --color-border-default, --radius-control, --radius-card, --radius-dialog, --shadow-*`. Đổi GIÁ TRỊ theo spec §3.1. Token mới thêm: `--color-paper` (= background), `--color-accent` (= primary), `--color-accent-ink`, `--font-mono`, `--ease-out`, `--ease-in`, `--ease-in-out`, `--dur-micro: 120ms`, `--dur-short: 220ms`, `--dur-long: 420ms`.
- Giữ nguyên chữ ký public của mọi primitive (Button/Dialog/…), store, hook, service. Chỉ đổi JSX render + className + giá trị token.
- Comment code: tối đa 1 dòng tiếng Việt giải thích "tại sao". Functional components, không `React.FC`. 2-space, single quotes, print width 100.
- Copy UI: tiếng Việt sentence case; dấu `…` thay `...`; cấm uppercase tracking-widest cho label thường; label nút = động từ cụ thể.
- Cấm tuyệt đối (AI tells): gradient text, gradient tím-xanh, glassmorphism trang trí (blur CHỈ cho phép trên N5 nav pill và scrim overlay), neon glow, card-in-card, icon-tile card, grid 3 cột đều icon-trên-heading, eyebrow uppercase mọi section, heading italic, emoji làm icon, số liệu bịa, `transition-all`, `hover:scale-105` phổ quát, focus ring animate-in, toast ăn mừng, `#000`/`#fff` tuyệt đối.
- Motion: chỉ `transform` + `opacity`; easing từ token; exit = 75% enter; `prefers-reduced-motion` phải còn nguyên (block toàn cục trong `index.css` giữ lại).
- Focus ring: `:focus-visible` outline 2px `--color-focus`, offset 2-3px, KHÔNG transition khi xuất hiện.
- Ảnh poster `aspect-2/3`, track grid `minmax(0,1fr)`; chữ hiển thị dài truncate không wrap 2 dòng với nút/nav.

## Review Focus

1. **Label tiếng Việt dài ở bottom nav 5 tab @320px** — kỳ vọng: không tràn ngang, không wrap 2 dòng; `text-[11px]` + `truncate` + `whitespace-nowrap`. → kiểm chứng ở Task 1 bước xem 320px.
2. **Poster thiếu/ảnh lỗi** — kỳ vọng: khối placeholder `--color-surface-elevated` cùng `aspect-2/3`, không đổi layout (CLS=0). → Task 7 (swimlane) + Task 15 (profile) có bước xem với phim không poster.
3. **Tương phản light mode với accent hổ phách** — kỳ vọng: chữ trên nền paper đạt ≥4.5:1, accent-link ≥4.5:1 (dùng giá trị accent sáng đã tính trong Task 0). → Task 0 bước kiểm tra devtools contrast cả 2 theme.
4. **Dialog mất focus trap sau khi restyle** — kỳ vọng: Tab xoay vòng trong dialog, Escape đóng, focus trả về trigger (cơ chế `useFocusTrap` giữ nguyên). → Task 4 + Task 16 bước smoke bàn phím.
5. **Deep-link `/movie/:id` tải lạnh (F5 trực tiếp)** — kỳ vọng: fetch TMDB OK, map trạng thái cá nhân từ `useMovieStore`, nút Back quay lại đúng trang trước. → Task 9 bước kiểm tra deep-link.

---

## CHẶNG 0 — Nền tảng token

### Task 0: Nhánh + tokens + fonts + DESIGN.md

**Files:**
- Create: nhánh `redesign/ui-hallmark`
- Modify: `src/index.css` (toàn bộ), `index.html:40-45` (fonts link), `index.html:6-7` (theme-color), `DESIGN.md` (ghi đè)

**Interfaces:**
- Produces: token system cho mọi task sau — tên token ở Global Constraints; giá trị dark/light nêu đúng ở Step 2.

- [ ] **Step 1: Tạo nhánh**

```bash
git checkout -b redesign/ui-hallmark
```

- [ ] **Step 2: Viết lại `src/index.css`**

Giữ nguyên cấu trúc file hiện có (`@import 'tailwindcss'` → `@custom-variant dark` → `@theme` → `.dark` → `@layer base` → `@utility cv-auto`). Chỉ đổi giá trị + thêm token mới:

Dark (block `.dark`) — anchor hue 65 ấm:
- `--color-background: oklch(15% 0.012 65)`; `--color-surface: oklch(19% 0.014 65)`; `--color-surface-elevated: oklch(23% 0.016 65)`
- `--color-text-primary: oklch(93% 0.008 80)`; `--color-text-secondary: oklch(72% 0.01 70)`; `--color-secondary: oklch(58% 0.012 65)`
- `--color-border: oklch(30% 0.012 65)`; `--color-border-default: oklch(93% 0.008 80 / 0.08)`
- `--color-primary: oklch(78% 0.155 70)` (hổ phách); `--color-primary-hover: oklch(83% 0.14 75)`; `--color-on-primary: oklch(16% 0.02 70)`
- `--color-focus: oklch(83% 0.14 75)`
- Status: `--color-success: oklch(74% 0.15 150)` + `--color-on-success: oklch(16% 0.02 70)`; `--color-warning: oklch(80% 0.14 85)` + on = tối; `--color-danger: oklch(66% 0.19 25)` + on = sáng `oklch(96% 0.01 25)`; `--color-info: oklch(72% 0.11 230)` + on = tối
- Shadow: bỏ glow — `--shadow-card: 0 1px 2px oklch(10% 0.01 65 / 0.4)`; `--shadow-elevated: 0 4px 16px oklch(10% 0.01 65 / 0.5)`; xóa `--shadow-premium*`, `--shadow-glass` khỏi `@theme` (grep toàn src trước khi xóa: nếu còn chỗ dùng thì thay bằng `--shadow-card`)

Light (`:root` mặc định):
- `--color-background: oklch(97.5% 0.008 85)` (kem ấm); `--color-surface: oklch(99% 0.005 90)`; `--color-surface-elevated: oklch(100% 0 0)` KHÔNG — dùng `oklch(99.3% 0.004 90)`
- `--color-text-primary: oklch(21% 0.012 65)`; `--color-text-secondary: oklch(45% 0.012 65)`; `--color-secondary: oklch(55% 0.012 70)`
- `--color-border: oklch(88% 0.01 80)`; `--color-border-default: oklch(21% 0.012 65 / 0.06)`
- `--color-primary: oklch(58% 0.145 65)`; `--color-primary-hover: oklch(52% 0.15 62)`; `--color-on-primary: oklch(98% 0.01 90)`
- `--color-focus: oklch(58% 0.145 65)`
- Status light: success `oklch(45% 0.12 150)`, warning `oklch(50% 0.12 80)`, danger `oklch(50% 0.19 25)`, info `oklch(48% 0.11 230)`, on-* = `oklch(98% 0.01 90)`

Cả hai theme, thêm token mới + radius + font + motion:
- `--color-paper: var(--color-background)`; `--color-accent: var(--color-primary)`; `--color-accent-ink: var(--color-on-primary)` (đặt trong `@theme` với giá trị thật tương ứng, không tham chiếu chéo)
- `--radius-control: 10px`; `--radius-card: 14px`; `--radius-dialog: 20px`
- `--font-sans: 'Be Vietnam Pro', sans-serif`; `--font-display: 'Bricolage Grotesque', 'Be Vietnam Pro', sans-serif`; `--font-mono: 'JetBrains Mono', ui-monospace, monospace`
- `--ease-out: cubic-bezier(0.16, 1, 0.3, 1)`; `--ease-in: cubic-bezier(0.7, 0, 0.84, 0)`; `--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)`; `--dur-micro: 120ms`; `--dur-short: 220ms`; `--dur-long: 420ms`
- Trong `@layer base`: giữ toàn bộ hiện có (focus-visible, scrollbar, reduced-motion, `h1,h2,h3,.font-display` → đổi thành `font-family: var(--font-display)`), THÊM: `html, body { overflow-x: clip; }` và keyframe `shimmer` cho skeleton (`background-position` — duy nhất được phép animate ngoài transform/opacity vì là progress indicator), class `.animate-shimmer` + `.text-mono-data { font-family: var(--font-mono); font-variant-numeric: tabular-nums; }`
- Keyframes cũ `slide-in-right/slide-down/fade-in/zoom-in-95` + `--animate-*`: giữ (đang được dùng), đổi easing `ease-out` → `var(--ease-out)`
- Thêm trong `.dark`: `--bg-bloom: oklch(78% 0.155 70 / 0.07)`; `--bg-bloom-2: oklch(78% 0.155 70 / 0.05)`; trong light: giá trị `transparent` (login không bloom ở light, giữ mặt phẳng) — thêm `--color-scrim` cả 2 theme (dark `oklch(8% 0.01 65 / 0.65)`, light `oklch(20% 0.01 65 / 0.45)`)
- Giữ nguyên `@utility cv-auto`, keyframes Random Picker (`pulse-soft`, `card-float`, `.movie-wheel-container`, `.center-card-glow` — đổi glow thành ring `0 0 0 1px color-mix(in srgb, var(--color-primary) 30%, transparent)` không còn shadow màu)

- [ ] **Step 3: Đổi fonts + theme-color trong `index.html`**

Link Google Fonts mới (thay link cũ dòng 40-45):

```html
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
```

theme-color: light `#f7f4ec`, dark `#211a14` (xấp xỉ oklch trên, hex cho meta).

- [ ] **Step 4: Ghi đè `DESIGN.md`**

Viết `DESIGN.md` mới theo spec §3 (genre, theme 2 bảng OKLCH, typography, layout, nav, motion, icon, anti-goals mục 6, chặng triển khai). Xóa hoàn toàn nội dung "Neon Cinema Lounge". Frontmatter YAML mới phản chiếu token mới.

- [ ] **Step 5: Kiểm chứng**

Run: `npm run typecheck && npm run lint && npm run build`
Expected: cả 3 xanh. Nếu lint báo `--shadow-premium*` còn dùng → thay chỗ dùng bằng `--shadow-card` rồi chạy lại.
Visual: `npm run dev` — app vẫn chạy (màu đổi toàn cục), dark + light đều đọc được chữ.

- [ ] **Step 6: Commit**

```bash
git add src/index.css index.html DESIGN.md
git commit -m "feat: hallmark dark-warm token system, fonts, design doc"
```

⛔ **ĐIỂM DỪNG CHẶNG 0:** báo user xem dark/light tổng thể trước khi vào Chặng 1.

---

## CHẶNG 1 — Shell + primitives

### Task 1: navigation 5 mục + MobileBottomNav + Layout

**Files:**
- Modify: `src/shared/config/navigation.ts` (toàn bộ), `src/shared/components/layout/MobileBottomNav.tsx` (toàn bộ), `src/app/components/Layout.tsx:30` (padding calc), `src/app/components/Navbar.tsx` (cập nhật nguồn items — liên quan Task 2 nhưng đổi import ở đây)

**Interfaces:**
- Produces:
```ts
// navigation.ts
export type NavKey = 'home' | 'search' | 'albums' | 'calendar' | 'profile';
export interface NavigationItem { key: NavKey; to: string; label: string; match: 'exact' | 'prefix'; }
export const NAV_ITEMS: NavigationItem[];                    // 4 mục tĩnh (profile không có uid)
export function buildNavItems(uid?: string): NavigationItem[]; // 5 mục; uid có → profile cuối
export function isNavItemActive(pathname: string, item: Pick<NavigationItem, 'to' | 'match'>): boolean; // giữ nguyên
```
- Labels: `/` "Trang chủ" · `/search` "Tìm kiếm" · `/albums` "Albums" · `/calendar` "Lịch chiếu" · `/profile/{uid}` "Cá nhân" (match `prefix`).

- [ ] **Step 1:** Viết `buildNavItems` + `key` như interface trên; `NAV_ITEMS` = `buildNavItems()` không uid.
- [ ] **Step 2:** Viết lại `MobileBottomNav`: nav full-width fixed bottom, `bg-surface border-t border-border` (bỏ floating card), cao `h-16`, grid 5 cột đều; mỗi tab: icon Lucide (Home/Search/Folder/CalendarDays/User theo `key`) 22px + label `text-[11px] leading-tight whitespace-nowrap`; active: `text-primary font-semibold`, inactive `text-text-secondary`; bỏ dot indicator, thay bằng icon stroke 2/1.5; `aria-current`, `aria-label` giữ; safe-area: `style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}`.
- [ ] **Step 3:** `Layout.tsx` — `pb-[calc(4rem+env(safe-area-inset-bottom,0px))]` (nav giờ full-width h-16, không còn offset 12px).
- [ ] **Step 4:** Navbar — đổi `NAV_ITEMS.map` → `buildNavItems(user?.uid).map` (import `useAuth` đã có), icon map theo `key` (thêm `profile: <User/>`).
- [ ] **Step 5:** Kiểm chứng — typecheck/lint/build xanh; dev @320px: 5 tab không tràn, không wrap; `/profile/:uid` active đúng; desktop nav không lỗi.
- [ ] **Step 6:** Commit `feat: five-tab flat bottom nav and nav config`

### Task 2: Navbar skin + Footer

**Files:**
- Modify: `src/app/components/Navbar.tsx` (chỉ className/skin — giữ nguyên toàn bộ logic dropdown/menu/aria), `src/shared/components/layout/Footer.tsx` (toàn bộ, 64 dòng)

- [ ] **Step 1:** Navbar pill: `bg-surface/90 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75 border-border rounded-full` (bỏ `sm:rounded-full` — pill cả mobile); link active: `text-primary font-semibold bg-primary/8`, hover `bg-primary/8`; bỏ hover đổi màu theo primary/5 cũ trên item thường; avatar fallback `bg-primary/15 text-primary`; dropdown: `bg-surface-elevated border-border rounded-card shadow-elevated`, item hover `bg-primary/10`; toàn bộ transition: `transition-colors duration-200 ease-[var(--ease-out)]` (cấm `transition` không chỉ định).
- [ ] **Step 2:** Footer → Ft2 inline single line: một hàng `border-t border-border py-6 px-4 md:px-6 max-w-7xl mx-auto`, nội dung: logo text nhỏ trái · giữa "CineMOB — phòng chiếu riêng của bạn" (muted) · phải năm `©` + link repo nếu có; mobile stack dọc căn giữa. Không cột link.
- [ ] **Step 3:** Kiểm chứng — 3 lệnh xanh; xem dropdown mở/đóng + Escape còn hoạt động (bàn phím).
- [ ] **Step 4:** Commit `style: navbar pill skin and inline footer`

### Task 3: Primitives I — Button, IconButton, PageHeader, Loading, SkeletonCard, Pagination

**Files:**
- Modify: `src/shared/components/ui/Button.tsx`, `IconButton.tsx`, `PageHeader.tsx`, `Loading.tsx`, `SkeletonCard.tsx`, `Pagination.tsx`

**Interfaces:** giữ nguyên 100% props hiện có. Chỉ đổi giá trị class.

- [ ] **Step 1:** Button: `primary` → `bg-primary text-on-primary hover:bg-primary-hover active:translate-y-px border border-transparent`; `secondary` → `bg-transparent text-text-primary border-border hover:border-primary hover:text-primary` (outline chip, không nền); `ghost` giữ, hover `bg-primary/8`; `danger` → `bg-danger text-on-danger hover:brightness-110`; sizes giữ; `transition` → `transition-[background-color,border-color,color,transform] duration-[var(--dur-short)] ease-[var(--ease-out)]`; loading spinner = Lucide `Loader2` `animate-spin` (nếu chưa).
- [ ] **Step 2:** IconButton: hit target `min-h-10 min-w-10`, hover `bg-primary/8 text-primary`, giữ aria-label bắt buộc.
- [ ] **Step 3:** PageHeader: h1 `font-display font-bold tracking-tight text-3xl md:text-4xl`; desc `text-text-secondary`; đồng bộ với memory "PageHeader desc động" — giữ nguyên API.
- [ ] **Step 4:** Loading: spinner `text-primary`; SkeletonCard: `bg-surface-elevated` + `.animate-shimmer` gradient `via-primary/5`, `aspect-2/3` variant giữ.
- [ ] **Step 5:** Pagination: nút trang `text-mono-data`, active `bg-primary text-on-primary`, hover `bg-primary/8`; cấm wrap 2 dòng.
- [ ] **Step 6:** Kiểm chứng — 3 lệnh xanh; smoke: nút primary/secondary/ghost/loading visible đúng ở dark + light.
- [ ] **Step 7:** Commit `style: hallmark skin for core button and feedback primitives`

### Task 4: Primitives II — Dialog, Dropdown, MultiSelectDropdown

**Files:**
- Modify: `src/shared/components/ui/Dialog.tsx`, `Dropdown.tsx`, `MultiSelectDropdown.tsx`, `src/index.css` (thêm `--color-scrim`)

- [ ] **Step 1:** Dialog: overlay `bg-oklch` scrim → class `bg-black/60` thay bằng token: thêm vào index.css `--color-scrim` (dark `oklch(8% 0.01 65 / 0.65)`, light `oklch(20% 0.01 65 / 0.45)`), overlay `bg-scrim` KHÔNG blur; panel `bg-surface-elevated rounded-dialog border border-border shadow-elevated`; motion: giữ contract framer hiện có (`DIALOG_VARIANTS`) — chỉ đổi duration/easing theo token nếu hardcode; giữ portal/focus-trap/scroll-lock nguyên vẹn.
- [ ] **Step 2:** Dropdown + MultiSelect: trigger/panel dùng `bg-surface-elevated rounded-control border-border shadow-elevated`; option selected: `bg-primary/10 text-primary` + icon check; `aria-*` hiện có giữ nguyên; option focus `bg-primary/8`.
- [ ] **Step 3:** Kiểm chứng — 3 lệnh xanh; smoke bàn phím: mở AddMovie (Tab xoay vòng, Escape, focus trả về) — Review Focus #4.
- [ ] **Step 4:** Commit `style: dialog and dropdown hallmark skin`

### Task 5: Primitives III — DatePicker, TimePicker, Switch, EmptyState, ErrorState, Toast/Alert

**Files:**
- Modify: `src/shared/components/ui/DatePicker.tsx`, `TimePicker.tsx`, `Switch.tsx`, `EmptyState.tsx`, `ErrorState.tsx`, `src/shared/components/feedback/ToastContainer.tsx`, `AlertContainer.tsx`

- [ ] **Step 1:** DatePicker/TimePicker: panel `bg-surface-elevated rounded-card border-border shadow-elevated`; ngày chọn `bg-primary text-on-primary rounded-control`; ngày hôm nay `border border-primary/50 text-mono-data`; format hiển thị giữ `dd/mm/yyyy` (memory: không dùng input date native).
- [ ] **Step 2:** Switch: track off `bg-surface-elevated border-border`, on `bg-primary`; thumb `bg-on-primary` khi on; hit ≥44px; không spring.
- [ ] **Step 3:** EmptyState: icon Lucide `text-text-secondary` 28px, title `font-display font-semibold`, 1 dòng giải thích, 1 nút hành động duy nhất (copy.md 3 beat — giữ props API).
- [ ] **Step 4:** ErrorState: icon `text-danger`, tiêu đề nêu thứ vỡ, nút "Thử lại"; Alert dialog confirm giữ logic, skin theo Dialog.
- [ ] **Step 5:** Toast/Alert container: vị trí đáy (giữ nguyên như hiện có), toast `bg-surface-elevated border-border rounded-card shadow-elevated`, icon theo tone (success/danger/warning/info + icon, KHÔNG màu một mình); toast thành công im lặng theo stance — không đổi logic store, chỉ skin.
- [ ] **Step 6:** Kiểm chứng — 3 lệnh xanh; smoke: toast lỗi hiện icon + text; date picker mở/đóng bàn phím.
- [ ] **Step 7:** Commit `style: form controls, states and toast hallmark skin`

⛔ **ĐIỂM DỪNG CHẶNG 1:** user xem khung app mới (nav, pill, nút, dialog, toast) trước Chặng 2.

---

## CHẶNG 2 — Khám phá

### Task 6: TMDB service mở rộng

**Files:**
- Modify: `src/features/search/services/tmdb/discoveryService.ts` (thêm 2 hàm), `src/features/search/services/tmdb/movieService.ts` (thêm 1 hàm), `decoders.ts` (nếu cần decoder mới)

**Interfaces:**
- Produces (export thường như file hiện có):
```ts
export const getNowPlayingMovies = async (page?: number) => Promise<TMDBMovieResult[]>;
export const getUpcomingMovies = async (page?: number) => Promise<TMDBMovieResult[]>;
export const getMovieRecommendations = async (tmdbId: number | string, page?: number) => Promise<TMDBMovieResult[]>;
```
- Đã có sẵn, KHÔNG viết lại: `getTrendingMovies`, `getMovieCredits`, `getMovieDetails`, `getMovieVideos` (xác nhận bằng grep trước khi viết).

- [ ] **Step 1:** Đọc pattern hiện có của `getTrendingMovies` (path, decode, cache, error) rồi thêm 3 hàm đúng pattern: `/movie/now_playing`, `/movie/upcoming`, `/movie/{id}/recommendations`.
- [ ] **Step 2:** Kiểm chứng — typecheck/lint/build xanh.
- [ ] **Step 3:** Commit `feat: add now playing, upcoming and recommendations tmdb reads`

### Task 7: Dashboard — hero + rails

**Files:**
- Create: `src/features/dashboard/components/DashboardHero.tsx`, `src/features/dashboard/components/MovieSwimlane.tsx`
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`, `src/features/dashboard/hooks/useDashboard.ts` (thêm state load 3 nguồn TMDB), `src/features/movies/components/MovieCard.tsx` (skin)

**Interfaces:**
- Consumes: `getNowPlayingMovies/getTrendingMovies/getUpcomingMovies`, `TMDBMovieResult` (poster_path, backdrop_path, title, vote_average, release_date, genre_ids, id)
- Produces: `MovieSwimlane({ title: string; items: TMDBMovieResult[] | Movie[]; onOpen?: (item) => void })`; `DashboardHero({ items: TMDBMovieResult[] })`

- [ ] **Step 1:** `useDashboard` mở rộng: thêm `discovery = { nowPlaying, trending, upcoming, loading }` — fetch song song, error im lặng (rails ẩn khi rỗng, không ErrorState toàn trang cho discovery).
- [ ] **Step 2:** `DashboardHero`: section đầu trang, cao `clamp(340px, 48vh, 520px)`, backdrop `w-full h-full object-cover` + gradient 2 stop từ `--color-background` (đáy lên) và trái; nội dung đè: title `font-display text-3xl md:text-5xl font-bold` + năm (`text-mono-data`) + genres pills (outline, không accent) + 2 nút (primary "Xem chi tiết" → `/movie/{id}`, ghost "Thêm vào theo dõi" giữ logic watchlist hiện có nếu có, không thì bỏ nút); dot indicators + nút prev/next, tự động chuyển 6s, **dừng khi hover/focus** (`onMouseEnter/Leave`, `onFocus/Blur`), swipe qua pointer events; `fetchpriority="high"` ảnh slide đầu, slide sau `loading="lazy"`; reduced-motion: không auto-rotate.
- [ ] **Step 3:** `MovieSwimlane`: header hàng = title `font-display text-xl font-bold` trái + "Xem tất cả →" (C3 typographic link, chỉ khi có đích); rail `flex gap-3 overflow-x-auto snap-x` scrollbar mảnh, card poster `aspect-2/3 min-w-[128px] md:min-w-[152px]` + title 1 dòng truncate + năm `text-mono-data text-xs text-text-secondary`; placeholder poster khi thiếu ảnh (Review Focus #2); Track `minmax(0,1fr)` không áp dụng (rail flex).
- [ ] **Step 4:** `DashboardPage` dựng lại thứ tự: Hero → 3 rails TMDB (Đang chiếu / Thịnh hành tuần này / Sắp ra mắt) → phần thư viện (Task 8). Keep `max-w-7xl mx-auto px-4 md:px-6` cho rails; hero full-bleed (`w-full`), container content width chỉ cho text đè.
- [ ] **Step 5:** Kiểm chứng — 3 lệnh xanh; dev: hero chuyển slide + pause hover; rail cuộn ngang mượt @375px; poster lỗi không vỡ layout.
- [ ] **Step 6:** Commit `feat: cinematic dashboard hero and discovery rails`

### Task 8: Dashboard — thư viện cá nhân

**Files:**
- Create: `src/features/dashboard/components/UserLibrarySection.tsx`
- Modify: `src/features/dashboard/pages/DashboardPage.tsx`, `src/features/dashboard/hooks/useDashboard.ts` (phần library hiện có giữ, chỉ render mới)

- [ ] **Step 1:** `UserLibrarySection`: 2 hàng từ dữ liệu store hiện có — "Vừa xem gần đây" (status history, sort watched_at desc, tối đa 12) + "Muốn xem của bạn" (status watchlist, tối đa 12); card dùng MovieCard; mỗi hàng tiêu đề + đếm số `text-mono-data` ("· 24" ).
- [ ] **Step 2:** Nút đáy phần: secondary full-width "Mở toàn bộ thư viện và bộ lọc" → mở filter/sort view hiện có của dashboard (DashboardFilters/DashboardTabs giữ nguyên cơ chế — skin của chúng nằm trong Task 10 phạm vi filters; bước này chỉ thêm nút mở).
- [ ] **Step 3:** Khi thư viện rỗng: EmptyState 3 beat ("Chưa có phim nào trong thư viện." + 1 dòng + nút "Thêm phim đầu tiên" → mở AddMovie store hiện có).
- [ ] **Step 4:** Kiểm chứng — 3 lệnh xanh; dev: có dữ liệu → 2 hàng đúng; rỗng → EmptyState.
- [ ] **Step 5:** Commit `feat: personal library rows on dashboard`

### Task 9: `/movie/:id` + chuyển modal → route

**Files:**
- Create: `src/features/movies/pages/MovieDetailPage.tsx`, `src/features/movies/hooks/useOpenMovieDetail.ts`
- Modify: `src/App.tsx` (import lazy + `<Route path="/movie/:id" element={<MovieDetailPage />} />` trong `AnimatedRoutes`), 4 caller: `src/features/dashboard/hooks/useDashboard.ts`, `src/features/calendar/hooks/useReleaseCalendar.ts`, `src/features/albums/pages/AlbumDetailPage.tsx`, `src/features/movies/hooks/useRandomPicker.ts`
- Modify: `src/features/movies/services/tmdb` — không; dùng service hiện có

**Interfaces:**
- Consumes: `getMovieDetails`, `getMovieCredits`, `getMovieVideos` (đã có); `useMovieStore` (map trạng thái: so khớp `m.source === 'tmdb' && String(m.id) === id`)
- Produces: `useOpenMovieDetail(): (movie: Movie) => void` — `movie.source === 'tmdb'` → `navigate('/movie/' + movie.id)`; ngược lại → `openDetailModal(movie)` (store giữ nguyên). Route param `:id` = TMDB id.

- [ ] **Step 1:** Viết `useOpenMovieDetail` đúng interface trên (hook trong `features/movies/hooks`, dùng `useNavigate` + `useMovieDetailStore`).
- [ ] **Step 2:** Migrate 4 caller sang hook (grep `openDetailModal` sau khi xong phải còn đúng 1 định nghĩa store).
- [ ] **Step 3:** `MovieDetailPage`: layout photographic — backdrop full-bleed `h-[42vh] min-h-[280px] object-cover` + gradient 2 stop xuống `--color-background`; nút back trái trên (`IconButton` "Quay lại", `navigate(-1)`); poster nhỏ + title `font-display text-3xl md:text-4xl` + metadata pills (năm · runtime phút `text-mono-data` · vote → sao 5 mức: `Math.round(vote_average / 2)` nửa sao qua 2 icon chồng); thân: status/rating cá nhân từ store nếu có (readonly ở đây — sửa qua modal đã có); cast rail ngang avatar tròn 56px + tên (từ `getMovieCredits`, tối đa 20, thiếu avatar → khối initials); recommendations rail (từ Task 6); video trailer: nút mở Dialog chứa iframe YouTube (từ `getMovieVideos`, site==='YouTube', type==='Trailer') — KHÔNG autoplay.
- [ ] **Step 4:** Đăng ký route + lazy import trong `App.tsx`.
- [ ] **Step 5:** Kiểm chứng — 3 lệnh xanh; dev: click phim từ dashboard → trang mới; **F5 trực tiếp `/movie/550`** tải đúng (Review Focus #5); Back về trang trước đúng scroll; phim manual vẫn mở modal.
- [ ] **Step 6:** Commit `feat: dedicated movie detail page with modal fallback`

### Task 10: Search + TMDBMovieCard + PersonDetail

**Files:**
- Modify: `src/features/search/pages/SearchPage.tsx`, `SearchFilters.tsx`, `SearchResults.tsx`, `TMDBMovieCard.tsx`, `src/features/search/pages/PersonDetailPage.tsx`, `person/PersonMovieSection.tsx`

- [ ] **Step 1:** SearchPage: ô search lớn đầu trang (`bg-surface border-border rounded-control h-12 text-lg`, icon trái, focus ring accent); debounce 300ms + `aria-live="polite"` đếm kết quả (kiểm tra logic hiện có, chỉ skin); filters giữ cơ chế, skin theo Dropdown/MultiSelect mới.
- [ ] **Step 2:** SearchResults + TMDBMovieCard: grid poster `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3`, track `minmax(0,1fr)`; card: poster `aspect-2/3` + title truncate + năm mono + nút hành động hiện có (thêm vào thư viện) giữ logic; click card → `useOpenMovieDetail`.
- [ ] **Step 3:** PersonDetailPage: header avatar tròn + tên display + bio; filmography theo PersonMovieSection hiện có, skin swimlane.
- [ ] **Step 4:** Kiểm chứng — 3 lệnh xanh; dev: tìm "batman" có kết quả, click vào `/movie/:id`; 320px grid 2 cột không tràn.
- [ ] **Step 5:** Commit `style: search page and person detail hallmark skin`

⛔ **ĐIỂM DỪNG CHẶNG 2:** user dùng thử dashboard + search + `/movie/:id`.

---

## CHẶNG 3 — Quản lý + modals

### Task 11: Albums + AlbumDetail + AlbumSelectorModal

**Files:**
- Modify: `src/features/albums/pages/AlbumsPage.tsx`, `AlbumDetailPage.tsx`, `src/features/albums/components/AlbumSelectorModal.tsx`

- [ ] **Step 1:** AlbumsPage: danh sách album dạng spec-sheet rows (hairline `border-b border-border`, không card lồng): tên album `font-display font-semibold` + đếm phim mono + updatedAt; hover row `bg-primary/5`; hành động sửa/xóa icon phải (giữ logic, xóa dùng confirm Alert hiện có).
- [ ] **Step 2:** AlbumDetail: header tên + đếm + nút; grid poster như SearchResults; random pick trong album giữ logic.
- [ ] **Step 3:** AlbumSelectorModal: skin theo Dialog; danh sách album checkbox rows; nút tạo mới giữ.
- [ ] **Step 4:** Kiểm chứng + Commit `style: albums management hallmark skin`

### Task 12: Calendar

**Files:**
- Modify: `src/features/calendar/pages/ReleaseCalendarPage.tsx`, `CalendarGrid.tsx`, `CalendarStats.tsx`, `EpisodeList.tsx`

- [ ] **Step 1:** Grid tuần: ô ngày `min-h-24 border-border/60`, ngày hôm nay `ring-1 ring-primary`; episode row: poster mini 40px + tên + S/E `text-mono-data`; CalendarStats: số liệu `font-mono-data text-2xl font-semibold` + label thường (không uppercase).
- [ ] **Step 2:** Kiểm chứng + Commit `style: release calendar hallmark skin`

### Task 13: Stats

**Files:**
- Modify: `src/features/stats/pages/StatsPage.tsx`, `StatsCard.tsx`

- [ ] **Step 1:** StatsCard: số lớn `font-display text-3xl md:text-4xl font-bold tabular-nums` + label `text-text-secondary text-sm`; không icon tile; grid bất đối xứng `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` với card đầu `lg:col-span-2` (số quan trọng nhất — tổng phim); Recharts: bỏ gradient fill nếu có → fill `color-mix(in srgb, var(--color-primary) 25%, transparent)` stroke `var(--color-primary)` 2px, grid line `color-mix(in srgb, var(--color-border) 60%, transparent)`, tooltip skin surface-elevated.
- [ ] **Step 2:** Kiểm chứng + Commit `style: stats page accent discipline`

### Task 14: Profile

**Files:**
- Modify: `src/features/profile/pages/MemberProfilePage.tsx`, `MemberProfileCard.tsx`, `MovieListSection.tsx`, `OwnProfileEditor.tsx`, `ProfileMeta.tsx`, `ProfileMovieCard.tsx`, `avatar/AvatarCropView.tsx`, `user/MemberSearchModal.tsx`, `user/UserCard.tsx`

- [ ] **Step 1:** Profile header: avatar 96px + tên display + meta (đếm phim mono); nút sửa profile secondary; MemberSearchModal + UserCard skin theo Dialog/row mới.
- [ ] **Step 2:** MovieListSection: rows hoặc grid poster; ProfileMovieCard giữ logic trạng thái xem; Poster thiếu → placeholder (Review Focus #2).
- [ ] **Step 3:** OwnProfileEditor + AvatarCropView: form skin (label trên, input `bg-surface border-border rounded-control focus:border-primary`), crop giữ logic.
- [ ] **Step 4:** Kiểm chứng + Commit `style: profile pages hallmark skin`

### Task 15: AddMovieModal + sub-forms

**Files:**
- Modify: `src/features/movies/components/AddMovieModal.tsx`, `add-movie/AlbumSection.tsx`, `MovieFormFields.tsx`, `PosterPreview.tsx`, `RatingSection.tsx`, `StatusToggle.tsx`, `TVProgressSection.tsx`

- [ ] **Step 1:** Modal fullscreen-mobile/wide-dialog giữ nguyên (contract hiện có); header title + close; form: label trên (`text-sm text-text-secondary`), input skin thống nhất Task 14.step3, error text `text-danger text-sm` + `aria-invalid` giữ; StatusToggle → segmented control (2 nút pill, active `bg-primary text-on-primary`); RatingSection: sao hiện có giữ logic, skin accent; PosterPreview: khung `aspect-2/3 rounded-card border-border` + URL lỗi → placeholder.
- [ ] **Step 2:** Smoke bàn phím toàn form (Review Focus #4): Tab theo thứ tự, Escape, submit lỗi hiện 3-part error.
- [ ] **Step 3:** Kiểm chứng + Commit `style: add movie modal hallmark skin`

### Task 16: RandomPicker + MovieDetailModal fallback

**Files:**
- Modify: `src/features/movies/components/RandomPickerModal.tsx`, `random-picker/PickerWheel.tsx`, `MovieDetailModal.tsx`

- [ ] **Step 1:** RandomPicker: giữ NGUYÊN wheel 3D + confetti + âm thanh + choreography 3150ms (brand asset); chỉ đổi: nền modal `bg-surface-elevated`, chữ display font mới, nút quay primary accent; `.center-card-glow` đã đổi ở Task 0 thành ring.
- [ ] **Step 2:** MovieDetailModal: giờ chỉ phục vụ manual entry — skin theo Dialog + metadata pills giống MovieDetailPage; không thêm tính năng.
- [ ] **Step 3:** Kiểm chứng + Commit `style: random picker and manual detail modal skin`

### Task 17: Login + NotFound + slop-test cuối

**Files:**
- Modify: `src/features/auth/components/Login.tsx`, `src/shared/pages/NotFoundPage.tsx`, `src/index.css` (bloom nếu cần)

- [ ] **Step 1:** Login: màn hình atmospheric duy nhất ngoài dashboard — 1-2 radial bloom ấm (fixed, không animate) dùng token `--bg-bloom` đã định nghĩa ở Task 0 (`background-image: radial-gradient(40% 40% at 20% 10%, var(--bg-bloom), transparent), radial-gradient(35% 35% at 85% 90%, var(--bg-bloom-2), transparent)` chỉ trên `.dark`); card login `bg-surface-elevated rounded-dialog border-border`; logo giữ; nút Google primary.
- [ ] **Step 2:** NotFoundPage: số 404 `font-mono-data text-7xl text-primary/40` + 1 câu + nút về trang chủ.
- [ ] **Step 3:** Slop-test toàn app theo spec mục 6 (anti-goals): grep `transition-all`, `scale-105`, `bg-clip-text`, `backdrop-blur` (chỉ nav + scrim được phép), `tracking-widest` + `uppercase` cùng dòng, emoji icon; sửa hết.
- [ ] **Step 4:** Matrix responsive: 320/375/768/1024/1440 × dark/light từng trang (Review Focus #1-3), sửa những gì hỏng.
- [ ] **Step 5:** `npm test` (notification scripts) + `npm run typecheck && npm run lint && npm run format:check && npm run build` — tất cả xanh. `format` nếu fail: `npm run format` rồi commit riêng.
- [ ] **Step 6:** Commit `style: login bloom, 404 and final slop pass`

---

## Verification cuối (sau Task 17)

- Tự động: `npm test`, `npm run typecheck`, `npm run lint`, `npm run format:check`, `npm run build` — 5/5 xanh.
- Thủ công theo spec mục 7: đăng nhập, thêm/sửa/xóa phim (+undo nếu có), random picker, albums CRUD, calendar, stats, profile thành viên, `/movie/:id` deep-link + Back.
- `requesting-code-review` (subagent review toàn nhánh) → xử lý feedback → `finishing-a-development-branch` (để user merge).
