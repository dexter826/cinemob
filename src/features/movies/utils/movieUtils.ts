import { Movie } from '@/types';
import { translateCountries } from '@/constants/countries';
import { GENRE_TRANSLATIONS } from '@/constants/genres';
import { normalizeDate } from '@/shared/utils/dateFormat';

// Phim có quốc gia Việt Nam hay không, dùng để chọn tiêu đề chính/phụ.
const isVietnameseOrigin = (country: string): boolean =>
  ['Vietnam', 'Việt Nam', 'VN'].some((c) => country.includes(c));

// Phim đã xem, thiếu status thì coi là history.
export const isWatchedMovie = (movie: Movie): boolean => (movie.status || 'history') === 'history';

// Ưu tiên tiêu đề Tiếng Việt.
export const getMainTitle = (movie: Movie): string => {
  const isVN = isVietnameseOrigin(movie.country || '');
  return isVN && movie.title_vi ? movie.title_vi : movie.title_vi || movie.title;
};

// Lấy tên gốc của phim.
export const getSubTitle = (movie: Movie): string => {
  const isVN = isVietnameseOrigin(movie.country || '');
  const mainTitle = getMainTitle(movie);

  if (!isVN && movie.title_vi && movie.title_vi !== movie.title) {
    return movie.title;
  }

  if (movie.title_vi && movie.title_vi !== movie.title && mainTitle !== movie.title) {
    return movie.title;
  }

  return '';
};

// Tiêu đề kết hợp (Chính + Phụ).
export const getDisplayTitle = (movie: Movie): string => {
  const main = getMainTitle(movie);
  const sub = getSubTitle(movie);
  return sub ? `${main} (${sub})` : main;
};

// Dịch tên quốc gia sang Tiếng Việt.
export const getTranslatedCountries = (countryStr: string): string => {
  return translateCountries(countryStr);
};

// Dịch danh sách thể loại sang Tiếng Việt.
export const getTranslatedGenres = (genreStr: string): string => {
  if (!genreStr) return '';
  return genreStr
    .split(',')
    .map((g) => {
      const trimmed = g.trim();
      return GENRE_TRANSLATIONS[trimmed] || trimmed;
    })
    .join(', ');
};

// Đọc season_dates thành danh sách {season, date} sắp theo số mùa.
export const getSeasonWatchedDates = (movie: Movie): Array<{ season: number; date: Date }> => {
  const seasonDates = movie.progress?.season_dates;
  if (!seasonDates) return [];
  return Object.entries(seasonDates)
    .map(([season, iso]) => {
      const [y, m, d] = iso.split('-').map(Number);
      return y && m && d ? { season: Number(season), date: new Date(y, m - 1, d) } : null;
    })
    .filter((s): s is { season: number; date: Date } => s !== null && Number.isFinite(s.season))
    .sort((a, b) => a.season - b.season);
};

// Ngày xem muộn nhất trong watched_at và các mùa — dùng cho hiển thị và lọc năm.
export const getLatestWatchedDate = (movie: Movie): Date | null => {
  let latest = normalizeDate(movie.watched_at);
  for (const { date } of getSeasonWatchedDates(movie)) {
    if (!latest || date.getTime() > latest.getTime()) latest = date;
  }
  return latest;
};
