import React, { useId } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { classNames } from '@/shared/utils/class-names';

interface SearchFieldProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'className' | 'id'
> {
  value: string;
  onChange: (value: string) => void;
  variant?: 'underline' | 'boxed';
  label?: string;
  leadingIcon?: React.ReactNode;
  endSlot?: React.ReactNode;
  className?: string;
  inputClassName?: string;
  id?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function SearchField({
  value,
  onChange,
  variant = 'underline',
  label = 'Tìm kiếm',
  leadingIcon,
  endSlot,
  placeholder = 'Tìm kiếm…',
  className,
  inputClassName,
  id,
  ref,
  type = 'text',
  ...rest
}: SearchFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const isUnderline = variant === 'underline';

  return (
    <div className={classNames('relative group', className)}>
      <span
        className={classNames(
          'absolute top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none inline-flex',
          isUnderline ? 'left-2 group-focus-within:text-primary transition-colors' : 'left-3.5',
        )}
      >
        {leadingIcon ?? <SearchIcon size={16} strokeWidth={1.5} aria-hidden="true" />}
      </span>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      <input
        id={inputId}
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck={false}
        className={classNames(
          'w-full bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary transition-colors',
          isUnderline
            ? 'h-12 rounded-none border-0 border-b border-border focus-visible:outline-none'
            : 'h-11 rounded-control border border-border focus-visible:border-primary',
          isUnderline ? 'pl-8' : 'pl-10',
          endSlot ? undefined : 'pr-9',
          inputClassName,
        )}
        {...rest}
      />
      {isUnderline && (
        <span
          aria-hidden="true"
          className={classNames(
            'pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-primary transition-opacity duration-200',
            value
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-40 group-focus-within:opacity-100',
          )}
        />
      )}
      {(value || endSlot) && (
        <div
          className={classNames(
            'absolute top-1/2 -translate-y-1/2 flex items-center gap-1',
            isUnderline ? 'right-1' : 'right-2',
          )}
        >
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label="Xóa từ khóa tìm kiếm"
              className={classNames(
                'text-text-secondary hover:text-text-primary transition-colors cursor-pointer',
                isUnderline ? 'p-2.5' : 'p-2',
              )}
            >
              <X
                size={isUnderline ? 14 : 15}
                strokeWidth={isUnderline ? 1.5 : undefined}
                aria-hidden="true"
              />
            </button>
          )}
          {endSlot}
        </div>
      )}
    </div>
  );
}

export default SearchField;
