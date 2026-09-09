import React from 'react';
import { RiskLevel } from '../types';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  size = 'md',
}) => {
  const configs = {
    LOW: {
      bg: 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400',
      dot: 'bg-emerald-400',
      icon: ShieldCheck,
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-950/60 border-amber-800/80 text-amber-400',
      dot: 'bg-amber-400',
      icon: AlertTriangle,
      label: 'MEDIUM RISK',
    },
    HIGH: {
      bg: 'bg-rose-950/60 border-rose-800/80 text-rose-400',
      dot: 'bg-rose-400',
      icon: ShieldAlert,
      label: 'HIGH RISK',
    },
  };

  const current = configs[level] || configs.LOW;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-semibold',
    md: 'text-xs px-2.5 py-1 gap-2 font-bold tracking-wider',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-bold tracking-wider',
  };

  return (
    <span
      className={`inline-flex items-center rounded border font-mono uppercase whitespace-nowrap ${current.bg} ${sizeStyles[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="opacity-80 pl-1 font-mono text-[11px] font-normal border-l border-current/30 ml-1">
          {score}/100
        </span>
      )}
    </span>
  );
};
