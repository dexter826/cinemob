import { Tv, Bell, Calendar, Clock } from 'lucide-react';

interface CalendarStatsProps {
  tvSeriesCount: number;
  upcomingEpisodesCount: number;
  monthEpisodesCount: number;
  airedEpisodesCount: number;
}

function CalendarStats({
  tvSeriesCount,
  upcomingEpisodesCount,
  monthEpisodesCount,
  airedEpisodesCount,
}: CalendarStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-surface border border-border-default rounded-card p-4 sm:p-5 ">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-control flex items-center justify-center border border-primary/20 shrink-0">
            <Tv size={24} className="text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-none truncate tabular-nums">
              {tvSeriesCount}
            </p>
            <p className="text-xs font-semibold text-text-secondary mt-1.5 sm:mt-2 truncate">
              Series
            </p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-card p-4 sm:p-5 md:p-6 ">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-control flex items-center justify-center border border-primary/20 shrink-0">
            <Bell size={24} className="text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-none truncate tabular-nums">
              {monthEpisodesCount}
            </p>
            <p className="text-xs font-semibold text-text-secondary mt-1.5 sm:mt-2 truncate">
              Tập trong tháng
            </p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-card p-4 sm:p-5 md:p-6 ">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-control flex items-center justify-center border border-primary/20 shrink-0">
            <Calendar size={24} className="text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-none truncate tabular-nums">
              {airedEpisodesCount}
            </p>
            <p className="text-xs font-semibold text-text-secondary mt-1.5 sm:mt-2 truncate">
              Đã phát sóng
            </p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-card p-4 sm:p-5 md:p-6 ">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-control flex items-center justify-center border border-primary/20 shrink-0">
            <Clock size={24} className="text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-none truncate tabular-nums">
              {upcomingEpisodesCount}
            </p>
            <p className="text-xs font-semibold text-text-secondary mt-1.5 sm:mt-2 truncate">
              Sắp phát sóng
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalendarStats;
