import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';

interface CustomTimePickerProps {
    value: string; // HH:mm format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minuteStep?: number;
}

const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
    value,
    onChange,
    placeholder = 'Chọn giờ...',
    className = '',
    disabled = false,
    minuteStep = 1,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0];

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

    // Scroll to selected time when opening
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => {
                if (hourListRef.current) {
                    const selectedHour = hourListRef.current.querySelector('[data-selected="true"]');
                    if (selectedHour) {
                        selectedHour.scrollIntoView({ block: 'center', behavior: 'auto' });
                    }
                }
                if (minuteListRef.current) {
                    const selectedMinute = minuteListRef.current.querySelector('[data-selected="true"]');
                    if (selectedMinute) {
                        selectedMinute.scrollIntoView({ block: 'center', behavior: 'auto' });
                    }
                }
            }, 0);
        }
    }, [isOpen]);

    const handleToggle = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
        }
    };

    const handleHourChange = (newHour: number) => {
        const h = String(newHour).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');
        onChange(`${h}:${m}`);
    };

    const handleMinuteChange = (newMinute: number) => {
        const h = String(hours).padStart(2, '0');
        const m = String(newMinute).padStart(2, '0');
        onChange(`${h}:${m}`);
    };

    const incrementHour = () => {
        const newHour = (hours + 1) % 24;
        handleHourChange(newHour);
    };

    const decrementHour = () => {
        const newHour = (hours - 1 + 24) % 24;
        handleHourChange(newHour);
    };

    const incrementMinute = () => {
        const newMinute = (minutes + minuteStep) % 60;
        handleMinuteChange(newMinute);
    };

    const decrementMinute = () => {
        const newMinute = (minutes - minuteStep + 60) % 60;
        handleMinuteChange(newMinute);
    };

    const formatDisplayTime = (timeStr: string): string => {
        if (!timeStr) return '';
        return timeStr;
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        } else if (event.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const setCurrentTime = () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        onChange(`${h}:${m}`);
        setIsOpen(false);
    };

    // Generate hour and minute options
    const hourOptions = Array.from({ length: 24 }, (_, i) => i);
    const minuteOptions = Array.from({ length: 60 / minuteStep }, (_, i) => i * minuteStep);

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
                    <Clock size={16} className="text-text-muted" />
                    <span className={`text-sm ${value ? 'text-text-main' : 'text-text-muted'}`}>
                        {value ? formatDisplayTime(value) : placeholder}
                    </span>
                </div>
            </button>

            {/* Time Picker Dropdown */}
            {isOpen && (
                <div
                    className="
            absolute top-full left-0 mt-1 bg-surface border border-black/10 dark:border-white/10
            rounded-xl shadow-lg z-50 p-3 w-56
          "
                    role="dialog"
                    aria-label="Chọn giờ"
                >
                    {/* Time Display */}
                    <div className="flex items-center justify-center gap-2 mb-3 pb-3 border-b border-black/5 dark:border-white/5">
                        {/* Hour Control */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={incrementHour}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronUp size={18} className="text-text-muted" />
                            </button>
                            <span className="text-2xl font-bold text-text-main w-12 text-center">
                                {String(hours).padStart(2, '0')}
                            </span>
                            <button
                                type="button"
                                onClick={decrementHour}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronDown size={18} className="text-text-muted" />
                            </button>
                        </div>

                        <span className="text-2xl font-bold text-text-muted">:</span>

                        {/* Minute Control */}
                        <div className="flex flex-col items-center">
                            <button
                                type="button"
                                onClick={incrementMinute}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronUp size={18} className="text-text-muted" />
                            </button>
                            <span className="text-2xl font-bold text-text-main w-12 text-center">
                                {String(minutes).padStart(2, '0')}
                            </span>
                            <button
                                type="button"
                                onClick={decrementMinute}
                                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <ChevronDown size={18} className="text-text-muted" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Select Lists */}
                    <div className="flex gap-2 max-h-40">
                        {/* Hour List */}
                        <div
                            ref={hourListRef}
                            className="flex-1 overflow-y-auto custom-scrollbar"
                        >
                            <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface">Giờ</div>
                            {hourOptions.map((h) => (
                                <button
                                    key={h}
                                    type="button"
                                    data-selected={h === hours}
                                    onClick={() => handleHourChange(h)}
                                    className={`
                    w-full py-1.5 text-sm rounded-lg transition-colors
                    ${h === hours
                                            ? 'bg-primary text-white font-medium'
                                            : 'text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                                        }
                  `}
                                >
                                    {String(h).padStart(2, '0')}
                                </button>
                            ))}
                        </div>

                        {/* Minute List */}
                        <div
                            ref={minuteListRef}
                            className="flex-1 overflow-y-auto custom-scrollbar"
                        >
                            <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface">Phút</div>
                            {minuteOptions.map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    data-selected={m === minutes}
                                    onClick={() => handleMinuteChange(m)}
                                    className={`
                    w-full py-1.5 text-sm rounded-lg transition-colors
                    ${m === minutes
                                            ? 'bg-primary text-white font-medium'
                                            : 'text-text-main hover:bg-black/5 dark:hover:bg-white/5'
                                        }
                  `}
                                >
                                    {String(m).padStart(2, '0')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Now Button */}
                    <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                        <button
                            type="button"
                            onClick={setCurrentTime}
                            className="w-full py-2 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors font-medium"
                        >
                            Bây giờ
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomTimePicker;
