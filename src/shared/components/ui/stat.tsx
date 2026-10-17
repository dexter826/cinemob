import { LucideIcon } from 'lucide-react';

interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

/**
 * Khối chỉ số editorial: số Anton lớn đặt thẳng trên nền, KHÔNG hộp —
 * các khối ngăn nhau bằng border-l của lưới cha (giống hero Dashboard).
 */
function Stat({ label, value, subValue, icon: Icon, colorClass }: StatProps) {
  return (
    <div className="flex items-start gap-4 md:border-l md:border-border md:first:border-l-0 md:pl-6 md:first:pl-0">
      <Icon aria-hidden="true" className={`mt-1 shrink-0 ${colorClass}`} size={20} strokeWidth={1.5} />
      <div className="min-w-0">
        <p className="text-text-secondary text-[11px] font-semibold tracking-[0.1em] mb-1.5">
          {label}
        </p>
        <p className="font-display tracking-wide text-5xl sm:text-6xl text-text-primary leading-none tabular-nums">
          {value}
        </p>
        {subValue && (
          <p className="text-[11px] font-semibold tracking-[0.08em] text-text-secondary mt-2 tabular-nums">
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}

export default Stat;
