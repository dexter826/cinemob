# CineMOB — Design System

Nguồn sự thật của token: `src/index.css` (`@theme` + `.dark`). File này là hợp đồng ngắn: token, luật, giọng.

## 1. Triết lý: Editorial Print

Bố cục như báo in: chữ đậm lệch trục, hairline thay bóng, đen sâu + mực vàng spotlight (dark), giấy ấm (light).
Không bóng mềm, không gradient trang trí, không bo tròn lớn.

## 2. Token (2 theme — giá trị trong `src/index.css`)

| Token | Dark | Light | Vai trò |
|---|---|---|---|
| `--color-background` | `#0a0a0a` | `#f7f4ed` | nền trang |
| `--color-surface` | `#141414` | `#fdfbf6` | panel, card |
| `--color-surface-elevated` | `#1a1a1a` | `#fffefa` | dialog, dropdown, toast |
| `--color-primary` | `#ca8a04` | `#8f6400` | accent duy nhất — link, active, CTA |
| `--color-text-primary` | `#f5f5f2` | `#0a0a0a` | mực chính |
| `--color-text-secondary` | `#8a8a85` | `#6b6b66` | chữ phụ ≥4.5:1 |
| `--color-text-muted` | `#9c9c97` | `#5f5b53` | placeholder, hint, weekday |
| `--color-text-faint` | `#6e6e69` | `#8a857c` | decorative/large ≥3:1 |
| `--color-border` | `rgb(255 255 255 / .14)` | `rgb(20 20 20 / .16)` | viền control |
| `--color-focus` | `#ca8a04` | `#8f6400` | outline focus |

Radius: control/card/dialog 8px, poster 4px. Shadow: không — elevation bằng hairline (`--shadow-*` = none by design).

## 3. Luật cấm

1. Không bóng mềm — mọi elevation dùng `border`/hairline.
2. Không pure white/black làm nền; light phải là giấy ấm, dark không đen tuyệt đối ngoài `#0a0a0a`.
3. Vàng `primary` là accent duy nhất — không thêm màu nhấn thứ hai.
4. Focus: outline 2px `--color-focus` offset 3px hiện **tức thì**; cấm `outline-none` (ngoại lệ: underline search inputs); border/ring chỉ là lớp phụ, không thay outline.
5. Không alpha `/40–/60` trên chữ — dùng `text-secondary`/`text-muted`/`text-faint` theo vai trò.
6. Không hex/rgba trong `.tsx` — mọi màu qua token (ngoại lệ: brand mark Google ở nút đăng nhập).
7. Không Lottie/ảnh động nặng — motion CSS ngắn, tôn trọng `prefers-reduced-motion`.
8. Hành động đảo ngược được → undo-toast 7s (pattern `use-delete-movie.ts`); confirm dialog chỉ cho hành động phá huỷ thật (xoá album).

## 4. Chữ & bố cục

- `font-display` (Anton) cho tiêu đề, số liệu lớn, wordmark; body `font-sans` (Be Vietnam Pro).
- Nhãn nhỏ: caps 9–12px, `tracking` 0.08–0.18em; số liệu `tabular-nums`.
- Container `max-w-6xl`, section cách nhau bằng hairline.

## 5. Giọng copy

- Tiếng Việt, câu ngắn, xưng "bạn"; không emoji; nút là động từ ("Thêm phim", "Hoàn tác").
- Toast/tooltip nói kết quả cụ thể ("Đã xoá X", "Gỡ phim khỏi album thất bại"), không "Có lỗi xảy ra" chung chung.

## 6. Loading và phản hồi tác vụ

- Chưa có nội dung, biết trước bố cục: skeleton khớp aspect, grid, gap và breakpoint của nội dung thật.
- Đang xử lý hành động: spinner và nhãn tại nút/vùng thao tác; khóa đúng hành động phụ thuộc.
- Refresh cùng ngữ cảnh: giữ nội dung hợp lệ, báo cập nhật cục bộ. Đổi user/query/month không hiện kết quả cũ như kết quả mới.
- Lỗi đọc khác dữ liệu rỗng; lỗi có retry, pending không kéo dài sau lỗi hoặc hủy.
- Skeleton dùng token skeleton và motion-safe; status nằm ngoài vùng aria-busy. Không dùng phần trăm giả.
- Khởi động kết thúc trạng thái chờ khi xác thực xong; không ép thời lượng splash. Tải nội dung trang giữ thanh điều hướng.
