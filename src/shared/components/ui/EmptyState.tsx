import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { classNames } from '@/shared/utils/classNames';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    /** Đích điều hướng: có thì render Link thay vì Button. */
    to?: string;
    onClick?: () => void;
  };
  compact?: boolean;
  className?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={classNames(
        'flex flex-col items-center justify-center px-4 text-center',
        compact ? 'py-8' : 'py-20',
        className,
      )}
    >
      {Icon && (
        <span
          aria-hidden="true"
          className="flex items-center justify-center mb-4 border border-border text-text-secondary bg-surface rounded-card w-14 h-14"
        >
          <Icon size={28} />
        </span>
      )}
      <h3 className="text-lg font-bold text-text-primary tracking-tight font-display text-balance">
        {title}
      </h3>
      <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed mt-1">
        {description}
      </p>
      {action &&
        (action.to ? (
          <Link
            to={action.to}
            className="inline-flex items-center justify-center font-semibold cursor-pointer transition bg-primary text-on-primary hover:bg-primary-hover border border-transparent px-4 py-2.5 text-sm gap-2 rounded-control"
          >
            {action.label}
          </Link>
        ) : (
          <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

export default EmptyState;
