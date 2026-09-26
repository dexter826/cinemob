import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from 'lucide-react';

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
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useRef(`dropdown-listbox-${Math.random().toString(36).slice(2, 8)}`);

  const selectedOption = useMemo(
    () => options.find(option => option.value === value),
    [options, value]
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
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && searchable && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchQuery('');
      }
    }
  };

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchQuery('');
  };

  const closeAndRestoreFocus = () => {
    setIsOpen(false);
    setSearchQuery('');
    setActiveIndex(-1);
    triggerRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(Math.max(0, filteredOptions.findIndex((o) => o.value === value)));
      } else if (activeIndex >= 0 && filteredOptions[activeIndex]) {
        handleSelect(filteredOptions[activeIndex]);
      } else {
        handleToggle();
      }
    } else if (event.key === 'Escape') {
      event.preventDefault();
      if (isOpen) closeAndRestoreFocus();
    } else if (isOpen && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((prev) => Math.min(filteredOptions.length - 1, prev + 1));
    } else if (isOpen && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(0, prev - 1));
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
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
        aria-controls={listboxId.current}
      >
        <span className={`text-sm font-medium whitespace-nowrap truncate mr-2 ${selectedOption ? 'text-text-main' : 'text-text-muted/60'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={listboxId.current}
          className="
            absolute top-full left-0 right-0 mt-2 bg-surface-elevated border border-border
            rounded-2xl shadow-elevated z-50 overflow-hidden
          "
          role="listbox"
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-3 border-b border-border-default bg-black/5 dark:bg-white/5">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm…"
                className="
                  w-full bg-surface border border-border-default rounded-xl px-3 py-2 text-sm
                  focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-main placeholder-text-muted/50
                "
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options List */}
          <div
            className="overflow-y-auto custom-scrollbar p-2"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-4 text-sm text-text-muted text-center italic opacity-60">
                {searchable && searchQuery ? 'Không tìm thấy kết quả' : 'Không có tùy chọn'}
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-4 py-2.5 text-left text-sm rounded-xl
                    transition-colors duration-200 flex items-center justify-between mb-1 last:mb-0
                    ${option.value === value 
                      ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20' 
                      : 'text-text-main hover:bg-primary/10 hover:text-primary'
                    }
                  `}
                  role="option"
                  aria-selected={option.value === value}
                >
                  <span>{option.label}</span>
                  {option.value === value && (
                    <Check size={16} className="text-white" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;