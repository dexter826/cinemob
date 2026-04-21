import React from 'react';
import { TMDBMovieResult } from '../../types';
import { TMDB_IMAGE_BASE_URL } from '../../constants';
import { getDisplayTitleForTMDB } from '../../utils/movieUtils';
import { Film, Tv, Bookmark } from 'lucide-react';

interface TMDBMovieCardProps {
  movie: TMDBMovieResult;
  onClick: (movie: TMDBMovieResult) => void;
  status?: 'history' | 'watchlist' | null;
}

const TMDBMovieCard: React.FC<TMDBMovieCardProps> = ({ movie, onClick, status }) => {
  const title = getDisplayTitleForTMDB(movie);
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || 'N/A';
  const isTV = movie.media_type === 'tv';

  return (
    <div
      onClick={() => onClick(movie)}
      className="group relative bg-surface rounded-xl overflow-hidden border border-black/5 dark:border-white/5 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden">
        {movie.poster_path ? (
          <img
            src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800 text-text-muted">
            <Film size={32} />
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {status && (
          <div className="absolute top-2 left-2 flex items-center space-x-1 px-2 py-1 bg-green-500/60 backdrop-blur-md rounded-lg border border-white/20 z-10">
            <Bookmark size={12} className="text-white fill-white" />
            <span className="text-xs font-bold text-white">{status === 'history' ? 'Đã xem' : 'Sẽ xem'}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm line-clamp-1" title={title}>
          {title}
        </h3>
        <p className="text-xs text-text-muted mt-1">
          {year} • {isTV ? (
            <span className="inline-flex items-center gap-1"><Tv size={10} /> TV</span>
          ) : (
            <span className="inline-flex items-center gap-1"><Film size={10} /> Phim</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default TMDBMovieCard;
