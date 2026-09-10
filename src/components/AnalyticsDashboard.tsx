import React from 'react';
import { 
  ShieldAlert, BarChart3, TrendingUp, AlertOctagon, CheckCircle2, 
  PieChart, Activity, Layers, Cpu, ShieldCheck 
} from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const fraudVectors = [
    { label: 'Date of Birth (DOB) Manipulation', percentage: 38, count: 482, color: 'bg-red-500' },
    { label: 'Facial Portrait Splicing / Substitution', percentage: 28, count: 355, color: 'bg-rose-500' },
    { label: 'Counterfeit Hologram / Seal Spoofing', percentage: 19, count: 241, color: 'bg-amber-500' },
    { label: 'QR Payload & Microprint Mismatch', percentage: 15, count: 190, color: 'bg-indigo-500' },
  ];

  const docDistribution = [
    { type: 'National IDs', share: 48, validRate: 92 },
    { type: 'Passports', share: 32, validRate: 88 },
    { type: 'Visas', share: 20, validRate: 81 },
  ];

  return (
    <div className="space-y-6">
      {/* Top High-level KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Total Verifications
          </span>
          <p className="text-3xl font-extrabold text-slate-100 font-mono">14,892</p>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold pt-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% this month</span>
          </div>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
            Detected Forgery Rate
          </span>
          <p className="text-3xl font-extrabold text-red-400 font-mono">8.6%</p>
          <span className="text-xs text-slate-400 block pt-1">1,268 forged documents stopped</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            AI Precision Accuracy
          </span>
          <p className="text-3xl font-extrabold text-emerald-400 font-mono">99.4%</p>
          <span className="text-xs text-slate-400 block pt-1">Benchmarked on SIH dataset</span>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-1">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            Avg Inference Latency
          </span>
          <p className="text-3xl font-extrabold text-blue-400 font-mono">420ms</p>
          <span className="text-xs text-slate-400 block pt-1">Sub-second real-time check</span>
        </div>
      </div>

      {/* Main Breakdown Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Tampering Vectors Card */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-5 h-5 text-red-400" />
              <h3 className="text-sm font-bold text-slate-100">Most Prevalent Tampering Vectors</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">SIH 2024 Audit</span>
          </div>

          <div className="space-y-4 pt-2">
            {fraudVectors.map((v) => (
              <div key={v.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-200">{v.label}</span>
                  <span className="font-mono text-slate-400">{v.percentage}% ({v.count} cases)</span>
                </div>
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800 p-0.5">
                  <div
                    className={`h-full rounded-full ${v.color}`}
                    style={{ width: `${v.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Document Type Distribution & Pass Rate */}
        <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-100">Document Volume & Pass Rates</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">By ID Authority</span>
          </div>

          <div className="space-y-4 pt-2">
            {docDistribution.map((doc) => (
              <div key={doc.type} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-200">{doc.type}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{doc.share}% of total scans</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-emerald-400 font-mono">{doc.validRate}%</span>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Genuine Rate</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
