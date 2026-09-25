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
    <div className="bg-surface border border-border-default p-6 rounded-3xl flex items-center space-x-5 hover:border-primary/40 transition-colors duration-300 shadow-premium hover:shadow-premium-hover group">
      <div className={`p-4 rounded-2xl bg-black/5 border border-border-default transition-colors duration-300 ${colorClass}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-text-muted text-xs font-medium mb-1.5">{label}</p>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-none font-display tabular-nums">{value}</h3>
        {subValue && <p className="text-xs text-text-muted font-medium mt-2 opacity-80 tabular-nums">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
