import { useEffect, useMemo, useState } from 'react';
import { Film, Search as SearchIcon } from 'lucide-react';
import EmptyState from '@/shared/components/ui/empty-state';
import Dropdown from '@/shared/components/ui/dropdown';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import PosterCard from '@/features/movies/components/poster-card';
import Search from '@/shared/components/ui/search';
import { formatDateAny } from '@/shared/utils/date-format';
import type { ProfileMovie } from '@/types';
import {
  filterAndSortProfileMovies,
  getVisibleProfileMovies,
  type ProfileSortOption,
} from '../utils/profile-selectors';

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
        <Search
          id="profile-search"
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Tìm phim trong hồ sơ này…"
          label="Tìm phim trong hồ sơ này"
          className="flex-1"
        />

        <div className="flex items-center gap-2 sm:w-64 shrink-0">
          <div className="w-full">
            <Dropdown
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => setSortBy(val as ProfileSortOption)}
              placeholder="Sắp xếp theo…"
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
          icon={SearchIcon}
          title="Không tìm thấy phim phù hợp"
          description={`Không có bộ phim nào khớp với từ khóa “${searchQuery}”`}
          action={{ label: 'Xem tất cả phim', onClick: () => setSearchQuery('') }}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {visibleMovies.map((movie) => (
            <PosterCard
              key={String(movie.id)}
              title={movie.title_vi || movie.title}
              posterPath={movie.poster_path ?? null}
              mediaType={movie.media_type}
              rating={movie.rating}
              review={movie.is_review}
              meta={
                movie.watched_at
                  ? formatDateAny(movie.watched_at)
                  : movie.release_date
                    ? movie.release_date.slice(0, 4)
                    : undefined
              }
            />
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
