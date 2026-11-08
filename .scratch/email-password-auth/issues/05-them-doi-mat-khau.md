# 05: Thêm/đổi mật khẩu

**What to build:** Người dùng Google-only thêm mật khẩu; người dùng có mật khẩu đổi mật khẩu; cả hai đều xác thực lại khi Firebase yêu cầu.

**Blocked by:** 04 — Trang Tài khoản & bảo mật + kết nối Google

**Status:** ready-for-agent

- [ ] Google-only user thêm mật khẩu thành công và đăng nhập được bằng email/mật khẩu.
- [ ] User có mật khẩu đổi được mật khẩu bằng cách nhập mật khẩu hiện tại.
- [ ] Mật khẩu mới validate như đăng ký; nhập lại phải khớp.
- [ ] Sai mật khẩu hiện tại → lỗi rõ ràng, không đổi mật khẩu.
- [ ] `requires-recent-login` được xử lý bằng reauth.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass.
