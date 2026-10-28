import React from 'react';
import { ArrowLeft, LucideIcon } from 'lucide-react';
import { IconButton } from './icon-button';
import Skeleton from './skeleton';

interface PageHeaderProps {
  title: string;
  description?: string;
  loading?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  leading?: React.ReactNode;
  className?: string;
  /** @deprecated Use `leading` instead. Rendered as an unboxed icon for migration. Remove in Task 23. */
  icon?: LucideIcon;
  /** @deprecated Use `actions` instead. Remove in Task 23. */
  children?: React.ReactNode;
}

function PageHeader({
  title,
  description,
  loading = false,
  onBack,
  actions,
  leading,
  className = '',
  icon: LegacyIcon,
  children,
}: PageHeaderProps) {
  const resolvedActions = actions ?? children;
  const resolvedLeading =
    leading ??
    (LegacyIcon ? (
      <LegacyIcon className="text-primary w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
    ) : undefined);
  return (
    <div
      className={`flex items-center justify-between gap-3 sm:gap-6 pb-5 border-b border-border ${className}`}
    >
      <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
        {onBack && (
          <IconButton label="Quay lại trang trước" onClick={onBack} variant="secondary" size="md">
            <ArrowLeft size={20} strokeWidth={1.5} aria-hidden="true" />
          </IconButton>
        )}
        {resolvedLeading && <span className="shrink-0 mt-0.5 inline-flex">{resolvedLeading}</span>}
        <div className="min-w-0">
          {loading ? (
            <>
              <h1 className="sr-only">{title}</h1>
              <Skeleton className="h-9 w-56 max-w-full" />
              <Skeleton className="mt-1.5 h-4 w-40 max-w-full" />
            </>
          ) : (
            <>
              <h1 className="text-display-lg text-text-primary truncate">{title}</h1>
              {description && (
                <p className="text-body-sm sm:text-body text-text-secondary font-medium line-clamp-2 mt-0.5">
                  {description}
                </p>
              )}
            </>
          )}
        </div>
      </div>
      {resolvedActions && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">{resolvedActions}</div>
      )}
    </div>
  );
}

export default PageHeader;
