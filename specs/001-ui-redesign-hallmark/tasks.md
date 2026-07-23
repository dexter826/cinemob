# Tasks: ui-redesign-hallmark

**Input**: Design documents from `/specs/001-ui-redesign-hallmark/`

**Prerequisites**: plan.md, spec.md, research.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Verify Tailwind CSS v4 setup and OKLCH support in `tailwind.config.js` / `src/index.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Define OKLCH Design Tokens (Night Foundry) in `src/index.css`
- [x] T003 Remove hardcoded white/black background variables in `src/index.css`

---

## Phase 3: User Story 1 - Thẩm mỹ & Giao diện tổng thể (Priority: P1) 🎯 MVP

**Goal**: Người dùng trải nghiệm giao diện thống nhất, mang tông màu tối (Atmospheric Lumen) không chứa lỗi AI-slop.

**Independent Test**: Kiểm tra xem màn hình chính và component thẻ có bị phình to (scale) không, gradient Login còn không.

### Implementation for User Story 1

- [x] T004 [P] [US1] Loại bỏ `bg-gradient-to-br` ở `src/components/auth/Login.tsx` và cấu hình Atmospheric background (blooms).
- [x] T005 [P] [US1] Thay thế `transition-all` và `hover:scale-105` ở `src/components/ui/MovieCard.tsx` bằng `transition-colors` và `hover:ring-1` (Glow/Color shift).
- [x] T006 [P] [US1] Thực hiện loại bỏ hover scale và cấu hình lại border/glow ở `src/components/ui/TMDBMovieCard.tsx`.
- [x] T007 [P] [US1] Thực hiện loại bỏ hover scale và cấu hình lại ở `src/components/ui/StatsCard.tsx`.

---

## Phase 4: User Story 2 - Trải nghiệm Điều hướng & Footer (Priority: P2)

**Goal**: Điều hướng dạng Floating pill và Footer dạng Statement.

**Independent Test**: Nhìn vào Navbar và cuộn cuối trang xem định dạng khối nổi và văn bản Statement có đúng không.

### Implementation for User Story 2

- [x] T008 [US2] Sửa thiết kế Navbar thành dạng Floating pill (N5) ở `src/components/layout/Navbar.tsx`.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T009 [P] Kiểm tra lại toàn bộ file trong `src/` để đảm bảo không còn sót `transition-all` (Sử dụng grep_search).
- [ ] T010 Chạy `quickstart.md` để test nghiệm thu trên UI.
