import type { ReactNode } from 'react';
export default function LoadingStatus({
  children,
  className = 'sr-only',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div role="status" aria-live="polite" aria-atomic="true" className={className}>
      {children}
    </div>
  );
}
