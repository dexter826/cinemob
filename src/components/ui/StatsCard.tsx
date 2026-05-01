import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, subValue, icon: Icon, colorClass }) => {
  return (
    <div className="bg-surface border border-border-default p-4 sm:p-5 rounded-3xl flex items-center space-x-4 hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300 shadow-premium hover:shadow-premium-hover group">
      <div className={`p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border-default transition-all duration-300 ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-text-muted text-xs font-bold uppercase tracking-widest mb-1 opacity-60">{label}</p>
        <h3 className="text-3xl font-bold text-text-main tracking-tight">{value}</h3>
        {subValue && <p className="text-xs text-text-muted font-medium mt-1 opacity-80">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
