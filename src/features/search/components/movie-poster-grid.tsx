import { MovieStatus, TMDBMovieResult } from '@/types';
import PosterCard from '@/features/movies/components/poster-card';
import { getMainTitleForTMDB, getSubTitleForTMDB } from '@/shared/utils/tmdb';

interface MoviePosterGridProps {
  movies: TMDBMovieResult[];
  getMovieStatus: (id: number) => MovieStatus | null;
  onSelect: (movie: TMDBMovieResult) => void;
}

const isTVResult = (movie: TMDBMovieResult) =>
  movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);

const getCardMeta = (movie: TMDBMovieResult) => {
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  return [getSubTitleForTMDB(movie), year].filter(Boolean).join(' · ');
};

function MoviePosterGrid({ movies, getMovieStatus, onSelect }: MoviePosterGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {movies.map((movie) => {
        const mediaType = isTVResult(movie) ? 'tv' : 'movie';
        return (
          <PosterCard
            key={`${mediaType}-${movie.id}`}
            title={getMainTitleForTMDB(movie)}
            posterPath={movie.poster_path}
            mediaType={mediaType}
            rating={movie.vote_average}
            status={getMovieStatus(movie.id)}
            meta={getCardMeta(movie)}
            onClick={() => onSelect(movie)}
          />
        );
      })}
    </div>
  );
}

export default MoviePosterGrid;
