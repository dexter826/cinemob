# Quickstart Validation Guide

**Pre-requisites**: Đảm bảo app chạy ở `http://localhost:5173`.

1. Khởi động app: `npm run dev`
2. Mở trình duyệt và vào trang chủ:
   - Kiểm tra **màu nền (Background)**: Đảm bảo không còn trắng/đen tuyệt đối, nền có ánh vàng/hổ phách nhẹ (Lumen canvas).
3. Sử dụng thanh Navbar:
   - Cuộn chuột: Đảm bảo Navbar nổi dạng "Pill", cách mép trên một đoạn, có hiệu ứng kính mờ (blur).
4. Di chuột qua các Poster phim (Movie Card):
   - Đảm bảo thẻ phim KHÔNG bị phình to (phá vỡ tỉ lệ layout).
   - Kiểm tra xem viền thẻ hoặc bóng đổ (glow) có xuất hiện mượt mà không (transition-colors).
5. Mở trang `/login`:
   - Kiểm tra không còn dải gradient từ xanh sang hồng. Background trơn với điểm sáng tinh tế (blooms).
