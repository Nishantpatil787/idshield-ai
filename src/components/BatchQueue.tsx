import React, { useState } from 'react';
import { 
  Play, Plus, CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Download, Eye, Trash2, FileSpreadsheet, Layers 
} from 'lucide-react';
import { BatchItem, DocumentType, ForensicReport } from '../types';
import { SAMPLE_DOCUMENT_PRESETS } from '../utils/sampleData';

interface BatchQueueProps {
  onViewReport: (report: ForensicReport, imageUrl: string) => void;
  onAnalyzeSingle: (documentImage: string, documentType: DocumentType, fileName: string) => Promise<ForensicReport>;
}

export const BatchQueue: React.FC<BatchQueueProps> = ({
  onViewReport,
  onAnalyzeSingle,
}) => {
  const [items, setItems] = useState<BatchItem[]>([
    {
      id: 'batch-1',
      name: 'batch_aadhaar_001.png',
      documentType: 'aadhaar',
      status: 'completed',
      imageUrl: SAMPLE_DOCUMENT_PRESETS[0].imageUrl,
      report: SAMPLE_DOCUMENT_PRESETS[0].simulatedReport,
    },
    {
      id: 'batch-2',
      name: 'batch_pan_forged_002.png',
      documentType: 'pan',
      status: 'completed',
      imageUrl: SAMPLE_DOCUMENT_PRESETS[1].imageUrl,
      report: SAMPLE_DOCUMENT_PRESETS[1].simulatedReport,
    },
    {
      id: 'batch-3',
      name: 'batch_passport_splice_003.jpg',
      documentType: 'passport',
      status: 'completed',
      imageUrl: SAMPLE_DOCUMENT_PRESETS[2].imageUrl,
      report: SAMPLE_DOCUMENT_PRESETS[2].simulatedReport,
    },
    {
      id: 'batch-4',
      name: 'batch_dl_synthetic_004.png',
      documentType: 'driving_license',
      status: 'queued',
      imageUrl: SAMPLE_DOCUMENT_PRESETS[3].imageUrl,
    },
  ]);

  const [isProcessingAll, setIsProcessingAll] = useState<boolean>(false);

  // Stats calculation
  const totalCount = items.length;
  const completedCount = items.filter((i) => i.status === 'completed').length;
  const passedCount = items.filter((i) => i.report?.overallStatus === 'PASSED').length;
  const rejectedCount = items.filter((i) => i.report?.overallStatus === 'REJECTED').length;
  const suspiciousCount = items.filter((i) => i.report?.overallStatus === 'SUSPICIOUS').length;

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    for (let i = 0; i < items.length; i++) {
      if (items[i].status !== 'completed') {
        const currentItem = items[i];
        setItems((prev) =>
          prev.map((item) =>
            item.id === currentItem.id ? { ...item, status: 'processing' } : item
          )
        );

        try {
          // If already matched a preset or analyze
          const matchingPreset = SAMPLE_DOCUMENT_PRESETS.find(
            (p) => p.documentType === currentItem.documentType
          );
          const report = matchingPreset
            ? matchingPreset.simulatedReport
            : await onAnalyzeSingle(currentItem.imageUrl, currentItem.documentType, currentItem.name);

          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id
                ? { ...item, status: 'completed', report }
                : item
            )
          );
        } catch (err: any) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === currentItem.id
                ? { ...item, status: 'error', error: err.message }
                : item
            )
          );
        }
      }
    }
    setIsProcessingAll(false);
  };

  const handleExportCsv = () => {
    const headers = ['ID', 'FileName', 'DocType', 'Status', 'AuthenticityScore', 'RiskLevel', 'TamperingDetected'];
    const rows = items.map((i) => [
      i.id,
      i.name,
      i.documentType,
      i.report?.overallStatus || 'QUEUED',
      i.report?.authenticityScore || 'N/A',
      i.report?.riskLevel || 'N/A',
      i.report?.tamperingDetected ? 'YES' : 'NO',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `docshield_batch_audit_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total in Queue</span>
          <p className="text-2xl font-black text-slate-100 font-mono mt-1">{totalCount}</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Verified Genuine</span>
          <p className="text-2xl font-black text-emerald-400 font-mono mt-1">{passedCount}</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Fraud Flagged</span>
          <p className="text-2xl font-black text-red-400 font-mono mt-1">{rejectedCount}</p>
        </div>

        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Suspicious / Review</span>
          <p className="text-2xl font-black text-amber-400 font-mono mt-1">{suspiciousCount}</p>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">Batch Inspection Pipeline</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleProcessAll}
              disabled={isProcessingAll}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
            >
              {isProcessingAll ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Process All</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800 text-[10px]">
              <tr>
                <th className="p-4">Document</th>
                <th className="p-4">Type</th>
                <th className="p-4">Processing Status</th>
                <th className="p-4">Authenticity Score</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {items.map((item) => {
                const report = item.report;
                const isPassed = report?.overallStatus === 'PASSED';
                const isSuspicious = report?.overallStatus === 'SUSPICIOUS';

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-mono font-medium text-slate-200">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt="Thumbnail"
                          className="h-9 w-14 object-cover rounded border border-slate-700"
                        />
                        <span>{item.name}</span>
                      </div>
                    </td>

                    <td className="p-4 uppercase font-bold text-slate-400">
                      {item.documentType}
                    </td>

                    <td className="p-4">
                      {item.status === 'completed' ? (
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase border ${
                          isPassed
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isSuspicious
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-red-500/10 text-red-400 border-red-500/30'
                        }`}>
                          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : isSuspicious ? <AlertTriangle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {report?.overallStatus}
                        </span>
                      ) : item.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 text-blue-400 font-semibold text-[11px]">
                          <RefreshCw className="w-3 h-3 animate-spin" /> Processing
                        </span>
                      ) : (
                        <span className="text-slate-500 font-semibold text-[11px]">Queued</span>
                      )}
                    </td>

                    <td className="p-4 font-mono font-bold">
                      {report ? (
                        <span className={report.authenticityScore >= 80 ? 'text-emerald-400' : 'text-red-400'}>
                          {report.authenticityScore}%
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="p-4 font-mono text-[11px]">
                      {report ? (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          report.riskLevel === 'LOW'
                            ? 'bg-emerald-950/40 text-emerald-400'
                            : report.riskLevel === 'MODERATE'
                            ? 'bg-amber-950/40 text-amber-400'
                            : 'bg-red-950/40 text-red-400'
                        }`}>
                          {report.riskLevel}
                        </span>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {report ? (
                        <button
                          onClick={() => onViewReport(report, item.imageUrl)}
                          className="px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Report</span>
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            const rep = await onAnalyzeSingle(item.imageUrl, item.documentType, item.name);
                            setItems((prev) =>
                              prev.map((i) => (i.id === item.id ? { ...i, status: 'completed', report: rep } : i))
                            );
                          }}
                          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                        >
                          Inspect Now
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
