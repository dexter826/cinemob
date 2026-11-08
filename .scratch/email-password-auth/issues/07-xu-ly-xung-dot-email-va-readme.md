# 07: Xử lý xung đột email

**What to build:** Người dùng có tài khoản email/mật khẩu bấm Google với cùng email được hướng dẫn đăng nhập bằng mật khẩu rồi liên kết Google; không tự động gộp tài khoản.

**Blocked by:** 02 — Tự đăng ký tài khoản email; 04 — Trang Tài khoản & bảo mật + kết nối Google

**Status:** ready-for-agent

- [x] Khi gặp `account-exists-with-different-credential`, app giữ pending credential và hướng dẫn đăng nhập bằng phương thức đã tồn tại.
- [x] Sau khi đăng nhập bằng phương thức cũ, app liên kết phương thức mới và thông báo thành công.
- [x] Nếu tài khoản cũ chưa xác minh, yêu cầu xác minh trước; sau đó liên kết trong trang Tài khoản & bảo mật.
- [x] Không tự động gộp tài khoản chỉ vì trùng email.
- [x] Google user thử email/mật khẩu nhận gợi ý dùng Google, không tiết lộ email tồn tại.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Comments
