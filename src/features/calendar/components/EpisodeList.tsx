import { Info, Clock, ChevronRight } from 'lucide-react';
import { UpcomingEpisode } from '@/types';
import { getTMDBImageUrl } from '@/features/movies/utils/movieUtils';

interface EpisodeListProps {
  viewMode: 'calendar' | 'list';
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  loadingEpisodes: boolean;
  displayedEpisodes: UpcomingEpisode[];
  episodesByDate: { [key: string]: UpcomingEpisode[] };
  handleSeriesClick: (episode: UpcomingEpisode) => void;
}

/** Hiển thị danh sách tập phim sắp phát sóng theo ngày hoặc toàn bộ. */
function EpisodeList({
  viewMode,
  selectedDate,
  setSelectedDate,
  loadingEpisodes,
  displayedEpisodes,
  episodesByDate,
  handleSeriesClick
}: EpisodeListProps) {
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
    <div className={viewMode === 'calendar' ? 'lg:col-span-1 lg:max-h-[880px] flex flex-col' : 'lg:col-span-3'}>
      <div className={`bg-surface border border-border rounded-3xl p-4 sm:p-6 flex flex-col h-full min-h-[400px] ${viewMode === 'calendar' ? 'lg:max-h-[880px] lg:min-h-[880px]' : 'lg:min-h-[600px]'}`}>
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h3 className="font-bold text-text-primary text-lg sm:text-xl tracking-tight truncate">
            {selectedDate
              ? `Ngày ${selectedDate.toLocaleDateString('vi-VN')}`
              : 'Sắp chiếu'
            }
          </h3>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              aria-label="Xem tất cả các tập sắp phát sóng"
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
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
            <p className="text-text-secondary font-semibold text-xs">
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
                  <div className="bg-surface border border-border px-3.5 py-1.5 rounded-full">
                    <h4 className="text-xs font-bold text-primary whitespace-nowrap">
                      {formatDate(date)}
                    </h4>
                  </div>
                </div>
                <div className="space-y-2.5">
                  {episodes.map((ep) => (
                    <button
                      key={`${ep.seriesId}-${ep.episode.id}`}
                      type="button"
                      onClick={() => handleSeriesClick(ep)}
                      aria-label={`Xem thông tin phim ${ep.seriesNameVi || ep.seriesName} tập ${ep.episode.episode_number}`}
                      className="w-full flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:bg-primary/5 transition-colors duration-300 cursor-pointer border border-border text-left items-start overflow-hidden"
                    >
                      <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg sm:rounded-xl overflow-hidden shadow-md border border-border-default/50 transition-colors duration-300">
                        <img
                          src={getTMDBImageUrl(ep.posterPath)}
                          alt={ep.seriesName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <h5 className="font-bold text-text-primary text-sm truncate tracking-tight leading-snug">
                          {ep.seriesNameVi || ep.seriesName}
                        </h5>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-black text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase">
                            S{ep.episode.season_number}E{ep.episode.episode_number}
                          </span>
                          {ep.episode.runtime && (
                            <span className="text-xs font-bold text-text-muted flex items-center gap-1 opacity-60">
                              <Clock size={12} /> {ep.episode.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-text-secondary truncate mt-1.5 italic">
                          {ep.episode.name || `Tập ${ep.episode.episode_number}`}
                        </p>
                      </div>
                      <div className="self-center pl-1 sm:pl-2" aria-hidden="true">
                        <ChevronRight size={16} className="text-text-secondary shrink-0" />
                      </div>
                    </button>
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
