# Chuẩn hóa comment trong CineMOB

Ngày: 18/10/2026. Trạng thái: thiết kế đã chốt qua phiên phỏng vấn (grilling) cùng người dùng; đang lập kế hoạch triển khai.

## 1. Mục tiêu và phạm vi đã thống nhất

Chuẩn hóa toàn bộ comment trong source code về một chuẩn thống nhất: tiếng Việt, theo AGENTS.md §5 (giữ "why", xoá "what"), câu chữ gọn và tự nhiên theo tinh thần vi-humanizer. Không thay đổi hành vi, code, identifier hay string hiển thị.

Phạm vi (đã chốt): comment trong `src/**` (.ts, .tsx, .css) + `.github/scripts/**` (.js). Tổng 159 file khi lập kế hoạch (156 file `src/` + 3 file .js scripts).

Loại trừ: markdown/docs (`docs/**`, README, DESIGN.md, AGENTS.md), UI copy (string trong `src/constants/messages.ts` và mọi string khác), config gốc repo, `.agents/`, `.superpowers/`, file sinh tự động, lockfile.

Hiện trạng khảo sát 18/10/2026: comment chủ yếu tiếng Việt; tiếng Anh tập trung ở `src/shared/components/ui/*` và `.github/scripts/*`. Không có TODO/FIXME/HACK, không có code chết dạng comment, không có `@ts-ignore`/`eslint-disable` trong `src/`.

## 2. Các quyết định đã chốt (từ phỏng vấn)

| # | Quyết định |
| - | ---------- |
| 1 | Phạm vi = comment trong source; docs và UI copy tách đợt riêng |
| 2 | Ngôn ngữ đích = tiếng Việt toàn bộ; thuật ngữ kỹ thuật giữ nguyên tiếng Anh |
| 3 | Chuẩn tham chiếu = AGENTS.md §5 + house style hiện có + nguyên tắc vi-humanizer |
| 4 | Quy trình = pilot `src/shared/components/ui` (27 file) → người dùng duyệt → chạy tự động theo batch thư mục, báo cáo mỗi batch |
| 5 | Ranh giới = chỉ sửa comment hiện có; không thêm comment mới; không sửa code; lỗi tồn đọng ngoài comment chỉ báo cáo |
| 6 | Mức dọn = cân bằng: xoá comment hiển nhiên/lặp code/sai/lỗi thời; giữ + rút gọn comment giải thích lý do |
| 7 | Verify = mỗi batch `typecheck` + `lint` + `prettier --check` theo file đã sửa; cuối cùng `npm run build`; batch `.github/scripts` thêm `node --check` + `npm test` |
| 8 | Git = ở nhánh hiện tại `fix/hallmark-audit`, không commit; người dùng tự review diff và commit |

Điều chỉnh khi lập kế hoạch (phát hiện thêm từ khảo sát, không đổi các quyết định trên):

- `npm run format:check` đang đỏ sẵn từ trước đợt này với 23 file (11 docs + 12 file src). Theo quyết định 5, các lỗi này chỉ được báo cáo, không tự sửa. Verify vì vậy dùng `npx prettier --check <file/folder đã sửa>` với tiêu chí "không thêm lỗi mới", không dùng `format:check` toàn repo làm cổng xanh.
- (Điều chỉnh 18/10/2026, phản hồi người dùng) File đã chạm đều phải được để lại prettier-clean: chạy `npx prettier --write` trên chính file đã sửa comment (kể cả các lỗi format tồn đọng sẵn trong file đó) — format đi kèm luôn với việc sửa comment. File đỏ chưa chạm vẫn chỉ báo cáo.
- Các folder nhỏ `shared/config`, `shared/lib`, `shared/pages` (1 file mỗi folder) được gộp chung batch với `shared/components` thay vì mỗi folder một báo cáo riêng.
- `src/index.css`: comment CSS (nếu có) nằm trong phạm vi; batch chứa nó cần thêm `npm run build` vì typecheck/lint không bao phủ CSS.
- Baseline trước đợt: typecheck xanh, lint xanh (0 warning), format:check đỏ 23 file.

Điều chỉnh sau khi duyệt (18/10/2026, sau pilot): chiến lược git đổi từ "không commit" sang "agent commit từng batch ngay sau khi verify xanh" — chỉ stage file thuộc batch, không push, người dùng review theo từng commit. Quyết định 8 trong bảng giữ nguyên như bản gốc để đối chiếu lịch sử.

## 3. Chuẩn comment (nguồn sự thật cho mọi batch)

### 3.1 Ngôn ngữ

- Comment viết lại và comment mới thay thế phải là tiếng Việt. Comment tiếng Anh phải chuyển sang tiếng Việt.
- Thuật ngữ kỹ thuật giữ nguyên tiếng Anh khi là thuật ngữ (TMDB, API, hook, store, state, props, render, listener, payload, toast, dialog, sheet, cache, debounce, mount/unmount…); không phiên âm, không dịch cứng.
- Chính tả tiếng Việt chuẩn: đủ dấu, dấu câu đúng (không space trước dấu chấm/phẩy); câu đầy đủ kết thúc bằng dấu chấm; label ngắn không dấu chấm.

### 3.2 Hình thức (theo house style hiện có)

- Comment dòng đơn: `// ...` đặt trên dòng khai báo hoặc trong thân hàm, cùng indent với code được nói tới.
- JSDoc: `/** ... */` giữ hình thức hiện có (một dòng cho tóm tắt; khối props giữ cấu trúc, rút gọn từng dòng).
- JSX section label: `{/* ... */}` ngắn (1–4 từ).
- Dòng comment ≤ 100 ký tự (prettier không tự wrap comment).
- Thể trung tính: không "bạn/tôi/chúng ta"; dùng lối imperative/noun-phrase như comment hiện có ("Giới hạn request đồng thời…").
- Comment đặt trên dòng riêng cùng indent với code (hạn chế trailing comment; ngoại lệ chỉ khi cực ngắn và theo cụm nhất quán, vd nhãn palette `/* green-700 */` trong CSS).

### 3.3 Nội dung (AGENTS.md §5)

- Giữ: lý do, ràng buộc, trade-off, hành vi không hiển nhiên, ghi chú kỹ thuật đặc thù.
- Xoá: comment lặp lại code ("what"), comment hiển nhiên, comment sai/lỗi thời, banner trang trí không mang thông tin.
- Xoá (bổ sung 18/10 sau phản hồi người dùng): tham chiếu quy trình nội bộ trong comment ("spec 2026-10-17", "gate 7", "Task N" — trừ tag `@deprecated` giữ nguyên theo quy định riêng); mô tả cảm quan/trang trí về design không kèm ràng buộc kỹ thuật ("light giấy ấm", "mực vàng trên giấy"). Quy tắc này áp hồi tố cho cả các batch đã hoàn thành.
- Nhìn toàn cảnh file trước khi kết luận: file tự mô tả đầy đủ (types/interfaces, map hằng số) → comment lẻ tẻ cũng bị xoá; mức độ và format comment phải nhất quán trong cùng file và giữa các file cùng loại.
- `@deprecated` và các tag JSDoc khác: giữ nguyên nội dung tag; chỉ chuẩn hóa câu chữ mô tả quanh tag nếu cần. Tag nhắc task cũ (vd "Remove in Task 23" ở `page-header.tsx`) giữ nguyên, ghi chú trong báo cáo nếu nghi lỗi thời.
- JSX section label: giữ ở file dài (>~150 dòng hoặc ≥3 section), xoá ở file ngắn. Ngưỡng này hiệu chỉnh qua pilot.
- Không thêm comment mới ở bất kỳ đâu, kể cả chỗ "đáng ra nên có".

Ví dụ minh họa:

| Trường hợp | Xử lý |
| ---------- | ----- |
| `/** "2026-10-04" → "04/10/2026". */` | Giữ (gọn, mang thông tin) |
| `// Gọi API từ TMDB.` trên hàm có tên đã nói rõ việc đó | Xoá (lặp code) |
| `// Same geometry as PosterCard…` | Viết lại tiếng Việt, giữ ý |
| Long rationale giải thích vì sao chặn thao tác | Giữ, rút gọn nếu dài dòng |
| `{/* Header */}` trong file ngắn | Xoá |
| `{/* Thứ tự tính toán khớp bảng tháng */}` trong file dài | Giữ |

### 3.4 Ranh giới

- Không sửa code, identifier, type, string hiển thị, import, thứ tự khai báo.
- Xoá comment → dọn dòng trắng do chính việc xoá tạo ra (không để 2 dòng trắng liền kề). Dòng trắng đôi có sẵn từ trước → chỉ báo cáo, không sửa.
- File không có comment → no-op, vẫn tính vào số "đã quét".
- Phát hiện lỗi thật (bug, code smell, comment nghi lỗi thời) → ghi vào mục "Ngoài phạm vi" của báo cáo, không tự sửa.

## 4. Quy trình triển khai

1. Pilot — `src/shared/components/ui` (27 file). Áp chuẩn §3, verify, báo cáo đầy đủ (10–15 before/after + số liệu). Dừng chờ người dùng duyệt/hiệu chỉnh chuẩn.
2. Batch — theo thứ tự cây thư mục: `src` root + `src/app` → `constants` + `types` → shared còn lại (2 batch) → từng feature (albums, auth+stats, calendar, dashboard, movies, profile, search) → `.github/scripts`. Mỗi batch: sửa → verify → báo cáo 5–8 before/after + số liệu → chạy tiếp không dừng chờ.
3. Tổng kết — build cuối, audit grep hotspot tiếng Anh, báo cáo tổng + danh sách tồn đọng ngoài phạm vi.

Báo cáo batch gồm: số liệu (file quét / file sửa / comment xoá / viết lại / EN→VI), bảng before/after tiêu biểu, ghi chú ngoài phạm vi, lệnh verify + kết quả. Chi tiết task và lệnh chính xác nằm trong kế hoạch triển khai.

## 5. Kiểm chứng và tiêu chí hoàn tất

- Mỗi batch: `npx prettier --check` theo file/folder đã sửa (đạt: không lỗi mới ngoài danh sách tồn đọng), `npm run typecheck`, `npm run lint` (không thêm warning so với baseline 0). Batch `.github/scripts`: `node --check` từng file sửa + `npm test`. Batch chứa `index.css`: thêm `npm run build`.
- Cuối cùng: `npm run build`; audit `git diff --stat` xác nhận diff chỉ chạm file trong phạm vi; grep hotspot tiếng Anh (`skeleton-card`, `lazy-dialog`, `loading`, `album-selector-modal`, `use-scroll-restore`, `.github/scripts/*`) → 0 còn câu tiếng Anh.
- Không chạy test runner ngoài `npm test` có sẵn của `.github/scripts`; không mở browser; không tuyên bố kiểm chứng runtime (đợt này thuần tĩnh).
- Stop condition: cả 159 file trong phạm vi đã được đọc và xử lý; không còn câu/đoạn comment tiếng Anh (thuật ngữ lẫn trong câu tiếng Việt được phép); không comment mới được thêm; typecheck/lint/build xanh; báo cáo cuối liệt kê rõ tồn đọng ngoài phạm vi (23 file lỗi prettier, dòng trắng đôi, tag nghi lỗi thời).
