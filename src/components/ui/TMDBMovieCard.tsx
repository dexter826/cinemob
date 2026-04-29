import React from 'react';
import { TMDBMovieResult } from '../../types';
import { getMainTitleForTMDB, getSubTitleForTMDB, getTMDBImageUrl } from '../../utils/movieUtils';
import { Film, Tv, Bookmark, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface TMDBMovieCardProps {
  movie: TMDBMovieResult;
  onClick: (movie: TMDBMovieResult) => void;
  status?: 'history' | 'watchlist' | null;
  character?: string;
  job?: string;
}

const TMDBMovieCard: React.FC<TMDBMovieCardProps> = ({ movie, onClick, status, character, job }) => {
  const mainTitle = getMainTitleForTMDB(movie);
  const subTitle = getSubTitleForTMDB(movie);
  const year = (movie.release_date || movie.first_air_date)?.split('-')[0] || '';
  const isTV = movie.media_type === 'tv' || (!movie.media_type && movie.first_air_date);
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : null;

  return (
    <motion.div
      onClick={() => onClick(movie)}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-surface rounded-2xl overflow-hidden border border-border-default cursor-pointer shadow-premium hover:shadow-premium-hover hover:border-primary/30 transition-all duration-300"
    >
      <div className="aspect-2/3 w-full relative overflow-hidden bg-black/5 dark:bg-white/5">
        <img
          src={getTMDBImageUrl(movie.poster_path, 'w500')}
          alt={mainTitle}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          {status && (
            <div className={`flex items-center gap-1 px-2 py-1 backdrop-blur-xl rounded-lg border border-white/20 text-[10px] font-bold text-white shadow-glass ${
              status === 'history' ? 'bg-success/60' : 'bg-primary/60'
            }`}>
              <Bookmark size={10} className="fill-white" />
              <span>{status === 'history' ? 'ĐÃ XEM' : 'SẼ XEM'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-1.5">
            {rating && (
              <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-xl rounded-md border border-white/10 text-[10px] font-bold text-warning shadow-glass">
                <Star size={10} fill="currentColor" />
                <span>{rating}</span>
              </div>
            )}
            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-black/40 backdrop-blur-xl rounded-md border border-white/10 text-[10px] font-bold text-white uppercase shadow-glass">
              {isTV ? <Tv size={10} className="text-info" /> : <Film size={10} className="text-success" />}
              <span>{isTV ? 'TV' : 'Phim'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-1">
        <h3 className="font-bold text-sm line-clamp-1 text-text-main group-hover:text-primary transition-colors" title={mainTitle}>
          {mainTitle}
        </h3>
        
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] text-text-muted truncate flex-1 italic" title={subTitle}>
            {subTitle || '\u00A0'}
          </p>
          {year && (
            <div className="flex items-center gap-1 text-[10px] text-text-muted font-medium shrink-0">
              <Calendar size={10} className="opacity-70" />
              <span>{year}</span>
            </div>
          )}
        </div>

        {(character || job) && (
          <p className="text-[10px] text-primary/80 font-medium truncate pt-1 border-t border-border-default">
            {character ? `Nhân vật: ${character}` : `Công việc: ${job}`}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default TMDBMovieCard;
