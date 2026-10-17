import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

/** Thẻ hiển thị chỉ số thống kê tổng quan. */
function StatsCard({ label, value, subValue, icon: Icon, colorClass }: StatsCardProps) {
  return (
    <div className="bg-surface border border-border p-6 rounded-dialog flex items-center space-x-5">
      <div
        aria-hidden="true"
        className={`p-4 rounded-card bg-black/5 dark:bg-white/5 border border-border ${colorClass}`}
      >
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-[0.1em] mb-1.5">
          {label}
        </p>
        <p className="font-display uppercase tracking-wide text-4xl sm:text-5xl text-text-primary leading-none tabular-nums">
          {value}
        </p>
        {subValue && (
          <p className="text-xs text-text-secondary font-medium mt-2 tabular-nums">{subValue}</p>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
