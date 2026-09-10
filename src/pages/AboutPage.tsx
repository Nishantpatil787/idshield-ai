import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  Users, 
  Lock, 
  Building2, 
  GraduationCap, 
  AlertCircle,
  FileCheck2,
  Cpu,
  ArrowRight
} from 'lucide-react';
import { NavPage } from '../components/Navbar';

interface AboutPageProps {
  onNavigate: (page: NavPage) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
          <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
          <span>RESEARCH & INNOVATION PROTOTYPE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About DocShield
        </h1>
        <p className="text-slate-600 text-base leading-relaxed">
          AI-Powered Identity & Document Verification engineered to assist border authorities and credential screening teams in identifying sophisticated document tampering and synthetic identities.
        </p>
      </div>

      {/* Grid: Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            The Purpose
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            With the rise of generative AI image synthesis, low-cost digital editing, and deepfake generation, traditional visual inspection of identity documents is no longer sufficient. DocShield was built to demonstrate how multi-signal computer vision can quickly detect microscopic anomalies that escape the naked eye.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Responsible AI & Privacy
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Identity verification demands the highest ethical standards. DocShield operates strictly on privacy-by-design principles: uploaded test documents are ephemeral and never shared or sold. The prototype adheres to transparent explainability standards.
          </p>
        </div>
      </div>

      {/* Academic Prototype Notice Card (Required) */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-900">
              Academic Prototype — Important Notice
            </h3>
            <p className="text-xs text-amber-800">
              Authorized Evaluation and Technical Demonstration Only
            </p>
          </div>
        </div>

        <p className="text-sm text-amber-900/90 leading-relaxed">
          DocShield is an academic research demonstration and educational platform. It does <strong>not</strong> connect to any live government databases, Interpol Stolen and Lost Travel Documents (SLTD) registries, or law enforcement networks. All sample data and test specimens are synthetic or public test templates.
        </p>

        <div className="pt-2 text-xs text-amber-800 font-semibold">
          Final decisions remain under the sole authority of qualified verification officers.
        </div>
      </div>

      {/* Capabilities Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 space-y-6 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          Core Technical Capabilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-blue-600 font-bold text-sm">Multimodal Vision Inspection</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Powered by advanced multimodal vision models that examine micro-printing, character baseline alignment, and background guilloche patterns.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-blue-600 font-bold text-sm">Deterministic Checksum Logic</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pure mathematical checksum verification adhering to ICAO Doc 9303 specs for passports, visas, and national identity cards.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-blue-600 font-bold text-sm">Biometric Face Matching</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-accuracy face alignment and embedding similarity matching between photo-ID badges and live camera capture specimens.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">
            DocShield Research Core • Version 1.2
          </span>
          <button
            onClick={() => onNavigate('verify')}
            className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            <span>Start Screening</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
