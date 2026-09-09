import React from 'react';
import { ValidationStatus } from '../types';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from 'lucide-react';

interface ValidationStatusPillProps {
  status: ValidationStatus;
  label?: string;
  showIcon?: boolean;
}

export const ValidationStatusPill: React.FC<ValidationStatusPillProps> = ({
  status,
  label,
  showIcon = true,
}) => {
  const configs = {
    PASS: {
      bg: 'bg-emerald-950/50 border-emerald-800/80 text-emerald-400',
      icon: CheckCircle2,
      defaultLabel: 'PASS',
    },
    WARNING: {
      bg: 'bg-amber-950/50 border-amber-800/80 text-amber-400',
      icon: AlertTriangle,
      defaultLabel: 'WARNING',
    },
    FAIL: {
      bg: 'bg-rose-950/50 border-rose-800/80 text-rose-400',
      icon: XCircle,
      defaultLabel: 'FAIL',
    },
    INCONCLUSIVE: {
      bg: 'bg-slate-800 border-slate-700 text-slate-400',
      icon: HelpCircle,
      defaultLabel: 'INCONCLUSIVE',
    },
    NOT_CHECKED: {
      bg: 'bg-slate-900 border-slate-800 text-slate-500',
      icon: HelpCircle,
      defaultLabel: 'NOT CHECKED',
    },
  };

  const current = configs[status] || configs.INCONCLUSIVE;
  const Icon = current.icon;
  const text = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-semibold border ${current.bg}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
