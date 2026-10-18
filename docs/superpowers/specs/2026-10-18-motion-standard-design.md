# Chuẩn hóa motion trong CineMOB

Ngày: 18/10/2026. Trạng thái: người dùng đã duyệt thiết kế; đang lập kế hoạch triển khai. Đợt này chỉ viết tài liệu — chưa thực hiện thay đổi code nào.

## 1. Mục tiêu và phạm vi đã thống nhất

Người dùng yêu cầu kiểm tra toàn bộ motion trong app có đang theo một chuẩn UX/UI hay dùng rải rác. Kiểm kê đã hoàn tất (18/10/2026). Kết luận: **rải rác — không có contract thống nhất**, dù có mầm chuẩn từ spec 2026-10-17 (motion 7/10, 150–250 ms, không parallax/overshoot).

Bằng chứng chính từ kiểm kê:

- Bốn "động cơ" song song: framer-motion (9 file), CSS keyframe token trong `src/index.css`, Tailwind transitions (155 chỗ, 119 chỗ dùng default 150 ms không khai báo), JS đặc thù (picker, splash).
- Enter/exit bất đối xứng: `dialog.tsx` có AnimatePresence đầy đủ, nhưng `lazy-dialog.tsx:47` trả `null` khi đóng nên dialog lazy không bao giờ chạy exit; dropdown/multi-select/suggestions/navbar menu/popover mở và đóng tức thì.
- Cùng tương tác khác timing: chevron dropdown 300 ms vs multi-select 200 ms; hover poster 300 ms vs actions 200 ms; dialog 280 ms vs toast 200/140; route 200 ms inline `easeOut`.
- Dead machinery: 4 token `--animate-*` + keyframes không ai dùng (`slide-in-right`, `slide-down`, `fade-in`, `splash-rule`); `MOTION_EASING.exit` chưa từng dùng; prop `layoutId` của `poster-card.tsx` không có caller (hero poster→detail từng được kỳ vọng nhưng chưa nối).
- A11y không nhất quán: `useReducedMotion` (framer) ở 8 file, `useMediaQuery('(prefers-reduced-motion: reduce)')` ở `stats-page`, `scroll-to-top`, `pagination`; CSS có global reduce rule làm backstop.

Ba vòng grilling đã chốt (người dùng xác nhận):

1. Đợt này chỉ **báo cáo + đề xuất chuẩn**; không code. Apply là đợt riêng sau khi spec được duyệt.
2. Động cơ: quản trị chung, không có điểm đau riêng buộc phải sửa ngay.
3. Giữ nguyên stack: Tailwind v4 CSS-first + framer-motion hiện có; không thêm thư viện.
4. Triết lý restrained như spec 2026-10-17.
5. Chuẩn phân tầng: core (hover/focus, overlay, route, loading) = token + luật cứng; đặc thù (splash, confetti, picker, Recharts, avatar crop) = chỉ ràng buộc nguyên tắc.
6. Mọi overlay có enter + exit; route chỉ enter.
7. Sheet phải trượt thật từ đáy.
8. Dọn dead machinery khi apply.
9. Thang thời lượng 4 bậc; bộ easing 3 curve.
10. Luật engine có ranh giới cứng; cưỡng chế docs-only; chuẩn sống ở DESIGN.md + tài liệu này.

## 2. Ràng buộc

- Giữ React, TypeScript, Vite, Tailwind v4 CSS-first, framer-motion hiện có. Không thêm dependency.
- Tuân `DESIGN.md`: Editorial Print; motion chỉ transform/opacity; hairline; token màu hiện có.
- Không đổi hành vi nghiệp vụ, API, schema, focus management, keyboard handling của overlay.
- Đợt này chỉ viết tài liệu. Mọi thay đổi code nằm ở đợt apply riêng (§8).

## 3. Triết lý

Motion ngắn, đằm, không phô diễn — kế thừa spec 2026-10-17:

- Chỉ transform/opacity. Không parallax, không overshoot/back.out, không animation trang trí kéo dài.
- Mọi chuyển động người dùng thấy phải nằm trong thang 120–250 ms.
- Nhất quán hơn là cá tính: cùng lớp tương tác → cùng thời lượng, cùng curve, bất kể là engine nào.

## 4. Hệ thống token

### 4.1 Easing — thêm vào `@theme` trong `src/index.css`

```css
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-enter: cubic-bezier(0.16, 1, 0.3, 1);
--ease-exit: cubic-bezier(0.7, 0, 0.84, 0);
```

- `--ease-enter` / `--ease-exit` chính là giá trị `MOTION_EASING` đang có trong `src/constants/animations.ts` — đưa lên thành token CSS; `exit` từ chỗ chết trở thành curve chuẩn cho mọi đóng.
- Tailwind v4 sinh utility `ease-standard`, `ease-enter`, `ease-exit` từ namespace `--ease-*`. Default transition của Tailwind đã là `(0.4, 0, 0.2, 1)` = `ease-standard`, nên micro không cần khai báo gì thêm.

### 4.2 Thang thời lượng — luật dùng, không phải biến mới

| Bậc | Giá trị | Dùng cho |
|---|---|---|
| fast | 120 ms | enter/exit dropdown, popover, suggestions, navbar menu |
| base | 150 ms | hover/focus/active/selected, chevron, exit dialog/toast, micro |
| medium | 200 ms | enter dialog, toast enter, route enter, sheet exit, tab underline |
| slow | 250 ms | sheet enter, mặt phẳng lớn |

- `transition-*` mặc định = 150 ms (`--default-transition-duration`) — đúng bậc base, không cần khai báo. Chỉ khai báo `duration-120|200|250` khi khác base.
- Cấm mọi giá trị ngoài 4 bậc (300, 500, 75…). Hiện vi phạm: chevron dropdown `duration-300` (`dropdown.tsx:159,180`), hover poster `duration-300` (`poster-card.tsx:105`) — apply map về thang.

### 4.3 TS constants — `src/constants/animations.ts`

- `MOTION_DURATION` → `{ fast: 0.12, base: 0.15, medium: 0.2, slow: 0.25, picker: 3.15, pickerAudioTail: 1.95 }` (picker giữ nguyên — đặc thù).
- `MOTION_EASING` → `{ standard: [0.4, 0, 0.2, 1], enter: [0.16, 1, 0.3, 1], exit: [0.7, 0, 0.84, 0] }`.
- `getMotionTransition(reducedMotion)` (hiện gắn cứng 280 ms + enter curve cho cả enter lẫn exit) → helper nhận bậc thời lượng + curve, trả duration 0 khi reducedMotion. Exact shape do builder quyết định.

## 5. Luật engine

**framer-motion chỉ được dùng cho:**

1. Overlay enter/exit: `dialog.tsx` (dialog + sheet), panel `dropdown.tsx` / `multi-select-dropdown.tsx`, suggestions `search-filters.tsx`, popover visibility trong `own-profile-editor.tsx`, menu tài khoản `navbar.tsx`, toast.
2. Layout animation: `layoutId` — hiện chỉ tab underline (`dashboard-tabs.tsx`, giữ nguyên).
3. Stagger danh sách qua `motion-presets.ts` (poster grid, album, dashboard).

**CSS (Tailwind + token) cho:** mọi hover/focus/active/pressed/selected, chevron rotation, opacity reveal cục bộ, route enter, splash, confetti.

**Reduced motion:**

- Một API chuẩn: `useReducedMotion` của framer cho mọi component có nhánh JS; migrate `pagination.tsx`, `scroll-to-top.tsx`, `stats-page.tsx` khỏi `useMediaQuery('(prefers-reduced-motion: reduce)')`.
- CSS animation mới/chỉnh phải dùng `motion-safe:` (route enter, splash có thể chuyển sang `motion-safe:` thay vì nhánh JS trong đợt apply).
- Global reduce rule trong `src/index.css:189-198` giữ nguyên làm backstop.

## 6. Hành vi overlay (luật cứng)

Mọi overlay có cả enter và exit. Exit cùng bậc hoặc ngắn hơn enter một bậc.

| Lớp | Enter | Exit | Cơ chế |
|---|---|---|---|
| Dialog — backdrop | fade 200, ease-enter | fade 150, ease-exit | framer (đang có) |
| Dialog — panel | fade + y8 200, ease-enter | fade + y8 150, ease-exit | framer (đang có) |
| Sheet — panel | trượt đáy y 100%→0, 250, ease-enter | trượt xuống, 200, ease-exit | framer — variants theo `presentation` (mới) |
| Sheet — backdrop | fade 250 | fade 200 | framer |
| Dropdown / MultiSelect panel | fade + y4 hướng panel, 120, ease-enter | fade 120, ease-exit | framer + AnimatePresence (mới) |
| Suggestions (combobox search) | như dropdown — 120 | 120 | framer (mới) |
| Popover (visibility, own-profile) | fade + y4, 120 | 120 | framer (thay `animate-zoom-in-95` CSS) |
| Menu tài khoản (navbar) | fade + y4, 120 | 120 | framer (mới) |
| Toast | fade + y8, 200, ease-enter | fade + y8, 150, ease-exit | framer (đang có — đổi token) |
| Route | fade + y8, 200, ease-enter | — (chủ ý không có exit) | CSS `motion-safe` (thay motion.div) |

Ghi chú:

- Dialog hiện dùng 280 ms enter-curve cho cả hai chiều; về medium/ease-enter (vào) + base/ease-exit (ra).
- LazyDialog: sửa cấu trúc — render `Dialog` với prop `open` thật thay vì trả `null` tại `lazy-dialog.tsx:47`, để exit của Dialog chạy được. Giữ nguyên loader, retry, focus trap.
- Dropdown/multi-select panel: bọc `AnimatePresence`, giữ nguyên logic keyboard/focus/click-outside (effects theo `isOpen`, không theo mount).
- Route enter chuyển sang CSS: token `--animate-page-enter` (fade + y8, 200 ms, ease-enter, `both`) + `@keyframes page-enter`, dùng qua `motion-safe:animate-page-enter`; `key={pathname}` giữ nguyên. Xoá framer khỏi `src/app/index.tsx`.
- Sheet chỉ đổi chuyển động; hình khối/responsive giữ nguyên. `fullscreen-mobile` giữ variants dialog (ngoài phạm vi).

## 7. Phân tầng phạm vi

- **Core (token + luật cứng):** mọi hover/focus/selected, chevron, overlay enter/exit, route enter, toast, loading (theo spec loading 2026-10-18), skeleton pulse.
- **Đặc thù (không token hoá, chỉ ràng buộc nguyên tắc):** splash (`animate-splash-brand`), confetti (`animate-confetti`), random picker (ticks JS trong `use-random-picker.ts`, `MOTION_DURATION.picker`), Recharts trong `stats-page`, avatar crop, progress bar toast (linear theo duration — giữ). Nguyên tắc bắt buộc: gate reduced-motion; không chặn tương tác; không parallax/overshoot.

## 8. Danh sách thay đổi khi apply (đợt riêng, sau khi spec được duyệt)

1. **Token & constants**: thêm 3 `--ease-*` + `--animate-page-enter` vào `index.css`; cập nhật `MOTION_DURATION`/`MOTION_EASING`/helper trong `constants/animations.ts`.
2. **Dialog/sheet**: variants theo `presentation`; transitions theo §6; `dialog.tsx` bỏ `getMotionTransition` cũ.
3. **LazyDialog**: bỏ early-return — exit chạy được cho mọi dialog lazy (add-movie, album selector, member search…).
4. **Dropdown/multi-select**: AnimatePresence + fast enter/exit; unify timing chevron/trigger/option về base; chevron dùng `transition-transform`.
5. **Suggestions + popover + navbar menu**: enter/exit fast theo §6.
6. **Toast**: token medium/base + ease-enter/ease-exit (bỏ `easeOut` inline, bỏ 140 ms).
7. **Route**: `AnimatedRoutes` → CSS page-enter; xoá motion khỏi `app/index.tsx`.
8. **Micro sweep**: chevron navbar `navbar.tsx:178` `transition-colors` → `transition-transform`; hover poster 300 → medium; rà các cặp hover/focus thiếu transition (grep theo primitive); mọi `duration-*` ngoài thang đưa về thang.
9. **Reduced motion**: migrate 3 file dùng `useMediaQuery(reduced)` → `useReducedMotion`; CSS animation mới dùng `motion-safe:`.
10. **Dọn dead code**: xoá `--animate-slide-in-right`/`slide-down`/`fade-in`/`splash-rule` + keyframes; xoá `--animate-zoom-in-95` + keyframes sau khi popover chuyển framer; xoá prop `layoutId` + wiring ở `poster-card.tsx` (hero poster→detail ghi thành backlog feature riêng, không nằm trong chuẩn này).

Thứ tự đề xuất: (1) → (2)(3)(7) → (4)(5)(6) → (8)(9)(10) → verify. Mỗi nhóm chạy `npx prettier --write` + typecheck + lint + build trước khi sang nhóm sau.

## 9. Bổ sung DESIGN.md (dự thảo nguyên văn — thêm mục 7)

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

## 10. Kiểm chứng và tiêu chí hoàn tất (đợt apply)

- Mỗi nhóm thay đổi: prettier + typecheck + lint + build; rà soát source/diff cho hành vi enter/exit, focus trap, keyboard của overlay đã đụng.
- Đối chiếu bảng §6 với code từng lớp overlay; đối chiếu `grep 'duration-'` không còn giá trị ngoài thang trong core.
- Không mở trình duyệt để kiểm chứng thủ công (giữ kỷ luật của spec loading 2026-10-18); báo cáo cuối phân biệt rõ "sửa theo source" với "chưa kiểm chứng runtime".
- Stop condition: mọi mục §8 hoàn tất hoặc có lý do bị loại; không còn overlay nào enter/exit lệch bảng §6; DESIGN.md đã có mục Motion; dead machinery đã xoá.

## 11. Ngoài phạm vi

- Không thêm route exit, không sửa nội bộ Recharts, không đổi timing picker/confetti/splash (chỉ gate reduced-motion).
- Không hero transition poster→detail trong đợt này (backlog feature riêng).
- Không lint/CI enforcement (docs-only).
- Không redesign layout/hình khối nào; không đổi copy.
