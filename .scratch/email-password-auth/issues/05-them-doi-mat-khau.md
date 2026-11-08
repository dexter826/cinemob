# 05: Thêm/đổi mật khẩu

**What to build:** Người dùng Google-only thêm mật khẩu; người dùng có mật khẩu đổi mật khẩu; cả hai đều xác thực lại khi Firebase yêu cầu.

**Blocked by:** 04 — Trang Tài khoản & bảo mật + kết nối Google

**Status:** ready-for-agent

- [x] Google-only user thêm mật khẩu thành công và đăng nhập được bằng email/mật khẩu.
- [x] User có mật khẩu đổi được mật khẩu bằng cách nhập mật khẩu hiện tại.
- [x] Mật khẩu mới validate như đăng ký; nhập lại phải khớp.
- [x] Sai mật khẩu hiện tại → lỗi rõ ràng, không đổi mật khẩu.
- [x] `requires-recent-login` được xử lý bằng reauth.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.
