# Tasks: Global Layout Cleanup

## Feature Info
- **Branch**: `002-global-layout-cleanup`
- **Spec**: [spec.md](file:///C:/MyProject/cinemob/specs/002-global-layout-cleanup/spec.md)
- **Plan**: [plan.md](file:///C:/MyProject/cinemob/specs/002-global-layout-cleanup/plan.md)

## Implementation Strategy
Chúng ta sẽ thực hiện càn quét theo từng nhóm component để đảm bảo tính an toàn. Không cần viết tests mới cho thay đổi CSS. Sẽ chạy regex search trên codebase và sửa tay các file bị dính `transition-all` và `active:scale`.

## Dependencies
- Phase 1 và Phase 2 có thể thực thi độc lập (Parallel).
- Phase 3 (Review) phụ thuộc vào 1 và 2.

---

## Phase 1: User Story 1 - Global Removal of `transition-all` (P1)
**Goal**: Thay thế toàn bộ `transition-all` bằng `transition-colors`, `transition-opacity` hoặc `transition-transform` trên toàn app.
**Independent Test**: Hover vào các card, button, dropdown xem có bị giật (layout thrashing) do `transition-all` không.

- [x] T001 [P] [US1] Thay thế `transition-all` tại các trang chính: `src/pages/Dashboard.tsx`, `src/pages/StatsPage.tsx`, `src/pages/SearchPage.tsx`, `src/pages/ReleaseCalendarPage.tsx`, `src/pages/PersonDetailPage.tsx`, `src/pages/AlbumsPage.tsx`, `src/pages/AlbumDetailPage.tsx`.
- [x] T002 [P] [US1] Thay thế `transition-all` tại các UI components: `src/components/ui/PersonCard.tsx`, `src/components/ui/Pagination.tsx`, `src/components/ui/PageHeader.tsx`, `src/components/ui/MultiSelectDropdown.tsx`, `src/components/ui/EmptyState.tsx`, `src/components/ui/CustomTimePicker.tsx`, `src/components/ui/CustomDropdown.tsx`, `src/components/ui/CustomDatePicker.tsx`, `src/components/ui/AlertContainer.tsx`.
- [x] T003 [P] [US1] Thay thế `transition-all` tại các layout components: `src/components/layout/MobileBottomNav.tsx`, `src/components/search/SearchFilters.tsx`.

---

## Phase 2: User Story 2 - Removal of Excessive `active:scale` (P2)
**Goal**: Loại bỏ các hiệu ứng `active:scale-[...n]` gây cảm giác UI rẻ tiền.
**Independent Test**: Bấm vào nút phân trang, icon filter, hoặc Mobile Nav xem có bị "lún" vào một cách bất thường không.

- [x] T004 [P] [US2] Xoá `active:scale-95`, `active:scale-[0.98]` tại các trang: `src/pages/ReleaseCalendarPage.tsx`, `src/pages/AlbumsPage.tsx`, `src/pages/AlbumDetailPage.tsx`.
- [x] T005 [P] [US2] Xoá `active:scale` tại UI components (nếu có) và thay bằng `active:bg-black/10` hoặc bỏ qua luôn (chỉ dùng hover color).
- [x] T006 [P] [US2] Xoá `active:scale` tại `src/components/layout/MobileBottomNav.tsx`, `src/components/search/SearchFilters.tsx`.

---

## Phase 3: Final Polish
- [x] T007 Kiểm tra nghiệm thu tổng thể: Chạy `npm run dev` và lướt toàn bộ ứng dụng xem mọi chuyển đổi CSS có mượt mà, đúng chuẩn Hallmark (Atmospheric) hay chưa. Mở DevTools check DOM repaints.
