import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: string;
  variant?: 'default' | 'emerald' | 'amber' | 'rose' | 'sky';
  badge?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon: Icon,
  trend,
  variant = 'default',
  badge,
}) => {
  const variantStyles = {
    default: {
      border: 'border-slate-800 hover:border-slate-700',
      bg: 'bg-slate-900/70',
      iconColor: 'text-slate-400 bg-slate-800/80 border-slate-700',
      valueColor: 'text-slate-100',
    },
    emerald: {
      border: 'border-emerald-900/60 hover:border-emerald-800',
      bg: 'bg-emerald-950/20',
      iconColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/60',
      valueColor: 'text-emerald-300',
    },
    amber: {
      border: 'border-amber-900/60 hover:border-amber-800',
      bg: 'bg-amber-950/20',
      iconColor: 'text-amber-400 bg-amber-950/50 border-amber-800/60',
      valueColor: 'text-amber-300',
    },
    rose: {
      border: 'border-rose-900/60 hover:border-rose-800',
      bg: 'bg-rose-950/20',
      iconColor: 'text-rose-400 bg-rose-950/50 border-rose-800/60',
      valueColor: 'text-rose-300',
    },
    sky: {
      border: 'border-sky-900/60 hover:border-sky-800',
      bg: 'bg-sky-950/20',
      iconColor: 'text-sky-400 bg-sky-950/50 border-sky-800/60',
      valueColor: 'text-sky-300',
    },
  };

  const current = variantStyles[variant];

  return (
    <div
      className={`rounded-lg border p-4 transition-all duration-150 ${current.bg} ${current.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={`p-2 rounded-md border ${current.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <span className={`text-2xl font-bold font-mono tracking-tight ${current.valueColor}`}>
          {value}
        </span>
        {badge && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {badge}
          </span>
        )}
      </div>
      {(subValue || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs text-slate-400 font-mono">
          {trend && <span className="text-slate-300">{trend}</span>}
          {subValue && <span className="text-slate-500 text-[11px]">{subValue}</span>}
        </div>
      )}
    </div>
  );
};
