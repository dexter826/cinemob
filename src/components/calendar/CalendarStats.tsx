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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
      <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-premium group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
            <Tv size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-text-main tracking-tight leading-none">{tvSeriesCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60">Series phim</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-premium group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
            <Bell size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-text-main tracking-tight leading-none">{upcomingEpisodesCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60">Sắp chiếu</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-premium group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
            <Calendar size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-text-main tracking-tight leading-none">{todayEpisodesCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60">Hôm nay</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-6 shadow-premium group hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm">
            <Clock size={24} className="text-primary" />
          </div>
          <div>
            <p className="text-3xl font-bold text-text-main tracking-tight leading-none">{thisWeekEpisodesCount}</p>
            <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-2 opacity-60">Tuần này</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;
