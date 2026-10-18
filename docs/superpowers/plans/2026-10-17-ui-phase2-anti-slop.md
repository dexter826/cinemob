# UI Phase 2 — De-default + Chuẩn hóa UI Kit + Review Toàn bộ Code

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (native). Steps use `- [ ]` tracking.

**Goal:** Đợt 2 redesign — giữ khung Editorial Print nhưng đoạn tuyệt các default AI (caps-eyebrow, dot-joins, cream, stat-hero máy móc), chuẩn hóa bộ UI kit dùng đồng bộ toàn app, review code toàn bộ theo code-refactor 7 trục.

**Architecture:** Review trước (findings thành task) → UI kit theo kiến trúc Base→Variants→Sizes→States (tailwind-design-system) → de-default pass → gates nghiệm thu (hallmark slop-test + web-design-guidelines).

**Tech Stack:** Không đổi. Không thêm dependency.

**Spec:** [design doc](../specs/2026-10-17-ui-rebuild-editorial-design.md) + [MASTER.md](../../../design-system/cinemob/MASTER.md). Tư duy tham chiếu: hallmark (pre-flight, diversification, slop gates, 8-state), frontend-design (default-tells list, one-boldness-per-page), caveman (terse), tailwind-design-system (token hierarchy, component architecture).

## Global Constraints

- Nhánh `feat/ui-rebuild-editorial-print`, commit từng task, review code-refactor 7 trục sau từng task (yêu cầu bắt buộc của chủ dự án).
- Không thêm dependency. File kebab-case, comment tiếng Việt.
- Giữ: dark-first #0A0A0A + gold #CA8A04, hairline, radius 8/4, Anton + Be Vietnam Pro, PosterCard duy nhất.
- Đổi: light → trắng thuần; caps/dot-joins giảm mạnh; mỗi trang một điểm nhấn duy nhất.

## Review Focus

1. Caps vô nghĩa trên heading/label → trang nào còn, xóa trang đó (task P2 grep `uppercase` từng file).
2. Dot-join `·` trang trí (lặp thông tin đã có chỗ khác) — bài học từ hình 2.
3. Component kit: mọi call-site input/chip phải đi qua kit, cấm inline custom mới.
4. Contrast cặp mới sau đổi light (#0A0A0A ink trên #FFFFFF; gold #8F6400 trên trắng).
5. 8 states cho component kit: default/hover/focus-visible/active/disabled (+loading/error/success nơi có nghĩa).

---

### Task P0: Code-refactor toàn bộ src/ (7 trục, mode A)

**Files:** đọc toàn bộ `src/app`, `src/shared`, `src/features` (~60 file); không sửa trong task này.

- [ ] Bước 1: Đọc từng file, chấm 7 trục (naming / size / DRY / error / structure / security / testability).
- [ ] Bước 2: Ghi báo cáo `docs/superpowers/specs/2026-10-17-code-review-report.md` — BLOCKER/MAJOR/MINOR/NIT, mỗi mục `file:dòng` + cách sửa; findings BLOCKER/MAJOR trở thành task riêng bên dưới (P0.1…n).
- [ ] Bước 3: Chủ dự án duyệt report → mới sửa.

### Task P1: UI kit chuẩn hóa (đặt tên ngắn, 8 states)

**Files:**

- Create: `src/shared/components/ui/search.tsx` (đổi tên từ search-input; props giữ nguyên), `text-field.tsx`, `chip.tsx`, `stat.tsx` (đổi tên từ stats-card), `section-header.tsx`, `index.ts` (barrel).
- Modify: các file đang inline input/chip/stat → đi qua kit.

**Interfaces (kit cuối):** Button, IconButton, Search, TextField, Dropdown, MultiSelectDropdown, DatePicker, TimePicker, Switch, Chip (variant: status|stamp|neutral), Stat, SectionHeader, PageHeader, PosterCard (features/movies), Dialog, Pagination, EmptyState, ErrorState, SkeletonCard, ScrollToTop, Toast/Alert.

- [ ] Bước 1: Viết `Chip`, `TextField`, `SectionHeader`, `Stat`, đổi tên `search-input.tsx` → `search.tsx` (+ update imports).
- [ ] Bước 2: Mỗi component docs 8 states ở đầu file; thiếu state nào bổ sung state đó (vd TextField error state).
- [ ] Bước 3: Thay call-site inline: inputs rời → TextField/Search; chip đếm còn sót → Chip; stat block → Stat.
- [ ] Bước 4: `index.ts` barrel + lint (cấm import sâu `ui/ten-file` ngoài barrel? — quyết: barrel khuyến khích, không cấm cứng).
- [ ] Bước 5: Verify typecheck + build + grep không còn `h-11 bg-transparent border border-border rounded-control` inline mới.

### Task P2: De-default pass

**Files:** toàn bộ trang + MASTER.md.

- [ ] Bước 1: Light mode `#F4F1EA` → `#FFFFFF`; ink → `#0A0A0A`; border light đậm hơn 1 bậc để hairline còn thấy (#00000026); check contrast cặp mới; cập nhật MASTER.md.
- [ ] Bước 2: Grep `uppercase` từng file — giữ: tabs, badge status, chip hệ thống, nhãn SectionHeader (1 cấp duy nhất); bỏ caps eyebrow trang trí + caps trên heading lớn (heading Anton giữ uppercase? — quyết: Anton heading BỎ uppercase, dùng capitalization tự nhiên để thoát broadsheet-tell).
- [ ] Bước 3: Grep `·` — xóa join trùng thông tin; giữ meta một-câu-thật.
- [ ] Bước 4: Verify build + so sánh từng trang với danh sách default-tells (frontend-design §calibration).

### Task P3: Chất điện ảnh riêng từng trang (one boldness per page)

- [ ] Bước 1: Dashboard — hero giữ số lớn nhưng bỏ eyebrow "Thư viện"; thêm dòng ngữ cảnh điện ảnh thật (đang xem dở + tập tiếp theo từ calendar data nếu có).
- [ ] Bước 2: Chi tiết phim — bố cục "press kit": poster + khối credit (đạo diễn/diễn viên) thành bảng hairline hai cột label:value, bỏ chip vo viên.
- [ ] Bước 3: Lịch — hàng ngày kiểu bảng suất chiếu (giờ đậm, ngày là label cột).
- [ ] Bước 4: Verify từng trang vs danh sách tells + reduced-motion + 375px.

### Task P4: Gates nghiệm thu

- [ ] Bước 1: Fetch web-design-guidelines (vercel command.md) → review key files → fix findings.
- [ ] Bước 2: Slop-gate tự định (danh sách tells + hallmark gates áp dụng được): chạy qua từng trang, chấm 6 trục pre-emit critique ≥3.
- [ ] Bước 3: lint/typecheck/build/lint-zero; cập nhật MASTER.md + design doc (mọi thay đổi quyết định).

### Task P5: Review cuối + tổng kết

- [ ] Bước 1: Code-refactor review diff toàn đợt (7 trục) — sửa BLOCKER/MAJOR.
- [ ] Bước 2: Tổng kết rulings + deferred cho chủ dự án.
