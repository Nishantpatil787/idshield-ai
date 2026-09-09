import React from 'react';
import { ShieldCheck, ShieldAlert, Cpu, Sliders, FileSpreadsheet, BarChart3, Info, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'scanner' | 'batch' | 'analytics' | 'architecture';
  setActiveTab: (tab: 'scanner' | 'batch' | 'analytics' | 'architecture') => void;
  onOpenRules: () => void;
  onOpenArch: () => void;
  hasGeminiKey: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenRules,
  onOpenArch,
  hasGeminiKey,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tag */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 ring-1 ring-blue-400/30">
              <ShieldCheck className="w-6 h-6 text-white animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-slate-950"></div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  IDShield AI
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  SIH Forensic Edition
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono hidden sm:block">
                Document Tampering & Identity Fraud Detection
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800/80">
            <button
              id="nav-tab-scanner"
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'scanner'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Inspect & Verify</span>
            </button>

            <button
              id="nav-tab-batch"
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'batch'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Batch Queue</span>
            </button>

            <button
              id="nav-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Fraud Analytics</span>
            </button>
          </nav>

          {/* Right System Indicators & Actions */}
          <div className="flex items-center gap-2.5">
            {/* AI Engine Status Pill */}
            <div
              title={hasGeminiKey ? 'Multimodal Gemini 3.8 Flash Engine Connected' : 'Running on Internal Forensic Rules Engine'}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                hasGeminiKey
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>{hasGeminiKey ? 'Gemini 3.8 Flash' : 'Forensic Vision Engine'}</span>
            </div>

            {/* Threshold Rules Button */}
            <button
              id="btn-rules-modal"
              onClick={onOpenRules}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Risk & Fraud Detection Rules"
            >
              <Sliders className="w-4 h-4" />
            </button>

            {/* Architecture / SIH Info Button */}
            <button
              id="btn-arch-modal"
              onClick={onOpenArch}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="SIH Architecture & Problem Statement"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
