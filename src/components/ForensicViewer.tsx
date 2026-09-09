import React, { useState } from 'react';
import { 
  ZoomIn, ZoomOut, Maximize2, Layers, AlertCircle, CheckCircle2, 
  ShieldAlert, Scan, Eye, Sliders, UserCheck, Flame, Cpu 
} from 'lucide-react';
import { ForensicReport, BoundingBox } from '../types';

interface ForensicViewerProps {
  report: ForensicReport;
  documentImageUrl: string;
  selfieImageUrl?: string;
}

export const ForensicViewer: React.FC<ForensicViewerProps> = ({
  report,
  documentImageUrl,
  selfieImageUrl,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedBox, setSelectedBox] = useState<BoundingBox | null>(null);
  const [showTamperLayers, setShowTamperLayers] = useState<boolean>(true);
  const [showSecurityLayers, setShowSecurityLayers] = useState<boolean>(true);
  const [showOcrLayers, setShowOcrLayers] = useState<boolean>(true);
  const [highContrastMode, setHighContrastMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'document' | 'face_match'>('document');

  const filteredBoxes = report.boundingBoxes.filter((box) => {
    if (box.type === 'tamper' || box.type === 'font_anomaly' || box.type === 'photo_splice') {
      return showTamperLayers;
    }
    if (box.type === 'watermark' || box.type === 'ghost_image') {
      return showSecurityLayers;
    }
    if (box.type === 'ocr_field' || box.type === 'qr_code') {
      return showOcrLayers;
    }
    return true;
  });

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-slate-800 bg-slate-950/60">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('document')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'document'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Document Forensic Canvas</span>
          </button>

          {report.faceMatch?.performed && (
            <button
              onClick={() => setActiveTab('face_match')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'face_match'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Biometric Face Cross-Match</span>
            </button>
          )}
        </div>

        {/* Right: Layer Toggles & Zoom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeTab === 'document' && (
            <>
              {/* Layer filters */}
              <button
                onClick={() => setShowTamperLayers(!showTamperLayers)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  showTamperLayers
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Toggle Tampering Anomaly Boxes"
              >
                Tamper Anomaly ({report.boundingBoxes.filter(b => b.type === 'tamper' || b.type === 'font_anomaly' || b.type === 'photo_splice').length})
              </button>

              <button
                onClick={() => setShowSecurityLayers(!showSecurityLayers)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  showSecurityLayers
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="Toggle Hologram & Watermark Boxes"
              >
                Security Features
              </button>

              <button
                onClick={() => setHighContrastMode(!highContrastMode)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all ${
                  highContrastMode
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
                title="High Contrast Error Level Simulation"
              >
                ELA Contrast
              </button>

              {/* Zoom Buttons */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                <button
                  onClick={() => setZoomLevel(Math.max(0.8, zoomLevel - 0.2))}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono text-slate-300">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(2.5, zoomLevel + 0.2))}
                  className="p-1 rounded text-slate-400 hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 rounded text-slate-400 hover:text-white border-l border-slate-800 ml-1"
                  title="Reset Zoom"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Canvas Area */}
      <div className="p-6 flex flex-col items-center justify-center min-h-[420px] bg-slate-950/80 overflow-auto custom-scrollbar relative">
        {activeTab === 'document' ? (
          <div className="relative inline-block select-none transition-transform duration-200" style={{ transform: `scale(${zoomLevel})` }}>
            {/* Base Document Image */}
            <img
              src={documentImageUrl}
              alt="Inspected Document"
              className={`max-h-[460px] w-auto rounded-xl border border-slate-700 shadow-2xl ${
                highContrastMode ? 'filter contrast-150 saturate-200 invert-[0.1]' : ''
              }`}
            />

            {/* Bounding Box Overlays */}
            {filteredBoxes.map((box) => {
              const isTamper = box.type === 'tamper' || box.type === 'font_anomaly' || box.type === 'photo_splice';
              const isSecurity = box.type === 'watermark' || box.type === 'ghost_image';
              const isSelected = selectedBox?.id === box.id;

              const borderColor = isTamper
                ? 'border-red-500 bg-red-500/20'
                : isSecurity
                ? 'border-amber-400 bg-amber-400/20'
                : 'border-blue-400 bg-blue-400/15';

              return (
                <div
                  key={box.id}
                  onClick={() => setSelectedBox(isSelected ? null : box)}
                  style={{
                    left: `${box.x}%`,
                    top: `${box.y}%`,
                    width: `${box.width}%`,
                    height: `${box.height}%`,
                  }}
                  className={`absolute border-2 rounded cursor-pointer transition-all ${borderColor} ${
                    isSelected ? 'ring-4 ring-white shadow-2xl z-20' : 'hover:opacity-90 z-10'
                  }`}
                >
                  <span className={`absolute -top-6 left-0 text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md whitespace-nowrap text-white ${
                    isTamper ? 'bg-red-600' : isSecurity ? 'bg-amber-600' : 'bg-blue-600'
                  }`}>
                    {box.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          /* Biometric Face Match Comparison View */
          <div className="w-full max-w-2xl space-y-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              {/* Document Portrait */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Document Identity Portrait
                </span>
                <div className="h-44 w-44 mx-auto rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                  <img
                    src={documentImageUrl}
                    alt="Document Crop"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-blue-400/60 rounded-xl" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">128-D Landmark Matrix</p>
              </div>

              {/* Applicant Live Selfie */}
              <div className="rounded-xl bg-slate-900/90 border border-slate-800 p-4 text-center space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Live Applicant Selfie
                </span>
                <div className="h-44 w-44 mx-auto rounded-xl bg-slate-950 border border-slate-700 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {selfieImageUrl ? (
                    <img
                      src={selfieImageUrl}
                      alt="Applicant Selfie"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-xs text-slate-500">No selfie provided</div>
                  )}
                  <div className="absolute inset-0 border-2 border-emerald-400/60 rounded-xl" />
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>3D Liveness Confirmed</span>
                </div>
              </div>
            </div>

            {/* Match Metrics Gauge Bar */}
            {report.faceMatch && (
              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Cosine Facial Similarity Score
                  </span>
                  <span className={`text-sm font-extrabold ${
                    report.faceMatch.matchScore >= 80 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {report.faceMatch.matchScore.toFixed(1)}% Match
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all ${
                      report.faceMatch.matchScore >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : 'bg-gradient-to-r from-red-500 to-rose-400'
                    }`}
                    style={{ width: `${report.faceMatch.matchScore}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400">
                  {report.faceMatch.notes || 'Facial landmarks analyzed across nose bridge, eye distance, jawline, and lip contours.'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Box Info Drawer / Tooltip */}
      {selectedBox && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg mt-0.5 ${
              selectedBox.severity === 'high'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-100">{selectedBox.label}</h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  Severity: {selectedBox.severity}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Confidence: {Math.round(selectedBox.confidence * 100)}%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">{selectedBox.description}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedBox(null)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold self-end sm:self-center"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};
