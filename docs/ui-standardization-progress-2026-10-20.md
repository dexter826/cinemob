# Chuẩn hoá UI — log triển khai

Bắt đầu: 20/10/2026. Nhánh: `feat/ui-standardization`. Spec: `docs/superpowers/specs/2026-10-20-ui-standardization-design.md`. Chuẩn thiết kế: `DESIGN.md`.

Log này là nơi ghi lại quá trình: task đã chạy, lệnh verify, kết quả gate, review 7 trục sau mỗi task, và các điểm lệch so với skill `executing-plans`. Không commit nếu người dùng không yêu cầu.

## Quy trình chuẩn (áp dụng mọi phase từ Phase 1 trở đi)

1. Plan riêng cho từng phase: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-N.md`.
2. Mỗi task: đọc plan → sửa code → Prettier → `npm run typecheck` → `npm run lint` → `npm run build` → gate grep → đánh dấu checkbox của task đó trong plan.
3. Sau mỗi task: review code theo 7 trục của skill `code-refactor` (chế độ A — review report): naming; kích thước & trách nhiệm; DRY; xử lý lỗi; cấu trúc & phụ thuộc; bảo mật & dữ liệu cá nhân; khả năng test. Phân loại BLOCKER/MAJOR/MINOR/NIT; không bịa phát hiện khi code sạch.
4. Kết quả review ghi vào log này. BLOCKER/MAJOR sửa ngay trong task đó rồi chạy lại gate.
5. Cuối phase: review 7 trục cho toàn phase, tổng kết gate, ghi giới hạn kiểm chứng runtime.

## Lệch so với skill `executing-plans` (đã biết, chấp nhận có lý do)

| Yêu cầu của skill                                         | Thực tế                                                                                             | Lý do                                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Bắt đầu bằng câu "I'm using the executing-plans skill..." | Nói "Inline. Implement Phase 1 theo plan" — không đúng mẫu                                          | Sửa từ Phase 2 trở đi: tuyên bố rõ skill khi bắt đầu phase                           |
| Dùng `subagent-driven-development` khi có subagent        | Chạy inline                                                                                         | Người dùng chọn inline cho phase nhỏ; cân nhắc lại khi phase có nhiều file song song |
| `using-git-worktrees` để cô lập workspace                 | Làm trực tiếp trên nhánh `feat/ui-standardization`                                                  | Quyết định trước đó của người dùng; đánh đổi isolation để đổi lấy tiện thao tác      |
| Đánh dấu tiến độ trong plan ngay khi xong từng task       | Phase 1 đánh dấu một lần ở cuối (12/12 checkbox)                                                    | Đã sửa: từ Phase 2 đánh dấu ngay sau từng task                                       |
| `finishing-a-development-branch` sau khi xong tất cả task | Chưa chạy                                                                                           | Phase 1-6 là một chuỗi; chạy khi kết thúc Phase 6, trước khi merge/PR                |
| Báo cáo sau mỗi task                                      | Chỉ báo tổng kết cuối phase                                                                         | Đã sửa: mỗi task có step review 7 trục + cập nhật log                                |
| Nêu lo ngại về plan trước khi code                        | Có sửa plan/spec khi thấy lệch (display uppercase, `git grep` thiếu `-E`) nhưng tự quyết, không hỏi | Sửa: lệch ảnh hưởng scope/visual thì dừng hỏi người dùng trước khi sửa               |

## Phase 0 — Docs (đã commit)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-0.md`.
- Commit: `77eb9be docs(design): add UI utility rules, drop old specs` (7 file, +541/−1375).
- Nội dung: cập nhật `DESIGN.md` (tên utility typography, ngoại lệ 404/splash/chart axis/micro-spacing/pagination/logo/picker/poster overlay), xoá 2 spec + 2 plan cũ, giữ `docs/loading-audit-2026-10-18.md`.
- Verify: Prettier pass; `git diff --check` sạch; grep xác nhận nội dung `DESIGN.md`; 4 file cũ biến mất; không có file `src/` nào bị đụng.
- Review 7 trục: không áp dụng (chỉ docs). Ghi nhận yêu cầu của người dùng đã áp dụng: `DESIGN.md` chỉ chứa quy chuẩn thiết kế, không chứa đường dẫn spec/plan; spec §9.4 cấm điều này.

## Phase 1 — Foundation (code xong, chưa commit)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-1.md` (12/12 checkbox đã đánh dấu).
- Task 1: thêm 10 utility typography vào `src/index.css` (`text-display-xl`, `text-display-lg`, `text-display-stat`, `text-display-404`, `text-title-lg`, `text-title-md`, `text-body`, `text-body-sm`, `text-label-caps`, `text-micro-caps`).
- Task 2: thêm utility `focus-ring`; đổi `--color-warning` light `#a16207` → `#9a5d06` (dark `#fbbf24` giữ nguyên); xác nhận radius token `control/card/dialog` 8px, `poster` 4px — không sửa.
- Gate: `#a16207` → 0; warning → đúng 2 dòng; `focus-ring` → 1; radius → đúng 4 dòng; `text-transform: uppercase` chỉ ở `label-caps`/`micro-caps`; không có file `src/` nào khác bị đụng.
- Lệnh đã chạy: `npx prettier --write/--check`, `npm run typecheck`, `npm run lint`, `npm run build` — tất cả exit 0; `git diff --check` sạch.

### Kiểm chứng CSS thực sự được sinh

Tailwind v4 chỉ sinh utility khi tên class xuất hiện trong nguồn được quét, nên build pass không tự chứng minh utility hoạt động. Đã kiểm chứng bằng probe tạm `src/temp-utility-probe.ts` chứa đủ 10 tên class + `focus-ring`:

- 10/10 utility + `focus-ring` có mặt trong `dist/assets/index-*.css`.
- Media query lồng trong `@utility` compile đúng: `.text-display-xl` 30px → 36px (`min-width:40rem`) → 48px (`min-width:48rem`); `.text-display-lg` 24→30→36; `.text-display-stat` 48→60; `.text-display-404` 72→96.
- `focus-ring` compile thành `.focus-ring:focus-visible{outline:2px solid var(--color-focus);outline-offset:3px}`.
- Probe đã xoá sau khi kiểm; build lại sạch.

Phát hiện phụ: Tailwind v4 auto-detect quét cả file `.md` trong repo, nên tên utility nằm trong plan/spec khiến utility vẫn được emit dù chưa component nào dùng. Vô hại với runtime, nhưng hash CSS phụ thuộc nội dung docs — cần biết khi đọc output build.

### Review 7 trục (chế độ A) — Phase 1

Tóm tắt: thay đổi Phase 1 nằm trọn trong `src/index.css` — 10 utility typography mới, 1 utility focus, 1 token màu. Không có logic, không có I/O, không có dependency mới. Kết quả: 0 BLOCKER, 0 MAJOR, 2 MINOR, 1 NIT.

MINOR

1. Hai nguồn sự thật cho focus ring — `src/index.css:141-144` (base layer) đã đặt `outline: 2px solid var(--color-focus); outline-offset: 3px` cho mọi phần tử focusable; utility `focus-ring` lặp lại đúng giá trị đó. Sửa một chỗ là hai chỗ lệch nhau. Cách sửa: khai báo cặp giá trị chung (vd `--focus-ring-width`/`--focus-ring-offset` trong `@theme`) cho cả hai, hoặc bỏ global rule và bắt buộc class `focus-ring`. Quyết định khi sweep focus toàn app ở Phase 3 — lúc đó mới biết có thể bỏ global hay không. Chưa sửa ở Phase 1 vì nằm ngoài diff của task.
2. `.font-display` trong `@layer base` (`src/index.css:248-250`) trùng với utility `font-display` mà Tailwind tự sinh từ token `--font-display`. Đây là code có sẵn từ trước Phase 1, không nằm trong diff; ghi nhận để dọn ở phase sau nếu xác nhận không dùng.

NIT

- `text-display-stat` và `text-display-404` là modifier nhưng dùng chung tiền tố `text-display-*` với scale, người đọc không phân biệt ngay. Tên do `DESIGN.md` quy định nên giữ nguyên.

Đã rà và thấy sạch

- Naming: tên utility khớp đúng contract trong `DESIGN.md` §Implementation Notes; `focus-ring` mô tả đúng việc.
- Kích thước & trách nhiệm: mỗi utility một trách nhiệm, không có nhánh điều kiện nào cần tách.
- Xử lý lỗi: CSS không có nhánh lỗi; không có `catch` nào bị nuốt trong diff.
- Cấu trúc & phụ thuộc: chỉ phụ thuộc token trong `@theme` (`--font-display`, `--font-sans`, `--color-focus`, `--color-warning`); không phát sinh phụ thuộc vòng, không import mới.
- Bảo mật: không có credential, không log dữ liệu người dùng, không nhận input.
- Khả năng test: repo không có test infra (ràng buộc đã duyệt). Khả năng kiểm chứng hiện là typecheck/lint/build + gate grep + probe CSS; chưa có kiểm chứng runtime.

Giới hạn

- Chưa kiểm chứng bằng trình duyệt: font Anton có tải đúng không, line-height/letter-spacing thực tế, độ tương phản sau khi đổi warning light, hành vi focus khi bàn phím đi trên mobile. Build/lint/typecheck pass không chứng minh các điều đó.
- Utility chỉ được dùng ở Phase 2-3; trước đó các class này chưa có tác động giao diện.

## Phase 2 — Shared primitives (đã có plan, chưa chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-2.md` — 6 task: (1) Button/Chip + verify primitive nền; (2) form controls; (3) DatePicker/TimePicker; (4) Dialog/Toast/Pagination; (5) PosterCard/AlbumCard; (6) verify toàn phase.
- Mỗi task giờ có step review 7 trục + cập nhật log này; checkbox đánh dấu ngay sau từng task.
- Chưa chạy. Cần người dùng xác nhận chạy inline hay subagent.
