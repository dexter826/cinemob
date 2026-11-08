# 04: Trang Tài khoản & bảo mật + kết nối Google

**What to build:** Người dùng mở trang Tài khoản & bảo mật từ menu tài khoản, xem email và các phương thức đã liên kết, kết nối Google vào tài khoản email/mật khẩu hiện có.

**Blocked by:** 01 — Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**Status:** ready-for-agent

**Progress:** implemented-awaiting-review
**Verification:** static checks pass; chưa review, chưa QA tay.
**Checkbox:** ghi nhận đã triển khai, không khẳng định hành vi đã được QA trên Firebase.

- [x] Route `/settings/account` mở được từ menu tài khoản trên navbar.
- [x] Trang hiển thị email tài khoản và danh sách phương thức đã liên kết (Google, email/mật khẩu).
- [x] Tài khoản email/mật khẩu có nút "Kết nối Google"; sau khi kết nối, đăng nhập được bằng cả hai.
- [x] Nếu email Google khác email tài khoản, từ chối trước khi liên kết và báo lỗi rõ ràng.
- [x] Popup bị đóng/bị chặn, lỗi mạng, requires-recent-login có thông điệp phù hợp; reauth hoạt động.
- [x] Google-only user thấy trạng thái chưa có mật khẩu.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Comments

- Chọn Google qua phiên Auth tạm trong bộ nhớ, kiểm tra email trước khi liên kết để không cần rollback phương thức sai email. Reauth bằng mật khẩu/Google rồi tiếp tục thao tác khi Firebase yêu cầu.
