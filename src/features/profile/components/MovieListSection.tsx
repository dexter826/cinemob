import { useEffect, useMemo, useState } from 'react';
import { Film, Search, X } from 'lucide-react';
import EmptyState from '@/shared/components/ui/EmptyState';
import CustomDropdown from '@/shared/components/ui/CustomDropdown';
import SkeletonCard from '@/shared/components/ui/SkeletonCard';
import ProfileMovieCard from './ProfileMovieCard';
import type { ProfileMovie } from '@/types';
import {
  filterAndSortProfileMovies,
  getVisibleProfileMovies,
  type ProfileSortOption,
} from '../utils/profileSelectors';

const SORT_OPTIONS = [
  { value: 'default', label: 'Mới xem gần đây' },
  { value: 'rating-desc', label: 'Đánh giá cao nhất' },
  { value: 'year-desc', label: 'Năm phát hành (mới nhất)' },
  { value: 'year-asc', label: 'Năm phát hành (cũ nhất)' },
];

const LOAD_MORE_SIZE = 40;

interface MovieListSectionProps {
  movies: ProfileMovie[];
  isLoading?: boolean;
  emptyTitle: string;
  emptyDescription: string;
}

// Danh sách phim đã xem: tìm kiếm, sắp xếp, phân trang kiểu "Xem thêm".
function MovieListSection({
  movies,
  isLoading = false,
  emptyTitle,
  emptyDescription,
}: MovieListSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<ProfileSortOption>('default');
  const [visibleCount, setVisibleCount] = useState(LOAD_MORE_SIZE);

  const filteredMovies = useMemo(
    () => filterAndSortProfileMovies(movies, searchQuery, sortBy),
    [movies, searchQuery, sortBy],
  );

  const visibleMovies = useMemo(
    () => getVisibleProfileMovies(filteredMovies, visibleCount),
    [filteredMovies, visibleCount],
  );

  useEffect(() => {
    setVisibleCount(LOAD_MORE_SIZE);
  }, [searchQuery, sortBy]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return <EmptyState icon={Film} title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary"
            aria-hidden="true"
          />
          <label htmlFor="profile-search" className="sr-only">
            Tìm phim trong hồ sơ này
          </label>
          <input
            id="profile-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm phim trong hồ sơ này…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-surface border border-border rounded-card pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm font-medium focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/30 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors p-1"
              aria-label="Xóa từ khóa tìm kiếm"
            >
              <X size={15} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:w-64 shrink-0">
          <div className="w-full">
            <CustomDropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as ProfileSortOption)}
              placeholder="Sắp xếp"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 text-xs text-text-secondary px-1 tabular-nums">
        <span>
          {searchQuery.trim() ? (
            <>
              Tìm thấy <strong className="text-primary font-bold">{filteredMovies.length}</strong>{' '}
              phim · đang hiển thị{' '}
              <strong className="text-primary font-bold">{visibleMovies.length}</strong>
            </>
          ) : (
            <>
              Đang hiển thị{' '}
              <strong className="text-primary font-bold">{visibleMovies.length}</strong> /{' '}
              {filteredMovies.length} phim
            </>
          )}
        </span>
        {searchQuery.trim() && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-primary hover:underline font-semibold cursor-pointer shrink-0"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {filteredMovies.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Không tìm thấy phim phù hợp"
          description={`Không có bộ phim nào khớp với từ khóa "${searchQuery}"`}
          action={{ label: 'Xem tất cả phim', onClick: () => setSearchQuery('') }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {visibleMovies.map((movie) => (
            <ProfileMovieCard key={String(movie.id)} movie={movie} />
          ))}
        </div>
      )}

      {visibleMovies.length < filteredMovies.length && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => setVisibleCount((current) => current + LOAD_MORE_SIZE)}
            className="px-5 py-2.5 rounded-control border border-border bg-surface text-sm font-semibold text-text-primary hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
          >
            Xem thêm
          </button>
        </div>
      )}
    </>
  );
}

export default MovieListSection;
