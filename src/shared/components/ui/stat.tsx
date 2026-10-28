import type { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { classNames } from '@/shared/utils/class-names';

interface StatProps {
  label: string;
  value: ReactNode;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
  align?: 'left' | 'center';
  className?: string;
}

/** Khối chỉ số: KHÔNG hộp — ngăn nhau bằng border-l của lưới cha. */
function Stat({
  label,
  value,
  subValue,
  icon: Icon,
  colorClass,
  align = 'left',
  className,
}: StatProps) {
  const isCenter = align === 'center';

  return (
    <div
      className={classNames(
        'flex md:border-l md:border-border md:first:border-l-0 md:pl-6 md:first:pl-0',
        isCenter ? 'flex-col items-center text-center' : 'items-start gap-3 sm:gap-4',
        className,
      )}
    >
      {!isCenter && (
        <Icon
          aria-hidden="true"
          className={`mt-1 shrink-0 ${colorClass}`}
          size={20}
          strokeWidth={1.5}
        />
      )}

      <div className={isCenter ? 'w-full' : 'min-w-0'}>
        <div className={classNames('mb-1.5', isCenter && 'inline-flex items-center gap-2')}>
          {isCenter && (
            <Icon
              aria-hidden="true"
              className={classNames('shrink-0', colorClass)}
              size={18}
              strokeWidth={1.5}
            />
          )}
          <p className="text-label-caps text-text-secondary">{label}</p>
        </div>

        <p className="text-display-stat text-text-primary leading-none tabular-nums">{value}</p>

        {subValue && (
          <p className="text-label-caps normal-case text-text-secondary mt-2 tabular-nums">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export default Stat;
