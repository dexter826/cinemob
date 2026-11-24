import { Tv, Bell, Calendar, Clock } from 'lucide-react';
import Skeleton from '@/shared/components/ui/skeleton';
import { Stat } from '@/shared/components/ui';

interface CalendarStatsProps {
  episodesLoading: boolean;
  episodesError: string | null;
  tvSeriesCount: number;
  upcomingEpisodesCount: number;
  monthEpisodesCount: number;
  airedEpisodesCount: number;
}

/** Chỉ số trang Lịch — dùng Stat kit; cả bốn card chờ cùng một nguồn dữ liệu. */
function CalendarStats({
  episodesLoading,
  episodesError,
  tvSeriesCount,
  upcomingEpisodesCount,
  monthEpisodesCount,
  airedEpisodesCount,
}: CalendarStatsProps) {
  const statValue = (count: number) =>
    episodesLoading ? (
      <Skeleton as="span" className="inline-block h-10 w-20 align-middle" />
    ) : episodesError ? (
      '—'
    ) : (
      count
    );
  return (
    <div
      aria-busy={episodesLoading}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8"
    >
      <Stat label="Series" value={statValue(tvSeriesCount)} icon={Tv} colorClass="text-primary" />
      <Stat
        label="Tập trong tháng"
        value={statValue(monthEpisodesCount)}
        icon={Bell}
        colorClass="text-primary"
      />
      <Stat
        label="Đã phát sóng"
        value={statValue(airedEpisodesCount)}
        icon={Calendar}
        colorClass="text-primary"
      />
      <Stat
        label="Sắp phát sóng"
        value={statValue(upcomingEpisodesCount)}
        icon={Clock}
        colorClass="text-primary"
      />
    </div>
  );
}

export default CalendarStats;
