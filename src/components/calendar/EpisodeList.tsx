import React from 'react';
import { Bell, Info, Clock } from 'lucide-react';
import { UpcomingEpisode } from '../../types';
import { PLACEHOLDER_IMAGE } from '../../constants';
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

/** Hiển thị danh sách các tập phim sắp chiếu, có thể lọc theo ngày đã chọn. */
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
      <div className="bg-surface/50 backdrop-blur-xl border border-border-default rounded-[32px] p-8 flex flex-col h-full min-h-[500px] lg:min-h-[600px] shadow-premium">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-bold text-text-main flex items-center gap-3 text-xl tracking-tight">
            <Bell size={24} className="text-primary" />
            {selectedDate 
              ? `Ngày ${selectedDate.toLocaleDateString('vi-VN')}`
              : 'Sắp chiếu'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all cursor-pointer"
            >
              Tất cả
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl animate-pulse">
                <div className="w-14 h-20 bg-black/10 dark:bg-white/10 rounded-xl shadow-sm" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-5 bg-black/10 dark:bg-white/10 rounded-lg w-3/4" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-1/4" />
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-5 border border-border-default opacity-40">
              <Info size={32} className="text-text-muted" />
            </div>
            <p className="text-text-muted font-bold text-sm uppercase tracking-widest opacity-60">
              {selectedDate 
                ? 'Không có tập phim nào'
                : 'Chưa có lịch phát sóng'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {Object.entries(episodesByDate).map(([date, episodes]) => (
              <div key={date}>
                <div className="sticky top-0 bg-surface/80 backdrop-blur-md py-3 z-10 border-b border-border-default mb-4">
                  <h4 className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
                    {formatDate(date)}
                  </h4>
                </div>
                <div className="space-y-4">
                  {episodes.map((ep, idx) => (
                    <div
                      key={`${ep.seriesId}-${ep.episode.id}-${idx}`}
                      onClick={() => handleSeriesClick(ep)}
                      className="flex gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-[24px] hover:bg-primary/5 hover:shadow-premium transition-all duration-500 cursor-pointer border border-border-default group relative items-center"
                    >
                      <div className="w-14 h-20 shrink-0 rounded-xl overflow-hidden shadow-lg border border-border-default group-hover:scale-105 transition-transform duration-500">
                        <img
                          src={getTMDBImageUrl(ep.posterPath)}
                          alt={ep.seriesName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-text-main text-base truncate group-hover:text-primary transition-colors tracking-tight">
                          {ep.seriesNameVi || ep.seriesName}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                            S{ep.episode.season_number}E{ep.episode.episode_number}
                          </span>
                          {ep.episode.runtime && (
                            <span className="text-[10px] font-bold text-text-muted flex items-center gap-1 opacity-60">
                              <Clock size={10} /> {ep.episode.runtime} phút
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-text-muted truncate mt-2 italic opacity-80">
                          {ep.episode.name}
                        </p>
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
