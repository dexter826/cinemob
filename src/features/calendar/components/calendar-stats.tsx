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

/** Chỉ số trang Lịch — dùng Stat kit. */
function CalendarStats({
  episodesLoading,
  episodesError,
  tvSeriesCount,
  upcomingEpisodesCount,
  monthEpisodesCount,
  airedEpisodesCount,
}: CalendarStatsProps) {
  const episodeValue = (count: number) =>
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
      <Stat label="Series" value={tvSeriesCount} icon={Tv} colorClass="text-primary" />
      <Stat
        label="Tập trong tháng"
        value={episodeValue(monthEpisodesCount)}
        icon={Bell}
        colorClass="text-primary"
      />
      <Stat
        label="Đã phát sóng"
        value={episodeValue(airedEpisodesCount)}
        icon={Calendar}
        colorClass="text-primary"
      />
      <Stat
        label="Sắp phát sóng"
        value={episodeValue(upcomingEpisodesCount)}
        icon={Clock}
        colorClass="text-primary"
      />
    </div>
  );
}

export default CalendarStats;
