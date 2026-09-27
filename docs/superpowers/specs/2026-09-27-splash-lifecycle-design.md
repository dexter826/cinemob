# Splash Lifecycle Design

## Mục tiêu

Tách splash thương hiệu khỏi trạng thái tải dữ liệu để khi reload, CineMOB chỉ phát splash một lần rồi chuyển sang giao diện ứng dụng với loading cục bộ nếu dữ liệu chưa sẵn sàng.

## Bối cảnh hiện tại

`App` đang giữ `SplashScreen` sau khi Lottie kết thúc cho tới khi `useAppInit` đánh dấu movie store đã khởi tạo. Trong khoảng thời gian đó, cùng một splash hiển thị thêm spinner thông qua `showLoading`. `AuthProvider` cũng chỉ được mount sau khi animation kết thúc, nên splash đang đồng thời đóng vai trò brand screen, auth gate và bootstrap gate.

`SplashScreen` còn có thể coi lần `AbortController.abort()` do React StrictMode cleanup là lỗi tải asset, dẫn tới chuyển trạng thái splash không ổn định trong development.

## Thiết kế đã chốt

### 1. Splash chỉ quản lý thương hiệu

- Splash được mount khi policy cho phép.
- Animation hoặc static brand frame kết thúc thì gọi `onAnimationFinish` đúng một lần.
- Splash unmount ngay sau khi animation kết thúc.
- Không render `Loading` dữ liệu bên trong splash.
- Lỗi tải animation hoặc reduced motion dùng static brand frame rồi tiếp tục flow, không block vô hạn.

### 2. Auth chạy độc lập với splash

`AuthProvider` được đặt ở bên ngoài route app để kiểm tra Firebase song song với splash. Route private chỉ render Login hoặc MainApp sau khi auth đã xác định.

Splash không được dùng để biểu diễn `authLoading` hoặc `appReady`. Nếu auth chưa xong khi animation kết thúc, app giữ trạng thái chuyển tiếp phù hợp nhưng không phát lại splash.

### 3. Bootstrap hiển thị trong app

Sau khi auth thành công, `MainApp` render layout. Các dữ liệu chưa sẵn sàng dùng loading/skeleton tại vùng nội dung tương ứng. `movieStore` vẫn là nguồn dữ liệu khởi tạo hiện tại; thay đổi này không mở rộng bootstrap sang các service không cần thiết cho màn hình đầu tiên.

`isInitialLoadComplete` chỉ tiếp tục phục vụ điều kiện dữ liệu của app, không quyết định việc splash còn hiển thị.

### 4. StrictMode và request lifecycle

Cleanup do unmount hoặc StrictMode không được gọi callback hoàn tất và không được đánh dấu asset request là lỗi. Chỉ lỗi thật hoặc timeout mới chuyển sang static fallback. Callback hoàn tất phải an toàn khi bị gọi lặp.

## Luồng trạng thái mục tiêu

```text
App mount
  -> AuthProvider và Splash khởi động song song
  -> Splash animation/static frame kết thúc
  -> Splash unmount đúng một lần
  -> authLoading kết thúc
       -> chưa đăng nhập: Login
       -> đã đăng nhập: MainApp/Layout
  -> dữ liệu màn hình tải trong vùng nội dung bằng loading/skeleton
```

## Phạm vi file

- Modify `src/App.tsx`: tách lifecycle splash khỏi `appReady`, đặt `AuthProvider` ở boundary phù hợp.
- Modify `src/shared/components/feedback/SplashScreen.tsx`: bỏ loading dữ liệu, xử lý abort và callback lifecycle.
- Modify `src/shared/hooks/useAppInit.ts` hoặc store liên quan chỉ khi cần giữ bootstrap contract rõ ràng.
- Add or modify focused tests for splash lifecycle and pure policy behavior.
- Không thay đổi asset `public/data/splashscreen.json`.

## Tiêu chí chấp nhận

- Reload route private chỉ thấy một lần splash animation/static frame.
- Spinner không xuất hiện chồng lên splash sau khi animation kết thúc.
- Auth chậm không làm splash phát lại.
- Dữ liệu phim chậm hiển thị loading trong app, không phủ lại brand splash.
- Request animation bị abort trong StrictMode không bị ghi nhận là lỗi.
- Animation lỗi vẫn thoát được sang app.
- Reduced motion không mount Lottie.
- Public share route không mount splash.
- Internal navigation không tạo splash mới.

## Không nằm trong phạm vi

- Thiết kế lại artwork hoặc thời lượng animation.
- Thay thế toàn bộ loading UI của mọi feature.
- Refactor toàn bộ `initialLoadStore`.
- Thay đổi Firebase auth hoặc movie service contract.
