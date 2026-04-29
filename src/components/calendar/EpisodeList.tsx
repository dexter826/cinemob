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
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 flex flex-col h-full min-h-[500px] lg:min-h-[600px]">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-text-main flex items-center gap-2 text-lg">
            <Bell size={20} className="text-primary" />
            {selectedDate 
              ? `Phát sóng ${selectedDate.toLocaleDateString('vi-VN')}`
              : 'Tập sắp phát sóng'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs font-semibold text-primary hover:underline cursor-pointer bg-primary/10 px-2.5 py-1 rounded-full transition-colors"
            >
              Xem tất cả
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-3 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-background rounded-xl animate-pulse">
                <div className="w-12 h-16 bg-black/10 dark:bg-white/10 rounded-lg" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-md w-3/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-md w-1/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <Info size={40} className="text-text-secondary mb-3 opacity-50" />
            <p className="text-text-secondary font-medium text-sm">
              {selectedDate 
                ? 'Không có tập nào phát sóng ngày này'
                : 'Không có tập nào sắp phát sóng'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {Object.entries(episodesByDate).map(([date, episodes]) => (
              <div key={date}>
                <div className="sticky top-0 bg-surface py-2 z-10">
                  <h4 className="text-sm font-medium text-primary">
                    {formatDate(date)}
                  </h4>
                </div>
                <div className="space-y-3">
                  {episodes.map((ep, idx) => (
                    <div
                      key={`${ep.seriesId}-${ep.episode.id}-${idx}`}
                      onClick={() => handleSeriesClick(ep)}
                      className="flex gap-3 p-3 bg-background rounded-xl hover:bg-primary/5 transition-all duration-300 cursor-pointer border border-black/5 dark:border-white/5 relative group items-center"
                    >
                      <img
                        src={getTMDBImageUrl(ep.posterPath)}
                        alt={ep.seriesName}
                        className="w-12 h-16 object-cover rounded-lg shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-bold text-text-main truncate group-hover:text-primary transition-colors">
                          {ep.seriesNameVi || ep.seriesName}
                        </h5>
                        <p className="text-sm font-semibold text-primary mt-0.5">
                          S{ep.episode.season_number}E{ep.episode.episode_number}
                        </p>
                        <p className="text-xs text-text-secondary truncate mt-1">
                          {ep.episode.name}
                        </p>
                        {ep.episode.runtime && (
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-1 font-medium">
                            <Clock size={12} className="text-primary" />
                            {ep.episode.runtime} phút
                          </p>
                        )}
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
