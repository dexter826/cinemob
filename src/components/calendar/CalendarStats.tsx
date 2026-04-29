import React from 'react';
import { Tv, Bell, Calendar, Clock } from 'lucide-react';
import { UpcomingEpisode } from '../../types';

interface CalendarStatsProps {
  tvSeriesCount: number;
  upcomingEpisodesCount: number;
  todayEpisodesCount: number;
  thisWeekEpisodesCount: number;
}

/** Hiển thị các chỉ số thống kê của trang lịch phát sóng. */
const CalendarStats: React.FC<CalendarStatsProps> = ({
  tvSeriesCount,
  upcomingEpisodesCount,
  todayEpisodesCount,
  thisWeekEpisodesCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Tv size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-main">{tvSeriesCount}</p>
            <p className="text-sm text-text-secondary">Series trong bộ sưu tập</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-main">{upcomingEpisodesCount}</p>
            <p className="text-sm text-text-secondary">Tập sắp chiếu</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Calendar size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-main">{todayEpisodesCount}</p>
            <p className="text-sm text-text-secondary">Hôm nay</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Clock size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-text-main">{thisWeekEpisodesCount}</p>
            <p className="text-sm text-text-secondary">Tuần này</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;
