# 01: Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**What to build:** Người dùng đã có tài khoản email/mật khẩu (tạo tay trên Firebase Console) đăng nhập được bằng email/mật khẩu. Tài khoản chưa xác minh bị chặn ở màn hình xác minh full-page; sau khi xác minh mới vào app. Firestore từ chối mọi write thuộc người dùng khi token chưa có `email_verified = true`. Người dùng Google hiện tại không thấy thay đổi.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Màn hình auth có chế độ đăng nhập email/mật khẩu; Google vẫn là nút phụ một chạm.
- [x] Đăng nhập đúng thông tin → vào app; sai thông tin → thông điệp tiếng Việt chung, không tiết lộ email tồn tại.
- [x] Tài khoản chưa xác minh → gate full-page; có gửi lại email, "Tôi đã xác minh", đăng xuất; tự kiểm tra khi quay lại tab.
- [x] Sau khi xác minh, token được refresh và người dùng vào app.
- [x] Dữ liệu app (movies, albums, member profile, member_lookup, users, push subscriptions) chỉ được khởi tạo/ghi sau khi verified.
- [x] Firestore rules từ chối create/update khi `email_verified` không phải true.
- [x] Giữ luồng đăng nhập Google và UID hiện tại.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.

## Comments

- Đã triển khai form đăng nhập email/mật khẩu, gate xác minh, gửi lại có cooldown, kiểm tra khi quay lại tab và force refresh token trước khi vào app.
- Khởi tạo thư viện/hồ sơ chỉ chạy khi email đã xác minh; Firestore rules yêu cầu email đã xác minh cho mọi thao tác ghi ở sáu collection thuộc người dùng. Quyền đọc giữ nguyên.
- Kiểm tra tĩnh đã pass; phần triển khai code hoàn thành.
