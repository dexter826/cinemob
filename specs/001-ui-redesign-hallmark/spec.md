# Feature Specification: ui-redesign-hallmark

**Feature Branch**: `[001-ui-redesign-hallmark]`

**Created**: 2026-07-23

**Status**: Draft

**Input**: User description: "Redesign UI ứng dụng Cinemob theo tiêu chuẩn Hallmark Atmospheric (Xóa AI slop, làm lại hệ thống Design Token, Navbar, Footer)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Thẩm mỹ & Giao diện tổng thể (Priority: P1)

Người dùng truy cập ứng dụng và trải nghiệm giao diện thống nhất, mang tông màu tối (Atmospheric) và hoàn toàn vắng bóng các lỗi thiết kế phổ biến của AI (gradient rườm rà, lạm dụng shadow, hover phóng to).

**Why this priority**: Thiết lập lại "Design Token" là nền tảng để toàn bộ ứng dụng có giao diện mới, tránh vỡ layout ở các bước sau.

**Independent Test**: Có thể test độc lập bằng cách mở ứng dụng và kiểm tra CSS variables (OKLCH), màu sắc tổng thể không còn trắng/đen tuyệt đối.

**Acceptance Scenarios**:

1. **Given** người dùng ở trang chủ, **When** trang tải xong, **Then** màu nền phải là dark canvas (Lumen theme) thay vì đen/trắng tuyệt đối.
2. **Given** các thành phần giao diện (Movie Card), **When** hover chuột, **Then** thẻ hiển thị hiệu ứng đổi viền/bóng đổ (glow) thay vì phình to (`scale`).

---

### User Story 2 - Trải nghiệm Điều hướng & Footer (Priority: P2)

Người dùng điều hướng ứng dụng bằng Navbar kiểu "Floating pill" và đọc thông tin bản quyền ở Footer kiểu "Statement", mang lại cảm giác là một sản phẩm phần mềm cao cấp (Premium) chứ không phải template.

**Why this priority**: Navbar và Footer là 2 thành phần xuất hiện trên mọi màn hình, ảnh hưởng trực tiếp tới ấn tượng đầu tiên.

**Independent Test**: Có thể test độc lập bằng cách xem Navbar và Footer ở bất kì màn hình nào.

**Acceptance Scenarios**:

1. **Given** người dùng đang cuộn trang, **When** nhìn lên Navbar, **Then** Navbar hiển thị dạng khối nổi (pill) với background blur, không chiếm toàn bộ chiều ngang màn hình.
2. **Given** người dùng cuộn đến cuối trang, **When** nhìn thấy Footer, **Then** Footer mang cấu trúc Statement (đơn giản, tập trung vào thông điệp) thay vì dàn 4 cột liên kết truyền thống.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Hệ thống MUST sử dụng bảng màu OKLCH làm biến CSS mặc định trong file `index.css`.
- **FR-002**: Hệ thống MUST sử dụng cấu trúc Atmospheric canvas thay thế cho chuỗi `bg-gradient-to-br` ở màn hình Đăng nhập (Login).
- **FR-003**: Hệ thống MUST thay thế toàn bộ hiệu ứng `transition-all` bằng các thuộc tính cụ thể (`transition-colors`, `transition-transform`) ở mọi component.
- **FR-004**: Hệ thống MUST sử dụng font chữ theo quy chuẩn thiết kế Atmospheric (ưu tiên Sans-serif với độ tương phản tốt, không sử dụng chữ in nghiêng cho tiêu đề).
- **FR-005**: Navbar MUST được cấu trúc lại theo định dạng `N5 Floating pill`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% các component hiện đang lạm dụng `transition-all` (khoảng 37 files) được sửa đổi thành thuộc tính cụ thể.
- **SC-002**: 100% thẻ giao diện (MovieCard, StatsCard, TMDBMovieCard) không còn hiệu ứng `hover:scale-105`.
- **SC-003**: Giao diện đạt trạng thái "Pass" toàn bộ bài kiểm tra 58 gates (Slop-test) của bộ nguyên tắc Hallmark sau khi triển khai.

## Assumptions

- TailwindCSS v4 đã được cài đặt đúng cách và hỗ trợ nhận diện các mã màu OKLCH custom.
- Các cấu trúc Navbar và trang Login hiện tại có thể refactor tách biệt mà không làm vỡ logic trạng thái Authentication.
