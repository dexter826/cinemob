import React, { useState, useRef, useEffect, useId, useMemo } from 'react';
import { Clock, X } from 'lucide-react';
import { Dialog } from './dialog';
import { useMediaQuery } from '@/shared/hooks/use-media-query';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';

interface TimePickerProps {
  value: string; // định dạng HH:mm
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

function TimePicker({
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
}: TimePickerProps) {
  const generatedId = useId();
  const controlId = id ?? `time-picker-${generatedId}`;
  const dialogTitleId = `${controlId}-title`;
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 639px)');
  const reducedMotion = useReducedMotion() ?? false;
  const popoverMotion = getPanelMotion(reducedMotion);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const hourListRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
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

  // Popover desktop là dialog: nhận focus khi mở để bàn phím thao tác ngay.
  useEffect(() => {
    if (isOpen && !isMobile) popoverRef.current?.focus();
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
    [minuteStep],
  );

  const renderPicker = () => (
    <motion.div
      ref={popoverRef}
      id={isMobile ? undefined : `${controlId}-dialog`}
      tabIndex={isMobile ? undefined : -1}
      className={`
                bg-surface-elevated border border-border rounded-card p-4
                ${
                  isMobile
                    ? 'relative w-full max-w-[280px] mx-auto'
                    : 'absolute top-full right-0 mt-1 z-50 w-56'
                }
            `}
      role={isMobile ? undefined : 'dialog'}
      aria-label={isMobile ? undefined : 'Chọn giờ'}
      onClick={(e) => isMobile && e.stopPropagation()}
      initial={isMobile ? undefined : popoverMotion.initial}
      animate={isMobile ? undefined : popoverMotion.animate}
      exit={isMobile ? undefined : popoverMotion.exit}
      transition={popoverMotion.transition}
    >
      {isMobile && (
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-default">
          <span id={dialogTitleId} className="text-title-md text-text-primary">
            Chọn giờ
          </span>
          <button
            type="button"
            aria-label="Đóng bảng chọn giờ"
            onClick={closePicker}
            className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-control cursor-pointer"
          >
            <X size={20} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Danh sách chọn nhanh */}
      <div className="flex gap-2 max-h-40">
        {/* Danh sách giờ */}
        <div ref={hourListRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-label-caps text-text-secondary text-center mb-1 sticky top-0 bg-surface">
            Giờ
          </div>
          {HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              data-selected={h === hours}
              onClick={() => handleHourChange(h)}
              className={`
                                w-full py-2.5 text-body-sm rounded-control transition-colors
                                ${
                                  h === hours
                                    ? 'bg-primary text-on-primary font-bold'
                                    : 'text-text-primary hover:bg-primary/10 hover:text-primary font-medium'
                                }
                            `}
            >
              {String(h).padStart(2, '0')}
            </button>
          ))}
        </div>

        {/* Danh sách phút */}
        <div ref={minuteListRef} className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="text-label-caps text-text-secondary text-center mb-1 sticky top-0 bg-surface">
            Phút
          </div>
          {minuteOptions.map((m) => (
            <button
              key={m}
              type="button"
              data-selected={m === minutes}
              onClick={() => handleMinuteChange(m)}
              className={`
                                w-full py-2.5 text-body-sm rounded-control transition-colors
                                ${
                                  m === minutes
                                    ? 'bg-primary text-on-primary font-bold'
                                    : 'text-text-primary hover:bg-primary/10 hover:text-primary font-medium'
                                }
                            `}
            >
              {String(m).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Nút bây giờ */}
      <div className="mt-4 pt-3 border-t border-border-default">
        <button
          type="button"
          onClick={setCurrentTime}
          className="w-full py-2.5 text-body-sm font-bold text-primary hover:bg-primary/5 rounded-control transition-colors border border-transparent"
        >
          Bây giờ
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
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <div className="flex items-center gap-2">
          <Clock size={16} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
          <span
            className={`text-body font-medium ${value ? 'text-text-primary' : 'text-text-secondary'}`}
          >
            {value || placeholder}
          </span>
        </div>
      </button>

      {/* Khung chọn giờ */}
      {isMobile ? (
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
      ) : (
        <AnimatePresence>{isOpen && renderPicker()}</AnimatePresence>
      )}
    </div>
  );
}

export default TimePicker;
