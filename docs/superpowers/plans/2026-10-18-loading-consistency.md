# Loading Consistency Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hóa loading trên giao diện hiện có và xử lý L01–L17 trong audit.

**Architecture:** Giữ request state ở hook/store/service đang sở hữu dữ liệu. Primitive dùng chung chỉ lo hình thức và thông báo; mỗi feature quyết định dữ liệu bắt buộc, lỗi, rỗng và vùng khóa thao tác. Một kế hoạch chung vì các feature cùng dùng Loading, Button, collection và app-init; từng task vẫn là thay đổi độc lập có thể review.

**Tech Stack:** React 19, TypeScript, Vite, Zustand, Tailwind, Firebase và các dependency hiện có. Không thêm dependency.

**Spec:** `docs/superpowers/specs/2026-10-18-loading-consistency-design.md` — đọc cả phần điều chỉnh sau khi duyệt.

## Global Constraints

- Người dùng yêu cầu không thêm hoặc chạy test; không kiểm tra trình duyệt.
- Không tạo test, test runner, mock, fixture, harness hoặc script kiểm thử; không thêm Vitest/jsdom.
- Chỉ rà soát source/diff và chạy `npm run typecheck`, `npm run lint`, `npm run build`.
- Giữ giao diện Editorial Print, hai theme, token, hairline và copy tiếng Việt theo `DESIGN.md`.
- Không đổi API/schema Firestore, quyền riêng tư hoặc nghiệp vụ thêm phim/album.
- Không thêm global loading manager/cache layer; không phần trăm giả hoặc thời gian chờ tối thiểu nhân tạo.
- Giữ debounce discovery/autocomplete 300 ms và undo-toast 7 giây.
- Không ghi/xóa dữ liệu tài khoản thật, không mở browser, không deploy/push.
- Không refactor lân cận. Mỗi dòng đổi phải thuộc loading hoặc lỗi đã xác định.
- Các bước kiểm tra bên dưới là rà soát tĩnh, không thay thế bằng chứng runtime. Không tuyên bố đã chứng minh race condition, accessibility hoặc CLS.

## Review Focus

1. Đổi user giữa lúc đọc/lưu: response cũ không cập nhật user mới; task 1, 3, 5, 6, 8.
2. StrictMode cleanup/setup và request hủy: pending/retry không treo, không nhân listener; task 2, 3, 9.
3. Firestore cache/offline khác lỗi terminal: không đổi offline thành empty/error giả; task 3, 5.
4. Promise ghi hoàn tất trước subscription hoặc subscription đến trước promise: busy item kết thúc đúng; task 3.
5. Lazy import lỗi rồi retry/đóng: không mở lại modal đã đóng, không tái dùng Promise import đã reject; task 9.

Đối chiếu từng mục này trong phần kiểm tra của task sở hữu; không tạo test theo chỉ định người dùng.

## File Structure

Các đường dẫn dưới đây tính từ root repo `C:\MyProject\cinemob`.

- Profile readiness: sửa `src/features/profile/hooks/use-own-profile.ts`, `components/own-profile-editor.tsx`, `pages/member-profile-page.tsx`.
- Search state: sửa `src/features/search/hooks/use-search-tmdb.ts`, `hooks/use-search.ts`, `components/search-results.tsx`, `components/search-filters.tsx`, `pages/search-page.tsx`.
- Album lifecycle: sửa `src/features/albums/stores/album-store.ts`, `services/album-service.ts`, `hooks/use-album-detail.ts`, `pages/albums-page.tsx`, `pages/album-detail-page.tsx`, `components/album-selector-modal.tsx`, `src/app/use-app-init.ts`.
- UI: tạo `src/shared/components/ui/spinner.tsx`, `skeleton.tsx`, `loading-status.tsx`; sửa `loading.tsx`, `skeleton-card.tsx`, `button.tsx`, `index.ts` trong cùng thư mục và `src/index.css`.
- Error consumers: sửa movie/profile/search/calendar/stats pages và hooks ở task 5; không chuyển listener xuống page.
- Movie form: sửa `src/features/search/hooks/use-tmdb-lookup.ts`, `src/features/movies/hooks/use-add-movie-form.ts`, `use-tv-progress.ts`, `components/add-movie-modal.tsx`, `components/add-movie/tv-progress-section.tsx`.
- Startup/lazy modal: sửa `src/app/index.tsx`, `components/layout.tsx`, `components/navbar.tsx`, `src/features/auth/components/auth-provider.tsx`, `src/shared/components/feedback/splash-screen.tsx`, `src/shared/utils/splash-policy.ts`, `src/shared/stores/initial-load-store.ts`; tạo `src/shared/components/ui/lazy-dialog.tsx`.
- Tài liệu: cập nhật `DESIGN.md`, tạo `docs/loading-completion-2026-10-18.md` ghi bằng chứng và giới hạn sau triển khai.

Không bắt buộc tạo skeleton composition thành file riêng nếu chỉ dùng một chỗ; dùng primitive trong feature hiện tại.

## Quy trình mỗi task

Đọc lại source hiện tại trước khi sửa; số dòng audit chỉ dùng định vị. Hoàn tất bước kiểm tra source của task, chạy `npm run typecheck`, xem `git diff --check` và diff task trước khi commit. Chỉ stage file thuộc task; giữ thay đổi có sẵn của người dùng. Commit dùng Conventional Commits. Không chạy bộ test hiện có.

### Task 1: Bảo vệ hồ sơ chưa đọc thành công — L01

**Files:** profile readiness ở File Structure.

**Interfaces:** Giữ `useOwnProfile()` hiện có; bổ sung `error: string | null`, `ready: boolean`, `retry: () => void`. `ready` chỉ true sau lần đọc thành công đúng uid, kể cả kết quả null; lỗi/pending/đổi uid là false. OwnProfileEditor nhận `ready`, `error`, `onRetry`; page truyền đúng từ hook.

- [ ] Thêm trạng thái read outcome, request identity/uid và retry vào `use-own-profile.ts`. Giữ chữ ký `saveDetails(details: OwnProfileDetails): Promise<boolean>` và `toggleMovieListHidden(): Promise<boolean>`; cả hai chặn `!ready` ngoài các guard hiện có.
- [ ] Disable edit/save/toggle khi chưa ready; startEditing cũng guard trước khi tạo draft. Lỗi đọc hiện retry; success-null cho nhập chi tiết mới. Không sửa semantics `deleteField()` của service.
- [ ] Rà soát pending/error không đi tới write; đổi tên sau đọc thành công giữ draft bio/gender/dob; response uid cũ và refresh sau save không đè uid mới hoặc draft đang nhập. Giữ avatar độc lập nếu không phụ thuộc details.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(profile): guard edits until profile details are loaded`.

### Task 2: Search mode và request cancellation — L02, L07, L17

**Files:** search state ở File Structure.

**Interfaces:** Export `SearchMode = 'home' | 'search' | 'discover'` và `getSearchMode(submittedQuery: string, filters: SearchFormFilters): SearchMode` từ `use-search-tmdb.ts`. Search trước khi trim length > 2; discover nếu còn filter khác mặc định; home còn lại. Hook trả thêm `mode`; `useSearch` chuyển tiếp và SearchResults nhận `mode`.

- [ ] Chọn mode từ params, không từ số kết quả. Gắn trạng thái kết quả với key gồm params ảnh hưởng request; không render kết quả key cũ trong một render trước khi effect mới chạy.
- [ ] Home bỏ/reset discovery pending/error/data; mode inactive không được điều khiển loading/error hiện tại. Cleanup/abort không toast lỗi và response cũ không đổi state request mới. Giữ debounce 300 ms.
- [ ] Bỏ `initialLoading` mount-only và nhánh tương ứng. Discover [] hiện “Không có phim khớp bộ lọc” cùng nút xóa lọc. Dùng mode cho page title, chọn results và pagination; giữ submit/URL/filter hiện tại.
- [ ] Rà soát pending-clear, error-clear, đổi mode/page nhanh, StrictMode setup/cleanup, retry đúng params và response đến muộn. Không dùng finally của request cũ để tắt pending request mới.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(search): scope loading and results to the active request`.

### Task 3: Album listener, retry và item pending — L03, L13, L15

**Files:** album lifecycle ở File Structure; `src/features/movies/stores/movie-store.ts` chỉ khi cần retry collection ở task 5.

**Interfaces:** Album store thêm `activeUid: string | null`, `error: string | null`, `retryNonce: number`, `retry: () => void`, `setError(error: string | null): void`. `subscribeToAlbum(uid: string, docId: string, callback: (album: Album | null) => void, onError?: (error: unknown) => void): () => void` tương tự list service. `useAlbumDetail` thêm `error`, `retry()`, `moviesLoading`, `moviesError`, `pendingMovieIds: ReadonlySet<string>`.

- [ ] App-init đặt scope album mới trước khi dùng, clear data/cover của user cũ, bật initial pending, truyền onError. Retry tăng nonce để app-init unsubscribe/resubscribe cùng nguồn. Giữ data cùng uid khi retry sau lỗi; không nhân subscription ở page/selector.
- [ ] Detail listener nhận error callback và request scope guard. Retry có thể tăng nonce local. Grid đợi cả album và collection phim; phân biệt lỗi từng nguồn và successful empty. List/selector nhận error/retry của album store.
- [ ] Dùng ref/map theo movie docId để chặn click lặp ngay cả trước React render. Theo dõi thao tác add/remove, promise ghi và trạng thái listener: chờ cả ghi thành công và membership mong đợi được quan sát, không phụ thuộc thứ tự hai sự kiện. Lỗi/đổi scope giải phóng pending đúng item; không thêm optimistic update. Giữ undo 7 giây.
- [ ] Rà soát user A sang B, listener terminal error, retry khi callback cũ còn tới, cache/offline không bị coi terminal, album đến trước movies, add/remove pending và listener error sau ghi. Các callback hoàn tất cũ không sửa scope mới.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(albums): handle listener errors and item pending states`.

### Task 4: Primitive loading thống nhất — L04, L05, L09

**Files:** UI ở File Structure; chưa thay bố cục feature ngoài caller bắt buộc để giữ typecheck.

**Interfaces:** `Spinner({ size?: number, className?: string })` mặc định 20, luôn aria-hidden. `Skeleton(props: React.HTMLAttributes<HTMLDivElement>)` luôn aria-hidden. `LoadingStatus({ children, className? }: { children: React.ReactNode; className?: string })` là live status ngắn, không chứa grid. Loading giữ size/fullScreen/contain/text/className nhưng mặc định `fullScreen=false`, không sửa store. Button giữ API hiện có.

- [ ] Thêm token `--color-skeleton` dùng `color-mix(in srgb, var(--color-text-primary) 8%, var(--color-surface))` làm điểm khởi đầu; dùng token, không hardcode trong TSX. Skeleton có fill, pulse motion-safe và trạng thái tĩnh reduced-motion.
- [ ] SkeletonCard dùng cùng `aspect-2/3`, `rounded-poster` với PosterCard; metadata giả nằm trong khung. Spinner dùng chung hình thức; Loading dùng một status, loại nested status và markup span bọc div không phù hợp.
- [ ] Button loading render Spinner thay leadingIcon, giữ aria-busy/disabled; caller chịu trách nhiệm nhãn. Loading chỉ biểu diễn trạng thái; bỏ side effect setPageLoading. Tạm để layout/store giữ field nếu còn caller, dọn field ở task 9 khi hết dùng.
- [ ] Rà soát CSS light/dark và reduced-motion; aria-hidden không bị props spread ghi đè; status không lồng và không nằm bên trong vùng aria-busy đang chặn thông báo. Không tuyên bố màu/kích thước đã đo trực tiếp.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(ui): align shared loading primitives with poster cards`.

### Task 5: Error không biến thành empty — L06, L12, L14

**Files:** `src/features/movies/stores/movie-store.ts`, `pages/movie-detail-page.tsx`, `hooks/use-random-picker.ts`, `components/random-picker-modal.tsx`; `src/features/profile/pages/member-profile-page.tsx`, `components/movie-list-section.tsx`; `src/features/search/hooks/use-person-detail.ts`, `pages/person-detail-page.tsx`, `services/tmdb/movie-service.ts`; `src/features/calendar/hooks/use-release-calendar.ts`, `pages/release-calendar-page.tsx`, `components/calendar-stats.tsx`; `src/features/stats/pages/stats-page.tsx`.

**Interfaces:** Movie store thêm `retry: () => void` dùng activeUid, giữ data cùng uid, unsubscribe/resubscribe và guard callback scope cũ; initialize/cleanup vẫn giữ API. MovieListSection thêm `error?: string | null`, `onRetry?: () => void`. `usePersonDetail` thêm `retry(): void`; picker thêm `poolError: string | null`, `retryPool(): void`. Calendar hook chuyển tiếp `collectionError`/`retryCollection`; CalendarStats nhận `episodesLoading: boolean`, `episodesError: string | null`.

- [ ] Thêm movie retry tại nguồn; page không tự đăng ký listener. Stats/movie detail/own-list/common-list/calendar kiểm tra lỗi trước empty; có data cũ thì giữ với thông báo chưa cập nhật được. Không xóa pending-delete đang chờ chỉ để retry collection.
- [ ] Public profile phân biệt getMemberProfile trả null với reject; guard uid và retry. Person detail có retry theo id, error khác not-found; không để service credits nuốt lỗi request thành [] rồi coi đầy đủ dữ liệu đã thành công. Giữ scope thay đổi trong hook.
- [ ] Calendar totals dùng placeholder khi pending, dấu gạch khi error, 0 chỉ sau successful empty; số series độc lập vẫn hiện. Chặn request episode khi collection lỗi. Stats lọc local không thêm loading.
- [ ] Picker giữ error riêng, retry cùng modal hiện tại; có watchlist hợp lệ dùng ngay. Đóng/đổi nguồn bỏ request cũ. Rà soát lỗi terminal khác offline/cache, profile/collection source chưa đủ không kết luận empty.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(loading): distinguish failed reads from empty content`.

### Task 6: Movie form readiness và TV refresh — L08, L16

**Files:** movie form ở File Structure.

**Interfaces:** `useTMDBLookup` thêm `error: string | null`, giữ fetchDetails signature; form trả `initialDetailsLoading`, `detailsError`, `retryDetails(): void`, `tvProgressLoading`, `tvProgressError`, `retryTVProgress(): void`, `canSubmit: boolean`. `useTVProgress` thêm `error: string | null`, `retry(): void`, `hasUsableSnapshot: boolean`. TVProgressSection nhận thêm `loading`, `error`, `onRetry`.

- [ ] Tách TMDB lần đầu khỏi TV refresh. Không đổi snapshot đã lưu thành rỗng ở lúc bắt đầu refresh; giới hạn pending vào vùng TV khi edit. Chặn lưu ở UI và handler nếu details bắt buộc chưa ready, đang refresh payload hoặc snapshot không dùng được.
- [ ] TMDB fail có retry/đóng; giữ input người dùng. Form manual dùng ngay. Định nghĩa snapshot TV dùng được theo validator và payload hiện có: tiến độ chưa hoàn thành cần số tập theo mùa đủ để tính watched, không chỉ có totalEpisodes; completed có thể dùng total đã lưu nếu validator hiện tại cho phép.
- [ ] Gắn response với modal/user/movie hiện tại. Không resync toàn bộ form khi user object refresh; không để response cũ ghi đè trường đã sửa. Rà soát pending-close-reopen, TV chuyển movie và lỗi refresh vẫn cho dùng snapshot hợp lệ.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(movies): separate initial form load from TV refresh`.

### Task 7: Skeleton đúng bố cục thật — L04, L05, L10

**Files:** `src/features/dashboard/pages/dashboard-page.tsx`; `src/features/search/pages/person-detail-page.tsx`; `src/features/movies/pages/movie-detail-page.tsx`, `components/add-movie-modal.tsx`; `src/features/albums/pages/albums-page.tsx`, `pages/album-detail-page.tsx`; `src/features/profile/pages/member-profile-page.tsx`, `components/own-profile-editor.tsx`, `components/movie-list-section.tsx`; `src/features/stats/pages/stats-page.tsx`; `src/features/calendar/pages/release-calendar-page.tsx`, `components/calendar-grid.tsx`, `components/episode-list.tsx`.

**Interfaces:** Tái sử dụng Skeleton/SkeletonCard task 4. Không thêm public API chung cho mọi layout. Calendar tính số ô từ cùng month/weekday padding trong cả pending và loaded.

- [ ] Thay div pulse tự dựng bằng Skeleton có fill; giữ composition tại feature. Profile dùng skeleton trong main, bỏ fullscreen. Movie detail dùng poster có max-width như content và cột thông tin; person/profile/form/chart theo đúng bố cục thật.
- [ ] Đồng bộ grid skeleton/content của album/profile: cùng số cột, gap, breakpoint. Giữ toolbar/header độc lập nếu dữ liệu của chúng đã biết. Số placeholder theo section/page size đang có; không thêm thẻ vượt nhu cầu.
- [ ] Calendar bỏ TOTAL_CELLS cố định khi pending; tính cùng số ô với render tháng theo weekday hiện có. Đối chiếu source tháng 2/2026, 10/2026 và tháng cần 6 tuần. Rà soát CSS tại 390 px/1440 px và cả theme qua class/token, không mở browser.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(skeleton): match placeholders to final content layouts`.

### Task 8: Refresh, status và nút thao tác — L08, L09

**Files:** SearchResults/SearchFilters/SearchPage task 2; `src/features/movies/stores/recommendations-store.ts`, `components/add-movie-modal.tsx`, `components/add-movie/album-section.tsx`; `src/features/auth/components/login.tsx`; `src/features/albums/components/album-selector-modal.tsx`; `src/features/profile/components/own-profile-editor.tsx`, `components/user/member-search-modal.tsx`; calendar/stats pages và episode list đã sửa.

**Interfaces:** Dùng Spinner/LoadingStatus/Button task 4. Recommendation store thêm `aiError: string | null`, `trendingError: string | null` nếu state hiện có không đủ phân biệt lỗi; guard userGeneration/requestId hiện có giữ nguyên.

- [ ] AI/trending chỉ thay cards bằng skeleton khi chưa có data hợp lệ. Khi refresh giữ cards, disable refresh, báo “Đang cập nhật…”. Lỗi giữ cards cũ kèm retry đúng user; không giữ cards khác user.
- [ ] Mỗi region pending có status ngắn ngoài aria-busy, skeleton children aria-hidden. Search thông báo count bằng status, bỏ aria-live đọc toàn grid. Autocomplete báo pending và kết quả, reset khi clear/submit/đổi query.
- [ ] Bỏ Loader2/spinner tự dựng của caller đã chuyển sang Button loading hoặc Spinner chung. Giữ nhãn cụ thể “Đang lưu…”, “Đang tạo…”, “Đang tải…”. Không đổi nút không liên quan async.
- [ ] Rà soát status trùng với toast, nested role=status, ảnh hưởng focus và reduced-motion qua source. Chạy kiểm tra tĩnh chung; commit `fix(feedback): preserve refreshed content and unify pending actions`.

### Task 9: Auth readiness và lazy modal có phản hồi — L10, L11

**Files:** startup/lazy ở File Structure; `src/shared/components/ui/dialog.tsx`, `src/shared/components/feedback/error-boundary.tsx` chỉ sửa API nếu cần; modal AddMovie/RandomPicker/MemberSearch chỉ đổi ownership shell khi cần.

**Interfaces:** AuthContext thêm `error: string | null`, `retryAuth(): void`, đăng ký onAuthStateChanged error callback. SplashScreen là khung thương hiệu không tự đặt timer/onAnimationFinish; props `staticMode?: boolean`, status “Đang xác thực…”. `LazyDialog<P extends { isOpen: boolean; onClose: () => void }>` nhận `open`, `onClose`, `title`, `loader: () => Promise<{ default: React.ComponentType<P> }>`, `componentProps: Omit<P, 'isOpen' | 'onClose'>`.

- [ ] Auth pending render khung thương hiệu; auth lỗi retry; auth thành công render login/shell ngay, không chờ 1.500 ms hoặc collection. Bỏ splash-policy/state/timer và initial readiness field chỉ khi không còn caller. Footer phụ thuộc shell/auth, không phụ thuộc collection hay spinner.
- [ ] Dùng local Loading cho route chunk. LazyDialog nạp module khi open, có shell pending/error với đóng/retry. Loader function ổn định theo module; giữ module đã tải để lần mở sau không nạp lại, không tạo cache layer mới.
- [ ] Tránh mở hai Dialog: loaded modal giữ shell của chính nó; pending shell unmount trước khi loaded modal mount. Chỉ chuyển focus sang close button mới nếu focus vẫn thuộc pending shell; không giành focus nếu người dùng đã chuyển đi. Không cần refactor toàn bộ modal thành content-only.
- [ ] ErrorBoundary chỉ reset state không đủ retry React.lazy Promise reject; LazyDialog gọi lại loader bằng attempt mới. Guard generation/open để đóng trong lúc tải không mở lại. Đổi user hủy việc hiển thị modal theo scope hiện có. Rà soát StrictMode và active focus trap qua source, không browser.
- [ ] Chạy kiểm tra tĩnh chung; commit `fix(app): tie startup feedback to auth and cover lazy dialogs`.

### Task 10: Ảnh fallback, tài liệu và kiểm tra tĩnh cuối

**Files:** `src/features/movies/components/poster-card.tsx`, `src/features/albums/components/album-card.tsx`, `DESIGN.md`, `docs/loading-completion-2026-10-18.md`; các file đã đổi nếu rà soát phát hiện lỗi trong phạm vi.

**Interfaces:** Dùng `PLACEHOLDER_IMAGE` có sẵn; không thêm state onLoad hoặc component ảnh tổng quát.

- [ ] Thêm onError đổi sang fallback một lần; vô hiệu handler trước khi đổi src hoặc guard URL để fallback lỗi không lặp. Giữ aspect ratio và loading=lazy. Không đổi avatar fallback đã có.
- [ ] Bổ sung quy tắc chọn skeleton/spinner/refresh/error vào DESIGN.md; ghi mapping L01–L17 tới task/file trong completion report. Không đổi kết luận lịch sử của audit thành “đã test”.
- [ ] Đọc toàn diff, đối chiếu Review Focus và spec; tìm raw pulse/spin, Loading fullscreen, fallback null, initialLoading còn lại trong phạm vi để xác nhận caller đã xử lý hoặc giải thích ngoại lệ. Không xóa code ngoài phạm vi.
- [ ] Chạy tuần tự `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check`. Ghi exit code/kết quả; lỗi baseline phải phân biệt và không sửa lạc phạm vi. Không chạy npm test, detector, browser hoặc format toàn repo.
- [ ] Ghi rõ giới hạn: chưa kiểm chứng runtime, race condition, screen reader, màu thực tế, layout shift, mobile và network error. Không tuyên bố hết 17 vấn đề chỉ vì build pass; ghi mức bằng chứng source cho từng mục.
- [ ] Commit `fix(loading): finish image fallbacks and document loading rules`; báo các kiểm tra thực sự đã chạy, thay đổi chính và giới hạn.

## Tự rà soát kế hoạch

- Coverage: L01 task 1; L02/L07/L17 task 2; L03/L13/L15 task 3; L04/L05 task 4/7; L06/L12/L14 task 5; L08 task 6/8; L09 task 4/8; L10/L11 task 7/9; L16 task 6.
- Không task nào yêu cầu test/browser/dependency mới; các yêu cầu cũ đã được cập nhật trong spec.
- Mọi API được task sau sử dụng đã được đặt tên ở task sở hữu; state nội bộ không yêu cầu interface chung mới.
- Rà soát năm mục Review Focus được gắn vào task tương ứng; chỉ có bằng chứng source, không giả thành kiểm tra runtime.
- Chưa triển khai source. Cần người dùng duyệt kế hoạch và chọn cách thực hiện theo handoff của writing-plans.
