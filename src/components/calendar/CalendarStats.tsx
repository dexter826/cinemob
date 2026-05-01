import React from 'react';
import { Tv, Bell, Calendar, Clock } from 'lucide-react';
import { UpcomingEpisode } from '../../types';

interface CalendarStatsProps {
  tvSeriesCount: number;
  upcomingEpisodesCount: number;
  todayEpisodesCount: number;
  thisWeekEpisodesCount: number;
}

const CalendarStats: React.FC<CalendarStatsProps> = ({
  tvSeriesCount,
  upcomingEpisodesCount,
  todayEpisodesCount,
  thisWeekEpisodesCount
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      <div className="bg-surface border border-border-default rounded-2xl p-4 sm:p-5 shadow-premium group transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-colors shadow-sm shrink-0">
            <Tv size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight leading-none truncate">{tvSeriesCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mt-1.5 sm:mt-2 opacity-60 truncate">Series</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-4 sm:p-5 md:p-6 shadow-premium group transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-colors shadow-sm shrink-0">
            <Bell size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight leading-none truncate">{upcomingEpisodesCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mt-1.5 sm:mt-2 opacity-60 truncate">Sắp chiếu</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-4 sm:p-5 md:p-6 shadow-premium group transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-colors shadow-sm shrink-0">
            <Calendar size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight leading-none truncate">{todayEpisodesCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mt-1.5 sm:mt-2 opacity-60 truncate">Hôm nay</p>
          </div>
        </div>
      </div>
      <div className="bg-surface border border-border-default rounded-2xl p-4 sm:p-5 md:p-6 shadow-premium group transition-all duration-300">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 transition-colors shadow-sm shrink-0">
            <Clock size={24} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-2xl sm:text-3xl font-bold text-text-main tracking-tight leading-none truncate">{thisWeekEpisodesCount}</p>
            <p className="text-[10px] sm:text-xs font-bold text-text-muted uppercase tracking-widest mt-1.5 sm:mt-2 opacity-60 truncate">Tuần này</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;
