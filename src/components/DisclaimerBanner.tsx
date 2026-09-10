import React from 'react';
import { Info, Shield } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="bg-blue-50/70 border-b border-blue-100/80 text-slate-600 text-xs px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-blue-900 font-semibold text-[11px]">Academic Prototype</span>
          <span className="hidden sm:inline text-slate-500 text-[11px]">
            — For research and evaluation only. No connection to real government databases.
          </span>
        </div>
        <div className="text-[11px] text-slate-400 font-medium">
          Simulated Evaluation
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-slate-600 flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
        <Info className="w-4 h-4" />
      </div>
      <div className="flex-1">
        <span className="font-semibold text-slate-800 mr-1.5">Academic Prototype:</span>
        <span>
          DocShield analyzes identity documents for educational and demonstration purposes. This demonstration does not connect to real government databases.
        </span>
      </div>
    </div>
  );
};
