# 06: Gỡ liên kết phương thức

**What to build:** Người dùng có cả Google và mật khẩu gỡ được một phương thức; không gỡ được phương thức cuối cùng; có xác nhận và reauth.

**Blocked by:** 04 — Trang Tài khoản & bảo mật + kết nối Google; 05 — Thêm/đổi mật khẩu

**Status:** ready-for-agent

- [x] User có cả hai phương thức gỡ được Google hoặc mật khẩu, vẫn đăng nhập được bằng phương thức còn lại.
- [x] Nút gỡ bị chặn/ẩn khi chỉ còn một phương thức, kèm giải thích.
- [x] Có hộp thoại xác nhận nêu rõ hậu quả trước khi gỡ.
- [x] Reauth trước khi gỡ; lỗi được hiển thị tiếng Việt.
- [x] `npm run typecheck`, `npm run lint`, `npm run build` pass.
