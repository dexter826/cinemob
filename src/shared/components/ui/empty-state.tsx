import { LucideIcon } from 'lucide-react';
import { Button } from './button';
import { ButtonLink } from './button-link';
import { classNames } from '@/shared/utils/class-names';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
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
      <h3 className="text-title-md text-text-primary tracking-tight text-balance">{title}</h3>
      <p className="text-text-secondary text-body mb-6 max-w-xs leading-relaxed mt-1">
        {description}
      </p>
      {action &&
        (action.to ? (
          <ButtonLink to={action.to} variant="primary" size={compact ? 'sm' : 'md'}>
            {action.label}
          </ButtonLink>
        ) : (
          <Button variant="primary" size={compact ? 'sm' : 'md'} onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

export default EmptyState;
