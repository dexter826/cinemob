# Implementation Plan: Global Layout Cleanup

**Branch**: `002-global-layout-cleanup` | **Date**: 2026-07-23 | **Spec**: [spec.md](file:///C:/MyProject/cinemob/specs/002-global-layout-cleanup/spec.md)

**Input**: Feature specification from `/specs/002-global-layout-cleanup/spec.md`

## Summary

Dọn dẹp và loại bỏ triệt để các class "AI-Slop" (`transition-all`, `active:scale-95`, v.v.) trên diện rộng để ứng dụng tuân thủ nghiêm ngặt nguyên tắc Hallmark Atmospheric, tối ưu hiệu năng layout/rendering của React + Tailwind.

## Technical Context

**Language/Version**: TypeScript / React 19

**Primary Dependencies**: Tailwind CSS v4, framer-motion

**Storage**: N/A

**Testing**: N/A

**Target Platform**: Web (Responsive Desktop & Mobile)

**Project Type**: Web Application

**Performance Goals**: Giảm Layout Thrashing khi tương tác

**Constraints**: Thay thế `transition-all` bằng `transition-colors`, `transition-opacity` hoặc `transition-transform` mà không làm vỡ UX cũ.

**Scale/Scope**: Toàn bộ thư mục `src/` (hơn 70 vị trí bị ảnh hưởng)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Không vi phạm nguyên tắc kiến trúc nào.
- [x] Đây là một thay đổi thuần túy về CSS/Presentation.

## Project Structure

### Documentation (this feature)

```text
specs/002-global-layout-cleanup/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/          # Thay thế CSS classes trong tất cả các components
├── pages/               # Thay thế CSS classes trong tất cả các pages
└── index.css            # Kiểm tra xem có cấu hình CSS global nào cần dọn không
```

**Structure Decision**: Cập nhật trực tiếp các tệp `.tsx` hiện tại, không thay đổi cấu trúc thư mục.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

*N/A*
