# Splash Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tách splash thương hiệu khỏi loading dữ liệu để reload chỉ phát splash một lần rồi chuyển sang Login hoặc app layout.

**Architecture:** `AuthProvider` sẽ sống ở app boundary và khởi động song song với splash. `SplashScreen` chỉ quản lý asset, animation/static fallback và callback kết thúc; `App` unmount splash ngay sau callback. Bootstrap dữ liệu tiếp tục nằm trong `MainApp`/feature UI và không còn quyết định splash visibility.

**Tech Stack:** React 19, TypeScript, React Router, Zustand, Firebase Auth, Vitest, Vite.

**Spec:** `docs/superpowers/specs/2026-09-27-splash-lifecycle-design.md`

## Global Constraints

- Splash full chỉ xuất hiện khi policy cho phép; public `/share/:uid` không mount splash.
- `prefers-reduced-motion` không mount Lottie.
- Không thay đổi `public/data/splashscreen.json` hoặc Firebase/movie service contract.
- Giữ style TypeScript hiện tại: hai-space indentation, single quotes, semicolons.
- Không đưa loading dữ liệu vào splash; loading phải thuộc layout hoặc vùng nội dung.
- Không coi request abort do cleanup/StrictMode là lỗi asset.

## Review Focus

- Animation kết thúc trong khi auth còn loading: không được phát lại splash và không được để callback làm hỏng state.
- Fetch animation bị abort khi unmount/StrictMode: không được chuyển sang failure fallback ngoài ý muốn.
- Fetch/parse animation thất bại thật: phải thoát được sang static frame rồi tiếp tục app flow.
- Dữ liệu movie tải chậm sau animation: loading phải xuất hiện trong app, không nằm trên brand splash.
- Route public share và internal navigation: không được tạo splash ngoài policy ban đầu.

---

### Task 1: Chốt các hành vi policy và lifecycle bằng test

**Files:**

- Modify: `src/shared/utils/splashPolicy.test.ts`
- Create: `src/shared/components/feedback/SplashScreen.test.tsx` nếu môi trường test hỗ trợ render component; nếu không, giữ test ở helper lifecycle thuần.

**Interfaces:**

- Consumes: `getSplashMode`, `SplashScreen` callback contract và các hành vi hiện có.
- Produces: test cases pinning one-shot completion, reduced-motion/static behavior, failure recovery và share-route bypass.

- [ ] **Step 1: Kiểm tra test environment hiện có**

Run:

```powershell
Get-Content package.json
Get-Content vitest.config.ts
Get-Content src/test/setup.ts
```

Expected: xác định test runner có DOM/jsdom hay chỉ Node để chọn test component hoặc helper không phụ thuộc DOM.

- [ ] **Step 2: Viết test thất bại cho callback hoàn tất một lần**

Test phải mô tả rằng completion callback không được gọi do request cleanup/abort, và callback animation chỉ làm kết thúc một lifecycle splash.

- [ ] **Step 3: Chạy test để xác nhận RED**

Run:

```powershell
npx vitest run src/shared/components/feedback/SplashScreen.test.tsx
```

Expected: FAIL vì lifecycle hiện tại coi abort cleanup là lỗi hoặc chưa có cơ chế one-shot.

- [ ] **Step 4: Bổ sung các case policy nếu còn thiếu**

Giữ các case hiện có và thêm assertion cho `/share/:uid`, normal route và reduced motion; không thêm test cho UI presentation không ảnh hưởng behavior.

### Task 2: Tách lifecycle splash khỏi app readiness

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/shared/components/feedback/SplashScreen.tsx`
- Test: test lifecycle từ Task 1.

**Interfaces:**

- Consumes: `SplashMode`, `onAnimationFinish`, `AuthProvider`, `MainApp`.
- Produces: splash visibility chỉ phụ thuộc policy ban đầu và animation completion; `appReady` không còn giữ splash.

- [ ] **Step 1: Sửa test để mô tả contract mới**

Assertion chính:

```tsx
expect(splash).toBeVisible();
fireEvent.animationComplete();
expect(splash).not.toBeInTheDocument();
expect(loadingInsideSplash).not.toBeInTheDocument();
```

Nếu không thể render Lottie trong test environment, kiểm thử helper/callback contract tương đương và kiểm tra `App` state bằng testable pure function.

- [ ] **Step 2: Chạy test và xác nhận RED**

Run:

```powershell
npx vitest run src/shared/components/feedback/SplashScreen.test.tsx
```

Expected: FAIL vì `App` hiện còn truyền `showLoading` và giữ splash khi `appReady` chưa true.

- [ ] **Step 3: Sửa `App.tsx` tối thiểu**

- Để `AuthProvider` ở boundary bao quanh route app và splash.
- Tách `showLoading` khỏi `SplashScreen`.
- Cho `onAnimationFinish` kết thúc visibility của splash ngay.
- Giữ `appReady` chỉ phục vụ logic app nếu còn cần, không dùng để giữ splash.
- Không thay đổi route `/share/:uid` policy.

- [ ] **Step 4: Sửa `SplashScreen.tsx` tối thiểu**

- Loại bỏ prop và render loading dữ liệu.
- Giữ static brand frame cho reduced motion/failure.
- Đảm bảo completion callback chỉ phát một lần trong một mount.
- Trong `catch`, bỏ qua lỗi `AbortError` khi request đã bị cleanup; chỉ failure thật mới dùng fallback.

- [ ] **Step 5: Chạy test focused để xác nhận GREEN**

Run:

```powershell
npx vitest run src/shared/components/feedback/SplashScreen.test.tsx src/shared/utils/splashPolicy.test.ts
```

Expected: PASS.

### Task 3: Bảo đảm loading dữ liệu thuộc app content

**Files:**

- Modify: file Dashboard/loading component thực tế được test Task 2 phát hiện đang sở hữu initial movie loading.
- Possibly modify: `src/shared/hooks/useAppInit.ts` only if its readiness callback is still coupled to splash.
- Test: existing colocated movie/dashboard tests if available.

**Interfaces:**

- Consumes: movie store `loading`/`initialized` state.
- Produces: app layout render được sau auth; vùng nội dung có loading khi movie data chưa sẵn sàng.

- [ ] **Step 1: Tìm consumer loading hiện tại**

Run:

```powershell
rg "isInitialLoadComplete|moviesLoading|loading.*movie|<Loading" src/features src/shared src/App.tsx
```

Expected: xác định đúng component sở hữu loading UI; không refactor các feature không liên quan.

- [ ] **Step 2: Viết test thất bại cho loading trong content**

Test phải xác nhận trạng thái movie chưa sẵn sàng render loading tại vùng nội dung, trong khi splash lifecycle đã kết thúc. Nếu chưa có DOM runner, chuyển behavior thành test cho pure selector/store contract và ghi nhận kiểm tra UI thủ công.

- [ ] **Step 3: Chạy test để xác nhận RED**

Run lệnh test hẹp của consumer được chọn.

Expected: FAIL nếu consumer chưa render trạng thái loading độc lập với splash.

- [ ] **Step 4: Sửa tối thiểu consumer**

Render skeleton/loading ở vùng nội dung hiện hữu, giữ nguyên layout và không thêm fullscreen overlay nếu nội dung có thể render một phần.

- [ ] **Step 5: Chạy test focused để xác nhận GREEN**

Chạy lại test hẹp của consumer và test lifecycle splash.

### Task 4: Kiểm tra hồi quy và hoàn thiện tài liệu

**Files:**

- Modify: `docs/DESIGN.md` hoặc tài liệu liên quan chỉ khi mô tả hiện tại còn nói splash giữ tới app readiness.
- Test: toàn bộ test suite.

**Interfaces:**

- Consumes: các contract đã ổn định từ Tasks 1-3.
- Produces: verification evidence cho route, motion preference, auth/data latency và build.

- [ ] **Step 1: Chạy focused typecheck**

```powershell
npx tsc --noEmit
```

Expected: không có lỗi TypeScript mới.

- [ ] **Step 2: Chạy test suite**

```powershell
npm test
```

Expected: toàn bộ test hiện có và test mới PASS.

- [ ] **Step 3: Chạy lint**

```powershell
npm run lint
```

Expected: không có lỗi lint mới.

- [ ] **Step 4: Chạy build**

```powershell
npm run build
```

Expected: build Vite thành công, không thay đổi `public/data/splashscreen.json`.

- [ ] **Step 5: Kiểm tra thủ công các lifecycle chính**

- Reload `/` khi đã đăng nhập: một splash, sau đó app content/loading.
- Reload khi chưa đăng nhập: một splash, sau đó Login.
- Auth hoặc movie data chậm: không có splash lần hai.
- Tắt animation preference: static brand frame, không Lottie.
- Lỗi `splashscreen.json`: static frame rồi thoát được.
- Mở `/share/:uid`: không có splash.
- Điều hướng nội bộ: không tạo splash mới.

## Self-review

- Spec coverage: Task 2 xử lý splash/auth boundary; Task 3 xử lý loading content; Task 1 và Task 4 bao phủ test và verification.
- Không thay đổi asset hoặc service contract.
- Không thêm state machine mới khi các state hiện có đủ để tách lifecycle.
- Consumer loading ở Task 3 được xác định trước khi sửa, tránh đoán sai owner.
- Nếu test environment không có DOM, plan chuyển sang helper/store contract và ghi nhận manual UI verification thay vì thêm dependency mới.
