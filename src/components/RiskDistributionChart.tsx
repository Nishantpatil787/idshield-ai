import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface RiskDistributionProps {
  lowCount: number;
  medCount: number;
  highCount: number;
  totalCount: number;
}

export const RiskDistributionChart: React.FC<RiskDistributionProps> = ({
  lowCount,
  medCount,
  highCount,
  totalCount,
}) => {
  const safeTotal = totalCount > 0 ? totalCount : 1;
  const lowPct = Math.round((lowCount / safeTotal) * 100);
  const medPct = Math.round((medCount / safeTotal) * 100);
  const highPct = Math.max(0, 100 - lowPct - medPct);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          Screening Risk Spectrum Distribution
        </h3>
        <span className="text-[11px] font-mono text-slate-500">
          N = {totalCount} Records
        </span>
      </div>

      {/* Segmented Progress Bar */}
      <div className="h-3 w-full bg-slate-950 rounded overflow-hidden flex border border-slate-800 p-0.5 gap-0.5">
        {lowPct > 0 && (
          <div
            style={{ width: `${lowPct}%` }}
            className="h-full bg-emerald-500 rounded-sm transition-all duration-300"
            title={`Low Risk: ${lowCount} (${lowPct}%)`}
          />
        )}
        {medPct > 0 && (
          <div
            style={{ width: `${medPct}%` }}
            className="h-full bg-amber-500 rounded-sm transition-all duration-300"
            title={`Medium Risk: ${medCount} (${medPct}%)`}
          />
        )}
        {highPct > 0 && (
          <div
            style={{ width: `${highPct}%` }}
            className="h-full bg-rose-500 rounded-sm transition-all duration-300"
            title={`High Risk: ${highCount} (${highPct}%)`}
          />
        )}
      </div>

      {/* Breakdown Legend */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-mono text-slate-300">LOW</span>
          </div>
          <span className="font-mono text-xs font-bold text-emerald-400">
            {lowCount} <span className="text-slate-500 font-normal text-[10px]">({lowPct}%)</span>
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-[11px] font-mono text-slate-300">MED</span>
          </div>
          <span className="font-mono text-xs font-bold text-amber-400">
            {medCount} <span className="text-slate-500 font-normal text-[10px]">({medPct}%)</span>
          </span>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded p-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span className="text-[11px] font-mono text-slate-300">HIGH</span>
          </div>
          <span className="font-mono text-xs font-bold text-rose-400">
            {highCount} <span className="text-slate-500 font-normal text-[10px]">({highPct}%)</span>
          </span>
        </div>
      </div>
    </div>
  );
};
