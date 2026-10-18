# Fix 20 finding Hallmark — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix đủ 20 finding của audit Hallmark (`docs/hallmark-audit-2026-10-17.md`) theo spec đã duyệt (`docs/superpowers/specs/2026-10-17-hallmark-fixes-design.md`) — P1 (1 critical + 7 major) ship trước, P2 (12 minor) sau.

**Architecture:** Không đổi logic/state/API/routing. Chỉ đổi: token CSS (`src/index.css`), bố cục login + desktop nav (được phép vì chính là finding), thay Lottie bằng CSS animation, gỡ confirm thừa thành undo-toast theo pattern có sẵn (`use-delete-movie.ts`), dọn class chết.

**Tech Stack:** React 19, Vite 6, TypeScript 5.8, Tailwind v4 (CSS-first, token trong `@theme` + `.dark`), react-router 7, zustand, framer-motion, recharts. Không có test infra — verify bằng `npm run typecheck` + `npm run lint` + `npm run build` + grep + checklist click-through.

## Global Constraints

- Chỉ fix trong danh sách 20 finding của audit; KHÔNG thêm feature, không đổi logic/state/API/routing.
- Được phép đổi bố cục DUY NHẤT ở: `login.tsx` và desktop nav (`navbar.tsx`). `mobile-bottom-nav.tsx` không đụng.
- Không thêm dependency mới. Hành động duy nhất đụng `package.json`: gỡ `lottie-react` (Task 4).
- Mọi màu/font qua token trong `src/index.css`. Không hex/rgba trong `.tsx` (ngoại lệ duy nhất: brand mark Google trong `login.tsx`).
- `design-system/cinemob/MASTER.md` KHÔNG phải rubric — để nguyên, không đọc, không sửa.
- Commit convention repo: `fix(ui): <mô tả tiếng Việt ngắn>` mỗi task; branch làm việc: `fix/hallmark-audit`.
- Shell: Windows PowerShell 5.1. Máy KHÔNG có `ripgrep` — mọi acceptance grep dùng `git grep`. Khi grep không có kết quả, `git grep` in ra không gì + exit code 1 — ĐÓ LÀ PASS.
- Comment trong code: tiếng Việt, chỉ thêm khi cùng vai trò với comment lân cận (repo đã comment dày).
- Reduced-motion: không animation nào được thêm mà bỏ qua `prefers-reduced-motion` (rule global `index.css:145-154` đã hạ animation-duration, không cần guard thêm cho CSS animation).

**Pre-flight (làm 1 lần trước Task 1):**

```powershell
git branch --show-current   # kỳ vọng: fix/hallmark-audit
git status --short          # kỳ vọng: sạch (docs đã commit)
```

---

## Task 1: Token foundation — giấy ấm light + muted/faint + chặn tràn ngang

**Files:**
- Modify: `src/index.css` (lines 11-30, 93-113, 115-118)
- Modify: `src/features/dashboard/components/dashboard-filters.tsx:142`
- Modify: `index.html:6`

**Interfaces:**
- Produces: class utilities `text-text-muted`, `text-text-faint` (dùng ở Task 2, 6, 9); `overflow-x: clip` trên html/body (Task 5 dựa vào để không tràn ngang).

- [ ] **Step 1: Sửa token light trong `src/index.css` (dòng 11-27)**

Thay block:

```css
  /* Editorial Print — light trắng thuần (de-default: bỏ AI-cream) (spec 2026-10-17) */
  --color-background: #ffffff;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-primary: #8f6400; /* mực vàng trên giấy */
  --color-primary-hover: #7a5600;
  --color-on-primary: #ffffff;
```

bằng:

```css
  /* Editorial Print — light giấy ấm 3 tầng, bỏ pure white (gate 7, spec 2026-10-17) */
  --color-background: #f7f4ed;
  --color-surface: #fdfbf6;
  --color-surface-elevated: #fffefa;
  --color-primary: #8f6400; /* mực vàng trên giấy */
  --color-primary-hover: #7a5600;
  --color-on-primary: #fffefa;
```

Và đổi 2 on-color còn lại: `--color-on-success: #ffffff;` → `--color-on-success: #fffefa;`, `--color-on-danger: #ffffff;` → `--color-on-danger: #fffefa;`.

Thêm sau dòng `--color-text-secondary: #6b6b66;` (light):

```css
  --color-text-muted: #5f5b53; /* chữ phụ đặc ≥4.5:1 — placeholder, hint */
  --color-text-faint: #8a857c; /* decorative/large ≥3:1 — số mờ, rule phụ */
```

- [ ] **Step 2: Thêm token dark trong block `.dark`**

Thêm sau `--color-text-secondary: #8a8a85;` (dòng 109):

```css
  --color-text-muted: #9c9c97;
  --color-text-faint: #6e6e69;
```

- [ ] **Step 3: `overflow-x: clip` trong `@layer base`**

Thay:

```css
  html {
    scrollbar-gutter: stable;
  }
```

bằng:

```css
  html {
    scrollbar-gutter: stable;
    overflow-x: clip;
  }

  body {
    overflow-x: clip;
  }
```

(Dùng `clip` chứ không `hidden` — `clip` không tạo scroll container nên không phá `position: sticky` của navbar.)

- [ ] **Step 4: Panel filter không tràn ở 320px**

`src/features/dashboard/components/dashboard-filters.tsx:142` — trong class string, đổi `min-w-[320px]` → `w-[320px] max-w-[calc(100vw-2rem)]`.

- [ ] **Step 5: `index.html` default light theme-color khớp token mới**

`index.html:6`: `content="#ffffff"` → `content="#f7f4ed"` (dòng 7 dark `#0a0a0a` giữ nguyên).

- [ ] **Step 6: Verify**

```powershell
git grep -n "#ffffff" -- src/index.css   # kỳ vọng: không có kết quả
git grep -n "overflow-x: clip" -- src/index.css   # kỳ vọng: 2 dòng (html + body)
npm run typecheck
npm run lint
```

- [ ] **Step 7: Commit**

```powershell
git add src/index.css src/features/dashboard/components/dashboard-filters.tsx index.html
git commit -m "fix(ui): nền giấy ấm light theme + token chữ phụ, chặn tràn ngang"
```

---

## Task 2: Contrast sweep — alpha chữ phụ → token muted

**Files:**
- Modify: `src/shared/components/ui/date-picker.tsx:300`
- Modify: `src/shared/components/ui/dropdown.tsx:172,200`
- Modify: `src/features/dashboard/components/dashboard-filters.tsx:338`
- Modify: `src/features/movies/components/add-movie/rating-section.tsx:83`

**Interfaces:**
- Consumes: `text-text-muted` từ Task 1.

- [ ] **Step 1: date-picker — weekday header**

`date-picker.tsx:300`: `className="text-center text-xs font-bold text-text-secondary/60 py-1 uppercase"` → `className="text-center text-xs font-bold text-text-muted py-1 uppercase"`.

- [ ] **Step 2: dropdown — chữ value chưa chọn**

`dropdown.tsx:172`: `${selectedOption ? 'text-text-primary' : 'text-text-secondary/60'}` → `${selectedOption ? 'text-text-primary' : 'text-text-muted'}`.

- [ ] **Step 3: dropdown — placeholder typo + alpha (cùng dòng 200)**

`dropdown.tsx:200`: `text-text-primary placeholder-text-secondary/50"` → `text-text-primary placeholder:text-text-muted"`.

(Token `placeholder-text-secondary` không có dấu `:` nên trình duyệt bỏ qua — placeholder rớt về màu default; `/50` càng rớt ngưỡng. Fix một lần cho cả typo lẫn contrast.)

- [ ] **Step 4: dashboard-filters — nhãn option inactive**

`dashboard-filters.tsx:338`: `: 'text-text-secondary/40 hover:text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'` → `: 'text-text-muted hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'`.

- [ ] **Step 5: rating-section — sao rỗng**

`rating-section.tsx:83`: `: 'text-text-secondary/40'` → `: 'text-text-muted'`.

- [ ] **Step 6: Verify**

```powershell
git grep -nE "text-text-secondary/(40|50|60)" -- "src"   # kỳ vọng: không có kết quả
git grep -n "placeholder-text-secondary/50" -- "src"     # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

- [ ] **Step 7: Commit**

```powershell
git add -u
git commit -m "fix(ui): thay alpha chữ phụ bằng token muted đạt tương phản 4.5:1"
```

---

## Task 3: Focus sweep — gỡ toàn bộ outline suppression (27 điểm)

**Files:**
- Modify: 18 file/dòng có `focus-visible:outline-none` (danh sách dưới)
- Modify: 9 dòng có `outline-none` trần (danh sách dưới)

**Quy tắc chung:** xoá đúng token (`focus-visible:outline-none` hoặc `outline-none`) và một dấu cách liền kề trong class string; GIỮ NGUYÊN mọi `focus-visible:ring-*` / `focus-visible:border-*` (đó là lớp phụ). Rule global `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 3px }` (`index.css:140-143`) đã có sẵn — sau khi gỡ, outline hiện tức thì.

- [ ] **Step 1: Gỡ `focus-visible:outline-none` (18 dòng)**

| # | File | Dòng |
|---|---|---|
| 1 | `src/app/components/layout.tsx` | 30 |
| 2 | `src/features/albums/pages/album-detail-page.tsx` | 134 |
| 3 | `src/shared/components/ui/dropdown.tsx` | 157 |
| 4 | `src/shared/components/ui/dropdown.tsx` | 200 |
| 5 | `src/shared/components/ui/time-picker.tsx` | 259 |
| 6 | `src/shared/components/ui/text-field.tsx` | 52 |
| 7 | `src/features/dashboard/components/dashboard-filters.tsx` | 91 |
| 8 | `src/shared/components/ui/search.tsx` | 50 |
| 9 | `src/shared/components/ui/multi-select-dropdown.tsx` | 162 |
| 10 | `src/shared/components/ui/multi-select-dropdown.tsx` | 203 |
| 11 | `src/shared/components/ui/multi-select-dropdown.tsx` | 227 |
| 12 | `src/features/search/components/search-filters.tsx` | 97 |
| 13 | `src/shared/components/ui/date-picker.tsx` | 368 |
| 14 | `src/features/profile/components/avatar/avatar-crop-view.tsx` | 88 |
| 15 | `src/features/profile/components/avatar/avatar-crop-view.tsx` | 133 |
| 16 | `src/features/profile/components/own-profile-editor.tsx` | 413 |
| 17 | `src/features/profile/components/own-profile-editor.tsx` | 433 |
| 18 | `src/features/profile/components/user/member-search-modal.tsx` | 65 |

Ví dụ chuẩn (text-field.tsx:52): `'w-full h-11 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary focus-visible:outline-none transition-colors'` → `'w-full h-11 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary transition-colors'`.

- [ ] **Step 2: Gỡ `outline-none` trần (9 dòng)**

| # | File | Dòng | Ghi chú |
|---|---|---|---|
| 1 | `src/shared/components/ui/pagination.tsx` | 119 | `... focus-visible:ring-primary/50 outline-none"` → bỏ `outline-none` |
| 2 | `src/features/albums/components/album-selector-modal.tsx` | 153 | `... focus-visible:ring-primary/20 outline-none transition-colors"` |
| 3 | `src/features/movies/components/add-movie-modal.tsx` | 223 | `... focus-visible:ring-primary/20 outline-none transition-colors` |
| 4 | `src/features/movies/components/add-movie-modal.tsx` | 251 | như trên |
| 5 | `src/features/movies/components/add-movie-modal.tsx` | 273 | như trên |
| 6 | `src/features/movies/components/add-movie-modal.tsx` | 361 | `... placeholder-text-secondary [giữ Task 9 sửa] ... outline-none transition-colors resize-none` — chỉ bỏ `outline-none` |
| 7 | `src/features/movies/components/add-movie/album-section.tsx` | 81 | `... focus-visible:ring-primary/20 outline-none transition-colors` |
| 8 | `src/features/movies/components/add-movie/movie-form-fields.tsx` | 185 | `... focus-visible:ring-primary/20 outline-none transition-colors disabled:opacity-50 tabular-nums` |
| 9 | `src/features/movies/components/add-movie/movie-form-fields.tsx` | 249 | `... placeholder-text-secondary [giữ Task 9] ... outline-none transition-colors resize-none` |

- [ ] **Step 3: Verify**

```powershell
git grep -n "outline-none" -- "src"   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

Checklist mắt (user chạy cuối P1): tab từ navbar → mỗi control hiện outline vàng 2px tức thì, không fade.

- [ ] **Step 4: Commit**

```powershell
git add -u
git commit -m "fix(ui): dùng vòng focus outline toàn cục, gỡ outline-none khỏi 27 control"
```

---

## Task 4: Lottie → CSS/SVG (splash + confetti), gỡ dep + 2 JSON 2.3MB

**Files:**
- Modify: `src/shared/components/feedback/splash-screen.tsx` (viết lại toàn file)
- Create: `src/shared/components/feedback/confetti-burst.tsx`
- Modify: `src/index.css` (@theme — thêm 3 animate + 3 keyframes)
- Modify: `src/features/movies/hooks/use-random-picker.ts`
- Modify: `src/features/movies/components/random-picker-modal.tsx`
- Modify: `vite.config.ts:48-55`
- Delete: `public/data/splashscreen.json`, `public/data/confetti.json`
- Modify: `package.json` + `package-lock.json` (qua npm uninstall)

**Interfaces:**
- Produces: `ConfettiBurst` (default export, không props — Task này tự dùng); các class `animate-splash-brand`, `animate-splash-rule`, `animate-confetti`.
- SplashScreen giữ nguyên props `{ onAnimationFinish: () => void; staticMode?: boolean }` — không nơi gọi nào phải sửa.

- [ ] **Step 1: Thêm keyframes vào `src/index.css` (@theme, sau `--animate-zoom-in-95`)**

```css
  --animate-splash-brand: splash-brand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  --animate-splash-rule: splash-rule 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
  --animate-confetti: confetti-burst 1s ease-out forwards;
```

Và thêm 3 block `@keyframes` (cạnh các keyframes hiện có trong @theme):

```css
  @keyframes splash-brand {
    from {
      opacity: 0;
      transform: scale(0.96);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes splash-rule {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }

  @keyframes confetti-burst {
    from {
      opacity: 1;
      transform: rotate(var(--confetti-angle)) translateY(0);
    }
    to {
      opacity: 0;
      transform: rotate(var(--confetti-angle)) translateY(calc(var(--confetti-distance) * -1));
    }
  }
```

- [ ] **Step 2: Viết lại `src/shared/components/feedback/splash-screen.tsx` (toàn bộ)**

```tsx
import { useCallback, useEffect, useRef } from 'react';
import logoText from '@/assets/images/logo_text.png';

interface SplashScreenProps {
  onAnimationFinish: () => void;
  staticMode?: boolean;
}

const SPLASH_DURATION_MS = 1500;

/** Khung thương hiệu tĩnh/CSS — thay animation Lottie trước đây. */
function BrandFrame({ animated }: { animated: boolean }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 z-150 bg-background overflow-hidden">
      <img
        src={logoText}
        alt="CineMOB"
        width={160}
        height={40}
        className={`h-10 w-auto ${animated ? 'animate-splash-brand' : ''}`}
      />
      <span
        aria-hidden="true"
        className={`h-[3px] w-11 bg-primary origin-left ${animated ? 'animate-splash-rule' : ''}`}
      />
    </div>
  );
}

function SplashScreen({ onAnimationFinish, staticMode = false }: SplashScreenProps) {
  const completionNotifiedRef = useRef(false);

  const notifyAnimationFinish = useCallback(() => {
    if (completionNotifiedRef.current) return;
    completionNotifiedRef.current = true;
    onAnimationFinish();
  }, [onAnimationFinish]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    if (staticMode) {
      notifyAnimationFinish();
      return;
    }
    const timer = setTimeout(notifyAnimationFinish, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [notifyAnimationFinish, staticMode]);

  return <BrandFrame animated={!staticMode} />;
}

export default SplashScreen;
```

(Không còn fetch `/data/splashscreen.json`, không còn timeout 8s/AbortController — splash không phụ thuộc mạng nữa. Reduced-motion: rule global `index.css:145-154` hạ animation-duration về 0.01ms, khung hiện ngay ở trạng thái cuối.)

- [ ] **Step 3: Tạo `src/shared/components/feedback/confetti-burst.tsx`**

```tsx
import React from 'react';

const PARTICLE_COUNT = 24;

/** Confetti CSS thuần — thay Lottie; nơi gọi tự gate reduced-motion. */
function ConfettiBurst() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: PARTICLE_COUNT }, (_, index) => (
        <span
          key={index}
          className="absolute left-1/2 top-1/2 w-1.5 h-2.5 -ml-[3px] -mt-[5px] rounded-[1px] animate-confetti"
          style={
            {
              '--confetti-angle': `${index * 15}deg`,
              '--confetti-distance': index % 2 === 0 ? '150px' : '110px',
              animationDelay: `${(index % 5) * 55}ms`,
              backgroundColor:
                index % 3 === 0 ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default ConfettiBurst;
```

- [ ] **Step 4: Dọn confetti khỏi `src/features/movies/hooks/use-random-picker.ts`**

Xoá từng phần sau, giữ nguyên phần còn lại:
- Dòng 30: `const [confettiData, setConfettiData] = useState<Record<string, unknown> | null>(null);`
- Dòng 35: `const confettiFetchedRef = useRef(false);`
- Cả block `ensureConfetti` (dòng 45-52).
- Cả effect dòng 64-66 (`useEffect(() => { if (isOpen) ensureConfetti(); }, ...)`).
- Trong `startShuffle`: xoá dòng `ensureConfetti();` (dòng 124) và `ensureConfetti,` trong dep array (dòng 168).
- Trong return: xoá `confettiData,` (dòng 206).

- [ ] **Step 5: Sửa `src/features/movies/components/random-picker-modal.tsx`**

- Xoá dòng 1 `import Lottie from 'lottie-react';`; thêm sau import `PickerWheel`:
  `import ConfettiBurst from '@/shared/components/feedback/confetti-burst';`
- Xoá `confettiData,` khỏi destructure (dòng 47).
- Dòng 61: `const showConfetti = hasResult && !reducedMotion && confettiData !== null;` → `const showConfetti = hasResult && !reducedMotion;`
- Thay block dòng 73-80:

```tsx
          {showConfetti && <ConfettiBurst />}
```

- [ ] **Step 6: Sửa `vite.config.ts` — bỏ chunk lottie**

Trong `manualChunks` (dòng 48-55), xoá dòng `lottie: ['lottie-react'],`.

- [ ] **Step 7: Gỡ dep + xoá JSON**

```powershell
npm uninstall lottie-react
git rm public/data/splashscreen.json public/data/confetti.json
```

- [ ] **Step 8: Verify**

```powershell
git grep -in "lottie" -- src vite.config.ts package.json   # kỳ vọng: không có kết quả
git grep -n "splashscreen.json\|confetti.json" -- src      # kỳ vọng: không có kết quả
Test-Path public/data/splashscreen.json, public/data/confetti.json   # kỳ vọng: False False
npm run typecheck
npm run lint
npm run build   # kỳ vọng: build success, không warning import lottie
```

- [ ] **Step 9: Commit**

```powershell
git add -A
git commit -m "perf(ui): thay Lottie bằng animation CSS, gỡ lottie-react và 2 file JSON 2.3MB"
```

---

## Task 5: Login — bố cục bìa tạp chí (phá centred-everything)

**Files:**
- Modify: `src/features/auth/components/login.tsx` (viết lại phần thân; giữ GoogleIcon + handleLogin)

**Interfaces:**
- Consumes: token `-muted/-faint` (Task 1), `overflow-x: clip` (Task 1).
- Produces: không API mới. Giữ `hasWall` gate: `posters.length >= 12`.

- [ ] **Step 1: Viết lại `login.tsx`**

Giữ nguyên: import block, `GoogleIcon` (hex brand Google là exception của spec), `useWallPosters` (đổi `WALL_COUNT` 18 → 20 — TMDB trending trả 20 item), `handleLogin`. Phần thân thay bằng:

```tsx
const WALL_COUNT = 20;
const WALL_STRIP_COUNT = 12;

function PosterTile({ poster }: { poster: TMDBMovieResult }) {
  return (
    <img
      src={getTMDBImageUrl(poster.poster_path, 'w342')}
      alt=""
      aria-hidden="true"
      draggable={false}
      className="w-full h-full object-cover"
    />
  );
}

/** Màn đăng nhập — bìa tạp chí: tường poster bên trái, cột form lệch trục trái bên phải. */
function Login() {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const posters = useWallPosters();

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [signInWithGoogle]);

  const hasWall = posters.length >= WALL_STRIP_COUNT;

  return (
    <main className="min-h-dvh grid bg-background text-text-primary selection:bg-primary/20 selection:text-primary lg:grid-cols-[11fr_9fr]">
      <div className="order-1 lg:order-2 flex flex-col border-b border-border lg:border-b-0 lg:border-l">
        <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
          <div className="w-full max-w-sm">
            <p aria-hidden="true" className="w-11 h-[3px] bg-primary mb-7" />
            <p className="font-display text-2xl tracking-wide">
              Cine<span className="text-primary">MOB</span>
            </p>

            <h1 className="font-display tracking-wide leading-[1.05] text-3xl sm:text-4xl mt-9">
              Theo dõi mọi bộ phim bạn xem.
            </h1>
            <p className="mt-3 text-sm text-text-secondary leading-relaxed">
              Ghi chép danh sách xem, đánh giá và xây dựng bộ sưu tập của riêng bạn.
            </p>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="mt-10 w-full flex items-center justify-center gap-3 h-11 px-6 rounded-control bg-primary text-on-primary border border-transparent hover:bg-primary-hover font-bold tracking-[0.08em] text-xs transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Đăng nhập bằng tài khoản Google"
              aria-busy={isLoading}
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin text-on-primary" aria-hidden="true" />
              ) : (
                <GoogleIcon className="w-5 h-5 shrink-0" />
              )}
              <span>Tiếp tục với Google</span>
            </button>
          </div>
        </div>

        <footer className="px-6 sm:px-10 lg:px-14 xl:px-20 pb-6 text-[10px] font-semibold tracking-[0.08em] text-text-secondary">
          &copy; {new Date().getFullYear()} CineMOB
        </footer>
      </div>

      {hasWall && (
        <div className="order-2 lg:order-1 overflow-hidden">
          <div
            aria-hidden="true"
            className="grid grid-cols-6 grid-rows-2 gap-0.5 h-40 lg:hidden"
          >
            {posters.slice(0, WALL_STRIP_COUNT).map((poster) => (
              <PosterTile key={poster.id} poster={poster} />
            ))}
          </div>
          <div
            aria-hidden="true"
            className="hidden lg:grid grid-cols-4 grid-rows-5 gap-0.5 h-full"
          >
            {posters.map((poster) => (
              <PosterTile key={poster.id} poster={poster} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
```

Điểm chốt: xoá hoàn toàn `items-center`/`text-center` của khối nội dung, xoá vignette `radial-gradient(rgba(...))` và `style={{ filter: 'saturate(0.85)' }}`; brand + h1 + form cùng lệch trục trái; desktop tường poster trái (4×5), mobile form trên + dải poster 12 ô dưới (h-40).

- [ ] **Step 2: Verify**

```powershell
git grep -nE "rgba\(|saturate|text-center" -- src/features/auth/components/login.tsx   # kỳ vọng: không có kết quả
git grep -n "style=" -- src/features/auth/components/login.tsx   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

Checklist mắt: login desktop = 2 cột lệch trục; mobile 375px = form trên, dải poster dưới; cả 2 theme.

- [ ] **Step 3: Commit**

```powershell
git add src/features/auth/components/login.tsx
git commit -m "fix(ui): bố cục login bìa tạp chí, phá centred-everything"
```

---

## Task 6: Desktop nav — masthead strip

**Files:**
- Modify: `src/app/components/navbar.tsx` (dòng 82-95, 97-122, 124, 246-247)

**Interfaces:**
- Consumes: `text-text-faint` (Task 1), `NAV_ITEMS`/`isNavItemActive` (sẵn có).
- Produces: không API mới. Mobile (`< md`) và `mobile-bottom-nav.tsx` giữ nguyên hành vi cũ.

- [ ] **Step 1: Header bỏ hairline full-bleed**

Dòng 82: `<header className="sticky top-0 z-50 bg-background border-b border-border">` → `<header className="sticky top-0 z-50 bg-background">`.

- [ ] **Step 2: Gộp wordmark + tagline + mục lục vào cụm trái**

Thay block Link wordmark (dòng 87-95) và div links giữa (dòng 97-122) bằng:

```tsx
          <div className="flex items-center gap-4 xl:gap-6 min-w-0">
            <Link
              to="/"
              className="flex items-baseline gap-2.5 shrink-0 cursor-pointer"
              aria-label="Về Thư viện CineMOB"
            >
              <span className="font-display text-xl uppercase tracking-wide select-none">
                Cine<span className="text-primary">MOB</span>
              </span>
              <span
                aria-hidden="true"
                className="hidden xl:inline text-[9px] font-semibold tracking-[0.18em] uppercase text-text-faint whitespace-nowrap"
              >
                Phòng chiếu gia đình
              </span>
            </Link>

            <div className="hidden md:flex items-center min-w-0">
              {NAV_ITEMS.map((item, index) => {
                const active = isNavItemActive(location.pathname, item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    className={`relative flex items-center gap-1.5 h-14 px-2 lg:px-2.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] transition-colors cursor-pointer whitespace-nowrap ${
                      active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`hidden lg:inline text-[9px] tabular-nums tracking-[0.1em] ${
                        active ? 'text-primary' : 'text-text-faint'
                      }`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {item.label}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-2 bottom-0 h-0.5 bg-primary"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
```

- [ ] **Step 3: Cụm icon phải + rule đôi**

- Dòng 124: `className="flex items-center space-x-1"` → `className="flex items-center space-x-1 shrink-0"`.
- Thêm ngay trước `</header>` (sau `</nav>`, dòng 246-247):

```tsx
        <div aria-hidden="true" className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="h-px bg-border" />
          <div className="mt-[3px] h-px bg-border-default" />
        </div>
```

- [ ] **Step 4: Verify**

```powershell
npm run typecheck
npm run lint
```

Checklist mắt (≥1024px): links nằm cùng cụm trái với wordmark (không còn "links giữa"), rule đôi thấy rõ, sticky giữ, active underline + số vàng đúng; ≤768px không đổi so với trước.

- [ ] **Step 5: Commit**

```powershell
git add src/app/components/navbar.tsx
git commit -m "fix(ui): navbar masthead — mục lục đánh số cụm trái, rule đôi"
```

---

## Task 7: Token improvisation — theme-color + chart palette

**Files:**
- Modify: `src/app/providers/theme-provider.tsx:38-45`
- Modify: `src/features/stats/pages/stats-page.tsx:26-36`

**Interfaces:**
- Consumes: token `--color-background` (mọi theme), `--color-primary`, `--color-text-secondary`, `--color-surface` (Task 1 chỉ đổi giá trị, tên không đổi).

- [ ] **Step 1: `theme-provider.tsx` — meta theme-color derive từ token**

Thay dòng 38-45:

```tsx
    // Áp class theme lên root và đồng bộ màu theme-color theo token
    const applyResolvedTheme = (resolved: 'dark' | 'light') => {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
      const background = window.getComputedStyle(root).getPropertyValue('--color-background').trim();
      document
        .querySelectorAll('meta[name="theme-color"]')
        .forEach((meta) => meta.setAttribute('content', background));
    };
```

- [ ] **Step 2: `stats-page.tsx` — palette chart từ token**

Thay block dòng 26-36:

```ts
// Palette biểu đồ derive từ token — tự đúng ở cả 2 theme (spec 2026-10-17).
const COLORS = [
  'var(--color-primary)',
  'color-mix(in srgb, var(--color-primary) 78%, var(--color-text-secondary))',
  'color-mix(in srgb, var(--color-primary) 56%, var(--color-text-secondary))',
  'var(--color-text-secondary)',
  'color-mix(in srgb, var(--color-text-secondary) 76%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 58%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 42%, var(--color-surface))',
  'color-mix(in srgb, var(--color-text-secondary) 28%, var(--color-surface))',
];
```

(recharts nhận CSS var/`color-mix` trong `fill` — đã verify trình duyệt evergreen 2026 hỗ trợ; `COLORS[index % COLORS.length]` tại dòng 345 không đổi.)

- [ ] **Step 3: Verify**

```powershell
git grep -nE "#[0-9a-fA-F]{3,8}" -- src/features/stats src/app/providers   # kỳ vọng: không có kết quả
git grep -n "#09090b\|#fafafa" -- src   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

Checklist mắt: toggle theme → thanh trình duyệt/PWA đổi màu đúng; biểu đồ stats đọc được ở cả 2 theme.

- [ ] **Step 4: Commit**

```powershell
git add src/app/providers/theme-provider.tsx src/features/stats/pages/stats-page.tsx
git commit -m "fix(ui): đưa theme-color và palette chart về token"
```

---

## Task 8: P1 checkpoint — verify toàn pha + checklist

**Files:** không sửa code.

- [ ] **Step 1: Chạy full verify**

```powershell
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 2: Chạy lại toàn bộ acceptance grep P1**

```powershell
git grep -n "#ffffff" -- src/index.css                                  # trống
git grep -nE "text-text-secondary/(40|50|60)" -- "src"                  # trống
git grep -n "placeholder-text-secondary/50" -- "src"                    # trống
git grep -n "outline-none" -- "src"                                     # trống
git grep -in "lottie" -- src vite.config.ts package.json                # trống
git grep -nE "rgba\(|saturate|text-center" -- src/features/auth/components/login.tsx   # trống
git grep -nE "#[0-9a-fA-F]{3,8}" -- src/features/stats src/app/providers   # trống
```

- [ ] **Step 3: Giao checklist click-through P1 cho user (spec §8)**

1. Dark + light: Dashboard / Login / Movie detail / một modal.
2. 320px + 375px: không scroll ngang, panel filter không tràn, nút không wrap 2 dòng.
3. Tab keyboard từ navbar → main: outline vàng hiện tức thì ở mọi control.
4. Bật reduced-motion: splash/toast không animation.
5. Đổi theme: meta theme-color đổi đúng.

- [ ] **Step 4: Báo cáo + chờ user xác nhận trước khi sang P2.** Không commit (không có thay đổi code).

---

## Task 9: Placeholder typo ×4

**Files:**
- Modify: `src/features/albums/components/album-selector-modal.tsx:153`
- Modify: `src/features/movies/components/add-movie-modal.tsx:361`
- Modify: `src/features/movies/components/add-movie/movie-form-fields.tsx:249`
- Modify: `src/shared/components/ui/multi-select-dropdown.tsx:227`

**Interfaces:**
- Consumes: `text-text-muted` (Task 1). (Site thứ 5 — `dropdown.tsx:200` — đã fix ở Task 2.)

- [ ] **Step 1: Thay `placeholder-text-secondary` → `placeholder:text-text-muted` tại đúng 4 dòng trên.**

Ví dụ (album-selector-modal.tsx:153): `... text-text-primary font-bold placeholder-text-secondary focus-visible:border-primary/50 ...` → `... text-text-primary font-bold placeholder:text-text-muted focus-visible:border-primary/50 ...`.

- [ ] **Step 2: Verify**

```powershell
git grep -n "placeholder-text-secondary" -- src   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

- [ ] **Step 3: Commit**

```powershell
git add -u
git commit -m "fix(ui): khôi phục màu placeholder cho 4 ô nhập"
```

---

## Task 10: Motion — progress scaleX + reduced-motion scroll guard

**Files:**
- Modify: `src/shared/components/feedback/toast-container.tsx:76-82`
- Modify: `src/features/movies/pages/movie-detail-page.tsx:211-223`
- Modify: `src/features/movies/hooks/use-movie-validation.ts:77`

- [ ] **Step 1: Toast progress bar — animate `width` → `scaleX`**

Thay block dòng 76-82:

```tsx
              <motion.div
                aria-hidden="true"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: (toast.duration ?? 3000) / 1000, ease: 'linear' }}
                className="absolute bottom-0 left-0 h-0.5 w-full bg-primary/50 origin-left"
              />
```

(Nhánh reduced-motion dòng 70-74 giữ nguyên.)

- [ ] **Step 2: TV progress — `transition-[width]` → `transform: scaleX`**

Thay block dòng 211-223:

```tsx
              <div className="mt-3 h-0.5 bg-border-default" role="presentation">
                <div
                  className="h-full w-full bg-primary origin-left transition-transform duration-700 ease-out"
                  style={{
                    transform: `scaleX(${Math.min(
                      1,
                      movie.progress.is_completed
                        ? 1
                        : (movie.progress.watched_episodes ?? 0) / (movie.total_episodes || 1),
                    )})`,
                  }}
                />
              </div>
```

- [ ] **Step 3: Scroll guard trong `use-movie-validation.ts`**

Dòng 77: `el.scrollIntoView({ behavior: 'smooth', block: 'center' });` →

```ts
        const prefersReducedMotion = window.matchMedia(
          '(prefers-reduced-motion: reduce)',
        ).matches;
        el.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'center',
        });
```

(Giữ nguyên comment dòng 78 phía dưới.)

- [ ] **Step 4: Verify**

```powershell
git grep -n "transition-\[width\]" -- src   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add src/shared/components/feedback/toast-container.tsx src/features/movies/pages/movie-detail-page.tsx src/features/movies/hooks/use-movie-validation.ts
git commit -m "fix(ui): animate progress bằng scaleX, tôn trọng reduced-motion khi scroll"
```

---

## Task 11: Hover — một tín hiệu duy nhất (scale ảnh), ring về focus-visible

**Files:**
- Modify: `src/features/movies/components/poster-card.tsx:77-84` (bỏ dòng 81)
- Modify: `src/features/albums/components/album-card.tsx:84`

- [ ] **Step 1: poster-card — bỏ hover ring, ring chỉ còn khi focus-visible**

Thay classNames (dòng 77-84):

```tsx
      className={classNames(
        'group relative block aspect-2/3 rounded-poster overflow-hidden',
        'bg-surface border border-border',
        selected
          ? 'ring-1 ring-primary'
          : 'ring-inset has-[:focus-visible]:ring-1 has-[:focus-visible]:ring-primary',
        selectable || onClick ? 'cursor-pointer' : '',
        className ?? '',
      )}
```

(Xoá cả dòng cũ `onClick && !selected && 'hover:ring-1 hover:ring-primary',` và token `transition-[outline-color] duration-200`. Ảnh scale 1.03 dòng 99 giữ nguyên — đó là tín hiệu hover duy nhất.)

- [ ] **Step 2: album-card — tương tự, ring qua group-has**

Dòng 84, đổi class string:

```
"absolute inset-0 z-20 rounded-poster overflow-hidden bg-surface border border-border transition-[outline-color] duration-200 group-hover:ring-1 group-hover:ring-primary group-focus-within:ring-1 group-focus-within:ring-primary"
```

→

```
"absolute inset-0 z-20 rounded-poster overflow-hidden bg-surface border border-border group-has-[:focus-visible]:ring-1 group-has-[:focus-visible]:ring-primary"
```

(Link toàn thẻ là `<Link>` — sibling của div cover nên dùng `group-has-[:focus-visible]:` trên cover + `group` có sẵn ở article. Ảnh scale dòng 91 giữ nguyên.)

- [ ] **Step 3: Verify**

```powershell
npm run typecheck
npm run lint
```

Checklist mắt: hover card → chỉ ảnh zoom, viền không đổi; tab tới card → ring vàng hiện.

- [ ] **Step 4: Commit**

```powershell
git add src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx
git commit -m "fix(ui): một tín hiệu hover cho card, ring về focus-visible"
```

---

## Task 12: Confirm thừa → undo-toast (3 chỗ), giữ confirm xoá album

**Files:**
- Modify: `src/features/movies/pages/movie-detail-page.tsx` (dòng 6, 31, 50-63, 186)
- Modify: `src/features/albums/pages/album-detail-page.tsx` (dòng 17, 27, 216-233)
- Modify: `src/features/albums/hooks/use-album-detail.ts` (dòng 7-9, 98-107)
- Modify: `src/features/profile/services/avatar-service.ts` (thêm export)
- Modify: `src/features/profile/hooks/use-avatar-crop.ts` (dòng 5-9, 10, 69, 296-325)
- Modify: `src/constants/messages.ts` (xoá dòng 20)

**Interfaces:**
- Consumes: pattern `showToast(msg, 'info', 7000, { label, onAction })` của `use-delete-movie.ts`.
- Produces: `setUserAvatarUrl(user: User, photoURL: string): Promise<void>` (avatar-service).

- [ ] **Step 1: movie-detail — xoá confirm, xoá trực tiếp như pattern sẵn có**

- Thay `confirmDelete` (dòng 50-63) bằng:

```tsx
  const handleDeleteMovie = () => {
    if (!movie?.docId) return;
    handleDelete(movie.docId);
    navigate('/');
  };
```

(`handleDelete` từ `use-delete-movie` đã tự show undo-toast 7s; toast là global nên vẫn thấy sau khi điều hướng về `/`.)

- Dòng 186: `onClick={confirmDelete}` → `onClick={handleDeleteMovie}`.
- Xoá dòng 6 `import useAlertStore from '@/shared/stores/alert-store';` và dòng 31 `const { showAlert } = useAlertStore();` (hết chỗ dùng — orphan của chính task này).

- [ ] **Step 2: album-detail — nút "Bỏ khỏi album" gọi thẳng**

Thay block onClick (dòng 216-233):

```tsx
                      <button
                        type="button"
                        onClick={() => handleRemoveMovie(movie)}
                        aria-label={`Bỏ ${getMainTitle(movie)} khỏi album`}
                        title="Bỏ khỏi album"
                        className="min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-danger text-white hover:text-on-danger rounded-poster border border-white/10 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} strokeWidth={1.5} aria-hidden="true" />
                      </button>
```

- Xoá dòng 17 `import useAlertStore...` và dòng 27 `const { showAlert } = useAlertStore();` (orphan của task).

- [ ] **Step 3: `use-album-detail.ts` — undo cho gỡ phim khỏi album**

- Thêm import (dòng 9 cạnh các import hiện có): `import { getMainTitle } from '@/features/movies/utils/movie-utils';`
- Thêm cạnh `ITEMS_PER_PAGE`: `const UNDO_REMOVE_MS = 7000;`
- Thay `handleRemoveMovie` (dòng 98-107):

```ts
  const handleRemoveMovie = async (movie: Movie) => {
    if (!album?.docId || !movie.docId) return;
    const previousIds = album.movieDocIds || [];
    try {
      const newIds = previousIds.filter((id) => id !== movie.docId);
      await updateAlbum(album.docId, { movieDocIds: newIds });
      showToast(`Đã bỏ "${getMainTitle(movie)}" khỏi album`, 'info', UNDO_REMOVE_MS, {
        label: 'Hoàn tác',
        onAction: () => {
          updateAlbum(album.docId, { movieDocIds: previousIds }).catch(() =>
            showToast(MESSAGES.ALBUM.ADD_MOVIE_ERROR, 'error'),
          );
        },
      });
    } catch {
      showToast(MESSAGES.ALBUM.REMOVE_MOVIE_ERROR, 'error');
    }
  };
```

(`MESSAGES.ALBUM.REMOVE_MOVIE_SUCCESS` không còn dùng — xoá ở Step 5.)

- [ ] **Step 4: avatar — reset ảnh Google kèm undo**

- `avatar-service.ts`: thêm export cuối file:

```ts
// Đặt ảnh đại diện về một URL có sẵn — dùng cho hoàn tác (undo).
export const setUserAvatarUrl = async (user: User, photoURL: string): Promise<void> => {
  await updateProfile(user, { photoURL });
  await syncProfilePhotoURL(user.uid, photoURL);
};
```

- `use-avatar-crop.ts`:
  - Import: thêm `setUserAvatarUrl,` vào block import từ `avatar-service` (dòng 5-9).
  - Xoá dòng 10 `import useAlertStore from '@/shared/stores/alert-store';` và dòng 69 `const { showAlert } = useAlertStore();`.
  - Thêm cạnh các interface phía trên: `const UNDO_AVATAR_MS = 7000;`
  - Thay `handleDelete` (dòng 296-325):

```ts
  // Khôi phục ảnh gốc tài khoản Google, kèm undo-toast.
  const handleDelete = useCallback(() => {
    if (!user || isBusy) return;
    const previousPhotoURL = user.photoURL;

    setIsDeleting(true);
    setErrorMessage(null);

    (async () => {
      try {
        await revertToGoogleAvatar(user);
        await refreshUser();
        showToast('Đã khôi phục ảnh đại diện Google', 'info', UNDO_AVATAR_MS, {
          label: 'Hoàn tác',
          onAction: () => {
            if (!previousPhotoURL) return;
            setUserAvatarUrl(user, previousPhotoURL)
              .then(() => refreshUser())
              .catch(() => showToast('Không thể hoàn tác, vui lòng thử lại', 'error'));
          },
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error && error.message
            ? error.message
            : 'Không thể xóa ảnh đại diện';
        setErrorMessage(message);
        showToast(message, 'error');
      } finally {
        setIsDeleting(false);
      }
    })();
  }, [user, isBusy, refreshUser, showToast]);
```

- [ ] **Step 5: `messages.ts` — xoá hằng orphan**

Xoá dòng 20: `    REMOVE_MOVIE_SUCCESS: 'Đã gỡ phim khỏi album',`

- [ ] **Step 6: Verify**

```powershell
git grep -n "showAlert" -- src/features/movies/pages/movie-detail-page.tsx src/features/albums/pages/album-detail-page.tsx   # kỳ vọng: không có kết quả
git grep -n "REMOVE_MOVIE_SUCCESS" -- src   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

Checklist mắt: xoá phim (toast Hoàn tác + điều hướng về `/`), bỏ phim khỏi album (toast Hoàn tác, hoàn tác re-add được), xoá ảnh đại diện (toast Hoàn tác trả lại ảnh cũ), xoá album vẫn còn confirm.

- [ ] **Step 7: Commit**

```powershell
git add -u
git commit -m "fix(ui): thay confirm thừa bằng undo-toast, giữ confirm xoá album"
```

---

## Task 13: Micro-batch — glyph ×, ngữ nghĩa link, tap target, viewport-fit, copyright

**Files:**
- Modify: `src/features/albums/components/album-selector-modal.tsx:2,124-128`
- Modify: `src/shared/pages/not-found-page.tsx`
- Modify: `src/features/dashboard/components/dashboard-filters.tsx:97`
- Modify: `index.html:5`
- Modify: `src/shared/components/layout/footer.tsx:42`

- [ ] **Step 1: album-selector-modal — `×` → icon lucide X (đồng nhất dialog.tsx)**

- Dòng 2: `import { FolderPlus, Film } from 'lucide-react';` → `import { FolderPlus, Film, X } from 'lucide-react';`
- Dòng 124-128:

```tsx
        <IconButton label="Đóng bảng chọn album" onClick={onClose} variant="ghost">
          <X size={18} strokeWidth={1.8} aria-hidden="true" />
        </IconButton>
```

- [ ] **Step 2: not-found-page — Link nhận class button (hết `<Link><Button>`)**

Thay toàn file thân render:

```tsx
import { Link } from 'react-router-dom';

// Trang báo khi đường link sai hoặc không còn tồn tại — editorial.
function NotFoundPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-0 py-16 md:py-24 text-center">
      <p className="font-display leading-none text-7xl md:text-9xl text-text-primary tabular-nums">
        4<span className="text-primary">0</span>4
      </p>
      <p className="mt-4 text-[11px] font-semibold tracking-[0.14em] text-text-secondary">
        Không tìm thấy trang — đường link sai hoặc không còn tồn tại
      </p>
      <div className="mt-8 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center justify-center font-semibold cursor-pointer transition px-4 py-2.5 text-xs gap-2 rounded-control bg-transparent text-text-primary border border-border hover:border-primary hover:text-primary"
        >
          Về Thư viện
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
```

(Xoá import `Button` — orphan của task này. Class copy từ `button.tsx` variant secondary/size md.)

- [ ] **Step 3: dashboard-filters — tap target nút xoá 22px → 30px**

Dòng 97: `... cursor-pointer p-1"` → `... cursor-pointer p-2"`.

- [ ] **Step 4: index.html — viewport-fit**

Dòng 5: `content="width=device-width, initial-scale=1.0"` → `content="width=device-width, initial-scale=1.0, viewport-fit=cover"`.

- [ ] **Step 5: footer — copyright**

Dòng 42: `<span>© {new Date().getFullYear()} MOB</span>` → `<span>© {new Date().getFullYear()} CineMOB</span>`.

- [ ] **Step 6: Verify**

```powershell
git grep -n "Button" -- src/shared/pages/not-found-page.tsx   # kỳ vọng: không có kết quả (Button bị gỡ hẳn)
git grep -n "×" -- src/features/albums/components/album-selector-modal.tsx   # kỳ vọng: không có kết quả
npm run typecheck
npm run lint
```

Checklist mắt: nút đóng modal album = icon X; 404 = 1 link duy nhất focus 1 lần (không double-focus); nút xoá search đo ~30px; iOS: safe-area hoạt động (nếu có thiết bị).

- [ ] **Step 7: Commit**

```powershell
git add -u
git commit -m "fix(ui): micro-batch — glyph ×, ngữ nghĩa link, tap target, viewport-fit, copyright"
```

---

## Task 14: Dọn class chết (animate-in + shadow no-op)

**Files:**
- Modify: `src/features/profile/components/own-profile-editor.tsx:308`
- Modify: 10 dòng `shadow-elevated` + 1 dòng `poster-preview.tsx:13`

- [ ] **Step 1: own-profile-editor — class `animate-in` không tồn tại**

Dòng 308: `... overflow-hidden animate-in fade-in zoom-in-95 duration-150"` → `... overflow-hidden animate-zoom-in-95 duration-150"` (`--animate-zoom-in-95` có sẵn trong theme).

- [ ] **Step 2: Xoá `shadow-elevated` (token zeroed, render no-op) tại 10 dòng**

Xoá đúng token ` shadow-elevated` khỏi class string (giữ mọi class khác):

| File | Dòng |
|---|---|
| `src/features/stats/pages/stats-page.tsx` | 47 |
| `src/features/dashboard/components/dashboard-filters.tsx` | 142 |
| `src/features/search/components/search-filters.tsx` | 107 |
| `src/shared/components/feedback/toast-container.tsx` | 49 |
| `src/features/search/components/person/person-movie-section.tsx` | 94 |
| `src/shared/components/ui/dialog.tsx` | 109 |
| `src/shared/components/ui/date-picker.tsx` | 222 |
| `src/shared/components/ui/dropdown.tsx` | 184 |
| `src/shared/components/ui/time-picker.tsx` | 154 |
| `src/shared/components/ui/multi-select-dropdown.tsx` | 211 |

- [ ] **Step 3: poster-preview — xoá bộ 3 class shadow/transition no-op**

`src/features/movies/components/add-movie/poster-preview.tsx:13`: `border border-border shadow-card transition-shadow hover:shadow-elevated` → `border border-border`.

- [ ] **Step 4: Verify**

```powershell
git grep -nE "shadow-(card|elevated|premium|glass)|animate-in" -- "*.tsx"   # kỳ vọng: không có kết quả (grep riêng *.tsx để không đụng token zeroed trong index.css)
git grep -n "shadow" -- src/index.css   # kỳ vọng: khối token --shadow-* zeroed còn nguyên
npm run typecheck
npm run lint
```

- [ ] **Step 5: Commit**

```powershell
git add -u
git commit -m "refactor(ui): dọn class chết animate-in và shadow no-op"
```

---

## Task 15: DESIGN.md thật + gỡ prop `eyebrow` chết

**Files:**
- Modify (viết lại): `DESIGN.md`
- Modify: `src/shared/components/ui/page-header.tsx` (dòng 8, 23, 46-50)

- [ ] **Step 1: Viết lại `DESIGN.md` toàn bộ**

```markdown
# CineMOB — Design System

Nguồn sự thật của token: `src/index.css` (`@theme` + `.dark`). File này là hợp đồng ngắn: token, luật, giọng.

## 1. Triết lý: Editorial Print

Bố cục như báo in: chữ đậm lệch trục, hairline thay bóng, đen sâu + mực vàng spotlight (dark), giấy ấm (light).
Không bóng mềm, không gradient trang trí, không bo tròn lớn.

## 2. Token (2 theme — giá trị trong `src/index.css`)

| Token | Dark | Light | Vai trò |
|---|---|---|---|
| `--color-background` | `#0a0a0a` | `#f7f4ed` | nền trang |
| `--color-surface` | `#141414` | `#fdfbf6` | panel, card |
| `--color-surface-elevated` | `#1a1a1a` | `#fffefa` | dialog, dropdown, toast |
| `--color-primary` | `#ca8a04` | `#8f6400` | accent duy nhất — link, active, CTA |
| `--color-text-primary` | `#f5f5f2` | `#0a0a0a` | mực chính |
| `--color-text-secondary` | `#8a8a85` | `#6b6b66` | chữ phụ ≥4.5:1 |
| `--color-text-muted` | `#9c9c97` | `#5f5b53` | placeholder, hint, weekday |
| `--color-text-faint` | `#6e6e69` | `#8a857c` | decorative/large ≥3:1 |
| `--color-border` | `rgb(255 255 255 / .14)` | `rgb(20 20 20 / .16)` | viền control |
| `--color-focus` | `#ca8a04` | `#8f6400` | outline focus |

Radius: control/card/dialog 8px, poster 4px. Shadow: không — elevation bằng hairline (`--shadow-*` = none by design).

## 3. Luật cấm

1. Không bóng mềm — mọi elevation dùng `border`/hairline.
2. Không pure white/black làm nền; light phải là giấy ấm, dark không đen tuyệt đối ngoài `#0a0a0a`.
3. Vàng `primary` là accent duy nhất — không thêm màu nhấn thứ hai.
4. Focus: outline 2px `--color-focus` offset 3px hiện **tức thì**; cấm `outline-none`; border/ring chỉ là lớp phụ, không thay outline.
5. Không alpha `/40–/60` trên chữ — dùng `text-secondary`/`text-muted`/`text-faint` theo vai trò.
6. Không hex/rgba trong `.tsx` — mọi màu qua token (ngoại lệ: brand mark Google ở nút đăng nhập).
7. Không Lottie/ảnh động nặng — motion CSS ngắn, tôn trọng `prefers-reduced-motion`.
8. Hành động đảo ngược được → undo-toast 7s (pattern `use-delete-movie.ts`); confirm dialog chỉ cho hành động phá huỷ thật (xoá album).

## 4. Chữ & bố cục

- `font-display` (Anton) cho tiêu đề, số liệu lớn, wordmark; body `font-sans` (Be Vietnam Pro).
- Nhãn nhỏ: caps 9–12px, `tracking` 0.08–0.18em; số liệu `tabular-nums`.
- Container `max-w-6xl`, section cách nhau bằng hairline.

## 5. Giọng copy

- Tiếng Việt, câu ngắn, xưng "bạn"; không emoji; nút là động từ ("Thêm phim", "Hoàn tác").
- Toast/tooltip nói kết quả cụ thể ("Đã xoá X", "Gỡ phim khỏi album thất bại"), không "Có lỗi xảy ra" chung chung.
```

- [ ] **Step 2: page-header — gỡ prop `eyebrow`**

- Xoá dòng 8: `  eyebrow?: string;`
- Xoá dòng 23: `  eyebrow,`
- Xoá block dòng 46-50:

```tsx
          {eyebrow && (
            <p className="text-[11px] font-semibold tracking-[0.1em] text-text-secondary mb-1">
              {eyebrow}
            </p>
          )}
```

- [ ] **Step 3: Verify**

```powershell
git grep -n "eyebrow" -- src   # kỳ vọng: không có kết quả
Test-Path DESIGN.md   # kỳ vọng: True
npm run typecheck
npm run lint
```

- [ ] **Step 4: Commit**

```powershell
git add DESIGN.md src/shared/components/ui/page-header.tsx
git commit -m "docs: viết lại DESIGN.md thật; gỡ prop eyebrow chết"
```

---

## Task 16: P2 checkpoint — verify toàn pha + checklist cuối

**Files:** không sửa code.

- [ ] **Step 1: Chạy full verify**

```powershell
npm run typecheck
npm run lint
npm run build
```

- [ ] **Step 2: Chạy lại toàn bộ acceptance grep P2**

```powershell
git grep -n "placeholder-text-secondary" -- src            # trống
git grep -n "transition-\[width\]" -- src                  # trống
git grep -nE "shadow-(card|elevated|premium|glass)|animate-in" -- "*.tsx"   # trống
git grep -n "eyebrow" -- src                               # trống
git grep -n "REMOVE_MOVIE_SUCCESS" -- src                  # trống
```

- [ ] **Step 3: Giao checklist click-through P2 cho user (spec §8, mở rộng)**

1. Dark + light trên Dashboard / Movie detail / Album / Stats.
2. 320px + 375px: không scroll ngang ở mọi trang; nút xoá search bấm được.
3. Tab: outline vàng ở mọi control; card có ring khi focus, hover chỉ zoom ảnh.
4. Reduced-motion: splash/confetti/toast/scroll không animation.
5. Xoá phim / bỏ khỏi album / reset avatar: có toast Hoàn tác, hoàn tác đúng; xoá album vẫn confirm.
6. Đổi theme: meta theme-color đổi đúng (thanh trình duyệt/PWA).
7. 404: chỉ 1 điểm focus trên CTA. Modal album: nút đóng là icon X.

- [ ] **Step 4: Báo cáo tổng kết 20 finding → done; chờ user duyệt merge (không tự merge).**

---

## Self-Review (chạy sau khi viết, đã sửa inline)

**1. Spec coverage — map finding → task:**

| Spec | Task | Spec | Task |
|---|---|---|---|
| P1-1 login | Task 5 | P2-1 typo | Task 9 (+Task 2 cho site dropdown) |
| P1-2 contrast | Task 2 | P2-2 animate width | Task 10 |
| P1-3 lottie | Task 4 | P2-3 scroll guard | Task 10 |
| P1-4 focus | Task 3 | P2-4 hover | Task 11 |
| P1-5 overflow | Task 1 | P2-5 confirm→undo | Task 12 |
| P1-6 nav | Task 6 | P2-6/7/8/9/12 | Task 13 |
| P1-7 token impro | Task 7 | P2-10 dead class | Task 14 |
| P1-8 light | Task 1 | P2-11 DESIGN.md + eyebrow | Task 15 |
| Checkpoint P1/P2 | Task 8 / 16 | Gate 49 (two-line clickable) | checklist Task 8 §3 |

Không thiếu finding nào của audit (1 critical · 7 major · 12 minor).

**2. Placeholder scan:** không có "TBD/TODO/implement later"; mọi step đổi code đều có code block; mọi acceptance có lệnh + kết quả kỳ vọng.

**3. Type consistency:** `setUserAvatarUrl(user, photoURL)` (Task 12) khớp chữ ký service; `UNDO_REMOVE_MS`/`UNDO_AVATAR_MS` là hằng cục bộ riêng file (không import chéo feature); `ConfettiBurst` default export dùng ở Task 4 Step 5; class `animate-zoom-in-95`/`animate-splash-*`/`animate-confetti` đều được định nghĩa trong `index.css` trước khi dùng; `handleDeleteMovie` (Task 12) thay `confirmDelete` cùng file.
