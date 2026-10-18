# CineMOB — Fix theo audit Hallmark (thuần Hallmark)

**Ngày:** 2026-10-17 · **Trạng thái:** Đã duyệt — thực thi theo [plan](../plans/2026-10-17-hallmark-fixes.md) · **Branch:** `fix/hallmark-audit`
**Nguồn:** [`docs/hallmark-audit-2026-10-17.md`](../hallmark-audit-2026-10-17.md) — audit tĩnh thuần Hallmark (anti-patterns + 58 gates), kết quả `1 critical · 7 major · 12 minor`.
**Hệ tham chiếu:** `src/index.css` tokens + `DESIGN.md` (viết mới trong P2) . `design-system/cinemob/MASTER.md` **không còn là rubric** cho đợt này (theo chủ dự án) — để nguyên file, không dùng.

---

## 1. Mục tiêu & nguyên tắc

Fix toàn bộ 20 finding của audit, chia 2 pha độc lập-ship-được:

- **P1** — 1 critical + 7 major (gate 6, 7, 13, 15, 31, 34, 39, 40, 42, 48).
- **P2** — 12 minor (bugs, dọn dẹp, yêu cầu hệ tham chiếu).

Nguyên tắc:

1. **Chỉ fix trong danh sách audit** — không thêm feature, không đổi logic/state/API/routing.
2. Ngoại lệ được phép đổi bố cục: **login** và **desktop nav** (vì chính chúng là finding).
3. Mỗi finding có acceptance criteria verify được (grep / lệnh / mắt thường) — §6, §7.
4. Không thêm dependency mới. Gỡ `lottie-react` là hành động duy nhất đụng `package.json` (P1).

## 2. Quyết định đã chốt (phỏng vấn 2 vòng)

| #   | Quyết định   | Giá trị                                                                                                                                                                                         |
| --- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Phạm vi      | 1 spec, 2 pha P1 → P2, P1 ship trước                                                                                                                                                            |
| 2   | Veto         | Không veto — fix hết 20 finding                                                                                                                                                                 |
| 3   | Login        | Chia đôi kiểu bìa tạp chí: tường poster bên trái, cột form bên phải trên nền giấy; mobile: form trên, dải poster dưới                                                                           |
| 4   | Lottie       | Dựng lại splash bằng SVG/CSS + confetti bằng CSS; xoá `lottie-react` + 2 file JSON (2.3MB)                                                                                                      |
| 5   | Focus        | Rule `:focus-visible` global sẵn có (`index.css:140`); gỡ toàn bộ `focus-visible:outline-none`; outline 2px vàng hiện tức thì, border/ring vàng chỉ là lớp phụ                                  |
| 6   | Contrast     | Thêm 2 token đặc: `--color-text-muted` (≥4.5:1) và `--color-text-faint` (≥3:1, chỉ decorative/large); sweep mọi alpha `/40–/60` trên text                                                       |
| 7   | Hover        | Scale ảnh (1.03) là tín hiệu hover **duy nhất**; vòng vàng chuyển hẳn về `focus-visible`                                                                                                        |
| 8   | Confirm/Undo | Bỏ confirm ở 3 chỗ đảo ngược được (bỏ khỏi album, reset avatar, xoá phim) → dùng undo-toast sẵn có; **giữ confirm** cho xoá album                                                               |
| 9   | Verification | Mỗi pha: `npm run typecheck` + `npm run lint` + `npm run build` xanh + checklist click-through chủ dự án (dark/light, 320px, tab, reduced-motion)                                               |
| 10  | Git          | Branch mới `fix/hallmark-audit` (đã tạo); commit audit doc + spec trước, fix chia commit theo nhóm                                                                                              |
| 11  | Nav          | Masthead strip: wordmark + tagline + mục lục đánh số (01–05) dồn **cụm trái**; icons phải; bỏ hairline full-bleed → rule đôi kiểu báo trong container; giữ sticky. Mobile bottom nav không đụng |
| 12  | Light theme  | Giấy ấm 3 tầng, bảng hex dưới §3 để duyệt trong spec; không còn `#ffffff` ở đâu                                                                                                                 |
| 13  | DESIGN.md    | Viết lại thật, ~1 trang (token + luật + giọng); thay MASTER.md làm nguồn tham chiếu                                                                                                             |
| 14  | Code chết    | Sweep xoá class chết khỏi JSX; giữ token `--shadow-*` zeroed (ghi chú "no shadows by design")                                                                                                   |

## 3. Bảng token màu (duyệt kèm spec)

### Dark (giữ base, thêm 2 token chữ phụ)

| Token                          | Cũ                       | Mới       | Ghi chú contrast (computed)                                      |
| ------------------------------ | ------------------------ | --------- | ---------------------------------------------------------------- |
| `--color-background`           | `#0a0a0a`                | giữ       |                                                                  |
| `--color-surface`              | `#141414`                | giữ       |                                                                  |
| `--color-surface-elevated`     | `#1a1a1a`                | giữ       |                                                                  |
| `--color-text-secondary`       | `#8a8a85`                | giữ       | 5.7:1 trên bg, 5.0:1 trên elevated                               |
| `--color-text-muted` **(mới)** | —                        | `#9c9c97` | 6.3:1 trên elevated — dùng cho placeholder, weekday, hint text   |
| `--color-text-faint` **(mới)** | —                        | `#6e6e69` | 3.4:1 trên elevated — **chỉ** decorative/large (số mờ, rule phụ) |
| `--color-border`               | `rgb(255 255 255 / .14)` | giữ       |                                                                  |
| `--color-focus`                | `#ca8a04`                | giữ       | 6.7:1 trên bg — đạt ngưỡng ring ≥3:1                             |

### Light (giấy ấm 3 tầng — đảo quyết định "trắng thuần" cũ vì gate 7)

| Token                          | Cũ                    | Mới       | Ghi chú                                               |
| ------------------------------ | --------------------- | --------- | ----------------------------------------------------- |
| `--color-background`           | `#ffffff`             | `#f7f4ed` | giấy ngà, bão hoà thấp (không rơi vào AI-cream beige) |
| `--color-surface`              | `#ffffff`             | `#fdfbf6` |                                                       |
| `--color-surface-elevated`     | `#ffffff`             | `#fffefa` | vẫn phân tầng bằng lightness như dark                 |
| `--color-text-secondary`       | `#6b6b66`             | giữ       | 5.3:1 trên surface                                    |
| `--color-text-muted` **(mới)** | —                     | `#5f5b53` | 6.6:1 trên surface                                    |
| `--color-text-faint` **(mới)** | —                     | `#8a857c` | 3.6:1 trên surface                                    |
| `--color-border`               | `rgb(20 20 20 / .16)` | giữ       |                                                       |

Màu accent/status giữ nguyên (đã đạt contrast; `on-primary`/`on-danger` đều ≥5:1).

## 4. P1 — Chi tiết & acceptance

**P1-1. Login — phá centred-everything (gate 6) + token improvisation (gate 48)**
Bố cục chia đôi: trái = tường poster (tái dùng ảnh nền hiện có, scrim chuẩn hóa thành token nếu cần), phải = cột form canh trái trên nền giấy, brand + h1 + form đều lệch trục trái; mobile = form trên, dải poster (h-40) dưới. Xoá vignette `rgba(10,10,10,…)` inline và `saturate(0.85)`.
→ **Acceptance:** grep `login.tsx` không còn `rgba(`/`saturate`/hex inline; cột phải canh trái (không `text-center` cho cả khối); hiển thị đúng 2 theme.

**P1-2. Contrast — token chữ phụ đặc (gate 40)**
Thêm `--color-text-muted` + `--color-text-faint` (§3); sweep toàn bộ text dùng alpha `/40–/60` (`date-picker:300`, `dropdown:172`, `dropdown:200`, `multi-select:161`, `dashboard-filters:338`, các placeholder) sang token theo vai trò.
→ **Acceptance:** `grep -rn "text-.*/\\(40\\|50\\|60\\)"` trên text-classes = 0; bảng tỉ lệ contrast trong PR ≥4.5:1 (muted) / ≥3:1 (faint).

**P1-3. Lottie → CSS/SVG (gate 31 + anti-pattern)**
Splash: SVG chữ "CINEMOB" vẽ nét (stroke-dasharray) hoặc tối giản countdown line, giữ nguyên cơ chế timeout/fallback hiện có (`splash-screen.tsx`). Confetti: CSS burst (particles `@keyframes`, tôn trọng reduced-motion như hiện tại). Xoá `public/data/splashscreen.json` + `confetti.json` (2.3MB), `npm uninstall lottie-react`; kiểm tra `vite.config.ts` không còn tham chiếu 2 file này (PWA cache).
→ **Acceptance:** `grep -ri "lottie" src package.json vite.config.ts` = 0; 2 file JSON đã xoá; build không warning import; confetti reduced-motion vẫn tắt được.

**P1-4. Focus — gỡ opt-out, dùng outline global (gates 39 + 15)**
Rule global đã có (`index.css:140-143`, outline 2px `--color-focus`, offset 3px). Việc cần làm: gỡ ~22 chỗ `focus-visible:outline-none` (text-field, search, dropdown, multi-select, pagination, time/date-picker, inputs trong modals/form…) — border/ring vàng giữ làm lớp phụ, không thay outline.
→ **Acceptance:** `grep -rn "focus-visible:outline-none" src` = 0; tab qua mọi control: outline vàng hiện **tức thì**, đủ 2 theme.

**P1-5. Tràn ngang (gate 34)**
`overflow-x: clip` cho cả `html` và `body` trong `@layer base`; panel filter `dashboard-filters.tsx:142` thêm `max-w-[calc(100vw-2rem)]`.
→ **Acceptance:** grep có `overflow-x: clip`; kéo devtools 320→1920 không xuất hiện scrollbar ngang; panel filter ở 320px không tràn.

**P1-6. Desktop nav — masthead strip (gate 42)**
Cụm trái: wordmark `CineMOB` + tagline nhỏ (gợi ý "Phòng chiếu gia đình", caps 9–10px, text-faint) + mục lục đánh số "01 Thư viện · 02 Tìm phim · 03 Thống kê · 04 Album · 05 Lịch" (số `text-faint` tabular, label caps; active = text-primary + gạch vàng). Icons giữ nguyên bên phải. Bỏ `border-b` full-bleed → **rule đôi** (2 hairline cách 3px) chỉ trong container `max-w-6xl`. Sticky giữ. `mobile-bottom-nav.tsx` không đụng.
→ **Acceptance:** ảnh chụp không còn dáng "wordmark-left + links-center" (links nằm cùng cụm trái); rule đôi thấy rõ; keyboard/active state giữ nguyên; mobile ≤768px không đổi.

**P1-7. Token improvisation (gate 48)**
`theme-provider.tsx:44`: meta theme-color đọc từ `getComputedStyle(document.documentElement).getPropertyValue('--color-background')` sau khi áp theme (khớp với `index.html` mặc định dark `#0a0a0a`). `stats-page.tsx:28-35`: palette chart từ tokens (`var(--color-primary)` + neutrals) — recharts nhận CSS var trong `fill`/`stroke`. Login rgba/saturate đã xử ở P1-1.
→ **Acceptance:** grep `stats-page.tsx` không còn `#hex`; đổi theme → meta theme-color đổi đúng; không hex ngoài `index.css` (trừ brand mark Google — ghi chú exception).

**P1-8. Light theme giấy ấm (gate 7)**
Áp bảng §3 light.
→ **Acceptance:** `grep "#ffffff\|#fff\b" src/index.css` = 0; toggle light: 3 tầng giấy phân biệt được, mực đọc tốt.
→ **Note (đảo quyết định cũ):** spec 2026-10-17 trước chọn "trắng thuần (bỏ AI-cream)" — nay đảo vì gate 7; giấy ấm giữ saturation thấp (không phải beige-cream cliché).

## 5. P2 — Chi tiết & acceptance

| #     | Finding                                   | Fix                                                                                                                                                                                        | Acceptance                                                       |
| ----- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| P2-1  | Placeholder typo ×5                       | `placeholder-text-secondary` → `placeholder:text-text-secondary` (dùng muted token)                                                                                                        | grep = 0                                                         |
| P2-2  | Animate width (gate 14)                   | toast progress + TV progress (`movie-detail-page:213`) → `transform: scaleX`                                                                                                               | grep `transition-\[width\]` = 0                                  |
| P2-3  | Smooth scroll no reduced-motion (gate 27) | `use-movie-validation.ts:77` guard `matchMedia`                                                                                                                                            | code review                                                      |
| P2-4  | Hover 2 tín hiệu (gate 13)                | poster-card + album-card: ring chỉ còn `group-focus-within`; hover = scale 1.03 ảnh                                                                                                        | hover không đổi viền; keyboard vẫn có ring                       |
| P2-5  | Confirm thừa (micro tell)                 | album-detail "Bỏ khỏi album" + avatar reset + movie delete → undo-toast; giữ confirm xoá album; xoá `confirmDelete` thừa ở movie-detail                                                    | 3 chỗ mất confirm, xoá album vẫn confirm                         |
| P2-6  | `×` glyph                                 | `album-selector-modal:125` → `<X size={18} strokeWidth={1.5}/>`                                                                                                                            | icon đồng nhất                                                   |
| P2-7  | a>button                                  | `not-found-page:15-17` → Link nhận class button (hoặc Button `asChild`)                                                                                                                    | không còn `<Link><Button>`                                       |
| P2-8  | Tap target 22px                           | nút xoá `dashboard-filters:94-101` → min 32px                                                                                                                                              | đo devtools                                                      |
| P2-9  | viewport-fit                              | `index.html` viewport thêm `viewport-fit=cover`                                                                                                                                            | env() hoạt động iOS                                              |
| P2-10 | Class chết                                | Sweep: `animate-in fade-in zoom-in-95` (own-profile-editor:308) → `animate-zoom-in-95` (có sẵn trong theme); xoá mọi `shadow-card/elevated/premium/glass` no-op khỏi JSX; giữ token zeroed | grep `animate-in\|shadow-elevated\|shadow-premium` = 0 trong src |
| P2-11 | DESIGN.md + eyebrow                       | Viết `DESIGN.md` thật ~1 trang (bảng token 2 theme + luật cấm chính + giọng copy); xoá prop `eyebrow` chết ở `page-header.tsx`                                                             | file mới tồn tại, prop gỡ sạch                                   |
| P2-12 | Copy                                      | footer "© 2026 MOB" → "© 2026 CineMOB"                                                                                                                                                     | grep                                                             |

## 6. Ngoài phạm vi

- Không đụng logic/state/Firebase/routing; không i18n; không test infra mới.
- Không redesign ngoài login + desktop nav; không đụng MASTER.md (file để nguyên).
- Không fix các "pass notes" (tabular-nums, scrim, giọng copy…) — đã đạt.
- Gate 49 (two-line clickable) không verify tĩnh được → vào checklist click-through P1 (thu hẹp trình duyệt 320px ở các trang có nút dài).

## 7. Builder tự quyết (không hỏi lại)

- Chi tiết SVG splash, số lượng particle confetti, giá trị scaleX progress.
- Vị trí split login (tỉ lệ 55/45, breakpoint), nội dung tagline nav (có thể chỉnh chữ).
- Bố cục đánh số mục lục nav (cách hiển thị số, separator), map chart palette cụ thể.
- Cách sweep alpha → token từng dòng (phân vai trò muted/faint hợp lý).
- Thứ tự task trong plan; tên commit (theo convention repo: `fix(ui): …`).

## 8. Checklist duyệt (chủ dự án chạy sau mỗi pha)

1. Dark + light trên Dashboard / Login / Movie detail / một modal.
2. 320px + 375px: không scroll ngang, filter panel không tràn, không nút wrap 2 dòng.
3. Tab keyboard từ navbar → main: outline vàng hiện tức thì ở mọi control.
4. Bật reduced-motion: splash/confetti/toast không animation.
5. Đổi theme: meta theme-color (thanh trình duyệt/PWA) đổi đúng.
