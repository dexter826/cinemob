# 02: Tự đăng ký tài khoản email

**What to build:** Người dùng mới tự tạo tài khoản bằng email/mật khẩu với tên hiển thị, nhận email xác minh, xác minh rồi vào app.

**Blocked by:** 01 — Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**Status:** ready-for-agent

- [x] Form đăng ký có tên hiển thị (2–50 ký tự), email, mật khẩu, nhập lại mật khẩu.
- [x] Mật khẩu tối thiểu 8 ký tự, có ít nhất 1 chữ và 1 số; nhập lại phải khớp; có hiện/ẩn.
- [x] Tạo tài khoản thành công → cập nhật tên hiển thị, gửi email xác minh, chuyển đến gate.
- [x] Email đã tồn tại → thông điệp hướng dẫn đăng nhập/đặt lại mật khẩu.
- [x] Sau khi xác minh, hồ sơ thành viên dùng đúng tên hiển thị.
- [x] Chuyển qua lại giữa Đăng nhập và Tạo tài khoản không mất email đã nhập.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Comments

- Đã triển khai đăng ký, validation tên/mật khẩu/nhập lại, hiện/ẩn mật khẩu, gửi xác minh và giữ email khi chuyển chế độ.
