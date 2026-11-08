# 04: Trang Tài khoản & bảo mật + kết nối Google

**What to build:** Người dùng mở trang Tài khoản & bảo mật từ menu tài khoản, xem email và các phương thức đã liên kết, kết nối Google vào tài khoản email/mật khẩu hiện có.

**Blocked by:** 01 — Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**Status:** ready-for-agent

- [ ] Route `/settings/account` mở được từ menu tài khoản trên navbar.
- [ ] Trang hiển thị email tài khoản và danh sách phương thức đã liên kết (Google, email/mật khẩu).
- [ ] Tài khoản email/mật khẩu có nút "Kết nối Google"; sau khi kết nối, đăng nhập được bằng cả hai.
- [ ] Nếu email Google khác email tài khoản, hủy liên kết và báo lỗi rõ ràng.
- [ ] Popup bị đóng/bị chặn, lỗi mạng, requires-recent-login có thông điệp phù hợp; reauth hoạt động.
- [ ] Google-only user thấy trạng thái chưa có mật khẩu.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass.
