# 07: Xử lý xung đột email

**What to build:** Khi Firebase trả lỗi xung đột email, người dùng được hướng dẫn đăng nhập bằng phương thức cũ rồi liên kết Google. App không tự gộp dữ liệu tài khoản; giữ ngoại lệ liên kết Google chuẩn của Firebase đã được người dùng chấp nhận.

**Blocked by:** 02 — Tự đăng ký tài khoản email; 04 — Trang Tài khoản & bảo mật + kết nối Google

**Status:** ready-for-agent

- [x] Khi gặp `account-exists-with-different-credential`, app giữ pending credential và hướng dẫn đăng nhập bằng phương thức đã tồn tại.
- [x] Sau khi đăng nhập bằng phương thức cũ, app liên kết phương thức mới và thông báo thành công.
- [x] Nếu tài khoản cũ chưa xác minh, yêu cầu xác minh trước; sau đó liên kết trong trang Tài khoản & bảo mật.
- [x] App không tự gộp dữ liệu tài khoản; giữ hành vi Firebase chuẩn với email do Google quản lý theo quyết định người dùng sau review.
- [x] Google user thử email/mật khẩu nhận gợi ý dùng Google, không tiết lộ email tồn tại.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Comments

- Người dùng đã chấp nhận ngoại lệ Google chuẩn Firebase sau review; không thêm backend để ngăn tự liên kết ở cấp Firebase.
