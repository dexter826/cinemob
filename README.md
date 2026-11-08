<div align="center">
  <img src="docs/images/cinemob-logo.png" alt="CineMOB Logo" width="320" />
  <p>Ứng dụng web quản lý danh mục phim ảnh và TV series cá nhân.</p>

  <p>
    <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React 19" />
    <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite" alt="Vite 6" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css" alt="Tailwind CSS v4" />
    <img src="https://img.shields.io/badge/Firebase-v12-FFCA28?logo=firebase" alt="Firebase" />
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
- [Sử dụng](#sử-dụng)
  - [Khởi chạy phát triển](#khởi-chạy-phát-triển)
  - [Danh sách lệnh](#danh-sách-lệnh)
  - [Quy trình kiểm tra chất lượng](#quy-trình-kiểm-tra-chất-lượng)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Nguồn dữ liệu & Giấy phép](#nguồn-dữ-liệu--giấy-phép)

---

## Giới thiệu

**CineMOB** là ứng dụng web quản lý danh mục phim ảnh và TV series, xây dựng trên nền tảng React 19 và TypeScript. Ứng dụng cung cấp các công cụ theo dõi tiến độ xem phim, tra cứu lịch phát sóng, thống kê số liệu cá nhân và hỗ trợ cài đặt trên thiết bị qua chuẩn PWA.

<div align="center">
  <img src="docs/images/mockup.png" alt="CineMOB Interface Mockup" width="800" />
</div>

### Tính năng chính

- **Tra cứu thông tin:** Tìm kiếm dữ liệu phim lẻ, TV series, diễn viên, đạo diễn và trailer từ TMDB.
- **Quản lý danh sách xem:** Phân loại phim theo trạng thái theo dõi, ghi nhận tiến độ xem theo từng mùa/tập và tổ chức bộ sưu tập theo album.
- **Lịch phát sóng & Thông báo:** Theo dõi lịch chiếu tập mới theo mốc thời gian và hỗ trợ nhận thông báo đẩy qua Web Push.
- **Gợi ý phim:** Đề xuất phim dựa trên thể loại quan tâm và hỗ trợ công cụ chọn phim ngẫu nhiên.
- **Thống kê dữ liệu:** Trực quan hóa thói quen xem phim qua thời lượng, thể loại và quốc gia bằng biểu đồ tương tác.
- **Hỗ trợ PWA:** Cài đặt trực tiếp trên thiết bị di động và máy tính, tối ưu hóa bộ nhớ đệm khi sử dụng ngoại tuyến.

### Công nghệ sử dụng

- **Giao diện:** React 19, TypeScript, Tailwind CSS v4, Framer Motion, Zustand.
- **Nguồn dữ liệu:** [TMDB API](https://www.themoviedb.org/documentation/api).
- **Hạ tầng & Xác thực:** Firebase Authentication (Google OAuth) và Cloud Firestore (đồng bộ dữ liệu thời gian thực).
- **Lưu trữ ảnh:** Cloudinary (upload ảnh hồ sơ).
- **Biểu đồ:** [Recharts](https://recharts.org/).

---

## Cài đặt

### Yêu cầu hệ thống

- **Node.js**: Phiên bản `18.x` trở lên (khuyến nghị bản LTS `20.x`).
- **Trình quản lý gói**: `npm` (đi kèm sẵn `package-lock.json`).

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

   Cập nhật các giá trị tương ứng trong `.env`:
   - `VITE_TMDB_API_KEY`: API Key từ The Movie Database.
   - `VITE_FIREBASE_*`: Thông số cấu hình từ Firebase Console.
   - `VITE_CLOUDINARY_*`: Cấu hình Cloudinary dùng cho upload ảnh đại diện.
   - `VITE_VAPID_PUBLIC_KEY`: Khóa công khai Web Push (tùy chọn).

---

## Sử dụng

### Khởi chạy phát triển

```bash
npm run dev
```

Ứng dụng chạy tại: `http://localhost:3000`.

### Danh sách lệnh

| Lệnh                   | Mô tả                                                                  |
| :--------------------- | :--------------------------------------------------------------------- |
| `npm run dev`          | Khởi chạy Vite dev server tại cổng `3000`.                             |
| `npm run build`        | Đóng gói mã nguồn production vào thư mục `dist/`.                      |
| `npm run preview`      | Khởi chạy máy chủ nội bộ để kiểm tra bản build production tại `dist/`. |
| `npm run typecheck`    | Kiểm tra kiểu dữ liệu TypeScript không xuất tệp.                       |
| `npm run lint`         | Chạy ESLint kiểm tra mã nguồn trong `src/`.                            |
| `npm test`             | Chạy bộ kiểm thử cho script gửi thông báo.                             |
| `npm run format`       | Tự động định dạng lại toàn bộ mã nguồn bằng Prettier.                  |
| `npm run format:check` | Kiểm tra định dạng mã nguồn bằng Prettier.                             |

### Quy trình kiểm tra chất lượng

Trước khi mở Pull Request hoặc bàn giao thay đổi, mã nguồn cần vượt qua toàn bộ 5 bước kiểm tra:

```bash
npm run typecheck
npm run lint
npm test
npm run format:check
npm run build
```

---

## Cấu trúc dự án

```text
├── .github/              # Quy trình GitHub Actions (CI, deploy và thông báo tập mới)
├── docs/                 # Tài liệu dự án và hình ảnh minh họa
├── public/               # Tài nguyên tĩnh phục vụ trực tiếp (manifest, icon, lottie)
├── src/                  # Toàn bộ mã nguồn ứng dụng
│   ├── app/              # Providers dùng chung (Auth, Theme)
│   ├── assets/           # Tài nguyên nội bộ
│   ├── constants/        # Hằng số hệ thống, thể loại và danh sách route
│   ├── features/         # Các module tính năng (auth, movies, albums, calendar, profile...)
│   ├── lib/              # Khởi tạo SDK bên ngoài (Firebase...)
│   ├── shared/           # UI kit, hooks, stores và utilities dùng chung
│   └── types/            # Khai báo kiểu TypeScript toàn dự án
├── .env.example          # Danh sách biến môi trường mẫu
├── AGENTS.md             # Quy ước hành vi và chất lượng kỹ thuật
├── COPY.md               # Quy chuẩn văn bản, thuật ngữ và microcopy tiếng Việt
├── DESIGN.md             # Quy chuẩn hệ thống thiết kế giao diện
├── firebase.json         # Cấu hình Firebase Hosting & Firestore
├── firestore.rules       # Quy tắc phân quyền và bảo mật Firestore
├── package.json          # Khai báo dependencies và script
├── tsconfig.json         # Cấu hình biên dịch TypeScript
└── vite.config.ts        # Cấu hình Vite, React, Tailwind CSS v4 và PWA
```

---

## Nguồn dữ liệu & Giấy phép

- Dữ liệu phim và hình ảnh do [The Movie Database (TMDB)](https://www.themoviedb.org/) cung cấp.
- Mã nguồn phát hành theo [Giấy phép MIT](LICENSE).
