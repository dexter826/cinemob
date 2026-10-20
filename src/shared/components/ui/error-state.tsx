import { Button } from './button';
import { classNames } from '@/shared/utils/class-names';

interface ErrorStateProps {
  title: string;
  description: string;
  retry?: { label: string; onClick: () => void };
  compact?: boolean;
  blocking?: boolean;
  className?: string;
}

export function ErrorState({
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
      <h3 className="text-title-md text-text-primary tracking-tight text-balance">{title}</h3>
      <p className="text-text-secondary text-body mb-6 max-w-xs leading-relaxed mt-1">
        {description}
      </p>
      {retry && (
        <Button variant="secondary" size={compact ? 'sm' : 'md'} onClick={retry.onClick}>
          {retry.label}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
