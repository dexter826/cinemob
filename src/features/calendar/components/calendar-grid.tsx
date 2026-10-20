import Skeleton from '@/shared/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { monthLabel } from '@/shared/utils/date-format';
import { UpcomingEpisode } from '@/types';

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

function CalendarGrid({
  currentDate,
  navigateMonth,
  goToToday,
  loadingEpisodes,
  getEpisodesForDate,
  setSelectedDate,
  selectedDate,
}: CalendarGridProps) {
  const getDaysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const todayDate = new Date();

  const isToday = (date: Date) =>
    date.getDate() === todayDate.getDate() &&
    date.getMonth() === todayDate.getMonth() &&
    date.getFullYear() === todayDate.getFullYear();

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
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
          className="h-14 sm:h-20 md:h-28 p-1.5 sm:p-3 border border-border-default dark:border-white/5 opacity-20 rounded-control sm:rounded-card flex flex-col justify-between"
        >
          <div className="text-body-sm font-bold text-text-secondary">{day}</div>
        </div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const episodes = getEpisodesForDate(date);
      const hasEp = episodes.length > 0;
      const today = isToday(date);
      const selected = isSelected(date);

      days.push(
        <button
          key={day}
          onClick={() => setSelectedDate(date)}
          type="button"
          aria-current={today ? 'date' : undefined}
          aria-pressed={selected}
          className={`
            h-14 sm:h-20 md:h-28 p-1.5 sm:p-3 border cursor-pointer transition-colors
            hover:bg-primary/10 relative rounded-control sm:rounded-card flex flex-col justify-between group
            ${today ? 'border-primary' : 'border-border-default dark:border-white/5'}
            ${selected ? 'bg-primary/20 border-primary ring-1 ring-primary' : ''}
            ${hasEp ? 'cursor-pointer hover:bg-primary/5' : ''}
          `}
        >
          <div
            className={`text-body-sm font-bold ${today ? 'text-primary' : 'text-text-primary opacity-60'}`}
          >
            {day}
          </div>
          {hasEp && (
            <div className="hidden sm:block mt-1 space-y-1 sm:space-y-1.5 overflow-hidden">
              {episodes.slice(0, 2).map((ep) => (
                <div
                  key={`${ep.seriesId}-${ep.episode.id}`}
                  className="text-body-sm text-primary truncate font-bold"
                  title={`${ep.seriesNameVi || ep.seriesName} - S${ep.episode.season_number}E${ep.episode.episode_number}`}
                >
                  {ep.seriesNameVi || ep.seriesName}
                </div>
              ))}
              {episodes.length > 2 && (
                <div className="text-body-sm text-text-secondary font-bold opacity-60 pl-1">
                  +{episodes.length - 2}
                </div>
              )}
            </div>
          )}
          {hasEp && (
            <div className="sm:hidden absolute bottom-1.5 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-0.5">
                {episodes.slice(0, 3).map((ep, dotIndex) => (
                  <div
                    key={`${ep.seriesId}-${ep.episode.id}-dot-${dotIndex}`}
                    className="w-1.5 h-1.5 rounded-full bg-primary"
                  ></div>
                ))}
              </div>
            </div>
          )}
        </button>,
      );
    }

    const totalCells = days.length;
    // Chỉ điền đủ số ô của tháng sau để hoàn tất hàng cuối — không nhét cứng 6 tuần.
    const remainder = totalCells % 7;
    const nextMonthDaysNeeded = remainder === 0 ? 0 : 7 - remainder;
    for (let day = 1; day <= nextMonthDaysNeeded; day++) {
      days.push(
        <div
          key={`next-${day}`}
          className="h-14 sm:h-20 md:h-28 p-1.5 sm:p-3 border border-border-default/30 dark:border-white/5 opacity-20 rounded-control sm:rounded-card flex flex-col justify-between"
        >
          <div className="text-body-sm font-bold text-text-secondary">{day}</div>
        </div>,
      );
    }

    return days;
  };

  return (
    <div className="lg:col-span-2 bg-surface border border-border p-4 sm:p-6 rounded-dialog flex flex-col">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <button
          type="button"
          onClick={() => navigateMonth('prev')}
          aria-label="Tháng trước"
          className="w-10 h-10 flex items-center justify-center border border-border rounded-control hover:bg-primary/10 hover:border-primary/30 text-text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center">
          <h2 className="text-title-md font-bold text-text-primary tracking-tight whitespace-nowrap">
            {monthLabel(currentDate.getMonth())} {currentDate.getFullYear()}
          </h2>
          <button
            type="button"
            onClick={goToToday}
            aria-label="Về hôm nay"
            className="text-body-sm font-bold text-primary hover:underline underline-offset-2 transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
        </div>
        <button
          type="button"
          onClick={() => navigateMonth('next')}
          aria-label="Tháng sau"
          className="w-10 h-10 flex items-center justify-center border border-border rounded-control hover:bg-primary/10 hover:border-primary/30 text-text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-3">
        {DAYS_OF_WEEK.map((day) => (
          <div
            key={day}
            className="text-center text-body-sm font-semibold text-text-secondary py-2 sm:py-3"
          >
            {day}
          </div>
        ))}
      </div>

      {loadingEpisodes ? (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({
            length:
              Math.ceil((getDaysInMonth(currentDate) + getFirstDayOfMonth(currentDate)) / 7) * 7,
          }).map((_, idx) => (
            <Skeleton
              key={idx}
              className="h-14 sm:h-20 md:h-28 p-1 border border-border-default/50 rounded-control sm:rounded-card "
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">{renderCalendarDays()}</div>
      )}
    </div>
  );
}

export default CalendarGrid;
