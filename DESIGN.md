---
name: CineMOB — Editorial Print
description: PWA theo dõi phim và TV show với giao diện editorial print, nền tối mặc định và accent vàng duy nhất.
colors:
  primary: '#ca8a04'
  secondary: '#8a8a85'
  surface: '#0a0a0a'
  on-surface: '#f5f5f2'
  error: '#f87171'
extended:
  colors:
    background: '#0a0a0a'
    surface-card: '#141414'
    surface-elevated: '#1a1a1a'
    primary-hover: '#dfa60b'
    on-primary: '#0a0a0a'
    text-primary: '#f5f5f2'
    text-secondary: '#8a8a85'
    text-muted: '#9c9c97'
    text-faint: '#6e6e69'
    border: 'rgb(255 255 255 / 0.14)'
    border-default: 'rgb(255 255 255 / 0.07)'
    focus: '#ca8a04'
    success: '#4ade80'
    on-success: '#09090b'
    warning: '#fbbf24'
    danger: '#f87171'
    on-danger: '#09090b'
    info: '#38bdf8'
    skeleton: 'color-mix(in srgb, var(--color-text-primary) 8%, var(--color-surface))'
themes:
  light:
    colors:
      primary: '#8f6400'
      secondary: '#6b6b66'
      surface: '#f7f4ed'
      on-surface: '#0a0a0a'
      error: '#b91c1c'
      background: '#f7f4ed'
      surface-card: '#fdfbf6'
      surface-elevated: '#fffefa'
      primary-hover: '#7a5600'
      on-primary: '#fffefa'
      text-primary: '#0a0a0a'
      text-secondary: '#6b6b66'
      text-muted: '#5f5b53'
      text-faint: '#8a857c'
      border: 'rgb(20 20 20 / 0.16)'
      border-default: 'rgb(20 20 20 / 0.07)'
      focus: '#8f6400'
      success: '#15803d'
      on-success: '#fffefa'
      warning: '#9a5d06'
      danger: '#b91c1c'
      on-danger: '#fffefa'
      info: '#0369a1'
typography:
  display-xl:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.025em
  display-lg:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.025em
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
  label-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 11px
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: 0.1em
    textTransform: uppercase
  micro-caps:
    fontFamily: Be Vietnam Pro
    fontSize: 9px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0.06em
    textTransform: uppercase
rounded:
  md: 8px
  poster: 4px
  full: 9999px
motion:
  durations:
    fast: 120ms
    base: 150ms
    medium: 200ms
    slow: 250ms
  easing:
    standard: 'cubic-bezier(0.4, 0, 0.2, 1)'
    enter: 'cubic-bezier(0.16, 1, 0.3, 1)'
    exit: 'cubic-bezier(0.7, 0, 0.84, 0)'
elevation:
  strategy: hairline
  shadow: none
layout:
  container: 1152px
  navHeight: 56px
  breakpoints:
    sm: 640px
    md: 768px
    lg: 1024px
---

# Design System

## Overview

CineMOB là PWA tiếng Việt để theo dõi phim, TV show, lịch phát sóng và thống kê cá nhân. Giao diện đọc như một trang báo in: chữ display đậm, hairline thay bóng, một accent vàng duy nhất.

- **Dark là mặc định**, light là giấy ấm; cả hai theme đều là công dân hạng nhất.
- **Anton** cho display, số liệu lớn và wordmark; **Be Vietnam Pro** cho mọi nội dung còn lại.
- **Không bóng mềm, không gradient trang trí, không bo tròn lớn.**
- Mobile-first, PWA, tiếng Việt.

`DESIGN.md` là **chuẩn đích**. `src/index.css` là implementation hiện tại; khi hai bên lệch nhau, code được sửa theo file này. Mọi token, luật và pattern dưới đây là hợp đồng cho màn hình mới.

## Colors

| Token                    | Dark                     | Light                 | Vai trò                            |
| ------------------------ | ------------------------ | --------------------- | ---------------------------------- |
| `surface`                | `#0a0a0a`                | `#f7f4ed`             | nền trang                          |
| `surface-card`           | `#141414`                | `#fdfbf6`             | panel, card                        |
| `surface-elevated`       | `#1a1a1a`                | `#fffefa`             | dialog, dropdown, toast            |
| `primary`                | `#ca8a04`                | `#8f6400`             | accent duy nhất: CTA, link, active |
| `primary-hover`          | `#dfa60b`                | `#7a5600`             | hover của primary                  |
| `on-primary`             | `#0a0a0a`                | `#fffefa`             | chữ/icon trên nền primary đặc      |
| `secondary`              | `#8a8a85`                | `#6b6b66`             | UI phụ, chip, hành động phụ        |
| `text-primary`           | `#f5f5f2`                | `#0a0a0a`             | mực chính                          |
| `text-secondary`         | `#8a8a85`                | `#6b6b66`             | chữ phụ ≥4.5:1                     |
| `text-muted`             | `#9c9c97`                | `#5f5b53`             | placeholder, hint ≥4.5:1           |
| `text-faint`             | `#6e6e69`                | `#8a857c`             | decorative/large ≥3:1              |
| `border`                 | `rgb(255 255 255 / .14)` | `rgb(20 20 20 / .16)` | viền control                       |
| `border-default`         | `rgb(255 255 255 / .07)` | `rgb(20 20 20 / .07)` | hairline phân cách                 |
| `focus`                  | `#ca8a04`                | `#8f6400`             | outline focus                      |
| `success` / `on-success` | `#4ade80` / `#09090b`    | `#15803d` / `#fffefa` | trạng thái thành công              |
| `warning`                | `#fbbf24`                | `#9a5d06`             | cảnh báo, icon trạng thái          |
| `danger` / `on-danger`   | `#f87171` / `#09090b`    | `#b91c1c` / `#fffefa` | lỗi, hành động phá huỷ             |
| `info`                   | `#38bdf8`                | `#0369a1`             | thông tin                          |
| `skeleton`               | computed                 | computed              | nền skeleton                       |

**Mapping với code:** `surface` = `--color-background`, `surface-card` = `--color-surface`, `on-surface` = `--color-text-primary`, `error` = `--color-danger`. `background` là alias của `surface`.

**Luật màu:**

- `primary` là accent duy nhất. Không thêm màu nhấn thứ hai.
- Status color chỉ dùng cho trạng thái, không dùng trang trí.
- `on-primary` bắt buộc cho chữ/icon trên nền `primary` đặc; trắng trên vàng chỉ đạt 2.94:1 ở dark.
- `text-faint` chỉ cho chữ lớn hoặc decorative; không dùng cho nội dung cần đọc.
- Không dùng alpha `/40`–`/60` trên chữ trên nền app; chữ trên ảnh/scrim được dùng white alpha theo thang hiện có (`white/55` cho meta).
- Không dùng pure white/black làm nền. Dark nền `#0a0a0a`; light là giấy ấm, không phải trắng.
- Scrim ảnh, overlay dialog, ghost hover và núm switch được phép dùng black/white thô; ngoài các ngữ cảnh đó, mọi màu đi qua token.
- Không hex/rgba trong `.tsx`; ngoại lệ: logo Google ở nút đăng nhập và fallback trong SVG symbol.
- `color-scheme` và `<meta name="theme-color">` phải khớp nền của theme đang bật.

## Typography

Font load từ Google Fonts trong `index.html`: **Anton** (400) và **Be Vietnam Pro** (400/500/600/700/800), `display=swap`.

| Style        | Font           | Size | Weight | Line-height | Tracking | Dùng cho                                |
| ------------ | -------------- | ---- | ------ | ----------- | -------- | --------------------------------------- |
| `display-xl` | Anton          | 48px | 400    | 1.0         | .025em   | detail title, stat                      |
| `display-lg` | Anton          | 36px | 400    | 1.05        | .025em   | page header, login, splash              |
| `title-lg`   | Be Vietnam Pro | 20px | 700    | 1.3         | 0        | alert/modal, feature heading            |
| `title-md`   | Be Vietnam Pro | 18px | 700    | 1.35        | 0        | section/card, empty/error               |
| `body`       | Be Vietnam Pro | 14px | 500    | 1.5         | 0        | body mặc định, input, button lg         |
| `body-sm`    | Be Vietnam Pro | 12px | 500    | 1.5         | 0        | metadata, toast, button md/sm           |
| `label-caps` | Be Vietnam Pro | 11px | 600    | 1.2         | .1em     | field label, section label, nav desktop |
| `micro-caps` | Be Vietnam Pro | 9px  | 700    | 1.2         | .06em    | chip, poster meta, nav mobile           |

**Responsive display:**

- `display-xl`: detail title 30 → 36 → 48px; stat 48 → 60px.
- `display-lg`: page header 24 → 30 → 36px.
- Không tạo token riêng cho từng breakpoint; dùng đúng style và scale theo bảng trên.

**Luật chữ:**

- Anton chỉ cho display, số liệu lớn và wordmark; không dùng cho body.
- Caps label chỉ có hai style: `label-caps` 11px và `micro-caps` 9px. Không dùng 10px, 11.5px hay 15px.
- Ngoại lệ data-viz: chart axis dùng 10px/700/50%; không dùng cho text UI.
- 404 dùng utility `text-display-404` 72 → 96px; splash wordmark dùng Anton 36 → 48px, không tính vào type scale.
- `micro-caps` mặc định uppercase; metadata số/ngày được phép `normal-case`.
- Weight có thể tăng 600/700 cho emphasis (button, poster title); không đổi size.
- Số liệu trong stat, bảng, rating dùng `tabular-nums`.
- Heading dài dùng `text-wrap: balance`; đoạn dài dùng `text-wrap: pretty` nếu cần.
- Nội dung dài phải có `truncate`, `line-clamp-*` hoặc `break-words`; flex child chứa text cần `min-w-0`.
- Placeholder và trạng thái tải kết thúc bằng `…`, không dùng `...`.
- Uppercase vẫn giữ đầy đủ dấu tiếng Việt.

## Spacing & Layout

- **Base 4px.** Thang dùng: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64`.
- Container `1152px` (`max-w-6xl`); gutter `16px` mobile → `24px` từ `md`.
- Page padding `16px` mobile → `24px` từ `md`; section cách nhau `20px` → `24px`.
- Navbar cao `56px`; bottom nav cao `56px`; nội dung chừa `56px + safe-area` ở đáy.
- Breakpoint: `sm` 640, `md` 768, `lg` 1024. Mobile-first; navbar desktop và footer chỉ hiện từ `md`.
- Arbitrary spacing chỉ cho safe-area, hairline quang học hoặc phần trăm; không dùng để chỉnh layout.
- Micro-spacing 2/6/10px chỉ để căn icon/chữ; layout vẫn theo thang 4/8/12/16/20/24/32/40/48/64.
- Pagination/toolbar compact dùng 36/40px; form control giữ 44px; icon-button 32/40/48px.
- `overscroll-behavior: contain` trong dialog/sheet/dropdown; `touch-action: manipulation` cho control.
- Không để scroll ngang; container hẹp dùng `min-w-0` và truncate.
- Filter, tab, pagination và panel mở phải phản ánh vào URL để deep-link và back/forward hoạt động.

## Radius & Elevation

- Control/card/dialog: `8px`; poster/chip: `4px`; avatar/switch/pill: `full`.
- Không dùng `6px`; không trộn radius vuông và bo trong cùng một view.
- **Không bóng mềm.** Mọi elevation dùng `border`, `border-default` hoặc `surface-elevated`.
- `--shadow-*` giữ giá trị `none` để utility không vỡ.
- Núm switch dùng border, không dùng shadow.
- Dialog overlay `black/72`; panel không shadow, không border ngoài.
- Scrim ảnh là gradient chức năng để chữ đọc được; không dùng gradient trang trí.

## Components

### Button & IconButton

- Button: `primary`, `secondary`, `ghost`, `danger`; size `sm`/`md` dùng `body-sm` 12px, `lg` dùng `body` 14px; radius 8; `font-semibold`.
- Primary dùng `bg-primary` + `text-on-primary`; secondary là outline; ghost chỉ hover overlay; danger chỉ cho hành động phá huỷ.
- Loading: spinner 16px tại chỗ, `aria-busy`, khoá hành động phụ thuộc; không thay đổi kích thước nút.
- IconButton: 32/40/48px; mọi icon-only phải có `aria-label`.
- Icon decorative dùng `aria-hidden="true"`; icon dẫn đầu/trailing nằm trong span aria-hidden.
- Hover/active/focus phải rõ hơn trạng thái nghỉ; focus dùng outline toàn cục.
- `<button>` cho hành động, `<a>`/`<Link>` cho điều hướng; không dùng `div` có `onClick`.

### TextField & SearchField

- TextField cao `44px`; mặc định underline trên nền trang, `boxed` trong modal/elevated.
- SearchField underline cao `48px`; boxed cao `44px`; nút xóa có `aria-label`.
- Label `label-caps`; placeholder kết thúc bằng `…`; lỗi hiện inline dưới field.
- Input có `id`, label `htmlFor`, `name`, `autocomplete`, `type`/`inputmode` đúng.
- Lỗi: `aria-invalid`, `aria-describedby`; submit focus field lỗi đầu tiên.
- Không chặn paste; không dùng placeholder thay label.
- Underline field được miễn outline toàn cục và thay bằng border-bottom + focus color; boxed field vẫn giữ outline.

### Chip

- `micro-caps`, radius 4, padding ngang 6px/dọc 2px.
- Tone `gold`, `success`, `neutral`; neutral chỉ đứng trên ảnh.
- Chip không phải nút; nếu bấm được, dùng button với hit area đủ lớn.

### Dropdown & MultiSelect

- Trigger cao `44px`, radius 8, `border-default`; panel `surface-elevated` + `border`.
- Panel enter/exit 120ms; đóng khi Escape, click ngoài; focus trả về trigger.
- Keyboard: Arrow, Home/End, Enter/Space, Escape.
- Multi-select tag dùng radius 4 và `body-sm`; không dùng radius 6.
- Option là hit target đầy đủ; không để dead zone giữa label và checkbox.

### Dialog, Sheet & Alert

- Overlay `black/72`; panel `surface-elevated`, radius 8, max-height `90dvh`.
- Presentation: `dialog`, `sheet`, `fullscreen-mobile`; size `sm` → `5xl`.
- Header/footer hairline; title `title-lg` hoặc `title-md`; body `body`.
- Dialog enter 200ms / exit 150ms; sheet 250/200; route enter 200ms.
- Focus trap, `aria-modal`, Escape đóng, focus trả về trigger; `overscroll-behavior: contain`.
- Alert chỉ cho hành động phá huỷ thật; focus mặc định vào hành động an toàn; confirm danger dùng `danger`.

### Toast

- `surface-elevated`, radius 8, border, padding 14/16px, text `body-sm` hoặc `body`.
- Mobile: bottom center trên bottom nav; desktop: bottom right; max-width `md`.
- Mặc định 3s; undo 7s; progress bar 2px theo status color.
- `role="status"` + `aria-live="polite"` cho success/info; `role="alert"` + assertive cho warning/error.
- Message nói kết quả cụ thể; action label là động từ.

### Skeleton & Loading

- Skeleton dùng token `skeleton`, radius 8, `motion-safe:animate-pulse`; không dùng phần trăm giả.
- Skeleton phải khớp aspect, grid, gap và breakpoint của nội dung thật; `SkeletonCard` khớp PosterCard.
- Spinner đặt tại nút/vùng thao tác; label trạng thái bên cạnh; `aria-busy`.
- Loading status nằm ngoài vùng `aria-busy`; `role="status"`, `aria-live="polite"`.
- Lỗi đọc khác dữ liệu rỗng; lỗi có retry; pending kết thúc khi lỗi hoặc huỷ.
- Refresh giữ nội dung hợp lệ và báo cập nhật cục bộ; không hiện kết quả cũ như kết quả mới.

### PosterCard

- Card duy nhất của app: poster 2:3, radius 4, border, scrim đáy `black/85 → transparent`.
- Title `body-sm` 12px/700 trắng, meta `micro-caps` 9px trắng/55, progress 2px `primary`.
- Check selected nằm trên overlay `primary/25`, giữ trắng; ngoại lệ media, không áp dụng cho nền primary đặc.
- Hover chỉ border + zoom 1.03; không lift, không shadow.
- Actions: mobile luôn hiện, desktop hiện khi hover/focus; mỗi action có `aria-label`.
- Ảnh lazy-load, có width/height, placeholder fallback; alt rỗng khi nút bao đã có `aria-label`.

### Empty & Error

- Icon tile 56px, border, radius 8; title `title-md`; body `body`; action primary.
- Empty state không dùng chung copy với lỗi; lỗi có retry, empty có CTA.
- Copy lỗi nêu bước tiếp theo, không dùng "Có lỗi xảy ra" chung chung.

## Iconography & Imagery

- Lucide; `strokeWidth` chuẩn **1.5** cho mọi icon; active nav dùng 2. Icon hiện không set phải được chuẩn hoá về 1.5.
- Ngoại lệ: logo symbol `strokeWidth` 3; picker chevron 2.5.
- Size: 9/12 cho chip, 14/16/18/20 cho control, 24 cho alert, 28 cho empty state.
- Icon-only button có `aria-label`; icon decorative có `aria-hidden`.
- Poster 2:3, `object-cover`, radius 4, lazy-load, width/height; ảnh above-fold dùng `fetchpriority="high"`.
- Avatar `full`; wordmark dùng Anton, chữ "MOB" màu `primary`.
- Charts dùng palette derive từ token: `primary` + mix `text-secondary`/`surface`; grid 5%, axis 10px/700/50% (ngoại lệ data-viz), bar `primary`, animation 1s có gate reduced-motion.

## Motion

- Thang duy nhất: **120 / 150 / 200 / 250ms**. Mặc định 150ms; overlay enter 200ms, exit 150ms.
- Easing: `standard` (mặc định), `enter` (mở), `exit` (đóng). Không dùng curve khác.
- Dropdown/popover 120ms; dialog 200/150; sheet 250/200; toast 200/150; route enter 200ms.
- Chỉ animate `transform` và `opacity`; không `transition: all`, không parallax, không overshoot.
- Framer Motion chỉ cho overlay enter/exit, layout, stagger, toast; hover/focus/micro và route enter dùng CSS.
- Animation phải interruptible; autoplay loop dài cần điều khiển dừng.
- `prefers-reduced-motion`: CSS global tắt animation/transition; framer gate qua `useReducedMotion`; splash, confetti, picker giữ riêng nhưng bắt buộc gate.

## Loading & Feedback

- Chưa có nội dung, biết trước bố cục: skeleton khớp hình học thật.
- Đang xử lý hành động: spinner và nhãn tại vùng thao tác; khoá đúng hành động phụ thuộc.
- Đổi user/query/month: không hiện kết quả cũ như kết quả mới.
- Lỗi đọc khác dữ liệu rỗng; lỗi có retry; pending không kéo dài sau lỗi hoặc huỷ.
- Khởi động kết thúc trạng thái chờ khi xác thực xong; không ép thời lượng splash.
- Tải nội dung trang giữ thanh điều hướng; không thay layout bằng spinner toàn trang.

## Copy Voice

- Tiếng Việt, câu ngắn, xưng "bạn"; không emoji.
- Nút là động từ: "Thêm phim", "Hoàn tác", "Thử lại".
- Toast/tooltip nói kết quả cụ thể: "Đã xoá X", "Gỡ phim khỏi album thất bại".
- Error message nêu nguyên nhân ngắn và bước tiếp theo; không dùng câu chung chung.
- Dùng `…` thay `...`; dùng dấu ngoặc kép cong khi trích dẫn.
- Ngày/giờ/số dùng `Intl.DateTimeFormat` / `Intl.NumberFormat`; không hardcode format.
- `★` chỉ dùng trong nhãn khoảng rating; ngoài ra dùng icon Star hoặc chữ "sao".
- Nhãn uppercase vẫn giữ dấu tiếng Việt.

## Accessibility

- WCAG AA cho text; `text-faint` chỉ cho large/decorative.
- Focus: outline 2px `focus`, offset 3px, hiện tức thì; không `outline-none` nếu không có thay thế.
- Chỉ underline field được thay outline bằng border-bottom; ring/border chỉ là lớp phụ.
- Dùng semantic HTML: `button`, `a`, `label`, `table`; heading đúng cấp; có skip link.
- Icon-only có `aria-label`; ảnh có alt; icon decorative `aria-hidden`.
- Form: label clickable, `name`, `autocomplete`, `type`/`inputmode`, lỗi inline, focus lỗi đầu tiên.
- Async: `aria-live` cho toast/validation; `aria-busy` cho vùng đang tải.
- Dialog: `aria-modal`, focus trap, Escape, trả focus; sticky header không che focus.
- Touch target tối thiểu 24px; hành động chính trên mobile hướng tới 44px; mở rộng hit area nếu visual nhỏ.
- Tôn trọng reduced-motion, safe-area, `overscroll-behavior`, `touch-action`.
- Status không chỉ dựa vào màu; luôn có icon hoặc text.
- URL phản ánh state; link hỗ trợ Cmd/Ctrl-click; không dùng `div` điều hướng.

## Do's & Don'ts

- **Do** dùng hairline và `surface-elevated` để tạo tầng; **don't** dùng bóng mềm.
- **Do** giữ `primary` là accent duy nhất; **don't** thêm màu nhấn thứ hai.
- **Do** dùng `on-primary` trên nền primary đặc; **don't** dùng trắng trên vàng ở dark.
- **Do** dùng `text-secondary`/`text-muted` theo vai trò; **don't** dùng alpha `/40`–`/60` trên chữ.
- **Do** giữ outline focus 2px offset 3px; **don't** `outline-none` ngoại trừ underline field.
- **Do** dùng radius 8/4/full; **don't** dùng 6px hoặc trộn radius trong cùng view.
- **Do** dùng thang motion 120/150/200/250; **don't** dùng duration tùy ý.
- **Do** dùng skeleton khớp layout; **don't** dùng phần trăm giả hoặc spinner toàn trang.
- **Do** dùng undo-toast 7s cho hành động đảo ngược; **don't** mở confirm dialog cho mọi thứ.
- **Do** viết copy cụ thể, tiếng Việt, xưng "bạn"; **don't** dùng emoji hoặc câu lỗi chung chung.
- **Do** dùng token cho mọi màu; **don't** viết hex/rgba trong `.tsx` (trừ logo Google và fallback SVG).
- **Do** giữ URL phản ánh filter/tab/pagination; **don't** giấu state chỉ trong component.

## Implementation Notes

- **Nguồn chuẩn:** `DESIGN.md` là normative. `src/index.css` (`@theme` + `.dark`) là baseline implementation; khi lệch, sửa code theo file này.
- **Token:** thêm/sửa token phải cập nhật đồng thời YAML, bảng Colors và `src/index.css`.
- **Font:** load trong `index.html`; không import font trong component.
- **UI kit:** `src/shared/components/ui` (barrel `index.ts`); feedback ở `src/shared/components/feedback`; layout ở `src/shared/components/layout`.
- **Type utility:** `text-display-xl`, `text-display-lg`, `text-title-lg`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`, `text-micro-caps`; modifier `text-display-stat` (48 → 60) và `text-display-404` (72 → 96). Code không dùng `text-[…px]` hoặc `text-xs/sm/base/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl/9xl` cho size; ngoại lệ chart axis 10px.
- **Card chuẩn:** `src/features/movies/components/poster-card.tsx`; mọi card phim dùng pattern này.
- **Theme:** `src/app/providers/theme-provider.tsx`, default `dark`, lưu `vite-ui-theme`; toggle chỉ dark/light.
- **Chart:** `src/features/stats/pages/stats-page.tsx`, palette derive từ token; không hardcode màu series.
- **Validation:** không có CLI; kiểm tra thủ công YAML, bảng token và `src/index.css` trước khi merge.
