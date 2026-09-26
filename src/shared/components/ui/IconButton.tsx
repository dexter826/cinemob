import React from 'react';
import { classNames } from '@/shared/utils/classNames';

interface IconButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'aria-label'> {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'secondary' | 'danger';
}

const sizeClasses: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'w-8 h-8 rounded-control',
  md: 'w-10 h-10 rounded-control',
  lg: 'w-12 h-12 rounded-card',
};

const variantClasses: Record<NonNullable<IconButtonProps['variant']>, string> = {
  ghost: 'bg-transparent text-text-primary border border-transparent hover:bg-black/5 dark:hover:bg-white/5',
  secondary: 'bg-surface text-text-primary border border-border hover:border-primary/50 hover:text-primary',
  danger: 'bg-transparent text-danger border border-transparent hover:bg-danger/10',
};

export function IconButton({
  label,
  size = 'md',
  variant = 'ghost',
  type = 'button',
  title,
  className,
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={title ?? label}
      className={classNames(
        'inline-flex items-center justify-center cursor-pointer',
        'transition-colors focus-visible:outline-none',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        sizeClasses[size],
        variantClasses[variant],
        className ?? ''
      )}
      {...rest}
    />
  );
}

export default IconButton;
