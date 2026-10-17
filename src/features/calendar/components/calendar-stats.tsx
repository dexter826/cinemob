import { Tv, Bell, Calendar, Clock } from 'lucide-react';
import { Stat } from '@/shared/components/ui';

interface CalendarStatsProps {
  tvSeriesCount: number;
  upcomingEpisodesCount: number;
  monthEpisodesCount: number;
  airedEpisodesCount: number;
}

/** Chỉ số trang Lịch — Stat kit: số trần không hộp, vạch phân cách kiểu editorial. */
function CalendarStats({
  tvSeriesCount,
  upcomingEpisodesCount,
  monthEpisodesCount,
  airedEpisodesCount,
}: CalendarStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 sm:mb-8">
      <Stat label="Series" value={tvSeriesCount} icon={Tv} colorClass="text-primary" />
      <Stat label="Tập trong tháng" value={monthEpisodesCount} icon={Bell} colorClass="text-primary" />
      <Stat label="Đã phát sóng" value={airedEpisodesCount} icon={Calendar} colorClass="text-primary" />
      <Stat label="Sắp phát sóng" value={upcomingEpisodesCount} icon={Clock} colorClass="text-primary" />
    </div>
  );
}

export default CalendarStats;
