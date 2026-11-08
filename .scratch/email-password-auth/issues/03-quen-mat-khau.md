# 03: Quên mật khẩu

**What to build:** Người dùng quên mật khẩu yêu cầu link đặt lại từ màn hình auth, nhận email, đặt mật khẩu mới và đăng nhập lại.

**Blocked by:** 01 — Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**Status:** ready-for-agent

- [ ] Có chế độ "Quên mật khẩu" trên màn hình auth.
- [ ] Gửi link đặt lại cho email hợp lệ; luôn hiển thị thông điệp chung "Nếu email tồn tại...".
- [ ] Email không tồn tại cũng hiển thị cùng thông điệp.
- [ ] Người dùng quay lại đăng nhập được sau khi đặt mật khẩu mới.
- [ ] Lỗi mạng/quá nhiều yêu cầu có thông điệp tiếng Việt.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass.
