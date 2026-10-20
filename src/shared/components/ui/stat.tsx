import { LucideIcon } from 'lucide-react';

interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

/** Khối chỉ số: KHÔNG hộp — ngăn nhau bằng border-l của lưới cha. */
function Stat({ label, value, subValue, icon: Icon, colorClass }: StatProps) {
  return (
    <div className="flex items-start gap-4 md:border-l md:border-border md:first:border-l-0 md:pl-6 md:first:pl-0">
      <Icon
        aria-hidden="true"
        className={`mt-1 shrink-0 ${colorClass}`}
        size={20}
        strokeWidth={1.5}
      />
      <div className="min-w-0">
        <p className="text-label-caps text-text-secondary mb-1.5">{label}</p>
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
