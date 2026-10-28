# COPY.md

Hợp đồng cho chữ hiển thị trong UI. `DESIGN.md` quy định hình; file này quy định lời. Code lệch thì sửa code.

Phạm vi: mọi chuỗi người dùng đọc được — nhãn, nút, tiêu đề, mô tả, lỗi, toast, trạng thái rỗng. Không áp dụng cho comment, log, tài liệu.

## 1. Voice

**Điềm tĩnh, cụ thể, gọn.** Nói thẳng người dùng cần biết; không phô diễn.

- Xưng "bạn". Cấm "quý khách", "người dùng", "bạn dùng" trong câu hiển thị.
- Câu chủ động, ngắn. Một câu một ý.
- Không emoji. Không viết hoa để nhấn mạnh.
- Không đùa, không cảm thán, không dấu chấm than ở trạng thái lỗi.
- Không danh từ hoá: "xoá", không "thực hiện việc xoá".
- Không từ kỹ thuật: cấm "fetch", "server", "API", "mã 500", "null", "undefined".
- Tone theo trạng thái: thành công thì ngắn; lỗi thì trung tính và chỉ đường; rỗng thì mời hành động, không xin lỗi.

## 2. Glossary

Một khái niệm một từ. Cấm dùng từ đồng nghĩa.

| Dùng        | Nghĩa                           | Cấm dùng                          |
| ----------- | ------------------------------- | --------------------------------- |
| `phim`      | một bộ phim lẻ                  | "bộ phim" trong câu ngắn, "movie" |
| `series`    | phim nhiều tập                  | "show", "TV show", "phim bộ"      |
| `tập`       | một tập của series              | "episode", "ep"                   |
| `watchlist` | danh sách phim muốn xem         | "danh sách xem", "DS xem"         |
| `album`     | tập hợp do người dùng tự tạo    | "bộ sưu tập" khi nói về một album |
| `đánh giá`  | nhận xét của người dùng về phim | "review", "bình luận"             |
| `đã xem`    | trạng thái đã xem xong          | "hoàn thành", "finished"          |

- "Bộ sưu tập" chỉ dùng khi nói về toàn bộ thư viện của người dùng, không dùng cho một album.
- Tên riêng và tên dịch vụ giữ nguyên: CineMOB, TMDB, Google.
- Không dịch tên tính năng đã có trong điều hướng.

## 3. Patterns

### Error

Cấu trúc: **cái gì hỏng + bước tiếp theo.** Nêu nguyên nhân nếu biết chắc.

- Tối đa 120 ký tự. Một câu hoặc hai câu ngắn.
- Không đổ lỗi người dùng. Không hiện mã lỗi trần.
- Luôn có đường thoát: "Thử lại", "Quay lại", "Kiểm tra kết nối".

Đúng: "Không thể đọc album. Vui lòng thử lại."
Sai: "Lỗi kết nối tới dữ liệu phim." — thiếu bước tiếp theo.

### Empty

Cấu trúc: **trạng thái + giá trị + một CTA.**

- Tiêu đề nêu trạng thái: "Chưa có album nào".
- Mô tả một câu, tối đa 100 ký tự, nói vì sao đáng quan tâm.
- Đúng một CTA. Không CTA khi người dùng không thể tự tạo dữ liệu.
- Ba loại rỗng phải khác câu: chưa có gì, không khớp bộ lọc, lỗi tải.

Đúng: "Chưa có album nào" / "Gom phim theo chủ đề để tìm lại nhanh hơn." / "Tạo album".
Sai: "Không có dữ liệu." — không nói gì, không CTA, và trùng câu với trạng thái lỗi.

### Confirm

Cấu trúc: **câu hỏi + hậu quả + nút động từ.**

- Tiêu đề là câu hỏi, tối đa 40 ký tự: "Xoá album này?"
- Body nêu hậu quả cụ thể: "Phim trong album không bị xoá."
- Nút mô tả hành động, không dùng "Đồng ý"/"Huỷ" khi có thể cụ thể: "Xoá album".
- Chỉ dùng confirm cho hành động không thể hoàn tác. Hành động đảo ngược được thì dùng toast + hoàn tác.

### Toast

Cấu trúc: **kết quả ở quá khứ + hành động nếu đảo ngược được.**

- Tối đa 60 ký tự. Không dấu chấm cuối.
- Mở bằng "Đã" cho thành công: "Đã thêm vào watchlist".
- Nêu đối tượng cụ thể khi có: "Đã xoá 3 phim".
- Hành động là động từ: "Hoàn tác", "Xem".

### Button

- Bắt đầu bằng động từ, tối đa 3 từ: "Lưu phim", "Xoá album", "Thử lại".
- Không dùng "OK", "Đồng ý", "Gửi", "Xác nhận" khi có thể cụ thể hơn.
- Nhãn mô tả kết quả, không mô tả cơ chế: "Bật thông báo", không "Gọi API thông báo".

## 4. Formatting

- **Sentence case** cho mọi heading, nút, nhãn, tiêu đề. Cấm Title Case.
- Chỉ `label-caps` và `micro-caps` viết hoa toàn bộ, theo luật trong `DESIGN.md`.
- Không dấu chấm cuối nhãn, nút, tiêu đề ngắn. Câu đầy đủ thì có dấu chấm.
- Dấu ba chấm dùng `…`, không dùng `...`.
- Dấu ngoặc kép dùng loại cong: “…”.
- Ngày, giờ, số dùng `Intl.DateTimeFormat` / `Intl.NumberFormat` với locale `vi-VN`. Định dạng hiển thị: `31/12/2026`, `1.234`, `8,5`.
- Không nối chuỗi ngày thủ công.
- `★` chỉ dùng trong nhãn khoảng rating: "Từ 8★". Ngoài ngữ cảnh đó dùng icon hoặc chữ "sao".
- Uppercase vẫn giữ đủ dấu tiếng Việt.

## 5. Checklist review

1. Mọi thuật ngữ có trong glossary, không có biến thể.
2. Mọi nút bắt đầu bằng động từ, ≤ 3 từ.
3. Không câu lỗi nào thiếu bước tiếp theo.
4. Empty state nào cũng có đúng một CTA (trừ khi người dùng không thể tạo dữ liệu).
5. Không nhãn nào có dấu chấm cuối; không `...`; không emoji.
6. Ngày, số, rating đều qua `Intl`.
