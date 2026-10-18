# Audit Hallmark — CineMOB (2026-10-17) · bản thuần Hallmark

**Rubric:** CHỈ hallmark (anti-patterns + 58 slop gates). MASTER.md đã bị loại khỏi tư duy theo yêu cầu — các finding trước đây chỉ tồn tại vì MASTER đã bị bỏ. Bản này thay thế hoàn toàn bản trước.
**Phạm vi:** toàn bộ `src/` — 10 route + Login + Splash + 5 loại overlay + UI kit + token CSS. Audit tĩnh, không sửa code. Commit `5d297c2`, working tree sạch.
**Genre:** không có stamp/`design.md` hợp lệ khai genre → chấm theo gates universal + mặc định. Không có stamp nào trong repo (n/a stamp-vs-page).
**Giới hạn:** không runtime; gate 49 (two-line clickable) không verify được; light theme chỉ soi code; hover/focus đọc từ code.

---

## Kết quả: 1 critical · 7 major · 12 minor

---

## Critical

### 1. Login — centred-everything (gate 6, auto-fail)

**Where:** `src/features/auth/components/login.tsx:96-110`
**Tell:** Eyebrow/brand + h1 + lede + CTA xếp cùng một trục giữa. Gate 6 auto-fail; genre editorial cũng chỉ cho centred-narrow khi eyebrow **hoặc** CTA lệch trục — ở đây cả hai đều giữa. Audit verb: template shape → critical structural.
**Fix:** kéo eyebrow hoặc CTA lệch trục (trái/flush phải), giữ tối đa 2 phần tử centred.

---

## Major

### 2. Tương phản chữ phụ dưới ngưỡng (gate 40, universal)

**Where:** `date-picker.tsx:300` (`/60` ≈2.9:1), `dropdown.tsx:172` (`/60`), `dropdown.tsx:200` (`/50`), `multi-select-dropdown.tsx:161` (`/50`), `dashboard-filters.tsx:338` (`/40` ≈2.2:1)
**Tell:** Body text <24px cần 4.5:1 — các alpha này rớt ngưỡng trên nền #0a0a0a/#141414.
**Fix:** chữ phụ dùng màu đặc đạt ≥4.5:1, bỏ alpha cho text nhỏ.

### 3. Lottie shortcut (anti-pattern Major + gate 31)

**Where:** `public/data/splashscreen.json` **1.111.722 B**, `public/data/confetti.json` **1.214.806 B**; `splash-screen.tsx`, `random-picker-modal.tsx`
**Tell:** Lottie là "last resort, not the default"; 50–500KB đã là tax, đây gấp đôi–ba lần ngưỡng trên, splash tải mỗi lần mở app.
**Fix:** splash bằng CSS/SVG (fallback tĩnh đã có sẵn), confetti bằng CSS; nếu giữ thì nén <150KB và lazy-load.

### 4. Focus ring dựng bằng border + fade-in (gates 39 + 15, universal)

**Where:** `text-field.tsx:52`, `search.tsx:50`, `multi-select-dropdown.tsx:162/203/227`, `pagination.tsx:119`, `time-picker.tsx:259`, `dropdown.tsx:157/200`, `date-picker.tsx:368`, `add-movie-modal.tsx:223/251/273/361`, `movie-form-fields.tsx:185/249`, `album-selector-modal.tsx:153`, `album-section.tsx:81`, `search-filters.tsx:97`, `own-profile-editor.tsx:413/433`, `member-search-modal.tsx:65`, `avatar-crop-modal.tsx:88/133`, `album-detail-page.tsx:134`
**Tell:** Focus = đổi `border`/`ring` thay vì `outline: 2px solid var(--color-focus)` (gate 39), và các indicator này `transition-colors` → fade-in khi focus (gate 15). Ring 1px vàng /20–/50 quá nhạt cho 3:1.
**Fix:** một class focus thống nhất — `outline: 2px solid <token>; outline-offset: 1px`, không transition property này.

### 5. Tràn ngang: thiếu `overflow-x: clip` + panel 320px (gate 34, hard requirement)

**Where:** root `index.css` (không có `overflow-x: clip` trên html/body); `dashboard-filters.tsx:142` (`min-w-[320px]` > 288px vùng chứa tại 320 → tràn ~16px)
**Tell:** Gate 34 là hard requirement trên mọi trang, không chờ quan sát mới fix; panel là vi phạm cụ thể.
**Fix:** thêm `overflow-x: clip` cả html + body; panel `max-w-[calc(100vw-2rem)]`.

### 6. Nav fingerprint (gate 42)

**Where:** `src/app/components/navbar.tsx`
**Tell:** Wordmark trái + inline text links + icon phải + full viewport + sticky + hairline border-b — đúng AI nav fingerprint (chỉ khác nền tối). N1a không được justify (không phải 2 destinations, routing table không cho).
**Fix:** luân chuyển sang pattern N khác (editorial → masthead kiểu N6), hoặc nêu rationale 1 dòng nếu chấp nhận có chủ đích.

### 7. Token improvisation (gate 48)

**Where:** `theme-provider.tsx:44` (meta `#09090b`/`#fafafa` — lệch cả token lẫn `index.html`), `stats-page.tsx:28-35` (palette chart 8 hex hardcode), `login.tsx:94` (radial `rgba(10,10,10,…)` + `saturate(0.85)` inline)
**Tell:** Mọi màu/font phải qua token; hex/rgba ngoài token block = freestyle.
**Fix:** meta theme-color derive từ token; chart palette = `var(--color-*)`; vignette (nếu giữ) thành token.

### 8. Pure white — nền light `#ffffff` (gate 7 + anti-pattern "Pure black, pure white")

**Where:** `src/index.css:12`
**Tell:** `#ffffff` làm surface/base. Không genre override (không phải modern-minimal có khai báo). Light chỉ là theme phụ → major; nếu light là first-class thì critical.
**Fix:** về giấy ấm/off-white (#fafafa–#FAF9F5).

---

## Minor

9. **Placeholder mất màu** — typo class `placeholder-text-secondary` (thiếu `:`) ×5: `album-selector-modal:153`, `add-movie-modal:361`, `movie-form-fields:249`, `dropdown:200`, `multi-select:227` → placeholder rớt về màu mặc định trình duyệt (dưới 4.5:1 trên nền tối). Fix: `placeholder:text-text-secondary`.
10. **Animate `width` (gate 14)** — toast progress `toast-container.tsx:~78`; `movie-detail-page.tsx:213` (`transition-[width] duration-700`). Fix: `transform: scaleX`.
11. **Smooth scroll không guard reduced-motion (gate 27)** — `use-movie-validation.ts:77`. Fix: `matchMedia('(prefers-reduced-motion: reduce)')`.
12. **Hai tín hiệu hover cùng lúc (gate 13)** — `poster-card.tsx:79-88`, `album-card.tsx:83-89` (ring vàng + ảnh scale 1.03). Fix: chọn một (giữ scale hoặc giữ ring).
13. **Confirm dialog cho hành động đảo ngược được (microinteraction tell)** — `albums-page:64`, `album-detail-page:223`, `movie-detail-page:50`, `use-avatar-crop:305`. Trong khi `use-delete-movie.ts:36` đã làm đúng (Undo toast) → copy pattern đó, bỏ confirm.
14. **Ký tự `×` thay icon lucide** — `album-selector-modal.tsx:125` (đối chiếu: mọi nút đóng khác dùng `<X>`). Fix: `<X size={18} strokeWidth={1.5}/>`.
15. **`<Link><Button/></Link>`** (a > button, HTML sai, double-focus) — `not-found-page.tsx:15-17`. Fix: Link nhận class button hoặc Button `asChild`.
16. **Nút xoá trong ô search ~22px** — `dashboard-filters.tsx:94-101` (dưới 24px WCAG 2.5.8). Fix: p-2 (≥32px).
17. **Thiếu `viewport-fit=cover`** nhưng dùng `env(safe-area-inset-bottom)` → env() = 0 trên iOS — `index.html:5` vs `layout.tsx:30`.
18. **Class chết** — `animate-in fade-in zoom-in-95` (chưa cài tailwindcss-animate) `own-profile-editor:308`; 13 site `shadow-*` + `shadow-elevated` render no-op (token zeroed).
19. **"Hệ thiết kế" không enforce được** — `DESIGN.md` (root) là bản sao `AGENTS.md`, không phải design system; prop `eyebrow` của `page-header.tsx` không nơi nào dùng. Audit verb design.md check: không có hệ thật → không thể chấm theme-drift; nên viết 1 `DESIGN.md` thật hoặc xoá file giả.
20. **Copy** — footer "© 2026 MOB" → "CineMOB" — `footer.tsx:17`.

---

## Pass notes (đã đạt)

- Gates 1/2/3/5/10/12/21/30/33/46/47/49/50/55: font display riêng (không Inter/Roboto); không gradient text; không 3-col feature; không side-stripe; không `transition-all`; không bouncy easing; không emoji; icon thuần lucide; không metric bịa (KPI/dữ liệu thật); không re-drawn chrome; không 100vw; Tailwind grid dùng `minmax(0,1fr)`; all-caps Anton `leading-none` = 1.0 → đạt sàn gate 55;
- Gate 13 hover: đã tính finding #12 (trước đây bị MASTER "che");
- Undo toast cho delete-movie (`use-delete-movie.ts:36`) — đúng pattern hallmark;
- Tabular-nums có đủ; reduced-motion có ở dialog/toast/picker/splash; aria/alt phủ khá; không stamp nào → variety gate trivially pass (chưa có output hallmark trước).

**Tổng: 1 critical · 7 major · 12 minor.**
