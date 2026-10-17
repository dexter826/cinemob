import { TMDBMovieResult } from '@/types';
import PosterCard from '@/features/movies/components/poster-card';
import { getMainTitleForTMDB, getSubTitleForTMDB } from '@/shared/utils/tmdb';
import Pagination from '@/shared/components/ui/pagination';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import { Sparkles, Star, RotateCcw, Search } from 'lucide-react';

interface SearchResultsProps {
  isLoading: boolean;
  query: string;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isAiLoading: boolean;
  isTrendingLoading: boolean;
  aiRecommendations: TMDBMovieResult[];
  trendingMovies: TMDBMovieResult[];
  discoverMovies: TMDBMovieResult[];
  filteredResults: TMDBMovieResult[];
  watchedMoviesCount: number;
  getMovieStatus: (id: number) => 'history' | 'watchlist' | null;
  handleSelectMovie: (movie: TMDBMovieResult) => void;
  refreshRecommendations: (userId: string, force?: boolean) => void;
  removeRecommendation: (movieTitle: string) => void;
  userId: string;
  resultsError?: boolean;
  retrySearch?: () => void;
}

/** Hiển thị kết quả tìm kiếm, phim thịnh hành hoặc đề xuất AI. */
function SearchResults({
  isLoading,
  query,
  totalPages,
  currentPage,
  setCurrentPage,
  isAiLoading,
  isTrendingLoading,
  aiRecommendations,
  trendingMovies,
  discoverMovies,
  filteredResults,
  watchedMoviesCount,
  getMovieStatus,
  handleSelectMovie,
  refreshRecommendations,
  removeRecommendation,
  userId,
  resultsError = false,
  retrySearch,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 py-6 sm:py-8">
        {Array.from({ length: 10 }).map((_, i) => (
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

  const isHomeNoQuery = !query && discoverMovies.length === 0;
  const showAiLoadingBlock = isHomeNoQuery && isAiLoading;
  const showTrendingSkeleton = isTrendingLoading && trendingMovies.length === 0;
  const showFiltered = Boolean(query) || discoverMovies.length > 0;

  const cardMeta = (movie: TMDBMovieResult) => {
    const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
    return [getSubTitleForTMDB(movie), year].filter(Boolean).join(' · ');
  };
  const isTVResult = (movie: TMDBMovieResult) =>
    movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);

  if (showAiLoadingBlock) {
    return (
      <>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="text-primary shrink-0" size={18} aria-hidden="true" />
            <h2 className="text-lg sm:text-xl font-bold text-primary truncate">Đề xuất cho bạn</h2>
          </div>
          <button
            type="button"
            onClick={() => refreshRecommendations(userId, true)}
            disabled={isAiLoading}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-control text-xs sm:text-sm bg-surface border border-border-default hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-primary whitespace-nowrap shrink-0"
          >
            <RotateCcw size={16} aria-hidden="true" />
            <span>Làm mới</span>
          </button>
        </div>
        <div className="py-6 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
          <p className="text-sm font-medium text-text-secondary text-center pt-2">
            Đang phân tích lịch sử xem và gợi ý phim phù hợp…
          </p>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <Star className="text-primary shrink-0" size={18} aria-hidden="true" />
          <h2 className="text-lg sm:text-xl text-primary font-bold">Phim thịnh hành</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {showTrendingSkeleton
            ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
            : trendingMovies.map((movie) => (
                <PosterCard
                  key={movie.id}
                  title={getMainTitleForTMDB(movie)}
                  posterPath={movie.poster_path}
                  mediaType={isTVResult(movie) ? 'tv' : 'movie'}
                  rating={movie.vote_average}
                  status={getMovieStatus(movie.id)}
                  meta={cardMeta(movie)}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))}
        </div>
      </>
    );
  }

  return (
    <>
      <>
        {!query && !discoverMovies.length && (
          <>
            {watchedMoviesCount >= 3 && (
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="text-primary shrink-0" size={18} aria-hidden="true" />
                  <h2 className="text-lg sm:text-xl font-bold text-primary truncate">
                    Đề xuất cho bạn
                  </h2>
                </div>

                {aiRecommendations.length === 0 && !isAiLoading ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline text-xs text-text-secondary">
                      Không tải được đề xuất.{' '}
                    </span>
                    <button
                      type="button"
                      onClick={() => refreshRecommendations(userId, true)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-control text-xs sm:text-sm bg-primary text-on-primary hover:bg-primary/80 transition-colors cursor-pointer"
                    >
                      <RotateCcw size={14} aria-hidden="true" />
                      <span>Thử lại</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => refreshRecommendations(userId, true)}
                    disabled={isAiLoading}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-control text-xs sm:text-sm bg-surface border border-border-default hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-primary whitespace-nowrap shrink-0"
                  >
                    <RotateCcw size={16} aria-hidden="true" />
                    <span>Làm mới</span>
                  </button>
                )}
              </div>
            )}
            {aiRecommendations.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-8">
                {aiRecommendations.map((movie) => (
                  <PosterCard
                    key={movie.id}
                    title={getMainTitleForTMDB(movie)}
                    posterPath={movie.poster_path}
                    mediaType={isTVResult(movie) ? 'tv' : 'movie'}
                    rating={movie.vote_average}
                    status={getMovieStatus(movie.id)}
                    meta={cardMeta(movie)}
                    onClick={() => handleSelectMovie(movie)}
                    onRemove={() => removeRecommendation(movie.title ?? '')}
                  />
                ))}
              </div>
            )}

            <div className="flex items-center gap-2 mb-4">
              <Star className="text-primary shrink-0" size={18} aria-hidden="true" />
              <h2 className="text-lg sm:text-xl text-primary font-bold">Phim thịnh hành</h2>
            </div>
          </>
        )}
        <div
          aria-live="polite"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5"
        >
          {showFiltered
            ? filteredResults.map((movie) => (
                <PosterCard
                  key={movie.id}
                  title={getMainTitleForTMDB(movie)}
                  posterPath={movie.poster_path}
                  mediaType={isTVResult(movie) ? 'tv' : 'movie'}
                  rating={movie.vote_average}
                  status={getMovieStatus(movie.id)}
                  meta={cardMeta(movie)}
                  onClick={() => handleSelectMovie(movie)}
                />
              ))
            : showTrendingSkeleton
              ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
              : trendingMovies.map((movie) => (
                  <PosterCard
                    key={movie.id}
                    title={getMainTitleForTMDB(movie)}
                    posterPath={movie.poster_path}
                    mediaType={isTVResult(movie) ? 'tv' : 'movie'}
                    rating={movie.vote_average}
                    status={getMovieStatus(movie.id)}
                    meta={cardMeta(movie)}
                    onClick={() => handleSelectMovie(movie)}
                  />
                ))}
          {query.length > 2 && filteredResults.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={Search}
                title="Không tìm thấy kết quả"
                description={`Không có phim nào khớp “${query}”. Thử từ khóa khác.`}
              />
            </div>
          )}
          {!query && discoverMovies.length === 0 && trendingMovies.length === 0 && (
            <div className="col-span-full">
              <EmptyState
                icon={Search}
                title="Bắt đầu khám phá"
                description="Nhập tên phim hoặc series để tìm kiếm."
              />
            </div>
          )}
        </div>

        {!isLoading && filteredResults.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </>
    </>
  );
}

export default SearchResults;
