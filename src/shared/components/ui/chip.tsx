import React from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/shared/utils/class-names';

export type ChipTone = 'gold' | 'success' | 'neutral' | 'muted';

interface ChipProps {
  tone?: ChipTone;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  onRemove?: () => void;
  onClick?: () => void;
  removeAriaLabel?: string;
}

const toneClasses: Record<ChipTone, string> = {
  gold: 'bg-primary text-on-primary',
  success: 'bg-success text-on-success',
  neutral: 'bg-black/60 text-white border border-white/10',
  muted: 'bg-surface-elevated border border-border text-text-secondary',
};

function Chip({
  tone = 'neutral',
  icon,
  children,
  className,
  onRemove,
  onClick,
  removeAriaLabel,
}: ChipProps) {
  const textLabel = typeof children === 'string' ? children : '';
  const removeLabel = removeAriaLabel || (textLabel ? `Gỡ ${textLabel}` : 'Gỡ');

  if (onClick && onRemove) {
    return (
      <span
        className={classNames(
          'inline-flex items-stretch rounded-poster text-micro-caps font-bold transition-colors select-none whitespace-nowrap border',
          toneClasses[tone],
          className ?? '',
        )}
      >
        <button
          type="button"
          onClick={onClick}
          className="inline-flex items-center gap-1 pl-2 pr-1 py-0.5 cursor-pointer focus-ring focus-visible:outline-none"
        >
          {icon}
          <span>{children}</span>
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          className="px-1 py-0.5 hover:text-primary transition-colors cursor-pointer focus-ring focus-visible:outline-none text-text-muted hover:text-text-primary"
        >
          <X size={10} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </span>
    );
  }

  if (onRemove) {
    return (
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className={classNames(
          'group inline-flex items-center gap-1 px-2 py-1 rounded-poster text-micro-caps font-bold transition-colors cursor-pointer select-none whitespace-nowrap',
          'focus-ring focus-visible:outline-none hover:text-text-primary hover:border-primary/40',
          toneClasses[tone],
          className ?? '',
        )}
      >
        {icon}
        <span>{children}</span>
        <X
          size={10}
          strokeWidth={1.5}
          aria-hidden="true"
          className="text-text-muted group-hover:text-primary transition-colors shrink-0"
        />
      </button>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={classNames(
          'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-micro-caps whitespace-nowrap transition-colors cursor-pointer select-none',
          'focus-ring focus-visible:outline-none',
          toneClasses[tone],
          className ?? '',
        )}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <span
      className={classNames(
        'inline-flex items-center gap-1 px-1.5 py-0.5 rounded-poster text-micro-caps whitespace-nowrap select-none',
        toneClasses[tone],
        className ?? '',
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export default Chip;
