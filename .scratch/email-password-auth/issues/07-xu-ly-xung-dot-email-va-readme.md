# 07: Xử lý xung đột email + README

**What to build:** Người dùng có tài khoản email/mật khẩu bấm Google với cùng email được hướng dẫn đăng nhập bằng mật khẩu rồi liên kết Google; không tự động gộp tài khoản. README cập nhật mô tả auth.

**Blocked by:** 02 — Tự đăng ký tài khoản email; 04 — Trang Tài khoản & bảo mật + kết nối Google

**Status:** ready-for-agent

- [ ] Khi gặp `account-exists-with-different-credential`, app giữ pending credential và hướng dẫn đăng nhập bằng phương thức đã tồn tại.
- [ ] Sau khi đăng nhập bằng phương thức cũ, app liên kết phương thức mới và thông báo thành công.
- [ ] Nếu tài khoản cũ chưa xác minh, yêu cầu xác minh trước; sau đó liên kết trong trang Tài khoản & bảo mật.
- [ ] Không tự động gộp tài khoản chỉ vì trùng email.
- [ ] Google user thử email/mật khẩu nhận gợi ý dùng Google, không tiết lộ email tồn tại.
- [ ] README mô tả đúng Google + email/mật khẩu.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass.
