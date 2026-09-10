import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  Scan, 
  Search, 
  UserCheck, 
  AlertCircle 
} from 'lucide-react';

interface AIProcessingScreenProps {
  fileName?: string;
  documentType?: string;
  onComplete: () => void;
}

interface StepItem {
  id: string;
  label: string;
  description: string;
}

const STEPS: StepItem[] = [
  { id: 'detect', label: 'Document Detection', description: 'Detecting boundaries and document alignment' },
  { id: 'quality', label: 'Image Quality & Resolution', description: 'Checking sharpness, glare, and resolution' },
  { id: 'ocr', label: 'OCR & Text Extraction', description: 'Reading typography and identity data fields' },
  { id: 'mrz', label: 'MRZ & Checksum Verification', description: 'Computing ICAO 9303 7-3-1 check digits' },
  { id: 'tamper', label: 'Tampering & Forgery Detection', description: 'Scanning for text edits, font anomalies, and photo splices' },
  { id: 'face', label: 'Face & Biometric Cross-Verification', description: 'Analyzing facial features against document photo' },
  { id: 'risk', label: 'Multi-Signal Risk Assessment', description: 'Synthesizing evidence into an explainable score' },
];

export const AIProcessingScreen: React.FC<AIProcessingScreenProps> = ({
  fileName = 'document.png',
  documentType = 'Passport',
  onComplete,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Step progression timer
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsFinished(true);
          setTimeout(() => {
            onComplete();
          }, 800);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 1) / STEPS.length) * 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600 shadow-xs">
            {isFinished ? (
              <ShieldCheck className="w-7 h-7 text-emerald-600 animate-bounce" />
            ) : (
              <Loader2 className="w-7 h-7 animate-spin text-blue-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {isFinished ? 'Analysis Complete' : 'Analyzing your document...'}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            {isFinished 
              ? 'Results synthesized. Loading verification report...' 
              : `Processing ${fileName} with multi-layer AI verification.`}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span>Progress</span>
            <span className="text-blue-600">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Clean Step Checklist */}
        <div className="space-y-2.5 pt-2">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex || isFinished;
            const isCurrent = idx === currentStepIndex && !isFinished;
            const isPending = idx > currentStepIndex;

            return (
              <div 
                key={step.id} 
                className={`flex items-center gap-3 p-2.5 rounded-xl text-xs transition-colors ${
                  isCurrent 
                    ? 'bg-blue-50/70 border border-blue-100 text-blue-900 font-semibold' 
                    : isDone
                    ? 'text-slate-700 bg-slate-50/50'
                    : 'text-slate-400 opacity-60'
                }`}
              >
                <div className="flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[9px] text-slate-400">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="flex-1 truncate">
                  <span>{step.label}</span>
                </div>

                {isDone && (
                  <span className="text-[10px] font-semibold text-emerald-600 uppercase">
                    Done
                  </span>
                )}
                {isCurrent && (
                  <span className="text-[10px] font-semibold text-blue-600 uppercase animate-pulse">
                    Checking...
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Calm academic note */}
        <div className="text-center pt-2 text-[11px] text-slate-400 border-t border-slate-100">
          Academic Prototype • Multi-signal verification running locally
        </div>
      </div>
    </div>
  );
};
