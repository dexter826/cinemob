# UX Content Standards & Copy Guidelines (`COPY.md`)

Tài liệu quy chuẩn thiết kế nội dung giao diện (UX Writing / Content Design) dành cho ứng dụng phần mềm. Tài liệu đóng vai trò là hợp đồng nội dung độc lập, thiết lập các tiêu chuẩn viết vi nội dung (microcopy), thông báo hệ thống và tương tác người dùng, có thể áp dụng tái sử dụng xuyên suốt các dự án.

---

## 1. Nguyên tắc cốt lõi (Core Principles)

Mọi văn bản hiển thị trên giao diện người dùng phải tuân thủ 5 nguyên tắc nền tảng:

1. **Rõ ràng (Clear):** Nói chính xác điều cần truyền đạt. Tránh thuật ngữ kỹ thuật trừu tượng, tránh cách hiểu nước đôi hoặc mơ hồ.
2. **Súc tích (Concise):** Sử dụng lượng từ tối thiểu để truyền tải trọn vẹn thông tin. Cắt bỏ các hư từ, liên từ thừa và câu dẫn rỗng.
3. **Nhất quán (Consistent):** Một khái niệm, một thao tác hoặc một đối tượng chỉ dùng một thuật ngữ định danh duy nhất xuyên suốt mọi màn hình.
4. **Hướng hành động (Action-Oriented):** Mỗi câu chữ phải giúp người dùng hiểu rõ bước tiếp theo hoặc hoàn thành mục tiêu cụ thể.
5. **Nhân văn & Đồng cảm (Human & Empathetic):** Diễn đạt như một người hỗ trợ tận tâm; không dùng văn phong máy móc, không phán xét hoặc quy kết lỗi cho người dùng.

---

## 2. Giọng điệu theo ngữ cảnh (Voice & Tone)

Giọng điệu tổng thể duy trì tính chuyên nghiệp, điềm đạm và đáng tin cậy. Sắc thái biểu cảm được linh hoạt điều chỉnh theo từng tình huống trải nghiệm:

| Ngữ cảnh                    | Sắc thái (Tone)        | Mục tiêu cảm xúc              | Quy tắc thể hiện                                                                              |
| :-------------------------- | :--------------------- | :---------------------------- | :-------------------------------------------------------------------------------------------- |
| **Thành công (Success)**    | Tích cực, vừa phải     | Xác nhận kết quả, tạo an tâm  | Ghi nhận hành động đã hoàn tất; không dùng cảm thán quá đà (tránh "Tuyệt vời!", "Xuất sắc!"). |
| **Lỗi (Error)**             | Điềm tĩnh, đồng cảm    | Giảm thiểu lo lắng, gỡ rối    | Giải thích điều đã xảy ra mà không đổ lỗi; luôn kèm cách khắc phục hoặc lối thoát khả thi.    |
| **Cảnh báo (Warning)**      | Rõ ràng, dứt khoát     | Thận trọng, cân nhắc rủi ro   | Nêu thẳng hậu quả của hành động trước khi người dùng đưa ra quyết định không thể đảo ngược.   |
| **Thông tin (Informative)** | Trung tính, khách quan | Cung cấp tri thức, định hướng | Ngắn gọn, tập trung vào bản chất thông tin cần biết; không thêm thắt văn hoa.                 |

---

## 3. Quy chuẩn thành phần giao diện (Component Copy Patterns)

### 3.1. Nút bấm & Lời kêu gọi hành động (Buttons & CTAs)

- **Công thức:** `[Động từ hành động] + [Đối tượng cụ thể]`
- **Quy tắc:**
  - Bắt đầu trực tiếp bằng động từ hành động.
  - Phản ánh chính xác kết quả sau khi bấm (ví dụ: `Tạo tài khoản` thay vì `Gửi` hoặc `Đăng ký`; `Lưu thay đổi` thay vì `OK`).
  - Nút đóng hoặc hủy thao tác ghi rõ hành động an toàn (`Giữ lại tệp` thay vì `Hủy`).

### 3.2. Thông báo lỗi hệ thống (Error Messages)

- **Công thức 3 phần:** `[Điều gì đã xảy ra] + [Lý do ngắn gọn] + [Hướng xử lý tiếp theo]`
- **Quy tắc:**
  - Phần 1 nêu hiện trạng khách quan.
  - Phần 2 giải thích nguyên nhân nếu xác định được.
  - Phần 3 cung cấp nút hoặc giải pháp khắc phục (Thử lại, Kiểm tra kết nối, Liên hệ hỗ trợ).
- **Ví dụ chuẩn:** _"Không lưu được thay đổi do mất kết nối mạng. Kiểm tra đường truyền rồi thử lại."_

### 3.3. Trạng thái trống (Empty States)

- **Công thức 3 bước:** `[Tiêu đề hiện trạng]` + `[Mô tả mục đích / lý do]` + `[Nút dẫn lối bắt đầu]`
- **Quy tắc:**
  - Tiêu đề xác nhận danh sách hoặc vùng dữ liệu đang chưa có phần tử.
  - Mô tả làm rõ giá trị của tính năng khi có dữ liệu.
  - Nút bấm điều hướng người dùng tới hành động tạo mới hoặc khám phá.
- **Ví dụ chuẩn:**
  - _Tiêu đề:_ `Chưa có dự án nào`
  - _Mô tả:_ `Tạo dự án đầu tiên để bắt đầu theo dõi tiến độ công việc cùng đội ngũ.`
  - _CTA:_ `Tạo dự án mới`

### 3.4. Hộp thoại xác nhận phá hủy (Confirmation & Destruction Dialogs)

- **Quy tắc:**
  - Tiêu đề đặt câu hỏi trực diện vào hành động: `Xóa {tên_đối_tượng}?` (tránh hỏi chung chung `Bạn có chắc chắn không?`).
  - Phần mô tả nêu rõ hậu quả và phạm vi ảnh hưởng (ví dụ: `Hành động này không thể hoàn tác. Toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn.`).
  - Nhãn nút bấm tương ứng trực tiếp với hành vi: Nút chính an toàn mang nhãn `Giữ lại`, nút hành động phá hủy mang nhãn `Xóa {đối_tượng}` với màu nguy hiểm (danger).

### 3.5. Biểu mẫu & Báo lỗi nhập liệu (Forms & Inline Validation)

- **Nhãn trường (Label):** Rõ ràng, đứng độc lập với placeholder; không dùng placeholder thay thế cho nhãn.
- **Văn bản gợi ý (Placeholder):** Đưa ra ví dụ định dạng mẫu hợp lệ (ví dụ: `nguyenvana@domain.com`), không lặp lại tên nhãn.
- **Lỗi nhập liệu (Inline Error):**
  - Xuất hiện ngay dưới trường thông tin lỗi.
  - Chỉ rõ điều kiện còn thiếu để trường hợp lệ (ví dụ: `Mật khẩu cần tối thiểu 8 ký tự, bao gồm chữ và số` thay vì `Mật khẩu sai`).

### 3.6. Chú giải công cụ (Tooltips)

- Ngắn gọn, chỉ bổ sung thông tin hữu ích hỗ trợ quyết định của người dùng.
- Không lặp lại nguyên văn nhãn đã hiển thị trên màn hình.

### 3.7. Trạng thái chờ & Tiến trình (Loading & Progress States)

- Sử dụng động từ thể hiện hành động đang diễn ra kèm dấu ba chấm đơn (ví dụ: `Đang tải dữ liệu…`, `Đang lưu…`).
- Với các tiến trình kéo dài, cung cấp ước tính thời gian hoặc số bước để giảm bớt cảm giác sốt ruột.

### 3.8. Hướng dẫn ban đầu (Onboarding & Progressive Disclosure)

- Cung cấp thông tin theo từng bước logic; không dồn nhiều khái niệm mới vào cùng một màn hình.
- Mỗi bước hướng dẫn chỉ tập trung vào một hành động then chốt.

---

## 4. Quy chuẩn hành văn & Cấu trúc ngữ pháp (Grammar & Style)

1. **Ưu tiên thể chủ động:** Viết trực diện về chủ thể thực hiện hành động; tránh lối viết bị động sao chép từ cấu trúc tiếng Anh (ví dụ: viết `Hệ thống tự động lưu bản nháp mỗi phút` thay vì `Bản nháp được tự động lưu bởi hệ thống`).
2. **Khử danh hóa thừa và động từ rỗng:**
   - Tránh biến động từ thành cụm danh từ cồng kềnh đi kèm động từ phụ rỗng nghĩa (tránh _thực hiện việc cấu hình_, _tiến hành đồng bộ_, _đưa ra lựa chọn_).
   - Viết trực tiếp: `cấu hình`, `đồng bộ`, `chọn`.
3. **Cắt bỏ các chuỗi sở hữu tính chất:** Lược bỏ từ _của_ khi mối quan hệ thuộc tính giữa các danh từ đã rõ ràng (ví dụ: `cấu hình máy chủ` thay vì `cấu hình của máy chủ`).
4. **Tránh lạm dụng số nhiều hình thức:** Tiếng Việt không bắt buộc thêm _các/những_ trước mọi danh từ khi ngữ cảnh đã ngầm hiểu số nhiều.
5. **Cắt bỏ khung dẫn sáo rỗng:** Loại bỏ hoàn toàn các cụm từ mở đầu không mang thêm thông tin như _“Điều quan trọng cần lưu ý là…”_, _“Cần nhấn mạnh rằng…”_, _“Có thể thấy rằng…”_. Đi thẳng vào nội dung thông điệp chính.
6. **Chuẩn hóa biến động:** Mọi biến số được điền giá trị tại thời điểm chạy (runtime) ký hiệu thống nhất theo cú pháp `{tên_biến}` (ví dụ: `{tên_tệp}`, `{số_lượng}`, `{thời_gian}`).

---

## 5. Quy chuẩn chính tả & Định dạng ký tự tiếng Việt (Vietnamese Typography)

1. **Quy tắc viết hoa tiêu đề (Sentence Case):**
   - Chỉ viết hoa chữ cái đầu câu và các danh từ riêng hợp thức.
   - Không áp dụng quy tắc Title Case (viết hoa chữ đầu của mọi từ) của tiếng Anh lên tiếng Việt.
2. **Dấu ngoặc kép:** Sử dụng đồng nhất dấu ngoặc kép cong mở `“` (U+201C) và đóng `”` (U+201D) cho các trích dẫn, tên riêng hoặc giá trị tham chiếu. Tránh trộn lẫn dấu ngoặc kép thẳng `"` trong văn bản hiển thị.
3. **Dấu ba chấm:** Sử dụng ký tự ba chấm đơn `…` (U+2026) cho các trạng thái chờ và văn bản gợi ý. Không sử dụng ba dấu chấm rời liên tiếp (`...`).
4. **Dấu gạch ngang:**
   - Sử dụng dấu gạch ngang en dash `–` (U+2013, có khoảng trắng hai bên) để liên kết các khoảng số lượng, niên độ hoặc nối hai địa danh/đối tượng tương đương.
   - Không sử dụng em dash `—` (U+2014) làm dấu ngắt câu chú thích giữa câu; sử dụng dấu phẩy, dấu ngoặc đơn hoặc tách câu để tạo nhịp tự nhiên cho tiếng Việt.
5. **Dấu phẩy trước liên từ 'và':** Không đặt dấu phẩy trước từ _và_ trong chuỗi liệt kê các phần tử đơn giản (viết `A, B và C`, không viết `A, B, và C`).
6. **Định dạng số và thời gian:**
   - Ngày tháng hiển thị định dạng chuẩn: `DD/MM/YYYY` hoặc `D tháng M, YYYY`.
   - Giờ giấc định dạng 24 giờ: `HH:mm`.
   - Dấu phân cách phần nghìn sử dụng dấu chấm (`1.000.000`), phân cách phần thập phân sử dụng dấu phẩy (`0,5`).

---

## 6. Bảng kiểm tra chất lượng nội dung (Do's and Don'ts)

| Nên làm (Do)                                                                                                      | Không nên làm (Don't)                                                                                      |
| :---------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| Bắt đầu nút bấm bằng động từ hành động cụ thể (`Tạo dự án`, `Lưu tệp`).                                           | Không dùng các nhãn mơ hồ hoặc cộc lốc (`Gửi`, `OK`, `Tiếp tục`).                                          |
| Cấu trúc thông báo lỗi gồm 3 phần: Điều xảy ra, Lý do và Hướng xử lý.                                             | Không hiển thị mã lỗi nội bộ hoặc thông báo cụt lủn (`Lỗi hệ thống`, `Thất bại`).                          |
| Trạng thái trống luôn cung cấp nút hành động dẫn dắt người dùng tiếp tục.                                         | Không để màn hình trống rơi vào ngõ cụt không có lối thoát hoặc hành động gợi ý.                           |
| Tiêu đề hộp thoại xác nhận hỏi thẳng vào hành vi cần quyết định.                                                  | Không dùng câu hỏi chung chung gây hoang mang (`Bạn có chắc không?`).                                      |
| Nhãn nút bấm trong hộp thoại xác nhận mô tả đích danh hành động.                                                  | Không dùng cặp nút mơ hồ (`Đồng ý` / `Hủy bỏ`) cho các thao tác phá hủy dữ liệu.                           |
| Sử dụng câu chủ động, tự nhiên và gãy gọn theo ngữ pháp tiếng Việt.                                               | Không sao chép nguyên mẫu câu bị động hoặc chuỗi giới từ dài dòng từ tiếng Anh.                            |
| Viết hoa tiêu đề theo chuẩn Sentence Case (chỉ viết hoa chữ cái đầu câu).                                         | Không viết hoa chữ cái đầu của mọi từ (Title Case) trên tiêu đề tiếng Việt.                                |
| Cung cấp cơ chế hoàn tác (Undo) cho các thao tác có thể khôi phục được.                                           | Không lạm dụng hộp thoại xác nhận (modal dialog) làm đứt gãy mạch thao tác thường nhật.                    |
| Đồng nhất một thuật ngữ duy nhất cho một khái niệm trên toàn ứng dụng.                                            | Không thay đổi từ đồng nghĩa tùy tiện giữa các màn hình gây hiểu nhầm cho người dùng.                      |
| Viết câu chữ hướng thẳng đến người dùng cuối, tập trung vào mục đích thao tác và thông tin thực tế trên màn hình. | Không đưa ghi chú nội bộ, nhật ký cập nhật hay nội dung trao đổi riêng trong cuộc hội thoại vào giao diện. |
