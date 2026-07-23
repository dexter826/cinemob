# Phase 0: Outline & Research

## Research Findings

**Decision 1**: Phương pháp tìm và thay thế `transition-all`
- **Rationale**: Do số lượng lớn (~70+), chúng ta sẽ sử dụng Script (Regex Search and Replace) hoặc sửa tay qua trình soạn thảo code để đổi toàn bộ `transition-all` thành `transition-colors`, tuỳ theo bối cảnh. Với các component có biến đổi hình dạng (như mở rộng/thu hẹp), ta sẽ dùng `transition-[width/height]` hoặc `transition-transform`.

**Decision 2**: Loại bỏ `active:scale`
- **Rationale**: `active:scale` làm ứng dụng trông rẻ tiền và không cần thiết. Đa số sẽ được xoá bỏ hoàn toàn. Nếu nút bấm cần feedback khi click, `active:bg-black/10` (hoặc tương tự) có thể được dùng để thay thế.
