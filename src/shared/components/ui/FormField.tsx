import React from 'react';
import { classNames } from '@/shared/utils/classNames';

interface FormFieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ id, label, hint, error, required = false, children, className = '' }: FormFieldProps) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={classNames('flex flex-col gap-1.5 min-w-0', className)}>
      <label htmlFor={id} className="text-sm font-semibold text-text-primary">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger ml-1">*</span>
        )}
      </label>
      {React.isValidElement(children)
        ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
            id,
            'aria-describedby': describedBy,
            'aria-invalid': error ? true : undefined,
            'aria-required': required || undefined,
          })
        : children}
      {hint && !error && (
        <p id={hintId} className="text-xs text-text-secondary">{hint}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">{error}</p>
      )}
    </div>
  );
}

export default FormField;
