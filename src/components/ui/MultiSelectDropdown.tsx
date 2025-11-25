import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string | number;
  label: string;
}

interface MultiSelectDropdownProps {
  options: Option[];
  values: (string | number)[];
  onChange: (values: (string | number)[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  searchable?: boolean;
  maxHeight?: string;
  maxDisplay?: number;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  values,
  onChange,
  placeholder = 'Chọn...',
  className = '',
  disabled = false,
  searchable = false,
  maxHeight = '250px',
  maxDisplay = 2,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(option => values.includes(option.value));

  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

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
    const isSelected = values.includes(option.value);
    if (isSelected) {
      onChange(values.filter(v => v !== option.value));
    } else {
      onChange([...values, option.value]);
    }
  };

  const handleRemove = (value: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== value));
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  const renderSelectedDisplay = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-text-muted text-sm">{placeholder}</span>;
    }

    const displayOptions = selectedOptions.slice(0, maxDisplay);
    const remainingCount = selectedOptions.length - maxDisplay;

    return (
      <div className="flex flex-wrap gap-1 flex-1 min-w-0">
        {displayOptions.map(option => (
          <span
            key={option.value}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-md text-xs font-medium"
          >
            <span className="truncate max-w-[80px]">{option.label}</span>
            <button
              type="button"
              onClick={(e) => handleRemove(option.value, e)}
              className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
            >
              <X size={12} />
            </button>
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 bg-black/10 dark:bg-white/10 text-text-muted rounded-md text-xs font-medium">
            +{remainingCount}
          </span>
        )}
      </div>
    );
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
          flex items-center gap-2
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''}
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {renderSelectedDisplay()}
        <div className="flex items-center gap-1 shrink-0">
          {values.length > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="p-0.5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors"
              title="Xóa tất cả"
            >
              <X size={14} className="text-text-muted" />
            </button>
          )}
          <ChevronDown
            size={16}
            className={`text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 right-0 mt-1 bg-surface border border-black/10 dark:border-white/10
            rounded-xl shadow-lg z-50
          "
          role="listbox"
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b border-black/5 dark:border-white/5">
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="
                  w-full bg-black/5 dark:bg-white/5 border-none rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-main placeholder-text-muted
                "
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Selected Count */}
          {values.length > 0 && (
            <div className="px-3 py-2 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
              <span className="text-xs text-text-muted">
                Đã chọn {values.length} mục
              </span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs text-primary hover:text-primary/80 transition-colors"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Options List */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-sm text-text-muted text-center">
                {searchable && searchQuery ? 'Không tìm thấy kết quả' : 'Không có tùy chọn'}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = values.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={`
                      w-full px-4 py-3 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5
                      transition-colors duration-150 flex items-center gap-3
                      ${isSelected ? 'bg-primary/5' : ''}
                    `}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {/* Checkbox */}
                    <div
                      className={`
                        w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors
                        ${isSelected 
                          ? 'bg-primary border-primary' 
                          : 'border-black/20 dark:border-white/20'
                        }
                      `}
                    >
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                    <span className={isSelected ? 'text-primary font-medium' : 'text-text-main'}>
                      {option.label}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;