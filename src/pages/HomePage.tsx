import React from 'react';
import { 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  FileCheck2, 
  Search, 
  Lock, 
  Clock, 
  Layers, 
  Sparkles,
  FileText,
  UserCheck,
  Eye,
  AlertTriangle,
  Building2,
  ChevronRight
} from 'lucide-react';
import { NavPage } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: NavPage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 lg:space-y-24 py-8 lg:py-16">
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Messaging & CTAs */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>ACADEMIC AI VERIFICATION PROTOTYPE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              AI-Powered Identity &amp;{' '}
              <span className="text-blue-600">Document Verification</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              Verify passports, visas, and national IDs with AI-powered document analysis, tampering detection, and identity verification.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('verify')}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base shadow-sm shadow-blue-500/25 hover:shadow-md transition-all cursor-pointer group"
              >
                <span>Verify Document</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('how_it_works')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer"
              >
                <span>How It Works</span>
              </button>
            </div>

            {/* Academic Notice Reminder */}
            <p className="text-xs text-slate-400 font-medium">
              Academic Prototype — This demonstration does not connect to real government databases.
            </p>
          </div>

          {/* Right Column: Clean Floating Visual Card (Inspired by ProofX) */}
          <div className="lg:col-span-5 relative">
            {/* Soft background glow */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-100 to-indigo-50 rounded-3xl -z-10 blur-xl opacity-70" />

            <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 space-y-6">
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">TRAVEL PASSPORT</h3>
                    <p className="text-xs text-slate-500">Biometric TD3 Specimen</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Genuine
                </span>
              </div>

              {/* Document Mock Illustration */}
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-14 rounded-lg bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-500">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-28 bg-slate-300 rounded" />
                    <div className="h-2.5 w-36 bg-slate-200 rounded" />
                    <div className="h-2 w-20 bg-slate-200 rounded" />
                  </div>
                </div>
                {/* MRZ Band */}
                <div className="bg-white rounded p-2 border border-slate-200 font-mono text-[9px] text-slate-400 select-none overflow-hidden truncate">
                  P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;
                  <br />
                  L898902C36UTO7408122F2804155ZE184226B&lt;&lt;&lt;&lt;10
                </div>
              </div>

              {/* 4 Multi-layer check indicators */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Document Check</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Data Extraction</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Face Verification</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50/50 border border-blue-100 text-slate-700 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span>Tamper Detection</span>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-3.5 flex items-center justify-between shadow-md shadow-blue-500/20">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5" />
                  <div>
                    <div className="text-xs font-bold">Identity Verified</div>
                    <div className="text-[11px] text-blue-100">Multi-Signal Score: 96%</div>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white/20 text-white">
                  LOW RISK
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FOUR CORE CAPABILITY CARDS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Comprehensive Multi-Signal Verification
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Automated visual and cryptographic checks across passports, visas, and national IDs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              AI Document Analysis
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Multimodal OCR extracts vital identity fields, validates ICAO 9303 MRZ checksums, and parses biometric zones.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Tampering Detection
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Pinpoints photo splicing, text alterations, font inconsistencies, and broken guilloche security patterns.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Identity Verification
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cross-matches document portraiture against applicant selfies with facial landmark similarity scoring.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Explainable Risk Assessment
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Translates complex multi-signal findings into transparent risk tiers with visual bounding boxes and clear explanations.
            </p>
          </div>
        </div>
      </section>

      {/* 3. VERIFY WORKFLOW BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 sm:p-12 text-white shadow-lg shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Ready to verify a document specimen?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Upload an image, capture via webcam, or choose one of our sample genuine and tampered presets to see DocShield in action.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => onNavigate('verify')}
              className="px-6 py-3.5 rounded-full bg-white text-blue-600 hover:bg-blue-50 font-bold text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <span>Verify Document</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
