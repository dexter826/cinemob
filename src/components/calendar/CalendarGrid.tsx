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
          className="h-14 md:h-28 p-3 border border-border-default/30 opacity-20 bg-black/5 dark:bg-white/5 rounded-2xl flex flex-col justify-between"
        >
          <div className="text-[10px] font-bold text-text-muted">{day}</div>
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
            h-14 md:h-28 p-3 border cursor-pointer transition-all duration-300
            hover:bg-primary/10 relative rounded-2xl flex flex-col justify-between group
            ${today ? 'bg-primary/5 border-primary/50 shadow-lg shadow-primary/10' : 'border-border-default bg-black/5 dark:bg-white/5'}
            ${selected ? 'bg-primary/20 border-primary ring-1 ring-primary shadow-premium' : ''}
            ${hasEp ? 'hover:scale-[1.02] active:scale-95' : ''}
          `}
        >
          <div className={`text-xs font-bold ${today ? 'text-primary' : 'text-text-main opacity-60'}`}>
            {day}
          </div>
          {hasEp && (
            <div className="hidden md:block mt-1 space-y-1.5 overflow-hidden">
              {episodes.slice(0, 2).map((ep, idx) => (
                <div 
                  key={idx} 
                  className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-md truncate font-bold border border-primary/20 uppercase tracking-tighter"
                  title={`${ep.seriesNameVi || ep.seriesName} - S${ep.episode.season_number}E${ep.episode.episode_number}`}
                >
                  {ep.seriesNameVi || ep.seriesName}
                </div>
              ))}
              {episodes.length > 2 && (
                <div className="text-[9px] text-text-muted font-bold opacity-60 pl-1">+{episodes.length - 2} tập khác</div>
              )}
            </div>
          )}
          {hasEp && (
            <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {episodes.slice(0, 3).map((_, idx) => (
                  <div key={idx} className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_5px_rgba(var(--color-primary),0.5)]"></div>
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
          className="h-14 md:h-28 p-3 border border-border-default/30 opacity-20 bg-black/5 dark:bg-white/5 rounded-2xl flex flex-col justify-between"
        >
          <div className="text-[10px] font-bold text-text-muted">{day}</div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="lg:col-span-2 bg-surface/50 backdrop-blur-xl border border-border-default p-8 rounded-[32px] flex flex-col h-full shadow-premium">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => navigateMonth('prev')} className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-border-default rounded-xl hover:bg-primary/10 hover:border-primary/30 text-text-muted hover:text-primary transition-all cursor-pointer">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-text-main tracking-tight uppercase">
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={goToToday} className="px-4 py-1.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-lg hover:bg-primary/20 transition-all uppercase tracking-widest cursor-pointer">
            Hôm nay
          </button>
        </div>
        <button onClick={() => navigateMonth('next')} className="w-10 h-10 flex items-center justify-center bg-black/5 dark:bg-white/5 border border-border-default rounded-xl hover:bg-primary/10 hover:border-primary/30 text-text-muted hover:text-primary transition-all cursor-pointer">
          <ChevronRight size={20} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-3">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-text-muted uppercase tracking-[0.2em] py-3 opacity-60">
            {day}
          </div>
        ))}
      </div>

      {loadingEpisodes ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, idx) => (
            <div key={idx} className="h-14 md:h-28 p-2 border border-border-default/50 rounded-2xl animate-pulse bg-black/5 dark:bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {renderCalendarDays()}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;
