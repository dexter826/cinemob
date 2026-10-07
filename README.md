<div align="center">
  <img src="docs/images/logo_text.png" alt="CineMOB Logo" width="280" />
  <p>PWA theo dõi và quản lý danh mục phim ảnh, TV show cá nhân.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase" alt="Firebase" />
  </p>
</div>

---

## Tổng quan

**CineMOB** là ứng dụng web client-side (CSR) dạng PWA xây dựng bằng React 19 và TypeScript, hỗ trợ theo dõi danh mục phim ảnh, quản lý lịch chiếu và phân tích lịch sử xem phim, với giao diện thích ứng cho thiết bị di động.

<div align="center">
  <img src="docs/images/mockup.jpg" alt="CineMOB Interface Mockup" width="800" />
</div>

### Tính năng nổi bật

- **Khám phá & Tra cứu:** Tìm kiếm phim, TV show, diễn viên, xem trailer và đánh giá chi tiết từ TMDB.
- **Quản lý danh sách xem:** Phân loại theo trạng thái (Đang xem, Đã xem, Muốn xem) và tạo album theo chủ đề riêng.
- **Lịch phát sóng:** Theo dõi lịch chiếu tập mới theo tuần/tháng để không bỏ lỡ các series yêu thích.
- **Gợi ý phim:** Đề xuất phim phù hợp với ngữ cảnh và sở thích người dùng.
- **Thống kê:** Trực quan hóa lịch sử xem phim qua biểu đồ (Recharts).
- **Hỗ trợ PWA:** Có thể cài đặt như ứng dụng trên thiết bị di động và máy tính.

### Dịch vụ sử dụng

- **TMDB:** Cung cấp dữ liệu phim, TV show, diễn viên và lịch chiếu. Xem [TMDB API](https://www.themoviedb.org/documentation/api).
- **Firebase:** Hỗ trợ đăng nhập và lưu trữ dữ liệu cá nhân.
- **Dịch vụ gợi ý phim:** Đề xuất phim dựa trên lịch sử xem và sở thích người dùng.
- **Thông báo:** Nhận thông báo khi có tập mới.
- **Recharts:** Hiển thị thống kê dưới dạng biểu đồ. Xem [Recharts](https://recharts.org/).

### Kiến trúc ứng dụng

```mermaid
graph TD
    Client["Trình duyệt / PWA Client<br/>(React 19, TypeScript, Zustand)"]

    subgraph External_Services["Dịch vụ bên ngoài"]
        TMDB["TMDB API<br/>(Thông tin phim, TV Show, Diễn viên)"]
        AIProxy["CineProxy<br/>(Cloudflare Worker)"]
        OpenRouter["OpenRouter API<br/>(Gợi ý phim qua AI)"]
    end

    subgraph Firebase_Services["Firebase BaaS"]
        Auth["Firebase Auth<br/>(Google Authentication)"]
        Firestore["Cloud Firestore<br/>(Lưu trữ dữ liệu người dùng)"]
    end

    Client <-->|Truy vấn dữ liệu phim| TMDB
    Client <-->|Gửi ngữ cảnh, nhận gợi ý phim| AIProxy
    AIProxy <-->|Gọi AI với key server-side| OpenRouter
    Client <-->|Xác thực phiên đăng nhập| Auth
    Client <-->|Đồng bộ dữ liệu thời gian thực| Firestore
```

---

## Yêu cầu môi trường

- **Node.js**: Phiên bản `18.x` trở lên (khuyến nghị bản LTS `20.x`).
- **Trình quản lý gói**: `npm` (đã có sẵn `package-lock.json`).

---

## Khởi chạy cục bộ

1. **Clone repository:**

   ```bash
   git clone https://github.com/dexter826/cinemob.git
   cd cinemob
   ```

2. **Cài đặt dependencies:**

   ```bash
   npm ci
   ```

3. **Cấu hình biến môi trường:**
   Tạo file `.env` tại thư mục gốc từ mẫu `.env.example`:

   ```bash
   cp .env.example .env
   ```

   Cập nhật các giá trị tương ứng trong file `.env`:
   - `VITE_TMDB_API_KEY`: API Key lấy từ The Movie Database.
   - `VITE_FIREBASE_*`: Thông số cấu hình từ Firebase Console.
   - `VITE_AI_PROXY_URL`: URL Cloudflare Worker cineproxy dùng cho gợi ý phim qua AI.
   - `VITE_VAPID_PUBLIC_KEY`: Public key tùy chọn cho Web Push; ứng dụng dùng fallback nếu để trống.
   - `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET`: Cấu hình Cloudinary dùng cho upload ảnh hồ sơ.

   > [!NOTE]
   > Các biến có tiền tố `VITE_` hoặc `REACT_APP_` sẽ được nhúng trực tiếp vào mã nguồn client-side trên trình duyệt. Không đưa các khóa bí mật mang quyền quản trị vào các biến này.

4. **Chạy server phát triển:**
   ```bash
   npm run dev
   ```
   Ứng dụng khởi chạy tại địa chỉ: `http://localhost:3000` (cấu hình trong [vite.config.ts](vite.config.ts)).

---

## Các lệnh chính

| Lệnh                   | Mô tả                                                             |
| :--------------------- | :---------------------------------------------------------------- |
| `npm run dev`          | Khởi chạy Vite development server tại cổng `3000`.                |
| `npm run build`        | Đóng gói mã nguồn cho môi trường production vào thư mục `dist/`.  |
| `npm run preview`      | Chạy máy chủ nội bộ để kiểm tra bản build production tại `dist/`. |
| `npm run typecheck`    | Kiểm tra kiểu dữ liệu TypeScript không xuất file.                 |
| `npm run lint`         | Chạy ESLint kiểm tra mã nguồn trong `src/`.                       |
| `npm test`             | Chạy test cho script gửi thông báo.                               |
| `npm run format:check` | Kiểm tra format bằng Prettier.                                    |

---

## Kiểm tra chất lượng mã nguồn

Dự án dùng ESLint để kiểm tra chuẩn mã nguồn. Trước khi mở Pull Request hoặc bàn giao thay đổi, hãy chạy bộ lệnh:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

Dùng `npm run preview` để kiểm tra bản build production trước khi tạo Pull Request.

---

## Cấu trúc repository

Cấu trúc các thư mục và tập tin chính trong dự án:

```text
├── .github/              # Workflow GitHub Actions (thông báo tập phim qua cron)
├── docs/                 # Tài liệu dự án và hình ảnh minh họa (logo, mockup)
├── public/               # Tài nguyên tĩnh phục vụ trực tiếp (manifest, icons, lottie data)
├── src/                  # Toàn bộ mã nguồn ứng dụng
│   ├── app/              # Providers dùng chung (Auth, Theme)
│   ├── assets/           # Tài nguyên hình ảnh, âm thanh nội bộ
│   ├── constants/        # Hằng số hệ thống và danh sách routes
│   ├── features/         # Các module tính năng (auth, movies, albums, calendar, ...)
│   ├── lib/              # Khởi tạo và cấu hình thư viện ngoài (Firebase, ...)
│   ├── shared/           # Components, hooks, pages, stores và utilities dùng chung
│   └── types/            # Khai báo interfaces và types TypeScript
├── .env.example          # Danh sách biến môi trường mẫu
├── DESIGN.md             # Đặc tả hệ thống thiết kế (Design System)
├── firebase.json         # Cấu hình triển khai Firebase Hosting & Firestore
├── firestore.rules       # Quy tắc phân quyền và bảo mật Firestore
├── package.json          # Khai báo dependencies và scripts
├── tsconfig.json         # Cấu hình biên dịch TypeScript
└── vite.config.ts        # Cấu hình máy chủ Vite, React, Tailwind và PWA
```

---

## Nguồn dữ liệu

Dự án sử dụng dữ liệu từ [The Movie Database (TMDB)](https://www.themoviedb.org/).

---

## Giấy phép

Dự án được phân phối theo giấy phép [MIT](LICENSE).
