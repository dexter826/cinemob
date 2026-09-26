import { Button } from './Button';
import { classNames } from '@/shared/utils/classNames';

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
  className = ''
}: ErrorStateProps) {
  return (
    <div
      {...(blocking ? { role: 'alert' } : {})}
      className={classNames(
        'flex flex-col items-center justify-center px-4 text-center',
        compact ? 'py-8' : 'py-20',
        className
      )}
    >
      <h3 className="text-lg font-bold text-text-primary tracking-tight font-display">
        {title}
      </h3>
      <p className="text-text-secondary text-sm mb-6 max-w-xs leading-relaxed mt-1">
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
