# Audit skeleton và trạng thái loading — 18/10/2026

## Kết luận

CineMOB đã có nền tảng dùng chung, nhưng chưa có một hợp đồng loading xuyên suốt từ dữ liệu đến giao diện. SkeletonCard đã lệch khỏi thiết kế PosterCard hiện tại; nhiều skeleton tự dựng thiếu nền; cách xử lý initial load, refresh, lỗi và dữ liệu rỗng khác nhau giữa các feature. Có lỗi về vòng đời request và điều kiện cho phép chỉnh sửa, không chỉ khác biệt về thẩm mỹ.

Phạm vi: toàn bộ `src`, gồm startup/auth, lazy routes/modals, skeleton trang và vùng nội dung, autocomplete, AI/trending, calendar, mutations, upload và ảnh. Không sửa source trong đợt audit này.

17 phát hiện được nhóm theo nguyên nhân: **3 P1, 12 P2, 2 P3; không phát hiện P0** trong phạm vi kiểm tra. P1 cần xử lý trước lần phát hành tiếp theo; P2 ảnh hưởng tính đúng đắn hoặc trải nghiệm; P3 là điều kiện biên/chuẩn hóa.

## Bằng chứng và giới hạn

- Đọc component, hook, store, service và `DESIGN.md`; đối chiếu từng nhánh pending → success/error/empty và cleanup/cancellation.
- Quan sát ứng dụng đã đăng nhập tại `http://localhost:3000/` bằng Brave, mở tab audit riêng tại `/search`, mở rồi đóng modal thêm phim; không bấm lưu hay chủ động thay đổi dữ liệu tài khoản.
- Đo DOM thực tế trên Search: skeleton rộng **204,8 px**, cao **403,2 px**; PosterCard cùng chiều rộng cao **307,2 px**. Chênh lệch **96 px/thẻ** là sai hình học đã đo, không phải số đo CLS.
- Tái hiện lỗi L02 bằng harness chạy logic hook thật sau khi transpile TypeScript, với state/effect và request có thể abort được điều khiển: sau khi bỏ bộ lọc, `isDiscoverLoading` vẫn `true`. Đây là kiểm tra logic có kiểm soát; chưa phải tái hiện trong React/browser với network throttling.
- Chạy `impeccable detect --json src`, kết quả `[]`. Detector không kiểm tra đầy đủ điều kiện loading, sự thiếu màu ở div rỗng hay hình học thay thế; kết quả này không phủ định các phát hiện thủ công.
- Chưa kiểm thử thực tế các nhánh Firestore permission-denied, tải chậm, mất mạng, đổi tài khoản, screen reader, thiết bị di động hoặc light theme. Các lỗi nhánh này được xác nhận bằng đường đi trong source, không được mô tả là đã quan sát trên UI.
- Không ép lỗi hoặc lưu hồ sơ thật để chứng minh nguy cơ mất dữ liệu. Không chạy bộ test notification vì không kiểm tra loading frontend. Không dùng build/typecheck để suy ra UX đã đúng.

## Mức độ nhất quán

Điểm dưới đây là đánh giá trong phạm vi loading, dựa trên source và mẫu DOM đã kiểm tra; không phải chứng nhận WCAG hay benchmark toàn ứng dụng.

| Chiều đánh giá | Điểm /4 | Căn cứ chính |
|---|---:|---|
| Accessibility | 2 | Spinner chung có status; nhiều nhánh skeleton không có thông báo tương đương |
| Performance | 3 | CSS pulse/spin nhẹ, ảnh có lazy loading; còn thay nội dung đang dùng được khi refresh; chưa profile CPU/GPU |
| Responsive/layout | 2 | Có breakpoint, nhưng skeleton/card khác chiều cao và số cột |
| Theming | 2 | Có token và dark mode; placeholder còn tự dựng và có chỗ trong suốt |
| Implementation integrity | 1 | Component chung tồn tại nhưng hợp đồng pending/error/empty và phạm vi khóa UI chưa thống nhất |
| **Tổng** | **10/20** | **Cần sửa đáng kể trong hệ thống loading** |

## Danh mục vị trí

Các đường dẫn trong báo cáo tính từ thư mục dự án `C:\MyProject\cinemob`. Số dòng là vị trí source tại thời điểm audit.

| Vùng | Nơi triển khai | Loading hiện tại | Đánh giá |
|---|---|---|---|
| Primitive | `src/shared/components/ui/skeleton-card.tsx:2` | Poster + metadata rời | Dùng chung tốt, hình học đã cũ |
| Primitive | `src/shared/components/ui/loading.tsx:40` | Inline/contained/fullscreen spinner | Có status; mặc định fullscreen và side effect toàn cục cần thu hẹp |
| Button | `src/shared/components/ui/button.tsx:44` | Disable + aria-busy | Hợp lý; caller tự quyết định text/icon nên hình thức chưa đồng nhất |
| Startup/auth | `src/app/index.tsx:82`, `src/shared/components/feedback/splash-screen.tsx:43` | Splash 1.500 ms, auth pending trả null | Splash không gắn với readiness |
| Route chunk | `src/app/index.tsx:91` | Spinner trong main | Phạm vi hợp lý; chưa có quy tắc chuyển tiếp sang data skeleton |
| Modal chunk | `src/app/index.tsx:95`, `src/app/components/navbar.tsx:250` | Suspense fallback null | Click có thể chưa có phản hồi khi tải chunk lần đầu |
| Dashboard | `src/features/dashboard/pages/dashboard-page.tsx:108` | 12 SkeletonCard | Đúng thứ tự loading/error/empty; hình học primitive sai |
| Search initial/results | `src/features/search/pages/search-page.tsx:57`, `components/search-results.tsx:54` | 10 SkeletonCard | Có cả flag mount-only và pending thật; có lỗi khi bỏ lọc |
| Search AI/trending | `src/features/search/components/search-results.tsx:75` | Skeleton theo từng khu vực | Trending giữ nội dung cũ; AI refresh thay nội dung cũ |
| Autocomplete | `src/features/search/components/search-filters.tsx:62` | Spinner trong input | Đúng phạm vi; thiếu pending announcement |
| Person | `src/features/search/pages/person-detail-page.tsx:69` | Khối profile + 10 thẻ | Cần làm hình học sát nội dung hơn; lỗi có copy nhưng chưa có retry tại chỗ |
| Movie detail | `src/features/movies/pages/movie-detail-page.tsx:56` | Một SkeletonCard toàn chiều rộng; extras có text riêng | Initial không giống layout thật; giữ nội dung chính khi tải extras là đúng |
| Add/edit movie | `src/features/movies/components/add-movie-modal.tsx:137` | Skeleton form tự dựng; spinner khi lưu | Placeholder không có nền; TV refresh chặn cả form |
| Albums list | `src/features/albums/pages/albums-page.tsx:90` | 5 poster block | Tỉ lệ và grid sát card; thiếu state lỗi subscription |
| Album detail | `src/features/albums/pages/album-detail-page.tsx:179` | SkeletonCard | Thiếu xử lý lỗi listener, grid sai và thiếu chờ collection phụ thuộc |
| Album selector | `src/features/albums/components/album-selector-modal.tsx:186` | Spinner local, text xử lý từng album | Hợp lý về phạm vi; cần xử lý lỗi nguồn album |
| Calendar page | `src/features/calendar/pages/release-calendar-page.tsx:97` | Khối tổng quan + hai panel | Skeleton cục bộ tồn tại nhưng totals không theo pending/error |
| Calendar grid/list | `src/features/calendar/components/calendar-grid.tsx:195`, `episode-list.tsx:63` | Ô lịch và hàng episode | List phân biệt lỗi/rỗng tốt; grid skeleton cố định 42 ô |
| Stats | `src/features/stats/pages/stats-page.tsx:114` | Hai khối summary + chart | Có skeleton; thiếu nhánh collection error; đổi năm local không cần loading |
| Own profile | `src/features/profile/components/own-profile-editor.tsx:373` | Skeleton metadata local | Đúng phạm vi nhưng trong suốt và vẫn cho chỉnh sửa sớm |
| Profile movies | `src/features/profile/components/movie-list-section.tsx:57` | SkeletonCard | Khác grid thật; chưa nhận state lỗi collection |
| Public profile | `src/features/profile/pages/member-profile-page.tsx:167` | Fullscreen Loading | Khóa cả shell cho một request profile; lỗi đọc thành not-found |
| Member search | `src/features/profile/components/user/member-search-modal.tsx:79` | Spinner trong modal | Có error và vùng kết quả live; filtering local không cần loading lại |
| Random picker | `src/features/movies/components/random-picker-modal.tsx:113` | Spinner local có text | Đúng phạm vi; thiếu retry rõ ràng khi nguồn fallback lỗi |
| Auth/mutations/upload | `login.tsx:108`, `own-profile-editor.tsx:246,469`, `album-selector-modal.tsx:155`, `release-calendar-page.tsx:80` | Text/icon/disabled/aria-busy tùy caller | Có phản hồi theo thao tác; chưa thành một quy ước thống nhất |
| Ảnh | `src/features/movies/components/poster-card.tsx:79,98`, `src/features/albums/components/album-card.tsx:64` | Lazy load, vùng ảnh giữ tỉ lệ | Không cần skeleton cho từng ảnh mặc định; chưa có fallback lỗi tải ảnh ở các card này |

## Các phát hiện

### L01 — P1: Chỉnh sửa trước khi tải xong có thể xóa dữ liệu hồ sơ

**Vị trí:** `src/features/profile/components/own-profile-editor.tsx:127,169,358`; `src/features/profile/hooks/use-own-profile.ts:46`; `src/features/profile/services/member-profile-service.ts:182`.

Nút Chỉnh sửa không bị disable theo `loading`. Nếu profile chưa đến, draft bio/gender/dob được khởi tạo bằng chuỗi rỗng; dữ liệu đến sau không cập nhật draft. Lưu các giá trị này dẫn đến `deleteField()` ở service. Fetch lỗi cũng chuyển profile thành null, mở ra cùng nguy cơ.

**Tình huống:** tải hồ sơ chậm → mở chỉnh sửa → đổi tên → lưu; các trường sẵn có có thể bị xóa. **Đề xuất:** chỉ cho sửa khi lần đọc đầu đã thành công; phân biệt hồ sơ chưa tồn tại với tải lỗi, có retry. Không kiểm chứng bằng ghi dữ liệu thật. Nhóm: implementation integrity. Hướng xử lý: `$impeccable harden`.

### L02 — P1: Bỏ bộ lọc có thể khiến Search kẹt skeleton

**Vị trí:** `src/features/search/hooks/use-search-tmdb.ts:62,69,93,97`; `src/features/search/hooks/use-search.ts:305`; `src/features/search/components/search-results.tsx:54`.

Sau 300 ms debounce, discoverLoading=true. Bỏ tất cả bộ lọc lúc request đang chạy sẽ cleanup/abort và đặt ignore=true; finally không reset loading. Effect mới thoát ở `!hasFilters`. UI tiếp tục render 10 skeleton mà không còn request sẽ tắt chúng. Lỗi đã được tái hiện bằng harness logic hook có kiểm soát.

Data/error của discovery cũng chưa được reset khi rời mode: bỏ lọc sau thành công/lỗi có thể giữ kết quả hoặc thông báo lỗi của bộ lọc cũ. **Đề xuất:** biểu diễn mode rõ ràng; trạng thái của mode đã rời phải được reset hoặc ngừng chi phối UI. Nhóm: implementation integrity. Hướng xử lý: `$impeccable harden`.

### L03 — P1: Album có đường đi không kết thúc loading khi listener lỗi

**Vị trí:** `src/features/albums/hooks/use-album-detail.ts:35`; `src/features/albums/services/album-service.ts:143`; `src/app/use-app-init.ts:63`; `src/features/albums/stores/album-store.ts:19`.

Album detail chỉ tắt loading trong callback thành công; listener không nhận callback lỗi. List album có callback lỗi tùy chọn ở service nhưng app-init không truyền vào. Khi loading đang true và listener kết thúc vì permission-denied/lỗi terminal, UI có thể chờ vô hạn. Khi loading vốn false, cùng lỗi lại có thể trông như danh sách rỗng.

**Đề xuất:** đưa lỗi vào state, luôn kết thúc pending ở lỗi terminal, có retry. Khi bắt đầu subscription cho user mới phải bật trạng thái tải phù hợp; hiện app-init tắt loading lúc chưa có user nhưng không bật lại trước subscription. Nhóm: implementation integrity. Hướng xử lý: `$impeccable harden`.

### L04 — P2: Có skeleton không vẽ ra gì

**Vị trí:** `src/features/movies/components/add-movie-modal.tsx:139`; `src/features/profile/components/own-profile-editor.tsx:375`.

Các div rỗng chỉ có kích thước, radius và pulse; không có background, border hoặc nội dung. Pulse chỉ thay opacity, không tạo màu. Người dùng thấy khoảng trống thay vì placeholder. **Đề xuất:** dùng cùng màu nền skeleton theo theme và thông báo pending ở container. Xác nhận từ CSS/source, chưa bắt được nhánh này trong ảnh UI. Nhóm: theming/accessibility. Hướng xử lý: `$impeccable colorize`, `$impeccable harden`.

### L05 — P2: Skeleton không giữ hình học của nội dung thật

**Vị trí:** `src/shared/components/ui/skeleton-card.tsx:6`; `src/features/movies/components/poster-card.tsx:79`; `src/features/albums/pages/album-detail-page.tsx:180,200`; `src/features/profile/components/movie-list-section.tsx:59,129`; `src/features/movies/pages/movie-detail-page.tsx:56`; `src/features/calendar/components/calendar-grid.tsx:134,197`.

SkeletonCard là poster cộng metadata bên dưới; PosterCard thật gói toàn bộ trong aspect 2:3. DOM Search xác nhận chênh 96 px/thẻ. Album/profile còn đổi từ 5 cột skeleton thành 6 cột thật ở lg. Movie detail đặt một skeleton thẻ full-width thay cho poster nhỏ + nội dung cạnh bên. Calendar dùng cố định 42 ô trong lúc layout thật chỉ điền đủ tuần: tháng 10/2026 cần 35 ô, nên dư một hàng chờ.

**Đề xuất:** skeleton card dùng đúng aspect/radius của PosterCard; skeleton và content dùng cùng grid/gap; detail có placeholder theo bố cục detail; lịch tính cùng số ô ở cả hai nhánh. Không cần dựng một component dùng chung cho mọi loại trang. Nhóm: responsive/performance/integrity. Hướng xử lý: `$impeccable layout`, `$impeccable adapt`.

### L06 — P2: Một số lỗi đọc được trình bày như dữ liệu rỗng hoặc không tồn tại

**Vị trí:** `src/features/movies/stores/movie-store.ts:51`; `src/features/stats/pages/stats-page.tsx:58,130`; `src/app/use-app-init.ts:107`; `src/features/calendar/pages/release-calendar-page.tsx:116`; `src/features/movies/pages/movie-detail-page.tsx:28,60`; `src/features/profile/pages/member-profile-page.tsx:102,158,169`.

Store phim có error nhưng nhiều consumer chỉ đọc data/loading. Sau lỗi, Stats có thể nói “Chưa có dữ liệu”, Calendar “Chưa có series”, movie detail “Không tìm thấy phim”, own-profile list “Chưa có phim”. Public profile chuyển lỗi fetch thành notFound. Các thông báo này khiến người dùng hiểu nhầm dữ liệu đã mất/chưa tồn tại.

**Đề xuất:** loading → error/retry → successful empty → content; dashboard đã có ví dụ đúng để tái sử dụng cách xử lý. Nhóm: integrity/UX copy. Hướng xử lý: `$impeccable harden`, `$impeccable clarify`.

### L07 — P2: Discovery rỗng lại hiện nội dung trang chủ

**Vị trí:** `src/features/search/components/search-results.tsx:75,78,244`; `src/features/search/pages/search-page.tsx:45`.

Mode được suy từ query và số kết quả. Bộ lọc đang hoạt động nhưng request trả [] bị coi như home, hiện AI/trending hoặc lời mời bắt đầu khám phá, thay vì thông báo không có phim khớp lọc. **Đề xuất:** truyền home/search/discover độc lập với độ dài mảng. Nhóm: integrity/clarity. Hướng xử lý: `$impeccable harden`, `$impeccable clarify`.

### L08 — P2: Refresh chưa có quy tắc giữ nội dung cũ

**Vị trí:** `src/features/search/components/search-results.tsx:76,77,87`; `src/features/movies/hooks/use-add-movie-form.ts:370`; `src/features/movies/hooks/use-tv-progress.ts:33`.

Trending chỉ hiện skeleton nếu chưa có data, nhưng AI chỉ cần isAiLoading là thay cả đề xuất sẵn có bằng skeleton. Tải tiến độ TV cũng gộp vào isLoadingDetails rồi ẩn toàn bộ form đã có thông tin.

**Đề xuất:** khi cùng dữ liệu/ngữ cảnh còn hợp lệ, giữ nội dung và báo refresh tại khu vực bị ảnh hưởng; chỉ khóa section cần kết quả mới. Không giữ data cũ khác user/query/month như thể nó thuộc ngữ cảnh mới. Nhóm: integrity/performance. Hướng xử lý: `$impeccable optimize`, `$impeccable harden`.

### L09 — P2: Skeleton thường chỉ có phản hồi thị giác

**Vị trí:** `src/shared/components/ui/skeleton-card.tsx:5`; `src/features/search/components/search-results.tsx:54,87,205`; `src/features/stats/pages/stats-page.tsx:114`; `src/features/calendar/pages/release-calendar-page.tsx:97`; `src/features/calendar/components/episode-list.tsx:63`; `src/features/search/components/search-filters.tsx:62`.

SkeletonCard được aria-hidden là đúng cho phần trang trí, nhưng nhiều container không có status/aria-busy tương ứng. Nhánh AI có text “Đang phân tích…” nhưng không được đặt trong status/live region; vùng live của Search nằm ở nhánh khác, không bao phủ nhánh loading. Spinner autocomplete cũng aria-hidden mà không có pending announcement tương đương. Status toast rỗng toàn cục không tự thông báo trạng thái này.

**Đề xuất:** một thông báo ngắn cho mỗi vùng đang tải, skeleton con vẫn aria-hidden; tránh để screen reader đọc từng thẻ giả hoặc toàn bộ danh sách khi refresh. Đây là khoảng trống liên quan [WCAG 4.1.3](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), chưa phải kết quả kiểm định bằng screen reader. Nhóm: accessibility. Hướng xử lý: `$impeccable harden`.

### L10 — P2: Tải profile dùng fullscreen che cả shell

**Vị trí:** `src/features/profile/pages/member-profile-page.tsx:167`; `src/shared/components/ui/loading.tsx:42,49,76`; `src/app/components/layout.tsx:16`.

Request profile nằm trong route nhưng dựng fixed inset-0 z-100, che navbar và cả navigation. Loading còn tự sửa global isPageLoading để ẩn footer. Đây là phạm vi khóa rộng hơn dữ liệu đang thiếu, khác với route fallback chỉ nằm trong main.

**Đề xuất:** giữ shell điều hướng, dùng placeholder nội dung profile. Fullscreen chỉ dùng cho bootstrap thực sự không thể thao tác. Primitive biểu diễn loading nên tránh tự sở hữu readiness của toàn app. Nhóm: integrity/interaction. Hướng xử lý: `$impeccable distill`, `$impeccable harden`.

### L11 — P2: Startup và tải chunk modal có khoảng thiếu phản hồi

**Vị trí:** `src/shared/components/feedback/splash-screen.tsx:8,43`; `src/app/index.tsx:73,82,95`; `src/app/components/navbar.tsx:250,256`.

Splash hết sau 1.500 ms bất kể auth/data đã sẵn sàng; appReady chỉ tham gia hiển thị footer. Nếu auth vẫn pending khi splash hết, MainApp trả null và không còn loading UI. Reduced-motion kết thúc splash ngay nên cũng cần auth fallback riêng. Các modal lazy dùng fallback null nên lần click đầu có thể chưa thấy shell/phản hồi trước khi chunk tải xong; đã quan sát một snapshot không có dialog sau click, snapshot kế tiếp mới có dialog.

**Đề xuất:** tách animation thương hiệu khỏi trạng thái bootstrap có nghĩa; auth pending phải có fallback. Cho thao tác mở modal một shell/status ngay khi bắt đầu tải chunk. Không mặc định trì hoãn nội dung nhanh chỉ để kéo dài splash. Nhóm: integrity/feedback. Hướng xử lý: `$impeccable harden`, `$impeccable animate`.

### L12 — P2: Thống kê lịch hiển thị 0 khi chưa biết kết quả

**Vị trí:** `src/features/calendar/stores/release-calendar-store.ts:47`; `src/features/calendar/pages/release-calendar-page.tsx:107`.

Mỗi fetch xóa monthEpisodes về []. Totals luôn lấy length/filter trên mảng này dù loadingEpisodes hoặc episodesError. Grid/list báo đang tải hoặc lỗi trong khi summary báo 0 như số liệu thật. **Đề xuất:** các total phụ thuộc episode nhận cùng pending/error; giữ riêng số series đã biết. Nhóm: integrity/clarity. Hướng xử lý: `$impeccable harden`, `$impeccable clarify`.

### L13 — P2: Thêm/gỡ phim trong album không phản hồi pending theo item

**Vị trí:** `src/features/albums/hooks/use-album-detail.ts:90,106`; `src/features/albums/pages/album-detail-page.tsx:216,275`.

Handler await ghi dữ liệu nhưng không có pending IDs hoặc optimistic update. Card/nút giữ nguyên cho đến subscription phản ánh kết quả, thao tác chậm trông như chưa nhận click và dễ bị lặp. **Đề xuất:** trạng thái pending theo phim hoặc optimistic update có rollback; các phim khác vẫn tương tác được. Nhóm: integrity/feedback. Hướng xử lý: `$impeccable harden`.

### L14 — P2: Random picker thiếu phục hồi sau khi nguồn fallback lỗi

**Vị trí:** `src/features/movies/hooks/use-random-picker.ts:88`; `src/features/movies/components/random-picker-modal.tsx:118`.

Catch bỏ qua lỗi, sau đó tắt spinner và hiện EmptyState. Copy có nói không tải được trending, nên không kết luận là che giấu hoàn toàn lỗi; vấn đề là không có error state/retry riêng. **Đề xuất:** phân biệt pool rỗng thành công với request lỗi, cho thử lại tại chỗ. Nhóm: integrity/feedback. Hướng xử lý: `$impeccable harden`.

### L15 — P2: Loading album detail chưa chờ đủ nguồn dữ liệu

**Vị trí:** `src/features/albums/hooks/use-album-detail.ts:23,35,50`; `src/features/albums/pages/album-detail-page.tsx:179`.

AlbumMovies được kết hợp từ album và collection phim, nhưng loading chỉ phản ánh listener album. Album đến trước collection có thể khiến UI hiện album trống dù movieDocIds không rỗng. **Đề xuất:** chỉ đưa ra successful empty khi đủ hai nguồn; nội dung album và danh sách phim có thể có loading boundary riêng. Đây là đường đi source cho phép, chưa đo tần suất xuất hiện trên UI. Nhóm: integrity. Hướng xử lý: `$impeccable harden`.

### L16 — P3: Nút lưu form chưa xét trạng thái tải details

**Vị trí:** `src/features/movies/components/add-movie-modal.tsx:97,137,445`; `src/features/movies/hooks/use-add-movie-form.ts:202`.

submitDisabled không xét isLoadingDetails trong khi form đang bị thay bằng skeleton; handler cũng không chặn điều kiện này. Tùy data có sẵn và dirty/edit flags, nút lưu có thể vẫn bấm được, dẫn đến validation dữ liệu chưa hoàn tất. **Đề xuất:** disable và guard cho đến khi các dữ liệu bắt buộc đã sẵn sàng. Chưa tái hiện một lần lưu sai dữ liệu. Nhóm: integrity. Hướng xử lý: `$impeccable harden`.

### L17 — P3: Search có loading chỉ phản ánh mount

**Vị trí:** `src/features/search/hooks/use-search.ts:88,164`; `src/features/search/pages/search-page.tsx:57`.

initialLoading khởi tạo true rồi false ngay trong effect, không gắn request hay cache readiness. Nó tạo thêm một nhánh 10 placeholder không biểu diễn công việc cụ thể. React có thể batch nên không kết luận luôn có nhấp nháy nhìn thấy được. **Đề xuất:** suy initial pending từ nguồn dữ liệu thực; bỏ flag nếu không có vai trò độc lập. Nhóm: integrity. Hướng xử lý: `$impeccable distill`.

## Những điểm đang làm đúng

- Dashboard phân biệt loading/error có retry/empty/content; skeleton và nội dung dùng cùng breakpoint grid.
- Movie store giữ nội dung qua cập nhật realtime bình thường, chỉ bật loading khi initialize/đổi user.
- TMDB search/discover có cancellation và bỏ qua response cũ; lỗi L02 nằm ở reset state khi rời mode, không phải thiếu bảo vệ stale response nói chung.
- Trending giữ card sẵn có khi refresh; đây là pattern nên áp dụng cho các refresh cùng ngữ cảnh.
- Calendar episode list phân biệt pending/error có retry/empty/content; store có guard request mới và scope user/month.
- Movie detail giữ nội dung chính khi chỉ tải credits/video bổ sung; không thay cả trang bằng skeleton.
- Member-search dùng spinner cục bộ và lọc local không dựng loading mạng giả.
- Login có disabled, aria-busy và icon pending; Button dùng chung đã hỗ trợ disable/aria-busy; upload có trạng thái riêng.
- PosterCard giữ aspect ratio trước khi ảnh tải và có lazy loading. Không có skeleton riêng cho mọi ảnh không tự động là lỗi.
- Có reduced-motion ở SkeletonCard/Loading và CSS toàn cục `src/index.css:188`. Không báo raw animate-pulse/spin là vi phạm reduced-motion chỉ vì thiếu motion-safe tại chỗ. Chưa kiểm định mức dễ hiểu của trạng thái tĩnh trên thiết bị hỗ trợ.

## Hợp đồng loading đề xuất

Đây là đề xuất dựa trên tình huống của CineMOB, chưa được áp dụng. Skeleton có ích khi biết trước cấu trúc nội dung; indicator nên ở đúng vùng thiếu dữ liệu và tránh khóa phần còn lại của trang, phù hợp với [Fluent 2 Skeleton guidance](https://fluent2.microsoft.design/components/web/react/core/skeleton/usage/). Hướng dẫn này không yêu cầu đổi thư viện giao diện.

| Tình huống | Cách hiển thị | Điều kiện kết thúc/phục hồi |
|---|---|---|
| Auth/bootstrap chưa biết session | Một loading có text/status; giữ nền có nghĩa | Sẵn sàng hoặc lỗi có hướng phục hồi; animation thương hiệu không làm nguồn readiness |
| Route chunk chưa đến | Indicator ở main, giữ navigation | Chunk đến hoặc ErrorBoundary; không fullscreen mặc định |
| Modal chunk chưa đến | Phản hồi mở modal/status ngay | Shell + nội dung; có thể đóng |
| Lần đầu tải grid/card chưa có data | Skeleton đúng aspect, grid, gap của nội dung thật | Success → cards/empty; error → retry |
| Detail/profile chưa có data | Skeleton theo bố cục detail/profile | Không cho chỉnh sửa/lưu dữ liệu chưa xác định |
| Refresh cùng scope đã có data | Giữ nội dung hợp lệ, báo cập nhật cục bộ | Thay data khi thành công; thất bại giữ cũ và nói rõ |
| Đổi scope user/query/month | Không trình bày data scope cũ như kết quả mới | Pending/error/data gắn đúng key; hủy request không để cờ treo |
| Autocomplete | Spinner/status trong input | Clear/submit/cancel cũng reset pending |
| Tạo/lưu/upload | Pending ngay ở nút/vùng thao tác, text rõ, chống submit lặp | finally kết thúc; error giữ input và cho thử lại |
| Thêm/gỡ từng item | Busy theo item hoặc optimistic update + rollback | Không khóa toàn grid |
| Chart/totals phụ thuộc request | Placeholder/unknown trong pending/error | Chỉ hiển thị 0 khi request thành công và thực sự bằng 0 |
| Lọc/sort dữ liệu local | Cập nhật trực tiếp | Không thêm loading mạng giả |
| Ảnh lazy | Giữ tỉ lệ + nền/fallback khi lỗi | Không thay cả card bằng skeleton chỉ vì ảnh chưa đến |
| Chờ lâu/AI | Text rõ tác vụ; giữ phần độc lập dùng được; timeout/retry phù hợp | Không tạo phần trăm hoặc tiến độ giả |

Chỉ cần chuẩn hóa primitive hình dạng, status vùng, và một vài composition theo layout đang có. Không cần tạo một loading manager tổng quát hoặc chuyển mọi async state vào một store.

Chính sách chống nhấp nháy nên đo trước khi chọn ngưỡng trì hoãn hiển thị. Pending của hành động cần phản hồi ngay; không ép người dùng chờ thêm chỉ để skeleton tồn tại đủ lâu. Chưa có bằng chứng đo mạng thực tế để chốt một con số áp dụng cho cả ứng dụng.

## Thứ tự xử lý và tiêu chí kiểm tra lại

1. **P1 — `$impeccable harden`:** khóa profile edit theo readiness, xử lý reset discovery, kết thúc album loading khi listener lỗi. Kiểm tra: pending → clear không treo; permission-denied hiện retry; không thể tạo draft rỗng từ profile chưa đọc được.
2. **P2 — `$impeccable harden` / `$impeccable clarify`:** phân biệt lỗi/rỗng, scope dependencies và totals; thêm phục hồi cho picker và pending item. Kiểm tra: tất cả lỗi mạng không bị gọi là “không có dữ liệu”.
3. **P2 — `$impeccable layout` / `$impeccable adapt` / `$impeccable colorize`:** sửa skeleton geometry/fill/grid trên desktop/mobile và cả theme. Kiểm tra: cùng số cột, aspect, gap; calendar không thừa tuần chờ; không có placeholder trong suốt.
4. **P2/P3 — `$impeccable optimize` / `$impeccable distill` / `$impeccable harden`:** giữ nội dung hợp lệ khi refresh, thu hẹp fullscreen, bỏ mount-only loading, chuẩn hóa Button/status. Kiểm tra: keyboard/screen reader nhận pending/completion, reduced-motion vẫn hiểu tác vụ đang chạy.
5. **Cuối cùng — `$impeccable polish`:** kiểm tra một lượt các luồng đã sửa; chạy lại audit theo cùng danh mục để so sánh.

Các tình huống cần chạy sau khi sửa: cache nhanh/chậm, mất mạng, terminal listener error, request bị hủy, clear filter lúc pending, discovery trả [], AI refresh có data cũ, album trước collection, đổi tháng lịch, mở edit profile khi chưa đọc xong, lazy chunk lần đầu, mobile/light/dark/reduced-motion và screen reader.

Audit này chưa triển khai các sửa đổi trên. Có thể thực hiện theo từng nhóm ưu tiên hoặc gộp sau khi duyệt phạm vi.
