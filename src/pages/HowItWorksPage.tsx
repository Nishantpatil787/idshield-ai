import React from 'react';
import { 
  ShieldCheck, 
  Search, 
  Layers, 
  UserCheck, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  Split,
  Eye,
  Lock,
  Cpu
} from 'lucide-react';
import { NavPage } from '../components/Navbar';

interface HowItWorksPageProps {
  onNavigate: (page: NavPage) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>MULTI-SIGNAL VERIFICATION PIPELINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          How DocShield Works
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          Our multi-signal verification architecture combines computer vision, optical character recognition, machine-readable code validation, and biometric comparison to detect forgery with high confidence.
        </p>
      </div>

      {/* 4 Core Stages (Horizontal/Vertical Timeline) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Stage 1 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            1
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Intake & Preprocessing
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The document image is checked for sharpness, illumination uniformity, and perspective distortion. Document boundaries are aligned to standard aspect ratios.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Glare & blur assessment</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Edge & corner detection</span>
            </li>
          </ul>
        </div>

        {/* Stage 2 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            2
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            OCR & MRZ Extraction
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            High-precision OCR extracts text from visual zones. For passports and travel IDs, the 2-line or 3-line MRZ is parsed and verified using ICAO 9303 checksum algorithms.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>7-3-1 weight check digits</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Visual vs. MRZ cross-check</span>
            </li>
          </ul>
        </div>

        {/* Stage 3 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            3
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            AI Tamper Detection
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Multimodal neural vision scans for digital alterations: character kerning differences, inconsistent compression blocks, photo boundary splicing, and font anomalies.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Localized bounding boxes</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Photo replacement check</span>
            </li>
          </ul>
        </div>

        {/* Stage 4 */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
            4
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Biometric Fusion & Score
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Biometric face verification compares document photos against live captures. The fraud fusion engine calculates an explainable risk score from 0 to 100.
          </p>
          <ul className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Cosine similarity matching</span>
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Human-in-the-loop audit</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Multi-Signal Explanation Banner */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 sm:p-12 space-y-6">
        <div className="max-w-2xl space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Explainable AI — Why It Matters
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Rather than a black-box "Pass/Fail", DocShield supplies visual highlights and plain-English reasons for every finding. This empowers verification officers to quickly corroborate physical documents with AI insights.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-blue-600 font-bold text-sm">Visual Evidence</div>
            <p className="text-xs text-slate-500">
              Interactive bounding boxes identify the exact field (e.g. Date of Birth or Photo) flagged as altered.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-blue-600 font-bold text-sm">Checksum Assurance</div>
            <p className="text-xs text-slate-500">
              Deterministic mathematical validation guarantees travel document format integrity.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-1">
            <div className="text-blue-600 font-bold text-sm">Officer in Control</div>
            <p className="text-xs text-slate-500">
              The human officer makes the final determination with full audit trail logging.
            </p>
          </div>
        </div>

        <div className="pt-4 flex justify-start">
          <button
            onClick={() => onNavigate('verify')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
          >
            <span>Try It With a Specimen</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
