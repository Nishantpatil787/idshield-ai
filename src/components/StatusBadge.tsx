import React from 'react';
import { ScreeningStatus } from '../types';
import { CheckCircle2, Clock, AlertOctagon, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ScreeningStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    COMPLETED: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      icon: CheckCircle2,
      label: 'Verified',
      iconColor: 'text-emerald-600',
    },
    PENDING: {
      bg: 'bg-blue-50 border-blue-200 text-blue-700',
      icon: Clock,
      label: 'Processing',
      iconColor: 'text-blue-600',
    },
    FLAGGED_FOR_REVIEW: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      icon: AlertOctagon,
      label: 'Needs Review',
      iconColor: 'text-amber-600',
    },
    REJECTED: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      icon: XCircle,
      label: 'Suspicious',
      iconColor: 'text-rose-600',
    },
  };

  const current = configs[status] || configs.COMPLETED;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-xs ${current.bg}`}
    >
      <Icon className={`w-3.5 h-3.5 ${current.iconColor}`} />
      <span>{current.label}</span>
    </span>
  );
};
