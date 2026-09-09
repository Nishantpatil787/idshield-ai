import React from 'react';
import { ScreeningStatus } from '../types';
import { CheckCircle2, Clock, AlertOctagon, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: ScreeningStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const configs = {
    COMPLETED: {
      bg: 'bg-slate-900 border-slate-700 text-slate-300',
      icon: CheckCircle2,
      label: 'COMPLETED',
      iconColor: 'text-emerald-400',
    },
    PENDING: {
      bg: 'bg-slate-900 border-slate-700 text-slate-300',
      icon: Clock,
      label: 'PENDING',
      iconColor: 'text-sky-400',
    },
    FLAGGED_FOR_REVIEW: {
      bg: 'bg-amber-950/40 border-amber-800 text-amber-300',
      icon: AlertOctagon,
      label: 'FLAGGED',
      iconColor: 'text-amber-400',
    },
    REJECTED: {
      bg: 'bg-rose-950/40 border-rose-800 text-rose-300',
      icon: XCircle,
      label: 'REJECTED',
      iconColor: 'text-rose-400',
    },
  };

  const current = configs[status] || configs.COMPLETED;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-medium border ${current.bg}`}
    >
      <Icon className={`w-3.5 h-3.5 ${current.iconColor}`} />
      <span>{current.label}</span>
    </span>
  );
};
