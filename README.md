<center>
  <img src="public/logo_text.png" alt="Logo dự án">
</center>

Chào mừng đến với **Cinemetrics**! Đây là một ứng dụng để theo dõi và quản lý danh sách phim đã xem, giúp bạn lưu giữ những khoảnh khắc điện ảnh đáng nhớ. 🍿✨

## 🚀 Giới thiệu

Cinemetrics cho phép bạn tìm kiếm phim từ cơ sở dữ liệu khổng lồ (TMDB), thêm vào danh sách cá nhân, đánh giá, viết review và xem thống kê chi tiết về thói quen xem phim của mình.

## ✨ Tính năng nổi bật

- **🔐 Đăng nhập/Đăng ký:** Bảo mật tài khoản với Firebase Authentication.
- **🔍 Tìm kiếm phim:** Tìm kiếm phim và TV shows nhanh chóng thông qua TMDB API.
- **📝 Quản lý danh sách:** Thêm phim đã xem, ghi chú ngày xem, đánh giá và review.
- **📊 Thống kê (Stats):** Biểu đồ trực quan về số lượng phim đã xem, thể loại yêu thích.
- **🌓 Giao diện Dark/Light:** Chế độ sáng tối linh hoạt.
- **📱 Responsive:** Giao diện đẹp mắt, tương thích tốt trên cả máy tính và điện thoại.

## 🛠️ Công nghệ sử dụng

- **Frontend:** [React](https://react.dev/) (v19), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4), [Lucide React](https://lucide.dev/) (Icons)
- **Backend & Database:** [Firebase](https://firebase.google.com/) (Firestore, Auth)
- **API:** [The Movie Database (TMDB)](https://www.themoviedb.org/)
- **Charts:** [Recharts](https://recharts.org/)
- **Animation:** [Lottie React](https://lottiereact.com/)

## ⚙️ Cài đặt và chạy dự án

1.  **Clone repository:**

    ```bash
    git clone https://github.com/dexter826/cinemetrics.git
    cd cinemetrics
    ```

2.  **Cài đặt dependencies:**

    ```bash
    npm install
    ```

3.  **Cấu hình môi trường:**
    Tạo file `.env` ở thư mục gốc và thêm các key cần thiết (Firebase config, TMDB API Key). Ví dụ:

    ```env
    VITE_FIREBASE_API_KEY=...
    VITE_FIREBASE_AUTH_DOMAIN=...
    VITE_FIREBASE_PROJECT_ID=...
    ...
    VITE_TMDB_API_KEY=...
    ```

    _(Lưu ý: Cần tự tạo project trên Firebase và đăng ký tài khoản TMDB để lấy key nhé)_

4.  **Chạy dự án:**
    ```bash
    npm run dev
    ```
    Mở trình duyệt và truy cập đường link hiển thị trong terminal.

## 📂 Cấu trúc thư mục

```
cinemetrics/
 public/              # File tĩnh (manifest, robots.txt,...)
 src/
    components/      # Các component React (Dashboard, Login, MovieCard,...)
    services/        # Xử lý API (Firebase, TMDB)
    App.tsx          # Component chính, routing
    firebase.ts      # Cấu hình Firebase
    types.ts         # Định nghĩa kiểu dữ liệu (TypeScript)
    ...
 index.html           # File HTML chính
 package.json         # Khai báo dependencies
 tailwind.config.js   # Cấu hình Tailwind
 vite.config.ts       # Cấu hình Vite
```

---

Made with ❤️ by [MOB](https://github.com/dexter826)
