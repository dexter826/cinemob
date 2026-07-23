# Implementation Plan: ui-redesign-hallmark

**Branch**: `[001-ui-redesign-hallmark]` | **Date**: 2026-07-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-ui-redesign-hallmark/spec.md`

## Summary

Redesign UI ứng dụng Cinemob theo phong cách Hallmark Atmospheric (Lumen theme). Tập trung vào tái cấu trúc hệ thống CSS Token (OKLCH), thay đổi cấu trúc Navbar thành Floating Pill, xóa bỏ hiệu ứng hover phóng to và transition-all bừa bãi.

## Technical Context

**Language/Version**: React 19, TypeScript

**Primary Dependencies**: TailwindCSS v4, Zustand, Vite

**Storage**: N/A (UI only)

**Testing**: N/A (Visual UI Validation)

**Target Platform**: Web Browser (Mobile responsive)

**Project Type**: Web Application Frontend

**Performance Goals**: Không thay đổi logic, duy trì mượt mà 60fps khi render CSS properties thay vì transition-all.

**Constraints**: TailwindCSS hỗ trợ cấu trúc OKLCH.

**Scale/Scope**: ~40 components/pages.

## Constitution Check

*N/A - Không có xung đột nguyên tắc.*

## Project Structure

### Documentation (this feature)

```text
specs/001-ui-redesign-hallmark/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
└── tasks.md             
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── auth/Login.tsx
│   ├── layout/Navbar.tsx
│   ├── ui/MovieCard.tsx
│   ├── ui/StatsCard.tsx
│   └── ui/TMDBMovieCard.tsx
├── index.css
└── tailwind.config.js
```

**Structure Decision**: Cập nhật trực tiếp trên thư mục `src/` hiện có, giữ nguyên logic state (Zustand) và routing (React Router).
