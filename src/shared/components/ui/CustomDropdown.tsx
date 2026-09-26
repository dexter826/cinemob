import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: string;
  id?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Chọn…',
  className = '',
  disabled = false,
  searchable = false,
  maxHeight = '200px',
  id,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: CustomDropdownProps) {
  const generatedId = useId();
  const controlId = id ?? `dropdown-${generatedId}`;
  const listboxId = `${controlId}-listbox`;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery.trim()) return options;
    const lowerQuery = searchQuery.toLowerCase();
    return options.filter(option => option.label.toLowerCase().includes(lowerQuery));
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

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      const nextIndex = event.key === 'ArrowDown'
        ? activeIndex + 1
        : event.key === 'ArrowUp'
          ? (activeIndex < 0 ? filteredOptions.length - 1 : activeIndex - 1)
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
        const selectedIndex = filteredOptions.findIndex(option => option.value === value);
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
        onClick={() => isOpen ? closeAndRestoreFocus() : openAt(-1)}
        onKeyDown={handleNavigationKey}
        disabled={disabled}
        className={`
          w-full h-11 bg-black/5 dark:bg-white/5 border border-border-default rounded-2xl px-4 text-left
          focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20
          hover:border-primary/30 transition-colors duration-300
          flex items-center justify-between shadow-sm
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20 shadow-premium' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-labelledby={ariaLabelledBy}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
      >
        <span className={`text-sm font-medium whitespace-nowrap truncate mr-2 ${selectedOption ? 'text-text-main' : 'text-text-muted/60'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown size={16} aria-hidden="true" className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border rounded-2xl shadow-elevated z-50 overflow-hidden">
          {searchable && (
            <div className="p-3 border-b border-border-default bg-black/5 dark:bg-white/5">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value);
                  setActiveIndex(-1);
                }}
                onKeyDown={handleNavigationKey}
                placeholder="Tìm kiếm…"
                aria-label="Tìm kiếm tùy chọn"
                className="w-full bg-surface border border-border-default rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-main placeholder-text-muted/50"
              />
            </div>
          )}

          <div id={listboxId} role="listbox" className="overflow-y-auto custom-scrollbar p-2" style={{ maxHeight }}>
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-sm text-text-muted text-center italic opacity-60">
                {searchable && searchQuery ? 'Không tìm thấy kết quả' : 'Không có tùy chọn'}
              </div>
            ) : filteredOptions.map((option, index) => (
              <button
                key={option.value}
                ref={(element) => { optionRefs.current[index] = element; }}
                type="button"
                onClick={() => handleSelect(option)}
                onKeyDown={handleNavigationKey}
                className={`w-full px-4 py-2.5 text-left text-sm rounded-xl transition-colors duration-200 flex items-center justify-between mb-1 last:mb-0 ${option.value === value ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' : 'text-text-main hover:bg-primary/10 hover:text-primary'}`}
                role="option"
                aria-selected={option.value === value}
              >
                <span>{option.label}</span>
                {option.value === value && <Check size={16} className="text-white" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomDropdown;
