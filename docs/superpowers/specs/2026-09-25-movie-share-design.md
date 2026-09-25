# Thiết kế: Chia sẻ danh sách phim đã coi qua link công khai

Ngày: 2026-09-25
Trạng thái: Đã duyệt thiết kế, chờ implementation plan

## 1. Mục tiêu

Cho phép user chia sẻ danh sách phim đã coi (history) qua 1 link công khai cố định dạng `/share/:uid`, người nhận mở được بدون đăng nhập, thấy poster + tên + rating.

Không thuộc phạm vi MVP: chia sẻ 1 phim lẻ, chia sẻ album, nhiều link, hết hạn link, password, thống kê chi tiết, review đầy đủ.

## 2. Bối cảnh hiện tại

- App React 19 + TS + Vite, route yêu cầu login qua `MainApp` trong `src/App.tsx:58`.
- Dashboard (`src/features/dashboard/pages/Dashboard.tsx:19`) hiển thị history/watchlist từ `useMovieStore` (`src/features/movies/stores/movieStore.ts:6`).
- Card: `src/features/movies/components/MovieCard.tsx:15`, chi tiết: `src/features/movies/components/MovieDetailModal.tsx:22`.
- Firestore rules hiện tại (`firestore.rules:32-36`): `movies` chỉ owner đọc được. Chưa có collection public nào.

## 3. Quyết định đã chốt với user

- Đối tượng: danh sách phim đã coi (status = history).
- Cách thức: link công khai.
- Nội dung: poster + tên + rating.
- Quản lý: 1 link cố định `/share/{uid}`, bật/tắt công khai.
- Hướng triển khai: Snapshot public (đã chọn thay vì URL-chứa-dữ-liệu hay copy-text).

## 4. Kiến trúc & dữ liệu

- Collection mới `public_shares/{uid}`:
  ```ts
  interface PublicShare {
    displayName: string;
    photoURL?: string;
    isEnabled: boolean;
    updatedAt: Timestamp;
    totalCount: number;
    movies: Array<{
      id: string | number;
      title: string;
      title_vi?: string;
      poster_path?: string;
      media_type?: 'movie' | 'tv';
      release_date?: string;
      rating?: number;
    }>;
  }
  ```
- Chỉ lưu trường hiển thị, sắp xếp mới nhất trước, giới hạn 500 phim để tránh vượt 1MB/doc.
- Rules mới:
  ```
  match /public_shares/{userId} {
    allow read: if resource.data.isEnabled == true;
    allow write: if isSignedIn() && isOwner(userId);
  }
  ```
- Route `/share/:uid` là public, tách khỏi `Login` guard. Các route cũ giữ nguyên.
- Nút Share trong `DashboardActions`: bật/tắt + copy link `${origin}/share/{uid}` + cập nhật snapshot.

## 5. Components & luồng

- `src/features/share/services/shareService.ts`: `getPublicShare(uid)`, `upsertPublicShare(uid, data)`, `setShareEnabled(uid, enabled)`.
- `src/features/share/hooks/useShare.ts`: quản lý loading/enabled/link cho Dashboard.
- `src/features/share/pages/SharePage.tsx` (lazy): lấy `uid` từ URL, fetch snapshot, hiển thị header (avatar + tên + tổng số phim + ngày cập nhật) + grid read-only. Tái dùng style MovieCard nhưng ẩn edit/delete. Click mở TMDB hoặc modal read-only đơn giản.
- `ShareButton` / mở rộng `DashboardActions`: clipboard copy với fallback + toast.
- Đồng bộ MVP dạng manual: bấm "Cập nhật link" mới ghi snapshot từ `movieStore` đã filter history. Không auto-sync realtime.

Luồng chính:
1. User bật chia sẻ -> ghi snapshot lần đầu -> hiện link.
2. User copy link -> gửi bạn bè.
3. Khách mở link ẩn danh -> `SharePage` đọc `public_shares/{uid}` -> render nếu `isEnabled`.
4. User thêm phim mới -> bấm cập nhật để refresh snapshot.
5. User tắt chia sẻ -> `isEnabled=false` -> link hiện trạng thái tắt.

## 6. Edge cases & bảo mật

- Tắt share hoặc doc không tồn tại: hiện "Link đã tắt / không tồn tại", không lộ dữ liệu.
- 0 phim: EmptyState.
- Sai uid / lỗi mạng: thông báo thân thiện + nút về trang chủ.
- Privacy: không lưu review chi tiết, email, docId private. Chỉ trường public ở mục 4.
- Không cho ghi từ client ẩn danh, chỉ owner ghi.

## 7. Kiểm thử

- `npx tsc --noEmit` và `npm run build` phải pass.
- Manual: bật link, copy, mở ở cửa sổ ẩn danh không login vẫn xem được; tắt link thì ẩn danh thấy trạng thái tắt; cập nhật sau khi thêm phim history.
- Kiểm tra responsive grid và dark/light mode.

## 8. Self-review

- Không còn TBD/TODO. Phạm vi gói trong 1 plan duy nhất, không ôm album/phim lẻ.
- Kiến trúc khớp mô tả feature. Không mâu thuẫn rule và route.
- Không diễn giải 2 nghĩa: link cố định theo uid, snapshot manual đã nêu rõ.
