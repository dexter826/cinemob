// Danh sách các thông báo trong ứng dụng.
export const MESSAGES = {
  MOVIE: {
    ADD_SUCCESS: "Đã thêm phim mới",
    UPDATE_SUCCESS: "Đã cập nhật thông tin phim",
    DELETE_SUCCESS: "Đã xóa phim khỏi lịch sử",
    DELETE_ERROR: "Xóa phim thất bại",
    SAVE_ERROR: "Có lỗi khi lưu phim",
    REQUIRED_RATING: "Vui lòng đánh giá phim",
    ALREADY_EXISTS: "Phim này đã có trong danh sách",
  },
  ALBUM: {
    CREATE_SUCCESS: (name: string) => `Đã tạo album "${name}"`,
    CREATE_ERROR: "Tạo album thất bại",
    UPDATE_SUCCESS: "Đã cập nhật album",
    UPDATE_ERROR: "Cập nhật album thất bại",
    DELETE_SUCCESS: "Đã xóa album",
    DELETE_ERROR: "Xóa album thất bại",
    ADD_MOVIE_SUCCESS: "Đã thêm phim vào album",
    ADD_MOVIE_ERROR: "Thêm phim vào album thất bại",
    REMOVE_MOVIE_SUCCESS: "Đã gỡ phim khỏi album",
    REMOVE_MOVIE_ERROR: "Gỡ phim khỏi album thất bại",
    ALREADY_IN: "Phim đã có trong album này",
    NAME_REQUIRED: "Tên album không được để trống",
    ONLY_WATCHED: "Chỉ có thể thêm phim đã xem vào album",
  },
  COMMON: {
    ERROR: "Có lỗi xảy ra, vui lòng thử lại",
    LOAD_ERROR: "Không thể tải thông tin",
    REQUIRED_FIELDS: "Vui lòng nhập đủ thông tin",
  }
} as const;
