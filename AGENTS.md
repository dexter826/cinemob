# AGENTS.md

Hướng dẫn hành vi để giảm lỗi thường gặp khi LLM viết code. Gộp với quy ước riêng của dự án khi cần.

**Đánh đổi:** Các hướng dẫn này nghiêng về thận trọng hơn tốc độ. Với việc nhỏ, tự cân nhắc.

## 1. Suy nghĩ trước khi code

**Không đoán. Không giấu chỗ chưa hiểu. Nêu rõ đánh đổi.**

Trước khi implement:

- Nêu rõ giả định. Chưa chắc thì hỏi.
- Có nhiều cách hiểu thì trình bày ra, không tự chọn rồi im lặng.
- Có cách đơn giản hơn thì nói. Phản biện khi cần.
- Có chỗ chưa rõ thì dừng lại, chỉ ra chỗ đó, rồi hỏi.

## 2. Đơn giản trước

**Lượng code tối thiểu để giải quyết vấn đề. Không làm dư.**

- Không thêm tính năng ngoài yêu cầu.
- Không trừu tượng hoá cho code chỉ dùng một chỗ.
- Không thêm "linh hoạt" hay "cấu hình" không ai yêu cầu.
- Không xử lý lỗi cho tình huống không thể xảy ra.
- Viết 200 dòng mà gọn được 50 thì viết lại.

Tự hỏi: "Kỹ sư lâu năm có nói cái này rối không?" Nếu có, đơn giản lại.

## 3. Sửa đúng chỗ

**Chỉ chạm thứ phải chạm. Chỉ dọn phần mình làm bẩn.**

Khi sửa code có sẵn:

- Không "cải thiện" code, comment hay format xung quanh.
- Không refactor thứ không hỏng.
- Theo style hiện có, kể cả khi bạn sẽ viết khác.
- Thấy dead code không liên quan thì nêu ra, đừng xoá.

Khi thay đổi của bạn tạo ra code mồ côi:

- Xoá import/biến/hàm mà chính bạn làm cho không còn dùng.
- Không xoá dead code có từ trước, trừ khi được yêu cầu.

Phép thử: mọi dòng thay đổi phải truy thẳng về yêu cầu của người dùng.

## 4. Làm theo mục tiêu

**Định nghĩa tiêu chí thành công. Lặp đến khi kiểm chứng xong.**

Biến việc thành mục tiêu kiểm chứng được:

- "Thêm validation" → "Viết test cho input sai, rồi làm cho nó pass"
- "Sửa bug" → "Viết test tái hiện bug, rồi làm cho nó pass"
- "Refactor X" → "Đảm bảo test pass trước và sau"

Việc nhiều bước thì nêu kế hoạch ngắn:

```
1. [Bước] → verify: [kiểm tra]
2. [Bước] → verify: [kiểm tra]
3. [Bước] → verify: [kiểm tra]
```

Tiêu chí thành công mạnh cho phép bạn tự lặp. Tiêu chí yếu ("làm cho nó chạy") phải hỏi liên tục.

## 5. Tuân thủ tài liệu đặc tả

**Tôn trọng hợp đồng có sẵn. Không tự tạo phong cách riêng.**

Khi thao tác với giao diện hoặc văn bản:

- **Giao diện:** Đối chiếu `DESIGN.md` làm chuẩn đích cho kiểu dáng, thông số và thành phần.
- **Văn bản:** Đối chiếu `COPY.md` làm chuẩn đích cho câu chữ, ngữ cảnh và giọng điệu.

---

**Các hướng dẫn này hiệu quả khi:** diff ít thay đổi thừa, ít phải viết lại vì làm rối, và câu hỏi làm rõ xuất hiện trước khi implement chứ không phải sau khi sai.

## Agent skills

### Issue tracker (Theo dõi công việc)

Theo dõi các issue và spec dưới dạng tệp markdown cục bộ trong `.scratch/`. Chi tiết xem tại `docs/agents/issue-tracker.md`.

### Triage labels (Nhãn phân loại)

Các vai trò phân loại chuẩn (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Chi tiết xem tại `docs/agents/triage-labels.md`.

### Domain docs (Tài liệu nghiệp vụ)

Cấu trúc ngữ cảnh đơn / single-context (`GLOSSARY.md` và `docs/adr/` tại thư mục gốc). Chi tiết xem tại `docs/agents/domain.md`.
