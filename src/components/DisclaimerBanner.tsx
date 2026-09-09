import React from 'react';
import { AlertCircle, Shield, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-slate-900/90 border-b border-slate-800 text-slate-400 text-xs px-4 py-1.5 flex items-center justify-between font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-300 font-semibold uppercase tracking-wider">Academic Prototype Mode</span>
          <span className="hidden md:inline text-slate-400">| Demonstration & screening workflow evaluation only. No connection to real government databases.</span>
        </div>
        <div className="text-[11px] text-slate-500">
          v0.1.0-alpha • Synthetic Data
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 flex items-start gap-3 shadow-inner">
      <div className="p-1.5 rounded bg-amber-950/60 border border-amber-800/80 text-amber-400 flex-shrink-0 mt-0.5">
        <AlertCircle className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300 uppercase font-mono tracking-wider text-[11px]">
            Security Notice & Regulatory Disclaimer
          </span>
          <span className="bg-slate-800 text-slate-400 text-[10px] px-1.5 py-0.5 rounded font-mono">
            NON-OFFICIAL SYSTEM
          </span>
        </div>
        <p className="text-slate-400 leading-relaxed text-[12px]">
          IDShield AI is an academic and technical prototype designed to assist authorized personnel with identity and travel-document screening workflows. This software <strong className="text-slate-200">does not claim official government authentication</strong>, does not query live restricted border databases, and placeholder risk metrics are simulated for evaluation and development purposes.
        </p>
      </div>
    </div>
  );
};
