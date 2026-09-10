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
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CheckCircle2,
      defaultLabel: 'Verified',
    },
    WARNING: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: AlertTriangle,
      defaultLabel: 'Review',
    },
    FAIL: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: XCircle,
      defaultLabel: 'Failed',
    },
    INCONCLUSIVE: {
      bg: 'bg-slate-100 border-slate-200 text-slate-600',
      icon: HelpCircle,
      defaultLabel: 'Inconclusive',
    },
    NOT_CHECKED: {
      bg: 'bg-slate-100 border-slate-200 text-slate-500',
      icon: HelpCircle,
      defaultLabel: 'Not Checked',
    },
  };

  const current = configs[status] || configs.INCONCLUSIVE;
  const Icon = current.icon;
  const text = label || current.defaultLabel;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${current.bg}`}
    >
      {showIcon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{text}</span>
    </span>
  );
};
