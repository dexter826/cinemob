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

## Phase 2 — Shared primitives (đã có plan, đang chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-2.md` — 6 task: (1) Button/Chip + verify primitive nền; (2) form controls; (3) DatePicker/TimePicker; (4) Dialog/Toast/Pagination; (5) PosterCard/AlbumCard; (6) verify toàn phase.
- Mỗi task giờ có step review 7 trục + cập nhật log này; checkbox đánh dấu ngay sau từng task.
- Cách chạy: tuần tự inline (người dùng chọn).

### Task 1 — Button, Chip + verify primitive nền

Thay đổi:

- `button.tsx`: `sm`/`md` → `text-body-sm`, `lg` → `text-body` (bỏ `text-[11px]`, `text-xs`, `text-sm`).
- `chip.tsx`: `text-[9px] font-bold uppercase tracking-[0.06em]` → `text-micro-caps`.

Verify: Prettier pass; typecheck/lint/build exit 0; gate raw size → 0, `rounded-md/lg` → 0; `icon-button.tsx` (32/40/48 + radius token), `skeleton.tsx` (`rounded-control`), `skeleton-card.tsx` (`rounded-poster`, `aspect-2/3`) đã đúng, không sửa.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 1 NIT:

- MINOR: thứ tự emit CSS quyết định weight của Button. Utility typography tự set `font-weight` (body 500, caps 600/700) còn Button áp `font-semibold` (600). Đã kiểm tra trong `dist/assets/index-*.css`: `.font-semibold` (offset 44936) emit **sau** `.text-body-sm` (42644) và `.text-body` (42540) → weight 600 thắng, đúng `DESIGN.md`. Rủi ro tương lai: nếu thêm utility mới set `font-weight` hoặc Tailwind đổi thứ tự, Button có thể rơi về 500. Xử lý: probe CSS tại Task 6 và ghi chú vào `DESIGN.md` khi chốt type contract.
- NIT: `text-body*` mang line-height cố định nên chiều cao button tăng so với `text-[11px]`/`text-xs` trước đây (sm ~25→30px, md ~36→38px, lg ~41→45px). Đây là hệ quả trực tiếp của contract "button dùng `body-sm`/`body`"; chưa kiểm chứng bằng trình duyệt, ghi vào báo cáo cuối phase 6.
- Đã rà và thấy sạch: naming utility theo đúng contract `DESIGN.md`; mỗi thay đổi là một thuộc tính trình bày, không đổi hành vi; không có nhánh lỗi, dependency, secret hay input nào bị đụng; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc CSS output.

Trạng thái git sau Task 1: `M button.tsx`, `M chip.tsx`, không có file ngoài phạm vi.

### Task 2 — Form controls

Thay đổi:

- `text-field.tsx`: label → `text-label-caps`; input → `text-body`; boxed thêm `focus-ring`; lỗi → `text-body-sm`.
- `search-field.tsx`: input → `text-body`; boxed thêm `focus-ring`; icon xóa luôn `strokeWidth={1.5}` (trước: variant boxed để mặc định 2).
- `listbox-search-input.tsx`: → `text-body` + `focus-ring` (bỏ ring 1px).
- `dropdown.tsx`: trigger dùng `focus-ring`; chữ → `text-body`; `ChevronDown` stroke 1.5; empty/option → `text-body`.
- `multi-select-dropdown.tsx`: trigger + nút xóa dùng `focus-ring`; tag và `+N` → `rounded-poster text-body-sm`; checkbox → `rounded-poster`; check → `text-on-primary` stroke 1.5; chữ → `text-body`/`text-body-sm`; icon 1.5.
- `switch.tsx`: bỏ `shadow` của nút trượt.

Verify: Prettier pass; typecheck/lint/build exit 0; gate raw size → 0, `rounded-md/lg` + `focus-visible:ring-1` + `shadow` → 0, `text-white` trong multiselect → 0.

Lỗi làm việc đã phát hiện và sửa ngay: một lần edit làm hỏng whitespace của thẻ `+N` (`<span` dính `className` trên cùng dòng). Đã sửa lại đúng format, Prettier và typecheck xác nhận sạch.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 2 NIT:

- MINOR (mở lại từ Phase 1, nay áp dụng rộng hơn): focus outline có hai nguồn sự thật — base layer `src/index.css:141-144` phủ mọi phần tử focusable, `focus-ring` lặp lại đúng giá trị. Ở task này đã thêm `focus-ring` vào 5 chỗ (2 field boxed, listbox input, 2 trigger) nên rủi ro lệch tăng. Chưa sửa vì quyết định thuộc Phase 3 khi sweep focus toàn app.
- NIT: tag multi-select dùng `text-body-sm` 12px trong `max-w-28` (112px) → chữ dễ bị truncate hơn trước (12px cũ). Chưa kiểm chứng bằng trình duyệt.
- NIT (ngoài phạm vi, ghi nhận): `dropdown.tsx` và `multi-select-dropdown.tsx` trùng logic filter + keyboard handling (~140 dòng). Không refactor ở task này vì nằm ngoài diff; nếu muốn gom thì cần task riêng có test.
- Đã rà và thấy sạch: tên class theo contract `DESIGN.md`; không đổi DOM, state, handler, ref hay cấu trúc focus; underline field giữ nguyên ngoại lệ `focus-visible:outline-none` + border-bottom; `focus-ring` chỉ áp cho phần tử focusable; không có nhánh lỗi/dependency/secret nào bị đụng; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Trạng thái git sau Task 2: `M` 6 file form control + 2 file Task 1; không có file ngoài phạm vi.

### Task 3 — DatePicker, TimePicker

Thay đổi:

- `date-picker.tsx`: tiêu đề popup → `text-title-md`; nhãn thứ → `text-label-caps`; năm/tháng → `text-body`; ô ngày → `text-body-sm`; "Hôm nay" → `text-body-sm`; trigger → `focus-ring` + `text-body`; mọi `rounded-lg` → `rounded-control`; `X`/`Calendar`/6 chevron → stroke 1.5.
- `time-picker.tsx`: tiêu đề popup → `text-title-md`; nhãn "Giờ"/"Phút" → `text-label-caps`; ô giờ/phút → `text-body-sm`; "Bây giờ" → `text-body-sm`; trigger → `focus-ring` + `text-body`; `rounded-lg` → `rounded-control`; `X`/`Clock` → stroke 1.5.

Verify: Prettier pass; typecheck/lint/build exit 0; gate raw size → 0, `rounded-md/lg` + `focus-visible:ring-1` → 0; đủ 10 icon có `strokeWidth` tường minh (date-picker 8, time-picker 2).

Lỗi làm việc đã phát hiện và sửa ngay: edit bỏ sót `strokeWidth` cho `ChevronRight` đầu tiên của nút "Năm sau" (grep mới bắt được) và vài chỗ whitespace JSX bị lệch — Prettier chuẩn hoá lại.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 4 NIT:

- MINOR (tiếp diễn từ Phase 1): focus outline hai nguồn sự thật; task này thêm `focus-ring` vào 2 trigger nữa. Quyết định gộp token hoặc bỏ global rule để Phase 3.
- NIT: nhãn thứ trong lịch từ 12px → 11px (`label-caps`); ô ngày từ `12/14px` responsive → 12px cố định → lưới lịch ở desktop thưa hơn trước. Chưa kiểm chứng bằng trình duyệt.
- NIT: tiêu đề "Chọn ngày"/"Chọn giờ" trong dialog mini từ 14px → 18px (`title-md`) → header nặng hơn trước; cần xác nhận bằng trình duyệt.
- NIT: `rounded-lg` → `rounded-control` giữ nguyên hình học 8px, chỉ đổi tên class thành token — không có thay đổi kích thước.
- NIT (ngoài phạm vi, code có sẵn): nút "Năm trước/sau" dựng chevron đôi bằng cách lặp icon với class `-mr-1.5`; nên gom thành một icon `ChevronsLeft`. Không sửa vì ngoài diff.
- Đã rà và thấy sạch: không đổi logic lịch/giờ, không đổi state, ref, keydown handler hay cấu trúc focus trap; `focus-visible:border-primary/50` bị bỏ ở trigger nhưng outline 2px vẫn còn nên không mất trạng thái focus; không có nhánh lỗi, dependency, secret nào bị đụng; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Trạng thái git sau Task 3: `M` 2 picker + 8 file task trước; không có file ngoài phạm vi.

### Task 4 — Dialog, Toast, Pagination

Thay đổi:

- `dialog.tsx`: tiêu đề → `text-title-md` (bỏ `text-base sm:text-lg` + `tracking-wide`); mô tả → `text-body-sm`; icon đóng `strokeWidth` 1.8 → 1.5.
- `toast-container.tsx`: 4 icon trạng thái → stroke 1.5; message → `text-body-sm sm:text-body` (bỏ `tracking-tight`/`leading-tight`); action → `text-body-sm`; icon đóng → stroke 1.5.
- `pagination.tsx`: số trang → `text-body-sm`; nhãn "Trang" và tổng số trang → `text-body-sm`; input trang → `rounded-control` + `focus-ring`; 2 chevron → stroke 1.5.

Verify: Prettier pass; typecheck/lint/build exit 0; gate raw size → 0, `rounded-md/lg` + `focus-visible:ring-1` + `strokeWidth={1.8` → 0.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 4 NIT:

- MINOR (tiếp diễn): focus outline hai nguồn sự thật; task này thêm `focus-ring` vào input phân trang. Quyết định ở Phase 3.
- NIT: tiêu đề dialog từ 16/18px responsive → 18px cố định và bỏ `tracking-wide` → trên mobile nhỏ hơn 2px, khoảng cách chữ thoáng hơn trước.
- NIT: message toast bỏ `leading-tight` → line-height theo `body-sm`/`body` (1.5) → toast cao hơn khi copy dài; `DESIGN.md` cho phép `body-sm` hoặc `body` nên vẫn đúng chuẩn.
- NIT: số trang trong pagination 14px → 12px (`body-sm`), khớp quy tắc button compact.
- NIT (ngoài phạm vi, code có sẵn): `ToastIcon` dùng chuỗi if-return thay vì map tone → icon; và nút đóng của `DialogHeader` không khai báo `focus-ring` nhưng vẫn có outline qua base layer. Không sửa vì ngoài diff.
- Đã rà và thấy sạch: không đổi motion (enter 200 / exit 150 khớp bảng overlay §5.2), không đổi `role`/`aria-live`, không đổi focus trap, `aria-modal`, `titleId`/`descriptionId`; `text-on-primary` ở nút trang active giữ nguyên; không có nhánh lỗi, dependency, secret nào bị đụng; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Trạng thái git sau Task 4: `M` 3 file task này + 10 file task trước; không có file ngoài phạm vi.

### Task 5 — PosterCard, AlbumCard

Thay đổi:

- `poster-card.tsx`: `Bookmark`/`Star`/`Eye` → stroke 1.5; badge rating → `text-micro-caps`; tiêu đề → `text-body-sm font-bold`; meta/credit → `text-micro-caps`.
- `album-card.tsx`: tiêu đề → `text-body-sm font-bold`; dòng "N phim" → `text-micro-caps`; nhãn "Trống" → `text-label-caps`.

Verify: Prettier pass; typecheck/lint/build exit 0; gate raw size → 0, `rounded-md/lg` → 0; `text-white` còn đúng các chỗ nền đen/overlay ảnh (media exception §2.3).

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 5 NIT:

- NIT: tiêu đề poster/album đổi line-height 1.35 → 1.5 theo `body-sm` → khối tiêu đề 2 dòng cao hơn ~2px, có thể đẩy meta xuống dưới. Chưa kiểm chứng bằng trình duyệt.
- NIT: meta/credit giờ UPPERCASE (mặc định của `micro-caps`), trước đây giữ nguyên case → thay đổi hiển thị rõ, ví dụ "Tâm lý · 2025" → "TÂM LÝ · 2025". Đúng theo `DESIGN.md` (meta là `micro-caps`), nhưng cần xác nhận thị giác.
- NIT: badge rating 10px → 9px; nhãn "Trống" của album rỗng 10px → 11px (`label-caps`).
- NIT: `text-white` còn ở 4 chỗ (tiêu đề trên scrim, nút xóa nền đen, check overlay) — đúng ngoại lệ media §2.3, không đổi sang `on-primary`.
- NIT (ngoài phạm vi, ghi nhận cho phase sau): `<img>` của poster/album chưa có `width`/`height` → thuộc Phase 3 (Imagery); `duration-200` của zoom giữ nguyên cho Phase 4.
- Đã rà và thấy sạch: không đổi props, cấu trúc DOM, logic fallback ảnh, ring/overlay chọn, hay motion zoom; không có nhánh lỗi, dependency, secret nào bị đụng; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Trạng thái git sau Task 5: `M` 2 card + 13 file task trước; không có file ngoài phạm vi.

### Task 6 — Verify toàn phase + review 7 trục toàn phase

Lệnh đã chạy: Prettier check trên 15 file → pass; `npm run typecheck` → exit 0; `npm run lint` → exit 0; `npm run build` → exit 0; `git diff --check` → sạch (sau khi bỏ một dòng trống thừa cuối file log do Prettier tạo).

Gate toàn phase trên 15 file: raw size → 0; `rounded-md/lg` → 0; `focus-visible:ring-1` → 0; `strokeWidth={1.8`/`{undefined}` → 0; `text-white` → chỉ còn 7 dòng ngoại lệ media (tiêu đề trên scrim, nút xóa nền đen, check overlay, Chip neutral).

Probe thứ tự emit CSS: `.font-semibold` ở offset 44936, sau `.text-body{` (42540) và `.text-body-sm{` (42644) → `font-semibold` vẫn thắng, Button giữ weight 600 như `DESIGN.md`; `.focus-ring` ở offset 50921, đã emit.

Review 7 trục toàn phase (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 6 NIT:

- MINOR (mở từ Phase 1, chưa đóng): focus outline có hai nguồn sự thật — base layer `src/index.css:141-144` và utility `focus-ring` (nay đã dùng ở 9 chỗ: text-field, search-field, listbox-search-input, dropdown, multi-select ×2, date-picker, time-picker, pagination). Sửa một bên là hai bên lệch. Đề xuất: khai báo `--focus-ring-width`/`--focus-ring-offset` trong `@theme` rồi dùng chung, hoặc bỏ global rule và bắt buộc class. Cần quyết định ở Phase 3 khi sweep focus toàn app — nếu giữ global rule thì `focus-ring` có thể chỉ còn là alias.
- NIT: các thay đổi hình học đáng kể đã tổng hợp, đều đúng contract nhưng chưa kiểm chứng bằng trình duyệt: chiều cao button tăng ~2-4px do line-height cố định của `body-sm`/`body`; toast cao hơn do bỏ `leading-tight`; tiêu đề poster/album line-height 1.35 → 1.5; meta/credit chuyển sang uppercase theo `micro-caps`; ô ngày trong lịch 12/14px responsive → 12px; tiêu đề popup picker 14 → 18px.
- NIT: `DESIGN.md` chưa ghi rõ chiều cao button và line-height của title trên media; nếu muốn khóa hình học sau này thì bổ sung vào bảng Typography.
- NIT: `text-body*` là utility có tên nhưng vẫn cho phép `font-semibold` ghi đè weight → phụ thuộc thứ tự emit CSS của Tailwind (đã probe, nhưng rủi ro nếu thêm utility mới set weight).
- NIT: `dropdown.tsx` và `multi-select-dropdown.tsx` vẫn trùng logic filter + keyboard (~140 dòng); ngoài phạm vi phase này.
- NIT: `<img>` poster/album chưa có `width`/`height` → Phase 3; `duration-200` của zoom giữ nguyên → Phase 4.
- Đã rà và thấy sạch: không đổi logic, state, props, event, ref hay cấu trúc DOM của bất kỳ component nào; không thêm dependency, không thêm test, không mở browser; mọi thay đổi nằm ở lớp trình bày; không có secret/PII; các ngoại lệ media (`text-white` trên ảnh) giữ nguyên theo spec §2.3.

Trạng thái git sau Task 6: 15 file `src/` + plan Phase 2 + file log; không có file ngoài phạm vi. Chưa commit (plan cấm commit; chờ người dùng).

Phase 2 xong. Tiếp theo: Phase 3 — plan sweep static toàn app (navbar/footer/mobile nav, stats, movie detail, album, profile, add-movie, filters, search/person, calendar) thay raw size bằng utility, icon 1.5, `focus-ring`, `on-primary`, thêm `width`/`height` cho ảnh. Cần người dùng xác nhận commit Phase 2 trước khi mở Phase 3.
