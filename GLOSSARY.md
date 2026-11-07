# CineMOB

Ứng dụng quản lý danh mục và theo dõi tiến độ thưởng thức phim ảnh cá nhân.

## Không gian & Điều hướng

**Thư viện**:
Không gian trung tâm lưu trữ và quản lý toàn bộ các tác phẩm cá nhân của người dùng theo từng trạng thái và bộ lọc.
_Avoid_: Dashboard, Bảng điều khiển, Trang chủ, Bộ sưu tập chính

## Tác phẩm & Định dạng

**Tác phẩm**:
Một thực thể nội dung điện ảnh hoặc truyền hình mà người dùng lưu trữ và theo dõi trong hệ thống.
_Avoid_: Nội dung, Media, Item, Tiết mục, Show

**Movie**:
Tác phẩm điện ảnh hoàn chỉnh được phát hành dưới dạng một tập duy nhất với thời lượng cố định.
_Avoid_: Phim lẻ, Phim đơn, Điện ảnh độc lập

**Series**:
Tác phẩm truyền hình nhiều tập được chia theo các mùa phát sóng và có tiến độ theo dõi từng tập.
_Avoid_: Phim bộ, TV Show, Phim truyền hình nhiều tập, Show

## Nhân vật & Đội ngũ

**Nghệ sĩ**:
Cá nhân tham gia vào quá trình sáng tạo tác phẩm điện ảnh hoặc truyền hình, có trang hồ sơ và danh sách tác phẩm liên kết.
_Avoid_: Person, Nhân vật, Người làm phim, Người nổi tiếng

**Diễn viên**:
Nghệ sĩ trực tiếp đảm nhận vai diễn thể hiện các nhân vật trong tác phẩm.
_Avoid_: Cast, Tài tử, Minh tinh

**Đạo diễn**:
Nghệ sĩ chịu trách nhiệm chỉ đạo diễn xuất và quyết định phong cách nghệ thuật tổng thể của tác phẩm.
_Avoid_: Director, Nhà làm phim

**Trailer**:
Đoạn video ngắn chính thức được phát hành nhằm quảng bá và giới thiệu nội dung tác phẩm.
_Avoid_: Teaser, Clip xem trước, Video giới thiệu, Preview

## Trạng thái theo dõi

**Đã xem**:
Trạng thái của tác phẩm mà người dùng đã xem trọn vẹn.
_Avoid_: Lịch sử xem, Đã hoàn thành (cho cả series)

**Sẽ xem**:
Trạng thái của tác phẩm được lưu vào danh sách chờ để thưởng thức trong tương lai.
_Avoid_: Muốn xem, Chờ xem, Danh sách theo dõi, Wishlist

**Bỏ dở**:
Trạng thái của tác phẩm người dùng chủ động ngừng theo dõi giữa chừng và không dự định tiếp tục.
_Avoid_: Tạm dừng, Ngừng xem, Đã hủy, Dropped

**Đang xem**:
Tab Thư viện tập hợp các series thuộc nhóm Đã xem chưa xem hết tất cả các tập. Dữ liệu chỉ lưu ba trạng thái Đã xem / Sẽ xem / Bỏ dở; Đang xem là view suy diễn từ tiến độ theo dõi.
_Avoid_: Đang theo dõi, Watching

## Tiến độ theo dõi

**Mùa**:
Phần phát sóng định kỳ của một series, bao gồm một tập hợp các tập phim liên kết theo cốt truyện.
_Avoid_: Season, Phần, Đợt chiếu

**Tập**:
Đơn vị nội dung phát sóng nhỏ nhất có thời lượng riêng biệt trong một mùa của series.
_Avoid_: Episode, Chập, Phần nhỏ

**Tiến độ xem**:
Chỉ số phản ánh vị trí mùa và tập người dùng đã xem đến, kèm tổng số tập đã thưởng thức và mốc thời gian xem của từng mùa.
_Avoid_: Điểm dừng, Vị trí phát, Dấu trang

**Hoàn thành**:
Trạng thái ghi nhận người dùng đã xem toàn bộ các tập của tất cả các mùa hiện có trong series.
_Avoid_: Đã xong, Hết phim, Kết thúc

## Tổ chức & Bộ sưu tập

**Album**:
Danh mục nhóm các tác phẩm tùy biến do người dùng tự tạo để lưu trữ theo chủ đề hoặc sở thích riêng biệt.
_Avoid_: Bộ sưu tập, Playlist, Danh sách phim tùy chỉnh, Thư mục phim

## Tiện ích & Nhập liệu

**Vòng quay ngẫu nhiên**:
Công cụ hỗ trợ bốc thăm ngẫu nhiên một tác phẩm để thưởng thức khi phân vân, lấy nguồn từ danh sách Sẽ xem hoặc xu hướng thịnh hành.
_Avoid_: Bánh xe may mắn, Random picker, Chọn ngẫu nhiên, Vòng quay phim

**Thêm thủ công**:
Phương thức tự nhập liệu thông tin tác phẩm vào thư viện đối với các nội dung không có sẵn trên cơ sở dữ liệu TMDB.
_Avoid_: Thêm ngoài, Tác phẩm tùy biến, Phim tự nhập, Thêm tùy chỉnh

## Hồ sơ & Kết nối

**Hồ sơ thành viên**:
Trang thông tin cá nhân công khai hiển thị giới thiệu, danh sách tác phẩm và các thống kê xem phim của người dùng.
_Avoid_: Trang cá nhân, Profile, User page, Tài khoản công khai

**Phim chung**:
Danh sách các tác phẩm mà hai thành viên cùng ghi nhận đã xem trong thư viện, phản ánh mức độ tương đồng về sở thích điện ảnh.
_Avoid_: Phim tương đồng, Gu phim chung, Phim trùng, Common movies

**Quyền riêng tư danh sách**:
Tùy chọn cho phép ẩn hoặc hiển thị công khai danh sách các tác phẩm trong thư viện trên hồ sơ thành viên.
_Avoid_: Chế độ ẩn, Khóa thư viện, Private list, Ẩn phim

## Đánh giá & Ghi nhận

**Điểm đánh giá**:
Chỉ số chấm điểm từ 1 đến 10 biểu thị mức độ yêu thích hoặc chất lượng tác phẩm theo nhận định của người dùng.
_Avoid_: Rating, Số sao, Điểm phim

**Review**:
Đoạn văn bản ghi lại góc nhìn, ấn tượng hoặc nhận xét mang tính cá nhân của người dùng sau khi xem tác phẩm.
_Avoid_: Cảm nhận, Đánh giá (dạng chữ), Bình luận, Comment

**Xem tóm tắt**:
Hình thức theo dõi nội dung tác phẩm thông qua các video hoặc bài tóm tắt cô đọng (recap) thay vì thưởng thức bản phim gốc trọn vẹn.
_Avoid_: Xem qua đánh giá, Xem review, Xem recap

## Lịch & Thông báo

**Lịch phát sóng**:
Lịch hiển thị mốc thời gian công chiếu các tập phim mới thuộc những Series trong danh mục theo dõi của người dùng (Đã xem hoặc Sẽ xem).
_Avoid_: Lịch chiếu phim, Lịch công chiếu rạp, Lịch phát hành, Calendar

**Tập mới**:
Tập phim truyền hình sắp hoặc vừa được công chiếu chính thức theo thời gian thực từ nhà sản xuất.
_Avoid_: Tập tiếp theo, Tập sắp chiếu, New episode

**Thông báo phát sóng**:
Thông báo đẩy tức thời gửi tới thiết bị của người dùng để nhắc nhở khi có tập mới lên sóng trong ngày.
_Avoid_: Web push, Tin báo, Báo thức, Alert

## Thống kê & Số liệu

**Thời lượng thưởng thức**:
Tổng lượng thời gian người dùng đã dành để thưởng thức các tác phẩm, được tính toán và quy đổi thành số ngày, giờ và phút.
_Avoid_: Thời gian xem, Tổng phút xem, Watch time, Thời lượng tích lũy

**Xu hướng xem**:
Biểu đồ phản ánh số lượng tác phẩm và tần suất thưởng thức được phân bổ chi tiết theo từng tháng trong một năm cụ thể.
_Avoid_: Lịch sử theo tháng, Biểu đồ tháng, Tần suất năm, Monthly trend
