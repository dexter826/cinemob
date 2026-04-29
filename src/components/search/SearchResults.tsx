import React from 'react';
import { TMDBMovieResult, TMDBPerson } from '../../types';
import TMDBMovieCard from '../ui/TMDBMovieCard';
import PersonCard from '../ui/PersonCard';
import Loading from '../ui/Loading';
import Pagination from '../ui/Pagination';
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
  userId
}) => {

  const navigate = useNavigate();

  if (isLoading) {
    return <Loading fullScreen={false} size={40} className="py-20" />;
  }

  return (

      <>
        {!query && !discoverMovies.length && isAiLoading ? (
          <>
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-primary" size={18} />
                <h2 className="text-xl font-bold text-primary">Đề xuất cho bạn</h2>
              </div>
              <button
                type="button"
                onClick={() => refreshRecommendations(userId, true)}
                disabled={isAiLoading}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface transition-colors cursor-pointer text-text-main"
              >
                <RotateCcw size={16} />
                <span>Làm mới</span>
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-24 h-24">
                {suggestAnimation && <Lottie animationData={suggestAnimation} loop={true} />}
              </div>
              <p className="text-lg font-medium text-primary animate-pulse">Đang gợi ý phim cho bạn...</p>
            </div>
            <div className="flex items-center gap-2">
              <Star className="text-primary" size={18} />
              <h2 className="text-xl text-primary font-bold">Phim thịnh hành</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-primary" size={18} />
                      <h2 className="text-xl font-bold text-primary">Đề xuất cho bạn</h2>
                    </div>

                    {aiRecommendations.length === 0 && !isAiLoading ? (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="hidden sm:inline text-sm text-text-muted">Không thể tải. </span>
                        <button
                          type="button"
                          onClick={() => refreshRecommendations(userId, true)}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-primary text-white hover:bg-primary/80 transition-colors cursor-pointer self-start sm:self-auto"
                        >
                          <RotateCcw size={16} />
                          <span>Thử lại</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => refreshRecommendations(userId, true)}
                        disabled={isAiLoading}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm bg-surface border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface transition-colors cursor-pointer text-text-main"
                      >
                        <RotateCcw size={16} />
                        <span>Làm mới</span>
                      </button>
                    )}
                  </div>
                )}
                {aiRecommendations.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
                    {aiRecommendations.map(movie => (
                      <TMDBMovieCard
                        key={movie.id}
                        movie={movie}
                        onClick={handleSelectMovie}
                        status={getMovieStatus(movie.id)}
                      />
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Star className="text-primary" size={18} />
                  <h2 className="text-xl text-primary font-bold">Phim thịnh hành</h2>
                </div>
              </>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
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
                <div className="col-span-full text-center py-10 text-text-muted">
                  Không tìm thấy kết quả nào.
                </div>
              )}
              {!query && discoverMovies.length === 0 && trendingMovies.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-text-muted opacity-50">
                  <Search size={48} className="mb-4" />
                  <p>Nhập tên phim hoặc nhấn "Tìm" để duyệt tất cả phim</p>
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
