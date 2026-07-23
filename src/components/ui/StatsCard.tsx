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
    <div className="bg-surface/50 backdrop-blur-md border border-border-default p-6 rounded-3xl flex items-center space-x-5 hover:bg-surface/80 transition-colors duration-300 shadow-premium hover:shadow-premium-hover group hover:ring-1 hover:ring-primary/20">
      <div className={`p-4 rounded-2xl bg-black/5 border border-border-default transition-colors duration-300 ${colorClass}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-text-muted text-[10px] font-bold uppercase tracking-wider mb-1 opacity-60">{label}</p>
        <h3 className="text-3xl sm:text-4xl font-extrabold text-text-main tracking-tight leading-none">{value}</h3>
        {subValue && <p className="text-xs text-text-muted font-medium mt-2 opacity-80">{subValue}</p>}
      </div>
    </div>
  );
};

export default StatsCard;
