<div align="center">
  <img src="docs/images/logo_text.png" alt="Logo dự án">
  <br />
  <i>Cine Over B**ch !!</i> 🎞️✨
</div>

## 🚀 Giới thiệu

**CineMOB** là một ứng dụng web hiện đại, được xây dựng để trở thành người bạn đồng hành lý tưởng cho những người yêu điện ảnh. Với CineMOB, bạn không chỉ có thể theo dõi và quản lý danh sách phim đã xem một cách chi tiết, mà còn có thể khám phá những bộ phim mới mẻ thông qua hệ thống gợi ý bằng AI, tạo các album phim theo chủ đề cá nhân, và xem thống kê trực quan về thói quen xem phim của mình. Hãy để CineMOB giúp bạn xây dựng và chăm sóc bộ sưu tập điện ảnh độc đáo của riêng bạn. 🍿🎥

## ✨ Tính năng nổi bật

- **🔐 Xác thực an toàn:** Đăng nhập nhanh chóng và bảo mật bằng tài khoản Google.
- **🔍 Tìm kiếm thông minh:** Dễ dàng tìm kiếm phim và chương trình TV từ cơ sở dữ liệu khổng lồ của TMDB với các bộ lọc nâng cao.
- **🤖 Gợi ý phim bằng AI:** Khám phá những bộ phim mới phù hợp với sở thích của bạn nhờ hệ thống gợi ý được cá nhân hóa bằng AI.
- **📝 Quản lý phim chi tiết:** Thêm phim vào danh sách đã xem hoặc danh sách chờ, kèm theo ngày xem, điểm đánh giá và ghi chú cá nhân.
- **📅 Lịch phát sóng:** Theo dõi ngày ra mắt tập mới của các series TV trong bộ sưu tập, giúp bạn không bỏ lỡ tập phim yêu thích.
- **📁 Bộ sưu tập (Album):** Tự do tạo và quản lý các album phim theo chủ đề, giúp sắp xếp bộ sưu tập của bạn một cách khoa học.
- **🌟 Trang chi tiết:** Cung cấp thông tin đầy đủ về phim, diễn viên, và đạo diễn, bao gồm danh sách phim đã tham gia.
- **📊 Thống kê trực quan:** Theo dõi thói quen xem phim của bạn qua các biểu đồ sinh động về số lượng, thể loại, quốc gia, và điểm đánh giá.
- **🎲 Lựa chọn ngẫu nhiên:** Để CineMOB giúp bạn chọn một bộ phim ngẫu nhiên từ danh sách của mình cho buổi xem phim tiếp theo.
- **📤 Xuất dữ liệu:** Dễ dàng xuất toàn bộ danh sách phim của bạn ra file Excel (XLSX) để lưu trữ hoặc chia sẻ.
- **🌓 Giao diện linh hoạt:** Tùy chỉnh giao diện với chế độ Sáng (Light) và Tối (Dark).
- **📱 Thiết kế đáp ứng (Responsive):** Trải nghiệm mượt mà và đồng nhất trên mọi thiết bị, từ máy tính để bàn đến điện thoại di động.
- **🔔 Thông báo phim:** Nhận thông báo đẩy về tập phim mới của series trong bộ sưu tập để không bỏ lỡ tập yêu thích. (Chỉ áp dụng trên PWA di động)

<div align="center">
  <img src="docs/images/mockup.jpg" alt="Mockup của ứng dụng">
</div>

## ️ Công nghệ sử dụng

| Hạng mục               | Công nghệ                                                                                                                                                       |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Core Framework**     | [React](https://react.dev/) `v19.2.0`, [TypeScript](https://www.typescriptlang.org/) `~5.8.2`                                                                   |
| **Build Tool**         | [Vite](https://vitejs.dev/) `v6.2.0` with [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)                                                                  |
| **Styling**            | [Tailwind CSS](https://tailwindcss.com/) `v4.1.17`, [Lucide React](https://lucide.dev/) `v0.554.0`                                                              |
| **Routing**            | [React Router DOM](https://reactrouter.com/) `v7.9.6`                                                                                                           |
| **State Management**   | [Zustand](https://zustand-demo.pmnd.rs/) `v5.0.8`                                                                                                               |
| **Backend & Database** | [Firebase](https://firebase.google.com/) `v12.6.0` (Firestore, Authentication)                                                                                  |
| **External APIs**      | [The Movie Database (TMDB)](https://www.themoviedb.org/), [OpenRouter AI](https://openrouter.ai/)                                                               |
| **Data Visualization** | [Recharts](https://recharts.org/) `v3.4.1`                                                                                                                      |
| **Animation**          | [Framer Motion](https://www.framer.com/motion/) `v12.23.25`, [Lottie React](https://lottiereact.com/) `v2.4.1`                                                  |
| **Utilities**          | [xlsx](https://www.npmjs.com/package/xlsx) `v0.18.5`, [file-saver](https://www.npmjs.com/package/file-saver) `v2.0.5`, [howler](https://howlerjs.com/) `v2.2.4` |

## ⚙️ Cài đặt và Chạy dự án

### Yêu cầu

- [Node.js](https://nodejs.org/) (phiên bản 18.x trở lên)
- [npm](https://www.npmjs.com/) hoặc [yarn](https://yarnpkg.com/)

### Hướng dẫn

1.  **Clone repository về máy của bạn:**

    ```bash
    git clone https://github.com/dexter826/cinemob.git
    cd cinemob
    ```

2.  **Cài đặt các dependencies:**

    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường:**

    Tạo một file `.env` ở thư mục gốc của dự án và sao chép nội dung từ file `.env.example` (nếu có) hoặc điền các thông tin sau:

    ```env
    # Cấu hình Firebase
    VITE_FIREBASE_API_KEY=YOUR_API_KEY
    VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
    VITE_FIREBASE_APP_ID=YOUR_APP_ID

    # API từ các dịch vụ khác
    VITE_TMDB_API_KEY=YOUR_TMDB_API_KEY
    VITE_OPENROUTER_API_KEY=YOUR_OPENROUTER_API_KEY
    ```

    > **Lưu ý:** Bạn cần có tài khoản [Firebase](https://firebase.google.com/), [TMDB](https://www.themoviedb.org/signup) và [OpenRouter](https://openrouter.ai/keys) để lấy các API key cần thiết.

4.  **Khởi chạy dự án:**
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập `http://localhost:3000` để xem ứng dụng.

## 📂 Cấu trúc thư mục

Dự án được tổ chức theo cấu trúc module hóa, giúp dễ dàng bảo trì và mở rộng:

```
/
├── .github/                  # Cấu hình GitHub Actions
├── docs/                     # Tài liệu và hình ảnh dự án
├── public/                   # Chứa các file tĩnh (icon, manifest, animations, data)
├── src/                      # Thư mục mã nguồn chính
│   ├── assets/               # Tài nguyên như hình ảnh, icon, âm thanh
│   ├── components/           # Các React component có thể tái sử dụng
│   │   ├── auth/             # Component liên quan đến xác thực
│   │   ├── layout/           # Bố cục chính (Navbar, Footer)
│   │   ├── modals/           # Các component hiển thị dưới dạng modal
│   │   ├── pages/            # Các trang chính của ứng dụng
│   │   ├── providers/        # Các React Context Provider
│   │   └── ui/               # Các component giao diện người dùng cơ bản
│   ├── hooks/                # Custom React hooks
│   ├── services/             # Xử lý logic gọi API
│   ├── stores/               # Quản lý state bằng Zustand
│   ├── types/                # Định nghĩa các kiểu dữ liệu TypeScript
│   ├── utils/                # Các hàm tiện ích
│   ├── App.tsx               # Component gốc, quản lý routing
│   ├── constants.ts          # Lưu trữ các hằng số
│   ├── firebase.ts           # Khởi tạo và cấu hình Firebase
│   ├── index.css             # CSS toàn cục
│   ├── index.tsx             # Điểm vào của ứng dụng
│   ├── sw.ts                 # Service Worker
│   ├── types.ts              # Định nghĩa các kiểu dữ liệu TypeScript
│   └── vite-env.d.ts         # Kiểu dữ liệu cho Vite
├── .env.example              # File mẫu cho biến môi trường
├── firebase.json             # Cấu hình cho Firebase Hosting
├── firestore.indexes.json    # Cấu hình Firestore indexes
├── firestore.rules           # Quy tắc bảo mật Firestore
├── index.html                # File HTML chính
├── package.json              # Quản lý dependencies và scripts
├── postcss.config.js         # Cấu hình PostCSS
├── tailwind.config.js        # Cấu hình Tailwind CSS
├── tsconfig.json             # Cấu hình TypeScript
└── vite.config.ts            # Cấu hình cho Vite
```

---

<div align="center">Made with ❤️ by <a href="https://github.com/dexter826">MOB</a></div>
