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

    const prevMonthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    const daysInPrevMonth = getDaysInMonth(prevMonthDate);

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      days.push(
        <div 
          key={`prev-${day}`} 
          className="h-12 md:h-24 p-2 border border-black/5 dark:border-white/5 opacity-30 bg-black/5 dark:bg-white/5 rounded-lg flex flex-col justify-between"
        >
          <div className="text-xs md:text-sm text-text-secondary">{day}</div>
        </div>
      );
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
            h-12 md:h-24 p-2 border border-black/5 dark:border-white/5 cursor-pointer transition-all duration-300
            hover:bg-primary/10 relative rounded-lg flex flex-col justify-between
            ${today ? 'bg-primary/5 ring-2 ring-primary ring-inset' : ''}
            ${selected ? 'bg-primary/20 ring-2 ring-primary ring-inset' : ''}
            ${hasEp ? 'font-semibold' : ''}
          `}
        >
          <div className={`text-xs md:text-sm ${today ? 'text-primary font-bold' : ''}`}>
            {day}
          </div>
          {hasEp && (
            <div className="hidden md:block mt-1 space-y-1 overflow-hidden max-h-16">
              {episodes.slice(0, 2).map((ep, idx) => (
                <div 
                  key={idx} 
                  className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-md truncate font-medium"
                  title={`${ep.seriesNameVi || ep.seriesName} - S${ep.episode.season_number}E${ep.episode.episode_number}`}
                >
                  {ep.seriesNameVi || ep.seriesName}
                </div>
              ))}
              {episodes.length > 2 && (
                <div className="text-[10px] text-text-secondary font-normal pl-1">+{episodes.length - 2} khác</div>
              )}
            </div>
          )}
          {hasEp && (
            <div className="md:hidden absolute bottom-1.5 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {episodes.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    const totalCells = days.length;
    const nextMonthDaysNeeded = 42 - totalCells;
    for (let day = 1; day <= nextMonthDaysNeeded; day++) {
      days.push(
        <div 
          key={`next-${day}`} 
          className="h-12 md:h-24 p-2 border border-black/5 dark:border-white/5 opacity-30 bg-black/5 dark:bg-white/5 rounded-lg flex flex-col justify-between"
        >
          <div className="text-xs md:text-sm text-text-secondary">{day}</div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="lg:col-span-2 bg-surface border border-black/5 dark:border-white/5 p-6 rounded-2xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigateMonth('prev')} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-text-main">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={goToToday} className="px-3 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-colors">
            Hôm nay
          </button>
        </div>
        <button onClick={() => navigateMonth('next')} className="p-2 hover:bg-primary/10 rounded-xl transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-xs font-bold text-text-secondary py-2">
            {day}
          </div>
        ))}
      </div>

      {loadingEpisodes ? (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 42 }).map((_, idx) => (
            <div key={idx} className="h-12 md:h-24 p-2 border border-black/5 dark:border-white/5 rounded-lg animate-pulse bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
