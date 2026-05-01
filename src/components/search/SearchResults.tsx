import React from 'react';
import { TMDBMovieResult, TMDBPerson } from '../../types';
import TMDBMovieCard from '../ui/TMDBMovieCard';
import PersonCard from '../ui/PersonCard';
import Loading from '../ui/Loading';
import Pagination from '../ui/Pagination';
import SkeletonCard from '../ui/SkeletonCard';
import EmptyState from '../ui/EmptyState';
import Lottie from 'lottie-react';
import { Sparkles, Star, RotateCcw, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResultsProps {
  isLoading: boolean;
  query: string;
  totalPages: number;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  isAiLoading: boolean;
  aiRecommendations: TMDBMovieResult[];
  trendingMovies: TMDBMovieResult[];
  discoverMovies: TMDBMovieResult[];
  filteredResults: TMDBMovieResult[];
  suggestAnimation: any;
  watchedMoviesCount: number;
  getMovieStatus: (id: number) => 'history' | 'watchlist' | null;
  handleSelectMovie: (movie: TMDBMovieResult) => void;
  refreshRecommendations: (userId: string, force?: boolean) => void;
  removeRecommendation: (userId: string, movieTitle: string) => Promise<void>;
  userId: string;
}

/** Hiển thị kết quả tìm kiếm, phim thịnh hành hoặc đề xuất AI. */
const SearchResults: React.FC<SearchResultsProps> = ({
  isLoading,
  query,
  totalPages,
  currentPage,
  setCurrentPage,
  isAiLoading,
  aiRecommendations,
  trendingMovies,
  discoverMovies,
  filteredResults,
  suggestAnimation,
  watchedMoviesCount,
  getMovieStatus,
  handleSelectMovie,
  refreshRecommendations,
  removeRecommendation,
  userId
}) => {

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 py-6 sm:py-8">
        {Array.from({ length: 10 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (

      <>
        {!query && !discoverMovies.length && isAiLoading ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="text-primary shrink-0" size={18} />
                <h2 className="text-lg sm:text-xl font-bold text-primary truncate">Đề xuất cho bạn</h2>
              </div>
              <button
                type="button"
                onClick={() => refreshRecommendations(userId, true)}
                disabled={isAiLoading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm bg-surface border border-border-default hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-main whitespace-nowrap shrink-0"
              >
                <RotateCcw size={16} />
                <span>Làm mới</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 space-y-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24">
                {suggestAnimation && <Lottie animationData={suggestAnimation} loop={true} />}
              </div>
              <p className="text-base sm:text-lg font-medium text-primary animate-pulse text-center px-4">Đang gợi ý phim cho bạn...</p>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <Star className="text-primary shrink-0" size={18} />
              <h2 className="text-lg sm:text-xl text-primary font-bold">Phim thịnh hành</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {trendingMovies.map(movie => (
                <TMDBMovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleSelectMovie}
                  status={getMovieStatus(movie.id)}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            {!query && !discoverMovies.length && (
              <>
                {watchedMoviesCount >= 3 && (
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="text-primary shrink-0" size={18} />
                      <h2 className="text-lg sm:text-xl font-bold text-primary truncate">Đề xuất cho bạn</h2>
                    </div>

                    {aiRecommendations.length === 0 && !isAiLoading ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline text-xs text-text-muted">Không thể tải. </span>
                        <button
                          type="button"
                          onClick={() => refreshRecommendations(userId, true)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm bg-primary text-white hover:bg-primary/80 transition-colors cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          <span>Thử lại</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => refreshRecommendations(userId, true)}
                        disabled={isAiLoading}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm bg-surface border border-border-default hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-main whitespace-nowrap shrink-0"
                      >
                        <RotateCcw size={16} />
                        <span>Làm mới</span>
                      </button>
                    )}
                  </div>
                )}
                {aiRecommendations.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5 mb-8">
                    {aiRecommendations.map(movie => (
                      <TMDBMovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={handleSelectMovie}
                        status={getMovieStatus(movie.id)}
                        onRemove={(m) => removeRecommendation(userId, m.title)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 mb-4">
                  <Star className="text-primary shrink-0" size={18} />
                  <h2 className="text-lg sm:text-xl text-primary font-bold">Phim thịnh hành</h2>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {(query || discoverMovies.length > 0) ? filteredResults.map(movie => (
                <TMDBMovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleSelectMovie}
                  status={getMovieStatus(movie.id)}
                />
              )) : trendingMovies.map(movie => (
                <TMDBMovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={handleSelectMovie}
                  status={getMovieStatus(movie.id)}
                />
              ))}
              {query.length > 2 && filteredResults.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={Search}
                    title="Không tìm thấy kết quả"
                    description={`Chúng tôi không tìm thấy phim nào phù hợp với từ khóa "${query}". Hãy thử từ khóa khác.`}
                  />
                </div>
              )}
              {!query && discoverMovies.length === 0 && trendingMovies.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={Search}
                    title="Bắt đầu khám phá"
                    description="Nhập tên phim, diễn viên hoặc từ khóa để tìm kiếm những tác phẩm điện ảnh tuyệt vời."
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
        )}
      </>
  );
};


export default SearchResults;
