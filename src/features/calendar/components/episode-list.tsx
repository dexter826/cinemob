import { Info, ChevronRight } from 'lucide-react';
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

/** Danh sách tập phim — flat rows chia hairline, không hộp (editorial). */
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
    <div className="lg:col-span-1 lg:relative min-w-0 min-h-0 lg:border-l lg:border-border lg:pl-6">
      <div className="flex flex-col min-h-0 lg:absolute lg:inset-y-0 lg:right-0 lg:left-6">
        <div className="flex items-center justify-between gap-3 mb-5 sm:mb-6">
          <h2 className="font-bold text-text-primary text-lg sm:text-xl tracking-tight truncate">
            {selectedDate ? `Ngày ${formatDateDMY(selectedDate)}` : monthTitle}
          </h2>
          {selectedDate && (
            <button
              onClick={() => setSelectedDate(null)}
              type="button"
              aria-label="Xem cả tháng"
              className="text-xs font-bold text-primary hover:underline underline-offset-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Xem cả tháng
            </button>
          )}
        </div>

        {loadingEpisodes ? (
          <div className="space-y-4 flex-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="flex gap-4 py-3 border-b border-border-default animate-pulse">
                <div className="w-12 h-16 sm:w-14 sm:h-20 bg-surface-elevated rounded-control" />
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-4 bg-surface-elevated rounded w-3/4" />
                  <div className="h-3 bg-surface-elevated rounded w-1/4" />
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
              className="px-4 py-2 rounded-control border border-border text-text-primary text-xs font-bold hover:border-primary hover:text-primary transition-colors cursor-pointer"
            >
              Thử lại
            </button>
          </div>
        ) : displayedEpisodes.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <Info size={32} className="text-text-secondary opacity-40 mb-4" aria-hidden="true" />
            <p className="text-text-secondary font-semibold text-xs">
              {selectedDate
                ? 'Không có tập phim nào trong ngày này'
                : monthKey > today.slice(0, 7)
                  ? 'Chưa có lịch phát sóng được công bố cho tháng này'
                  : 'Không có tập phim phát sóng trong tháng này'}
            </p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar -mr-1 pr-1">
            {Object.entries(episodesByDate).map(([date, episodes]) => (
              <div key={date} className="mb-6 last:mb-0">
                <div className="sticky top-0 z-10 pb-2 -mt-1 pt-1 flex justify-start bg-background">
                  <h4 className="text-xs font-bold text-primary whitespace-nowrap">
                    {formatDate(date)}
                  </h4>
                </div>
                <div className="divide-y divide-border-default cv-auto">
                  {episodes.map((ep) => (
                    <button
                      key={`${ep.seriesId}-${ep.episode.id}`}
                      type="button"
                      onClick={() => handleSeriesClick(ep)}
                      aria-label={`Xem thông tin phim ${ep.seriesNameVi || ep.seriesName} tập ${ep.episode.episode_number}`}
                      className="w-full flex gap-3 sm:gap-4 py-3 hover:bg-primary/5 transition-colors duration-200 cursor-pointer text-left items-start overflow-hidden"
                    >
                      <div className="w-12 h-16 sm:w-14 sm:h-20 shrink-0 rounded-poster overflow-hidden border border-border">
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
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs font-black text-primary tabular-nums">
                            S{ep.episode.season_number}E{ep.episode.episode_number}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-text-secondary truncate mt-1">
                          {ep.episode.name || `Tập ${ep.episode.episode_number}`}
                        </p>
                        <p className="text-xs text-text-secondary mt-1">
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
