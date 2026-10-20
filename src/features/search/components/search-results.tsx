import type { SearchMode } from '../hooks/use-search-tmdb';
import { TMDBMovieResult } from '@/types';
import Pagination from '@/shared/components/ui/pagination';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import { Search, Star } from 'lucide-react';
import MoviePosterGrid from './movie-poster-grid';

interface SearchResultsProps {
  mode: SearchMode;
  onClear: () => void;
  isLoading: boolean;
  query: string;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isTrendingLoading: boolean;
  trendingMovies: TMDBMovieResult[];
  filteredResults: TMDBMovieResult[];
  getMovieStatus: (id: number) => 'history' | 'watchlist' | null;
  handleSelectMovie: (movie: TMDBMovieResult) => void;
  resultsError?: boolean;
  retrySearch?: () => void;
}

function SearchResults({
  mode,
  onClear,
  isLoading,
  query,
  totalPages,
  currentPage,
  setCurrentPage,
  isTrendingLoading,
  trendingMovies,
  filteredResults,
  getMovieStatus,
  handleSelectMovie,
  resultsError = false,
  retrySearch,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 py-6 sm:py-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (resultsError) {
    return (
      <ErrorState
        title="Không tải được nội dung từ TMDB"
        description="Kiểm tra kết nối mạng rồi thử tải lại."
        retry={retrySearch ? { label: 'Thử lại', onClick: retrySearch } : undefined}
        className="py-12"
      />
    );
  }

  const showTrendingSkeleton = isTrendingLoading && trendingMovies.length === 0;
  const showFiltered = mode !== 'home';

  return (
    <>
      {mode === 'home' && (
        <div className="mb-4 flex items-center gap-2 min-w-0">
          <Star className="text-primary shrink-0" size={18} aria-hidden="true" />
          <h2 className="text-lg sm:text-xl text-primary font-bold">Phim thịnh hành</h2>
        </div>
      )}

      {showFiltered &&
        (filteredResults.length > 0 ? (
          <MoviePosterGrid
            movies={filteredResults}
            getMovieStatus={getMovieStatus}
            onSelect={handleSelectMovie}
          />
        ) : mode === 'search' ? (
          <EmptyState
            icon={Search}
            title="Không tìm thấy kết quả"
            description={`Không có phim nào khớp “${query}”. Thử từ khóa khác.`}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Không có phim khớp bộ lọc"
            description="Thử thay đổi bộ lọc để tìm phim khác."
            action={{ label: 'Xóa bộ lọc', onClick: onClear }}
          />
        ))}

      {!showFiltered &&
        (showTrendingSkeleton ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : trendingMovies.length > 0 ? (
          <MoviePosterGrid
            movies={trendingMovies}
            getMovieStatus={getMovieStatus}
            onSelect={handleSelectMovie}
          />
        ) : (
          <EmptyState
            icon={Search}
            title="Bắt đầu khám phá"
            description="Nhập tên phim hoặc series để tìm kiếm."
          />
        ))}

      {filteredResults.length > 0 && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </>
  );
}

export default SearchResults;
