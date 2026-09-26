import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, X } from 'lucide-react';
import { Dialog } from './Dialog';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
    id?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const formatDateToString = (date: Date): string => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-').map(Number);
    return `${d}/${m}/${y}`;
};

function CustomDatePicker({
    value,
    onChange,
    placeholder = 'Chọn ngày…',
    className = '',
    disabled = false,
    minDate,
    maxDate,
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
}: CustomDatePickerProps) {
    const generatedId = useId();
    const controlId = id ?? `date-picker-${generatedId}`;
    const dialogTitleId = `${controlId}-title`;
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 639px)');
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const [y, m] = value.split('-').map(Number);
            return new Date(y, m - 1, 1);
        }
        return new Date();
    });
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);

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

        if (isOpen && !isMobile) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, isMobile]);

    useEffect(() => {
        if (!isOpen || isMobile) return undefined;
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                closePicker();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, isMobile]);

    // Update viewDate when value changes externally
    useEffect(() => {
        if (value) {
            const [y, m] = value.split('-').map(Number);
            setViewDate(new Date(y, m - 1, 1));
        }
    }, [value]);

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

    const isDateDisabled = (day: number): boolean => {
        const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        if (minDate) {
            const [my, mm, md] = minDate.split('-').map(Number);
            const min = new Date(my, mm - 1, md);
            if (date < min) return true;
        }
        if (maxDate) {
            const [xy, xm, xd] = maxDate.split('-').map(Number);
            const max = new Date(xy, xm - 1, xd);
            if (date > max) return true;
        }
        return false;
    };

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

    const daysInMonth = useMemo(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysCount = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { day: number; isCurrentMonth: boolean }[] = [];

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
    }, [viewDate]);

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
        <div
            className={`
                bg-surface border border-border-default rounded-2xl shadow-2xl p-4
                ${isMobile
                    ? 'relative w-full max-w-[320px] mx-auto'
                    : 'absolute top-full left-0 mt-1 z-50 w-72'}
            `}
            role={isMobile ? undefined : 'dialog'}
            aria-label={isMobile ? undefined : 'Chọn ngày'}
            onClick={(e) => isMobile && e.stopPropagation()}
        >
            {isMobile && (
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
                    <span id={dialogTitleId} className="text-sm font-bold text-text-main">Chọn ngày</span>
                    <button
                        type="button"
                        aria-label="Đóng bảng chọn ngày"
                        onClick={closePicker}
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                        <X size={20} className="text-text-muted" aria-hidden="true" />
                    </button>
                </div>
            )}

            {/* Header: Year Navigation */}
            <div className="flex items-center justify-between mb-2">
                <button
                    type="button"
                    onClick={handlePrevYear}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center"
                    aria-label="Năm trước"
                >
                    <ChevronLeft size={14} className="text-text-muted -mr-1.5" />
                    <ChevronLeft size={14} className="text-text-muted" />
                </button>
                <span className="text-sm font-semibold text-text-main">
                    {viewDate.getFullYear()}
                </span>
                <button
                    type="button"
                    onClick={handleNextYear}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center"
                    aria-label="Năm sau"
                >
                    <ChevronRight size={14} className="text-text-muted -mr-1.5" />
                    <ChevronRight size={14} className="text-text-muted" />
                </button>
            </div>

            {/* Header: Month Navigation */}
            <div className="flex items-center justify-between mb-3">
                <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="Tháng trước"
                >
                    <ChevronLeft size={16} className="text-text-muted" />
                </button>
                <span className="text-sm font-medium text-text-main">
                    {MONTHS_VI[viewDate.getMonth()]}
                </span>
                <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    aria-label="Tháng sau"
                >
                    <ChevronRight size={16} className="text-text-muted" />
                </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
                {DAYS_VI.map((day) => (
                    <div
                        key={day}
                        className="text-center text-xs font-bold text-text-muted/60 py-1 uppercase"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((item) => {
                    const isDisabled = item.isCurrentMonth && isDateDisabled(item.day);
                    const isTodayDate = item.isCurrentMonth && isToday(item.day);
                    const isSelectedDate = item.isCurrentMonth && isSelected(item.day);

                    return (
                        <button
                            key={`${item.isCurrentMonth ? 'cur' : 'out'}-${item.day}`}
                            type="button"
                            onClick={() => item.isCurrentMonth && !isDisabled && handleSelectDate(item.day)}
                            disabled={!item.isCurrentMonth || isDisabled}
                            aria-current={isTodayDate ? 'date' : undefined}
                            aria-pressed={isSelectedDate}
                            className={`
                                w-9 h-9 sm:w-9 sm:h-9 text-xs sm:text-sm rounded-lg transition-colors duration-150
                                flex items-center justify-center cursor-pointer
                                ${!item.isCurrentMonth ? 'text-text-muted/20 cursor-default' : ''}
                                ${item.isCurrentMonth && !isDisabled && !isSelectedDate ? 'hover:bg-primary/10 hover:text-primary text-text-main font-medium' : ''}
                                ${isDisabled ? 'text-text-muted/20 cursor-not-allowed' : ''}
                                ${isTodayDate && !isSelectedDate ? 'border border-primary/50 text-primary font-bold' : ''}
                                ${isSelectedDate ? 'bg-primary text-white font-bold shadow-lg shadow-primary/30 scale-110' : ''}
                            `}
                        >
                            {item.day}
                        </button>
                    );
                })}
            </div>

            {/* Today Button */}
            <div className="mt-4 pt-3 border-t border-border-default">
                <button
                    type="button"
                    onClick={() => {
                        const today = new Date();
                        setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                        onChange(formatDateToString(today));
                        closePicker();
                    }}
                    className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/20"
                >
                    Hôm nay
                </button>
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                id={controlId}
                ref={triggerRef}
                type="button"
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`
          w-full h-11 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 text-left
          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
          hover:border-primary/30 transition-colors duration-200
          flex items-center justify-between shadow-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-controls={`${controlId}-dialog`}
                aria-labelledby={ariaLabelledBy}
                aria-describedby={ariaDescribedBy}
                aria-invalid={ariaInvalid}
            >
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-text-muted" />
                    <span className={`text-sm font-medium ${value ? 'text-text-main' : 'text-text-muted'}`}>
                        {value ? formatDisplayDate(value) : placeholder}
                    </span>
                </div>
            </button>

            {/* Calendar UI */}
            {isOpen && (
                isMobile ? (
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
                ) : renderCalendar()
            )}
        </div>
    );
};

export default CustomDatePicker;
