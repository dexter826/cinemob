# 01: Đăng nhập email/mật khẩu + gate xác minh + chặn dữ liệu

**What to build:** Người dùng đã có tài khoản email/mật khẩu (tạo tay trên Firebase Console) đăng nhập được bằng email/mật khẩu. Tài khoản chưa xác minh bị chặn ở màn hình xác minh full-page; sau khi xác minh mới vào app. Firestore từ chối mọi write thuộc người dùng khi token chưa có `email_verified = true`. Người dùng Google hiện tại không thấy thay đổi.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Màn hình auth có chế độ đăng nhập email/mật khẩu; Google vẫn là nút phụ một chạm.
- [ ] Đăng nhập đúng thông tin → vào app; sai thông tin → thông điệp tiếng Việt chung, không tiết lộ email tồn tại.
- [ ] Tài khoản chưa xác minh → gate full-page; có gửi lại email, "Tôi đã xác minh", đăng xuất; tự kiểm tra khi quay lại tab.
- [ ] Sau khi xác minh, token được refresh và người dùng vào app.
- [ ] Dữ liệu app (movies, albums, member profile, member_lookup, users, push subscriptions) chỉ được khởi tạo/ghi sau khi verified.
- [ ] Firestore rules từ chối create/update khi `email_verified` không phải true.
- [ ] Google users hiện tại vẫn đăng nhập và dùng app bình thường.
- [ ] `npm run typecheck`, `npm run lint`, `npm run build` pass.
