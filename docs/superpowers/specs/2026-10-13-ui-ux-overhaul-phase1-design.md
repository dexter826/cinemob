# CineMOB UI/UX Overhaul — Phase 1 Design Spec

- **Date:** 2026-10-13
- **Author:** Antigravity & CineMOB Core Team
- **Status:** Complete (Awaiting User Approval)
- **Target Scope:** Phase 1 (Foundation, App Shell, 5-Tab Navigation with Quick Log, Unified Cinematic Dashboard, Dedicated Movie Detail Page)
- **Design Benchmark:** Hybrid Apple TV / Netflix (Cinematic Visuals & Discovery) + Letterboxd (Cinephile Utility & Search-to-Log)

---

## 1. Intent & The Why

CineMOB is a Progressive Web App (PWA) built with React 19, TypeScript, Tailwind CSS v4, and Zustand, backed by Firebase and TMDB. The codebase currently comprises 147 source files with a stable backend integration, clean TypeScript compilation (0 errors), and established PWA caching/push infrastructure.

However, the current user interface presents several UX frictions that make it feel like a traditional web admin panel rather than an immersive native mobile cinema app:

1. **Modal Constraint:** Movie details are currently confined to a popup modal (`MovieDetailModal.tsx`), restricting viewport immersion, causing gesture/scroll conflicts on mobile devices, and lacking deep-linkable URLs.
2. **Navigation Rigidity:** The existing 4-tab mobile bottom bar lacks a quick-action trigger for cinephile logging and feels detached from native mobile navigation patterns.
3. **Flat Dashboard:** The home screen lacks the cinematic grandeur (edge-to-edge backdrop banners, smooth swimlane carousels) seen in modern streaming and cinema discovery platforms like Apple TV and Netflix.

Rather than executing a risky, ground-up rewrite that would discard working business logic, Firebase security rules, and TMDB caching, CineMOB is undergoing a **modular, phased UI/UX overhaul**. Phase 1 establishes the new design foundation, reimagines the app shell, and delivers the two most critical discovery screens: **Dashboard** and **Movie Details**.

---

## 2. Goals, Non-Goals & Anti-Goals

### 2.1 Goals (Phase 1)

- **Design Tokens & Theme Foundation:** Enhance `src/index.css` with deep cinema dark mode tokens, subtle hairline borders, and frosted glass (`backdrop-blur`) variables compatible with Tailwind CSS v4 `@theme`.
- **App Shell & 5-Tab Navigation:**
  - Introduce an iOS-grade floating frosted-glass bottom bar with 5 items:
    1. `Home` (`/`)
    2. `Search` (`/search`)
    3. `[+ Quick Log]` (Prominent elevated center action button triggering the Letterboxd-style Search-to-Log bottom sheet)
    4. `Lists & Calendar` (`/albums` with sub-toggle to `/calendar`)
    5. `Profile & Stats` (`/profile/:uid`)
  - Ensure safe-area-inset compliance (`env(safe-area-inset-bottom)`) for iPhone dynamic island / home indicator.
- **Unified Cinematic Dashboard (`/`):**
  - **Top Section (Streaming Discovery):** Full-bleed Hero Carousel showcasing trending/now-playing movies with auto-rotation, backdrop poster blur, genres pills, and direct CTA buttons. Followed by horizontal swimlanes ("Đang chiếu rạp", "Thịnh hành tuần này", "Sắp ra mắt").
  - **Bottom Section (Personal Library Integration):** "Tiếp tục xem / Vừa xem gần đây" và "Danh sách muốn xem của bạn" rows directly connected to the user's Firestore movies, with a "Mở toàn bộ thư viện & Bộ lọc" expander button preserving existing filter/sorting power.
- **Dedicated Movie Detail Route (`/movie/:id`):**
  - Create `src/features/movies/pages/MovieDetailPage.tsx` and register `<Route path="/movie/:id" element={<MovieDetailPage />} />` in `src/App.tsx`.
  - Feature an edge-to-edge backdrop header with gradient fade-out, floating back button, movie metadata pills (runtime, release date, TMDB rating converted to 5-star Letterboxd visual, certification), cast/crew avatar carousel, trailer embed preview, and persistent action bar (Want to Watch, Watched, Rate, Add to Album).
  - Cross-reference `movieStore.movies` to immediately display user's personal watched status/rating if the film is already in their library.
- **Mobbin Reference Grounding:** Ground components in real-world patterns extracted from Apple TV, Netflix, and Letterboxd on Mobbin.

### 2.2 Non-Goals (Deferred to Phases 2 & 3)

- Reworking the detailed statistics charts in `features/stats` (Recharts integration remains as-is for now; revamped in Phase 2).
- Overhauling the Custom Album creation and drag-and-drop mechanics in `features/albums` (deferred to Phase 3).
- Modifying the release calendar grid in `features/calendar` (deferred to Phase 3).
- Modifying Firebase Firestore schema, authentication rules, or writing custom non-TMDB backends.

### 2.3 Anti-Goals

- **No heavy new dependencies:** Do not introduce massive external UI libraries (e.g., MUI, AntD). Stick strictly to Tailwind v4, Lucide React, and Framer Motion.
- **No performance regression:** Maintain fast initial render times; ensure heavy hero backdrop images have low-res blur placeholders or gradient fallbacks.
- **No desktop breakage:** While mobile-first, layouts must remain responsive and centered on wide desktop viewports (`max-w-7xl` container wrapping).

---

## 3. Decisions & Architecture Specifications

### 3.1 Decisions Settled from User & Builder Check

1. **Trang chủ kết hợp (Unified Dashboard):**
   - Không chuyển Thư viện cá nhân sang trang khác. Trang chủ `/` phục vụ cả hai nhu cầu:
     1. Khám phá điện ảnh (Apple TV style: Hero Carousel + Swimlanes từ TMDB).
     2. Thư viện của bạn (Letterboxd style: Hàng "Muốn xem của bạn", "Vừa xem gần đây", và nút "Mở toàn bộ thư viện & Bộ lọc" để xem grid đầy đủ với filter năm/thể loại).
2. **Luồng Quick Log (+) (Search-to-Log Bottom Sheet):**
   - Bấm nút `+` ở giữa thanh Nav sẽ mở một Bottom Sheet chuẩn Letterboxd:
     - Ô input search gõ tên phim tức thì (có debounce 300ms, gọi TMDB search).
     - Danh sách gợi ý phim kèm năm và poster thu nhỏ.
     - Khi chọn một phim: Chuyển mượt sang form chấm sao (1-5 sao, hỗ trợ nửa sao), chọn ngày xem (mặc định hôm nay), và ghi chú ngắn $\rightarrow$ Bấm "Lưu nhật ký" là hoàn tất.
3. **Quy ước Route `:id` trên `/movie/:id`:**
   - `:id` đại diện cho TMDB Movie ID (chuẩn số nguyên, ví dụ `/movie/550`).
   - `MovieDetailPage` tự động load chi tiết từ TMDB qua `getMovieDetails(id)`, đồng thời tra cứu trong `useMovieStore.movies` để map trạng thái cá nhân (đã xem chưa, mấy sao, review gì).
   - Với phim nhập thủ công (manual entries) không có TMDB ID: Giữ fallback mở qua `MovieDetailModal` hoặc sub-route `/movie/manual/:docId`.
4. **Mở rộng TMDB Client:**
   - Cho phép bổ sung các hàm read-only an toàn vào `src/features/search/services/tmdb/`:
     - `getNowPlayingMovies()`
     - `getUpcomingMovies()`
     - `getMovieRecommendations(id)`
     - `getMovieCredits(id)`
5. **Đánh giá cộng đồng chuẩn Letterboxd:**
   - Quy đổi điểm TMDB `vote_average` (thang điểm 10) sang thang điểm 5 sao của Letterboxd ($score / 2$), hiển thị kèm rating distribution visual thanh ngang.
6. **Tách biệt Navigation Desktop & Mobile:**
   - Desktop giữ nguyên `Navbar.tsx` phía trên với đầy đủ liên kết rộng rãi.
   - Mobile sử dụng `MobileBottomNav.tsx` 5 slot mới với hiệu ứng kính mờ (Frosted Glass / `backdrop-blur-md`).

---

## 4. Component Structure for Phase 1

### 4.1 Shell & Navigation

- `src/shared/components/layout/MobileBottomNav.tsx`: 5-tab bar with elevated center (+) button and glassmorphism styling.
- `src/features/movies/components/quick-log/QuickLogSheet.tsx`: Bottom sheet tìm kiếm và ghi log phim nhanh.

### 4.2 Dashboard (`src/features/dashboard`)

- `src/features/dashboard/pages/DashboardPage.tsx`: Trang chủ kết hợp.
- `src/features/dashboard/components/DashboardHero.tsx`: Hero carousel tràn viền với backdrop & phim hot.
- `src/features/dashboard/components/MovieSwimlane.tsx`: Hàng phim cuộn ngang mượt mà (Now Playing, Trending, Upcoming).
- `src/features/dashboard/components/UserLibrarySection.tsx`: Phần thư viện của người dùng (Recent watched, Watchlist, Full filter modal/expander).

### 4.3 Movie Details (`src/features/movies`)

- `src/features/movies/pages/MovieDetailPage.tsx`: Trang chi tiết phim toàn màn hình.
- `src/features/movies/components/detail/MovieDetailHeader.tsx`: Backdrop tràn viền + nút Back/Share.
- `src/features/movies/components/detail/MovieActionPills.tsx`: Nút tương tác nhanh (Đã xem, Muốn xem, Đánh giá, Thêm vào album).
- `src/features/movies/components/detail/MovieCastList.tsx`: Cuộn ngang diễn viên / đạo diễn.
- `src/features/movies/components/detail/MovieTrailers.tsx`: Video trailer xem ngay.
- `src/features/movies/components/detail/MovieRecommendations.tsx`: Phim tương tự từ TMDB.

---

## 5. What is Left to the Builder

- **Animation Springs:** Điều chỉnh độ nảy và mượt mà của Framer Motion cho Hero banner và Quick Log sheet.
- **Image Fallback Skeletons:** Màu sắc và hiệu ứng pulse của skeleton khi ảnh backdrop TMDB đang tải.
- **PWA Safe-Area Spacing:** Căn chỉnh chính xác padding đáy `pb-[calc(5rem+env(safe-area-inset-bottom,16px))]` trên iOS và Android.

---

## 6. Verification Plan

- **TypeScript:** `npm run typecheck` đạt 0 lỗi.
- **ESLint:** `npm run lint` đạt 0 lỗi.
- **Responsive & Gestures:**
  - Kiểm tra trên mobile (iPhone 375px–430px) và desktop (1440px).
  - Kiểm tra cử chỉ vuốt ngang các swimlane trên mobile.
  - Kiểm tra mở Quick Log Sheet từ thanh Nav, tìm phim và log thành công vào Firestore.
- **Deep Link Navigation:**
  - Truy cập trực tiếp link `/movie/:id` tải đúng dữ liệu phim và hiển thị trạng thái đã xem (nếu có).
  - Nút Back trên trang chi tiết đưa người dùng quay lại đúng vị trí cuộn trên Dashboard.
