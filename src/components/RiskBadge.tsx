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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      icon: ShieldCheck,
      label: 'Low Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Needs Review',
    },
    MODERATE: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      icon: AlertTriangle,
      label: 'Needs Review',
    },
    HIGH: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500',
      icon: ShieldAlert,
      label: 'Suspicious',
    },
  };

  const current = (configs as any)[level] || configs.LOW;
  const Icon = current.icon;

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 gap-1.5 font-medium rounded-full',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold rounded-full',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold rounded-full',
  };

  return (
    <span
      className={`inline-flex items-center border whitespace-nowrap shadow-xs ${current.bg} ${sizeStyles[size]}`}
    >
      {showIcon && <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{current.label}</span>
      {score !== undefined && (
        <span className="opacity-90 pl-1 text-[11px] font-medium border-l border-current/30 ml-1">
          {score}/100
        </span>
      )}
    </span>
  );
};
