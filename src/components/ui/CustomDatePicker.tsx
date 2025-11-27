import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minDate?: string;
    maxDate?: string;
}

const DAYS_VI = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const MONTHS_VI = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    value,
    onChange,
    placeholder = 'Chọn ngày...',
    className = '',
    disabled = false,
    minDate,
    maxDate,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => {
        if (value) {
            const [y, m] = value.split('-').map(Number);
            return new Date(y, m - 1, 1);
        }
        return new Date();
    });
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedDate = value ? (() => {
        const [y, m, d] = value.split('-').map(Number);
        return new Date(y, m - 1, d);
    })() : null;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Update viewDate when value changes externally
    useEffect(() => {
        if (value) {
            const [y, m] = value.split('-').map(Number);
            setViewDate(new Date(y, m - 1, 1));
        }
    }, [value]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
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
        setIsOpen(false);
    };

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

    // Generate calendar days
    const getDaysInMonth = () => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days: { day: number; isCurrentMonth: boolean }[] = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }

        // Next month days
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false });
        }

        return days;
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`
          w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-left
          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
          hover:border-primary/30 transition-all duration-200
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-text-muted" />
                    <span className={`text-sm ${value ? 'text-text-main' : 'text-text-muted'}`}>
                        {value ? formatDisplayDate(value) : placeholder}
                    </span>
                </div>
            </button>

            {/* Calendar Dropdown */}
            {isOpen && (
                <div
                    className="
            absolute top-full left-0 mt-1 bg-surface border border-black/10 dark:border-white/10
            rounded-xl shadow-lg z-50 p-3 w-72
          "
                    role="dialog"
                    aria-label="Chọn ngày"
                >
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
                                className="text-center text-xs font-medium text-text-muted py-1"
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth().map((item, index) => {
                            const isDisabled = item.isCurrentMonth && isDateDisabled(item.day);
                            const isTodayDate = item.isCurrentMonth && isToday(item.day);
                            const isSelectedDate = item.isCurrentMonth && isSelected(item.day);

                            return (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => item.isCurrentMonth && !isDisabled && handleSelectDate(item.day)}
                                    disabled={!item.isCurrentMonth || isDisabled}
                                    className={`
                    w-8 h-8 text-sm rounded-lg transition-all duration-150
                    flex items-center justify-center
                    ${!item.isCurrentMonth ? 'text-text-muted/30 cursor-default' : ''}
                    ${item.isCurrentMonth && !isDisabled && !isSelectedDate ? 'hover:bg-black/5 dark:hover:bg-white/5 text-text-main' : ''}
                    ${isDisabled ? 'text-text-muted/30 cursor-not-allowed' : ''}
                    ${isTodayDate && !isSelectedDate ? 'border border-primary/50 text-primary' : ''}
                    ${isSelectedDate ? 'bg-primary text-white font-medium' : ''}
                  `}
                                >
                                    {item.day}
                                </button>
                            );
                        })}
                    </div>

                    {/* Today Button */}
                    <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                                onChange(formatDateToString(today));
                                setIsOpen(false);
                            }}
                            className="w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
                        >
                            Hôm nay
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
