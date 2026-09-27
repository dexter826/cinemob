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

- Scope: Mức 2 rút gọn — avatar + tên + email, không Card stats (user đổi ý sau khi chọn Mức 2, yêu cầu bỏ Card stats).
- Kiểu hiển thị: Trang riêng `/profile` (đã chọn thay vì modal toàn màn hình hay chỉ mở rộng dropdown).
- Sửa tên: có đồng bộ lên link share công khai (đã chọn thay vì không đồng bộ hay stats đầy đủ).
- Hướng triển khai: A — nhẹ, dùng Auth sẵn (đã chọn thay vì thêm collection `users` hay modal-based).

## 4. Kiến trúc & dữ liệu

- Route mới `/profile` lazy-loaded trong `AnimatedRoutes` (`src/App.tsx:29-42`), yêu cầu login như các route cũ. Không chạm route public `/share/:uid`.
- Module mới `src/features/profile/`:
  - `pages/ProfilePage.tsx`: trang chính.
  - `services/profileService.ts`: `validateDisplayName(name)`, `updateDisplayName(user, name)` — pattern giống `avatarService.ts:7`.
  - `services/profileService.test.ts`: unit cho validate + sync share.
- `Navbar.tsx:131-179`: menu chỉ còn Hồ sơ + Xuất dữ liệu + Đăng xuất. Mục Đổi ảnh đại diện đã bỏ khỏi menu (đổi avatar chỉ trong `/profile` qua nút camera trên avatar). `ChangeAvatarModal` chỉ mount trong `ProfilePage`, `ExportModal` chỉ mount trong `Navbar`.
- Không thêm collection Firestore, không đổi `firestore.rules`. Chỉ ghi đè `displayName` trong `public_shares/{uid}` nếu doc đã tồn tại (giống cách `avatarService.ts:12-20` làm với `photoURL`).
- Dữ liệu đọc trực tiếp: `useAuth()` cho `displayName/photoURL/email/metadata`, không thêm store mới.

## 5. Components & luồng

`ProfilePage` dùng container `max-w-7xl` như mọi trang, gồm hero identity + section Vừa xem gần đây (poster-led, đúng brand; không Card hành động — mỗi tính năng một nơi):

- Hero: avatar lớn (`w-24 sm:w-28`, ring `primary/20`) + nút camera overlay mở `ChangeAvatarModal`, tên cỡ display (`font-display`, `tracking-tight`) + nút sửa inline (pencil), meta hàng icon (email, ngày tham gia vi-VN, badge Google), glow `primary/10` góc hero. Không hiển thị UID.
  - Sửa tên inline: click pencil -> input, Enter/lưu, Esc hủy. Validate `2-50 ký tự` sau `trim`. Loading state + `showToast` thành công/thất bại. Giữ giá trị cũ khi lỗi.
- Section Vừa xem gần đây: 10 phim `status=history` mới nhất từ `useMovieStore` (sort `watched_at` desc), strip ngang `snap-x`, poster `aspect-2/3` bấm mở `MovieDetailModal` global qua `openDetailModal`, link Xem tất cả về `/`. Loading: skeleton; trống: `EmptyState` compact.
- Tái dùng `PageHeader`, `Button`, `Dialog`, `ToastContainer`/`AlertContainer` hiện tại. Responsive + dark/light theo design tokens, kiểm tra 320px.

Luồng chính:
1. User mở menu Navbar -> Hồ sơ -> `/profile`.
2. User sửa tên -> `validateDisplayName` -> `updateProfile({ displayName })` -> sync `public_shares` nếu có -> `refreshUser()` -> toast.
3. User bấm nút camera trên avatar -> mở `ChangeAvatarModal`, xong `refreshUser`, ProfilePage tự cập nhật qua `useAuth`.
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
