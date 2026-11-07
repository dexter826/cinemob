import { MovieStatus } from '@/types';

/** Nhãn trạng thái hiển thị trên chip/poster và trong toggle trạng thái. */
export const MOVIE_STATUS_LABEL: Record<MovieStatus, string> = {
  history: 'Đã xem',
  watchlist: 'Sẽ xem',
  dropped: 'Bỏ dở',
};

/** Nhãn tab ở Thư viện — ngắn hơn chip để vừa số đếm bên cạnh. */
export const MOVIE_STATUS_TAB_LABEL: Record<MovieStatus | 'watching', string> = {
  history: 'Đã xem',
  watching: 'Đang xem',
  watchlist: 'Sẽ xem',
  dropped: 'Bỏ dở',
};
