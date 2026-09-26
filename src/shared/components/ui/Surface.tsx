import React from 'react';
import { classNames } from '@/shared/utils/classNames';

interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: 'base' | 'interactive' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const toneClasses: Record<NonNullable<SurfaceProps['tone']>, string> = {
  base: 'bg-surface border border-border',
  interactive: 'bg-surface border border-border hover:border-primary/50 transition-colors cursor-pointer',
  elevated: 'bg-surface-elevated border border-border shadow-elevated',
};

const paddingClasses: Record<NonNullable<SurfaceProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-6',
};

export function Surface({
  tone = 'base',
  padding = 'md',
  className,
  ...rest
}: SurfaceProps) {
  return (
    <div
      className={classNames('rounded-card', toneClasses[tone], paddingClasses[padding], className ?? '')}
      {...rest}
    />
  );
}

export default Surface;
