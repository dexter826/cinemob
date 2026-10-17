# Chuẩn hóa loading — kết quả triển khai

## Phạm vi

Giữ giao diện Editorial Print và dependency hiện có. Chuẩn hóa loading trong app shell, search, profile, phim, album, lịch và thống kê theo thiết kế đã duyệt.

Theo yêu cầu người dùng: không thêm hoặc chạy test, không kiểm tra trình duyệt, không thêm dependency test. Các kết luận hành vi dưới đây dựa trên source review, không phải bằng chứng runtime.

## Đối chiếu audit

| Phát hiện | Thay đổi trong source                                                                                                  |
| --------- | ---------------------------------------------------------------------------------------------------------------------- |
| L01       | Own profile có ready/error/retry; UI và handler chặn edit/save khi chưa đọc thành công; toggle còn đợi collection phim |
| L02       | Search mode và result gắn request key; home không dùng pending/error discovery đã rời                                  |
| L03       | Album list/detail có lỗi và retry; một nguồn subscription cho list; callback cũ có guard                               |
| L04       | Skeleton primitive có fill theo token; form/profile dùng lại                                                           |
| L05       | SkeletonCard cùng tỉ lệ PosterCard; profile/album cùng grid; detail theo bố cục hai cột; lịch tính số ô theo tháng     |
| L06       | Collection/profile/person lỗi khác empty/not-found; có retry                                                           |
| L07       | Discover trả rỗng hiển thị thông báo theo bộ lọc và hành động xóa lọc                                                  |
| L08       | AI giữ cards khi refresh; TV refresh tách khỏi lần đầu tải form                                                        |
| L09       | Spinner/status dùng chung; thêm thông báo tại các vùng tải; search không đặt live trên toàn grid                       |
| L10       | Profile tải trong main; Loading mặc định local và không sửa global readiness                                           |
| L11       | Splash theo auth, không ép 1.500 ms; modal tải module có shell đóng/retry                                              |
| L12       | Totals episode hiện trạng thái chưa biết khi pending/error thay vì số 0                                                |
| L13       | Album busy theo phim, giữ đến khi ghi và membership được phản ánh; chống thao tác lặp                                  |
| L14       | Random picker có pool error và retry                                                                                   |
| L15       | Grid album đợi nguồn album và movie collection trước khi kết luận rỗng                                                 |
| L16       | UI và submit handler đợi dữ liệu bắt buộc; form manual không phụ thuộc TMDB                                            |
| L17       | Bỏ initialLoading chỉ phản ánh mount trên Search                                                                       |

Ảnh poster/album có fallback một lần. Button loading dùng spinner chung và copy tác vụ. DESIGN.md chỉ chứa quy chuẩn, không chứa lịch sử hoặc liên kết hồ sơ triển khai.

## Kiểm tra

Lượt kiểm tra trước review: `npm run typecheck`, `npm run lint`, `npm run build`, `git diff --check` đều kết thúc với exit code 0. Lượt cuối sau xử lý review: typecheck, lint, build và git diff --check đều exit code 0; lint không có warning.

Reviewer dùng skill code-refactor chế độ A và cùng model với phiên triển khai. Review xác định ba BLOCKER và một MAJOR còn trong phạm vi loading; đã sửa trong một lượt:

- Album selection chỉ khởi tạo và sync sau lần đọc album thành công đúng tài khoản; form chờ nguồn album trước khi lưu phim thuộc lịch sử.
- Request đề xuất kiểm tra lại user/generation sau khi đợi trending, trước khi sửa trạng thái AI.
- Discovery nhánh TV reject khi nguồn trả null do lỗi, thay vì coi là danh sách rỗng.
- Modal phim gắn owner uid/generation; đổi tài khoản đóng/reset modal, render chặn owner khác và submit bỏ các continuation đã lỗi thời.

Tự rà soát source còn loại xung đột màu spinner và số lượng phim album chưa biết. Không thêm hoặc chạy test để xử lý các phát hiện này. Không có lượt review độc lập thứ hai sau khi sửa; giới hạn kiểm chứng runtime giữ nguyên.

## Giới hạn

Chưa kiểm chứng runtime đối với network error, race condition, thao tác thật, focus, screen reader, hai theme, mobile hoặc layout shift. Build/lint/typecheck thành công không chứng minh các hành vi đó. Không ghi/xóa dữ liệu tài khoản thật; không deploy hoặc push.

## Quyết định triển khai

- Giữ nhánh feature hiện tại; không tạo worktree mới.
- Lifecycle album list thuộc store hiện có, app-init gọi initialize/cleanup; retry thay đúng subscription thay vì nhân listener ở consumer.
- Service TMDB phải phân biệt nguồn thất bại với successful empty; person lookup giữ 404 là not-found.
- LazyDialog có shell chờ riêng và giao lại cho modal hiện có khi module đến; không tách lại toàn bộ modal body.
- Xóa readiness store/splash policy sau khi đã loại tất cả caller; không để spinner điều khiển footer.
- Album dùng busy theo item và subscription reconciliation, không thêm optimistic update.
- Gộp các commit liên quan khi một page/hook được sửa đồng thời ở nhiều phần của kế hoạch.
- Reviewer cuối kế thừa model hiện tại theo yêu cầu người dùng; không còn reviewer khác model hoạt động.

Các quyết định trên giảm thay đổi cấu trúc; giới hạn chung là chỉ được kiểm tra tĩnh, chưa quan sát vòng đời/focus thực tế.
