---
version: 1
name: CineMOB — Editorial Print
description: PWA theo dõi phim và TV show. Giao diện đọc như trang báo in; nền tối mặc định, một accent vàng duy nhất, phân tầng bằng hairline thay bóng.
colors:
  background: '#0a0a0a'
  surface: '#141414'
  surface-elevated: '#1a1a1a'
  primary: '#ca8a04'
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
  skeleton: 'color-mix(in srgb, {colors.text-primary} 8%, {colors.surface})'
themes:
  light:
    colors:
      background: '#f7f4ed'
      surface: '#fdfbf6'
      surface-elevated: '#fffefa'
      primary: '#8f6400'
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
      skeleton: 'color-mix(in srgb, {colors.text-primary} 8%, {colors.surface})'
typography:
  display-brand:
    fontFamily: Anton
    fontSize: 36px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.02em
  display-xl:
    fontFamily: Anton
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.025em
  display-lg:
    fontFamily: Anton
    fontSize: 24px
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: 0.025em
  display-md:
    fontFamily: Anton
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: 0.02em
  display-stat:
    fontFamily: Anton
    fontSize: 48px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0.025em
  display-404:
    fontFamily: Anton
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1
    letterSpacing: 0
  title-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  title-md:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: 0
  body:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Be Vietnam Pro
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: 0
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
  control: 8px
  card: 8px
  dialog: 8px
  poster: 4px
  full: 9999px
spacing:
  micro-1: 2px
  micro-2: 6px
  micro-3: 10px
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 20px
  xl: 24px
  xxl: 32px
  xxxl: 40px
  huge: 48px
  section: 64px
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
    typography: '{typography.body-sm}'
    rounded: '{rounded.control}'
    border: transparent
  button-secondary:
    backgroundColor: transparent
    textColor: '{colors.text-primary}'
    border: '{colors.border}'
    rounded: '{rounded.control}'
  button-ghost:
    backgroundColor: transparent
    textColor: '{colors.text-primary}'
    border: transparent
    rounded: '{rounded.control}'
  button-danger:
    backgroundColor: '{colors.danger}'
    textColor: '{colors.on-danger}'
    rounded: '{rounded.control}'
    border: transparent
  button-size-sm:
    padding: 6px 12px
    typography: '{typography.body-sm}'
    gap: '{spacing.micro-2}'
  button-size-md:
    padding: 10px 16px
    typography: '{typography.body-sm}'
    gap: '{spacing.xs}'
  button-size-lg:
    padding: 12px 24px
    typography: '{typography.body}'
    gap: '{spacing.xs}'
  icon-button-sm:
    width: 32px
    height: 32px
    rounded: '{rounded.control}'
  icon-button-md:
    width: 40px
    height: 40px
    rounded: '{rounded.control}'
  icon-button-lg:
    width: 48px
    height: 48px
    rounded: '{rounded.card}'
  text-field:
    height: 44px
    typography: '{typography.body}'
    textColor: '{colors.text-primary}'
    placeholderColor: '{colors.text-secondary}'
    rounded: '{rounded.control}'
    borderBottom: '{colors.border}'
  search-field-underline:
    height: 48px
    padding: 0 36px 0 32px
    typography: '{typography.body}'
    borderBottom: '{colors.border}'
  search-field-boxed:
    height: 44px
    padding: 0 36px 0 40px
    typography: '{typography.body}'
    rounded: '{rounded.control}'
    border: '{colors.border}'
  chip:
    padding: 2px 6px
    gap: '{spacing.xxs}'
    rounded: '{rounded.poster}'
    typography: '{typography.micro-caps}'
  chip-gold:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.on-primary}'
  chip-success:
    backgroundColor: '{colors.success}'
    textColor: '{colors.on-success}'
  chip-neutral:
    backgroundColor: 'rgb(0 0 0 / 0.6)'
    textColor: '#ffffff'
    border: 'rgb(255 255 255 / 0.1)'
  chip-muted:
    backgroundColor: '{colors.surface-elevated}'
    textColor: '{colors.text-secondary}'
    border: '{colors.border}'
  dropdown-trigger:
    height: 44px
    padding: 0 16px
    rounded: '{rounded.card}'
    border: '{colors.border-default}'
    typography: '{typography.body}'
  dropdown-panel:
    backgroundColor: '{colors.surface-elevated}'
    border: '{colors.border}'
    rounded: '{rounded.card}'
    padding: '{spacing.xs}'
    maxHeight: 200px
  dialog-overlay:
    backgroundColor: 'rgb(0 0 0 / 0.72)'
  dialog-panel:
    backgroundColor: '{colors.surface-elevated}'
    rounded: '{rounded.dialog}'
    maxHeight: 90dvh
  dialog-header:
    padding: 12px 16px
    borderBottom: '{colors.border}'
  dialog-footer:
    padding: 12px 16px
    borderTop: '{colors.border}'
    safeArea: bottom
  toast:
    backgroundColor: '{colors.surface-elevated}'
    border: '{colors.border}'
    rounded: '{rounded.card}'
    padding: 14px
    typography: '{typography.body-sm}'
  skeleton:
    backgroundColor: '{colors.skeleton}'
    rounded: '{rounded.control}'
  poster-card:
    aspectRatio: '2 / 3'
    rounded: '{rounded.poster}'
    border: '{colors.border}'
  poster-scrim:
    gradient: 'linear-gradient(to top, rgb(0 0 0 / 0.85), rgb(0 0 0 / 0.25), transparent)'
  page-header:
    paddingBottom: 20px
    borderBottom: '{colors.border}'
    typography: '{typography.display-lg}'
  section-header:
    typography: '{typography.label-caps}'
    textColor: '{colors.text-secondary}'
  pagination-button:
    minWidth: 40px
    height: 40px
    padding: 0 12px
    rounded: '{rounded.control}'
    typography: '{typography.body-sm}'
  stat:
    typography: '{typography.display-stat}'
    textColor: '{colors.text-primary}'
  switch-track:
    width: 40px
    height: 24px
    rounded: '{rounded.full}'
  switch-thumb:
    width: 20px
    height: 20px
    rounded: '{rounded.full}'
    backgroundColor: '#ffffff'
  bottom-nav:
    height: 56px
    backgroundColor: '{colors.background}'
    borderTop: '{colors.border}'
---

## Overview

CineMOB là PWA tiếng Việt theo dõi phim, TV show, lịch phát sóng và thống kê cá nhân. Giao diện đọc như trang báo in: chữ display đậm, hairline thay bóng, một accent vàng duy nhất.

**Key Characteristics:**

- **Dark là mặc định**; light là giấy ấm, không phải trắng.
- **Anton** cho display, số liệu lớn và wordmark; **Be Vietnam Pro** cho mọi nội dung còn lại.
- **Không bóng mềm, không gradient trang trí, không bo tròn lớn.**
- Mobile-first, PWA, tiếng Việt.
- Một card phim duy nhất: poster 2:3, chữ phủ trên scrim.

`DESIGN.md` là chuẩn đích. Mọi token, luật và pattern dưới đây là hợp đồng cho màn hình mới; code lệch thì sửa code.

## Colors

| Token              | Dark                     | Light                 | Vai trò                            |
| ------------------ | ------------------------ | --------------------- | ---------------------------------- |
| `background`       | `#0a0a0a`                | `#f7f4ed`             | nền trang                          |
| `surface`          | `#141414`                | `#fdfbf6`             | panel, card                        |
| `surface-elevated` | `#1a1a1a`                | `#fffefa`             | dialog, dropdown, toast            |
| `primary`          | `#ca8a04`                | `#8f6400`             | accent duy nhất: CTA, link, active |
| `primary-hover`    | `#dfa60b`                | `#7a5600`             | hover của primary                  |
| `on-primary`       | `#0a0a0a`                | `#fffefa`             | chữ/icon trên nền primary đặc      |
| `text-primary`     | `#f5f5f2`                | `#0a0a0a`             | mực chính                          |
| `text-secondary`   | `#8a8a85`                | `#6b6b66`             | chữ phụ, đạt AA                    |
| `text-muted`       | `#9c9c97`                | `#5f5b53`             | placeholder, hint, đạt AA          |
| `text-faint`       | `#6e6e69`                | `#8a857c`             | chữ lớn hoặc trang trí, đạt 3:1    |
| `border`           | `rgb(255 255 255 / .14)` | `rgb(20 20 20 / .16)` | viền control                       |
| `border-default`   | `rgb(255 255 255 / .07)` | `rgb(20 20 20 / .07)` | hairline phân cách                 |
| `focus`            | `#ca8a04`                | `#8f6400`             | outline focus                      |
| `success`          | `#4ade80`                | `#15803d`             | trạng thái thành công              |
| `on-success`       | `#09090b`                | `#fffefa`             | chữ trên nền success               |
| `warning`          | `#fbbf24`                | `#9a5d06`             | cảnh báo, icon trạng thái          |
| `danger`           | `#f87171`                | `#b91c1c`             | lỗi, hành động phá huỷ             |
| `on-danger`        | `#09090b`                | `#fffefa`             | chữ trên nền danger                |
| `info`             | `#38bdf8`                | `#0369a1`             | thông tin                          |
| `skeleton`         | computed                 | computed              | nền skeleton                       |

**Luật màu:**

- `{colors.primary}` là accent duy nhất. Không thêm màu nhấn thứ hai.
- Status color chỉ cho trạng thái, không dùng trang trí.
- Dùng `{colors.on-primary}` cho chữ/icon trên nền primary đặc; trắng trên vàng chỉ đạt 2.94:1.
- `{colors.text-faint}` chỉ cho chữ lớn hoặc trang trí; không dùng cho nội dung cần đọc.
- Không dùng alpha `/40`–`/60` trên chữ đặt trên nền app. Chữ trên ảnh dùng white alpha: `white/55` cho meta.
- Không dùng trắng/đen thuần làm nền. Dark dùng `{colors.background}`; light dùng giấy ấm.
- Black/white thô chỉ cho scrim ảnh, overlay dialog, ghost hover và núm switch. Ngoài các ngữ cảnh đó, mọi màu đi qua token.
- Không viết hex/rgba trong `.tsx`. Ngoại lệ duy nhất: logo Google ở nút đăng nhập và fallback trong SVG symbol.
- `color-scheme` và `<meta name="theme-color">` khớp nền của theme đang bật.

## Typography

Font load từ Google Fonts trong `index.html`: **Anton** (400) và **Be Vietnam Pro** (400/500/600/700/800), `display=swap`.

| Style           | Font           | Mobile | ≥640 | ≥768 | Weight | Line-height | Tracking | Dùng cho                                |
| --------------- | -------------- | ------ | ---- | ---- | ------ | ----------- | -------- | --------------------------------------- |
| `display-brand` | Anton          | 36px   | 48px | —    | 400    | 1.0         | .02em    | wordmark splash                         |
| `display-xl`    | Anton          | 30px   | 36px | 48px | 400    | 1.0         | .025em   | detail title, stat lớn                  |
| `display-lg`    | Anton          | 24px   | 30px | 36px | 400    | 1.05        | .025em   | page header, login, splash              |
| `display-md`    | Anton          | 20px   | —    | —    | 400    | 1.2         | .02em    | navbar, footer, display title           |
| `display-stat`  | Anton          | 48px   | 60px | —    | 400    | 1.0         | .025em   | số liệu trong Stat                      |
| `display-404`   | Anton          | 72px   | —    | 96px | 400    | 1.0         | 0        | trang 404                               |
| `title-lg`      | Be Vietnam Pro | 20px   | —    | —    | 700    | 1.3         | 0        | alert/modal, feature heading            |
| `title-md`      | Be Vietnam Pro | 18px   | —    | —    | 700    | 1.35        | 0        | section/card, empty/error               |
| `body`          | Be Vietnam Pro | 14px   | —    | —    | 500    | 1.5         | 0        | body, input, button lg                  |
| `body-sm`       | Be Vietnam Pro | 12px   | —    | —    | 500    | 1.5         | 0        | metadata, toast, button sm/md           |
| `label-caps`    | Be Vietnam Pro | 11px   | —    | —    | 600    | 1.2         | .1em     | field label, section label, nav desktop |
| `micro-caps`    | Be Vietnam Pro | 9px    | —    | —    | 700    | 1.2         | .06em    | chip, poster meta, nav mobile           |

**Luật chữ:**

- Anton chỉ cho display, số liệu lớn và wordmark; không dùng cho body.
- Caps label chỉ có hai style: `{typography.label-caps}` 11px và `{typography.micro-caps}` 9px. Không dùng 10px, 11.5px hay 15px.
- `label-caps` và `micro-caps` mang `text-transform: uppercase`: chỉ dùng cho nhãn ngắn. Metadata số/ngày, tên phim, tên người và câu thông báo phải giữ nguyên case.
- Uppercase vẫn giữ đầy đủ dấu tiếng Việt.
- Weight có thể tăng 600/700 cho emphasis; không đổi size.
- Số liệu trong stat, bảng, rating dùng `tabular-nums`.
- Heading dài dùng `text-wrap: balance`; đoạn dài dùng `text-wrap: pretty`.
- Nội dung dài phải có `truncate`, `line-clamp-*` hoặc `break-words`; flex child chứa text cần `min-w-0`.
- Placeholder và trạng thái tải kết thúc bằng `…`, không dùng `...`.
- Ngoại lệ data-viz: chart axis dùng 10px/700/50%; không dùng cho text UI.
- Size chữ chỉ đến từ bảng trên. Không dùng thang mặc định của Tailwind cho chữ.

## Layout

- **Base unit 4px.** Thang: `{spacing.xxs}` 4 · `{spacing.xs}` 8 · `{spacing.sm}` 12 · `{spacing.md}` 16 · `{spacing.lg}` 20 · `{spacing.xl}` 24 · `{spacing.xxl}` 32 · `{spacing.xxxl}` 40 · `{spacing.huge}` 48 · `{spacing.section}` 64.
- Micro-spacing 2/6/10px chỉ để căn icon và chữ; layout luôn theo thang 4px.
- Container `1152px`; gutter `{spacing.md}` mobile, `{spacing.xl}` từ `md`.
- Page padding `{spacing.md}` mobile, `{spacing.xl}` từ `md`; section cách nhau `{spacing.lg}` mobile, `{spacing.xl}` từ `md`.
- Navbar desktop cao `56px`; bottom nav cao `56px`; nội dung chừa `56px + safe-area` ở đáy.
- Breakpoint: `sm` 640, `md` 768, `lg` 1024. Mobile-first.
- Control height: 32/36/40 tuỳ mật độ; form control 44px; icon-button 32/40/48.
- Không dùng arbitrary spacing cho layout. Ngoại lệ: safe-area, hairline quang học, phần trăm.
- Không để scroll ngang; container hẹp dùng `min-w-0` và truncate.
- Filter, tab, pagination và panel mở phản ánh vào URL để deep-link và back/forward hoạt động.
- `overscroll-behavior: contain` trong dialog, sheet, dropdown; `touch-action: manipulation` cho control.

## Elevation & Depth

| Level | Treatment                                       | Dùng cho                |
| ----- | ----------------------------------------------- | ----------------------- |
| 0     | `{colors.background}`                           | nền trang               |
| 1     | `1px {colors.border}`                           | card, control, input    |
| 2     | `1px {colors.border-default}`                   | vạch chia trong panel   |
| 3     | `{colors.surface-elevated}` + `{colors.border}` | dialog, dropdown, toast |
| 4     | `{component.dialog-overlay}` scrim 0.72         | nền sau dialog          |

- Không bóng mềm. Mọi elevation dùng hairline hoặc `{colors.surface-elevated}`.
- `--shadow-*` giữ giá trị none để utility không vỡ.
- Núm switch dùng border, không dùng shadow.
- Panel dialog không shadow, không border ngoài.
- Scrim ảnh là gradient chức năng để chữ đọc được; không dùng gradient trang trí.

## Shapes

| Token               | Value  | Dùng cho                   |
| ------------------- | ------ | -------------------------- |
| `{rounded.control}` | 8px    | button, input, control nhỏ |
| `{rounded.card}`    | 8px    | card, panel, dropdown      |
| `{rounded.dialog}`  | 8px    | dialog, sheet              |
| `{rounded.poster}`  | 4px    | poster, chip               |
| `{rounded.full}`    | 9999px | avatar, switch, pill       |

- Không dùng 6px.
- Không trộn radius vuông và bo trong cùng một view.

## Components

Mỗi entry trong `components` là hợp đồng; mọi giá trị màu, chữ và bo góc tham chiếu token, không viết lại số. Câu hiển thị theo pattern trong `COPY.md`; component spec chỉ ghi slot (title/body/action).

### Button & IconButton

- Variant: `{component.button-primary}`, `{component.button-secondary}`, `{component.button-ghost}`, `{component.button-danger}`.
- Size: `{component.button-size-sm}`, `{component.button-size-md}`, `{component.button-size-lg}`; font-weight 600.
- Ghost chỉ hover overlay; danger chỉ cho hành động phá huỷ.
- Loading: spinner 16px tại chỗ, `aria-busy`, khoá hành động phụ thuộc; không đổi kích thước nút.
- IconButton: `{component.icon-button-sm}`, `{component.icon-button-md}`, `{component.icon-button-lg}`; mọi icon-only phải có `aria-label`.
- Icon decorative dùng `aria-hidden="true"`; icon dẫn đầu/trailing nằm trong span aria-hidden.
- Hover/active/focus phải rõ hơn trạng thái nghỉ; focus dùng outline toàn cục.
- `<button>` cho hành động, `<a>`/`<Link>` cho điều hướng; không dùng `div` có `onClick`.

### TextField & SearchField

- TextField: `{component.text-field}`; mặc định underline trên nền trang, `boxed` trong modal/elevated.
- SearchField underline: `{component.search-field-underline}`; boxed: `{component.search-field-boxed}`.
- Label dùng `{typography.label-caps}`; lỗi hiện inline dưới field bằng `{colors.danger}`.
- Input có `id`, label `htmlFor`, `name`, `autocomplete`, `type`/`inputmode` đúng.
- Lỗi: `aria-invalid`, `aria-describedby`; submit focus field lỗi đầu tiên.
- Không chặn paste; không dùng placeholder thay label.
- Underline field miễn outline toàn cục, thay bằng border-bottom + `{colors.focus}`; boxed field giữ outline.
- Nút xóa search có `aria-label`.

### Chip

- Base: `{component.chip}`.
- Tone: `{component.chip-gold}`, `{component.chip-success}`, `{component.chip-neutral}`, `{component.chip-muted}`.
- `neutral` chỉ đứng trên ảnh; `gold`/`success`/`muted` đứng trên nền app.
- Chip không phải nút. Nếu bấm được, dùng button với hit area đủ lớn.

### Dropdown & MultiSelect

- Trigger: `{component.dropdown-trigger}`; panel: `{component.dropdown-panel}`.
- Panel enter/exit 120ms; đóng khi Escape, click ngoài; focus trả về trigger.
- Keyboard: Arrow, Home/End, Enter/Space, Escape.
- Multi-select tag dùng `{rounded.poster}` và `{typography.body-sm}`.
- Option là hit target đầy đủ; không để dead zone giữa label và checkbox.

### Dialog, Sheet & Alert

- Overlay: `{component.dialog-overlay}`; panel: `{component.dialog-panel}`.
- Presentation: `dialog`, `sheet`, `fullscreen-mobile`; size `sm` → `5xl`.
- Header `{component.dialog-header}`, footer `{component.dialog-footer}`; title `{typography.title-lg}` hoặc `{typography.title-md}`; body `{typography.body}`.
- Dialog enter 200ms / exit 150ms; sheet 250/200.
- Focus trap, `aria-modal`, Escape đóng, focus trả về trigger; `overscroll-behavior: contain`.
- Alert chỉ cho hành động phá huỷ thật; focus mặc định vào hành động an toàn; confirm danger dùng `{colors.danger}`.

### Add/Edit Movie Modal

- Một dialog `size 4xl` + `fullscreen-mobile` dùng chung cho thêm/sửa phim; body 2 cột: trái **thông tin phim**, phải **luồng đánh giá**, ngăn cách bằng hairline `{colors.border-default}`; dồn dọc dưới `md` kèm hairline ngang.
- Cột trái: mặc định là tóm tắt read-only (poster 2:3, tiêu đề, meta dạng hàng nhãn–giá trị, thể loại bằng `Chip muted`, nội dung `line-clamp-4`); một nút ghost swap sang form thông tin và swap lại. Thêm thủ công hiển thị form trực tiếp (field xếp 1 cột), không có tóm tắt.
- Cột phải: trạng thái → đánh giá → cảm nhận → ngày/giờ xem → tiến độ series → album; watchlist ẩn khối đánh giá. Mọi luồng mở vào tóm tắt, không đổi theo entry point.
- Skeleton khi tải TMDB dựng theo hình 2 cột trên; không render form trước khi có dữ liệu. Câu chữ của modal nằm ở `COPY.md`.

### Toast

- Base: `{component.toast}`.
- Mobile: bottom center trên bottom nav; desktop: bottom right; max-width `md`.
- Mặc định 3s; undo 7s; progress bar 2px theo status color.
- `role="status"` + `aria-live="polite"` cho success/info; `role="alert"` + assertive cho warning/error.

### Skeleton & Loading

- Skeleton: `{component.skeleton}`, `motion-safe:animate-pulse`; không dùng phần trăm giả.
- Skeleton khớp aspect, grid, gap và breakpoint của nội dung thật; `SkeletonCard` khớp PosterCard qua `badges` 0–3.
- Số skeleton bằng page size, hoặc số item render lần đầu nếu màn không phân trang.
- Chỉ hiện skeleton sau 150ms và giữ tối thiểu 300ms một khi đã hiện; không crossfade.
- Placeholder nhỏ nằm trong chrome đã render (số trên tab, value trong `Stat`, section trong modal) hiện ngay.
- Skeleton chỉ mô phỏng phần luôn có; box/section phụ thuộc data không dựng sẵn.
- Chrome luôn render: title tĩnh, back, actions; field phụ thuộc data hiện skeleton tại chỗ, không thay title bằng "Đang tải…".
- Skeleton chỉ dùng khi vùng chưa có data cho context đang xem; revalidate cùng context giữ nội dung cũ + `aria-busy`; đổi uid/query/month/id hiện skeleton cho context mới.
- Spinner chỉ ở nút/hành động, autocomplete, route chunk, lazy dialog, splash; vùng list/card có shape dùng skeleton.
- Spinner đặt tại nút/vùng thao tác; label trạng thái bên cạnh; `aria-busy`.
- Loading status nằm ngoài vùng `aria-busy`; `role="status"`, `aria-live="polite"`.
- Lỗi đọc khác dữ liệu rỗng; lỗi có retry; pending kết thúc khi lỗi hoặc huỷ.
- Refresh giữ nội dung hợp lệ và báo cập nhật cục bộ; không hiện kết quả cũ như kết quả mới.

### PosterCard

- Card phim duy nhất của app: `{component.poster-card}`, scrim `{component.poster-scrim}`.
- Title `{typography.body-sm}` weight 700 trắng; meta `{typography.micro-caps}` `white/55`; progress 2px `{colors.primary}`.
- Selected: overlay `{colors.primary}`/25, giữ check trắng; ngoại lệ media, không áp dụng cho nền primary đặc.
- Hover chỉ border + zoom 1.03; không lift, không shadow.
- Actions: mobile luôn hiện, desktop hiện khi hover/focus; mỗi action có `aria-label`.
- Ảnh lazy-load, có width/height, placeholder fallback; alt rỗng khi nút bao đã có `aria-label`.

### PageHeader & SectionHeader

- PageHeader: `{component.page-header}`; back qua IconButton `secondary` size md; title truncate.
- SectionHeader: `{component.section-header}`; một cấp duy nhất, không xếp tầng.

### Pagination

- Button: `{component.pagination-button}`; `aria-current="page"` cho trang đang mở.
- Mobile: input số trang + tổng; desktop: dãy số có rút gọn `•••`.
- `totalPages ≤ 1` thì không render.

### Stat & Switch

- Stat: `{component.stat}`; label `{typography.label-caps}` `{colors.text-secondary}`; số `tabular-nums`.
- Switch: track `{component.switch-track}`, thumb `{component.switch-thumb}`; `role="switch"`, `aria-checked`; hit area mở rộng 8px.

### Bottom Navigation

- `{component.bottom-nav}`; hiện dưới `md`; active dùng `{colors.primary}` + icon `strokeWidth` 2 + vạch 2px trên đỉnh.
- Mỗi item cao tối thiểu `56px`, nhãn `{typography.micro-caps}`.

### Empty & Error

- Icon tile 56px, border, `{rounded.card}`; title `{typography.title-md}`; body `{typography.body}`; action primary.
- Empty và error là hai trạng thái riêng; lỗi có retry, empty có CTA.

### Icon & Wordmark

- Lucide; `strokeWidth` **1.5** cho mọi icon; active nav dùng 2.
- Ngoại lệ: logo symbol `strokeWidth` 3; picker chevron 2.5.
- Size: 9/12 cho chip, 14/16/18/20 cho control, 24 cho alert, 28 cho empty state.
- Avatar `{rounded.full}`; wordmark dùng Anton, chữ "MOB" màu `{colors.primary}`.

## Do's and Don'ts

- **Do** dùng hairline và `{colors.surface-elevated}` để tạo tầng; **don't** dùng bóng mềm.
- **Do** giữ `{colors.primary}` là accent duy nhất; **don't** thêm màu nhấn thứ hai.
- **Do** dùng `{colors.on-primary}` trên nền primary đặc; **don't** dùng trắng trên vàng ở dark.
- **Do** dùng `{colors.text-secondary}`/`{colors.text-muted}` theo vai trò; **don't** dùng alpha `/40`–`/60` trên chữ.
- **Do** giữ outline focus 2px offset 3px; **don't** `outline-none` ngoại trừ underline field.
- **Do** dùng `{rounded.control}`/`{rounded.poster}`/`{rounded.full}`; **don't** dùng 6px hoặc trộn radius trong cùng view.
- **Do** dùng skeleton khớp layout; **don't** dùng phần trăm giả hoặc spinner toàn trang.
- **Do** giữ chrome thật và skeleton khớp page size; **don't** thay title bằng "Đang tải…" hoặc spinner cho vùng list/card.
- **Do** dùng undo-toast 7s cho hành động đảo ngược; **don't** mở confirm dialog cho mọi thứ.
- **Do** dùng token cho mọi màu; **don't** viết hex/rgba trong `.tsx` (trừ logo Google và fallback SVG).
- **Do** giữ URL phản ánh filter/tab/pagination; **don't** giấu state chỉ trong component.

## Responsive Behavior

| Breakpoint | Width    | Thay đổi                                                                                                                                                   |
| ---------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile     | < 640px  | `display-xl` 30px, `display-lg` 24px; gutter 16; bottom nav hiện; toast bottom-center; dialog `fullscreen-mobile` chiếm toàn màn; pagination dạng input số |
| sm         | ≥ 640px  | `display-xl` 36px, `display-lg` 30px, `display-brand` 48px, `display-stat` 60px; dialog trở về hộp giữa màn                                                |
| md         | ≥ 768px  | gutter 24; bottom nav ẩn, nav desktop + footer hiện; toast bottom-right; pagination dãy số; `display-404` 96px                                             |
| lg         | ≥ 1024px | container chạm trần 1152px; `display-xl` 48px                                                                                                              |

- Touch target tối thiểu 24px; hành động chính trên mobile hướng tới 44px.
- Icon-button nhỏ giữ hit area ≥ 32px; chip không phải touch target.
- Nav collapse theo chiều dọc: desktop nav → bottom nav, không dùng hamburger.
- Ảnh: giữ tỉ lệ 2:3 ở mọi breakpoint, không crop khác tỉ lệ; width/height cố định để chống nhảy layout.

## Iteration Guide

1. Làm một component một lần; không sửa nhiều surface trong cùng một lượt.
2. Token trước, ngoại lệ sau. Không có token phù hợp thì dùng token gần nhất, không tạo token mới.
3. Không thêm màu. Cần nhấn thì dùng `{colors.primary}` hoặc weight/scale.
4. Không thêm size chữ, spacing hay radius ngoài thang.
5. Elevation chỉ bằng hairline hoặc `{colors.surface-elevated}`.
6. Mobile-first: dựng ở 320px trước, mở rộng theo bảng Responsive.
7. Mọi màu đi qua `{colors.*}`; mọi bo góc qua `{rounded.*}`.
8. Luật chưa có thì chọn phương án ít token mới nhất và ghi vào Known Gaps.

## Known Gaps

- **Data-viz**: chỉ spec palette và axis; legend, tooltip, empty chart chưa có luật.
- **Scrim**: hai giá trị `0.72` (overlay) và `0.85` (poster); chưa có token màu riêng, đang nằm trong component token.
- **Icon**: luật `strokeWidth` 1.5 chưa đồng nhất trong toàn bộ code.
- **Light theme trên ảnh**: scrim giữ nguyên giá trị dark, chưa có biến thể.
