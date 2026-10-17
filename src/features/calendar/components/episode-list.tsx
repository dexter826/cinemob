import { Info, Clock, ChevronRight } from 'lucide-react';
import { UpcomingEpisode } from '@/types';
import { formatDateDMY, todayISO } from '@/shared/utils/date-format';
import { getTMDBImageUrl } from '@/shared/utils/tmdb';

interface EpisodeListProps {
  currentDate: Date;
  episodesError: string | null;
  retryEpisodes: () => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  loadingEpisodes: boolean;
  displayedEpisodes: UpcomingEpisode[];
  episodesByDate: { [key: string]: UpcomingEpisode[] };
  handleSeriesClick: (episode: UpcomingEpisode) => void;
}

/** Hiển thị chi tiết tập phim trong tháng hoặc ngày đang chọn. */
function EpisodeList({
  currentDate,
  episodesError,
  retryEpisodes,
  selectedDate,
  setSelectedDate,
  loadingEpisodes,
  displayedEpisodes,
  episodesByDate,
  handleSeriesClick,
}: EpisodeListProps) {
  const today = todayISO();
  const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const monthTitle = `Tháng ${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="lg:col-span-1 lg:max-h-[880px] flex flex-col min-w-0">
      <div className="bg-surface border border-border rounded-dialog p-4 sm:p-6 flex flex-col h-full min-h-[400px] lg:max-h-[880px] lg:min-h-[880px]">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h2 className="font-bold text-text-primary text-lg sm:text-xl tracking-tight truncate">
            {selectedDate ? `Ngày ${formatDateDMY(selectedDate)}` : monthTitle}
          </h2>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              type="button"
              aria-label="Xem cả tháng"
              className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 sm:px-4 sm:py-2 rounded-control border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Xem cả tháng
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-3 sm:p-4 bg-black/5 dark:bg-white/5 border border-border-default rounded-card animate-pulse"
              >
                <div className="w-12 h-16 sm:w-14 sm:h-20 bg-black/10 dark:bg-white/10 rounded-control" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-black/10 dark:bg-white/10 rounded-lg w-3/4" />
                  <div className="h-3 bg-black/10 dark:bg-white/10 rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : episodesError ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12 text-center">
            <p role="alert" className="text-text-secondary text-sm">
              {episodesError}
            </p>
            <button
              type="button"
              onClick={retryEpisodes}
              className="px-4 py-2 rounded-control bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20"
            >
              Thử lại
            </button>
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/5 dark:bg-white/5 rounded-card flex items-center justify-center mb-4 border border-border-default opacity-40">
              <Info size={32} className="text-text-secondary" aria-hidden="true" />
            </div>
            <p className="text-text-secondary font-semibold text-xs">
              {selectedDate
                ? 'Không có tập phim nào trong ngày này'
                : monthKey > today.slice(0, 7)
                  ? 'Chưa có lịch phát sóng được công bố cho tháng này'
                  : 'Không có tập phim phát sóng trong tháng này'}
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto custom-scrollbar -mr-1 pr-1">
            {Object.entries(episodesByDate).map(([date, episodes]) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="sticky top-0 z-10 pb-3 flex justify-start">
                  <div className="bg-surface border border-border px-3.5 py-1.5 rounded-control">
                    <h4 className="text-xs font-bold text-primary whitespace-nowrap">
                      {formatDate(date)}
                    </h4>
                  </div>
                </div>
                <div className="space-y-2.5 cv-auto">
                  {episodes.map((ep) => (
                    <button
                      key={`${ep.seriesId}-${ep.episode.id}`}
                      type="button"
                      onClick={() => handleSeriesClick(ep)}
                      aria-label={`Xem thông tin phim ${ep.seriesNameVi || ep.seriesName} tập ${ep.episode.episode_number}`}
                      className="w-full flex gap-3 sm:gap-4 p-2.5 sm:p-3 bg-black/5 dark:bg-white/5 rounded-card hover:bg-primary/5 transition-colors duration-300 cursor-pointer border border-border text-left items-start overflow-hidden"
                    >
                      <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-lg sm:rounded-control overflow-hidden border border-border-default/50 transition-colors duration-300">
                        <img
                          src={getTMDBImageUrl(ep.posterPath)}
                          alt={ep.seriesName}
                          width={140}
                          height={210}
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
                            <span className="text-xs font-bold text-text-secondary flex items-center gap-1 opacity-60">
                              <Clock size={12} aria-hidden="true" /> {ep.episode.runtime}&nbsp;phút
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-medium text-text-secondary truncate mt-1.5 italic">
                          {ep.episode.name || `Tập ${ep.episode.episode_number}`}
                        </p>
                        <p className="text-xs text-text-secondary mt-1.5">
                          {date < today
                            ? 'Đã phát sóng'
                            : date === today
                              ? 'Hôm nay'
                              : 'Sắp phát sóng'}
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
}

export default EpisodeList;
