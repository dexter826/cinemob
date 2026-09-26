import React from 'react';
import { classNames } from '@/shared/utils/classNames';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-on-primary hover:bg-primary-hover border border-transparent',
  secondary: 'bg-surface text-text-primary border border-border hover:border-primary/50 hover:text-primary',
  ghost: 'bg-transparent text-text-primary border border-transparent hover:bg-black/5 dark:hover:bg-white/5',
  danger: 'bg-danger text-white hover:brightness-95 border border-transparent',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-control',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-control',
  lg: 'px-6 py-3.5 text-base gap-2 rounded-card',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leadingIcon,
  trailingIcon,
  type = 'button',
  disabled,
  className,
  children,
  ref,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? 'true' : undefined}
      className={classNames(
        'inline-flex items-center justify-center font-semibold cursor-pointer',
        'transition-colors transition-shadow focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className ?? ''
      )}
      {...rest}
    >
      {leadingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{leadingIcon}</span>}
      <span className="truncate">{children}</span>
      {trailingIcon && <span aria-hidden="true" className="inline-flex shrink-0">{trailingIcon}</span>}
    </button>
  );
}

export default Button;
