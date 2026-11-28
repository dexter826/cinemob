import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar } from 'lucide-react';
import FloatingPanel from './floating-panel';
import { formatDateDMY, monthLabel } from '@/shared/utils/date-format';
import {
  buildMonthGrid,
  formatDateToString,
  getYearPageStart,
  isDateOutOfRange,
  isMonthOutOfRange,
  isYearOutOfRange,
} from './date-picker-utils';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const MONTH_INDEXES = Array.from({ length: 12 }, (_, index) => index);

function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày…',
  className = '',
  disabled = false,
  minDate,
  maxDate,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const generatedId = useId();
  const controlId = id ?? `date-picker-${generatedId}`;
  const triggerLabelledBy = ariaLabelledBy ? `${ariaLabelledBy} ${controlId}` : undefined;
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
  }, [value]);

  useEffect(() => {
    if (isOpen) panelRef.current?.focus();
  }, [isOpen]);

  const closePicker = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (!disabled) {
      if (isOpen) closePicker();
      else {
        setViewMode('day');
        setIsOpen(true);
      }
    }
  };

  const handlePrev = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    if (viewMode === 'day') setViewDate(new Date(year, month - 1, 1));
    else if (viewMode === 'month') setViewDate(new Date(year - 1, month, 1));
    else setViewDate(new Date(getYearPageStart(year) - 12, month, 1));
  };

  const handleNext = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    if (viewMode === 'day') setViewDate(new Date(year, month + 1, 1));
    else if (viewMode === 'month') setViewDate(new Date(year + 1, month, 1));
    else setViewDate(new Date(getYearPageStart(year) + 12, month, 1));
  };

  const handleSelectMonth = (month: number) => {
    setViewDate(new Date(viewDate.getFullYear(), month, 1));
    setViewMode('day');
  };

  const handleSelectYear = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setViewMode('month');
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = formatDateToString(newDate);
    onChange(dateStr);
    closePicker();
  };

  const handleGridKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number,
    columns: number,
  ) => {
    const step =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : event.key === 'ArrowUp'
            ? -columns
            : event.key === 'ArrowDown'
              ? columns
              : 0;
    let nextIndex: number | null = step ? index + step : null;
    if (event.key === 'Home') nextIndex = index - (index % columns);
    if (event.key === 'End') nextIndex = index - (index % columns) + columns - 1;
    if (nextIndex === null) return;
    event.preventDefault();
    const target = event.currentTarget.parentElement?.children[nextIndex] as
      HTMLButtonElement | undefined;
    if (target && !target.disabled) target.focus();
  };

  const isDateDisabled = (day: number): boolean => {
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return isDateOutOfRange(date, minDate, maxDate);
  };

  const todayDisabled = useMemo(() => {
    const now = new Date();
    return isDateOutOfRange(
      new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      minDate,
      maxDate,
    );
  }, [minDate, maxDate]);

  const isToday = (day: number): boolean => {
    const today = new Date();
    return (
      viewDate.getFullYear() === today.getFullYear() &&
      viewDate.getMonth() === today.getMonth() &&
      day === today.getDate()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() &&
      viewDate.getMonth() === selectedDate.getMonth() &&
      day === selectedDate.getDate()
    );
  };

  const isCurrentMonthCell = (month: number): boolean => {
    const now = new Date();
    return viewDate.getFullYear() === now.getFullYear() && month === now.getMonth();
  };

  const isCurrentYearCell = (year: number): boolean => year === new Date().getFullYear();

  const isSelectedMonth = (month: number): boolean => {
    if (!selectedDate) return false;
    return (
      viewDate.getFullYear() === selectedDate.getFullYear() && month === selectedDate.getMonth()
    );
  };

  const isSelectedYear = (year: number): boolean => {
    if (!selectedDate) return false;
    return year === selectedDate.getFullYear();
  };

  const daysInMonth = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

  const yearPageStart = getYearPageStart(viewDate.getFullYear());
  const yearPage = useMemo(
    () => Array.from({ length: 12 }, (_, offset) => yearPageStart + offset),
    [yearPageStart],
  );

  const navPrevLabel =
    viewMode === 'day' ? 'Tháng trước' : viewMode === 'month' ? 'Năm trước' : 'Về 12 năm trước';
  const navNextLabel =
    viewMode === 'day' ? 'Tháng sau' : viewMode === 'month' ? 'Năm sau' : 'Về 12 năm sau';

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        id={controlId}
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          w-full h-11 border border-border-default rounded-card px-4 text-left
          focus-ring
          hover:border-primary/30 transition-colors duration-150
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={`${controlId}-dialog`}
        aria-label={ariaLabel}
        aria-labelledby={triggerLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Calendar
            size={16}
            strokeWidth={1.5}
            className="text-text-secondary shrink-0"
            aria-hidden="true"
          />
          <span
            className={`text-body font-medium truncate ${value ? 'text-text-primary' : 'text-text-secondary'}`}
          >
            {value ? formatDateDMY(value) : placeholder}
          </span>
        </div>
      </button>

      <FloatingPanel
        open={isOpen}
        onClose={closePicker}
        anchorRef={triggerRef}
        panelRef={panelRef}
        id={`${controlId}-dialog`}
        ariaLabel="Chọn ngày"
        align="end"
        className="w-72 max-w-[calc(100vw-1rem)] rounded-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors"
            aria-label={navPrevLabel}
          >
            <ChevronLeft
              size={16}
              strokeWidth={1.5}
              className="text-text-secondary"
              aria-hidden="true"
            />
          </button>
          {viewMode === 'year' ? (
            <span className="text-body font-semibold text-text-primary">
              {`${yearPageStart} – ${yearPageStart + 11}`}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode(viewMode === 'day' ? 'month' : 'year')}
              aria-label={viewMode === 'day' ? 'Chọn tháng' : 'Chọn năm'}
              className="px-3 py-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="text-body font-semibold text-text-primary">
                {viewMode === 'day'
                  ? `${monthLabel(viewDate.getMonth())} ${viewDate.getFullYear()}`
                  : viewDate.getFullYear()}
              </span>
              <ChevronDown
                size={14}
                strokeWidth={1.5}
                className="text-text-secondary"
                aria-hidden="true"
              />
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors"
            aria-label={navNextLabel}
          >
            <ChevronRight
              size={16}
              strokeWidth={1.5}
              className="text-text-secondary"
              aria-hidden="true"
            />
          </button>
        </div>

        {viewMode === 'day' && (
          <>
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS_VI.map((day) => (
                <div key={day} className="text-center text-label-caps text-text-muted py-1">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {daysInMonth.map((item, index) => {
                const isDisabled = item.isCurrentMonth && isDateDisabled(item.day);
                const isTodayDate = item.isCurrentMonth && isToday(item.day);
                const isSelectedDate = item.isCurrentMonth && isSelected(item.day);

                return (
                  <button
                    key={`${item.isCurrentMonth ? 'cur' : 'out'}-${item.day}`}
                    type="button"
                    onClick={() => item.isCurrentMonth && !isDisabled && handleSelectDate(item.day)}
                    onKeyDown={(event) => handleGridKeyDown(event, index, 7)}
                    disabled={!item.isCurrentMonth || isDisabled}
                    aria-current={isTodayDate ? 'date' : undefined}
                    aria-pressed={isSelectedDate}
                    aria-label={`${item.day}/${viewDate.getMonth() + 1}/${viewDate.getFullYear()}`}
                    className={`
                      aspect-square w-full text-body-sm rounded-control transition-colors duration-150
                      flex items-center justify-center cursor-pointer
                      ${!item.isCurrentMonth ? 'text-text-secondary/20 cursor-default' : ''}
                      ${item.isCurrentMonth && !isDisabled && !isSelectedDate ? 'hover:bg-primary/10 hover:text-primary text-text-primary font-medium' : ''}
                      ${isDisabled ? 'text-text-secondary/20 cursor-not-allowed' : ''}
                      ${isTodayDate && !isSelectedDate ? 'border border-primary/50 text-primary font-bold' : ''}
                      ${isSelectedDate ? 'bg-primary text-on-primary font-bold ' : ''}
                    `}
                  >
                    {item.day}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {viewMode === 'month' && (
          <div className="grid grid-cols-3 gap-1">
            {MONTH_INDEXES.map((month, index) => {
              const isDisabled = isMonthOutOfRange(viewDate.getFullYear(), month, minDate, maxDate);
              const isSelectedMonthDate = isSelectedMonth(month);
              const isCurrentMonthDate = isCurrentMonthCell(month);

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => !isDisabled && handleSelectMonth(month)}
                  onKeyDown={(event) => handleGridKeyDown(event, index, 3)}
                  disabled={isDisabled}
                  aria-pressed={isSelectedMonthDate}
                  aria-label={`${monthLabel(month)} ${viewDate.getFullYear()}`}
                  className={`
                    h-12 w-full text-body-sm rounded-control transition-colors duration-150
                    flex items-center justify-center cursor-pointer
                    ${isDisabled ? 'text-text-secondary/20 cursor-not-allowed' : ''}
                    ${!isDisabled && !isSelectedMonthDate && !isCurrentMonthDate ? 'hover:bg-primary/10 hover:text-primary text-text-primary font-medium' : ''}
                    ${isCurrentMonthDate && !isSelectedMonthDate ? 'border border-primary/50 text-primary font-bold' : ''}
                    ${isSelectedMonthDate ? 'bg-primary text-on-primary font-bold ' : ''}
                  `}
                >
                  {monthLabel(month)}
                </button>
              );
            })}
          </div>
        )}

        {viewMode === 'year' && (
          <div className="grid grid-cols-3 gap-1">
            {yearPage.map((year, index) => {
              const isDisabled = isYearOutOfRange(year, minDate, maxDate);
              const isSelectedYearDate = isSelectedYear(year);
              const isCurrentYearDate = isCurrentYearCell(year);

              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => !isDisabled && handleSelectYear(year)}
                  onKeyDown={(event) => handleGridKeyDown(event, index, 3)}
                  disabled={isDisabled}
                  aria-pressed={isSelectedYearDate}
                  className={`
                    h-12 w-full text-body-sm rounded-control transition-colors duration-150
                    flex items-center justify-center cursor-pointer
                    ${isDisabled ? 'text-text-secondary/20 cursor-not-allowed' : ''}
                    ${!isDisabled && !isSelectedYearDate && !isCurrentYearDate ? 'hover:bg-primary/10 hover:text-primary text-text-primary font-medium' : ''}
                    ${isCurrentYearDate && !isSelectedYearDate ? 'border border-primary/50 text-primary font-bold' : ''}
                    ${isSelectedYearDate ? 'bg-primary text-on-primary font-bold ' : ''}
                  `}
                >
                  {year}
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-border-default">
          <button
            type="button"
            disabled={todayDisabled}
            onClick={() => {
              const today = new Date();
              setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
              onChange(formatDateToString(today));
              closePicker();
            }}
            className="w-full py-2.5 text-body-sm font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hôm nay
          </button>
        </div>
      </FloatingPanel>
    </div>
  );
}

export default DatePicker;
