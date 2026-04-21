import React from 'react';
import { Bell, Info, Clock } from 'lucide-react';
import { UpcomingEpisode } from '../../types';
import { TMDB_IMAGE_BASE_URL, PLACEHOLDER_IMAGE } from '../../constants';

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
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-text-main flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            {selectedDate 
              ? `Tập phát sóng ngày ${selectedDate.toLocaleDateString('vi-VN')}`
              : 'Tập sắp phát sóng'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Xem tất cả
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-background rounded-lg animate-pulse">
                <div className="w-12 h-16 bg-black/10 dark:bg-white/10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-3/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="text-center py-8">
            <Info size={32} className="mx-auto text-text-secondary mb-2" />
            <p className="text-text-secondary">
              {selectedDate 
                ? 'Không có tập nào phát sóng ngày này'
                : 'Không có tập nào sắp phát sóng'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
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
                      className="flex gap-3 p-3 bg-background rounded-lg hover:bg-primary/5 transition-colors cursor-pointer"
                    >
                      <img
                        src={ep.posterPath 
                          ? `${TMDB_IMAGE_BASE_URL}${ep.posterPath}`
                          : PLACEHOLDER_IMAGE
                        }
                        alt={ep.seriesName}
                        className="w-12 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-text-main truncate">
                          {ep.seriesNameVi || ep.seriesName}
                        </h5>
                        <p className="text-sm text-primary">
                          S{ep.episode.season_number}E{ep.episode.episode_number}
                        </p>
                        <p className="text-xs text-text-secondary truncate mt-1">
                          {ep.episode.name}
                        </p>
                        {ep.episode.runtime && (
                          <p className="text-xs text-text-secondary flex items-center gap-1 mt-1">
                            <Clock size={12} />
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
