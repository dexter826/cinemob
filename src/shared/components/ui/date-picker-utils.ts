export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
}

export const formatDateToString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const buildMonthGrid = (viewDate: Date): CalendarDay[] => {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysCount = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysCount; i++) {
    days.push({ day: i, isCurrentMonth: true });
  }

  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, isCurrentMonth: false });
  }

  return days;
};

export const isDateOutOfRange = (date: Date, minDate?: string, maxDate?: string): boolean => {
  if (minDate) {
    const [minYear, minMonth, minDay] = minDate.split('-').map(Number);
    if (date < new Date(minYear, minMonth - 1, minDay)) return true;
  }
  if (maxDate) {
    const [maxYear, maxMonth, maxDay] = maxDate.split('-').map(Number);
    if (date > new Date(maxYear, maxMonth - 1, maxDay)) return true;
  }
  return false;
};
