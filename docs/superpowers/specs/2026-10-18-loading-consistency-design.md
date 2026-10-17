# Chuẩn hóa trạng thái loading trong CineMOB

Ngày: 18/10/2026. Trạng thái: bản thiết kế chờ người dùng duyệt; chưa cho phép triển khai source.

## 1. Mục tiêu và phạm vi đã thống nhất

Người dùng muốn biết các trạng thái chờ có được thiết kế và dùng đúng tình huống không, và đã đồng ý hướng chuẩn hóa trên giao diện hiện có: sửa lỗi trạng thái trước, thống nhất cách dùng sau, rồi đồng bộ hình thức. Không yêu cầu người dùng tự chọn skeleton/spinner cho từng màn hình.

Đầu vào là `docs/loading-audit-2026-10-18.md`, gồm L01–L17. Phạm vi gồm auth/startup, route/modal lazy, search/AI/trending, dashboard, movie/person detail, album, calendar/stats, profile, thao tác lưu/upload và ảnh trong card. Cả 17 phát hiện phải được xử lý hoặc có bằng chứng kiểm tra lại cho thấy không còn áp dụng; không coi báo cáo audit là bằng chứng mọi lỗi đã tái hiện trên browser.

Thành công nghĩa là UI phản ánh đúng việc đang diễn ra: không chờ vô hạn sau hủy/lỗi; không gọi lỗi là dữ liệu rỗng; không cho ghi từ dữ liệu chưa đọc được; không che nội dung hợp lệ khi chỉ cập nhật bổ sung; skeleton giữ cấu trúc của nội dung sẽ thay thế.

## 2. Ràng buộc và những lựa chọn được đề xuất

Giữ React, TypeScript, Vite, Zustand, Tailwind và thư viện hiện có. Tuân theo `DESIGN.md`: Editorial Print, hai theme, hairline, token và copy tiếng Việt. Không đổi luồng nghiệp vụ thêm phim/album, quyền riêng tư, API hoặc schema Firestore. Không thêm thư viện runtime, global loading manager, cache layer mới, tiến độ phần trăm giả hoặc skeleton cho mọi thành phần.

Các quyết định cụ thể còn lại trong tài liệu là đề xuất kỹ thuật của trợ lý để người dùng duyệt cùng bản thiết kế, chưa phải lựa chọn mà người dùng đã chỉ định:

- Dùng busy theo item cho thao tác album, giữ cách cập nhật từ subscription; không bổ sung optimistic update/rollback mới.
- Phản hồi thao tác ngay, không đặt delay/minimum-duration chung và không kéo dài skeleton nhân tạo.
- Bỏ thời gian splash bắt buộc 1.500 ms: dùng khung thương hiệu trong lúc xác định auth; session đã rõ thì hiển thị login hoặc shell. Dữ liệu collection tiếp tục có loading riêng bên trong shell, không giữ người dùng ở splash để đợi mọi nguồn.
- Button chuẩn hóa icon pending và nhãn hành động; caller truyền copy phù hợp, không mỗi nơi tự dựng spinner.
- Giới hạn công việc này vào loading và lỗi liên quan. Không thay typography/layout nội dung thật, không thêm tính năng, không refactor lân cận.

## 3. Quy tắc trạng thái dữ liệu

Mỗi vùng dữ liệu phải phân biệt được: chưa có dữ liệu hợp lệ, đang tải, thành công có dữ liệu, thành công rỗng, lỗi. Đây là hợp đồng hành vi; không bắt buộc thay tất cả boolean hiện có bằng một kiểu state mới.

Một kết quả chỉ hợp lệ với đúng user và tham số đã tạo ra nó. Query, bộ lọc, trang kết quả, album, profile và tháng lịch đều thuộc ngữ cảnh tương ứng. Request cũ không được cập nhật data/error/loading của request mới. Chuyển user phải loại dữ liệu của user cũ trước khi render nội dung user mới.

| Trường hợp                                       | Hành vi đã chọn                                                                                           |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| Lần đầu tải nội dung có bố cục biết trước        | Skeleton theo vùng; shell và phần độc lập vẫn dùng được                                                   |
| Cùng ngữ cảnh, đang refresh và có dữ liệu hợp lệ | Giữ nội dung, báo “Đang cập nhật…” cục bộ; thất bại giữ data cũ kèm thông báo chưa cập nhật được và retry |
| Sang query/filter/page/month/profile/user khác   | Không trình bày data ngữ cảnh cũ như kết quả mới; vùng mới có skeleton/loading của nó                     |
| Đọc thành công trả rỗng/không tồn tại            | Empty/not-found đúng ngữ cảnh; chỉ xuất hiện sau khi các nguồn bắt buộc đã đọc thành công                 |
| Đọc lỗi, chưa có dữ liệu                         | ErrorState với nút thử lại ở vùng liên quan; không để skeleton tiếp tục vô hạn                            |
| Request hủy vì ngữ cảnh đã đổi hoặc unmount      | Không toast lỗi; pending của request bị bỏ không còn điều khiển UI                                        |
| Lọc/sort dữ liệu đã có trong máy                 | Cập nhật trực tiếp, không dựng loading mạng giả                                                           |

Không dùng một timeout tùy tiện để coi Firestore offline là danh sách rỗng hoặc lỗi terminal. Giữ cơ chế cache/reconnect của Firebase; lỗi terminal phải được xử lý qua callback lỗi. Không mở rộng đợt này thành hệ thống theo dõi trạng thái mạng toàn app.

## 4. Quy tắc hình thức và accessibility

### Primitive dùng chung

- `SkeletonCard` thể hiện đúng `PosterCard`: toàn thẻ aspect 2:3, radius poster, metadata giả nằm trong cùng khung; bỏ phần metadata rời kéo dài chiều cao.
- Có primitive khối skeleton nhỏ dùng chung cho màu, radius và pulse; composition form/profile/chart giữ ở feature. Chỉ tách composition khi có sử dụng thực tế, không tạo bộ preset cho mọi layout.
- Dùng token nền skeleton có vai trò rõ trong `src/index.css`, tham chiếu palette sẵn có: màu base là surface, phần fill dùng text-primary pha ở mức nhẹ theo theme. Mức alpha cuối cùng để builder chọn qua đối chiếu light/dark; không hex trong TSX, không tạo màu nhấn mới. Placeholder phải thấy được cả trên surface và background.
- Skeleton và content chia sẻ breakpoint, số cột, gap, chiều rộng vùng poster và cách tính số hàng. Số thẻ placeholder theo page size/section hiện có; không tuyên bố bằng số kết quả thực khi chưa biết.
- `Loading` chỉ biểu diễn trạng thái. Mặc định local; fullscreen phải chọn tường minh và chỉ dành cho auth/bootstrap. Loại side effect đặt global `isPageLoading` từ primitive; footer/navigation thuộc layout readiness, không phụ thuộc một spinner đang mount.
- Spinner trong button/input, spinner vùng nội dung và fullscreen dùng cùng hình dạng, có cỡ theo ngữ cảnh. Không thêm spinner animation riêng ở các feature.

### Nội dung hỗ trợ

Một vùng đang tải có một status ngắn và vùng nội dung nhận `aria-busy` khi phù hợp. Skeleton/spinner trang trí `aria-hidden`; không lồng nhiều role=status cho cùng một việc. Live status đặt ngoài phần aria-busy để không tự trì hoãn thông báo, và tồn tại ổn định qua chuyển trạng thái. Kết quả tìm kiếm thông báo số kết quả thay vì đọc cả danh sách card; lỗi dùng thông báo hiện có hoặc status phù hợp, tránh thông báo trùng với toast.

Reduced motion giữ placeholder tĩnh và text/status; không thêm chuyển động để thay pulse/spin. Không dời focus khi dữ liệu tải xong. Với modal, shell pending nhận focus và giữ focus trong dialog; khi nội dung đến không tự reset focus nếu người dùng đã thao tác.

## 5. Quy tắc theo luồng

### Auth, navigation và modal lazy — L10, L11

Auth chưa xác định: một khung thương hiệu có “Đang xác thực…”; auth lỗi có retry, không trả null trống. Nếu auth có kết quả nhanh, chuyển tiếp ngay, không đợi đủ 1.500 ms. Giữ wordmark và phong cách hiện tại; animation vào ngắn được phép nhưng không quyết định readiness. Không yêu cầu animation thoát hoặc splash mới.

Sau khi auth thành công, giữ navbar, footer và navigation ổn định trong khi từng route tải collection. Footer có thể chờ shell/auth sẵn sàng, không ẩn/hiện theo pending của từng profile/section. Public profile dùng skeleton trong main thay fullscreen overlay.

Route chunk chờ: local Loading trong main. Route đã mount nhưng đang tải data: thay bằng skeleton theo layout route. Đây là hai công việc khác nhau; không thêm delay để che chuyển tiếp.

Modal lazy chờ: cho xuất hiện dialog shell có tiêu đề, status và nút đóng. Dùng lại primitive Dialog hiện có; chỉ có một shell và một focus trap tại một thời điểm. Đóng trước khi chunk hoàn tất không được mở lại modal khi chunk về. Chunk lỗi có retry/đóng ở vùng modal qua ErrorBoundary, không làm mất shell ứng dụng.

### Search, discovery, AI và person — L02, L07, L08, L09, L17

Chọn mode bằng state/params: submitted query đủ điều kiện là search; không có query đủ điều kiện nhưng có filter khác mặc định là discover; còn lại là home. Không suy mode từ độ dài results. Home bỏ qua và reset data/error/pending discovery không còn áp dụng. Discover thành công [] hiện “Không có phim khớp bộ lọc” và hành động xóa lọc, không hiện AI/trending thay kết quả lọc.

Giữ debounce autocomplete/discovery và quy tắc submit hiện có. Clear filter, clear query, submit và đổi mode phải bỏ pending/error của request không còn áp dụng; response cũ không được khôi phục chúng. Bỏ `initialLoading` chỉ phản ánh mount, tính pending từ nguồn thật. Retry chạy đúng query/filter/page hiện tại.

AI/trending lần đầu dùng skeleton vùng riêng. Refresh cùng user và cùng nguồn đề xuất giữ cards đang có, khóa nút refresh đang chạy và báo cập nhật cục bộ; lỗi có retry, không xóa nội dung cũ hợp lệ. Giữ timeout/retry có sẵn của service AI, không thêm tiến độ giả. Autocomplete có status ngắn và không che kết quả chính.

Person detail có skeleton theo vùng profile + grid và ErrorState/retry khi fetch lỗi; not-found chỉ dành cho kết quả không tồn tại. Credits/video bổ sung không làm ẩn thông tin chính đã có.

### Hồ sơ — L01, L04, L06, L10

Readiness của own profile tách khỏi `profile === null`: null sau một lần đọc thành công có nghĩa chưa có hồ sơ, được phép bắt đầu điền; lỗi đọc thì không cho sửa từ bản rỗng. Chỉnh sửa, lưu chi tiết và đổi quyền hiển thị danh sách đều phải đợi lần đọc hồ sơ thành công vì chúng phụ thuộc dữ liệu hiện tại. Guard nằm cả UI và handler; upload avatar độc lập giữ hành vi hiện có nếu không phụ thuộc profile details.

Draft chỉ khởi tạo từ snapshot đã đọc thành công lúc bắt đầu sửa. Không tự đồng bộ response đến muộn đè thao tác đang nhập. Lỗi đọc có retry. Public profile lỗi không được coi là not-found. Danh sách phim nhận cả loading và error của collection; các phần giao nhau giữa hai collection chỉ kết luận rỗng khi đủ nguồn thành công.

### Movie form/detail — L04, L06, L08, L16

Khởi tạo form cần dữ liệu TMDB: skeleton form có nền; nút lưu disable, handler từ chối khi dữ liệu bắt buộc chưa sẵn sàng. Lỗi lấy dữ liệu bắt buộc có retry/đóng và giữ input đã nhập, không mở form với dữ liệu thiếu như thể đã tải thành công. Form thêm thủ công không phụ thuộc request TMDB mới và vẫn dùng ngay.

Edit phim đã có data: giữ form hiện có khi refresh tiến độ TV. Chỉ vùng season/episode phụ thuộc request thể hiện pending; disable điều khiển phụ thuộc và lưu trong lúc request này có thể thay đổi payload. Không ghi đè trường người dùng đã sửa bằng response đến muộn. Nếu refresh TV lỗi, giữ snapshot đã lưu trước đó, báo lỗi tại vùng và cho retry; chỉ cho lưu bằng snapshot này nếu nó đủ thông tin cho validation hiện có, nếu không thì chặn lưu và nói rõ lý do.

Movie detail lần đầu dùng layout poster + thông tin, không dùng một card full-width. Collection lỗi có ErrorState/retry; collection đã đọc thành công nhưng không tìm thấy movie mới hiển thị not-found. Extras loading nằm trong vùng extras.

### Album và mutations — L03, L13, L15

List và detail subscription có callback lỗi, pending kết thúc ở lỗi terminal. Bắt đầu theo user/album mới phải đặt loading/error/data theo đúng scope. Retry tái đăng ký listener và hủy listener cũ, không gọi reload toàn trang. List retry được đi qua nguồn album chung do app-init sở hữu; không tạo subscription song song từ mỗi consumer. Album selector dùng cùng trạng thái lỗi/retry của nguồn này.

Album header có thể hiện trước; grid phim phải đợi cả album và movie collection. Chỉ báo album trống khi cả hai nguồn thành công và phép kết hợp thực sự rỗng. Một nguồn lỗi thì vùng phụ thuộc có error/retry của nguồn đó; không khóa header/nav không liên quan.

Thêm/gỡ phim dùng pending theo docId: disable thao tác lặp trên cùng item, có icon/text đang thêm/gỡ, giữ các item khác dùng được. Ghi thành công được phản ánh qua subscription; nếu callback dữ liệu đến sau promise ghi thì vẫn giữ pending cho đến khi thấy kết quả mong đợi hoặc subscription lỗi. Khi lỗi ghi/subscription hoặc đổi scope thì giải phóng pending đúng item và có phục hồi. Giữ undo-toast 7 giây hiện có sau khi gỡ thành công; không thêm optimistic mutation.

### Calendar, stats và random picker — L05, L06, L12, L14

Calendar grid dùng cùng cách tính số ô ở pending và loaded cho tháng hiện tại. Grid/list/totals episode chia sẻ scope và trạng thái: pending hiển thị placeholder cho total, lỗi hiển thị “Chưa tải được” hoặc dấu gạch kèm thông báo lỗi chung, không dùng 0. Số series từ collection đã biết vẫn có thể hiện. Đổi tháng không giữ số liệu tháng trước như số liệu tháng mới.

Stats/calendar truyền lỗi collection phim và có retry. Stats lọc năm trên data local không thêm skeleton hoặc delay mạng. Giữ cách retry episode hiện có và bảo vệ request/user/month cũ.

Random picker dùng spinner có text khi tải pool; thành công rỗng khác request lỗi. Lỗi có nút thử lại ở modal và đóng luôn hoạt động; nếu watchlist hợp lệ có thể dùng ngay, không đợi trending.

### Button, upload và ảnh

`Button loading` disable thao tác và cung cấp một spinner trang trí dùng chung; nhãn pending do caller truyền (ví dụ “Đang lưu…”, “Đang tạo…”). Spinner thay leading icon khi pending; không hiển thị hai icon chờ. Rà soát caller hiện có để bỏ spinner tự dựng bị trùng, không đổi các nút không liên quan loading. Nút input/icon-only giữ accessible name diễn đạt hành động và trạng thái. Thao tác độc lập không khóa cả trang; giữ input khi lỗi và luôn có finally/cleanup phù hợp.

Poster/album image giữ aspect ratio và lazy loading hiện có. Khi URL tải lỗi, dùng fallback ảnh hiện có một lần, không tạo vòng lặp onError và không thay cả card bằng skeleton. Không thêm onLoad state hoặc animation riêng cho mọi ảnh. Avatar fallback đã có không đổi ngoài lỗi liên quan.

## 6. Cấu trúc triển khai và giới hạn trách nhiệm

State request vẫn ở hook/store/service đang sở hữu dữ liệu. Error/retry album chung thuộc nguồn album app-init/store; movie collection retry dùng lại cơ chế initialize/cleanup của movie store, gắn đúng user hiện tại. Không sao chép listener xuống từng page để sửa lỗi hiển thị.

Primitive chung chịu trách nhiệm hình dạng/status/button pending; feature chịu trách nhiệm bố cục skeleton, dữ liệu bắt buộc, error/empty và phạm vi khóa hành động. `DESIGN.md` bổ sung bảng chọn skeleton/spinner/refresh/error ngắn và trỏ tài liệu này; không sao chép toàn bộ audit vào component comments.

Builder quyết định tên component/prop/helper, cách biểu diễn request identity, cách nối retry vào store hiện có và file test; chỉ trích xuất helper thật sự cần để chứng minh hành vi. Không bắt buộc xây một API tổng quát để mọi feature có cùng kiểu state.

## 7. Kiểm chứng và tiêu chí hoàn tất

Đây là thay đổi nhiều feature, cần kế hoạch triển khai sau khi duyệt tài liệu. Thứ tự: (1) bảo vệ dữ liệu và kết thúc pending, (2) error/empty/scope/refresh, (3) primitives và skeleton geometry, (4) keyboard/status/theme và kiểm tra tích hợp. Mỗi nhóm phải có bằng chứng trước khi chuyển nhóm; không sửa tất cả rồi chỉ chạy build.

| Nhóm           | Bằng chứng bắt buộc                                                                                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Profile        | Initial read pending/error không cho edit/save/toggle; success-null cho tạo chi tiết; dữ liệu sẵn có không bị xóa khi chỉ đổi tên                                      |
| Search         | Pending → clear; pending → đổi mode/page/query; response cũ đến muộn; discover []; retry đúng params; home không dùng state discovery cũ                               |
| Album          | List/detail terminal error thoát loading; retry không nhân listener; album đến trước movies không báo rỗng; item busy chống click lặp và chờ subscription phản ánh ghi |
| Error/refresh  | Lỗi collection không thành empty; refresh cùng scope giữ data; đổi user/query/month không rò data cũ; late response không đè draft                                     |
| Startup/modal  | Auth nhanh không bị giữ 1.500 ms; auth chậm không trống; auth error có retry; modal lazy mở có phản hồi, đóng trước khi tải xong không mở lại                          |
| Geometry/theme | So sánh skeleton/content cùng viewport ở 390 px và 1440 px; light/dark; poster 2:3, grid/gap trùng, lịch 4/5/6 tuần không đổi số hàng vì loading                       |
| Accessibility  | Keyboard đóng modal và giữ focus; một status mỗi vùng; không đọc danh sách placeholder; reduced-motion còn text/status có nghĩa                                        |
| Mutations/ảnh  | Save cần details chưa sẵn sàng bị chặn; ảnh lỗi dùng fallback một lần; pending không lặp spinner; lỗi giữ input                                                        |

Các regression về request/state và bảo vệ ghi cần automated test chạy offline với dữ liệu giả, chứng minh fail trước/fix sau. Repo chưa có frontend runner; ưu tiên công cụ Node/TypeScript/React hiện có và kiểm thử handler/state thật, không test chỉ tìm chuỗi source. Nếu cần test runner/DOM để chạy hook/component thật thì builder phải ghi rõ lựa chọn dev-only tối thiểu trong kế hoạch trước khi triển khai; ràng buộc không thêm thư viện runtime vẫn giữ nguyên.

Kiểm tra cuối gồm typecheck/lint/build theo scripts hiện có, regression có liên quan, một lượt browser desktop/mobile và hai theme, detector trên target đã đổi. Kiểm tra accessibility bằng DOM/keyboard; nếu không có screen reader phải ghi rõ giới hạn, không tuyên bố đạt WCAG từ aria attributes. Không ghi/xóa dữ liệu tài khoản thật để chứng minh L01; dùng fixture/mocks cho đường ghi.

Stop condition: có đối chiếu L01–L17 với thay đổi và bằng chứng; không còn pending bị treo ở các kịch bản trên, không còn lỗi giả empty, primitive hiển thị đúng và không khóa thừa. Chỉ polish lỗi trong phạm vi vừa thay đổi; không mở rộng thành redesign hay cải tổ toàn bộ data layer.
