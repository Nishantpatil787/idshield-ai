import React, { useState } from 'react';
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  UserCheck, 
  Fingerprint, 
  Scan, 
  Printer, 
  Share2, 
  Download, 
  Eye, 
  Sparkles, 
  Lock, 
  Cpu, 
  Layers, 
  AlertOctagon,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  FileCheck,
  Info,
  SlidersHorizontal,
  CheckSquare,
  Split,
  Plus,
  ArrowRight
} from 'lucide-react';
import { ScreeningRecord } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ValidationStatusPill } from '../components/ValidationStatusPill';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface ScreeningResultPageProps {
  screening: ScreeningRecord | null;
  onNavigateToNew: () => void;
  onNavigateToHistory: () => void;
}

export const ScreeningResultPage: React.FC<ScreeningResultPageProps> = ({
  screening,
  onNavigateToNew,
  onNavigateToHistory,
}) => {
  const [copiedMrz, setCopiedMrz] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'validation' | 'consistency' | 'tampering' | 'biometrics' | 'risk'>('all');
  const [expandedRuleIds, setExpandedRuleIds] = useState<Record<string, boolean>>({});
  const [ruleFilter, setRuleFilter] = useState<'all' | 'issues' | 'pass'>('all');
  const [crossDocFilter, setCrossDocFilter] = useState<'all' | 'issues' | 'match'>('all');

  const toggleRuleExpand = (id: string) => {
    setExpandedRuleIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!screening) {
    return (
      <div className="text-center py-16 space-y-4 max-w-md mx-auto font-mono">
        <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <Scan className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-bold text-slate-200 uppercase">No Screening Record Selected</h2>
        <p className="text-xs text-slate-400">
          Select a record from the history ledger or intake a new document for screening analysis.
        </p>
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={onNavigateToNew}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold"
          >
            New Screening
          </button>
          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs font-semibold"
          >
            Browse History
          </button>
        </div>
      </div>
    );
  }

  const { document, validation, tampering, faceVerification, riskAssessment, crossDocumentData, supportingDocuments } = screening;

  const handleCopyMrz = () => {
    if (document.mrzCode) {
      navigator.clipboard.writeText(document.mrzCode);
      setCopiedMrz(true);
      setTimeout(() => setCopiedMrz(false), 2000);
    }
  };

  const actionButtonStyles = {
    CLEAR: 'bg-emerald-950/80 border-emerald-700 text-emerald-300',
    SECONDARY_INTERVIEW: 'bg-amber-950/80 border-amber-700 text-amber-300',
    PHYSICAL_INSPECTION: 'bg-amber-950/80 border-amber-700 text-amber-300',
    DENY_ENTRY: 'bg-rose-950/80 border-rose-700 text-rose-300',
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto font-mono">
      {/* Top Header Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-lg font-bold text-white tracking-tight">
                {screening.screeningId}
              </span>
              <RiskBadge
                level={riskAssessment.riskLevel}
                score={riskAssessment.riskScore}
                size="md"
              />
              <StatusBadge status={screening.status} />
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                PROTOTYPE EVALUATION RECORD
              </span>
              {supportingDocuments && supportingDocuments.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800 font-bold">
                  MULTI-DOC ({supportingDocuments.length + 1} CREDENTIALS)
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span>Timestamp: {new Date(screening.timestamp).toUTCString()}</span>
              <span>•</span>
              <span>Station: {screening.stationId}</span>
              <span>•</span>
              <span>Operator: {screening.operatorId}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>
            <button
              onClick={onNavigateToNew}
              className="px-3.5 py-1.5 rounded bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Next Intake
            </button>
          </div>
        </div>

        {/* Recommended Action Pill */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded border border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold uppercase text-[11px]">Recommended Decision:</span>
            <span className={`px-2.5 py-0.5 rounded border font-bold text-xs ${actionButtonStyles[riskAssessment.recommendedAction]}`}>
              {riskAssessment.recommendedAction.replace('_', ' ')}
            </span>
          </div>
          <div className="text-slate-300 text-xs truncate max-w-xl">
            {riskAssessment.primaryRiskSummary}
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'all'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          All Diagnostic Modules
        </button>
        <button
          onClick={() => setActiveTab('validation')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'validation'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>1. Validation Engine</span>
          {screening.validationData && screening.validationData.warnings + screening.validationData.failed > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
              {screening.validationData.warnings + screening.validationData.failed}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('consistency')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'consistency'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <span>2. Cross-Doc Consistency</span>
          {crossDocumentData && crossDocumentData.overall_status === 'REVIEW_REQUIRED' && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
              {crossDocumentData.summary.mismatches + crossDocumentData.summary.review_required}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tampering')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'tampering'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          3. Tampering Analysis
        </button>
        <button
          onClick={() => setActiveTab('biometrics')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'biometrics'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          4. Biometrics
        </button>
        <button
          onClick={() => setActiveTab('risk')}
          className={`px-3 py-1.5 rounded-t text-xs font-bold transition-colors whitespace-nowrap ${
            activeTab === 'risk'
              ? 'bg-slate-800 text-sky-400 border-b-2 border-sky-400'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          5. Explainable Risk
        </button>
      </div>

      {/* Grid: Left Column (Document Preview & Extracted OCR), Right Column (Diagnostic Modules) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Document & Visual Overview (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Primary Document Graphic Container */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-sky-400" />
                <span>Primary Document Specimen</span>
              </span>
              <span className="text-[10px] text-sky-400 font-bold uppercase">{document.categoryLabel}</span>
            </div>

            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/10] flex items-center justify-center group">
              {document.imageUrl ? (
                <img
                  src={document.imageUrl}
                  alt={document.categoryLabel}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-slate-500 text-xs flex flex-col items-center gap-2">
                  <Scan className="w-8 h-8 opacity-40" />
                  <span>Specimen image rendered</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-slate-900/90 text-slate-300 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                PROTOTYPE SPECIMEN
              </div>
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
              <span>File: {document.rawUploadedFileName || 'credential_scan.png'}</span>
              <span>{(document.fileSizeBytes ? (document.fileSizeBytes / 1024).toFixed(0) : 1840)} KB</span>
            </div>
          </div>

          {/* Primary Extracted Fields Table */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-sky-400" />
                <span>OCR Extracted Metadata</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold">ICAO / VIZ</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Full Name</span>
                <span className="text-slate-100 font-bold">{document.fullName}</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Document Number</span>
                <span className="text-sky-300 font-bold">{document.documentNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Nationality</span>
                  <span className="text-slate-200 font-semibold text-xs">{document.nationality} ({document.countryCode})</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Date of Birth</span>
                  <span className="text-slate-200 font-semibold text-xs">{document.dateOfBirth}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Expiry Date</span>
                  <span className="text-slate-200 font-semibold text-xs">{document.expiryDate}</span>
                </div>
                <div className="bg-slate-950 p-2 rounded border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Issuing Authority</span>
                  <span className="text-slate-200 font-semibold text-xs truncate">{document.issuingAuthority || 'GOVERNMENT AGENCY'}</span>
                </div>
              </div>
            </div>

            {/* Machine Readable Zone (MRZ) Section */}
            {document.mrzCode && (
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">
                    Machine Readable Zone (MRZ)
                  </span>
                  <button
                    onClick={handleCopyMrz}
                    className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1"
                  >
                    {copiedMrz ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedMrz ? 'Copied' : 'Copy MRZ'}</span>
                  </button>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded p-2.5 text-[11px] text-slate-300 font-mono leading-relaxed whitespace-pre-wrap tracking-wider overflow-x-auto select-all">
                  {document.mrzCode}
                </div>
              </div>
            )}
          </div>

          {/* Supporting Credentials Gallery */}
          {supportingDocuments && supportingDocuments.length > 0 && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>Supporting Credentials ({supportingDocuments.length})</span>
                </span>
                <span className="text-[10px] text-sky-400 font-semibold">CROSS-CHECKED</span>
              </div>

              <div className="space-y-3">
                {supportingDocuments.map((supp, idx) => (
                  <div
                    key={supp.id}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-sky-950 text-sky-300 border border-sky-800 uppercase">
                          {supp.category}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{supp.documentNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {supp.categoryLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Bearer Name</span>
                        <span className="text-slate-200 font-semibold text-xs truncate block">{supp.fullName}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Passport Linkage</span>
                        <span className="text-sky-300 font-semibold text-xs truncate block">
                          {supp.associatedPassportNumber || 'None'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Date of Birth</span>
                        <span className="text-slate-200 font-semibold text-xs">{supp.dateOfBirth || 'N/A'}</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">Expiry Date</span>
                        <span className="text-slate-200 font-semibold text-xs">{supp.expiryDate || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Diagnostic Modules (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Document Validation Engine */}
          {(activeTab === 'all' || activeTab === 'validation') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3.5">
              {/* Header with Overall Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
                    <span>1. Deterministic Document Validation Engine</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Rules-based structural, chronological, checksum, and cross-consistency evaluation.
                  </p>
                </div>

                {screening.validationData ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                        screening.validationData.overall_status === 'VALID'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : screening.validationData.overall_status === 'WARNING'
                          ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                          : screening.validationData.overall_status === 'INVALID'
                          ? 'bg-rose-950/80 border-rose-700 text-rose-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      STATUS: {screening.validationData.overall_status}
                    </span>
                  </div>
                ) : (
                  <ValidationStatusPill
                    status={validation.overallValid ? 'PASS' : 'WARNING'}
                    label={validation.overallValid ? 'ALL CHECKS PASSED' : 'DISCREPANCY DETECTED'}
                  />
                )}
              </div>

              {/* Validation Metrics Summary Row */}
              {screening.validationData && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Passed</span>
                      <span className="text-xs font-bold text-emerald-400">{screening.validationData.passed}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Warnings</span>
                      <span className={`text-xs font-bold ${screening.validationData.warnings > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {screening.validationData.warnings}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Failed</span>
                      <span className={`text-xs font-bold ${screening.validationData.failed > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {screening.validationData.failed}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Total Rules</span>
                      <span className="text-xs font-bold text-sky-400">{screening.validationData.total_rules}</span>
                    </div>
                  </div>

                  {/* Human-Readable Summary Box */}
                  <div className="p-2.5 rounded bg-slate-950/80 border border-slate-800/80 text-xs flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-sky-400 flex-shrink-0 mt-0.5" />
                    <div className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      <span className="font-semibold text-white font-mono uppercase text-[10px] mr-1.5">[Summary]</span>
                      {screening.validationData.summary}
                    </div>
                  </div>
                </div>
              )}

              {/* Rules Filter Bar & Detailed Rule List */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-1.5">
                  <span className="text-[11px] font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                    <span>Evaluated Validation Rules</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setRuleFilter('all')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        ruleFilter === 'all'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      All ({screening.validationData?.results.length ?? validation.items.length})
                    </button>
                    <button
                      onClick={() => setRuleFilter('issues')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        ruleFilter === 'issues'
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Issues ({screening.validationData ? screening.validationData.warnings + screening.validationData.failed : 0})
                    </button>
                    <button
                      onClick={() => setRuleFilter('pass')}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                        ruleFilter === 'pass'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Passed ({screening.validationData?.passed ?? 0})
                    </button>
                  </div>
                </div>

                {/* Dynamic Rules Listing */}
                {screening.validationData ? (
                  <div className="space-y-2">
                    {screening.validationData.results
                      .filter((r) => {
                        if (ruleFilter === 'issues') return r.status === 'FAIL' || r.status === 'WARNING';
                        if (ruleFilter === 'pass') return r.status === 'PASS';
                        return true;
                      })
                      .map((rule) => {
                        const isExpanded = expandedRuleIds[rule.rule_id];
                        const severityStyles = {
                          HIGH: 'bg-rose-950/60 text-rose-300 border-rose-800',
                          MEDIUM: 'bg-amber-950/60 text-amber-300 border-amber-800',
                          LOW: 'bg-blue-950/60 text-blue-300 border-blue-800',
                          INFO: 'bg-slate-800/80 text-slate-400 border-slate-700',
                        };

                        return (
                          <div
                            key={rule.rule_id}
                            className="rounded bg-slate-950/80 border border-slate-800/80 transition-colors"
                          >
                            <div
                              onClick={() => toggleRuleExpand(rule.rule_id)}
                              className="p-2.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-900/50 select-none"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-slate-200 text-xs">
                                    {rule.rule_id.replace(/_/g, ' ').toUpperCase()}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                    cat: {rule.category}
                                  </span>
                                  {rule.severity && rule.severity !== 'INFO' && (
                                    <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-semibold ${severityStyles[rule.severity]}`}>
                                      {rule.severity} SEVERITY
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-300 font-sans leading-relaxed">
                                  {rule.message}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <ValidationStatusPill status={rule.status} />
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            </div>

                            {/* Expandable Evidence Inspector */}
                            {isExpanded && (
                              <div className="px-3 pb-3 pt-1 border-t border-slate-800/60 bg-slate-900/30 text-[11px] space-y-1.5">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                  Rule Evidence & Technical Details:
                                </span>
                                <pre className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[10px] overflow-x-auto leading-relaxed">
                                  {typeof rule.evidence === 'string'
                                    ? rule.evidence
                                    : JSON.stringify(rule.evidence, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  /* Fallback for legacy records */
                  <div className="space-y-1.5">
                    {validation.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-200 text-xs">{item.title}</div>
                          <div className="text-[11px] text-slate-400 leading-snug">{item.detail}</div>
                        </div>
                        <ValidationStatusPill status={item.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ICAO 9303 Checksum Breakdown Table */}
              {screening.mrzData?.checksumValidation && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>ICAO 9303 (7-3-1) Check Digit Verification</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Format: {screening.mrzData.format || 'TD3'} (44 Chars)
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded border border-slate-800/80 bg-slate-950">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="px-2.5 py-1.5">Checked Field</th>
                          <th className="px-2.5 py-1.5 text-center">Actual In MRZ</th>
                          <th className="px-2.5 py-1.5 text-center">Calculated (7-3-1)</th>
                          <th className="px-2.5 py-1.5 text-right">Parity Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        <tr>
                          <td className="px-2.5 py-1.5 text-slate-300 font-medium">Passport / Doc Number</td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.passportNumber.actual}
                          </td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.passportNumber.expected}
                          </td>
                          <td className="px-2.5 py-1.5 text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                screening.mrzData.checksumValidation.passport_number
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {screening.mrzData.checksumValidation.passport_number ? 'VALID' : 'INVALID'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 text-slate-300 font-medium">Date of Birth</td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.dateOfBirth.actual}
                          </td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.dateOfBirth.expected}
                          </td>
                          <td className="px-2.5 py-1.5 text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                screening.mrzData.checksumValidation.date_of_birth
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {screening.mrzData.checksumValidation.date_of_birth ? 'VALID' : 'INVALID'}
                            </span>
                          </td>
                        </tr>
                        <tr>
                          <td className="px-2.5 py-1.5 text-slate-300 font-medium">Date of Expiry</td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.dateOfExpiry.actual}
                          </td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                            {screening.mrzData.checksumValidation.details.dateOfExpiry.expected}
                          </td>
                          <td className="px-2.5 py-1.5 text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                screening.mrzData.checksumValidation.expiry_date
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {screening.mrzData.checksumValidation.expiry_date ? 'VALID' : 'INVALID'}
                            </span>
                          </td>
                        </tr>
                        {screening.mrzData.checksumValidation.details.personalNumber && (
                          <tr>
                            <td className="px-2.5 py-1.5 text-slate-300 font-medium">Personal Number</td>
                            <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                              {screening.mrzData.checksumValidation.details.personalNumber.actual}
                            </td>
                            <td className="px-2.5 py-1.5 text-center font-mono text-slate-200">
                              {screening.mrzData.checksumValidation.details.personalNumber.expected}
                            </td>
                            <td className="px-2.5 py-1.5 text-right">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  screening.mrzData.checksumValidation.personal_number
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : 'bg-rose-950 text-rose-400 border border-rose-800'
                                }`}
                              >
                                {screening.mrzData.checksumValidation.personal_number ? 'VALID' : 'INVALID'}
                              </span>
                            </td>
                          </tr>
                        )}
                        <tr className="bg-slate-900/40 font-semibold">
                          <td className="px-2.5 py-1.5 text-sky-300">Composite Check Digit</td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-sky-200">
                            {screening.mrzData.checksumValidation.details.composite.actual}
                          </td>
                          <td className="px-2.5 py-1.5 text-center font-mono text-sky-200">
                            {screening.mrzData.checksumValidation.details.composite.expected}
                          </td>
                          <td className="px-2.5 py-1.5 text-right">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                screening.mrzData.checksumValidation.composite
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : 'bg-rose-950 text-rose-400 border border-rose-800'
                              }`}
                            >
                              {screening.mrzData.checksumValidation.composite ? 'MATCHED' : 'VIOLATION'}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Cross-Field Consistency Table */}
              {screening.consistencyData && (
                <div className="pt-2 border-t border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 uppercase flex items-center gap-1.5">
                      <FileCheck className="w-3 h-3 text-sky-400" />
                      <span>Visual Zone (OCR) ↔ MRZ Consistency Cross-Check</span>
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        screening.consistencyData.overallMatch
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {screening.consistencyData.overallMatch ? '100% PARITY' : `${screening.consistencyData.mismatchCount} MISMATCHES`}
                    </span>
                  </div>

                  <div className="overflow-x-auto rounded border border-slate-800/80 bg-slate-950">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                        <tr>
                          <th className="px-2.5 py-1.5">Field</th>
                          <th className="px-2.5 py-1.5">Visual OCR Value</th>
                          <th className="px-2.5 py-1.5">MRZ Decoded Value</th>
                          <th className="px-2.5 py-1.5 text-right">Match</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {screening.consistencyData.comparisons.map((c) => (
                          <tr key={c.field}>
                            <td className="px-2.5 py-1.5 text-slate-300 font-medium">{c.fieldLabel}</td>
                            <td className="px-2.5 py-1.5 font-mono text-slate-200 truncate max-w-[120px]">
                              {c.ocrValue || <span className="text-slate-500 italic">Not extracted</span>}
                            </td>
                            <td className="px-2.5 py-1.5 font-mono text-slate-200 truncate max-w-[120px]">
                              {c.mrzValue || <span className="text-slate-500 italic">N/A</span>}
                            </td>
                            <td className="px-2.5 py-1.5 text-right">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  c.status === 'MATCH'
                                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                    : c.status === 'MISMATCH'
                                    ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                    : 'bg-amber-950 text-amber-400 border border-amber-800'
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2: Cross-Document Consistency Engine */}
          {(activeTab === 'all' || activeTab === 'consistency') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3.5">
              {/* Header with Overall Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
                    <Split className="w-3.5 h-3.5 text-sky-400" />
                    <span>2. Cross-Document Consistency Engine</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Cross-referencing biographical, chronological, and linkage parity across Passport, Visa, and Permits.
                  </p>
                </div>

                {crossDocumentData ? (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded border uppercase tracking-wider ${
                        crossDocumentData.overall_status === 'CONSISTENT'
                          ? 'bg-emerald-950/80 border-emerald-700 text-emerald-300'
                          : crossDocumentData.overall_status === 'REVIEW_REQUIRED'
                          ? 'bg-amber-950/80 border-amber-700 text-amber-300'
                          : 'bg-slate-800 border-slate-700 text-slate-300'
                      }`}
                    >
                      STATUS: {crossDocumentData.overall_status.replace('_', ' ')}
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    SINGLE DOCUMENT CASE
                  </span>
                )}
              </div>

              {crossDocumentData ? (
                <div className="space-y-3">
                  {/* Evaluated Document Pairings Ribbon */}
                  {crossDocumentData.document_pairs.length > 0 && (
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between gap-2 flex-wrap text-[11px]">
                      <span className="text-slate-400 font-semibold uppercase text-[10px]">
                        Evaluated Document Relations:
                      </span>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {crossDocumentData.document_pairs.map((pair, pIdx) => (
                          <span
                            key={pIdx}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-sky-300 font-mono text-[10px]"
                          >
                            {pair.doc_a} ↔ {pair.doc_b} ({pair.relation})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Summary Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Matches</span>
                      <span className="text-xs font-bold text-emerald-400">{crossDocumentData.summary.matches}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Mismatches</span>
                      <span className={`text-xs font-bold ${crossDocumentData.summary.mismatches > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {crossDocumentData.summary.mismatches}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Review Req</span>
                      <span className={`text-xs font-bold ${crossDocumentData.summary.review_required > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {crossDocumentData.summary.review_required}
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Total Fields</span>
                      <span className="text-xs font-bold text-sky-400">{crossDocumentData.summary.total_comparisons}</span>
                    </div>
                  </div>

                  {/* Explanations List */}
                  {crossDocumentData.explanations.length > 0 && (
                    <div className="p-3 rounded bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-300 font-bold text-[11px] uppercase">
                        <Info className="w-3.5 h-3.5 text-sky-400" />
                        <span>Cross-Document Findings & Human Explanations</span>
                      </div>
                      <div className="space-y-1 pl-4 border-l-2 border-slate-800">
                        {crossDocumentData.explanations.map((exp, eIdx) => (
                          <div key={eIdx} className="text-[11px] text-slate-300 leading-relaxed">
                            • {exp}
                          </div>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-900">
                        Notice: Cross-document mismatches are anomaly & review signals, not definitive proof of forgery.
                      </p>
                    </div>
                  )}

                  {/* Detailed Comparison Table Filter */}
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-1.5">
                      <span className="text-[11px] font-semibold text-slate-300 uppercase flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                        <span>Pairwise Field Comparisons</span>
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCrossDocFilter('all')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            crossDocFilter === 'all'
                              ? 'bg-sky-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          All ({crossDocumentData.comparisons.length})
                        </button>
                        <button
                          onClick={() => setCrossDocFilter('issues')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            crossDocFilter === 'issues'
                              ? 'bg-amber-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Issues ({crossDocumentData.summary.mismatches + crossDocumentData.summary.review_required})
                        </button>
                        <button
                          onClick={() => setCrossDocFilter('match')}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                            crossDocFilter === 'match'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          Matches ({crossDocumentData.summary.matches})
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded border border-slate-800/80 bg-slate-950">
                      <table className="w-full text-[11px] text-left">
                        <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[10px] uppercase font-semibold">
                          <tr>
                            <th className="px-3 py-2">Evaluated Field</th>
                            <th className="px-3 py-2">Primary Doc ({crossDocumentData.comparisons[0]?.document_a.label || 'Passport'})</th>
                            <th className="px-3 py-2">Supporting Doc ({crossDocumentData.comparisons[0]?.document_b.label || 'Visa'})</th>
                            <th className="px-3 py-2 text-center">Status</th>
                            <th className="px-3 py-2 text-right">Severity</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {crossDocumentData.comparisons
                            .filter((c) => {
                              if (crossDocFilter === 'issues') return c.status === 'MISMATCH' || c.status === 'REVIEW_REQUIRED';
                              if (crossDocFilter === 'match') return c.status === 'MATCH';
                              return true;
                            })
                            .map((comp) => (
                              <tr key={comp.id} className="hover:bg-slate-900/40">
                                <td className="px-3 py-2">
                                  <div className="text-slate-200 font-semibold">{comp.field_label}</div>
                                  <div className="text-[10px] text-slate-400 mt-0.5">{comp.explanation}</div>
                                </td>
                                <td className="px-3 py-2 font-mono text-slate-200 max-w-[150px]">
                                  {comp.document_a.value ? (
                                    <span className="font-semibold">{comp.document_a.value}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">Not available</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 font-mono text-slate-200 max-w-[150px]">
                                  {comp.document_b.value ? (
                                    <span className="font-semibold">{comp.document_b.value}</span>
                                  ) : (
                                    <span className="text-slate-500 italic">Not available</span>
                                  )}
                                </td>
                                <td className="px-3 py-2 text-center whitespace-nowrap">
                                  <span
                                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                                      comp.status === 'MATCH'
                                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                        : comp.status === 'MISMATCH'
                                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                        : comp.status === 'REVIEW_REQUIRED'
                                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                                    }`}
                                  >
                                    {comp.status.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-right whitespace-nowrap">
                                  <span
                                    className={`text-[10px] px-1.5 py-0.2 rounded border font-mono font-bold ${
                                      comp.severity === 'ERROR'
                                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                                        : comp.severity === 'WARNING'
                                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                                        : 'bg-slate-900 text-slate-400 border-slate-800'
                                    }`}
                                  >
                                    {comp.severity}
                                  </span>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty state when no cross-document credentials were provided */
                <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800/80 text-center space-y-2 text-xs">
                  <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Split className="w-4 h-4" />
                  </div>
                  <div className="font-semibold text-slate-200">Single Credential Screening</div>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
                    This screening case contains only one primary document. Cross-document consistency verification was skipped. To evaluate multi-document biographical consistency and linkage parity, attach an accompanying visa or permit during intake.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={onNavigateToNew}
                      className="px-3 py-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Create Multi-Credential Screening</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 3: Tampering & Forgery Analysis */}
          {(activeTab === 'all' || activeTab === 'tampering') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  <span>3. AI Tampering & Manipulation Analysis</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Score: <strong className={tampering.overallTamperingScore > 50 ? 'text-rose-400' : 'text-emerald-400'}>{tampering.overallTamperingScore}/100</strong>
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] block uppercase">Photo Splicing</span>
                  <ValidationStatusPill status={tampering.photoManipulationStatus} />
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] block uppercase">Text Alteration</span>
                  <ValidationStatusPill status={tampering.textManipulationStatus} />
                </div>
                <div className="p-2 rounded bg-slate-950 border border-slate-800/80 text-center space-y-1">
                  <span className="text-slate-500 text-[10px] block uppercase">EXIF / Metadata</span>
                  <ValidationStatusPill status={tampering.metadataAnomalyStatus} />
                </div>
              </div>

              {/* Tampering diagnostic details */}
              <div className="space-y-1.5">
                {tampering.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded bg-slate-950/60 border border-slate-800/60 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-semibold text-slate-200 text-[11px] block">{item.componentName}</span>
                      <span className="text-[11px] text-slate-400 block leading-snug">{item.description}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <ValidationStatusPill status={item.status} />
                      <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">
                        Conf: {item.confidenceScore}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Facial & Biometric Verification */}
          {(activeTab === 'all' || activeTab === 'biometrics') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-sky-400" />
                  <span>4. Biometric Facial Matching</span>
                </span>
                <span className={`text-[11px] font-bold ${faceVerification.matchStatus === 'MATCHED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {faceVerification.matchStatus}
                </span>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Landmark Similarity:</span>
                    <span className="text-slate-100 font-bold text-sm">{faceVerification.similarityScore}%</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {faceVerification.notes}
                  </div>
                </div>

                {faceVerification.livenessConfidence && (
                  <div className="p-2 rounded bg-slate-900 border border-slate-700 text-center flex-shrink-0">
                    <span className="text-[10px] text-slate-400 block">Liveness Score</span>
                    <span className="text-xs font-bold text-emerald-400">{faceVerification.livenessConfidence}%</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 5: Explainable Risk Factors */}
          {(activeTab === 'all' || activeTab === 'risk') && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-sky-400" />
                  <span>5. Explainable Risk Factors & Audit Assessment</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Composite Score: <strong>{riskAssessment.riskScore}/100</strong>
                </span>
              </div>

              <div className="space-y-2">
                {riskAssessment.explainableFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-2.5 rounded bg-slate-950 border border-slate-800/80 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200 text-[11px]">{factor.factor}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold border ${
                        factor.weight === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border-rose-800' :
                        factor.weight === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                        'bg-slate-900 text-slate-400 border-slate-800'
                      }`}>
                        {factor.weight} IMPACT (+{factor.impactPoints} PTS)
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-snug">{factor.description}</p>
                    {factor.mitigationSuggestion && (
                      <div className="text-[10px] text-sky-400 flex items-center gap-1 pt-0.5">
                        <span>Mitigation Protocol:</span>
                        <span className="text-slate-300">{factor.mitigationSuggestion}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
