import React from 'react';
import { classNames } from '@/shared/utils/class-names';

interface TextAreaProps extends Omit<
  React.TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
> {
  label?: string;
  error?: string;
  id: string;
  variant?: 'underline' | 'boxed';
  showCount?: boolean;
  className?: string;
  textareaClassName?: string;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export function TextArea({
  label,
  error,
  id,
  variant = 'boxed',
  showCount = false,
  maxLength,
  value,
  className,
  textareaClassName,
  rows = 3,
  ref,
  ...rest
}: TextAreaProps) {
  const currentLength = typeof value === 'string' ? value.length : 0;

  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-label-caps text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <textarea
          ref={ref}
          id={id}
          rows={rows}
          value={value}
          maxLength={maxLength}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={classNames(
            'w-full px-3 py-2 text-body font-medium text-text-primary placeholder:text-text-secondary transition-colors resize-none',
            'focus-ring focus-visible:outline-none focus-visible:border-primary',
            variant === 'underline'
              ? 'rounded-none border-0 border-b border-border hover:border-b-primary/40 focus-visible:border-b-primary bg-transparent px-1'
              : 'rounded-control border bg-surface-elevated',
            error ? 'border-danger' : 'border-border',
            textareaClassName ?? '',
          )}
          {...rest}
        />
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        {error ? (
          <p id={`${id}-error`} role="alert" className="text-body-sm text-danger">
            {error}
          </p>
        ) : (
          <span />
        )}
        {showCount && maxLength !== undefined && (
          <span className="text-body-sm text-text-secondary tabular-nums ml-auto">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
}

export default TextArea;
