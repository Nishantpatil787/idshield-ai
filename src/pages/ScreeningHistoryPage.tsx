import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowUpDown, 
  Calendar, 
  ChevronRight, 
  FileText,
  RotateCcw,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { ScreeningRecord, DocumentCategory, RiskLevel, ScreeningStatus } from '../types';
import { ScreeningService } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

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
    const headers = ['ScreeningID', 'Timestamp', 'Category', 'DocNumber', 'FullName', 'Country', 'RiskLevel', 'RiskScore', 'Status', 'SuppDocsCount', 'CrossDocStatus'];
    const rows = screenings.map((s) => [
      s.screeningId,
      s.timestamp,
      s.document.category,
      s.document.documentNumber,
      `"${s.document.fullName}"`,
      s.document.countryCode,
      s.riskAssessment.riskLevel,
      s.riskAssessment.riskScore,
      s.status,
      s.supportingDocuments ? s.supportingDocuments.length : 0,
      s.crossDocumentData ? s.crossDocumentData.overall_status : 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `idshield_screening_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="space-y-6 font-mono">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>SCREENING HISTORY & AUDIT LEDGER</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              AUDIT LOGS
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete sequential record of all processed credentials, risk outcomes, and operator reviews.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            disabled={screenings.length === 0}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleResetDemoData}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reload initial demo dataset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo Data</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-4 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Holder Name, Doc Number, ID, or Country..."
              className="w-full bg-slate-950 border border-slate-800 rounded pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  fetchScreenings();
                }}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-bold transition-colors"
          >
            Filter
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Category:</span>
            {(['ALL', 'passport', 'visa', 'national_id', 'driving_licence', 'permit'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedCategory === cat
                    ? 'bg-sky-950 text-sky-300 border border-sky-800 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {cat === 'ALL' ? 'All Types' : cat.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-semibold uppercase">Risk:</span>
            {(['ALL', 'LOW', 'MEDIUM', 'HIGH'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedRisk(lvl)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  selectedRisk === lvl
                    ? 'bg-slate-800 text-slate-100 border border-slate-600 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-[11px] border-b border-slate-800">
                <th className="py-2.5 px-4 font-semibold uppercase">Screening ID</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Timestamp</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Document</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Holder Name</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Country</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Risk Level</th>
                <th className="py-2.5 px-4 font-semibold uppercase">Status</th>
                <th className="py-2.5 px-4 font-semibold uppercase text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="inline-block w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading screening records...</p>
                  </td>
                </tr>
              ) : screenings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 mx-auto opacity-30 mb-2" />
                    <p className="font-semibold text-slate-300 text-sm">No screening records matched your filters.</p>
                    <button
                      onClick={handleResetFilters}
                      className="mt-2 text-xs text-sky-400 hover:underline"
                    >
                      Clear all search & risk filters
                    </button>
                  </td>
                </tr>
              ) : (
                screenings.map((rec) => (
                  <tr
                    key={rec.screeningId}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 text-sky-400 font-bold whitespace-nowrap">
                      {rec.screeningId}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(rec.timestamp).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-200 font-semibold flex items-center gap-1.5">
                        <span>{rec.document.documentNumber}</span>
                        {rec.supportingDocuments && rec.supportingDocuments.length > 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                            +{rec.supportingDocuments.length} SUPP
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 uppercase flex items-center gap-1.5">
                        <span>{rec.document.categoryLabel}</span>
                        {rec.crossDocumentData && (
                          <span
                            className={`text-[9px] px-1 py-0.2 rounded font-mono font-bold ${
                              rec.crossDocumentData.overall_status === 'CONSISTENT'
                                ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800'
                                : 'text-amber-400 bg-amber-950/80 border border-amber-800'
                            }`}
                          >
                            {rec.crossDocumentData.overall_status === 'CONSISTENT' ? 'PARITY OK' : 'X-DOC REVIEW'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-semibold whitespace-nowrap">
                      {rec.document.fullName}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-slate-300">{rec.document.countryCode}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
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
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-sky-900/60 hover:text-sky-300 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors inline-flex items-center gap-1"
                      >
                        <span>Inspect</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Count Footer */}
        <div className="p-3 bg-slate-950 text-slate-500 text-[11px] border-t border-slate-800 flex items-center justify-between">
          <span>Displaying {screenings.length} total records</span>
          <span>Station: TERM-3-SEC-A</span>
        </div>
      </div>
    </div>
  );
};
