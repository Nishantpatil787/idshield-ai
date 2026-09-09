import React, { useState } from 'react';
import { 
  ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, XCircle, 
  FileText, Hash, Download, Printer, Copy, Check, Lock, Cpu, Sparkles 
} from 'lucide-react';
import { ForensicReport } from '../types';

interface VerificationReportProps {
  report: ForensicReport;
  onNewScan: () => void;
}

export const VerificationReport: React.FC<VerificationReportProps> = ({
  report,
  onNewScan,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'ocr' | 'tamper_log' | 'raw_json'>('checklist');
  const [copiedHash, setCopiedHash] = useState<boolean>(false);

  const isPassed = report.overallStatus === 'PASSED';
  const isSuspicious = report.overallStatus === 'SUSPICIOUS' || report.overallStatus === 'MANUAL_REVIEW';
  const isRejected = report.overallStatus === 'REJECTED';

  const copyHash = () => {
    navigator.clipboard.writeText(report.forensicHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-6 space-y-6">
      {/* Top Header Card with Big Authenticity Dial */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border ${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : isSuspicious
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border-red-500/30'
            }`}>
              {report.overallStatus}
            </span>

            <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-mono">
              Risk: {report.riskLevel}
            </span>

            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-mono border border-blue-500/20 uppercase">
              {report.documentType}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-slate-100 tracking-tight">
            Forensic Audit & Tampering Report
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            {report.summary}
          </p>
        </div>

        {/* Authenticity Dial & Actions */}
        <div className="flex items-center gap-6 w-full lg:w-auto justify-between lg:justify-end">
          {/* Circular Score Dial */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-20 h-20">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isPassed ? 'text-emerald-500' : isSuspicious ? 'text-amber-500' : 'text-red-500'}
                  strokeDasharray={`${report.authenticityScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-lg font-black text-slate-100 font-mono">
                  {report.authenticityScore}%
                </span>
              </div>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Authenticity
              </span>
              <span className="text-[11px] text-slate-500 font-mono">
                {report.executionTimeMs}ms latency
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors border border-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Export PDF / Print</span>
            </button>
            <button
              onClick={onNewScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verify Another ID</span>
            </button>
          </div>
        </div>
      </div>

      {/* Audit Meta Bar (Forensic Hash, Timestamp, Model) */}
      <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Hash className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-mono text-[11px] text-slate-300 truncate max-w-[280px] sm:max-w-md">
            {report.forensicHash}
          </span>
          <button
            onClick={copyHash}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Copy Hash"
          >
            {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="flex items-center gap-4 text-slate-400 text-[11px] font-mono">
          <span>Model: {report.modelUsed}</span>
          <span>{new Date(report.timestamp).toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('checklist')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'checklist'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Security Checklist ({report.securityChecks.length})
        </button>

        <button
          onClick={() => setActiveTab('ocr')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ocr'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Extracted OCR & QR Validation
        </button>

        <button
          onClick={() => setActiveTab('tamper_log')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'tamper_log'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Tampering Anomaly Log ({report.boundingBoxes.length})
        </button>

        <button
          onClick={() => setActiveTab('raw_json')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'raw_json'
              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Cryptographic JSON Payload
        </button>
      </div>

      {/* Tab 1: Security Checklist Breakdown */}
      {activeTab === 'checklist' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {report.securityChecks.map((check) => {
              const isPass = check.status === 'PASS';
              const isWarn = check.status === 'WARNING';

              return (
                <div
                  key={check.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isPass
                      ? 'bg-slate-950/60 border-slate-800'
                      : isWarn
                      ? 'bg-amber-950/20 border-amber-500/30'
                      : 'bg-red-950/20 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {isPass ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isWarn ? (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                      <h4 className="text-xs font-bold text-slate-100">{check.name}</h4>
                    </div>

                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      isPass
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isWarn
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {check.status} ({check.score}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2">{check.message}</p>

                  {check.technicalDetails && (
                    <div className="mt-2 p-2 rounded bg-slate-900/80 border border-slate-800/80 text-[11px] font-mono text-slate-400">
                      Diagnostics: {check.technicalDetails}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: OCR Fields & Data Validation */}
      {activeTab === 'ocr' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Full Name</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{report.ocrData.fullName || 'N/A'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Document Number</span>
              <p className="text-sm font-bold font-mono text-blue-400 mt-1">{report.ocrData.documentNumber || 'N/A'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Date of Birth</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{report.ocrData.dateOfBirth || 'N/A'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gender</span>
              <p className="text-sm font-bold text-slate-100 mt-1">{report.ocrData.gender || 'N/A'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Issue / Expiry Date</span>
              <p className="text-sm font-bold text-slate-100 mt-1">
                {report.ocrData.issueDate || 'N/A'} {report.ocrData.expiryDate ? `→ ${report.ocrData.expiryDate}` : ''}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">QR Code Integrity</span>
              <div className="flex items-center gap-2 mt-1">
                {report.ocrData.qrDataMatchesOcr !== false ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hash Matches OCR
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-400 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Payload Mismatch Detected
                  </span>
                )}
              </div>
            </div>
          </div>

          {report.ocrData.address && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Residential Address</span>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">{report.ocrData.address}</p>
            </div>
          )}

          {report.ocrData.qrCodeData && (
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 font-mono text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Decoded QR String</span>
              <p className="text-slate-300 break-all">{report.ocrData.qrCodeData}</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Tampering Anomaly Log */}
      {activeTab === 'tamper_log' && (
        <div className="space-y-3">
          {report.boundingBoxes.length > 0 ? (
            <div className="space-y-2">
              {report.boundingBoxes.map((box) => (
                <div
                  key={box.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        box.severity === 'high' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {box.type}
                      </span>
                      <h4 className="text-xs font-bold text-slate-100">{box.label}</h4>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{box.description}</p>
                  </div>

                  <div className="text-right font-mono text-[11px] text-slate-400 shrink-0">
                    <div>Coord: ({box.x}%, {box.y}%)</div>
                    <div>Conf: {Math.round(box.confidence * 100)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-200">No Tampering Anomalies Flagged</p>
              <p className="text-[11px] text-slate-400">All microprint, typography, and optical elements passed inspection.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Raw JSON Audit Payload */}
      {activeTab === 'raw_json' && (
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[350px] custom-scrollbar">
            {JSON.stringify(report, null, 2)}
          </pre>
          <button
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(report, null, 2));
              alert('Forensic JSON copied to clipboard');
            }}
            className="absolute top-3 right-3 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold"
          >
            Copy JSON
          </button>
        </div>
      )}
    </div>
  );
};
