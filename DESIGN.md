---
name: CineMOB
description: Người bạn đồng hành lý tưởng cho những tín đồ điện ảnh
colors:
  primary: "#10b981"
  primary-hover: "#059669"
  secondary: "#f59e0b"
  secondary-dark: "#fbbf24"
  background-dark: "#09090b"
  surface-dark: "#141417"
  background-light: "#fafafa"
  surface-light: "#ffffff"
  text-main-dark: "#fafafa"
  text-muted-dark: "#a1a1aa"
  text-main-light: "#09090b"
  text-muted-light: "#71717a"
  border-dark: "rgba(250, 250, 250, 0.06)"
  border-light: "rgba(9, 9, 11, 0.06)"
  success: "#22c55e"
  warning: "#f59e0b"
  error: "#ef4444"
  info: "#0ea5e9"
typography:
  display:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Be Vietnam Pro, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "14px"
  2xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  card:
    backgroundColor: "{colors.surface-dark}"
    rounded: "{rounded.2xl}"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.xl}"
    padding: "10px 18px"
---

# Design System: CineMOB

## Overview

**Creative North Star: "The Neon Cinema Lounge"**

CineMOB tái hiện trải nghiệm sang trọng và huyền ảo của một phòng chiếu phim hiện đại cao cấp trong kỷ nguyên số. Lấy cảm hứng từ ánh đèn neon ngọc lục bảo (Emerald) rực rỡ cắt qua màn đêm thẳm sâu, giao diện đặt các tác phẩm điện ảnh và poster nghệ thuật vào vị trí trung tâm, trong khi hệ thống điều hướng và công cụ bổ trợ lùi lại phía sau trong các lớp kính mờ tinh xảo (Glassmorphism).

Không gian thị giác được thiết kế tối ưu cho trải nghiệm chạm (touch-first) trên thiết bị di động chuẩn PWA, đồng thời mở rộng tráng lệ trên màn hình desktop. Mọi tương tác đều đem lại cảm giác xúc giác đầm tay (Tactile & Fluid), chuyển cảnh êm ái qua Framer Motion, mang đến sự kết hợp hoàn hảo giữa công nghệ hiện đại và niềm say mê điện ảnh thuần túy.

**Key Characteristics:**
- **Nền tối sâu thẳm & Đa tầng (Deep Tonal Layering):** Nền Zinc-950 kết hợp bề mặt Zinc-900 Deep tạo chiều sâu điện ảnh, hoàn toàn loại bỏ màu đen tuyệt đối gắt gỏng.
- **Điểm nhấn Emerald Neon:** Sắc xanh ngọc lục bảo đóng vai trò nhận diện thương hiệu, dẫn dắt ánh nhìn vào các hành động chính và trạng thái nổi bật.
- **Kính mờ cao cấp (Frosted Glass):** Hiệu ứng `backdrop-blur-xl` kết hợp viền mờ `border-white/10` đem lại vẻ đẹp vị lai, thời thượng.
- **Tương tác xúc giác chuẩn PWA:** Bo góc lớn `rounded-2xl`, nút bấm thân thiện với ngón tay cái, phản hồi tức thì.

---

## Colors

Bảng màu mang phong cách Cinematic Dark Mode với điểm nhấn neon ngọc lục bảo sắc nét kết hợp ánh vàng rạp chiếu ấm áp, hỗ trợ đầy đủ Light Mode tương phản dịu mắt.

### Primary
- **Emerald Pulse** (`#10b981` / `rgb(16, 185, 129)`): Màu nhận diện chủ đạo. Dùng cho các nút hành động chính (Primary Buttons), điểm số đánh giá nổi bật, viền phát sáng (glow) khi hover, và các trạng thái đang hoạt động (active tabs).
- **Emerald Deep** (`#059669`): Trạng thái hover/active của nút bấm chính.

### Secondary
- **Cinema Gold** (`#f59e0b` trong Light / `#fbbf24` trong Dark): Màu sắc thứ cấp mang sắc vàng ấm áp của ánh đèn rạp chiếu, điểm số sao đánh giá điện ảnh và các chi tiết nổi bật cần tạo cảm giác sang trọng.

### Neutrals (Dark Mode - Mặc định)
- **Cinema Black** (`#09090b` / `zinc-950`): Lớp nền gốc của toàn bộ ứng dụng, tạo cảm giác như ngồi trong rạp chiếu tắt đèn.
- **Lounge Surface** (`#141417` / `zinc-900 deep`): Bề mặt các thẻ Card, Modal, Dropdown và thanh điều hướng.
- **Text Main** (`#fafafa` / `zinc-50`): Tiêu đề, tên phim và thông tin cốt lõi cần độ tương phản cao.
- **Text Muted** (`#a1a1aa` / `zinc-400`): Năm phát hành, thể loại, thông tin phụ, nhãn metadata.
- **Border Subtle** (`rgba(250, 250, 250, 0.06)`): Đường viền mỏng phân định khối tinh tế mà không gây rối mắt.

### Neutrals (Light Mode)
- **Clean Off-White** (`#fafafa` / `zinc-50`): Nền sáng sạch sẽ, hiện đại.
- **Pure Surface** (`#ffffff`): Bề mặt thẻ card sáng nổi bật.
- **Text Main** (`#09090b` / `zinc-950`): Đảm bảo tỷ lệ tương phản văn bản cao.
- **Text Muted** (`#71717a` / `zinc-500`): Văn bản phụ trợ.

### Semantic
- **Success** (`#22c55e`): Phim đã xem hoàn thành, tiến độ đạt 100%.
- **Warning** (`#f59e0b`): Đang theo dõi, phim sắp chiếu, số sao đánh giá trung bình.
- **Error** (`#ef4444`): Nút xóa phim, cảnh báo hủy hành động.
- **Info** (`#0ea5e9`): Thông báo hệ thống, cập nhật tập mới.

---

## Typography

Hệ thống chữ sử dụng họ phông **Be Vietnam Pro** cho tiêu đề & hiển thị (Display/Headlines) mang lại cảm giác đầm tay, đậm chất điện ảnh và căn chỉnh quang học hoàn hảo cho dấu tiếng Việt; kết hợp cùng **Inter** cho phần thân văn bản (Body/Labels) nhằm tối ưu độ đọc rõ ràng vượt trội trên mọi kích thước màn hình.

### Hierarchy
- **Display** (`2.25rem` / `36px`, Bold 700, Leading 1.2): Tiêu đề trang chào mừng, tiêu đề phim chi tiết trong modal hero banner.
- **Headline** (`1.5rem` / `24px`, Semi-bold 600, Leading 1.3): Tiêu đề các mục lớn (Danh sách xem, TV Calendar, Thống kê, Album).
- **Title** (`1.125rem` / `18px`, Semi-bold 600, Leading 1.4): Tên phim trên thẻ card, tiêu đề modal, tên album.
- **Body** (`0.875rem` / `14px`, Regular 400, Leading 1.5): Đoạn tóm tắt cốt truyện (overview), nội dung mô tả, văn bản form nhập liệu.
- **Label / Caption** (`0.75rem` / `12px`, Medium 500, Leading 1.4): Ngày tháng phát hành, thời lượng, tag thể loại, nhãn trạng thái tiến độ tập phim.

---

## Layout

Cấu trúc layout được thiết kế theo tư duy **Mobile-first PWA**, thích ứng liền mạch lên Tablet và Desktop.

- **Grid hệ thống hiển thị Poster:**
  - Mobile (< 640px): 2 cột (`grid-cols-2`), tối ưu vùng chạm và tỷ lệ nhìn của mắt.
  - Tablet (640px - 1024px): 3 - 4 cột (`sm:grid-cols-3 md:grid-cols-4`).
  - Desktop (> 1024px): 5 - 6 cột (`lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7`).
- **Tỷ lệ khung hình (Aspect Ratio):** Luôn duy trì tỷ lệ chuẩn điện ảnh `aspect-2/3` cho ảnh poster phim.
- **Container chuẩn:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Navigation:**
  - Mobile: Bottom Navigation Bar cố định phía dưới màn hình, tích hợp kính mờ `backdrop-blur-xl`.
  - Desktop: Header thanh thoát phía trên kèm thanh tìm kiếm nhanh.

---

## Elevation & Depth

Triết lý phân tầng dựa trên **Tonal Stacking (Xếp lớp sắc độ)** kết hợp **Frosted Glass (Kính mờ)**:

- **Level 0 (Floor):** Nền ứng dụng `bg-background` (`#09090b`).
- **Level 1 (Card / Container):** Bề mặt thẻ `bg-surface` (`#141417`), viền siêu mỏng `border border-border-default`, đổ bóng nhẹ `shadow-premium`.
- **Level 2 (Hover / Active Card):** Viền sáng nhẹ `border-primary/40`, đổ bóng sâu hơn `shadow-premium-hover`, hiệu ứng phát sáng nhẹ `hover:ring-1 hover:ring-primary/20`.
- **Level 3 (Floating Controls / Overlays):** Các nút hành động nhanh trên poster dùng nền kính đen `bg-black/40 backdrop-blur-xl border border-white/10`.
- **Level 4 (Modals & Drawers):** Nền `bg-surface/95 backdrop-blur-2xl` tạo sự tách biệt hoàn toàn với trang nền.

---

## Shapes

Ngôn ngữ hình khối đề cao sự mềm mại, hiện đại và thân thiện:

- **Thẻ phim chính (Movie Cards):** `rounded-2xl` (16px) - Bo góc rộng tạo cảm giác tấm thẻ phim cao cấp.
- **Nút bấm & Khung nhập liệu (Buttons & Inputs):** `rounded-xl` (12px) - Cân đối, đầm tay.
- **Hộp thoại (Modals / Bottom Sheets):** `rounded-3xl` (24px) trên mobile, `rounded-2xl` trên desktop.
- **Nhãn trạng thái (Badges / Tags):** `rounded-full` hoặc `rounded-lg` (8px).
- **Thanh tiến độ (Progress Bars):** `rounded-full` với chiều cao thanh mảnh (h-1 hoặc h-1.5).

---

## Components

### 1. MovieCard
- **Cấu trúc:** Tỷ lệ `aspect-2/3`, hình ảnh poster sắc nét, lớp phủ gradient đen mờ khi rê chuột (`bg-linear-to-t from-black/80`).
- **Thao tác nhanh:** Cụm nút tròn góc `rounded-xl` ở góc trên bên phải (Xóa, Sửa, Đã xem) với nền kính mờ `bg-black/40 backdrop-blur-xl`.
- **Tiến độ TV Series:** Thanh progress bar chạy sát mép dưới với màu sắc phản ánh tiến độ hoàn thành.

### 2. Action Buttons
- **Primary Button:** Nền Emerald (`bg-primary`), chữ trắng, bo góc `rounded-xl`, đổ bóng mềm, hiệu ứng co nhẹ khi nhấn (`active:scale-95`).
- **Secondary / Ghost Button:** Nền trong suốt hoặc kính mờ, viền mảnh `border-border-default`, hover chuyển sang nền bề mặt sáng hơn.

### 3. Modal & Dialogs
- Hiệu ứng xuất hiện mượt mà (`zoom-in-95` hoặc trượt lên từ đáy màn hình).
- Nền tối mờ bao phủ toàn màn hình (`bg-black/70 backdrop-blur-md`).
- Bố cục chia rõ rệt: Banner hình nền phim mờ phía trên, nội dung chi tiết dạng thẻ ở dưới.

### 4. Custom Controls (DatePicker, Dropdown)
- Không dùng native select thô sơ của trình duyệt. Toàn bộ dropdown đều hỗ trợ tìm kiếm, multi-select, bo góc đồng bộ và bám sát theme Dark/Light.

---

## Do's and Don'ts

### Do's (Nên làm)
- **Luôn bảo toàn tỷ lệ Poster `aspect-2/3`:** Đảm bảo ảnh bìa phim không bị méo mó hay co giãn sai tỉ lệ.
- **Tận dụng hiệu ứng kính mờ cho các thành phần nổi:** Sử dụng `backdrop-blur-xl` kết hợp `border-white/10` cho các nút bấm nổi trên ảnh.
- **Ưu tiên Dark Mode làm chuẩn:** Mọi tính năng mới phải được trau chuốt hoàn hảo trên Dark Mode trước tiên, sau đó xác nhận hiển thị tốt trên Light Mode.
- **Tạo khoảng thở (Whitespace / Breathing Room):** Giữ khoảng cách giữa các card phim tối thiểu `gap-3` trên mobile và `gap-5` trên desktop.
- **Chuyển cảnh có chủ đích:** Dùng Framer Motion với thời lượng ngắn (`0.2s - 0.3s`) và đường cong chuyển động mượt mà (`ease-out`).

### Don'ts (Tuyệt đối tránh)
- **Không dùng màu đen tuyệt đối `#000000` làm màu nền phẳng:** Luôn dùng `zinc-950` (`#09090b`) hoặc bề mặt `zinc-900` (`#141417`) để giữ độ sâu cho mắt.
- **Không lạm dụng card lồng card (Card Nesting):** Tránh việc bọc một card bên trong một card khác gây cảm giác ngột ngạt, nặng nề.
- **Không dùng gradient tím-xanh rập khuôn của AI:** Bám sát màu sắc nhận diện Emerald neon của CineMOB.
- **Không dùng hiệu ứng nảy bật (Bounce / Elastic easing):** Gây cảm giác lỗi thời và thiếu tự nhiên cho một ứng dụng rạp phim cao cấp.
- **Không để chữ xám mờ trên nền màu:** Luôn giữ độ tương phản chuẩn WCAG AA cho mọi văn bản.
