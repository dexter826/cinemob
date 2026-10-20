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

## Phase 3A — App shell, shared UI, auth (đang chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-3a.md` — 6 task.
- Người dùng chốt 2 điểm trước khi viết plan: (1) chữ Anton ở size chưa có trong scale dùng 2 utility có tên mới `text-display-md` (20px) + `text-brand` (36→48px) thay vì giữ raw size; (2) Phase 3 tách 3A/3B/3C thay vì gộp 44 file.
- Phạm vi 3A: `src/index.css` + `DESIGN.md` + spec + shared UI + feedback + shell + auth. Không đụng movies/albums/profile/search/calendar/stats/dashboard (3B-3C).
- Inventory nền (từ subagent điều tra 54 file): 252 raw size, 80 icon thiếu strokeWidth, 18 radius thô, 13 focus ring, 11 `<img>` thiếu dimension.

### Task 1 — 2 utility có tên + DESIGN.md + spec

Thay đổi:

- `src/index.css`: thêm `@utility text-display-md` (Anton 20px, lh 1.2, .02em) và `@utility text-brand` (Anton 36px → 48px ở `min-width:40rem`, lh 1, .02em).
- `DESIGN.md`: Typography liệt kê đủ 6 tên display/brand; Implementation Notes thêm `text-display-md`, `text-brand` vào contract "Type utility".
- spec §3.1: thêm 2 dòng bảng + ghi chú nguồn gốc quyết định; §2.3: dòng "Splash wordmark" đổi thành "Anton 36→48px qua `text-brand`".

Verify: Prettier pass; typecheck/lint/build exit 0; gate 2 dòng `@utility` + tên xuất hiện ở DESIGN.md và spec; CSS build 86.36 → 86.86 kB (2 utility mới đã được emit).

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 2 NIT:

- NIT: `text-brand` (36→48) và `text-display-xl` (30→36→48) có vùng size gần nhau; giữ cả hai vì splash không muốn 30px ở mobile. Ghi chú để tránh gộp nhầm về sau.
- NIT: tên `text-display-md` (20px) nằm dưới `text-display-lg` (24px) — thứ tự giảm dần vẫn đúng nhưng "md" dễ bị hiểu là 18px như `title-md`; đã ghi rõ giá trị trong `DESIGN.md`.
- Đã rà và thấy sạch: 2 utility chỉ phụ thuộc token `--font-display`; không đổi token màu, không đổi layout, không ảnh hưởng component nào cho tới khi Task 2-5 dùng tới; không có nhánh lỗi/dependency/secret; khả năng kiểm chứng qua probe CSS ở Task 6.

### Task 2 — Shared UI primitives còn lại

Thay đổi: `page-header.tsx` (h1 → `text-display-lg`, subtitle → `text-body-sm sm:text-body`); `stat.tsx` (label → `text-label-caps`, số liệu → `text-display-stat`, meta dưới → `text-micro-caps`); `section-header.tsx` (label → `text-label-caps`); `empty-state.tsx` + `error-state.tsx` (h3 → `text-title-md`, mô tả → `text-body`, nút → `text-body-sm`); `loading.tsx` (chữ → `text-body-sm`).

Verify: 4 file verify-only (`loading-status`, `scroll-to-top`, `lazy-dialog`, `spinner`) không có phát hiện → không sửa; Prettier/typecheck/lint/build exit 0; gate raw size → 0.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 3 NIT:

- NIT: label của `stat.tsx` giờ UPPERCASE (trước 11px có tracking nhưng không uppercase) → đúng chuẩn caps nhưng thay đổi hiển thị.
- NIT: dòng meta số liệu dưới stat 11px → 9px (`micro-caps`).
- NIT: `text-title-md` có line-height 1.35 (so với `text-lg` mặc định 28px) → khối tiêu đề empty/error state gọn hơn; nội dung `text-body` line-height 1.5 (so với `text-sm` 20px) → chữ cao hơn ~1px.
- Đã rà và thấy sạch: `page-header` h1 (24/30/36) và `stat` số liệu (48/60) khớp **đúng** utility nên không có delta kích thước; không đổi props, DOM, logic; không có nhánh lỗi/dependency/secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

### Task 3 — Feedback + trang 404

Thay đổi: `splash-screen.tsx` (wordmark → `text-brand`, status → `text-body`); `alert-container.tsx` (h2 → `text-title-md`, icon `Info`/`AlertTriangle` → stroke 1.5 + `aria-hidden`); `error-boundary.tsx` (h → `text-title-md`, body → `text-body`, 2 nút → `rounded-control text-body-sm`); `not-found-page.tsx` (404 → `text-display-404`, dòng phụ → `text-label-caps`, nút → `text-body-sm`).

Verify: Prettier/typecheck/lint/build exit 0; gate raw size + `rounded-md/lg` → 0; `confetti-burst.tsx` giữ `rounded-[1px]` (hạt trang trí, ngoại lệ có tên).

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 3 NIT:

- NIT: tiêu đề alert 20px → 18px (`title-md`); nút trong error boundary 14px → 12px (`body-sm`).
- NIT: icon alert thêm `aria-hidden="true"` (trước không có) → icon trang trí không còn bị đọc sai bởi screen reader; đúng `DESIGN.md` §Button & IconButton.
- NIT: `rounded-lg` → `rounded-control` giữ nguyên 8px nên không đổi hình học; wordmark splash 36→48 và số 404 72→96 khớp **đúng** utility nên không có delta.
- Đã rà và thấy sạch: không đổi props, copy, state, focus trap, `role`/`aria-live`; không có nhánh lỗi/dependency/secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

### Task 4 — App shell (navbar, mobile nav, footer, layout)

Thay đổi: `navbar.tsx` (brand → `text-display-md`, link nav → `text-label-caps`, chữ avatar → `text-body-sm`, tên + 3 dòng menu → `text-body`, `ChevronDown` → stroke 1.5, ảnh avatar thêm `width/height` 28); `mobile-bottom-nav.tsx` (nhãn tab → `text-micro-caps`, giữ icon active 2); `footer.tsx` (brand → `text-display-md`, copyright → `text-micro-caps`); `layout.tsx` (skip link → `focus:text-body-sm`).

Verify: Prettier/typecheck/lint/build exit 0; gate raw size → 0.

Quyết định trong task: ảnh avatar navbar **không** thêm `loading="lazy"` (plan ghi "nếu chưa có") vì navbar luôn ở trên màn hình đầu — lazy ở above-the-fold là anti-pattern. Chỉ thêm `width`/`height` để chặn layout shift.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 3 NIT:

- NIT: link navbar 11.5px → 11px và tracking .08em → .1em (chuẩn `label-caps`).
- NIT: brand footer 18px → 20px (`text-display-md`); copyright footer 10px → 9px (`micro-caps`).
- NIT: `focus:text-body-sm` trên skip link — biến thể `focus:` với custom utility hoạt động vì Tailwind v4 áp variant cho `@utility`; cần xác nhận bằng trình duyệt.
- Đã rà và thấy sạch: không đổi props, state, handler, `aria-*`, cấu trúc menu; `duration-200` giữ nguyên cho Phase 4; không có nhánh lỗi/dependency/secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

### Task 5 — Auth (login)

Thay đổi: `login.tsx` (wordmark → `text-display-lg`, h1 → `text-display-xl`, mô tả → `text-body`, nút → `text-body-sm`, footer → `text-micro-caps`, ảnh `PosterTile` thêm `width={500} height={750}`).

Hai chỗ lệch so với plan, đã sửa và ghi lại:

- Plan ghi wordmark login dùng `text-brand`, nhưng `text-brand` đã chốt là 36→48px cho splash. Sửa: wordmark login (24px) dùng `text-display-lg` (24→30→36), và sửa lại dòng giải thích trong `DESIGN.md`.
- Plan ghi ảnh hero login thêm `fetchpriority="high"`; đọc code thấy đó là dải poster trang trí trong `PosterTile` (`alt="" aria-hidden`), không phải ảnh chính → không thêm `fetchpriority`, chỉ thêm `width`/`height` để chặn layout shift.

Verify: Prettier/typecheck/lint/build exit 0; gate raw size trong `src/features/auth` → 0; `auth-provider.tsx` không có phát hiện → không sửa.

Review 7 trục (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 3 NIT:

- NIT: wordmark login 24px cố định → 24/30/36 responsive (`display-lg`); h1 hero 30/36 → 30/36/48 (`display-xl`, thêm bậc 48 ở `md`).
- NIT: nút đăng nhập 12px → 12px (`body-sm`) nhưng line-height theo utility 1.5 thay vì mặc định; footer 10px → 9px (`micro-caps`).
- NIT: `text-display-lg`/`text-display-xl` có font Anton sẵn nên bỏ được `font-display`; không đổi font thực tế.
- Đã rà và thấy sạch: không đổi props, state, handler, `aria-*`, copy, logic đăng nhập; `console.error` giữ nguyên; không có nhánh lỗi/dependency/secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

### Task 6 — Verify toàn phase 3A + review toàn phase

Lệnh: Prettier check 18 file → pass; `npm run typecheck` / `npm run lint` / `npm run build` → exit 0; `git diff --check` → sạch.

Gate 15 file Phase 3A: raw size → 0; `rounded-md/lg` → 0; `focus-visible:ring-1|ring-4` → 0; `strokeWidth={1.8|2|2.5|undefined}` → 0; `text-white` → 0.

Probe CSS (offset trong `dist/assets/index-*.css`): `.text-display-lg` 41730, `.text-display-xl` 41963, `.text-brand` 42193, `.text-display-404` 42355, `.text-display-stat` 42525, `.text-body` 42702, `.text-display-md` 42913, `.font-semibold` 45265 → `font-semibold` vẫn emit sau mọi utility typography nên weight 600 của component không bị ghi đè.

Còn lại trong repo sau 3A: 197 dòng raw size trong 32 file; 44 file còn icon Lucide (phần lớn thiếu `strokeWidth`) → thuộc Phase 3B/3C.

Review 7 trục toàn phase (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 4 NIT:

- MINOR (vẫn mở từ Phase 1): focus outline hai nguồn sự thật. Phase 3A không thêm `focus-ring` ở đâu (không có focus-ring hit trong 3A) nên mức rủi ro chưa tăng; 13 chỗ `focus-visible:ring-*` còn lại nằm ở 3B/3C — quyết định gộp token hoặc bỏ global rule sẽ chốt khi sweep xong.
- NIT: 6 delta kích thước đã liệt kê ở từng task (button/toast/poster/picker/link navbar/brand footer) — cần kiểm chứng bằng trình duyệt.
- NIT: `text-display-md` (20px) dễ bị nhầm với `text-title-md` (18px) — đã ghi rõ giá trị trong `DESIGN.md`.
- NIT: `focus:text-body-sm` trên skip link là biến thể `focus:` áp cho custom utility; cần xác nhận trình duyệt.
- NIT: `text-brand` chỉ dùng 1 chỗ (splash) — utility mới sinh ra từ 1 use case; giữ vì nó khớp ngoại lệ đã có tên trong `DESIGN.md` và splash không dùng được `display-xl` (base 30 thay vì 36).
- Đã rà và thấy sạch: 18 file đổi đều là thay class trình bày, không đổi props/state/import/logic/copy; không có nhánh lỗi, dependency, secret hay PII nào bị đụng; thêm `aria-hidden` cho icon trang trí và `width`/`height` cho 2 ảnh là cải thiện accessibility/CLS đúng `DESIGN.md`; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + probe CSS.

Trạng thái git sau Task 6: 16 file `src/` + `DESIGN.md` + spec + log; plan 3A untracked. Chưa commit (plan cấm commit; chờ người dùng).

Phase 3A xong. Tiếp theo: Phase 3B (movies + albums: `movie-detail-page`, `add-movie-modal`, `movie-form-fields`, `tv-progress-section`, `album-section`, `rating-section`, `poster-preview`, `random-picker-modal`, `picker-wheel`, `album-detail-page`, `album-selector-modal`) — 10 file, 18 raw size + 6 radius + 5 focus ring + 20 icon + 1 `text-white` + 2 ảnh.

## Phase 3B — Movies + Albums (đang chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-3b.md` — 6 task, 36/36 step đã đánh dấu.
- Người dùng chốt scope: đúng 11 file movies+albums (không gồm `status-toggle.tsx` và `create-album-modal.tsx` — 2 file này chuyển sang 3C).

### Lỗi làm việc đã gặp trong phase này (2 lần, đều do dùng shell để sửa file)

1. PowerShell `Get-Content`/`Set-Content` đọc file UTF-8 không BOM theo ANSI → làm hỏng toàn bộ tiếng Việt trong 3 file (`movie-form-fields.tsx`, `album-section.tsx`, `rating-section.tsx`). Đã khôi phục bằng `git checkout --` rồi áp lại bằng công cụ `edit`; đã quét toàn repo bằng mẫu mojibake (`á»`, `Ã¡`) → sạch.
2. Một lần `edit` với `oldString` nhiều dòng đã nuốt mất các dòng JSX giữa (làm vỡ `movie-form-fields.tsx`). Đã khôi phục và áp lại bằng `oldString` **một dòng** + `replaceAll` cho class lặp.

Bài học đã ghi vào Global Constraints của plan 3B: chỉ dùng công cụ `edit` để sửa file nguồn; nếu dùng PowerShell để ghi thì phải đọc/ghi bằng `[IO.File]::ReadAllText/WriteAllText` với UTF-8, không dùng `Get-Content`/`Set-Content` mặc định.

### Task 1 — Movie detail page

14 chỗ typography + 9 icon stroke 1.5. `h1` (30/36/48) khớp **đúng** `text-display-xl`; số điểm chi tiết 20px khớp `text-display-md`.

### Task 2 — Add movie (modal + form fields + 3 section)

21 raw size ở modal, 10 ở form fields, 4 ở album-section, 2 ở rating-section; 7 focus ring → `focus-ring`; 22 icon → 1.5; ảnh poster preview thêm `width/height` 500×750.

### Task 3 — TV progress section

9 raw size; checkbox `rounded-lg` → `rounded-poster` (4px, theo spec "checkbox nhỏ → 4"); dấu tick trên nền `checked:bg-primary` đổi `text-white` → `text-on-primary`; 4 nút bước 40px `rounded-lg` → `rounded-control` (8px, giữ nguyên hình học).

### Task 4 — Album detail page

18 raw size; h2 (18/20) → `text-title-lg`; đếm phim 11px → `text-label-caps`; nhãn "Đang gỡ…" 9px → `text-micro-caps`; input tên album → `focus-ring`. Giữ `text-white` ở nút xoá overlay (ngoại lệ media).

### Task 5 — Random picker + album selector modal

9 raw size; title Anton 20px → `text-display-md`; `X` stroke 1.8 → 1.5; icon `FolderPlus`/`Film` → 1.5; 3 ảnh picker thêm `width`/`height` theo đúng khung hiển thị (96×144, 144×208); album selector: label → `label-caps`, tên album → `text-title-md`, input → `focus-ring`.

### Task 6 — Verify toàn phase 3B

Prettier/typecheck/lint/build exit 0; `git diff --check` sạch. Gate 11 file: raw size → 0; `rounded-md/lg` → 0; `focus-visible:ring-*` → 0; `strokeWidth={1.8|2|undefined}` → 0 (chỉ còn `2.5` của chevron picker, ngoại lệ); `text-white` → chỉ còn nút xoá overlay album (ngoại lệ media); không còn mojibake.

Review 7 trục toàn phase (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 5 NIT:

- NIT: nhãn form trong add-movie đổi 14px → 11px uppercase (`label-caps`) — thay đổi hiển thị lớn nhất của phase, đúng chuẩn `DESIGN.md` §TextField.
- NIT: tagline phim 16/18px → 14px (`text-body`); nội dung review 15px → 14px.
- NIT: số điểm lớn 30px cố định → `text-display-lg` (24 ở mobile, 30 từ `sm`) → nhỏ hơn ở mobile.
- NIT: modal add-movie h2 20/24px → 20px (`title-lg`); h2 album detail 18/20 → 20px (`title-lg`).
- NIT: checkbox TV đổi bo góc 8px → 4px (theo spec); `focus-visible:ring-4` của textarea review đồng bộ về `focus-ring` 2px như 3 input cùng nhóm (trước đó lệch nhau).
- Đã rà và thấy sạch: 11 file đều chỉ thay class trình bày, không đổi props/state/handler/logic/copy/motion timing; `text-on-primary` chỉ áp cho nền primary đặc; ảnh thêm `width`/`height` đúng tỉ lệ; không có nhánh lỗi, dependency, secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Còn lại cho Phase 3C: `status-toggle.tsx`, `create-album-modal.tsx` (movies) + toàn bộ profile/search/calendar/stats/dashboard.

## Phase 3C — Profile, search, calendar, stats, dashboard (đang chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-3c.md`.
- Nguồn mapping: subagent điều tra trả về 163 dòng thay thế chính xác (file:line → old → new) cho 22 file.
- Cách áp dụng: **script Node** đọc/ghi UTF-8 (`node:fs`) thay vì PowerShell — lượt 1 áp 151/163 (12 chỗ không khớp do fragment nhiều dòng lệch thụt lề), lượt 2 vá 9 chỗ còn lại. Script tạm đã xoá sau khi chạy. Quét mojibake toàn repo → sạch.

### Task 1-5 — Áp mapping theo khu vực

- Profile (8 file): 165 thay. Chữ cái avatar → `text-display-lg` (Anton 24/30/36, bỏ `font-bold` vì Anton chỉ có 400; `display-xl` 48px sẽ tràn khung 80px). 4 ảnh thêm `width`/`height` (80×80, 80×80, 48×48, 220×220). Nhãn form → `text-label-caps`; input/textarea → `focus-ring`; 3 skeleton `rounded-md` → `rounded-poster`.
- Search (5 file): 46 thay. Nhãn field → `text-label-caps`; ảnh người 192×288; thumbnail poster → `rounded-poster`.
- Calendar (3 file): 21 thay. Số ngày/nhãn → `text-body-sm`; heading → `text-title-md`.
- Stats + dashboard (5 file): 22 thay. Heading → `text-title-md`; số xếp hạng `text-xl` → `text-title-lg` (giữ 20px); badge năm → `rounded-control`; chip/badge → `text-label-caps`/`text-micro-caps`.
- `status-toggle.tsx`: 2 nhãn tab → `text-body-sm`. `create-album-modal.tsx`: không có phát hiện → không sửa.

### Task 6 — Sweep nốt (phát hiện bằng script quét riêng)

Script Node quét `<LucideIcon ... />` không có `strokeWidth` trong mọi file: còn **4** icon (`AlignLeft` trong movie-form-fields, `ArrowLeft` trong page-header, 2 `ArrowUpToLine` trong scroll-to-top) → thêm `strokeWidth={1.5}`. Script quét `<img>` không có `width`: còn **5** ảnh (poster-card ×2, album-card ×3) → thêm `width`/`height` theo kích thước ảnh TMDB (500×750, 185×278).

### Verify toàn phase 3C + toàn repo

Prettier/typecheck/lint/build exit 0; `git diff --check` sạch; không còn mojibake.

Trạng thái gate toàn repo `src/` sau Phase 3:

| Gate                                   | Kết quả                                                  |
| -------------------------------------- | -------------------------------------------------------- |
| raw size (`text-[Npx]`, `text-xs…9xl`) | **0**                                                    |
| `rounded-md` / `rounded-lg`            | **0**                                                    |
| `focus-visible:ring-N`                 | **0**                                                    |
| `strokeWidth={1.8}` / `{undefined}`    | **0**                                                    |
| icon Lucide thiếu `strokeWidth`        | **0** (script quét toàn repo)                            |
| `<img>` thiếu `width`/`height`         | **0**                                                    |
| `text-white`                           | 9 chỗ, đều là ngoại lệ media (poster/album/chip neutral) |

Review 7 trục toàn phase (chế độ A) — 0 BLOCKER, 0 MAJOR, 1 MINOR, 5 NIT:

- MINOR (vẫn mở từ Phase 1): focus outline có hai nguồn sự thật (base layer `src/index.css:141-144` + utility `focus-ring`, nay đã dùng ở ~30 chỗ). Phase 3 đã loại hết ring cục bộ nên chỉ còn global rule và `focus-ring` — đây là thời điểm gộp token (`--focus-ring-width`/`--focus-ring-offset`) hoặc bỏ global rule cho sạch. Đề xuất xử lý ở Phase 6 cùng báo cáo cuối.
- NIT: chữ cái avatar đổi sang font Anton (trước là sans) — thay đổi thị giác rõ nhất của phase, cần xác nhận bằng trình duyệt.
- NIT: label form 12px → 11px uppercase (`label-caps`); meta số 11px → 9px (`micro-caps`).
- NIT: `text-xl` ở một số heading → `text-title-lg` (giữ 20px) thay vì co về 18px; heading `text-lg` → `text-title-md` (giữ 18px).
- NIT: badge năm trong stats `rounded-lg` → `rounded-control` (8px, không đổi hình học); chip `strokeWidth={2}` giữ nguyên (ngoại lệ nhỏ, đã ghi trong plan).
- Đã rà và thấy sạch: 28 file đổi đều là thay class trình bày, không đổi props/state/handler/logic/copy/motion timing; ảnh thêm kích thước không đổi layout (đều nằm trong khung có tỉ lệ cố định); không có nhánh lỗi, dependency, secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + script quét + đọc diff.

Trạng thái git: 28 file `src/` + plan 3C untracked + log. Chưa commit (plan cấm commit; chờ người dùng).

Phase 3 (static sweep) hoàn tất toàn app. Tiếp theo: Phase 4 (motion) — sweep `duration-200` micro, verify bảng overlay §5.2, dọn dead code.

## Phase 4 — Motion (đang chạy)

- Plan: `docs/superpowers/plans/2026-10-20-ui-standardization-phase-4.md`.

### Task 1 — Sweep micro hover

16 site `duration-200` → `duration-150`: navbar (3 menu row), album-card (nút xoá), episode-list (row hover), dashboard-filters (2 gạch chân bộ lọc + 1 nút icon), movie-form-fields (3 scale lỗi), poster-card (nhóm action), footer (link), search-field (gạch chân), date-picker + time-picker (hover border).

Giữ nguyên: `duration-200` cho zoom/rotate poster & album (4 site) và `duration-250` cho progress bar (2 site) — đúng bảng role §5.1.

### Task 2 — Verify bảng overlay, constants, dead code

| Lớp                    | Kỳ vọng               | Kết quả                                                                                                                              |
| ---------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Dialog backdrop        | enter 200 / exit 150  | ✅ `buildDialogVariants`: enter `medium`, exit `base`                                                                                |
| Dialog panel           | fade + y8 200 / 150   | ✅ cùng hàm, `y: 8`                                                                                                                  |
| Sheet backdrop + panel | enter 250 / exit 200  | ✅ `isSheet` → `slow` / `medium`                                                                                                     |
| Dropdown / MultiSelect | 120 / 120             | ✅ `getPanelMotion` (`fast`)                                                                                                         |
| Popover date/time      | 120 / 120             | ✅ `getPanelMotion`                                                                                                                  |
| Menu tài khoản         | 120 / 120             | ✅ `navbar.tsx` `getPanelMotion`                                                                                                     |
| Toast                  | enter 200 / exit 150  | ✅ `toastTransition` = medium, exit = base                                                                                           |
| Route                  | enter 200, không exit | ✅ `--animate-page-enter: page-enter 0.2s`                                                                                           |
| Suggestions            | 120                   | ⚠️ `random-suggestions-section.tsx` là section tĩnh trong trang, không có overlay enter/exit → bảng overlay không áp dụng; không sửa |

Constants `MOTION_DURATION` (fast .12 / base .15 / medium .2 / slow .25 + picker 3.15 / pickerAudioTail 1.95) và `MOTION_EASING` (standard/enter/exit) khớp spec. Token `--ease-standard/enter/exit` + `--animate-page-enter` có trong `src/index.css`.

Tailwind sinh đủ `duration-150`/`duration-200`/`duration-250` trong CSS build → lo lắng của spec §5.4 ("kiểm tra duration có được sinh") đã được giải quyết, không cần token riêng.

Dead code: không còn token `slide-in-right`/`slide-down`/`fade-in`/`splash-rule`; chỉ còn `layoutId="dashboard-tab-underline"` (chuyển tab, hợp lệ theo §5.1 "layoutId tab underline").

### Task 3 — Gate toàn phase

Giá trị duration còn lại trong `src/`: **150 ×17**, **200 ×4** (zoom poster/album), **250 ×2** (progress). Không có `duration-75/300/500/1000`. Prettier/typecheck/lint/build exit 0; `git diff --check` sạch.

Review 7 trục toàn phase (chế độ A) — 0 BLOCKER, 0 MAJOR, 0 MINOR, 2 NIT:

- NIT: 16 micro hover chuyển 200 → 150ms — chuyển động hơi nhanh hơn trước; đúng chuẩn "Tailwind transition mặc định 150" nhưng nên xác nhận bằng trình duyệt.
- NIT: section "Gợi ý ngẫu nhiên" không có animation enter/exit trong khi bảng overlay §5.2 có ghi dòng "Suggestions 120" → giữ nguyên vì đó là section trang, không phải overlay; nếu sau này nó trở thành overlay thì cần bổ sung 120ms.
- Đã rà và thấy sạch: chỉ đổi giá trị `duration-*`, không đổi `transition-property`, timing của framer, hay token; không đổi logic/state/props; không có nhánh lỗi/dependency/secret; repo không có test infra nên khả năng kiểm chứng chỉ ở mức typecheck/lint/build + gate + đọc diff.

Trạng thái git: 10 file `src/` + plan 4 untracked + log. Chưa commit (plan cấm commit; chờ người dùng).

Phase 4 xong. Tiếp theo: Phase 5 — loading: đối chiếu L01–L17 trong `docs/loading-audit-2026-10-18.md` với code, sửa phần còn thiếu, không thêm test/mock/browser.
