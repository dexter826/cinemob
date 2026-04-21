import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { UpcomingEpisode } from '../../types';

interface CalendarGridProps {
  currentDate: Date;
  navigateMonth: (direction: 'prev' | 'next') => void;
  goToToday: () => void;
  loadingEpisodes: boolean;
  getEpisodesForDate: (date: Date) => UpcomingEpisode[];
  setSelectedDate: (date: Date) => void;
  selectedDate: Date | null;
}

const DAYS_OF_WEEK = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

/** Hiển thị lưới lịch tháng và xử lý điều hướng thời gian. */
const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  navigateMonth,
  goToToday,
  loadingEpisodes,
  getEpisodesForDate,
  setSelectedDate,
  selectedDate
}) => {
  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-12 md:h-24"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const episodes = getEpisodesForDate(date);
      const hasEp = episodes.length > 0;
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(date)}
          className={`
            h-12 md:h-24 p-1 border border-black/5 dark:border-white/5 cursor-pointer transition-all
            hover:bg-primary/10 relative
            ${today ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
            ${selected ? 'bg-primary/20' : ''}
            ${hasEp ? 'font-semibold' : ''}
          `}
        >
          <div className={`text-xs md:text-sm ${today ? 'text-primary font-bold' : ''}`}>
            {day}
          </div>
          {hasEp && (
            <div className="hidden md:block mt-1 space-y-0.5 overflow-hidden max-h-16">
              {episodes.slice(0, 2).map((ep, idx) => (
                <div 
                  key={idx} 
                  className="text-[10px] bg-primary/20 text-primary px-1 py-0.5 rounded truncate"
                  title={`${ep.seriesNameVi || ep.seriesName} - S${ep.episode.season_number}E${ep.episode.episode_number}`}
                >
                  {ep.seriesNameVi || ep.seriesName}
                </div>
              ))}
              {episodes.length > 2 && (
                <div className="text-[10px] text-text-secondary">+{episodes.length - 2} khác</div>
              )}
            </div>
          )}
          {hasEp && (
            <div className="md:hidden absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5">
                {episodes.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="lg:col-span-2 bg-surface border border-black/5 dark:border-white/5 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-text-main">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={goToToday} className="px-2 py-1 text-xs bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors">
            Hôm nay
          </button>
        </div>
        <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-primary/10 rounded-lg transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs font-medium text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {loadingEpisodes ? (
        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} className="h-12 md:h-24 p-1 border border-black/5 dark:border-white/5 animate-pulse bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7">
          {renderCalendarDays()}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
