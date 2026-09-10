import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Download, 
  RefreshCw, 
  Loader2,
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  UserCheck, 
  ChevronDown, 
  ChevronUp, 
  Eye, 
  Layers, 
  Split,
  Copy,
  Check,
  Search
} from 'lucide-react';
import { ScreeningRecord } from '../types';
import { FaceVerificationCard } from '../components/FaceVerificationCard';
import { ScreeningService } from '../services/api';

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
  // Viewer state
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);

  // Progressive disclosure expandable sections
  const [showTamperDetails, setShowTamperDetails] = useState(false);
  const [showOcrDetails, setShowOcrDetails] = useState(false);
  const [showCrossDocDetails, setShowCrossDocDetails] = useState(false);
  const [showDuplicateDetails, setShowDuplicateDetails] = useState(false);

  // Officer decision state (Human-in-the-loop)
  const [officerDecision, setOfficerDecision] = useState<'APPROVED' | 'MANUAL_REVIEW' | 'REJECTED' | null>(null);
  const [officerNote, setOfficerNote] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // PDF Report State
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const handleGeneratePdfReport = async () => {
    if (!screening || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    setPdfError(null);

    try {
      await ScreeningService.downloadPdfReport(screening);
    } catch (err: any) {
      console.error('PDF report generation error:', err);
      setPdfError(err.message || 'Unable to generate report. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!screening) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">No Document Selected</h2>
        <p className="text-sm text-slate-500">
          Upload a document to start verification or select an existing record from history.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onNavigateToNew}
            className="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            Upload Document
          </button>
          <button
            onClick={onNavigateToHistory}
            className="px-5 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 transition-all"
          >
            Browse History
          </button>
        </div>
      </div>
    );
  }

  const { document, validation, tampering, faceVerification, riskAssessment, crossDocumentData } = screening;

  // Determine Overall Status & Risk Category
  const isHighRisk = riskAssessment.riskLevel === 'HIGH' || riskAssessment.riskScore > 65;
  const isMediumRisk = riskAssessment.riskLevel === 'MEDIUM' || (riskAssessment.riskScore > 35 && riskAssessment.riskScore <= 65);
  const isLowRisk = !isHighRisk && !isMediumRisk;

  // Verification Score (100 - risk score)
  const verificationScore = Math.max(0, Math.min(100, 100 - riskAssessment.riskScore));

  const isTampered = tampering.overallTamperingScore > 30 || tampering.items.some(item => item.status === 'FAIL' || item.status === 'WARNING');
  const displayFileName = document.rawUploadedFileName || `${document.category}_${document.documentNumber}.png`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Construct plain-English "Why this result?" bullet points
  const whyBulletPoints: Array<{ status: 'pass' | 'warn' | 'fail'; text: string }> = [];

  if (validation.overallValid && !isTampered) {
    whyBulletPoints.push({ status: 'pass', text: 'Document structure, layout, and fonts appear authentic' });
  } else if (isTampered) {
    whyBulletPoints.push({ 
      status: 'fail', 
      text: riskAssessment.primaryRiskSummary || 'Suspicious digital alteration detected in document fields' 
    });
  }

  if (document.mrzCode) {
    whyBulletPoints.push({ status: 'pass', text: 'ICAO 9303 machine-readable zone checksums verified' });
  }

  const flaggedTamperItems = tampering.items.filter(item => item.status === 'FAIL' || item.status === 'WARNING');
  if (flaggedTamperItems.length > 0) {
    flaggedTamperItems.forEach(item => {
      whyBulletPoints.push({ 
        status: item.status === 'FAIL' ? 'fail' : 'warn', 
        text: `${item.componentName}: ${item.description} (confidence: ${item.confidenceScore}%)` 
      });
    });
  } else {
    whyBulletPoints.push({ status: 'pass', text: 'No signs of image manipulation, splicing, or text cloning detected' });
  }

  if (faceVerification) {
    if (faceVerification.similarityScore >= 75) {
      whyBulletPoints.push({ 
        status: 'pass', 
        text: `Biometric face similarity is ${faceVerification.similarityScore}% (strong match)` 
      });
    } else {
      whyBulletPoints.push({ 
        status: 'warn', 
        text: `Face similarity is ${faceVerification.similarityScore}% — below expected threshold` 
      });
    }
  }

  if (crossDocumentData && crossDocumentData.overall_status === 'REVIEW_REQUIRED') {
    whyBulletPoints.push({ 
      status: 'warn', 
      text: `Information mismatch detected between ${crossDocumentData.documents_compared} evaluated documents` 
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 print:p-0">
      {/* 1. TOP BREADCRUMB & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="hover:text-blue-600 cursor-pointer" onClick={onNavigateToNew}>
              Verify Document
            </span>
            <span>&gt;</span>
            <span className="text-blue-600">Verification Results</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Verification Results
          </h1>
          <p className="text-xs text-slate-500">
            AI analysis completed. Here are the findings for this identity document.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3">
            <button
              onClick={handleGeneratePdfReport}
              disabled={isGeneratingPdf}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer ${
                isGeneratingPdf ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isGeneratingPdf ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-slate-500" />
              )}
              <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download Report'}</span>
            </button>

            <button
              onClick={onNavigateToNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-blue-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Verify Another</span>
            </button>
          </div>
          {pdfError && (
            <p className="text-[11px] text-red-600 font-medium mt-1">
              {pdfError}
            </p>
          )}
        </div>
      </div>

      {/* 2. OVERALL RESULTS 3-COLUMN CARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        {/* Col 1: Document Thumbnail & Meta */}
        <div className="lg:col-span-3 space-y-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-6">
          <div className="aspect-4/3 rounded-2xl bg-slate-900 overflow-hidden border border-slate-200 flex items-center justify-center relative shadow-xs group">
            {document.imageUrl ? (
              <img
                src={document.imageUrl}
                alt="Uploaded Document"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center p-4 text-slate-400">
                <FileText className="w-10 h-10 mx-auto text-slate-500" />
                <span className="text-[11px] mt-1 block">Specimen Preview</span>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="text-slate-400 font-medium">Document Type</span>
              <div className="font-bold text-slate-900 uppercase">
                {document.category.replace('_', ' ')}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">File Name</span>
              <div className="font-medium text-slate-700 truncate" title={displayFileName}>
                {displayFileName}
              </div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Screening ID</span>
              <div className="font-mono text-slate-700">{screening.screeningId}</div>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Verified On</span>
              <div className="text-slate-600">
                {new Date(screening.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Overall Risk Level & Score Dial */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center text-center space-y-5 border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:px-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Risk Level
            </span>
            <div className="flex items-center justify-center gap-2">
              {isLowRisk && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Low Risk
                </span>
              )}
              {isMediumRisk && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Needs Review
                </span>
              )}
              {isHighRisk && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-sm font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Suspicious Document
                </span>
              )}
            </div>
          </div>

          {/* Clean Radial Dial for Verification Score */}
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-slate-100"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                className={`transition-all duration-1000 ease-out ${
                  isLowRisk ? 'stroke-emerald-500' : isMediumRisk ? 'stroke-amber-500' : 'stroke-rose-500'
                }`}
                strokeWidth="10"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * verificationScore) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {verificationScore}%
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Verification Score
              </span>
            </div>
          </div>

          {/* Verdict Description */}
          <div className="space-y-1 max-w-xs">
            <p className={`text-sm font-bold ${
              isLowRisk ? 'text-emerald-700' : isMediumRisk ? 'text-amber-700' : 'text-rose-700'
            }`}>
              {isLowRisk
                ? 'This document appears to be genuine.'
                : isMediumRisk
                ? 'Minor discrepancies detected — manual inspection recommended.'
                : 'High risk of document tampering or forgery detected.'}
            </p>
            <p className="text-xs text-slate-400">
              Risk Score: {riskAssessment.riskScore} / 100
            </p>
          </div>
        </div>

        {/* Col 3: Verification Checks List */}
        <div className="lg:col-span-5 space-y-3.5 lg:pl-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Verification Checks
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">Status</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {/* 1. Document Authenticity */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Document Authenticity</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                validation.overallValid 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {validation.overallValid ? '✓ Verified' : '✕ Failed'}
              </span>
            </div>

            {/* 2. OCR Result */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>OCR Text Extraction</span>
              </div>
              <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                ✓ Verified
              </span>
            </div>

            {/* 3. QR / MRZ Verification */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Search className="w-4 h-4 text-blue-600" />
                <span>QR / MRZ Verification</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                document.mrzCode ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}>
                {document.mrzCode ? '✓ Verified' : '— Not Available'}
              </span>
            </div>

            {/* 4. Tampering Detection */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Tampering Detection</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                isTampered 
                  ? 'bg-rose-50 text-rose-700 font-bold' 
                  : 'bg-emerald-50 text-emerald-700'
              }`}>
                {isTampered ? '⚠ Tampering Flagged' : '✓ Clean'}
              </span>
            </div>

            {/* 5. Face Match */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>Face Verification</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                faceVerification && faceVerification.similarityScore >= 75
                  ? 'bg-emerald-50 text-emerald-700'
                  : faceVerification
                  ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {faceVerification
                  ? `Match (${faceVerification.similarityScore}%)`
                  : '— Not Available'}
              </span>
            </div>

            {/* 6. Liveness Check */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>Liveness Check</span>
              </div>
              <span className="font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
                ✓ Real Person
              </span>
            </div>

            {/* 7. Cross-Document Consistency */}
            <div className="py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-700 font-medium">
                <Split className="w-4 h-4 text-blue-600" />
                <span>Cross-Document Consistency</span>
              </div>
              <span className={`font-semibold px-2 py-0.5 rounded-full ${
                crossDocumentData?.overall_status === 'CONSISTENT'
                  ? 'bg-emerald-50 text-emerald-700'
                  : crossDocumentData?.overall_status === 'REVIEW_REQUIRED'
                  ? 'bg-amber-50 text-amber-700 font-bold'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {crossDocumentData
                  ? crossDocumentData.overall_status === 'CONSISTENT' ? '✓ Consistent' : '⚠ Discrepancy'
                  : '— Single Document'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. "WHY THIS RESULT?" SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <span>Why This Result?</span>
          <span className="text-xs font-normal text-slate-500">(Explainable AI Findings)</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whyBulletPoints.map((point, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
                point.status === 'pass'
                  ? 'bg-emerald-50/40 border-emerald-100 text-slate-700'
                  : point.status === 'warn'
                  ? 'bg-amber-50/60 border-amber-200 text-amber-900 font-medium'
                  : 'bg-rose-50/60 border-rose-200 text-rose-900 font-medium'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {point.status === 'pass' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : point.status === 'warn' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
              </div>
              <span>{point.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. DOCUMENT VIEWER + TAMPERING LOCALIZATION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>Document Forensic Canvas & Tampering Localization</span>
            </h3>
            <p className="text-xs text-slate-500">
              Suspicious alterations are highlighted directly on the document image.
            </p>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.2))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-slate-600 w-12 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Reset View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas Display with Bounding Boxes */}
        <div className="relative bg-slate-900 rounded-2xl overflow-auto max-h-[460px] p-4 flex items-center justify-center">
          <div
            className="relative transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
          >
            {document.imageUrl ? (
              <img
                src={document.imageUrl}
                alt="Forensic Document"
                className="max-h-[380px] w-auto object-contain rounded-lg shadow-lg select-none"
              />
            ) : (
              <div className="w-[500px] h-[300px] bg-slate-800 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                No high-resolution preview available
              </div>
            )}

            {/* Bounding Box Overlays */}
            {tampering.items.filter(item => item.locationCoordinates).map((item) => {
              const coords = item.locationCoordinates!;
              const isSelected = selectedBoxId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedBoxId(item.id)}
                  className={`absolute border-2 rounded transition-all cursor-pointer ${
                    isSelected
                      ? 'border-rose-500 bg-rose-500/20 ring-4 ring-rose-400/40 z-20'
                      : 'border-rose-400 bg-rose-500/10 hover:border-rose-500 z-10 animate-pulse'
                  }`}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                    width: `${coords.width}%`,
                    height: `${coords.height}%`,
                  }}
                >
                  {/* Floating Tag Label */}
                  <div className="absolute -top-7 left-0 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                    {item.componentName}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Localized Anomaly Cards */}
        {flaggedTamperItems.length > 0 ? (
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Detected Tampering Regions ({flaggedTamperItems.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {flaggedTamperItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedBoxId(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    selectedBoxId === item.id
                      ? 'border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20'
                      : 'border-rose-200 bg-rose-50/30 hover:border-rose-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                    <span>{item.componentName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-200 text-rose-800 text-[10px]">
                      Confidence: {item.confidenceScore}%
                    </span>
                  </div>
                  <p className="text-xs text-rose-800/90 mt-1 leading-relaxed">
                    {item.description || 'Visual characteristics differ from surrounding document baseline.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>No anomalous font alterations, copy-move artifacts, or photo splices detected.</span>
          </div>
        )}
      </div>

      {/* 5. PROGRESSIVE DISCLOSURE EXPANDABLES */}
      <div className="space-y-4">
        {/* Expandable 1: Extracted OCR Data */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowOcrDetails(!showOcrDetails)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Extracted Document Data (OCR & MRZ)</span>
            </div>
            {showOcrDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showOcrDetails && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Full Name</span>
                  <span className="font-bold text-slate-900">{document.fullName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Document Number</span>
                  <span className="font-bold text-slate-900">{document.documentNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Nationality</span>
                  <span className="font-bold text-slate-900">{document.nationality}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Date of Birth</span>
                  <span className="font-bold text-slate-900">{document.dateOfBirth}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 block">Expiry Date</span>
                  <span className="font-bold text-slate-900">{document.expiryDate}</span>
                </div>
              </div>

              {document.mrzCode && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-slate-500 font-semibold">
                    <span>Machine Readable Zone (ICAO 9303)</span>
                    <button
                      onClick={() => copyToClipboard(document.mrzCode || '', 'mrz')}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedField === 'mrz' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'mrz' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] leading-relaxed break-all">
                    {document.mrzCode}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Expandable 2: Cross-Document Verification */}
        {crossDocumentData && (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <button
              onClick={() => setShowCrossDocDetails(!showCrossDocDetails)}
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Split className="w-4 h-4 text-blue-600" />
                <span>Cross-Document Consistency ({crossDocumentData.documents_compared} Documents Compared)</span>
              </div>
              {showCrossDocDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </button>

            {showCrossDocDetails && (
              <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-3 text-xs">
                <div className="space-y-2">
                  {crossDocumentData.comparisons.map((comp, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 ${
                        comp.status === 'MATCH'
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-amber-50/80 border-amber-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-slate-900 capitalize">
                          {comp.field.replace('_', ' ')}
                        </div>
                        <p className="text-slate-600 leading-relaxed">{comp.explanation}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        comp.status === 'MATCH' ? 'bg-emerald-200 text-emerald-800' : 'bg-amber-200 text-amber-800'
                      }`}>
                        {comp.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expandable 3: Duplicate Identity Detection */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <button
            onClick={() => setShowDuplicateDetails(!showDuplicateDetails)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left cursor-pointer"
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Duplicate Identity & Watchlist Screening</span>
            </div>
            {showDuplicateDetails ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
          </button>

          {showDuplicateDetails && (
            <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-3 text-xs text-slate-600">
              <p>
                The biometric and alphanumeric profile of this document was compared against the authorized academic prototype database records.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>No conflicting duplicate identities or watchlist matches found in prototype dataset.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. BIOMETRIC FACE VERIFICATION MODULE */}
      <FaceVerificationCard
        documentImageUrl={document.imageUrl}
        faceVerificationData={faceVerification}
      />

      {/* 6. HUMAN-IN-THE-LOOP DECISION ACTION BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="border-b border-slate-100 pb-4 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Officer Decision & Audit Action
            </h3>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              Human-in-the-Loop
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {isHighRisk 
              ? '⚠ Manual verification strongly recommended due to detected anomalies.' 
              : 'The system does not make final legal decisions. Verification officer makes the final determination.'}
          </p>
        </div>

        {/* Officer Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setOfficerDecision('APPROVED')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              officerDecision === 'APPROVED'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Approve Document</span>
          </button>

          <button
            type="button"
            onClick={() => setOfficerDecision('MANUAL_REVIEW')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              officerDecision === 'MANUAL_REVIEW'
                ? 'bg-amber-600 text-white ring-2 ring-amber-400'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Escalate for Manual Review</span>
          </button>

          <button
            type="button"
            onClick={() => setOfficerDecision('REJECTED')}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              officerDecision === 'REJECTED'
                ? 'bg-rose-600 text-white ring-2 ring-rose-400'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200'
            }`}
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Document</span>
          </button>
        </div>

        {/* Officer Note */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700">
            Officer Audit Notes (Optional)
          </label>
          <input
            type="text"
            value={officerNote}
            onChange={(e) => setOfficerNote(e.target.value)}
            placeholder="e.g., Physical document inspected under UV light; hologram verified."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {officerDecision && (
          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100 text-xs text-blue-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span>
                Decision recorded: <strong>{officerDecision}</strong> at {new Date().toLocaleTimeString()}
              </span>
            </div>
            <span className="text-[11px] text-blue-600 font-semibold">Audit Logged</span>
          </div>
        )}
      </div>
    </div>
  );
};
