import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import ListboxSearchInput from './listbox-search-input';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { getPanelMotion } from '@/constants/animations';

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
  id?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean | 'true' | 'false';
}

function MultiSelectDropdown({
  options,
  values,
  onChange,
  placeholder = 'Chọn…',
  className = '',
  disabled = false,
  searchable = false,
  maxHeight = '250px',
  maxDisplay = 2,
  id,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: MultiSelectDropdownProps) {
  const generatedId = useId();
  const controlId = id ?? `multiselect-${generatedId}`;
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

  const selectedOptions = useMemo(
    () => options.filter((option) => values.includes(option.value)),
    [options, values],
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

  const toggleOption = (option: Option) => {
    const nextValues = values.includes(option.value)
      ? values.filter((value) => value !== option.value)
      : [...values, option.value];
    onChange(nextValues);
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
      if (!isOpen) openAt(searchable ? -1 : 0);
      else if (activeIndex >= 0 && filteredOptions[activeIndex])
        toggleOption(filteredOptions[activeIndex]);
    }
  };

  const displayOptions = selectedOptions.slice(0, maxDisplay);
  const remainingCount = selectedOptions.length - displayOptions.length;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div
        className={`flex min-h-11 bg-surface border border-border-default rounded-card transition-colors ${isOpen ? 'border-primary/50 ring-1 ring-primary/20' : ''} ${disabled ? 'opacity-50' : ''}`}
      >
        <button
          id={controlId}
          ref={triggerRef}
          type="button"
          onClick={() => (isOpen ? closeAndRestoreFocus() : openAt(-1))}
          onKeyDown={handleNavigationKey}
          disabled={disabled}
          className="flex flex-1 min-w-0 items-center justify-between px-3 py-2 text-left rounded-card focus-ring disabled:cursor-not-allowed"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          aria-labelledby={triggerLabelledBy}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
        >
          {displayOptions.length === 0 ? (
            <span className="text-text-secondary text-body">{placeholder}</span>
          ) : (
            <span className="flex flex-wrap gap-1 flex-1 min-w-0">
              {displayOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center px-2 py-0.5 bg-primary text-on-primary rounded-poster text-body-sm truncate max-w-28"
                >
                  {option.label}
                </span>
              ))}
              {remainingCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 bg-black/10 dark:bg-white/10 text-text-secondary rounded-poster text-body-sm">
                  +{remainingCount}
                </span>
              )}
            </span>
          )}
          <ChevronDown
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className={`text-text-secondary shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {values.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            disabled={disabled}
            aria-label="Xóa tất cả lựa chọn"
            className="self-center mr-2 p-2 hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition-colors focus-ring"
          >
            <X size={14} strokeWidth={1.5} className="text-text-secondary" aria-hidden="true" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...panelMotion}
            className="absolute top-full left-0 right-0 mt-1 bg-surface-elevated border border-border rounded-control z-50 overflow-hidden"
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

            {values.length > 0 && (
              <div className="px-3 py-2 border-b border-border-default flex items-center justify-between">
                <span className="text-body-sm text-text-secondary">
                  Đã chọn {values.length} mục
                </span>
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="text-body-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            <div
              id={listboxId}
              role="listbox"
              aria-multiselectable="true"
              className="overflow-y-auto custom-scrollbar p-2"
              style={{ maxHeight }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-body text-text-secondary text-center">
                  {searchable && searchQuery ? 'Không tìm thấy kết quả' : 'Không có tùy chọn'}
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = values.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      ref={(element) => {
                        optionRefs.current[index] = element;
                      }}
                      type="button"
                      onClick={() => toggleOption(option)}
                      onKeyDown={handleNavigationKey}
                      className={`w-full px-4 py-2.5 text-left text-body hover:bg-primary/10 rounded-control transition-colors flex items-center gap-3 mb-1 last:mb-0 ${isSelected ? 'bg-primary/5 text-primary' : 'text-text-primary'}`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span
                        className={`w-4 h-4 rounded-poster border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-black/20 dark:border-white/20'}`}
                      >
                        {isSelected && (
                          <Check
                            size={12}
                            strokeWidth={1.5}
                            className="text-on-primary"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                      <span
                        className={isSelected ? 'text-primary font-medium' : 'text-text-primary'}
                      >
                        {option.label}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MultiSelectDropdown;
