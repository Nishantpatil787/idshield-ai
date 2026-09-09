import React, { useEffect, useState } from 'react';
import { 
  FileCheck, 
  ShieldAlert, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  Cpu,
  Activity,
  Server
} from 'lucide-react';
import { DashboardStats, ScreeningRecord } from '../types';
import { ScreeningService } from '../services/api';
import { StatCard } from '../components/StatCard';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { RiskDistributionChart } from '../components/RiskDistributionChart';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface DashboardPageProps {
  onNavigateToNewScreening: () => void;
  onViewScreening: (screeningId: string) => void;
  onNavigateToHistory: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToNewScreening,
  onViewScreening,
  onNavigateToHistory,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentScreenings, setRecentScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [fetchedStats, fetchedScreenings] = await Promise.all([
        ScreeningService.getDashboardStats(),
        ScreeningService.getScreenings(),
      ]);
      setStats(fetchedStats);
      setRecentScreenings(fetchedScreenings.slice(0, 6));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-white tracking-tight">
              OPERATIONAL SCREENING DASHBOARD
            </h1>
            <span className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
              ONLINE
            </span>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Real-time identity verification telemetry & document risk assessment overview
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono text-xs transition-colors"
            title="Refresh telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-400' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onNavigateToNewScreening}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-mono text-xs font-semibold shadow transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Screening</span>
          </button>
        </div>
      </div>

      {/* Prominent Prototype Notice */}
      <DisclaimerBanner />

      {/* Metrics Row (Total, Low, Med, High, Flagged) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <StatCard
          label="Total Screenings"
          value={stats?.totalScreenings ?? 0}
          subValue="Active Terminal Session"
          icon={FileCheck}
          variant="default"
          badge="ICAO 9303"
        />
        <StatCard
          label="Low Risk (Clear)"
          value={stats?.lowRiskCount ?? 0}
          subValue="Passed all security rules"
          icon={ShieldCheck}
          variant="emerald"
        />
        <StatCard
          label="Medium Risk (Review)"
          value={stats?.mediumRiskCount ?? 0}
          subValue="Requires secondary interview"
          icon={AlertTriangle}
          variant="amber"
        />
        <StatCard
          label="High Risk (Flagged)"
          value={stats?.highRiskCount ?? 0}
          subValue="Tampering or mismatch detected"
          icon={ShieldAlert}
          variant="rose"
        />
      </div>

      {/* Two Column Layout: Risk Distribution & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RiskDistributionChart
            lowCount={stats?.lowRiskCount ?? 0}
            medCount={stats?.mediumRiskCount ?? 0}
            highCount={stats?.highRiskCount ?? 0}
            totalCount={stats?.totalScreenings ?? 0}
          />
        </div>

        {/* System & AI Engine Health Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">
              Pipeline Subsystems
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400">
              <Activity className="w-3.5 h-3.5" />
              <span>NOMINAL</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                OCR & Text Extraction
              </span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                MRZ 7-3-1 Parity Check
              </span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                Tampering Analysis Model
              </span>
              <span className="text-amber-400 font-semibold">Ready (Proto)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-slate-400" />
                Avg Pipeline Latency
              </span>
              <span className="text-slate-200">1.4s</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Screenings Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wide">
              Recent Document Screenings
            </h2>
            <p className="text-[11px] font-mono text-slate-400">
              Latest processed identification credentials at this terminal
            </p>
          </div>

          <button
            onClick={onNavigateToHistory}
            className="flex items-center gap-1 text-xs font-mono text-sky-400 hover:text-sky-300 font-semibold transition-colors"
          >
            <span>View All Screening History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* High Information Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-2.5 px-4 font-semibold uppercase">Screening ID</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Document</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Holder Name</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Country</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Risk Score</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Status</th>
                <th className="py-2.5 px-4 font-semibold uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentScreenings.map((rec) => (
                <tr
                  key={rec.screeningId}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-4 text-sky-400 font-bold whitespace-nowrap">
                    {rec.screeningId}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="text-slate-200 font-medium">
                      {rec.document.documentNumber}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase">
                      {rec.document.category.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-semibold whitespace-nowrap">
                    {rec.document.fullName}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-slate-300">{rec.document.countryCode}</span>
                    <span className="text-[10px] text-slate-500 block">
                      {rec.document.nationality}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <RiskBadge
                      level={rec.riskAssessment.riskLevel}
                      score={rec.riskAssessment.riskScore}
                      size="sm"
                    />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={rec.status} />
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => onViewScreening(rec.screeningId)}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-900/60 hover:text-sky-300 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors"
                    >
                      Inspect Result
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
