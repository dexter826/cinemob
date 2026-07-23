# Quickstart Validation Guide

## Setup

1. Chạy môi trường phát triển cục bộ:
   ```bash
   npm run dev
   ```

## Test/Run Scenarios

1. **Dashboard Pagination & Tabs**:
   - Truy cập vào trang Dashboard (`/dashboard`).
   - Click vào các tab (Watchlist, History).
   - Expected: Các nút bấm chuyển màu nhẹ nhàng, không bị hiệu ứng zoom/scale. Không có lag khi chuyển đổi.

2. **Mobile Bottom Nav**:
   - Chuyển trình duyệt sang kích thước màn hình Mobile.
   - Bấm vào các icon điều hướng (Home, Search, Albums...).
   - Expected: Tab đang active sẽ có highlight nền, không bị lún (scale-95) một cách lố bịch.

3. **Search Filters**:
   - Mở `/search` và focus vào ô tìm kiếm hoặc click các nút bộ lọc.
   - Expected: Ô input chỉ đổi viền (border color), các nút bộ lọc không giật cục nhờ `transition-colors`.
