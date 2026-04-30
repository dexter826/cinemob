import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown, X } from 'lucide-react';
import { createPortal } from 'react-dom';

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
    const [isMobile, setIsMobile] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0];

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

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

    const renderPicker = () => (
        <div
            className={`
                bg-surface border border-border-default rounded-2xl shadow-2xl p-4
                ${isMobile 
                    ? 'fixed inset-x-4 top-1/2 -translate-y-1/2 z-70 w-auto max-w-[280px] mx-auto animate-in zoom-in-95 duration-200' 
                    : 'absolute top-full left-0 mt-1 z-50 w-56'}
            `}
            role="dialog"
            aria-label="Chọn giờ"
            onClick={(e) => isMobile && e.stopPropagation()}
        >
            {isMobile && (
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
                    <span className="text-sm font-bold text-text-main uppercase tracking-widest">Chọn giờ</span>
                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg">
                        <X size={20} className="text-text-muted" />
                    </button>
                </div>
            )}

            {/* Quick Select Lists */}
            <div className="flex gap-2 max-h-40">
                {/* Hour List */}
                <div
                    ref={hourListRef}
                    className="flex-1 overflow-y-auto custom-scrollbar"
                >
                    <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface font-bold uppercase tracking-widest">Giờ</div>
                    {hourOptions.map((h) => (
                        <button
                            key={h}
                            type="button"
                            data-selected={h === hours}
                            onClick={() => handleHourChange(h)}
                            className={`
                                w-full py-1.5 text-sm rounded-lg transition-colors
                                ${h === hours
                                    ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                                    : 'text-text-main hover:bg-primary/10 hover:text-primary font-medium'
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
                    <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface font-bold uppercase tracking-widest">Phút</div>
                    {minuteOptions.map((m) => (
                        <button
                            key={m}
                            type="button"
                            data-selected={m === minutes}
                            onClick={() => handleMinuteChange(m)}
                            className={`
                                w-full py-1.5 text-sm rounded-lg transition-colors
                                ${m === minutes
                                    ? 'bg-primary text-white font-bold shadow-md shadow-primary/20'
                                    : 'text-text-main hover:bg-primary/10 hover:text-primary font-medium'
                                }
                            `}
                        >
                            {String(m).padStart(2, '0')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Now Button */}
            <div className="mt-4 pt-3 border-t border-border-default">
                <button
                    type="button"
                    onClick={setCurrentTime}
                    className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-all uppercase tracking-widest border border-primary/20"
                >
                    Bây giờ
                </button>
            </div>
        </div>
    );

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={handleToggle}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={`
          w-full bg-black/5 dark:bg-white/5 border border-border-default rounded-xl px-4 py-3 text-left
          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
          hover:border-primary/30 transition-all duration-200
          flex items-center justify-between shadow-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    <Clock size={16} className="text-text-muted" />
                    <span className={`text-sm font-medium ${value ? 'text-text-main' : 'text-text-muted'}`}>
                        {value ? formatDisplayTime(value) : placeholder}
                    </span>
                </div>
            </button>

            {/* Picker UI */}
            {isOpen && (
                isMobile ? (
                    createPortal(
                        <div 
                            className="fixed inset-0 z-60 flex items-center justify-center p-4 animate-in fade-in duration-200"
                            onClick={() => setIsOpen(false)}
                        >
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            {renderPicker()}
                        </div>,
                        document.body
                    )
                ) : renderPicker()
            )}
        </div>
    );
};

export default CustomTimePicker;
