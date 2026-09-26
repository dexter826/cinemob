import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { Dialog } from './Dialog';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

interface CustomTimePickerProps {
    value: string; // HH:mm format
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minuteStep?: number;
    id?: string;
    'aria-labelledby'?: string;
    'aria-describedby'?: string;
    'aria-invalid'?: boolean | 'true' | 'false';
}

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);

function CustomTimePicker({
    value,
    onChange,
    placeholder = 'Chọn giờ…',
    className = '',
    disabled = false,
    minuteStep = 1,
    id,
    'aria-labelledby': ariaLabelledBy,
    'aria-describedby': ariaDescribedBy,
    'aria-invalid': ariaInvalid,
}: CustomTimePickerProps) {
    const generatedId = useId();
    const controlId = id ?? `time-picker-${generatedId}`;
    const dialogTitleId = `${controlId}-title`;
    const [isOpen, setIsOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width: 639px)');
    const dropdownRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const hourListRef = useRef<HTMLDivElement>(null);
    const minuteListRef = useRef<HTMLDivElement>(null);

    const [hours, minutes] = value ? value.split(':').map(Number) : [0, 0];

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

    // Cuộn đến giờ phút đã chọn khi mở picker
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            if (hourListRef.current) {
                const selectedHour = hourListRef.current.querySelector('[data-selected="true"]');
                if (selectedHour && 'scrollIntoView' in selectedHour) {
                    selectedHour.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }
            if (minuteListRef.current) {
                const selectedMinute = minuteListRef.current.querySelector('[data-selected="true"]');
                if (selectedMinute && 'scrollIntoView' in selectedMinute) {
                    selectedMinute.scrollIntoView({ block: 'center', behavior: 'auto' });
                }
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [isOpen]);

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

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleToggle();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            if (isOpen) {
                closePicker();
            }
        }
    };

    const setCurrentTime = () => {
        const now = new Date();
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        onChange(`${h}:${m}`);
        closePicker();
    };

    const minuteOptions = useMemo(
        () => Array.from({ length: Math.floor(60 / minuteStep) }, (_, i) => i * minuteStep),
        [minuteStep]
    );

    const renderPicker = () => (
        <div
            className={`
                bg-surface border border-border-default rounded-2xl shadow-2xl p-4
                ${isMobile
                    ? 'relative w-full max-w-[280px] mx-auto'
                    : 'absolute top-full left-0 mt-1 z-50 w-56'}
            `}
            role={isMobile ? undefined : 'dialog'}
            aria-label={isMobile ? undefined : 'Chọn giờ'}
            onClick={(e) => isMobile && e.stopPropagation()}
        >
            {isMobile && (
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
                    <span id={dialogTitleId} className="text-sm font-bold text-text-main">Chọn giờ</span>
                    <button
                        type="button"
                        aria-label="Đóng bảng chọn giờ"
                        onClick={closePicker}
                        className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg cursor-pointer"
                    >
                        <X size={20} className="text-text-muted" aria-hidden="true" />
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
                    <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface font-bold">Giờ</div>
                    {HOUR_OPTIONS.map((h) => (
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
                    <div className="text-xs text-text-muted text-center mb-1 sticky top-0 bg-surface font-bold">Phút</div>
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
                    className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors border border-primary/20"
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
                    <Clock size={16} className="text-text-muted" />
                    <span className={`text-sm font-medium ${value ? 'text-text-main' : 'text-text-muted'}`}>
                        {value || placeholder}
                    </span>
                </div>
            </button>

            {/* Picker UI */}
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
                        <div id={`${controlId}-dialog`}>{renderPicker()}</div>
                    </Dialog>
                ) : renderPicker()
            )}
        </div>
    );
};

export default CustomTimePicker;
