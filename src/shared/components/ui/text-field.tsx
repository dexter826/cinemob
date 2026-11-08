import React from 'react';
import { classNames } from '@/shared/utils/class-names';

interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  label?: string;
  leadingIcon?: React.ReactNode;
  trailingAction?: React.ReactNode;
  error?: string;
  id: string;
  variant?: 'underline' | 'boxed';
  className?: string;
  inputClassName?: string;
  ref?: React.Ref<HTMLInputElement>;
}

function TextField({
  label,
  leadingIcon,
  trailingAction,
  error,
  id,
  variant = 'underline',
  className,
  inputClassName,
  ref,
  ...rest
}: TextFieldProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label htmlFor={id} className="block text-label-caps text-text-secondary mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none inline-flex">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={classNames(
            'w-full h-11 bg-transparent text-body font-medium text-text-primary placeholder:text-text-secondary transition-colors',
            variant === 'underline'
              ? 'rounded-none border-0 border-b border-border hover:border-b-primary/40 focus-visible:border-b-primary focus-visible:outline-none'
              : 'rounded-control border focus-visible:border-primary focus-ring focus-visible:outline-none',
            leadingIcon ? 'pl-10' : variant === 'underline' ? 'pl-1' : 'pl-4',
            trailingAction ? 'pr-11' : variant === 'underline' ? 'pr-1' : 'pr-4',
            error ? 'border-danger' : 'border-border',
            inputClassName ?? '',
          )}
          {...rest}
        />
        {trailingAction && (
          <span className="absolute right-1 top-1/2 -translate-y-1/2 inline-flex">
            {trailingAction}
          </span>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-body-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
