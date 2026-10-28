import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import ListboxSearchInput from './listbox-search-input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';

interface Option {
  value: string | number;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: string;
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Chọn…',
  className = '',
  disabled = false,
  searchable = false,
  maxHeight = '200px',
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: DropdownProps) {
  const generatedId = useId();
  const controlId = id ?? `dropdown-${generatedId}`;
  const triggerLabelledBy = ariaLabelledBy ? `${ariaLabelledBy} ${controlId}` : undefined;
  const listboxId = `${controlId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const reducedMotion = useReducedMotion() ?? false;
  const panelMotion = getPanelMotion(reducedMotion);

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(lowerQuery));
  }, [options, searchable, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setActiveIndex(-1);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    if (activeIndex >= 0) optionRefs.current[activeIndex]?.focus();
    else if (searchable) inputRef.current?.focus();
  }, [activeIndex, isOpen, searchable, filteredOptions.length]);

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    setSearchQuery('');
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  const openAt = (index: number) => {
    setSearchQuery('');
    setIsOpen(true);
    setActiveIndex(index);
  };

  const moveTo = (index: number) => {
    if (filteredOptions.length === 0) return;
    setActiveIndex(Math.max(0, Math.min(filteredOptions.length - 1, index)));
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    closeAndRestoreFocus();
  };

  const handleNavigationKey = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      if (isOpen) {
        event.preventDefault();
        closeAndRestoreFocus();
      }
      return;
    }

    if (
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      const nextIndex =
        event.key === 'ArrowDown'
          ? activeIndex + 1
          : event.key === 'ArrowUp'
            ? activeIndex < 0
              ? filteredOptions.length - 1
              : activeIndex - 1
            : event.key === 'Home'
              ? 0
              : filteredOptions.length - 1;
      if (!isOpen) openAt(nextIndex);
      else moveTo(nextIndex);
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        const selectedIndex = filteredOptions.findIndex((option) => option.value === value);
        openAt(searchable ? -1 : Math.max(0, selectedIndex));
      } else if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
      }
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        id={controlId}
        ref={triggerRef}
        type="button"
        onClick={() => (isOpen ? closeAndRestoreFocus() : openAt(-1))}
        onKeyDown={handleNavigationKey}
        disabled={disabled}
        className={`
          w-full h-11 border border-border-default rounded-card px-4 text-left
          focus-ring
          hover:border-primary/30 transition-colors
          flex items-center justify-between
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-label={ariaLabel}
        aria-labelledby={triggerLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <span
          className={`text-body font-medium whitespace-nowrap truncate mr-2 ${selectedOption ? 'text-text-primary' : 'text-text-muted'}`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          aria-hidden="true"
          className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...panelMotion}
            className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-card z-50 overflow-hidden"
          >
            {searchable && (
              <ListboxSearchInput
                inputRef={inputRef}
                value={searchQuery}
                onChange={(next) => {
                  setSearchQuery(next);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleNavigationKey}
              />
            )}

            <div
              id={listboxId}
              role="listbox"
              className="overflow-y-auto custom-scrollbar p-2"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-4 text-body text-text-secondary text-center">
                  {searchable && searchQuery ? 'Không tìm thấy kết quả' : 'Không có tùy chọn'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <button
                    key={option.value}
                    ref={(element) => {
                      optionRefs.current[index] = element;
                    }}
                    type="button"
                    onClick={() => handleSelect(option)}
                    onKeyDown={handleNavigationKey}
                    className={`w-full px-4 py-2.5 text-left text-body rounded-control transition-colors flex items-center justify-between mb-1 last:mb-0 ${option.value === value ? 'bg-primary text-on-primary font-bold' : 'text-text-primary hover:bg-primary/10 hover:text-primary'}`}
                    role="option"
                    aria-selected={option.value === value}
                  >
                    <span>{option.label}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Dropdown;
