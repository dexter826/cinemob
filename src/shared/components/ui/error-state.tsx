import { AlertCircle, type LucideIcon } from 'lucide-react';
import { Button } from './button';
import { classNames } from '@/shared/utils/class-names';

interface ErrorStateProps {
  icon?: LucideIcon | null;
  title: string;
  description: string;
  retry?: { label?: string; onClick: () => void };
  compact?: boolean;
  blocking?: boolean;
  className?: string;
}

export function ErrorState({
  icon: Icon = AlertCircle,
  title,
  description,
  retry,
  compact = false,
  blocking = false,
  className = '',
}: ErrorStateProps) {
  return (
    <div
      {...(blocking ? { role: 'alert' } : {})}
      className={classNames(
        'flex flex-col items-center justify-center px-4 text-center',
        compact ? 'py-8' : 'py-20',
        className,
      )}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className={classNames(
            'flex items-center justify-center border border-border text-danger bg-surface rounded-card',
            compact ? 'w-10 h-10 mb-3' : 'w-14 h-14 mb-4',
          )}
        >
          <Icon size={compact ? 20 : 28} />
        </span>
      )}
      <h3 className="text-title-md text-text-primary tracking-tight text-balance">{title}</h3>
      <p className="text-text-secondary text-body mb-6 max-w-xs leading-relaxed mt-1">
        {description}
      </p>
      {retry && (
        <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={retry.onClick}>
          {retry.label || 'Thử lại'}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
