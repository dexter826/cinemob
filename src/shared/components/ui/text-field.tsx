import React from 'react';
import { classNames } from '@/shared/utils/class-names';

interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  /** Nhãn hiển thị phía trên (không truyền → không render label). */
  label?: string;
  /** Icon dẫn đầu (lucide element). */
  leadingIcon?: React.ReactNode;
  /** Thông báo lỗi — hiện dưới field, viền chuyển danger. */
  error?: string;
  id: string;
  /** 'underline' = gạch-đáy (nền trang — chuẩn app); 'boxed' = hộp (trong modal/elevated). */
  variant?: 'underline' | 'boxed';
  className?: string;
}

/**
 * Input văn bản chuẩn của app: h-11, nền trong suốt + hairline,
 * focus viền vàng. Mọi input đơn giản đi qua đây, cấm inline custom.
 */
function TextField({
  label,
  leadingIcon,
  error,
  id,
  variant = 'underline',
  className,
  ...rest
}: TextFieldProps) {
  return (
    <div className={classNames('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary mb-1.5"
        >
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
          id={id}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={classNames(
            'w-full h-11 bg-transparent text-sm font-medium text-text-primary placeholder:text-text-secondary transition-colors',
            variant === 'underline'
              ? 'rounded-none border-0 border-b border-border hover:border-b-primary/40 focus-visible:border-b-primary focus-visible:outline-none'
              : 'rounded-control border focus-visible:border-primary',
            leadingIcon ? 'pl-10 pr-4' : variant === 'underline' ? 'px-1' : 'px-4',
            error ? 'border-danger' : 'border-border',
          )}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export default TextField;
