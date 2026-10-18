# Motion Standard — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuẩn hoá toàn bộ motion về một contract thống nhất: thang thời lượng 120/150/200/250 ms, 3 curve (`ease-standard`/`ease-enter`/`ease-exit`), mọi overlay có enter + exit đúng bảng §6 của spec, route enter bằng CSS, một API reduced-motion, dọn dead machinery.

**Architecture:** Token CSS trong `@theme` (`src/index.css`) + constants TS (`src/constants/animations.ts`) là nguồn sự thật. framer-motion chỉ cho overlay enter/exit, `layoutId`, stagger, toast; hover/focus/micro + route enter là CSS + token. LazyDialog giữ nguyên semantics unmount/reset nhưng để Dialog chạy exit trước khi gỡ.

**Tech Stack:** React 19.2, TypeScript 5.8, Vite 6, Tailwind CSS v4.1 (`@theme`, namespace `--ease-*`), framer-motion ^12.23.25. Không thêm dependency.

**Spec nguồn:** `docs/superpowers/specs/2026-10-18-motion-standard-design.md` (đã duyệt).

## Global Constraints

- Không thêm/bớt dependency. Không đổi hành vi nghiệp vụ, API, keyboard/focus management của overlay.
- Chỉ transform/opacity. Không parallax, không overshoot. Không curve nào khác ngoài 3 token.
- Thang thời lượng: 120 (fast) / 150 (base, = default `transition-*`) / 200 (medium) / 250 (slow). Cấm giá trị khác (300/500/700/75…) trong `src/**` sau đợt này (ngoại lệ: picker `3.15`/`1.95` giây là hằng số JS đặc thù, giữ nguyên).
- Mọi overlay: enter + exit; exit cùng bậc hoặc ngắn hơn enter 1 bậc (theo spec §6).
- Không mở trình duyệt, không chạy test runner/mock (kỷ luật spec loading 2026-10-18). Verify = `npx prettier --write <files>` → `npm run typecheck` → `npm run lint` → `npm run build` + grep + source review.
- `npm run build` = `tsc --noEmit && vite build` (làm luôn typecheck; vẫn chạy typecheck riêng cho tín hiệu sớm).
- Commit: người dùng đã cho phép **tự commit mỗi task** theo "Suggested commit" (2026-10-18, nhánh `fix/hallmark-audit`). Không push. Không `git add -A` — chỉ stage file thuộc task.
- Comment trong code: chỉ giữ comment hiện có; không thêm diễn giải dài.
- Trước khi sửa mỗi task: đọc lại file sẽ sửa.

---

## Task 1: Token CSS — thêm 3 ease + page-enter, xoá 4 animate chết

**Files:**

- Modify: `src/index.css`

**Interfaces:**

- Produces: `--ease-standard`, `--ease-enter`, `--ease-exit` (utility `ease-*`); `--animate-page-enter` + `@keyframes page-enter` (dùng ở Task 4 qua `motion-safe:animate-page-enter`).
- Giữ nguyên: `--animate-zoom-in-95` (xoá ở Task 7), `--animate-splash-brand`, `--animate-confetti`.

- [ ] **Step 1: Thay khối token animate (dòng 48–54)**

Old:

```css
--animate-slide-in-right: slide-in-right 0.3s ease-out forwards;
--animate-slide-down: slide-down 0.3s ease-out forwards;
--animate-fade-in: fade-in 0.2s ease-out forwards;
--animate-zoom-in-95: zoom-in-95 0.2s ease-out forwards;
--animate-splash-brand: splash-brand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
--animate-splash-rule: splash-rule 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
--animate-confetti: confetti-burst 1s ease-out forwards;
```

New:

```css
/* Motion — spec 2026-10-18: 3 curve + thang 120/150/200/250ms. */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
--ease-exit: cubic-bezier(0.7, 0, 0.84, 0);

--animate-page-enter: page-enter 0.2s cubic-bezier(0.16, 1, 0.3, 1) both;
--animate-zoom-in-95: zoom-in-95 0.2s ease-out forwards;
--animate-splash-brand: splash-brand 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
--animate-confetti: confetti-burst 1s ease-out forwards;
```

- [ ] **Step 2: Thêm keyframes `page-enter` (đặt cạnh các keyframes khác)**

```css
@keyframes page-enter {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 3: Xoá các keyframes chết**

Xoá trọn 3 block: `@keyframes splash-rule` (dòng 67–74), `@keyframes slide-in-right` (87–96), `@keyframes slide-down` (98–107), `@keyframes fade-in` (109–116). Giữ `splash-brand`, `confetti-burst`, `zoom-in-95`.

- [ ] **Step 4: Verify**

Chạy: `npx prettier --write src/index.css` → `npm run build`. Expected: pass.
Grep kiểm tra (expected 0 hit): `--animate-slide-in-right|--animate-slide-down|--animate-fade-in|--animate-splash-rule|@keyframes (splash-rule|slide-in-right|slide-down|fade-in)`.
Grep kiểm tra (expected 6 hit — 3 dòng token trong index.css + splash-screen + confetti-burst + own-profile-editor; zoom-in-95 được xoá đủ ở Task 7): `animate-zoom-in-95|animate-splash-brand|animate-confetti`.

Suggested commit: `feat(ui): add motion easing tokens and page-enter animation`

---

## Task 2: Constants mới + dialog/sheet variants + toast + presets

**Files:**

- Modify: `src/constants/animations.ts`
- Modify: `src/shared/components/ui/dialog.tsx`
- Modify: `src/shared/components/feedback/toast-container.tsx`
- Modify: `src/shared/utils/motion-presets.ts`

**Interfaces:**

- Consumes: token mới của Task 1 (song song CSS/TS cùng giá trị).
- Produces:
  - `MOTION_DURATION = { fast: 0.12, base: 0.15, medium: 0.2, slow: 0.25, picker: 3.15, pickerAudioTail: 1.95 }`
  - `MOTION_EASING: Record<'standard' | 'enter' | 'exit', [number, number, number, number]>`
  - `getMotionTransition(reducedMotion: boolean, duration: number, ease: [number, number, number, number]): Transition`
  - Xoá `OVERLAY_VARIANTS`, `DIALOG_VARIANTS` (chỉ `dialog.tsx` dùng).
- Consumer ngoài không đổi: `use-random-picker.ts` chỉ dùng `MOTION_DURATION.picker` / `.pickerAudioTail` (giữ nguyên giá trị).

- [ ] **Step 1: Viết lại `src/constants/animations.ts` (toàn bộ nội dung)**

```ts
import type { Transition } from 'framer-motion';

export const MOTION_DURATION = {
  fast: 0.12,
  base: 0.15,
  medium: 0.2,
  slow: 0.25,
  picker: 3.15,
  pickerAudioTail: 1.95,
} as const;

export const MOTION_EASING: Record<
  'standard' | 'enter' | 'exit',
  [number, number, number, number]
> = {
  standard: [0.4, 0, 0.2, 1],
  enter: [0.16, 1, 0.3, 1],
  exit: [0.7, 0, 0.84, 0],
};

export const getMotionTransition = (
  reducedMotion: boolean,
  duration: number,
  ease: [number, number, number, number],
): Transition => ({
  duration: reducedMotion ? 0 : duration,
  ease,
});
```

- [ ] **Step 2: `dialog.tsx` — import + block transitions theo `presentation`**

Đổi import (dòng 5):

```tsx
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Thêm `type Variants` vào import framer (dòng 3):

```tsx
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion';
```

Trong thân `Dialog`, sau `const reducedMotion = useReducedMotion() ?? false;` chèn:

```tsx
const isSheet = presentation === 'sheet';
const backdropEnter = getMotionTransition(
  reducedMotion,
  isSheet ? MOTION_DURATION.slow : MOTION_DURATION.medium,
  MOTION_EASING.enter,
);
const backdropExit = getMotionTransition(
  reducedMotion,
  isSheet ? MOTION_DURATION.medium : MOTION_DURATION.base,
  MOTION_EASING.exit,
);
const panelEnter = getMotionTransition(
  reducedMotion,
  isSheet ? MOTION_DURATION.slow : MOTION_DURATION.medium,
  MOTION_EASING.enter,
);
const panelExit = getMotionTransition(
  reducedMotion,
  isSheet ? MOTION_DURATION.medium : MOTION_DURATION.base,
  MOTION_EASING.exit,
);
const overlayVariants: Variants = {
  closed: { opacity: 0, transition: backdropExit },
  open: { opacity: 1, transition: backdropEnter },
};
const panelVariants: Variants = {
  closed: isSheet
    ? { opacity: 0, y: '100%', transition: panelExit }
    : { opacity: 0, y: 8, transition: panelExit },
  open: { opacity: 1, y: 0, transition: panelEnter },
};
```

JSX: `variants={OVERLAY_VARIANTS}` → `variants={overlayVariants}`; `variants={DIALOG_VARIANTS}` → `variants={panelVariants}`; xoá cả hai `transition={getMotionTransition(reducedMotion)}`.

Kết quả: dialog = backdrop/panel 200 vào (ease-enter) / 150 ra (ease-exit); sheet = backdrop 250/200, panel trượt `y: '100%' → 0` 250/200; `fullscreen-mobile` đi nhánh dialog (giữ nguyên hình khối).

- [ ] **Step 3: `toast-container.tsx` — token medium/base + ease mới**

Đổi import (dòng 4):

```tsx
import { MOTION_DURATION, MOTION_EASING } from '@/constants/animations';
```

Dòng 8:

```tsx
const toastTransition = { duration: MOTION_DURATION.medium, ease: MOTION_EASING.enter };
```

Exit (dòng 52):

```tsx
                : { opacity: 0, y: 8, transition: { duration: MOTION_DURATION.base, ease: MOTION_EASING.exit } }
```

- [ ] **Step 4: `motion-presets.ts` — staggerItem dùng token**

Đổi import + dòng 15:

```ts
import type { Variants } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING } from '@/constants/animations';
```

```ts
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: MOTION_DURATION.medium, ease: MOTION_EASING.enter },
  },
};
```

- [ ] **Step 5: Verify**

Chạy: `npx prettier --write src/constants/animations.ts src/shared/components/ui/dialog.tsx src/shared/components/feedback/toast-container.tsx src/shared/utils/motion-presets.ts` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep: `OVERLAY_VARIANTS|DIALOG_VARIANTS|deliberate|standard: 0.2` → 0 hit. `use-random-picker.ts` không đổi.

Suggested commit: `refactor(ui): rebuild motion constants and dialog transitions`

---

## Task 3: LazyDialog chạy exit — onExitComplete xuyên chuỗi dialog

**Files:**

- Modify: `src/shared/components/ui/dialog.tsx`
- Modify: `src/shared/components/ui/lazy-dialog.tsx`
- Modify: `src/features/movies/components/add-movie-modal.tsx`
- Modify: `src/features/movies/components/random-picker-modal.tsx`
- Modify: `src/features/profile/components/user/member-search-modal.tsx`
- Modify: `src/features/dashboard/components/dashboard-filter-sheet.tsx`
- Modify: `src/features/dashboard/components/dashboard-filters.tsx`
- Modify: `src/app/components/navbar.tsx`

**Interfaces:**

- Produces: `Dialog` nhận prop optional `onExitComplete?: () => void` (gắn vào `AnimatePresence`).
- Produces: consumer lazy nhận prop optional `onExited?: () => void`, truyền tiếp `onExitComplete={onExited}` vào `Dialog` của mình.
- Giữ nguyên: unmount sau đóng để reset state consumer (add-movie `activeTab`, member search `searchText`…), loader/retry/focus trap.

- [ ] **Step 1: `dialog.tsx` — thêm prop `onExitComplete`**

`DialogProps` thêm dòng: `onExitComplete?: () => void;` (sau `overlayClassName`).
Destructure thêm `onExitComplete` trong `export function Dialog({...})`.
JSX: `<AnimatePresence onExitComplete={onExitComplete}>`.

- [ ] **Step 2: Viết lại `lazy-dialog.tsx` (toàn bộ nội dung)**

```tsx
import { useCallback, useEffect, useId, useState, type ComponentType } from 'react';
import { Dialog, DialogHeader, DialogBody, type DialogSize } from './dialog';
import Loading from './loading';
import ErrorState from './error-state';
import ErrorBoundary from '../feedback/error-boundary';
interface LazyDialogProps<P extends object> {
  open: boolean;
  onClose: () => void;
  title: string;
  loader: () => Promise<{ default: ComponentType<P> }>;
  componentProps: P;
  size?: DialogSize;
  presentation?: 'dialog' | 'sheet' | 'fullscreen-mobile';
}
/** Loads dialog code on demand, while keeping a closeable fallback visible. */
export default function LazyDialog<P extends object>({
  open,
  onClose,
  title,
  loader,
  componentProps,
  size,
  presentation,
}: LazyDialogProps<P>) {
  const titleId = useId();
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<{
    loader: typeof loader;
    Component: ComponentType<P>;
  } | null>(null);
  const [error, setError] = useState(false);
  const [shouldRender, setShouldRender] = useState(open);
  useEffect(() => {
    if (open) setShouldRender(true);
  }, [open]);
  useEffect(() => {
    if (!open || loaded?.loader === loader) return;
    let cancelled = false;
    setError(false);
    loader()
      .then(({ default: Component }) => {
        if (!cancelled) setLoaded({ loader, Component });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [open, loader, loaded, attempt]);
  const handleExited = useCallback(() => setShouldRender(false), []);
  if (!shouldRender) return null;
  const retry = () => {
    setLoaded(null);
    setError(false);
    setAttempt((n) => n + 1);
  };
  const shell = (failed: boolean) => (
    <Dialog
      open={open}
      onClose={onClose}
      titleId={titleId}
      size={size}
      presentation={presentation}
      onExitComplete={handleExited}
    >
      <DialogHeader titleId={titleId} title={title} onClose={onClose} />
      <DialogBody>
        {failed ? (
          <ErrorState
            title="Không mở được hộp thoại"
            description="Thử lại hoặc đóng hộp thoại."
            retry={{ label: 'Thử lại', onClick: retry }}
            compact
          />
        ) : (
          <Loading text="Đang mở hộp thoại…" />
        )}
      </DialogBody>
    </Dialog>
  );
  if (loaded?.loader !== loader) return shell(error);
  const WithExit = loaded.Component as ComponentType<P & { onExited?: () => void }>;
  return (
    <ErrorBoundary key={attempt} fallback={shell(true)}>
      <WithExit {...componentProps} onExited={handleExited} />
    </ErrorBoundary>
  );
}
```

Ghi chú semantics: đóng → `open=false`, `shouldRender` còn true → Dialog/consumer chạy exit → `onExitComplete` → `handleExited` → unmount (reset state như cũ). Mở lại trong lúc exit → AnimatePresence hủy exit, `onExitComplete` không fire.

- [ ] **Step 3: `add-movie-modal.tsx` — nhận + truyền `onExited`**

Dòng 27: `function AddMovieModal() {` → `function AddMovieModal({ onExited }: { onExited?: () => void }) {`
Trong `<Dialog ...>` (dòng 117) thêm `onExitComplete={onExited}`.

- [ ] **Step 4: `random-picker-modal.tsx`**

Interface: thêm `onExited?: () => void;`.
Dòng 40: `function RandomPickerModal({ isOpen, onClose }: RandomPickerModalProps) {` → `function RandomPickerModal({ isOpen, onClose, onExited }: RandomPickerModalProps) {`
`<Dialog>` (dòng 66) thêm `onExitComplete={onExited}`.

- [ ] **Step 5: `member-search-modal.tsx`**

Interface: thêm `onExited?: () => void;`.
Dòng 17 destructure thêm `onExited`.
`<Dialog>` (dòng 30) thêm `onExitComplete={onExited}`.

- [ ] **Step 6: `dashboard-filter-sheet.tsx`**

Interface thêm: `isOpen: boolean;` + `onExited?: () => void;`.
Destructure thêm cả hai.
Dòng 34: `<Dialog open onClose={onClose} titleId={titleId} presentation="sheet">` → `<Dialog open={isOpen} onClose={onClose} titleId={titleId} presentation="sheet" onExitComplete={onExited}>`.

- [ ] **Step 7: `dashboard-filters.tsx` — componentProps thêm `isOpen`**

Trong `componentProps={{...}}` (dòng 350) thêm dòng đầu: `isOpen: !isDesktop && sheetOpen,`.

- [ ] **Step 8: `navbar.tsx` — componentProps dùng state thật**

Dòng 251: `componentProps={{ isOpen: true, onClose: () => setIsRandomOpen(false) }}` → `componentProps={{ isOpen: isRandomOpen, onClose: () => setIsRandomOpen(false) }}`
Dòng 258: `componentProps={{ isOpen: true, onClose: () => setIsMemberSearchOpen(false) }}` → `componentProps={{ isOpen: isMemberSearchOpen, onClose: () => setIsMemberSearchOpen(false) }}`

`app/index.tsx` (LazyDialog add-movie, dòng 94) không cần đổi — `AddMovieModal` tự đọc `isOpen` từ store, `onExited` được LazyDialog inject.

- [ ] **Step 9: Verify**

Chạy: `npx prettier --write src/shared/components/ui/dialog.tsx src/shared/components/ui/lazy-dialog.tsx src/features/movies/components/add-movie-modal.tsx src/features/movies/components/random-picker-modal.tsx src/features/profile/components/user/member-search-modal.tsx src/features/dashboard/components/dashboard-filter-sheet.tsx src/features/dashboard/components/dashboard-filters.tsx src/app/components/navbar.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep: `isOpen: true` còn 0 hit trong `navbar.tsx`; `<Dialog open ` còn 0 hit.
Source review: 4 consumer đều có `onExited` → `onExitComplete`; member-search/add-movie gọi `onClose()` khi điều hướng profile (`openProfile`) vẫn đóng bình thường.

Suggested commit: `fix(ui): let lazy dialogs play their exit animation`

---

## Task 4: Route enter bằng CSS

**Files:**

- Modify: `src/app/index.tsx`

**Interfaces:**

- Consumes: `--animate-page-enter` (Task 1).
- Giữ nguyên: `key={location.pathname}` (remount để replay), scroll-to-top khi PUSH/REPLACE.

- [ ] **Step 1: Sửa `AnimatedRoutes`**

Xoá import dòng 9 (`import { motion, useReducedMotion } from 'framer-motion';`) và dòng 40 (`const reducedMotion = useReducedMotion() ?? false;`).
Đổi JSX (dòng 49–69):

```tsx
    <motion.div
      key={location.pathname}
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
```

→

```tsx
    <div key={location.pathname} className="motion-safe:animate-page-enter">
```

và `</motion.div>` → `</div>`.

- [ ] **Step 2: Verify**

Chạy: `npx prettier --write src/app/index.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep `framer-motion` trong `src/app/index.tsx` → 0 hit.

Suggested commit: `refactor(ui): route enter via motion-safe css`

---

## Task 5: Dropdown + MultiSelect panel enter/exit, unify timing

**Files:**

- Modify: `src/shared/components/ui/dropdown.tsx`
- Modify: `src/shared/components/ui/multi-select-dropdown.tsx`

**Interfaces:**

- Consumes: `MOTION_DURATION.fast`, `MOTION_EASING`, `getMotionTransition` (Task 2).
- Giữ nguyên: toàn bộ logic keyboard/focus/click-outside (effects theo `isOpen`, không theo mount).

- [ ] **Step 1: `dropdown.tsx` — imports + transitions**

Thêm:

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Sau khối refs (dòng 51), thêm:

```tsx
const reducedMotion = useReducedMotion() ?? false;
const panelEnter = getMotionTransition(reducedMotion, MOTION_DURATION.fast, MOTION_EASING.enter);
const panelExit = getMotionTransition(reducedMotion, MOTION_DURATION.fast, MOTION_EASING.exit);
```

- [ ] **Step 2: `dropdown.tsx` — bọc panel**

`{isOpen && ( <div className="absolute top-full left-0 right-0 mt-2 ..."> ... </div> )}` →

```tsx
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4, transition: panelExit }}
            transition={panelEnter}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-card z-50 overflow-hidden"
          >
```

Giữ nguyên 100% children bên trong (ListboxSearchInput + listbox) — chỉ đổi thẻ `div` bao ngoài thành `motion.div` có props trên.

- [ ] **Step 3: `dropdown.tsx` — đưa duration về thang**

- Dòng 159: `hover:border-primary/30 transition-colors duration-300` → `hover:border-primary/30 transition-colors`
- Dòng 180: `transition-transform duration-300` → `transition-transform`
- Dòng 218: `rounded-control transition-colors duration-200` → `rounded-control transition-colors`

- [ ] **Step 4: `multi-select-dropdown.tsx` — làm tương tự**

Imports + reducedMotion/panelEnter/panelExit như Step 1 (sau refs dòng 53).
Panel `{isOpen && (<div className="absolute top-full left-0 right-0 mt-1 ...">` → bọc `AnimatePresence` + `motion.div` (giữ nguyên `mt-1`, cùng props motion như trên).
Duration:

- Dòng 154: `transition-colors duration-200` → `transition-colors`
- Dòng 194: `transition-transform duration-200` → `transition-transform`
- Dòng 261: `transition-colors duration-150` → `transition-colors`

- [ ] **Step 5: Verify**

Chạy: `npx prettier --write src/shared/components/ui/dropdown.tsx src/shared/components/ui/multi-select-dropdown.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep `duration-` trong 2 file → 0 hit.
Source review: click-outside dùng `dropdownRef` (ngoài panel) không đổi; effect focus theo `isOpen` không đổi.

Suggested commit: `refactor(ui): animate dropdown and multiselect panels`

---

## Task 6: Navbar menu + chevron + nav underline; mobile bottom nav

**Files:**

- Modify: `src/app/components/navbar.tsx`
- Modify: `src/shared/components/layout/mobile-bottom-nav.tsx`

**Interfaces:**

- Consumes: Task 2 constants.
- Giữ nguyên: keyboard ARIA menu (`handleMenuKeyDown`, focus mục đầu khi mở, Escape trả focus), route Link.

- [ ] **Step 1: `navbar.tsx` — imports + transitions**

Thêm:

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Trong component (sau khối refs dòng 28–30), thêm:

```tsx
const reducedMotion = useReducedMotion() ?? false;
const menuEnter = getMotionTransition(reducedMotion, MOTION_DURATION.fast, MOTION_EASING.enter);
const menuExit = getMotionTransition(reducedMotion, MOTION_DURATION.fast, MOTION_EASING.exit);
```

- [ ] **Step 2: `navbar.tsx` — chevron rotate có transition**

Dòng 178: `className={`hidden md:block transition-colors shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}` → `className={`hidden md:block transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}`

- [ ] **Step 3: `navbar.tsx` — menu tài khoản enter/exit**

`{isDropdownOpen && ( <div id="account-menu" ...> ... </div> )}` → bọc `AnimatePresence` + `motion.div`:

```tsx
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    id="account-menu"
                    ref={accountMenuRef}
                    role="menu"
                    aria-label="Menu tài khoản"
                    onKeyDown={handleMenuKeyDown}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: menuExit }}
                    transition={menuEnter}
                    className="absolute right-0 mt-2 w-56 bg-surface-elevated border border-border rounded-card z-50 overflow-hidden"
                  >
```

Giữ nguyên 100% children bên trong (header tên user + 3 menu item) — chỉ đổi thẻ `div` bao ngoài thành `motion.div` có props trên.

- [ ] **Step 4: `navbar.tsx` — nav underline fade thay vì mount/unmount**

Dòng 110–115, thay:

```tsx
{
  active && (
    <span aria-hidden="true" className="absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary" />
  );
}
```

→

```tsx
<span
  aria-hidden="true"
  className={`absolute inset-x-3 bottom-[-1px] h-0.5 bg-primary transition-opacity ${
    active ? 'opacity-100' : 'opacity-0'
  }`}
/>
```

- [ ] **Step 5: `mobile-bottom-nav.tsx` — cùng pattern underline**

Dòng 35–40 thay bằng:

```tsx
<span
  aria-hidden="true"
  className={`absolute top-0 inset-x-[22%] h-0.5 bg-primary transition-opacity ${
    isActive ? 'opacity-100' : 'opacity-0'
  }`}
/>
```

- [ ] **Step 6: Verify**

Chạy: `npx prettier --write src/app/components/navbar.tsx src/shared/components/layout/mobile-bottom-nav.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Source review: Escape/closeAndRestoreFocus vẫn chạy khi menu đang exit (focus trả về trigger ngay, exit chỉ là hình ảnh); `aria-current` không đổi.

Suggested commit: `refactor(ui): animate navbar menu and unify nav underlines`

---

## Task 7: Suggestions + popover own-profile + date/time picker + xoá zoom-in-95

**Files:**

- Modify: `src/features/search/components/search-filters.tsx`
- Modify: `src/features/profile/components/own-profile-editor.tsx`
- Modify: `src/shared/components/ui/date-picker.tsx`
- Modify: `src/shared/components/ui/time-picker.tsx`
- Modify: `src/index.css`

**Interfaces:**

- Consumes: Task 2 constants; Dialog từ Task 2/3 (picker mobile leg: Dialog luôn mounted, `open={isOpen}`).
- Giữ nguyên: toàn bộ keyboard/click-outside/focus của picker (`useDialogPresentation` desktop = AnimatePresence; mobile = Dialog), `popoverRef.focus()`.

- [ ] **Step 1: `search-filters.tsx` — suggestions enter/exit**

Imports thêm:

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Sau `containerRef`/`searchInputRef` (dòng 41–42) thêm reducedMotion + `panelEnter`/`panelExit` (fast, như Task 5).
Bọc khối suggestions (dòng 100–190): `{showSuggestions && suggestions.length > 0 && (<div id="search-suggestions" ...>` → `AnimatePresence` + `motion.div` cùng id/role/aria/className, thêm initial/animate/exit `y: -4` + transitions như Task 5.

- [ ] **Step 2: `own-profile-editor.tsx` — popover thay `animate-zoom-in-95` bằng framer**

Imports thêm:

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Sau khối state (dòng 65–77) thêm reducedMotion + `menuEnter`/`menuExit` (fast).
Khối dòng 315–351: `{isEditing && isAvatarMenuOpen && (<div ref={avatarMenuRef} ... animate-zoom-in-95 duration-150>` → `{isEditing && (<AnimatePresence>{isAvatarMenuOpen && (<motion.div ...>` với:

```tsx
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4, transition: menuExit }}
                    transition={menuEnter}
```

và className bỏ `animate-zoom-in-95 duration-150` (giữ nguyên phần còn lại: `absolute left-1/2 top-[calc(100%+0.75rem)] z-20 w-[220px] max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-card border border-border bg-surface-elevated py-1 overflow-hidden`). Đóng `</motion.div>)}</AnimatePresence>)}` tương ứng.

- [ ] **Step 3: `date-picker.tsx` — 2 leg**

Imports thêm:

```tsx
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { MOTION_DURATION, MOTION_EASING, getMotionTransition } from '@/constants/animations';
```

Sau `useDialogPresentation` (dòng 53) thêm reducedMotion + `popoverEnter`/`popoverExit` (fast).
`renderCalendar` root `div` (dòng 216–232) → `motion.div`, giữ nguyên ref/id/tabIndex/className/role/aria/onClick, thêm:

```tsx
      initial={useDialogPresentation ? undefined : { opacity: 0, y: -4 }}
      animate={useDialogPresentation ? undefined : { opacity: 1, y: 0 }}
      exit={useDialogPresentation ? undefined : { opacity: 0, y: -4, transition: popoverExit }}
      transition={popoverEnter}
```

Khối return (dòng 393–407) thay:

```tsx
{
  useDialogPresentation ? (
    <Dialog
      open={isOpen}
      onClose={closePicker}
      titleId={dialogTitleId}
      presentation="dialog"
      size="sm"
      className="bg-transparent shadow-none overflow-visible"
    >
      <div id={`${controlId}-dialog`}>{renderCalendar()}</div>
    </Dialog>
  ) : (
    <AnimatePresence>{isOpen && renderCalendar()}</AnimatePresence>
  );
}
```

- [ ] **Step 4: `time-picker.tsx` — 2 leg (tương tự, cờ `isMobile`)**

Imports + reducedMotion + `popoverEnter`/`popoverExit` (fast).
`renderPicker` root `div` (dòng 148–164) → `motion.div` với initial/animate/exit gated theo `isMobile`.
Khối return (dòng 283–297) → cùng cấu trúc `isMobile ? <Dialog open={isOpen} ...> : <AnimatePresence>{isOpen && renderPicker()}</AnimatePresence>`.

- [ ] **Step 5: `index.css` — xoá zoom-in-95**

Xoá dòng `--animate-zoom-in-95: zoom-in-95 0.2s ease-out forwards;` và block `@keyframes zoom-in-95 { ... }`.

- [ ] **Step 6: Verify**

Chạy: `npx prettier --write src/features/search/components/search-filters.tsx src/features/profile/components/own-profile-editor.tsx src/shared/components/ui/date-picker.tsx src/shared/components/ui/time-picker.tsx src/index.css` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep `animate-zoom-in-95` → 0 hit.
Source review: date/time picker — Escape + click-outside (desktop), focus `popoverRef` sau mở, scrollIntoView giờ/phút (time-picker) không đổi; Dialog mobile giờ luôn mounted nên exit chạy.

Suggested commit: `refactor(ui): enter-exit for suggestions, profile popover, and pickers`

---

## Task 8: Một API reduced-motion — migrate 3 file

**Files:**

- Modify: `src/shared/components/ui/pagination.tsx`
- Modify: `src/shared/components/ui/scroll-to-top.tsx`
- Modify: `src/features/stats/pages/stats-page.tsx`

**Interfaces:**

- Giữ nguyên hành vi: `behavior: 'auto' | 'smooth'` của scroll (pagination, scroll-to-top); các nhánh của stats-page.

- [ ] **Step 1: `pagination.tsx`**

Bỏ `import { useMediaQuery } from '@/shared/hooks/use-media-query';` (chỉ dùng cho dòng 13), thêm `import { useReducedMotion } from 'framer-motion';`.
Dòng 13: `const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');` → `const prefersReducedMotion = useReducedMotion() ?? false;`

- [ ] **Step 2: `scroll-to-top.tsx`**

Tương tự: bỏ `useMediaQuery` (chỉ dùng dòng 8), thêm framer; dòng 8 → `const prefersReducedMotion = useReducedMotion() ?? false;`

- [ ] **Step 3: `stats-page.tsx`**

Thêm `import { useReducedMotion } from 'framer-motion';`. **Giữ** `useMediaQuery` (dòng 84 `isSmallScreen` vẫn dùng).
Dòng 85: `const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');` → `const prefersReducedMotion = useReducedMotion() ?? false;`
Không sửa `use-movie-validation.ts:78` (matchMedia trong logic validation — ngoài phạm vi).

- [ ] **Step 4: Verify**

Chạy: `npx prettier --write src/shared/components/ui/pagination.tsx src/shared/components/ui/scroll-to-top.tsx src/features/stats/pages/stats-page.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep `useMediaQuery('(prefers-reduced-motion` → 0 hit.

Suggested commit: `refactor(ui): unify reduced-motion detection on framer hook`

---

## Task 9: Sweep duration ngoài thang + dead code poster-card + album stagger

**Files:**

- Modify: `src/features/movies/components/poster-card.tsx`
- Modify: `src/features/albums/components/album-card.tsx`
- Modify: `src/features/movies/components/add-movie/movie-form-fields.tsx`
- Modify: `src/features/movies/components/add-movie/tv-progress-section.tsx`
- Modify: `src/features/movies/components/add-movie/poster-preview.tsx`
- Modify: `src/features/calendar/components/calendar-grid.tsx`
- Modify: `src/features/albums/pages/album-detail-page.tsx`
- Modify: `src/features/search/pages/person-detail-page.tsx`
- Modify: `src/features/stats/pages/stats-page.tsx`
- Modify: `src/features/movies/pages/movie-detail-page.tsx`

- [ ] **Step 1: `poster-card.tsx` — gỡ dead `layoutId`, poster hover về 200**

- Xoá `layoutId?: string;` (dòng 36) khỏi interface; xoá `layoutId,` (dòng 61) khỏi destructure.
- Xoá `import { motion, useReducedMotion } from 'framer-motion';` (dòng 3) và dòng 64 `const reducedMotion = useReducedMotion() ?? false;`.
- Dòng 76: `<motion.article layoutId={!reducedMotion && layoutId ? layoutId : undefined}` → `<article` (chỉ giữ className); dòng 204 `</motion.article>` → `</article>`.
- Dòng 105: `transition-transform duration-300 ease-out` → `transition-transform duration-200 ease-out`.

- [ ] **Step 2: `album-card.tsx` — fan + cover về 200, stagger dùng token**

- Thêm `import { MOTION_DURATION } from '@/constants/animations';`
- Dòng 32: `transition-transform duration-300 ease-out` → `transition-transform duration-200 ease-out`
- Dòng 44: `transition={{ duration: 0.3, delay: reducedMotion ? 0 : Math.min(index * 0.05, 0.4) }}` → `transition={{ duration: MOTION_DURATION.medium, delay: reducedMotion ? 0 : Math.min(index * 0.05, 0.4) }}`
- Dòng 104: `transition-transform duration-300 ease-out` → `transition-transform duration-200 ease-out`

- [ ] **Step 3: Các chip nhỏ còn lại**

- `movie-form-fields.tsx` dòng 109/136/165: `transition-transform duration-300` → `transition-transform duration-200`
- `tv-progress-section.tsx` dòng 63: `transition-colors duration-300` → `transition-colors`; dòng 65: `transition-transform duration-300` → `transition-transform`
- `poster-preview.tsx` dòng 19: `transition-transform duration-500` → `transition-transform duration-200`
- `calendar-grid.tsx` dòng 84: `transition-colors duration-300` → `transition-colors`
- `album-detail-page.tsx` dòng 68: `transition-colors duration-300` → `transition-colors`
- `person-detail-page.tsx` dòng 60: `transition-colors duration-300` → `transition-colors`
- `stats-page.tsx` dòng 306: `transition-colors duration-300` → `transition-colors`
- `stats-page.tsx` dòng 273: `transition-transform duration-700 ease-out` → `transition-transform duration-250 ease-out` (thanh scaleX — mặt phẳng lớn, bậc slow; theo §8.8 "mọi duration ngoài thang đưa về thang")
- `movie-detail-page.tsx` dòng 227: `transition-transform duration-700 ease-out` → `transition-transform duration-250 ease-out`

- [ ] **Step 4: Verify**

Chạy: `npx prettier --write src/features/movies/components/poster-card.tsx src/features/albums/components/album-card.tsx src/features/movies/components/add-movie/movie-form-fields.tsx src/features/movies/components/add-movie/tv-progress-section.tsx src/features/movies/components/add-movie/poster-preview.tsx src/features/calendar/components/calendar-grid.tsx src/features/albums/pages/album-detail-page.tsx src/features/search/pages/person-detail-page.tsx src/features/stats/pages/stats-page.tsx src/features/movies/pages/movie-detail-page.tsx` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Grep toàn `src`: `duration-(75|100|300|500|700|1000)` → 0 hit.
Grep `layoutId` → chỉ còn `dashboard-tabs.tsx` (giữ nguyên theo spec).

Suggested commit: `refactor(ui): align off-scale durations and drop dead motion code`

---

## Task 10: DESIGN.md mục 7 + audit cuối

**Files:**

- Modify: `DESIGN.md`
- Modify (audit only): toàn `src/**`, spec.

- [ ] **Step 1: Thêm mục 7 vào `DESIGN.md` (sau mục 6)**

Nguồn: spec §9, nguyên văn:

```markdown
## 7. Motion

Ngắn, đằm, không phô diễn — chỉ transform/opacity, không parallax, không overshoot.

- Thang thời lượng: 120 / 150 / 200 / 250 ms — chỉ 4 giá trị. `transition-*` mặc định 150 ms;
  khác thì `duration-*` đúng thang.
- Curve trong `@theme`: `ease-standard` (micro, cũng là default), `ease-enter` (mở),
  `ease-exit` (đóng). Không curve nào khác.
- Engine: framer-motion chỉ cho overlay enter/exit, layout (`layoutId`), stagger, toast;
  hover/focus/micro và route enter là CSS + token.
- Overlay luôn có enter + exit: dropdown/popover/suggestions 120 ms; dialog 200 vào / 150 ra;
  sheet trượt đáy 250 vào / 200 ra; toast 200 vào / 150 ra; route chỉ enter 200 ms.
- CSS animation dùng `motion-safe:`; component framer gate qua `useReducedMotion`.
  Splash, confetti, picker, charts: giữ riêng nhưng bắt buộc gate reduced-motion.
```

- [ ] **Step 2: Audit đối chiếu spec §6 + §10**

Chạy chuỗi grep (báo cáo trước/sau):

1. `duration-(75|100|300|500|700|1000)` → 0 hit.
2. `animate-(slide-in-right|slide-down|fade-in|splash-rule|zoom-in-95)` → 0 hit.
3. `prefers-reduced-motion` → chỉ còn `src/index.css` (backstop + scrollbar) và `use-movie-validation.ts`.
4. `useMediaQuery\('\(prefers-reduced-motion` → 0 hit.
5. `OVERLAY_VARIANTS|DIALOG_VARIANTS|MOTION_DURATION\.(deliberate|standard)|MOTION_EASING\.enter` — trong framer: chỉ còn qua `getMotionTransition` + presets/toast (MOTION_EASING.enter hợp lệ trong 2 file đó); `MOTION_EASING.exit` được dùng ở dialog/toast/panels.
6. `framer-motion` imports: chỉ còn các file thuộc danh sách spec §5 (dialog, lazy chain gián tiếp, dropdown, multi-select, search-filters, own-profile-editor, navbar, toast, motion-presets, dashboard-page, dashboard-tabs, album-card, splash-screen (JS nhánh), use-random-picker...) — không còn `src/app/index.tsx`, `poster-card.tsx`.

- [ ] **Step 3: Verify tổng**

Chạy: `npx prettier --write DESIGN.md` → `npm run typecheck` → `npm run lint` → `npm run build`. Expected: pass.
Đối chiếu tay bảng §6 spec với từng lớp: dialog/sheet (Task 2), lazy exit (Task 3), route (Task 4), dropdown/multiselect (5), navbar menu (6), suggestions/popover/picker (7), toast (2).

Suggested commit: `docs: add motion contract to design guide`

---

## Acceptance (theo spec §10)

- Mọi mục §8 spec hoàn tất hoặc có lý do loại; không overlay nào lệch bảng §6.
- `grep 'duration-*'` không còn giá trị ngoài thang trong core.
- DESIGN.md có mục 7 Motion.
- Dead machinery đã xoá: 4 token animate chết, zoom-in-95, `layoutId` poster-card, `MOTION_EASING.exit` đã sống.
- Báo cáo cuối phân biệt rõ "sửa theo source" vs "chưa kiểm chứng runtime" (không mở browser theo kỷ luật).
- Commit messages theo từng task đã được duyệt tự commit (2026-10-18).
