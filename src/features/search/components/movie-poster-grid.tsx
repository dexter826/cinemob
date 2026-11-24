import { Bookmark, Check, Plus } from 'lucide-react';
import { TMDBMovieResult } from '@/types';
import PosterCard from '@/features/movies/components/poster-card';
import useMarkWatchedStore from '@/features/movies/stores/mark-watched-store';
import useMovieStore from '@/features/movies/stores/movie-store';
import useAddMovieStore from '@/features/movies/stores/add-movie-store';
import Spinner from '@/shared/components/ui/spinner';
import { useQuickAddTMDB } from '../hooks/use-quick-add';
import { getMainTitleForTMDB, getSubTitleForTMDB } from '@/shared/utils/tmdb';
import { findLibraryEntry, getSeriesInfo } from '@/features/movies/utils/movie-utils';

interface MoviePosterGridProps {
  movies: TMDBMovieResult[];
  onSelect: (movie: TMDBMovieResult) => void;
}

const isTVResult = (movie: TMDBMovieResult) =>
  movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);

const getCardMeta = (movie: TMDBMovieResult) => {
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  return [getSubTitleForTMDB(movie), year].filter(Boolean).join(' · ');
};

const quickActionButtonClass =
  'min-w-8 min-h-8 flex items-center justify-center bg-black/60 hover:bg-primary text-white rounded-poster border border-white/10 transition-colors cursor-pointer focus-ring focus-visible:outline-none';

function MoviePosterGrid({ movies, onSelect }: MoviePosterGridProps) {
  const { addWatchlist, pendingKey } = useQuickAddTMDB();
  const openMarkWatched = useMarkWatchedStore((state) => state.openMarkWatched);
  const openAddModal = useAddMovieStore((state) => state.openAddModal);
  const { movies: savedMovies } = useMovieStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {movies.map((movie) => {
        const mediaType = isTVResult(movie) ? 'tv' : 'movie';
        const seriesInfo = mediaType === 'tv' ? getSeriesInfo(savedMovies, movie.id, 'tv') : null;
        const savedMovie = findLibraryEntry(savedMovies, movie.id, 'movie');
        const inLibrary = mediaType === 'movie' ? savedMovie?.status ?? null : null;
        const quickKey = `${mediaType}-${movie.id}`;
        return (
          <PosterCard
            key={quickKey}
            title={getMainTitleForTMDB(movie)}
            posterPath={movie.poster_path}
            mediaType={mediaType}
            rating={movie.vote_average}
            status={inLibrary}
            badge={seriesInfo?.badge ?? null}
            meta={getCardMeta(movie)}
            onClick={() => onSelect(movie)}
            actions={
              !inLibrary && !seriesInfo ? (
                <>
                  <button
                    type="button"
                    disabled={pendingKey !== null}
                    aria-busy={pendingKey === quickKey}
                    onClick={() => void addWatchlist(movie)}
                    aria-label={`Thêm “${getMainTitleForTMDB(movie)}” vào Sẽ xem`}
                    title="Sẽ xem"
                    className={quickActionButtonClass}
                  >
                    {pendingKey === quickKey ? (
                      <Spinner size={13} className="text-current" />
                    ) : (
                      <Bookmark size={13} strokeWidth={1.5} aria-hidden="true" />
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={pendingKey !== null}
                    onClick={() =>
                      openMarkWatched({
                        kind: 'tmdb',
                        id: movie.id,
                        title: getMainTitleForTMDB(movie),
                        poster_path: movie.poster_path || '',
                        media_type: mediaType,
                        release_date: movie.release_date || movie.first_air_date,
                      })
                    }
                    aria-label={`Đánh dấu “${getMainTitleForTMDB(movie)}” đã xem`}
                    title="Đã xem"
                    className={quickActionButtonClass}
                  >
                    <Check size={13} strokeWidth={2} aria-hidden="true" />
                  </button>
                </>
              ) : seriesInfo?.nextMissingSeason ? (
                <button
                  type="button"
                  onClick={() =>
                    openAddModal({
                      movie,
                      mediaType: 'tv',
                      initialSeason: seriesInfo.nextMissingSeason ?? undefined,
                    })
                  }
                  aria-label={`Thêm Mùa ${seriesInfo.nextMissingSeason} của “${getMainTitleForTMDB(movie)}”`}
                  title={`Thêm Mùa ${seriesInfo.nextMissingSeason}`}
                  className={quickActionButtonClass}
                >
                  <Plus size={13} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}

export default MoviePosterGrid;
