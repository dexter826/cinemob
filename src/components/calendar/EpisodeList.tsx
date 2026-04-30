import React from 'react';
import { Bell, Info, Clock, ChevronRight } from 'lucide-react';
import { UpcomingEpisode } from '../../types';
import { getTMDBImageUrl } from '../../utils/movieUtils';

interface EpisodeListProps {
  viewMode: 'calendar' | 'list';
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  loadingEpisodes: boolean;
  displayedEpisodes: UpcomingEpisode[];
  episodesByDate: { [key: string]: UpcomingEpisode[] };
  handleSeriesClick: (episode: UpcomingEpisode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({
  viewMode,
  selectedDate,
  setSelectedDate,
  loadingEpisodes,
  displayedEpisodes,
  episodesByDate,
  handleSeriesClick
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className={viewMode === 'calendar' ? 'lg:col-span-1' : 'lg:col-span-3'}>
      <div className="bg-surface/50 backdrop-blur-xl border border-border-default rounded-3xl sm:rounded-4xl p-4 sm:p-6 md:p-8 flex flex-col h-full min-h-[400px] lg:min-h-[600px] shadow-premium transition-all duration-300">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <h3 className="font-bold text-text-main flex items-center gap-2.5 sm:gap-3 text-lg sm:text-xl tracking-tight">
            <Bell size={24} className="text-primary" />
            <span className="truncate">
              {selectedDate 
                ? `Ngày ${selectedDate.toLocaleDateString('vi-VN')}`
                : 'Sắp chiếu'
              }
            </span>
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Tất cả
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 p-3 sm:p-4 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl animate-pulse">
                <div className="w-12 h-16 sm:w-14 sm:h-20 bg-black/10 dark:bg-white/10 rounded-xl" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-3/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4 border border-border-default opacity-40">
              <Info size={32} className="text-text-muted" />
            </div>
            <p className="text-text-muted font-bold text-[10px] sm:text-xs uppercase tracking-widest opacity-60">
              {selectedDate 
                ? 'Không có tập phim nào'
                : 'Chưa có lịch phát sóng'
              }
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-1 pr-1">
            {Object.entries(episodesByDate).map(([date, episodes]) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="sticky top-0 z-10 pb-3 flex justify-start">
                  <div className="bg-surface/95 backdrop-blur-md border border-border-default/80 px-3.5 py-1.5 rounded-full shadow-sm ring-1 ring-black/5 dark:ring-white/5">
                    <h4 className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.12em] whitespace-nowrap">
                      {formatDate(date)}
                    </h4>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {episodes.map((ep, idx) => (
                    <div
                      key={`${ep.seriesId}-${ep.episode.id}-${idx}`}
                      onClick={() => handleSeriesClick(ep)}
                      className="flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-primary/5 hover:shadow-premium transition-all duration-300 cursor-pointer border border-border-default group relative items-start overflow-hidden"
                    >
                      <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-border-default/50 group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={getTMDBImageUrl(ep.posterPath)}
                          alt={ep.seriesName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h5 className="font-bold text-text-main text-sm sm:text-base truncate group-hover:text-primary transition-colors tracking-tight leading-snug">
                          {ep.seriesNameVi || ep.seriesName}
                        </h5>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[9px] font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase">
                            S{ep.episode.season_number}E{ep.episode.episode_number}
                          </span>
                          {ep.episode.runtime && (
                            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1 opacity-50">
                              <Clock size={10} /> {ep.episode.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs font-medium text-text-muted truncate mt-1.5 italic opacity-70 group-hover:opacity-100 transition-opacity">
                          {ep.episode.name || `Tập ${ep.episode.episode_number}`}
                        </p>
                      </div>
                      <div className="self-center pl-1 sm:pl-2">
                        <ChevronRight size={16} className="text-text-muted opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeList;
