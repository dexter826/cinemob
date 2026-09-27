# Thiết kế: Hồ sơ người dùng (/profile)

Ngày: 2026-09-27
Trạng thái: Đã duyệt thiết kế, chờ implementation plan

## 1. Mục tiêu

Hiện tại phân hệ hồ sơ chỉ có đổi avatar trong menu Navbar (`src/shared/components/layout/Navbar.tsx:138-146` + `src/features/auth/components/ChangeAvatarModal.tsx:21`). Mục tiêu là có trang Hồ sơ riêng để xem/sửa thông tin cơ bản, tái dùng luồng avatar hiện tại, và gom các hành động tài khoản (xuất dữ liệu, đăng xuất) vào một chỗ.

Không thuộc phạm vi: Card thống kê, quản lý public share link, xóa tài khoản, sửa email, bio/ngày sinh/các trường users collection mở rộng (đã đề xuất và hủy), thêm collection Firestore mới.

## 2. Bối cảnh hiện tại

- Auth Google-only qua Firebase Auth trong `src/app/providers/AuthProvider.tsx:16`, type `src/types/auth.ts:3`: `user.displayName`, `user.photoURL`, `user.email`, `user.metadata.creationTime`.
- Avatar đã có service riêng `src/features/auth/services/avatarService.ts:7` (`updateUserAvatar`, `revertToGoogleAvatar`) + test `avatarService.test.ts`, đồng bộ `photoURL` lên `public_shares/{uid}`.
- Navbar dropdown `src/shared/components/layout/Navbar.tsx:131-179`: hiển thị `displayName`, các mục Đổi ảnh đại diện / Xuất dữ liệu / Đăng xuất.
- Share sync `src/features/share/hooks/useShare.ts:45` và `src/shared/hooks/useAppInit.ts:136` dùng `displayName || 'CineMOB User'` và `photoURL || ''`.
- Routing yêu cầu login trong `src/App.tsx:44-68`, các trang lazy trong `AnimatedRoutes` (`src/App.tsx:29-42`).

## 3. Quyết định đã chốt với user

- Scope: xem/sửa avatar + tên, xem email + ngày tham gia + badge Google. Không stats, không Card hành động, không fields mở rộng.
- Kiểu hiển thị: `ProfileModal` mở từ menu Hồ sơ trong Navbar (đã đổi từ trang `/profile` sang modal vì nội dung hiện tại quá ít cho 1 trang; route `/profile` và `ProfilePage` đã xóa).
- Sửa tên: có đồng bộ lên link share công khai.
- Hướng triển khai: service thuần `profileService` dùng Auth sẵn, không collection mới.

## 4. Kiến trúc & dữ liệu

- Route mới `/profile` lazy-loaded trong `AnimatedRoutes` (`src/App.tsx:29-42`), yêu cầu login như các route cũ. Không chạm route public `/share/:uid`.
- Module `src/features/profile/`:
  - `components/ProfileModal.tsx`: modal hồ sơ (`isOpen`, `onClose`, `onChangeAvatar`).
  - `services/profileService.ts`: `validateDisplayName(name)`, `updateDisplayName(user, name)` — pattern giống `avatarService.ts:7`.
  - `services/profileService.test.ts`: unit cho validate + sync share.
- `Navbar.tsx:131-179`: menu Hồ sơ + Xuất dữ liệu + Đăng xuất. Mục Hồ sơ mở `ProfileModal`; nút camera trong modal đóng modal hồ sơ rồi mở `ChangeAvatarModal` cũ, đóng avatar modal thì mở lại modal hồ sơ. Không còn route `/profile`.
- Không thêm collection Firestore, không đổi `firestore.rules`. Chỉ ghi đè `displayName` trong `public_shares/{uid}` nếu doc đã tồn tại (giống cách `avatarService.ts:12-20` làm với `photoURL`).
- Dữ liệu đọc trực tiếp: `useAuth()` cho `displayName/photoURL/email/metadata`, không thêm store mới.

## 5. Components & luồng

`ProfileModal` (`sm:max-w-sm`, theo mẫu `ChangeAvatarModal`): avatar + nút camera overlay, tên + sửa inline, email, badge Google + ngày tham gia, không nút hành động nào khác:

- Avatar: `w-20`, ring `primary/20`; nút camera mở `ChangeAvatarModal` (đóng modal hồ sơ trước, đóng avatar xong mở lại).
- Tên: `font-display`, sửa inline pencil, Enter/lưu, Esc hủy. Validate `2-50 ký tự` sau `trim`. Loading + `showToast`, giữ giá trị cũ khi lỗi. Không hiển thị UID.
- Tái dùng `PageHeader`, `Button`, `Dialog`, `ToastContainer`/`AlertContainer` hiện tại. Responsive + dark/light theo design tokens, kiểm tra 320px.

Luồng chính:
1. User mở menu Navbar -> Hồ sơ -> `ProfileModal`.
2. User sửa tên -> `validateDisplayName` -> `updateProfile({ displayName })` -> sync `public_shares` nếu có -> `refreshUser()` -> toast.
3. User bấm nút camera -> đóng modal hồ sơ, mở `ChangeAvatarModal`; xong/đóng avatar -> mở lại modal hồ sơ.
4. Xuất dữ liệu và Đăng xuất chỉ dùng từ menu Navbar như cũ.

## 6. Edge cases & bảo mật

- Tên trống / <2 / >50 ký tự: chặn inline, hiện lỗi dưới input, không gọi Firebase.
- Tên chỉ khoảng trắng: `trim` rồi validate, từ chối.
- Lỗi mạng khi `updateProfile`: `showToast` lỗi, giữ tên cũ, không sync share.
- Sync `public_shares` fail: chỉ `console.error` như `avatarService.ts:19`, không block UX chính.
- `displayName` null (user Google thiếu tên): fallback `'CineMOB User'` khi hiển thị và khi sync, giống `useShare.ts:45`.
- Email readonly, không cho sửa vì Google provider. Không hiển thị UID để tránh lộ định danh kỹ thuật.
- Không lưu thêm PII nào lên Firestore ngoài `displayName` đã public sẵn.

## 7. Kiểm thử

- `npx tsc --noEmit` và `npm run build` phải pass.
- Unit `profileService.test.ts`: validate biên (rỗng, 1 ký tự, 2, 50, 51, khoảng trắng), `updateProfile` được gọi với tên đã trim, sync `public_shares` khi doc tồn tại, bỏ qua khi doc không tồn tại, không throw khi sync fail.
- Manual: mở `/profile` khi chưa login -> về `Login`; sửa tên thành công -> Navbar + SharePage cập nhật sau refresh; sửa tên lỗi -> ở lại trang + toast; đổi avatar từ Profile vẫn chạy như từ Navbar; responsive + dark/light; xuất/đăng xuất từ Profile chạy như từ Navbar.
- Không cần Firestore emulator (không đổi rules), không cần DOM runner (giữ manual cho UI theo AGENTS.md).

## 8. Self-review

- Không còn TBD/TODO. Phạm vi gói trong 1 plan: 1 route + 1 page + 1 service + Navbar entry.
- Kiến trúc khớp feature: không collection mới, tái dùng avatar/export/logout flow.
- Không mâu thuẫn: bỏ Card stats đã cập nhật cả mục 1, 3 và 5; sync share chỉ `displayName`, không đụng `photoURL`.
- Không diễn giải 2 nghĩa: validate `2-50 sau trim` đã nêu rõ; UID đã bỏ hẳn.
