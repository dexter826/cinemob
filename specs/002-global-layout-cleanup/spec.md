# Feature Specification: Global Layout Cleanup (Anti-AI-Slop)

**Feature Branch**: `[002-global-layout-cleanup]`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Đã toàn diện ứng dụng ? Có cần điều chỉnh gì về LAYOUT tất cả không ?" (Global cleanup of AI-slop animations like `transition-all`, `active:scale` across all remaining components in `src/` to fully adhere to Hallmark Atmospheric guidelines.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Global Removal of `transition-all` (Priority: P1)

Là một người dùng, khi tôi tương tác (hover, focus, click) với bất kỳ thành phần nào trên toàn bộ ứng dụng (buttons, cards, inputs, dropdowns), tôi muốn hiệu ứng chuyển đổi phải mượt mà và nhắm đúng mục tiêu (chỉ chuyển đổi màu sắc hoặc kích thước cần thiết), thay vì làm trình duyệt phải tính toán lại mọi thuộc tính (transition-all).

**Why this priority**: Đảm bảo hiệu năng kết xuất (rendering) của trình duyệt và tuân thủ tuyệt đối nguyên tắc thiết kế chống AI-Slop của Hallmark.
**Independent Test**: Có thể được kiểm tra độc lập bằng cách mở Developer Tools, soi vào các elements ở Dashboard, Search, Stats, PersonDetail xem có class `transition-all` nào còn sót lại hay không.

**Acceptance Scenarios**:
1. **Given** một trang bất kỳ như Dashboard hoặc Stats, **When** tôi di chuột qua các nút bấm hoặc thẻ, **Then** hiệu ứng chuyển màu xảy ra mượt mà thông qua `transition-colors` mà không dùng `transition-all`.

---

### User Story 2 - Removal of Excessive `active:scale` Animations (Priority: P2)

Là một người dùng, tôi không muốn thấy mọi nút bấm hoặc liên kết bị lún/thu nhỏ lố bịch (active:scale-95 hoặc active:scale-[0.98]) mỗi khi tôi click vào chúng.

**Why this priority**: Các hiệu ứng scale khi active thường được AI sinh ra một cách vô tội vạ, làm cho ứng dụng trông giống các template giá rẻ. Thay vào đó chỉ cần một thay đổi màu sắc nhẹ là đủ để báo hiệu trạng thái active.
**Independent Test**: Có thể được kiểm tra bằng cách nhấp chuột liên tục vào các nút bấm phân trang (Pagination), các bộ lọc (Filters), hoặc thanh điều hướng dưới (MobileBottomNav) và quan sát xem chúng có bị co rút lại một cách lố bịch hay không.

**Acceptance Scenarios**:
1. **Given** các components như Pagination hoặc MobileBottomNav, **When** tôi nhấp (click/tap) vào chúng, **Then** trạng thái nhấp chuột được thể hiện bằng sự thay đổi màu nền hoặc bóng đổ, không bị biến dạng tỷ lệ (scale).

---

### Edge Cases

- Điều gì xảy ra đối với các component bắt buộc phải thay đổi tỷ lệ (ví dụ: modal popups)? 
  - Trả lời: Modal popups có thể sử dụng `transition-transform` riêng biệt để diễn hoạt việc mở/đóng, không dùng `transition-all`.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Toàn bộ mã nguồn trong thư mục `src/` (bao gồm `pages/`, `components/`) KHÔNG được chứa class `transition-all` của Tailwind CSS.
- **FR-002**: Toàn bộ mã nguồn KHÔNG được chứa các class `active:scale-95`, `active:scale-[0.98]`, hoặc các biến thể scale tương tự để tạo hiệu ứng nhấp chuột (ngoại trừ các trường hợp thực sự cần thiết về mặt logic đồ họa, được user phê duyệt).
- **FR-003**: Khi loại bỏ `transition-all`, hệ thống PHẢI thay thế bằng các thuộc tính cụ thể như `transition-colors`, `transition-transform`, hoặc `transition-opacity` tùy theo ngữ cảnh để không làm mất đi trải nghiệm UI/UX mượt mà.

### Key Entities

- Không có thực thể dữ liệu (Data Entities) mới nào được tạo ra trong phạm vi feature này. Đây là một refactor ở lớp Presentation (CSS/UI).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lệnh tìm kiếm toàn cục (Global Regex Search) cho từ khoá `transition-all` trong thư mục `src/` trả về kết quả bằng 0 (ngoại trừ các file thư viện nếu có).
- **SC-002**: Lệnh tìm kiếm toàn cục cho từ khoá `active:scale` trả về kết quả bằng 0 trong các component nút bấm thông thường.
- **SC-003**: Tốc độ phản hồi UI (Interaction tới Paint) khi hover/click vào các danh sách dài (như danh sách phim trong Dashboard) giảm được hiện tượng layout thrashing.

## Assumptions

- Việc thay thế `transition-all` bằng `transition-colors` không làm vỡ các hiệu ứng đồ hoạ hiện tại của ứng dụng.
- Người dùng đồng ý với việc loại bỏ hoàn toàn hiệu ứng lún (scale) khi bấm nút.
