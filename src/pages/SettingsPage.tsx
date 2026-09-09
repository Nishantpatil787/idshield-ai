import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  Cpu, 
  Server, 
  FileCheck, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle,
  Lock,
  Terminal,
  Database
} from 'lucide-react';
import { SystemSettings } from '../types';
import { ScreeningService } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'rules' | 'thresholds' | 'ai' | 'system'>('rules');

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await ScreeningService.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      await ScreeningService.updateSettings(settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Reset all rule parameters and thresholds to prototype defaults?')) {
      await ScreeningService.resetToDemoDefaults();
      const fresh = await ScreeningService.getSettings();
      setSettings(fresh);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16 text-center text-slate-500 font-mono text-xs">
        <div className="inline-block w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin mb-2" />
        <p>Loading system configuration...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-mono">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>SYSTEM & SCREENING RULES CONFIGURATION</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              OPERATOR CONSOLE
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Adjust inspection threshold parameters, document compliance rules, and AI pipeline sensitivity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <DisclaimerBanner />

      {savedSuccess && (
        <div className="bg-emerald-950/70 border border-emerald-800 rounded-lg p-3 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Screening parameters successfully updated in active terminal memory.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'rules'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Document Rules</span>
        </button>
        <button
          onClick={() => setActiveTab('thresholds')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'thresholds'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Risk Thresholds</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ai'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>AI Pipeline</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-4 py-2 text-xs font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'system'
              ? 'border-sky-500 text-sky-400 bg-slate-900/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Station & System</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Tab 1: Document Rules */}
        {activeTab === 'rules' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2">
              Compliance & Verification Rules
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800/80 cursor-pointer">
                <div>
                  <span className="text-slate-200 font-semibold block">Strict MRZ Parity Checking</span>
                  <span className="text-slate-400 text-[11px]">Reject or flag any passport with failing 7-3-1 ICAO check digits.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.documentRules.requireStrictMrz}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      documentRules: { ...settings.documentRules, requireStrictMrz: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800/80 cursor-pointer">
                <div>
                  <span className="text-slate-200 font-semibold block">Require Biometric Face Verification</span>
                  <span className="text-slate-400 text-[11px]">Flag document if holder portrait cannot be matched against biometric capture.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.documentRules.requireBiometricCrossCheck}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      documentRules: { ...settings.documentRules, requireBiometricCrossCheck: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded bg-slate-950 border border-slate-800/80 cursor-pointer">
                <div>
                  <span className="text-slate-200 font-semibold block">Flag Handwritten / Non-Standard Passports</span>
                  <span className="text-slate-400 text-[11px]">Require mandatory secondary review for non-machine readable credentials.</span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.documentRules.flagHandwrittenPassports}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      documentRules: { ...settings.documentRules, flagHandwrittenPassports: e.target.checked },
                    })
                  }
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
                />
              </label>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-200 font-semibold text-xs">Minimum Expiry Horizon Buffer</span>
                  <span className="text-sky-400 font-bold">{settings.documentRules.minimumExpiryBufferMonths} Months</span>
                </div>
                <span className="text-slate-400 text-[11px] block">Flag credentials expiring within this window prior to travel date.</span>
                <input
                  type="range"
                  min={1}
                  max={12}
                  value={settings.documentRules.minimumExpiryBufferMonths}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      documentRules: { ...settings.documentRules, minimumExpiryBufferMonths: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Risk Thresholds */}
        {activeTab === 'thresholds' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2">
              Risk Classification Thresholds (0 - 100 Scale)
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-emerald-400 font-bold block">LOW RISK Ceiling</span>
                    <span className="text-slate-400 text-[11px]">Scores 0 to {settings.riskThresholds.lowMax} are classified as CLEAR.</span>
                  </div>
                  <span className="text-emerald-400 font-mono text-sm font-bold">{settings.riskThresholds.lowMax}</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={50}
                  value={settings.riskThresholds.lowMax}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      riskThresholds: { ...settings.riskThresholds, lowMax: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-amber-400 font-bold block">MEDIUM RISK Ceiling</span>
                    <span className="text-slate-400 text-[11px]">Scores {settings.riskThresholds.lowMax + 1} to {settings.riskThresholds.mediumMax} require SECONDARY REVIEW.</span>
                  </div>
                  <span className="text-amber-400 font-mono text-sm font-bold">{settings.riskThresholds.mediumMax}</span>
                </div>
                <input
                  type="range"
                  min={51}
                  max={85}
                  value={settings.riskThresholds.mediumMax}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      riskThresholds: { ...settings.riskThresholds, mediumMax: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                <div>
                  <span className="text-rose-400 font-bold block">HIGH RISK Zone</span>
                  <span className="text-slate-400 text-[11px]">Any composite score &gt; {settings.riskThresholds.mediumMax} triggers MANDATORY FLAGGING &amp; DENIAL.</span>
                </div>
                <span className="text-rose-400 font-mono text-sm font-bold">&gt; {settings.riskThresholds.mediumMax}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: AI Pipeline */}
        {activeTab === 'ai' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2">
              AI Subsystem Tuning
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">OCR Confidence Threshold</span>
                    <span className="text-slate-400 text-[11px]">Minimum optical character recognition confidence score.</span>
                  </div>
                  <span className="text-sky-400 font-bold">{settings.aiConfiguration.ocrConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={99}
                  value={settings.aiConfiguration.ocrConfidenceThreshold}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiConfiguration: { ...settings.aiConfiguration, ocrConfidenceThreshold: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-semibold block">Biometric Face Strictness</span>
                    <span className="text-slate-400 text-[11px]">Cosine similarity cutoff for facial landmark verification.</span>
                  </div>
                  <span className="text-sky-400 font-bold">{settings.aiConfiguration.faceMatchStrictness}%</span>
                </div>
                <input
                  type="range"
                  min={60}
                  max={95}
                  value={settings.aiConfiguration.faceMatchStrictness}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiConfiguration: { ...settings.aiConfiguration, faceMatchStrictness: parseInt(e.target.value) },
                    })
                  }
                  className="w-full accent-sky-500"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1.5">
                <label className="text-slate-200 font-semibold block text-xs">
                  Model Backend Endpoint (Service Proxy)
                </label>
                <input
                  type="text"
                  value={settings.aiConfiguration.modelBackendEndpoint}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      aiConfiguration: { ...settings.aiConfiguration, modelBackendEndpoint: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-slate-300 font-mono text-xs focus:outline-none focus:border-sky-500"
                />
                <span className="text-slate-500 text-[10px] block">Centralized microservice endpoint for future live pipeline connection.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: System & Station */}
        {activeTab === 'system' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide border-b border-slate-800 pb-2">
              Station & Security Policies
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">Terminal Station ID</span>
                <input
                  type="text"
                  value={settings.systemConfig.stationName}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      systemConfig: { ...settings.systemConfig, stationName: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="p-3 rounded bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="text-slate-400 text-[11px] block">Operator Role Classification</span>
                <input
                  type="text"
                  value={settings.systemConfig.operatorRole}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      systemConfig: { ...settings.systemConfig, operatorRole: e.target.value },
                    })
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-slate-200 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-200 font-semibold block">Audit Logging Active</span>
                <span className="text-slate-400 text-[11px]">Enforce immutable cryptographic hashing on all screening decisions.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.systemConfig.enableAuditLogging}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    systemConfig: { ...settings.systemConfig, enableAuditLogging: e.target.checked },
                  })
                }
                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-sky-600 focus:ring-0"
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-5 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
};
