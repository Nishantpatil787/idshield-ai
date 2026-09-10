import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  ChevronRight, 
  FileText,
  RotateCcw,
  SlidersHorizontal,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { ScreeningRecord, DocumentCategory, RiskLevel, ScreeningStatus } from '../types';
import { ScreeningService } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';

interface ScreeningHistoryPageProps {
  onViewScreening: (screeningId: string) => void;
  onNavigateToNew: () => void;
}

export const ScreeningHistoryPage: React.FC<ScreeningHistoryPageProps> = ({
  onViewScreening,
  onNavigateToNew,
}) => {
  const [screenings, setScreenings] = useState<ScreeningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'ALL'>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ScreeningStatus | 'ALL'>('ALL');

  const fetchScreenings = async () => {
    setLoading(true);
    try {
      const records = await ScreeningService.getScreenings({
        category: selectedCategory,
        riskLevel: selectedRisk,
        status: selectedStatus,
        searchQuery: searchQuery,
      });
      setScreenings(records);
    } catch (err) {
      console.error('Error fetching screening records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScreenings();
  }, [selectedCategory, selectedRisk, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchScreenings();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('ALL');
    setSelectedRisk('ALL');
    setSelectedStatus('ALL');
  };

  const handleExportCsv = () => {
    const headers = ['ScreeningID', 'Timestamp', 'Category', 'DocNumber', 'FullName', 'RiskLevel', 'RiskScore', 'Status'];
    const rows = screenings.map((s) => [
      s.screeningId,
      s.timestamp,
      s.document.category,
      s.document.documentNumber,
      `"${s.document.fullName}"`,
      s.riskAssessment.riskLevel,
      s.riskAssessment.riskScore,
      s.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `docshield_screening_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Reset local screening database to initial demo dataset?')) {
      await ScreeningService.resetToDemoDefaults();
      handleResetFilters();
      fetchScreenings();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Audit & Verification</span>
            <span>&gt;</span>
            <span className="text-blue-600">History Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Verification History Ledger
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential record of all analyzed credentials, risk assessments, and operator audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={screenings.length === 0}
            className="px-4 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleResetDemoData}
            className="px-3.5 py-2 rounded-full bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reload demo dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Holder Name, Doc Number, ID, or Category..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-8 py-2.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchScreenings();
                }}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Documents</option>
              <option value="passport">Passport</option>
              <option value="visa">Visa</option>
              <option value="national_id">National ID</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Risk:</span>
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk</option>
              <option value="MEDIUM">Medium / Needs Review</option>
              <option value="HIGH">High / Suspicious</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-blue-600 font-medium ml-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500">Loading ledger records...</p>
          </div>
        ) : screenings.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <div className="text-sm font-bold text-slate-800">No screening records found</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No verification entries match your filter criteria or no documents have been screened yet.
            </p>
            <button
              onClick={onNavigateToNew}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
            >
              Verify First Document →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-3.5">Screening ID</th>
                  <th className="px-6 py-3.5">Holder & Document</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Risk Level</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {screenings.map((rec) => (
                  <tr
                    key={rec.screeningId}
                    onClick={() => onViewScreening(rec.screeningId)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-slate-700 whitespace-nowrap">
                      {rec.screeningId}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {rec.document.fullName}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {rec.document.documentNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 uppercase font-semibold text-slate-600 text-[11px]">
                      {rec.document.category.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4">
                      <RiskBadge level={rec.riskAssessment.riskLevel} score={rec.riskAssessment.riskScore} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={rec.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {new Date(rec.timestamp).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                        <span>View</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
