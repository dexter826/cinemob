# Gộp tính năng đổi avatar vào hồ sơ — Design

Ngày: 2026-09-27

## Vấn đề

Hiện tại việc đổi ảnh đại diện nằm ở `ChangeAvatarModal`, tách khỏi `ProfileModal`, và hai modal được **toggle** qua state ở `Navbar`:

```
Menu tài khoản → "Hồ sơ" → ProfileModal
  → bấm nút camera → ĐÓNG ProfileModal → MỞ ChangeAvatarModal
  → đóng ChangeAvatarModal → MỞ LẠI ProfileModal
```

Hai điểm thừa:

1. `AvatarPickView` (vòng tròn 144px + nút camera + overlay "Thay đổi ảnh") lặp lại y hệt phần avatar 80px + nút camera đã có trong `ProfileModal`.
2. Người dùng bị đóng hồ sơ rồi bị quay lại, cảm giác như điều hướng chứ không phải sửa ảnh.

Phần crop thì đáng giữ riêng về mặt không gian (cần khung lớn, kéo pan, thanh zoom), nhưng không cần một modal riêng — chỉ cần một **trạng thái** bên trong modal hồ sơ.

## Quyết định

Gộp toàn bộ luồng đổi avatar vào `ProfileModal` dưới dạng state nội bộ. Xoá `ChangeAvatarModal` và `AvatarPickView`.

## Kiến trúc

`ProfileModal` trở thành shell duy nhất với hai mode nội bộ.

### State

| Tên | Kiểu | Ý nghĩa |
|---|---|---|
| `mode` | `'view' \| 'crop'` | Mode hiển thị hiện tại của modal |
| `imageSrc` | `string \| null` | objectURL của ảnh đang chọn, `null` khi chưa chọn |

Luật bất biến: `imageSrc === null` → `mode` bị ép về `'view'`.

Các state còn lại (`zoom`, `pan`, `imageMeta`, `isUploading`, `isDeletingAvatar`, `errorMessage`) nằm trong hook, không ở `ProfileModal`.

Hằng số `CROP_SIZE = 220` thuộc hook, dùng cho cả `getCroppedImgBlob` và `AvatarCropView`.

`<input type="file" accept="image/png, image/jpeg, image/webp" hidden>` nằm trong `ProfileModal`, ref do hook sở hữu. Vòng tròn avatar và nút camera cùng gọi `fileInputRef.current?.click()`.

### Ranh giới module

| Unit | Trách nhiệm |
|---|---|
| `src/features/profile/hooks/useAvatarCrop.ts` (mới) | Toàn bộ state và logic avatar: validate file, probe kích thước, `getBaseScale`, `clampPan`, pointer pan, wheel zoom, `handleSave`, `handleDelete`, cleanup object URL. Không render gì. |
| `src/features/profile/components/ProfileModal.tsx` (sửa) | Shell `Dialog`, header, chọn render view theo `mode`, toast wiring, `refreshUser`. |
| `src/features/auth/components/avatar/AvatarCropView.tsx` (không đổi) | Presentational: viewport crop tròn, thanh zoom, `<img>` transform. |
| `src/features/auth/services/avatarService.ts` | `updateUserAvatar`, `revertToGoogleAvatar`, `getOriginalGoogleAvatar`. Xoá `removeUserAvatar` (code chết). |
| `src/features/auth/services/cloudinaryService.ts` | `getCroppedImgBlob`, `uploadToCloudinary`. Không đổi. |

`ProfileModal` import `AvatarCropView` từ `features/auth` là hợp lệ: không có quy tắc hạn chế import chéo feature trong `eslint.config.js`, và `auth` là chủ sở hữu dữ liệu user.

## Luồng người dùng

| Bước | Hành động | Kết quả |
|---|---|---|
| 1 | Menu tài khoản → "Hồ sơ" | `mode='view'` |
| 2 | Bấm nút camera, **hoặc** bấm vòng tròn avatar, **hoặc** kéo-thả file vào vòng tròn | mở file picker; nếu là drop thì validate rồi vào thẳng crop |
| 3 | Validate thành công | `imageSrc` set, `zoom=1`, `pan={0,0}`, `mode='crop'` |
| 4 | "Lưu ảnh" | upload → `refreshUser()` → toast → `reset()`, `mode='view'` |
| 4' | "Hủy" | `reset()` → `mode='view'` |
| 4'' | "← Chọn ảnh khác" | `reset()` → mở file picker ngay |
| 5 | Esc hoặc nút × | `reset()` → đóng modal |

Nút camera và vòng tròn gọi cùng một handler mở file picker. Không còn popover 2 item.

### Mode `view`

Giữ nguyên bố cục hiện có: avatar 80px + nút camera overlay, tên hiển thị (sửa inline qua bút bút chì), email, ngày tham gia.

Thêm một dòng link text nhỏ màu danger `Xóa ảnh đại diện` ngay dưới avatar. Chỉ hiện khi `canRevertToGoogle` — tức `getOriginalGoogleAvatar(user)` khác `user.photoURL`.

Bấm link → `showAlert` loại `danger` → `revertToGoogleAvatar(user)` → `refreshUser()` → toast. **Modal không đóng**, avatar đổi ngay tại chỗ.

### Mode `crop`

- Header: thêm nút `←` (`Chọn ảnh khác`, gọi `reset()` rồi mở file picker), tiêu đề đổi thành `Căn chỉnh ảnh đại diện`, mô tả `Kéo để căn góc, cuộn để phóng to.`
- `DialogBody`: `AvatarCropView` với `cropSize = 220` + khung lỗi.
- `DialogFooter`: `Hủy` (ghost) và `Lưu ảnh` (primary, loading khi đang upload).
- Tên, email, ngày tham gia ẩn.
- Kích thước modal `sm:max-w-sm` giữ nguyên ở cả hai mode — không nhảy layout.

Hành vi `Hủy` giống hệt modal hiện tại: bỏ ảnh đang chọn, không giữ trạng thái.

## Data flow

Không đổi so với hiện tại:

```
File
  → validate: file.type bắt đầu bằng 'image/' và size ≤ 10MB
  → URL.createObjectURL + Image() probe lấy naturalWidth/naturalHeight
  → AvatarCropView: pan qua Pointer Events (setPointerCapture), zoom qua wheel
  → getCroppedImgBlob(img, { pan, zoom, cropSize: 220, outputSize: 300, quality: 0.88 })
      canvas 300×300, baseScale = max(220/nw, 220/nh), toBlob('image/webp', 0.88)
  → uploadToCloudinary(blob, folder 'avatars') → secure_url
  → updateProfile(user, { photoURL }) + đồng bộ public_shares/{uid}
  → refreshUser()
  → toast
```

## Edge case

- **Rò rỉ object URL**: giữ cả hai effect hiện có — `reset()` khi `isOpen` chuyển `false`, và cleanup revoke khi unmount. Chuyển vào hook.
- **`imgRef.current` null** khi bấm Lưu ngay sau khi chọn file: guard `if (!user || !imgRef.current) return;`.
- **Khoá input**: `isUploading` và `isDeletingAvatar` khoá mọi control, kể cả nút đóng modal.
- **A11y vòng tròn avatar**: vì xoá `AvatarPickView`, phải chuyển `role="button"`, `tabIndex={0}`, `onKeyDown` Enter/Space sang vòng tròn trong `ProfileModal`. Nút camera giữ `aria-label="Đổi ảnh đại diện"`.
- **Drag & drop ở mode `view`** chỉ trên vòng tròn 80px — vùng drop nhỏ hơn 144px cũ. Chấp nhận: tiện ích phụ cho desktop, mobile không dùng được.
- **Lỗi**: một `errorMessage` dùng chung, hiển thị dưới crop view ở `mode='crop'` và dưới avatar ở `mode='view'`. Lỗi upload/sync kèm toast.

## Phạm vi thay đổi

| Hành động | File |
|---|---|
| Xoá | `src/features/auth/components/ChangeAvatarModal.tsx` |
| Xoá | `src/features/auth/components/avatar/AvatarPickView.tsx` |
| Thêm | `src/features/profile/hooks/useAvatarCrop.ts` |
| Sửa | `src/features/profile/components/ProfileModal.tsx` — hai mode, bỏ prop `onChangeAvatar`, thêm link xóa ảnh, thêm a11y vòng tròn |
| Sửa | `src/shared/components/layout/Navbar.tsx` — bỏ `isAvatarModalOpen`, bỏ import `ChangeAvatarModal`, bỏ render, gỡ `onChangeAvatar` khỏi call site `ProfileModal` |
| Sửa | `src/features/auth/services/avatarService.ts` — xoá `removeUserAvatar` |
| Không đổi | `AvatarCropView.tsx`, `cloudinaryService.ts`, `Dialog`, `Button`, `IconButton`, `AuthProvider` |

## Ngoài phạm vi

- File Cloudinary cũ không bị dọn sau khi đổi ảnh (hiện không lưu `public_id`). Ghi nhận, không xử lý ở lần này.
- Trang `/profile` riêng, tab settings, entry trong `MobileBottomNav` — không làm.

## Kiểm chứng

Tự động: `npm run typecheck`, `npm run lint`, `npm run build`.

Thủ công:
- Mở hồ sơ từ menu tài khoản.
- Mở file picker bằng nút camera.
- Mở file picker bằng cách bấm vòng tròn avatar.
- Kéo-thả file lên vòng tròn.
- Pan bằng chuột/cảm ứng, zoom bằng slider và con lăn, kiểm tra không lộ viền đen.
- `← Chọn ảnh khác` và `Hủy` đều quay về mode view.
- `Lưu ảnh`: avatar mới hiển thị ngay ở mode view, modal vẫn mở.
- `Xóa ảnh đại diện`: hiện confirm, sau khi xác nhận avatar về ảnh Google, modal không đóng.
- Esc giữa chừng lúc đang upload.
- Viewport mobile: modal full-width không bo góc, crop 220px vừa khung.
- Trang `/share/:uid` hiển thị avatar mới sau khi đồng bộ.
