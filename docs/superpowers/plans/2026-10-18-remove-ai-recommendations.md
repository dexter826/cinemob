# Loại bỏ hoàn toàn tính năng đề xuất phim AI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Loại bỏ triệt để tính năng đề xuất phim bằng AI và các tài nguyên liên quan (proxy, API, cache, state), đưa danh sách "Phim thịnh hành" (TMDB Trending) làm nội dung khám phá mặc định trên trang Tìm kiếm.

**Architecture:** Xóa bỏ `ai-service.ts` và `recommendation-service.ts`; thay thế `recommendations-store.ts` bằng `trending-store.ts` tinh gọn trực tiếp gọi `getTrendingMovies` từ TMDB service; cập nhật hook `useSearch` và component `SearchResults` để hiển thị trực tiếp Phim thịnh hành khi chưa nhập từ khóa tìm kiếm; gỡ bỏ biến cấu hình `VITE_AI_PROXY_URL` và cập nhật tài liệu kiến trúc trong `README.md`.

**Tech Stack:** React 19, TypeScript, Zustand, Vite, TMDB API, Tailwind CSS v4

**Spec:** Thiết kế đã được thống nhất trong buổi brainstorming (loại bỏ hoàn toàn AI recommendations, hiển thị trực tiếp TMDB Trending, tinh gọn store/service thành trending-store, dọn sạch env/config/docs).

## Global Constraints

- Tuân thủ thiết kế Editorial Print trong [DESIGN.md](file:///c:/MyProject/cinemob/DESIGN.md): không gradient trang trí, không viền mềm, dùng token màu chuẩn.
- Đảm bảo `npm run typecheck` và `npm run lint` đạt 0 lỗi sau mỗi task.
- Giữ nguyên các chức năng tìm kiếm, gợi ý tự động (auto-suggest) và bộ lọc TMDB Discover.
- Phim thịnh hành là dữ liệu chung, không phụ thuộc tài khoản đăng nhập hay lịch sử xem.

## Review Focus

- Người dùng mở trang Tìm kiếm khi chưa đăng nhập: Phim thịnh hành vẫn hiển thị bình thường mà không phát sinh lỗi tài khoản.
- Nút "Làm mới" tại mục Phim thịnh hành: gửi yêu cầu lấy dữ liệu mới (`forceRefresh = true`), hiển thị trạng thái disabled khi đang tải.
- Không còn sót bất kỳ cache key `ai_recs_*` hay code truy cập local storage liên quan đến AI.
- Không còn sót bất kỳ import mồ côi (orphan import) nào tới `ai-service` hay `recommendation-service`.
- Kiểm tra toàn bộ file `.env`, `.env.example`, `config.ts`, `README.md` không còn chứa `VITE_AI_PROXY_URL` hay `CineProxy`.

---

### Task 1: Dọn dẹp cấu hình môi trường và tài liệu kiến trúc

**Files:**
- Modify: `src/constants/config.ts:30-31`
- Modify: `.env:10-11`
- Modify: `.env.example:12-14`
- Modify: `README.md:47-63,99`

**Interfaces:**
- Consumes: None
- Produces: `src/constants/config.ts` không còn export `AI_PROXY_URL`.

- [ ] **Step 1: Xóa biến `AI_PROXY_URL` trong `src/constants/config.ts`**

Xóa dòng `export const AI_PROXY_URL = ...` ở cuối file.

- [ ] **Step 2: Xóa `VITE_AI_PROXY_URL` trong `.env` và `.env.example`**

Gỡ bỏ dòng cấu hình và chú thích liên quan đến proxy AI Cloudflare Worker.

- [ ] **Step 3: Cập nhật sơ đồ Mermaid và hướng dẫn biến môi trường trong `README.md`**

Trong sơ đồ kiến trúc Mermaid của `README.md`, bỏ các node `AIProxy` ("CineProxy") và `OpenRouter` ("OpenRouter API") cùng các cạnh nối tương ứng. Trong danh sách biến môi trường mục Khởi chạy cục bộ, xóa dòng `VITE_AI_PROXY_URL`.

- [ ] **Step 4: Kiểm tra typecheck**

Run: `npm run typecheck`
Expected: Chỉ có thể báo lỗi ở `ai-service.ts` (nếu có tham chiếu tới `AI_PROXY_URL`) hoặc PASS.

---

### Task 2: Tạo `trending-store.ts`, xóa bỏ AI services và cập nhật `use-app-init.ts`

**Files:**
- Create: `src/features/movies/stores/trending-store.ts`
- Delete: `src/features/movies/services/ai-service.ts`
- Delete: `src/features/movies/services/recommendation-service.ts`
- Delete: `src/features/movies/stores/recommendations-store.ts`
- Modify: `src/app/use-app-init.ts:6,34,78-85`

**Interfaces:**
- Consumes: `getTrendingMovies` từ `@/features/search/services/tmdb`
- Produces: `useTrendingStore` cung cấp:
  - `trendingMovies: TMDBMovieResult[]`
  - `isTrendingLoading: boolean`
  - `trendingError: string | null`
  - `fetchTrending: (forceRefresh?: boolean) => Promise<void>`

- [ ] **Step 1: Tạo `src/features/movies/stores/trending-store.ts`**

Xây dựng store quản lý danh sách phim thịnh hành với cơ chế race-condition handling (`trendingRequestId`) và cache bộ nhớ (`trendingMovies.length > 0 && !forceRefresh`).

- [ ] **Step 2: Xóa các file dịch vụ AI và store cũ**

Xóa `src/features/movies/services/ai-service.ts`, `src/features/movies/services/recommendation-service.ts`, và `src/features/movies/stores/recommendations-store.ts`.

- [ ] **Step 3: Cập nhật `src/app/use-app-init.ts`**

Gỡ bỏ import `useRecommendationsStore`, gỡ bỏ destructuring `resetRecommendations` / `setActiveUser`, và xóa `useEffect` đồng bộ user với recommendations store.

- [ ] **Step 4: Kiểm tra trạng thái build sơ bộ**

Run: `npm run typecheck`
Expected: Lỗi chỉ còn xuất hiện tại các file thuộc feature search (`use-search.ts`, `search-page.tsx`, `search-results.tsx`) đang import store cũ.

---

### Task 3: Tinh gọn hook `useSearch` và kết nối `useTrendingStore`

**Files:**
- Modify: `src/features/search/hooks/use-search.ts`

**Interfaces:**
- Consumes: `useTrendingStore` từ `@/features/movies/stores/trending-store`
- Produces: `useSearch` trả về:
  - `trendingMovies: TMDBMovieResult[]`
  - `isTrendingLoading: boolean`
  - `trendingError: string | null`
  - `refreshTrending: (force?: boolean) => Promise<void>`
  - (Loại bỏ hoàn toàn: `aiRecommendations`, `isAiLoading`, `aiError`, `removeRecommendation`, `watchedMoviesCount`)

- [ ] **Step 1: Cập nhật imports trong `src/features/search/hooks/use-search.ts`**

Thay `useRecommendationsStore` bằng `useTrendingStore`. Bỏ import `isWatchedMovie` nếu không còn dùng.

- [ ] **Step 2: Thay thế state AI bằng trending state trong `useSearch`**

- Gọi `useTrendingStore()` để lấy `trendingMovies`, `isTrendingLoading`, `trendingError`, `fetchTrending`.
- Xóa `filteredAiRecommendations` useMemo.
- Thay thế `useEffect` tự động gọi gợi ý: chuyển thành gọi `fetchTrending()` khi `trendingMovies.length === 0 && !isTrendingLoading`.
- Loại bỏ các field liên quan AI khỏi object trả về của hook.

- [ ] **Step 3: Kiểm tra typecheck cho hook**

Run: `npm run typecheck`
Expected: Lỗi chỉ còn tập trung tại `search-page.tsx` và `search-results.tsx`.

---

### Task 4: Cập nhật giao diện `SearchResults` và `SearchPage`

**Files:**
- Modify: `src/features/search/components/search-results.tsx`
- Modify: `src/features/search/pages/search-page.tsx`

**Interfaces:**
- Consumes: `useSearch` (không còn AI props)
- Produces: Giao diện trang Tìm kiếm sạch sẽ, hiển thị trực tiếp khối "Phim thịnh hành" khi `mode === 'home'`.

- [ ] **Step 1: Cập nhật props và giao diện trong `src/features/search/components/search-results.tsx`**

- Lược bỏ các props AI khỏi `SearchResultsProps`: `isAiLoading`, `aiRecommendations`, `discoverMovies` (prop thừa không dùng), `watchedMoviesCount`, `refreshRecommendations`, `removeRecommendation`, `userId`.
- Thêm prop `refreshTrending: () => void`.
- Xóa bỏ icon `Sparkles`, xóa bỏ khối loading AI (`showAiLoadingBlock`), xóa bỏ mục "Đề xuất cho bạn".
- Khi `mode === 'home'`, hiển thị trực tiếp thanh tiêu đề "Phim thịnh hành" với nút "Làm mới", và hiển thị lưới poster hoặc skeleton loading của trending.

- [ ] **Step 2: Cập nhật `src/features/search/pages/search-page.tsx`**

- Cập nhật các trường destructure từ `useSearch`.
- Xóa khối cảnh báo lỗi `aiError`.
- Cập nhật thông báo trong `<LoadingStatus>`: khi `mode === 'home'`, nếu `isTrendingLoading` thì hiển thị "Đang tải phim thịnh hành…".
- Truyền đúng các props đã tinh gọn vào `<SearchResults />`.

- [ ] **Step 3: Kiểm tra typecheck và lint**

Run: `npm run typecheck && npm run lint`
Expected: Cả hai lệnh kết thúc với exit code 0, không có lỗi type hay lint warning mới.

---

### Task 5: Kiểm thử toàn diện và dọn dẹp cuối cùng

**Files:**
- Verify toàn bộ repository

- [ ] **Step 1: Grep toàn bộ codebase để đảm bảo không còn tàn dư AI**

Grep các từ khóa: `AI_PROXY_URL`, `ai-service`, `recommendation-service`, `aiRecommendations`, `useRecommendationsStore`, `cineproxy`.
Expected: 0 kết quả trong thư mục `src/`, `.env`, `.env.example`.

- [ ] **Step 2: Chạy kiểm tra build sản phẩm**

Run: `npm run build`
Expected: Build thành công không có bất kỳ lỗi biên dịch nào.

- [ ] **Step 3: Kiểm tra giao diện qua browser / dev server**

Truy cập trang `/search` trên server dev (đang chạy ở cổng 3000):
- Kiểm tra trạng thái ban đầu: Tiêu đề "Phim thịnh hành" hiển thị cùng danh sách phim thịnh hành từ TMDB.
- Kiểm tra nút "Làm mới": bấm vào tải lại danh sách phim thịnh hành mượt mà.
- Kiểm tra tính năng tìm kiếm bằng từ khóa: nhập từ khóa -> chuyển sang hiển thị kết quả tìm kiếm đúng như cũ.
- Kiểm tra bộ lọc Discover: lọc theo năm/thể loại -> chuyển sang hiển thị kết quả khám phá đúng như cũ.
