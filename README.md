<div align="center">
  <img src="docs/images/cinemob-logo.png" alt="CineMOB Logo" width="320" />
  <p>Ứng dụng web quản lý danh mục và theo dõi tiến độ thưởng thức phim ảnh cá nhân.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase" alt="Firebase" />
    <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT License" />
  </p>
</div>

---

## Mục lục

- [Giới thiệu](#giới-thiệu)
  - [Tính năng chính](#tính-năng-chính)
  - [Công nghệ sử dụng](#công-nghệ-sử-dụng)
- [Cài đặt](#cài-đặt)
  - [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
  - [Các bước thiết lập](#các-bước-thiết-lập)
  - [Biến môi trường](#biến-môi-trường)
- [Sử dụng](#sử-dụng)
  - [Khởi chạy phát triển](#khởi-chạy-phát-triển)
  - [Danh sách lệnh](#danh-sách-lệnh)
  - [Quy trình kiểm tra chất lượng](#quy-trình-kiểm-tra-chất-lượng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Nguồn dữ liệu & Giấy phép](#nguồn-dữ-liệu--giấy-phép)

---

## Giới thiệu

**CineMOB** là ứng dụng web quản lý danh mục và theo dõi tiến độ xem phim cá nhân, xây dựng trên React 19, TypeScript và Tailwind CSS v4. Ứng dụng hỗ trợ ghi nhận tiến độ theo từng mùa và tập, tra cứu lịch phát sóng, thống kê thói quen xem và cài đặt sử dụng ngoại tuyến dưới dạng PWA.

<div align="center">
  <img src="docs/images/mockup.png" alt="CineMOB Interface Mockup" width="800" />
</div>

### Tính năng chính

- **Tra cứu dữ liệu:** Tìm kiếm Movie, Series, nghệ sĩ (diễn viên, đạo diễn) và trailer chính thức từ TMDB. Hỗ trợ thêm thủ công tác phẩm vào Thư viện khi không có trên TMDB.
- **Quản lý Thư viện:** Phân loại tác phẩm theo trạng thái (_Đã xem_, _Sẽ xem_, _Bỏ dở_, _Đang xem_), ghi nhận tiến độ xem chi tiết theo từng mùa, tập và tạo album theo chủ đề riêng.
- **Lịch phát sóng & Thông báo:** Cập nhật lịch công chiếu tập mới của các Series trong danh mục và gửi thông báo phát sóng tới thiết bị qua Web Push.
- **Gợi ý & Tiện ích:** Đề xuất tác phẩm theo thể loại yêu thích và tích hợp Vòng quay ngẫu nhiên hỗ trợ chọn phim khi phân vân.
- **Thống kê & Số liệu:** Trực quan hóa thời lượng thưởng thức, xu hướng xem theo tháng, phân bố thể loại và quốc gia bằng biểu đồ tương tác Recharts.
- **Hồ sơ thành viên:** Thiết lập hồ sơ công khai, chia sẻ liên kết cá nhân, xem phim chung giữa các thành viên và tùy chỉnh quyền riêng tư danh sách.
- **Ứng dụng PWA:** Cài đặt trực tiếp trên thiết bị di động và máy tính, hỗ trợ lưu đệm để hoạt động ngoại tuyến qua Service Worker.

### Công nghệ sử dụng

- **Giao diện & Điều hướng:** React 19, TypeScript, Vite 6, Tailwind CSS v4, React Router 7, Framer Motion, Zustand.
- **Nguồn dữ liệu:** [TMDB API](https://www.themoviedb.org/documentation/api).
- **Hạ tầng & Xác thực:** Firebase Authentication (Google OAuth và email/mật khẩu), Cloud Firestore (đồng bộ dữ liệu thời gian thực).
- **Lưu trữ ảnh:** Cloudinary (tải lên ảnh đại diện).
- **Âm thanh & Biểu đồ:** Howler.js, Recharts, Lucide Icons.

---

## Cài đặt

### Yêu cầu hệ thống

- **Node.js**: Phiên bản `20.x` trở lên (khuyến nghị bản LTS `20.x` hoặc `22.x/24.x`, đồng bộ với môi trường CI).
- **Trình quản lý gói**: `npm` (dự án dùng sẵn `package-lock.json`).

### Các bước thiết lập

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
   Tạo tệp `.env` tại thư mục gốc từ mẫu `.env.example`:

   ```bash
   cp .env.example .env
   ```

### Biến môi trường

Khai báo các biến môi trường trong tệp `.env`:

| Biến môi trường                     | Bắt buộc | Mặc định / Ví dụ                | Mô tả                                                              |
| :---------------------------------- | :------: | :------------------------------ | :----------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`                 |    Có    | `your_tmdb_api_key`             | API key từ TMDB dùng để tra cứu tác phẩm và nghệ sĩ.               |
| `VITE_FIREBASE_API_KEY`             |    Có    | `your_firebase_api_key`         | API key của ứng dụng Firebase.                                     |
| `VITE_FIREBASE_AUTH_DOMAIN`         |    Có    | `your_project.firebaseapp.com`  | Tên miền xác thực Firebase Authentication.                         |
| `VITE_FIREBASE_PROJECT_ID`          |    Có    | `your_project_id`               | Mã dự án (Project ID) trên Firebase Console.                       |
| `VITE_FIREBASE_STORAGE_BUCKET`      |    Có    | `your_project.appspot.com`      | Tên bucket lưu trữ của Firebase Storage.                           |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` |    Có    | `your_messaging_sender_id`      | Sender ID cho dịch vụ Firebase Cloud Messaging.                    |
| `VITE_FIREBASE_APP_ID`              |    Có    | `your_app_id`                   | Mã định danh ứng dụng Firebase Web App.                            |
| `VITE_CLOUDINARY_CLOUD_NAME`        |    Có    | `your_cloudinary_cloud_name`    | Tên tài khoản Cloudinary dùng để lưu trữ ảnh đại diện.             |
| `VITE_CLOUDINARY_UPLOAD_PRESET`     |    Có    | `your_cloudinary_upload_preset` | Preset tải lên (unsigned) trên Cloudinary.                         |
| `VITE_VAPID_PUBLIC_KEY`             |  Không   | `-`                             | Khóa công khai VAPID cho Web Push (có khóa dự phòng nếu để trống). |

---

## Sử dụng

### Khởi chạy phát triển

```bash
npm run dev
```

Máy chủ phát triển chạy tại: `http://localhost:3000` (mặc định mở cổng `3000` trên mọi giao diện mạng `0.0.0.0`).

### Danh sách lệnh

| Lệnh                   | Mô tả                                                                          |
| :--------------------- | :----------------------------------------------------------------------------- |
| `npm run dev`          | Khởi chạy Vite dev server tại cổng `3000`.                                     |
| `npm run build`        | Kiểm tra kiểu TypeScript và đóng gói bản build production vào thư mục `dist/`. |
| `npm run preview`      | Khởi chạy máy chủ cục bộ để xem trước bản build production tại `dist/`.        |
| `npm run typecheck`    | Kiểm tra kiểu dữ liệu TypeScript không xuất tệp (`tsc --noEmit`).              |
| `npm run lint`         | Chạy ESLint kiểm tra chất lượng mã nguồn trong `src/`.                         |
| `npm test`             | Chạy bộ kiểm thử tự động cho script gửi thông báo (`.github/scripts`).         |
| `npm run format`       | Tự động định dạng toàn bộ mã nguồn bằng Prettier.                              |
| `npm run format:check` | Kiểm tra định dạng mã nguồn bằng Prettier.                                     |

### Quy trình kiểm tra chất lượng

Trước khi tạo Pull Request hoặc triển khai bản phát hành, mã nguồn cần vượt qua toàn bộ các bước kiểm tra chất lượng đồng bộ với GitHub Actions CI:

```bash
npm run typecheck
npm run lint
npm run format:check
npm run build
npm test
```

> [!NOTE]
> Lệnh `npm test` chạy các bài kiểm thử trong `.github/scripts`. Khi chạy lần đầu trên môi trường mới, cài đặt dependencies tương ứng qua lệnh: `npm --prefix .github/scripts ci`.

---

## Cấu trúc dự án

```text
├── .github/              # Quy trình GitHub Actions (CI, deploy, cron thông báo tập mới) và test script
├── docs/                 # Tài liệu dự án, hình ảnh minh họa và biểu tượng logo SVG
├── public/               # Tài nguyên tĩnh phục vụ trực tiếp (manifest, icon, lottie, âm thanh)
├── src/                  # Toàn bộ mã nguồn ứng dụng
│   ├── app/              # Điểm khởi tạo ứng dụng và các Provider dùng chung (Auth, Theme)
│   ├── assets/           # Tài nguyên nội bộ (âm thanh giao diện)
│   ├── constants/        # Hằng số hệ thống, danh mục thể loại, quốc gia và thông báo
│   ├── features/         # Các module tính năng theo nghiệp vụ (auth, movies, albums, calendar, profile...)
│   ├── shared/           # Thư viện dùng chung (UI kit, hooks, stores, cấu hình, lib Firebase và tiện ích)
│   ├── types/            # Khai báo kiểu TypeScript toàn dự án
│   ├── sw.ts             # Service Worker xử lý lưu đệm và thông báo đẩy PWA
│   └── index.tsx         # Điểm nhập React (root render)
├── .env.example          # Danh sách biến môi trường mẫu
├── AGENTS.md             # Quy ước hành vi và chất lượng kỹ thuật
├── COPY.md               # Quy chuẩn văn bản, thuật ngữ và microcopy tiếng Việt
├── DESIGN.md             # Quy chuẩn hệ thống thiết kế giao diện
├── GLOSSARY.md           # Bảng thuật ngữ nghiệp vụ chuẩn của dự án
├── firebase.json         # Cấu hình Firebase Hosting và Firestore
├── firestore.rules       # Quy tắc phân quyền và bảo mật Firestore
├── package.json          # Khai báo dependencies và danh sách lệnh npm
├── tsconfig.json         # Cấu hình biên dịch TypeScript
└── vite.config.ts        # Cấu hình Vite, React, Tailwind CSS v4 và PWA
```

---

## Nguồn dữ liệu & Giấy phép

- Dữ liệu phim ảnh, thông tin nghệ sĩ và trailer do [The Movie Database (TMDB)](https://www.themoviedb.org/) cung cấp.
- Mã nguồn được phát hành theo [Giấy phép MIT](LICENSE).
