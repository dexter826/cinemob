import React from 'react';
import { Link } from 'react-router-dom';
import { classNames } from '@/shared/utils/class-names';
import { sizeClasses, variantClasses, type ButtonSize, type ButtonVariant } from './button';

interface ButtonLinkProps extends Omit<React.ComponentProps<typeof Link>, 'className'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** Link điều hướng nhưng mang đúng style của Button — dùng khi hành động là chuyển trang. */
export function ButtonLink({
  variant = 'primary',
  size = 'md',
  leadingIcon,
  trailingIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      className={classNames(
        'inline-flex items-center justify-center font-semibold cursor-pointer',
        'transition',
        'focus-ring focus-visible:outline-none',
        variantClasses[variant],
        sizeClasses[size],
        className ?? '',
      )}
      {...rest}
    >
      {leadingIcon && (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {leadingIcon}
        </span>
      )}
      <span className="truncate">{children}</span>
      {trailingIcon && (
        <span aria-hidden="true" className="inline-flex shrink-0">
          {trailingIcon}
        </span>
      )}
    </Link>
  );
}

export default ButtonLink;
