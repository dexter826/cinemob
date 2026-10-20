import { TMDBMovieResult } from '@/types';
import { Dice5, RotateCcw } from 'lucide-react';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import MoviePosterGrid from './movie-poster-grid';

interface RandomSuggestionsSectionProps {
  movies: TMDBMovieResult[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  onRefresh: () => void;
  getMovieStatus: (id: number) => 'history' | 'watchlist' | null;
  onSelectMovie: (movie: TMDBMovieResult) => void;
}

function RandomSuggestionsSection({
  movies,
  isLoading,
  hasLoaded,
  error,
  onRefresh,
  getMovieStatus,
  onSelectMovie,
}: RandomSuggestionsSectionProps) {
  const isInitialLoading = !hasLoaded && movies.length === 0;

  return (
    <section
      aria-labelledby="random-suggestions-title"
      aria-busy={isLoading}
      className="mb-6 sm:mb-8"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Dice5 className="text-primary shrink-0" size={18} aria-hidden="true" />
          <h2 id="random-suggestions-title" className="text-lg sm:text-xl text-primary font-bold">
            Đề xuất cho bạn
          </h2>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-control text-xs sm:text-sm bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-primary whitespace-nowrap shrink-0"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>{isLoading ? 'Đang cập nhật…' : 'Làm mới'}</span>
        </button>
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error && movies.length === 0 ? (
        <ErrorState
          compact
          title={error}
          description="Vui lòng thử lại."
          retry={{ label: 'Thử lại', onClick: onRefresh }}
        />
      ) : movies.length === 0 ? (
        <EmptyState
          compact
          icon={Dice5}
          title="Chưa có đề xuất"
          description="Bấm Làm mới để bốc danh sách khác."
        />
      ) : (
        <MoviePosterGrid movies={movies} getMovieStatus={getMovieStatus} onSelect={onSelectMovie} />
      )}
    </section>
  );
}

export default RandomSuggestionsSection;
