import type { HTMLAttributes } from 'react';
export default function Skeleton({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`rounded-control bg-skeleton motion-safe:animate-pulse motion-reduce:animate-none ${className}`}
    />
  );
}
