# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Người dùng chính:** Tín đồ điện ảnh (Cinephile) và người yêu thích phim ảnh thường xuyên, muốn có một không gian cá nhân gọn gàng để lưu trữ, theo dõi và lên kế hoạch xem phim.
- **Tình huống sử dụng:** Thường dùng trên điện thoại di động (qua PWA) khi lướt tìm phim, kiểm tra lịch ra tập mới, hoặc dùng trên máy tính bảng/desktop khi tra cứu thông tin chuyên sâu và xem lại thống kê giải trí.
- **Mục tiêu công việc (Job-to-be-done):** Theo dõi phim đã xem / muốn xem (Watchlist), nhận nhắc nhở khi có tập phim TV mới, tìm kiếm phim phù hợp với tâm trạng nhanh chóng (qua AI hoặc Random Picker), và tổng kết thói quen xem phim qua biểu đồ trực quan.

## Product Purpose

- **Mục đích:** Là người bạn đồng hành giải trí toàn diện cho người yêu phim, giải quyết vấn đề phân mảnh thông tin khi theo dõi nhiều bộ phim/series cùng lúc và tình trạng "không biết xem gì tối nay".
- **Ý nghĩa thành công:** Người dùng dễ dàng quản lý trọn vẹn thư viện phim cá nhân, không bỏ lỡ tập phim yêu thích, và có trải nghiệm tương tác liền mạch, mượt mà như một ứng dụng native.

## Positioning

- **Định vị:** CineMOB không đơn thuần là một cuốn sổ ghi chép hay ứng dụng tra cứu TMDB tĩnh, mà là nền tảng quản lý phim toàn diện trên nền PWA, kết hợp thông minh giữa lịch phát sóng tự động (TV Calendar), trợ lý gợi ý AI (OpenRouter), công cụ chọn ngẫu nhiên (Random Picker) và hệ thống biểu đồ thống kê cá nhân hóa sâu sắc (Recharts).

## Operating Context

- **Môi trường sử dụng:** Trình duyệt web hiện đại trên cả Mobile và Desktop, ưu tiên tối đa khả năng cài đặt như ứng dụng độc lập qua chuẩn PWA (Progressive Web App) kèm thông báo đẩy (Push Notifications).
- **Luồng tác vụ chính:**
  1. Khám phá & tra cứu phim/TV show/diễn viên qua TMDB.
  2. Thêm vào danh sách theo dõi (Watchlist) hoặc phân loại vào các Album theo chủ đề riêng.
  3. Theo dõi tiến độ phim truyền hình và nhận thông báo lịch chiếu tập mới.
  4. Yêu cầu AI gợi ý phim theo gu hoặc dùng Random Picker khi phân vân.
  5. Xem biểu đồ thống kê thói quen xem phim và xuất dữ liệu ra file Excel (.xlsx).
  6. Tạo thẻ chia sẻ (Share Card) để chia sẻ phim hay với bạn bè.

## Capabilities and Constraints

- **Công nghệ & Kiến trúc:**
  - Frontend: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide React, Framer Motion.
  - State Management: Zustand 5.
  - Dữ liệu phim: TMDB API (The Movie Database).
  - Trí tuệ nhân tạo: OpenRouter API (AI Recommendations).
  - Backend & Xác thực: Firebase v12 (Firestore thời gian thực, Google Auth).
  - Đồ thị & Thống kê: Recharts.
  - Xuất dữ liệu: SheetJS (XLSX).
- **Ràng buộc kỹ thuật:**
  - Kiến trúc Client-Side Rendering (CSR) Serverless trên Firebase.
  - Phải duy trì hiệu năng tải trang nhanh và trải nghiệm offline/cache mượt mà của PWA.
  - Biến môi trường TMDB/Firebase client-side không lưu trữ secret nhạy cảm.

## Brand Commitments

- **Tên sản phẩm:** CineMOB ("Cine Over B**ch !!").
- **Khẩu hiệu:** "Người bạn đồng hành lý tưởng cho những tín đồ điện ảnh".
- **Phong cách & Tinh thần:** Táo bạo, hiện đại, năng động, mang tinh thần đam mê điện ảnh thuần túy nhưng vẫn giữ giao diện tối giản, trực quan và dễ thao tác.
- **Tài sản thương hiệu:** Logo tại `docs/images/logo_text.png`, hỗ trợ song song hai chế độ Dark/Light Mode.

## Evidence on Hand

- Toàn bộ source code hoạt động và cấu hình PWA tại `src/`.
- Hình ảnh logo, mockup giao diện tại `docs/images/`.
- Tài liệu kiến trúc và hướng dẫn tại README.md.

## Product Principles

1. **Trải nghiệm Native mượt mà (PWA-first):** Mọi tương tác, chuyển cảnh và phản hồi đều phải nhanh, êm ái như một ứng dụng gốc trên thiết bị di động.
2. **Cá nhân hóa nhưng không phức tạp:** Dữ liệu, album và gợi ý phải xoay quanh gu xem phim của từng cá nhân mà không đòi hỏi thao tác thiết lập rườm rà.
3. **Nội dung là trung tâm:** Poster, hình ảnh, trailer và thông tin phim phải là nhân vật chính; giao diện hỗ trợ và tôn vinh tác phẩm điện ảnh.
4. **Không để người dùng bế tắc:** Luôn có giải pháp cho câu hỏi "Hôm nay xem gì?" thông qua AI gợi ý, Random Picker hoặc danh sách thịnh hành.

## Accessibility & Inclusion

- Hỗ trợ đầy đủ điều hướng cảm ứng (touch gestures) trên thiết bị di động và bàn phím/chuột trên desktop.
- Đảm bảo độ tương phản màu sắc đạt chuẩn đọc rõ trên cả Dark Mode và Light Mode.
- Giao diện thân thiện, cỡ chữ và vùng chạm (hit target) đạt tiêu chuẩn trải nghiệm di động.
