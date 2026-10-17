# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** CineMOB
**Generated:** 2026-10-17 15:39:06 (tool) · **Curated:** 2026-10-17 (user-approved decisions applied)
**Category:** Editorial Print — "Diện mạo in ấn" (Mubi / Criterion lineage), dark-first
**Design Dials:** Variance 5/10 | Motion 7/10 (editorial execution) | Density 5/10

---

## Quyết định đã duyệt (2026-10-17)

- **Hướng cuối:** "Diện mạo in ấn / Editorial Print" — flat tuyệt đối, typography là nhân vật chính, poster là nguồn màu duy nhất. *(Lịch sử: B Liquid Glass → A Rạp chiếu đêm OLED → Editorial, theo phản hồi "bỏ chất AI slop / bóng mờ".)*
- **Font:** Anton (display — TOÀN BỘ CHỮ HOA, kiểu áp phích; có subset tiếng Việt ✓ đã verify) + Be Vietnam Pro (body, labels caps).
- **Palette:** nền đen sâu phẳng `#0A0A0A`, chữ trắng ấm `#F5F5F2`, hairline phân tách, gold `#CA8A04` phẳng (không gradient) dùng tiết chế như mực dấu. **Không** navy, **không** khí quyển.
- **Cấm tuyệt đối (chống AI-slop):** gradient trang trí, glow, spotlight, vignette, bóng mềm bồng bềnh, bo pill 999px mọi thứ, serif-italic + gold trên navy. Nâng tầng = hairline, không phải bóng.
- **Theme:** dark mặc định; light = trắng thuần ấm.
- **Motion:** 7/10 nhưng thi hành kiểu editorial — gạch chân trượt, stagger grid 40–60ms fade phẳng, hover poster: viền gold 1px + art scale 1.03, hero transition (layoutId) giữ nguyên. Tôn trọng `prefers-reduced-motion`.
- **Nền tảng:** mobile + desktop ngang nhau. **IA:** chi tiết phim thành trang riêng `/movie/:id`; dashboard phân cấp bằng typography.
- Stack giữ nguyên: Tailwind v4 + framer-motion + react-router; thêm đúng 1 font mới (Anton).

---

## Global Rules

### Color Palette (dark-first)

| Role | Dark (mặc định) | Light trắng | CSS Variable |
|------|-----------------|-----------------|--------------|
| Background | `#0A0A0A` | `#FFFFFF` | `--color-background` |
| Foreground | `#F5F5F2` | `#141414` | `--color-foreground` |
| Surface (dùng tiết chế) | `#141414` | `#FFFFFF` | `--color-surface` |
| Muted Foreground | `#8A8A85` | `#6B6B66` | `--color-muted-foreground` |
| Hairline mạnh | `rgba(255,255,255,0.14)` | `rgba(0,0,0,0.16)` | `--color-line` |
| Hairline nhẹ | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.07)` | `--color-line-soft` |
| Accent (mực vàng, phẳng) | `#CA8A04` | `#8F6400` | `--color-accent` |
| On Accent | `#0A0A0A` | `#FFFFFF` | `--color-on-accent` |
| Accent hover | `#DFA60B` | `#7A5600` | `--color-accent-hover` |
| Ring/Focus | `#CA8A04` | `#8F6400` | `--color-ring` |
| Destructive | `#DC2626` | `#DC2626` | `--color-destructive` |
| On Destructive | `#FFFFFF` | `#FFFFFF` | `--color-on-destructive` |

**Color Notes:** Gold chỉ dùng cho: CTA nền đặc, tab/gạch chân active, điểm số, progress, tag stamp. Mọi màu khác neutral. Màu sắc trong UI chỉ đến từ poster (ảnh TMDB) — chrome không có màu. Contrast: gold trên `#0A0A0A` ≈ 6.4:1 ✓; `#8A8A85` trên `#0A0A0A` ≈ 5.6:1 ✓ (chỉ dùng cho meta/label, không cho nội dung chính).

### Typography

- **Display:** Anton — CHỈ CHỮ HOA, một weight. Hero số (72–84px), tiêu đề phim (40–56px), số liệu lớn. `line-height .95`, `letter-spacing .015em`.
- **Body:** Be Vietnam Pro 400, 14px, line-height ≥ 1.6.
- **Label/meta:** Be Vietnam Pro 600, 10–12px, UPPERCASE, `letter-spacing .08–.1em`, màu muted.
- **Google Fonts:** [Anton + Be Vietnam Pro](https://fonts.googleapis.com/css2?family=Anton&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap) *(cả hai có subset tiếng Việt — verify 2026-10-17)*

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Anton&family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
```

### Surface & Separation (thay cho shadow/glass)

Nâng cấp thị giác bằng **đường kẻ, không phải bóng**:

```css
:root {
  --line: rgba(255,255,255,0.14);
  --line-soft: rgba(255,255,255,0.07);
  --radius: 8px;      /* buttons, inputs, tiles */
  --radius-sm: 4px;   /* posters, tags, thumbs */
}

.section { border-top: 1px solid var(--line); }   /* phân tách section */
.row-sep   { border-bottom: 1px solid var(--line-soft); }  /* phân tách dòng */
```

- **Cấm:** `box-shadow` mềm, `backdrop-filter`, gradient nhiều màu làm nền, `text-shadow` trang trí. Ngoại lệ duy nhất: bóng khung cửa sổ/thiết bị ngoài app (product shot).
- Bo góc nhỏ: 8px control, 4px poster/thumb. Không pill tròn 999px.
- Hover = đổi màu/viền/gạch chân (150–200ms), không lift/bóng.
- `prefers-reduced-motion`: tắt stagger/parallax/hero transition, render trạng thái cuối.

### Spacing Variables

*Density: 5/10 — Standard nhưng lưới chặt*

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon gaps |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Page gutter (desktop) |
| `--space-2xl` | `48px` | Hero padding |

### Shadow Depths

**Không dùng trong app.** Elevation: modal/popover = nền đặc `#141414` + hairline `--line` + radius 8px. Dropdown tương tự.

---

## Component Specs

### Buttons

```css
.btn-primary {           /* mực vàng phẳng — chữ TỐI */
  background: var(--color-accent);
  color: var(--color-on-accent);
  padding: 11px 18px;
  border-radius: var(--radius);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: .08em;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background 180ms ease, border-color 180ms ease;
}
.btn-primary:hover { background: var(--color-accent-hover); }

.btn-outline {           /* viền hairline, hover viền vàng */
  background: transparent;
  border: 1px solid var(--line);
  color: var(--color-foreground);
  /* cùng padding/radius/chữ hoa như primary */
}
.btn-outline:hover { border-color: var(--color-accent); color: var(--color-accent); }

.btn-ghost { background: transparent; border: none; color: var(--color-muted-foreground); }
.btn-ghost:hover { color: var(--color-foreground); }
```

### Tabs / Nav (chữ + gạch chân, không pill)

```css
.tab {
  position: relative;
  font-size: 12px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
  color: var(--color-muted-foreground);
  background: none; border: none; padding: 14px; cursor: pointer;
}
.tab:hover  { color: var(--color-foreground); }
.tab.is-active { color: var(--color-foreground); }
.tab.is-active::after {
  content: ''; position: absolute; left: 14px; right: 14px; bottom: -1px;
  height: 2px; background: var(--color-accent);
}
```

### Posters

```css
.poster {
  position: relative; aspect-ratio: 2 / 3;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line);
  overflow: hidden; cursor: pointer;
  outline: 1px solid transparent; outline-offset: -1px;
  transition: outline-color 180ms ease;
}
.poster:hover { outline-color: var(--color-accent); }  /* không lift, không bóng */
.poster:hover .poster-art { transform: scale(1.03); }  /* art bên trong frame, không lệch layout */
```

### Inputs

```css
.input {
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  font-size: 16px;
  color: var(--color-foreground);
}
.input:focus {
  border-color: var(--color-ring);
  outline: none;
  box-shadow: none;
}
```

### Modals

```css
.modal-overlay { background: rgba(0, 0, 0, 0.72); }

.modal {
  background: var(--color-surface);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 32px;
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Áp dụng cho app (Media/Entertainment Dashboard, editorial):**

- **Typography là hero:** con số lớn (số phim, điểm số) và tiêu đề Anton đặt ngay trên nền phẳng, KHÔNG bọc trong card. Section phân tách bằng hairline + label caps.
- **Poster là nguồn màu duy nhất:** lưới poster sát nhau, viền hairline; mọi chrome neutral.
- **Dữ liệu kiểu catalog:** trạng thái = tab caps + gạch chân vàng + số lượng; progress = thanh 2px vàng trên track hairline.
- **Tag stamp:** viền 1px gold + chữ gold caps 9.5px (dùng cho nhãn "MỚI" v.v.), không fill.

### Motion (editorial, 7/10 — framer-motion)

- Hero transition: poster bay từ grid lên trang chi tiết (`layoutId`).
- Grid stagger: fade phẳng 200ms, cách 40–60ms, easing `easeOut` (không overshoot/back.out — editorial dùng chuyển động dứt khoát).
- Tab underline: trượt layoutId giữa các tab.
- Parallax: KHÔNG (đã cắt theo hướng flat).
- `prefers-reduced-motion`: tắt tất cả, render trạng thái cuối.

---

## Anti-Patterns (Do NOT Use) — checklist chống AI-slop

- ❌ Gradient trang trí (radial "khí quyển", blob, spotlight, vignette)
- ❌ Glow, text-shadow phát sáng, đèn/neon hiệu ứng
- ❌ Bóng mềm float trên card/nav/poster
- ❌ Bo tròn pill 999px cho mọi thứ; bo góc > 12px
- ❌ Serif italic + gold trên nền navy (template "premium AI")
- ❌ **Viền vàng bo tròn dạng chip (outline chip)** — `border-primary/*` + `rounded` + padding trên nền tối. Thay bằng: chữ vàng trần không hộp, hoặc fill đặc `bg-primary text-on-primary` cho trạng thái chọn, hoặc hairline neutral. (Đã lặp 2 lần: chip "202 phim", chip "Hôm nay" — pattern phải tuyệt chủng.)
- ❌ Emoji làm icon; icon không đồng bộ (chỉ Lucide, stroke 1.5)
- ❌ Chữ trắng trên nền gold; muted-foreground cho nội dung chính
- ❌ Instant state changes (dùng transition 150–200ms)
- ❌ Invisible focus states
- ❌ Màu màu mè trong chrome (chrome = đen/trắng/hairline; màu chỉ ở poster + gold accent)
- ❌ Input hộp trên nền trang — **input trên nền trang luôn gạch-đáy** (variant underline); hộp chỉ trong bề mặt elevated (modal/dropdown). Tìm kiếm = component `Search`, cấm inline.
- ❌ Khối stat hộp-viền-icon-tile — stat dùng component `Stat`: số trần + label + vạch phân cách.

---

## Pre-Delivery Checklist

- [ ] Không một gradient/glow/bóng mềm nào trong app UI
- [ ] Mọi phân cấp đến từ: cỡ chữ, chữ hoa, hairline, khoảng trắng
- [ ] Icons: Lucide stroke 1.5, không emoji
- [ ] Hover: đổi màu/viền/gạch chân, không lift/bóng
- [ ] Dark contrast ≥ 4.5:1 (gold 6.4:1 ✓, muted 5.6:1 ✓ — kiểm tra cả pairing mới)
- [ ] Light (giấy) contrast ≥ 4.5:1
- [ ] Focus states visible; `cursor-pointer` trên mọi clickable
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No horizontal scroll; no content hidden behind fixed bars
- [ ] Poster là khối màu duy nhất trên màn; chrome đen/trắng
