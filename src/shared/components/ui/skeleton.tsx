import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'span';
}

export default function Skeleton({
  className = '',
  as: Component = 'div',
  ...props
}: SkeletonProps) {
  return (
    <Component
      {...props}
      aria-hidden="true"
      className={`rounded-control bg-skeleton motion-safe:animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
}
