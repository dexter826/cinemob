import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Dialog } from './dialog';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import { formatDateDMY, monthLabel } from '@/shared/utils/date-format';
import { buildMonthGrid, formatDateToString, isDateOutOfRange } from './date-picker-utils';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  id?: string;
  popupMode?: 'popover' | 'dialog';
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

function DatePicker({
  value,
  onChange,
  placeholder = 'Chọn ngày…',
  className = '',
  disabled = false,
  minDate,
  maxDate,
  id,
  popupMode = 'popover',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: DatePickerProps) {
  const generatedId = useId();
  const controlId = id ?? `date-picker-${generatedId}`;
  const triggerLabelledBy = ariaLabelledBy ? `${ariaLabelledBy} ${controlId}` : undefined;
  const dialogTitleId = `${controlId}-title`;
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const useDialogPresentation = isMobile || popupMode === 'dialog';
  const reducedMotion = useReducedMotion() ?? false;
  const popoverMotion = getPanelMotion(reducedMotion);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      return new Date(y, m - 1, 1);
    }
    return new Date();
  });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selectedDate = useMemo(() => {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen && !useDialogPresentation) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, useDialogPresentation]);

  useEffect(() => {
    if (!isOpen || useDialogPresentation) return undefined;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closePicker();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, useDialogPresentation]);

  useEffect(() => {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setViewDate(new Date(y, m - 1, 1));
    }
  }, [value]);

  // Popover desktop là dialog: nhận focus khi mở để bàn phím thao tác ngay.
  useEffect(() => {
    if (isOpen && !useDialogPresentation) popoverRef.current?.focus();
  }, [isOpen, useDialogPresentation]);

  const closePicker = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  const handleToggle = () => {
    if (!disabled) {
      if (isOpen) closePicker();
      else setIsOpen(true);
    }
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
  };

  const handleSelectDate = (day: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = formatDateToString(newDate);
    onChange(dateStr);
    closePicker();
  };

  const handleDayKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step =
      event.key === 'ArrowLeft'
        ? -1
        : event.key === 'ArrowRight'
          ? 1
          : event.key === 'ArrowUp'
            ? -7
            : event.key === 'ArrowDown'
              ? 7
              : 0;
    let nextIndex: number | null = step ? index + step : null;
    if (event.key === 'Home') nextIndex = index - (index % 7);
    if (event.key === 'End') nextIndex = index - (index % 7) + 6;
    if (nextIndex === null) return;
    event.preventDefault();
    const target = event.currentTarget.parentElement?.children[nextIndex] as
      HTMLButtonElement | undefined;
    if (target && !target.disabled) target.focus();
  };

  // Popover desktop là dialog: giữ Tab trong khung thay vì rơi ra trang phía sau.
  const handlePopoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !popoverRef.current) return;
    const focusables = Array.from(
      popoverRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === popoverRef.current)) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
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

  const daysInMonth = useMemo(() => buildMonthGrid(viewDate), [viewDate]);

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

  const renderCalendar = () => (
    <motion.div
      ref={popoverRef}
      id={useDialogPresentation ? undefined : `${controlId}-dialog`}
      tabIndex={useDialogPresentation ? undefined : -1}
      className={`
                bg-surface-elevated border border-border rounded-card p-4
                ${
                  useDialogPresentation
                    ? 'relative w-full max-w-[320px] mx-auto'
                    : 'absolute top-full right-0 mt-1 z-50 w-72 max-w-[calc(100vw-2rem)]'
                }
            `}
      role={useDialogPresentation ? undefined : 'dialog'}
      aria-label={useDialogPresentation ? undefined : 'Chọn ngày'}
      onKeyDown={useDialogPresentation ? undefined : handlePopoverKeyDown}
      onClick={(e) => useDialogPresentation && e.stopPropagation()}
      initial={useDialogPresentation ? undefined : popoverMotion.initial}
      animate={useDialogPresentation ? undefined : popoverMotion.animate}
      exit={useDialogPresentation ? undefined : popoverMotion.exit}
      transition={popoverMotion.transition}
    >
      {useDialogPresentation && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
          <span id={dialogTitleId} className="text-title-md text-text-primary">
            Chọn ngày
          </span>
          <button
            type="button"
            aria-label="Đóng bảng chọn ngày"
            onClick={closePicker}
            className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Điều hướng năm */}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={handlePrevYear}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors flex items-center"
          aria-label="Năm trước"
        >
          <ChevronLeft
            size={14}
            strokeWidth={1.5}
            className="text-text-secondary -mr-1.5"
            aria-hidden="true"
          />
          <ChevronLeft
            size={14}
            strokeWidth={1.5}
            className="text-text-secondary"
            aria-hidden="true"
          />
        </button>
        <span className="text-body font-semibold text-text-primary">{viewDate.getFullYear()}</span>
        <button
          type="button"
          onClick={handleNextYear}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors flex items-center"
          aria-label="Năm sau"
        >
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            className="text-text-secondary -mr-1.5"
            aria-hidden="true"
          />
          <ChevronRight
            size={14}
            strokeWidth={1.5}
            className="text-text-secondary"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Điều hướng tháng */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors"
          aria-label="Tháng trước"
        >
          <ChevronLeft
            size={16}
            strokeWidth={1.5}
            className="text-text-secondary"
            aria-hidden="true"
          />
        </button>
        <span className="text-body font-medium text-text-primary">
          {monthLabel(viewDate.getMonth())}
        </span>
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-control transition-colors"
          aria-label="Tháng sau"
        >
          <ChevronRight
            size={16}
            strokeWidth={1.5}
            className="text-text-secondary"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* Nhãn thứ */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_VI.map((day) => (
          <div key={day} className="text-center text-label-caps text-text-muted py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Lưới ngày */}
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
              onKeyDown={(event) => handleDayKeyDown(event, index)}
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

      {/* Nút hôm nay */}
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
    </motion.div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Nút trigger */}
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

      {/* Khung lịch */}
      {useDialogPresentation ? (
        <Dialog
          open={isOpen}
          onClose={closePicker}
          titleId={dialogTitleId}
          presentation="dialog"
          size="sm"
          className="bg-transparent shadow-none overflow-visible"
        >
          <div id={`${controlId}-dialog`}>{renderCalendar()}</div>
        </Dialog>
      ) : (
        <AnimatePresence>{isOpen && renderCalendar()}</AnimatePresence>
      )}
    </div>
  );
}

export default DatePicker;
