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

## 1. Overview

CineMOB là ứng dụng web tiến bộ (PWA) phục vụ theo dõi phim, series truyền hình, lịch phát sóng và số liệu thống kê điện ảnh cá nhân. Ngôn ngữ thiết kế lấy cảm hứng từ ấn phẩm báo in điện ảnh (Editorial Print): kiểu chữ hiển thị đậm nét, phân tầng thị giác bằng các đường hairline thay vì bóng đổ mềm, kết hợp cùng một màu nhấn vàng duy nhất trên nền tối mặc định.

### Đặc tính cốt lõi

- **Chế độ hiển thị:** Nền tối là mặc định; nền sáng sử dụng sắc thái giấy ấm.
- **Kiểu chữ:** Phông chữ Anton dùng cho tiêu đề lớn, chỉ số thống kê và nhãn thương hiệu; phông chữ Be Vietnam Pro dùng cho toàn bộ nội dung đọc, nhãn giao diện và văn bản điều hướng.
- **Cấu trúc hình học:** Trực diện, góc cạnh có kiểm soát; không sử dụng bóng đổ mềm (soft shadow), không dùng dải màu trang trí (decorative gradient) và không dùng bán kính bo góc lớn.
- **Nền tảng:** Tối ưu hóa trước cho thiết bị di động (mobile-first), hỗ trợ đầy đủ tính năng PWA và bản địa hóa tiếng Việt.
- **Thẻ phim:** Định dạng chuẩn tỷ lệ 2:3 với lớp phủ tương phản (scrim) bảo đảm khả năng đọc văn bản trên hình ảnh.

---

## 2. Colors

Hệ thống màu sắc tuân thủ độ tương phản tiếp cận WCAG AA trên cả hai chủ đề tối và sáng. Mọi thành phần giao diện bắt buộc tham chiếu qua token ngữ nghĩa, không định nghĩa mã màu trực tiếp trong mã nguồn giao diện.

| Token              | Dark                      | Light                  | Vai trò ngữ nghĩa                                              |
| :----------------- | :------------------------ | :--------------------- | :------------------------------------------------------------- |
| `background`       | `#0a0a0a`                 | `#f7f4ed`              | Nền canvas chính của ứng dụng                                  |
| `surface`          | `#141414`                 | `#fdfbf6`              | Bề mặt phân cấp cấp 1 (panel, card, section)                   |
| `surface-elevated` | `#1a1a1a`                 | `#fffefa`              | Bề mặt nổi (dialog, dropdown, toast, modal)                    |
| `primary`          | `#ca8a04`                 | `#8f6400`              | Màu nhấn duy nhất: nút chính, liên kết, trạng thái kích hoạt   |
| `primary-hover`    | `#dfa60b`                 | `#7a5600`              | Trạng thái hover của màu nhấn                                  |
| `on-primary`       | `#0a0a0a`                 | `#fffefa`              | Văn bản và biểu tượng hiển thị trên nền primary đặc            |
| `text-primary`     | `#f5f5f2`                 | `#0a0a0a`              | Màu mực chính cho tiêu đề và nội dung đọc                      |
| `text-secondary`   | `#8a8a85`                 | `#6b6b66`              | Màu mực phụ cho mô tả và nhãn phụ (đạt chuẩn AA)               |
| `text-muted`       | `#9c9c97`                 | `#5f5b53`              | Màu văn bản gợi ý (placeholder, hint)                          |
| `text-faint`       | `#6e6e69`                 | `#8a857c`              | Ký tự kích thước lớn hoặc thành phần trang trí (đạt tỷ lệ 3:1) |
| `border`           | `rgb(255 255 255 / 0.14)` | `rgb(20 20 20 / 0.16)` | Đường viền cho các thành phần điều khiển (control, input)      |
| `border-default`   | `rgb(255 255 255 / 0.07)` | `rgb(20 20 20 / 0.07)` | Đường hairline phân cách danh mục và cấu trúc                  |
| `focus`            | `#ca8a04`                 | `#8f6400`              | Đường viền chỉ thị trạng thái focus bàn phím                   |
| `success`          | `#4ade80`                 | `#15803d`              | Chỉ thị trạng thái thành công                                  |
| `on-success`       | `#09090b`                 | `#fffefa`              | Văn bản trên nền trạng thái thành công                         |
| `warning`          | `#fbbf24`                 | `#9a5d06`              | Chỉ thị cảnh báo hoặc lưu ý trạng thái                         |
| `danger`           | `#f87171`                 | `#b91c1c`              | Chỉ thị lỗi hoặc hành động phá hủy dữ liệu                     |
| `on-danger`        | `#09090b`                 | `#fffefa`              | Văn bản trên nền trạng thái phá hủy/lỗi                        |
| `info`             | `#38bdf8`                 | `#0369a1`              | Chỉ thị thông tin hướng dẫn                                    |
| `skeleton`         | computed                  | computed               | Màu nền hiển thị trạng thái khung chờ nội dung                 |

### Nguyên tắc sử dụng màu

1. **Màu nhấn duy nhất:** Token `primary` là điểm nhấn duy nhất của giao diện; không bổ sung màu nhấn phụ.
2. **Ngữ cảnh màu trạng thái:** Các token `success`, `warning`, `danger` và `info` chỉ áp dụng để truyền tải trạng thái nghiệp vụ, không sử dụng cho mục đích trang trí thuần túy.
3. **Độ tương phản chữ trên nền:** Chữ hoặc biểu tượng trên nền `primary` đặc luôn dùng `on-primary` để bảo đảm độ tương phản; không dùng chữ trắng trên nền vàng ở giao diện tối.
4. **Độ trong suốt văn bản:** Không sử dụng alpha từ 40% đến 60% trên chữ đặt trực tiếp trên nền ứng dụng. Văn bản đặt trên ảnh nền sử dụng giá trị `white/55` cho siêu dữ liệu.
5. **Ngoại lệ mã màu:** Mã màu trực tiếp chỉ cho phép đối với tài nguyên thương hiệu bên thứ ba (biểu tượng Google) và giá trị fallback trong SVG symbol.

---

## 3. Typography

Hệ thống kiểu chữ gồm hai phông chữ chuyên biệt: **Anton** (Display Serif/Grotesque impact) tạo dấu ấn biên tập điện ảnh và **Be Vietnam Pro** (Modern Sans-serif) bảo đảm khả năng đọc tiếng Việt ở mọi cấp độ hiển thị.

| Cấp bậc         | Phông chữ      | Cỡ chữ | Trọng số (Weight) | Độ cao dòng | Khoảng cách chữ    |
| :-------------- | :------------- | :----- | :---------------- | :---------- | :----------------- |
| `display-brand` | Anton          | 36px   | 400               | 1.0         | 0.02em             |
| `display-xl`    | Anton          | 30px   | 400               | 1.0         | 0.025em            |
| `display-lg`    | Anton          | 24px   | 400               | 1.05        | 0.025em            |
| `display-md`    | Anton          | 20px   | 400               | 1.2         | 0.02em             |
| `display-stat`  | Anton          | 48px   | 400               | 1.0         | 0.025em            |
| `display-404`   | Anton          | 72px   | 400               | 1.0         | 0                  |
| `title-lg`      | Be Vietnam Pro | 20px   | 700               | 1.3         | 0                  |
| `title-md`      | Be Vietnam Pro | 18px   | 700               | 1.35        | 0                  |
| `body`          | Be Vietnam Pro | 14px   | 500               | 1.5         | 0                  |
| `body-sm`       | Be Vietnam Pro | 12px   | 500               | 1.5         | 0                  |
| `label-caps`    | Be Vietnam Pro | 11px   | 600               | 1.2         | 0.1em (Uppercase)  |
| `micro-caps`    | Be Vietnam Pro | 9px    | 700               | 1.2         | 0.06em (Uppercase) |

### Nguyên tắc định dạng chữ

1. **Phân cấp chức năng:** Anton chỉ dùng cho các điểm neo thị giác (tiêu đề trang cấp cao, số đếm thống kê và wordmark). Toàn bộ nội dung văn bản dài, biểu mẫu và danh sách dùng Be Vietnam Pro.
2. **Kích thước cố định:** Kích thước chữ chỉ tham chiếu từ bảng phân cấp; không áp dụng thang cỡ chữ mặc định của Tailwind ngoài các token đã định nghĩa.
3. **Hiển thị số:** Các chỉ số đo lường, thời lượng, số tập và ngày tháng luôn kích hoạt thuộc tính `tabular-nums` để bảo đảm độ thẳng hàng khi hiển thị danh sách.

---

## 4. Layout

Hệ thống bố cục được xây dựng theo tỷ lệ chuẩn 4px/8px kết hợp micro-spacing phục vụ căn chỉnh chi tiết. Bố cục thích ứng theo chiều ngang từ màn hình hẹp đến chiều rộng tối đa của khung chứa.

### Thang khoảng cách (Spacing Scale)

- **Micro Spacing:** `micro-1` (2px), `micro-2` (6px), `micro-3` (10px) – dùng cho khoảng cách giữa biểu tượng và văn bản.
- **Layout Spacing:** `xxs` (4px), `xs` (8px), `sm` (12px), `md` (16px), `lg` (20px), `xl` (24px), `xxl` (32px), `xxxl` (40px), `huge` (48px), `section` (64px).

### Lưới hiển thị và Điểm ngắt (Responsive Breakpoints)

| Breakpoint | Chiều rộng | Bố cục và Hành vi hiển thị                                                                                                                                                             |
| :--------- | :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mobile** | < 640px    | Lề trang 16px; thanh điều hướng đáy (Bottom Navigation) hiển thị; thông báo nổi canh giữa phía trên, nằm dưới thanh điều hướng đỉnh; hộp thoại mở rộng toàn màn hình (`fullscreen-mobile`); phân trang dạng ô nhập số. |
| **sm**     | ≥ 640px    | `display-xl` mở rộng 36px, `display-stat` mở rộng 60px; hộp thoại trở về khung trung tâm màn hình.                                                                                     |
| **md**     | ≥ 768px    | Lề trang 24px; thanh điều hướng đáy ẩn, chuyển sang thanh điều hướng đỉnh và chân trang máy tính; phân trang hiển thị dạng danh sách số; thông báo nổi chuyển về góc trên bên phải, nằm dưới thanh điều hướng đỉnh.    |
| **lg**     | ≥ 1024px   | Khung chứa nội dung giới hạn tối đa tại 1152px; `display-xl` mở rộng 48px.                                                                                                             |

---

## 5. Elevation & Depth

Thiết kế loại bỏ hoàn toàn các bóng đổ mềm (soft blur shadows) thường thấy trên giao diện số, thay thế bằng độ tương phản bề mặt và các đường chỉ hairline mảnh.

### Cấu trúc phân lớp

1. **Lớp nền (Base Plane):** Token `background` là bề mặt sâu nhất.
2. **Lớp thành phần (Component Plane):** Token `surface` dùng cho các khối thẻ và phân vùng nội dung.
3. **Lớp nổi (Floating Plane):** Token `surface-elevated` dùng cho hộp thoại, menu thả xuống và thông báo nổi.
4. **Đường phân cách (Hairline Separation):**
   - `border-default` (độ mờ 7%): Dùng cho các đường hairline ngang/dọc phân chia danh mục, bảng biểu và cột nội dung.
   - `border` (độ mờ 14–16%): Định hình đường bao quanh các thành phần điều khiển có tương tác.
5. **Lớp phủ hình ảnh (Poster Scrim):** Lớp gradient chức năng chuyển dần từ đen đậm (85%) sang trong suốt tại chân poster để bảo đảm tương phản văn bản mà không làm mờ hình ảnh gốc.

---

## 6. Shapes

Hệ thống hình học duy trì sự đồng nhất về bán kính bo góc (border radius) nhằm giữ vững tính chất sắc sảo của phong cách in ấn.

| Token             | Giá trị | Phạm vi áp dụng                                                 |
| :---------------- | :------ | :-------------------------------------------------------------- |
| `rounded.control` | 8px     | Nút bấm, ô nhập liệu, hộp tìm kiếm, khung chuyển đổi trạng thái |
| `rounded.card`    | 8px     | Khung thẻ thông tin, ô menu dropdown, hộp thông báo nổi         |
| `rounded.dialog`  | 8px     | Khung hộp thoại trung tâm và bảng trượt (sheet)                 |
| `rounded.poster`  | 4px     | Thẻ ảnh bìa phim (PosterCard) và thẻ nhãn (Chip)                |
| `rounded.full`    | 9999px  | Ảnh đại diện (avatar), thanh ray và nút công tắc (switch)       |

### Quy tắc định hình

- Không sử dụng bán kính bo góc 6px hoặc các giá trị nằm ngoài bảng định nghĩa.
- Không kết hợp góc vuông hoàn toàn và góc bo tròn trong cùng một giao diện hiển thị.

---

## 7. Components

Mỗi thành phần là một hợp đồng giao diện chuẩn mực. Nội dung chữ hiển thị trong các thành phần bắt buộc tuân theo tài liệu `COPY.md`.

### Button & IconButton

- **Phân loại biến thể:**
  - `button-primary`: Dành cho hành động chính trên màn hình.
  - `button-secondary`: Nền trong suốt, viền `border`, dành cho hành động phụ.
  - `button-ghost`: Không viền, chỉ có hiệu ứng hover bề mặt.
  - `button-danger`: Nền `danger`, chỉ dành cho hành động phá hủy hoặc xóa vĩnh viễn dữ liệu.
- **Quy chuẩn tương tác:**
  - Nút ở trạng thái đang xử lý hiển thị con quay (spinner 16px) tại chỗ, giữ nguyên kích thước nút, kèm thuộc tính `aria-busy="true"`.
  - Mọi IconButton không chứa chữ hiển thị bắt buộc phải có thuộc tính `aria-label` mô tả hành động.
  - Sử dụng thẻ `<button>` cho hành động tại chỗ và thẻ `<a>`/`<Link>` cho điều hướng trang.

### TextField & SearchField

- **Kiểu hiển thị:**
  - `text-field`: Kiểu gạch chân (underline) trên nền trang thông thường; kiểu đóng khung (`boxed`) trong hộp thoại hoặc bề mặt nổi.
  - `search-field-underline` và `search-field-boxed`: Chiều cao tương ứng 48px và 44px.
- **Tiếp cận và Báo lỗi:** Nhãn hiển thị sử dụng `label-caps`. Thông báo lỗi xuất hiện ngay dưới ô nhập liệu với màu `danger`, liên kết qua thuộc tính `aria-invalid` và `aria-describedby`.

### Chip

- **Biến thể màu:** `chip-gold` (nhấn mạnh/chọn), `chip-success` (hoàn thành), `chip-neutral` (nằm trên ảnh), `chip-muted` (phụ trợ trên nền ứng dụng).
- **Quy chuẩn:** Chip là thành phần hiển thị trạng thái hoặc phân loại, không đóng vai trò thay thế nút bấm có tương tác lớn.

### Dropdown & MultiSelect

- Bảng chọn (`dropdown-panel`) có thời gian xuất hiện/biến mất 120ms, tự động đóng khi nhấn phím Escape hoặc click ra ngoài vùng chọn, hoàn trả tiêu điểm về nút kích hoạt.
- Hỗ trợ đầy đủ điều hướng bàn phím (mũi tên lên/xuống, Enter, Space, Escape).

### Dialog, Sheet & Alert

- Lớp phủ mờ `dialog-overlay` sử dụng màu nền tối 72%.
- Hỗ trợ cơ chế khóa tiêu điểm bên trong hộp thoại (focus trap), đóng bằng phím Escape và hoàn trả tiêu điểm về phần tử kích hoạt ban đầu.
- Hộp thoại cảnh báo phá hủy (Alert) luôn đặt tiêu điểm mặc định vào hành động an toàn; nút xác nhận hành động nguy hiểm dùng màu `danger`.

### PosterCard

- Tỷ lệ khung hình cố định 2:3 với lớp phủ scrim chức năng tại chân thẻ.
- Tiêu đề dùng kiểu chữ `body-sm` in đậm màu trắng; siêu dữ liệu dùng `micro-caps` với độ mờ `white/55`.
- Thẻ hỗ trợ tải ảnh lười (lazy loading), cố định kích thước để chống giật layout (layout shift).

### Skeleton & Loading

- Trạng thái chờ chỉ hiển thị sau ngưỡng 150ms để tránh hiện tượng nhấp nháy giao diện khi mạng nhanh, và giữ tối thiểu 300ms khi đã hiển thị.
- Cấu trúc khung xương (skeleton) phải mô phỏng chính xác lưới, tỷ lệ và số lượng phần tử của nội dung thực tế. Không sử dụng con quay (spinner) thay thế cho toàn bộ danh sách nội dung.

---

## 8. Do’s and Don’ts

Bảng đối chiếu các nguyên tắc thiết kế đúng và sai trong toàn bộ hệ thống:

| Do                                                                           | Don't                                                                                     |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| Sử dụng đường hairline và `surface-elevated` để phân tầng thị giác.          | Không sử dụng bóng đổ mềm (soft blur shadow) để nâng nổi phần tử.                         |
| Duy trì `primary` là màu nhấn duy nhất trên toàn bộ giao diện.               | Không bổ sung màu nhấn thứ hai gây phân tán thị giác.                                     |
| Sử dụng `on-primary` cho chữ trên nền màu nhấn đặc.                          | Không sử dụng chữ trắng trên nền vàng ở giao diện tối.                                    |
| Sử dụng `text-secondary` và `text-muted` cho các cấp bậc chữ phụ.            | Không giảm độ mờ chữ bằng alpha từ 40% đến 60% trên nền ứng dụng.                         |
| Duy trì đường viền focus rõ ràng (2px, offset 3px) cho tiếp cận bàn phím.    | Không tắt outline focus (`outline-none`) ngoại trừ trường hợp ô gạch chân có xử lý riêng. |
| Tuân thủ thang bo góc chuẩn (`control`: 8px, `poster`: 4px, `full`: 9999px). | Không dùng bán kính 6px hoặc trộn lẫn góc vuông và góc bo trong cùng giao diện.           |
| Thiết kế khung xương mô phỏng chính xác bố cục và số lượng thẻ nội dung.     | Không hiển thị phần trăm giả lập hoặc dùng con quay tải trang toàn màn hình.              |
| Cung cấp cơ chế hoàn tác (Undo toast 7s) cho các hành động có thể đảo ngược. | Không mở hộp thoại xác nhận (Confirm modal) cho mọi thao tác nhỏ gây gián đoạn luồng.     |
| Tham chiếu mọi giá trị màu sắc và khoảng cách qua Design Token.              | Không viết mã màu trực tiếp (hex/rgba) hoặc số đo tùy tiện trong mã nguồn component.      |
| Đồng bộ trạng thái bộ lọc, phân trang và tab hiển thị lên URL tham số.       | Không ẩn giấu trạng thái xem trong bộ nhớ cục bộ của component riêng lẻ.                  |
