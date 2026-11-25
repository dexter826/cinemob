import { TMDBMovieResult } from '@/types';
import { Dice5, RotateCcw } from 'lucide-react';
import EmptyState from '@/shared/components/ui/empty-state';
import ErrorState from '@/shared/components/ui/error-state';
import Button from '@/shared/components/ui/button';
import SkeletonCard from '@/shared/components/ui/skeleton-card';
import { useDelayedSkeleton } from '@/shared/hooks/use-delayed-skeleton';
import MoviePosterGrid from './movie-poster-grid';

interface RandomSuggestionsSectionProps {
  movies: TMDBMovieResult[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  onRefresh: () => void;
  onSelectMovie: (movie: TMDBMovieResult) => void;
}

function RandomSuggestionsSection({
  movies,
  isLoading,
  hasLoaded,
  error,
  onRefresh,
  onSelectMovie,
}: RandomSuggestionsSectionProps) {
  const isInitialLoading = !hasLoaded && movies.length === 0;
  const showSkeleton = useDelayedSkeleton(isInitialLoading);

  return (
    <section
      aria-labelledby="random-suggestions-title"
      aria-busy={isLoading}
      className="mb-6 sm:mb-8"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Dice5 className="text-primary shrink-0" size={18} strokeWidth={1.5} aria-hidden="true" />
          <h2 id="random-suggestions-title" className="text-title-md text-primary font-bold">
            Đề xuất cho bạn
          </h2>
        </div>
        <Button
          variant="secondary"
          size="md"
          loading={isLoading}
          onClick={onRefresh}
          aria-label={isLoading ? 'Đang cập nhật gợi ý…' : 'Làm mới gợi ý'}
          title={isLoading ? 'Đang cập nhật gợi ý…' : 'Làm mới gợi ý'}
          leadingIcon={<RotateCcw size={16} strokeWidth={1.5} aria-hidden="true" />}
          className="shrink-0 whitespace-nowrap"
        >
          <span className="hidden sm:inline">{isLoading ? 'Đang cập nhật…' : 'Làm mới'}</span>
        </Button>
      </div>

      {error && movies.length > 0 && (
        <div className="mb-3 flex items-center gap-2 text-body-sm text-danger">
          <span role="status">Không cập nhật được gợi ý mới.</span>
          <button
            type="button"
            onClick={onRefresh}
            className="font-bold text-primary hover:underline cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {isInitialLoading ? (
        showSkeleton ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} badges={2} />
            ))}
          </div>
        ) : null
      ) : error && movies.length === 0 ? (
        <ErrorState
          compact
          title={error}
          description="Vui lòng thử lại để tải danh sách đề xuất."
          retry={{ label: 'Thử lại', onClick: onRefresh }}
        />
      ) : movies.length === 0 ? (
        <EmptyState
          compact
          icon={Dice5}
          title="Chưa có đề xuất"
          description="Nhấn Làm mới để nhận gợi ý phim ngẫu nhiên."
        />
      ) : (
        <MoviePosterGrid movies={movies} onSelect={onSelectMovie} />
      )}
    </section>
  );
}

export default RandomSuggestionsSection;
