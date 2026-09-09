import React from 'react';
import { Sliders, X, Check, RotateCcw } from 'lucide-react';
import { VerificationRuleConfig } from '../types';

interface RulesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: VerificationRuleConfig;
  onSaveConfig: (config: VerificationRuleConfig) => void;
}

export const RulesConfigModal: React.FC<RulesConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [tempConfig, setTempConfig] = React.useState<VerificationRuleConfig>(config);

  React.useEffect(() => {
    setTempConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaults: VerificationRuleConfig = {
      minimumAuthenticityScore: 75,
      strictFontConsistency: true,
      strictFaceMatchThreshold: 80,
      requireQrValidation: true,
      flagGhostImageAbsence: true,
      autoRejectHighRisk: true,
    };
    setTempConfig(defaults);
  };

  const handleSave = () => {
    onSaveConfig(tempConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-slate-100">Verification & Risk Thresholds</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Minimum Authenticity Score */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>Minimum Authenticity Score for "PASSED"</span>
              <span className="font-mono text-blue-400">{tempConfig.minimumAuthenticityScore}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={tempConfig.minimumAuthenticityScore}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, minimumAuthenticityScore: Number(e.target.value) })
              }
              className="w-full accent-blue-600"
            />
          </div>

          {/* Strict Face Match Threshold */}
          <div className="space-y-1.5">
            <div className="flex justify-between font-semibold text-slate-300">
              <span>Face Biometric Cosine Match Threshold</span>
              <span className="font-mono text-emerald-400">{tempConfig.strictFaceMatchThreshold}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="95"
              step="5"
              value={tempConfig.strictFaceMatchThreshold}
              onChange={(e) =>
                setTempConfig({ ...tempConfig, strictFaceMatchThreshold: Number(e.target.value) })
              }
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Boolean Toggles */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Strict Font Kerning & Baseline Inspection</span>
              <input
                type="checkbox"
                checked={tempConfig.strictFontConsistency}
                onChange={(e) =>
                  setTempConfig({ ...tempConfig, strictFontConsistency: e.target.checked })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Mandatory QR / Barcode vs OCR Cross-Validation</span>
              <input
                type="checkbox"
                checked={tempConfig.requireQrValidation}
                onChange={(e) =>
                  setTempConfig({ ...tempConfig, requireQrValidation: e.target.checked })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Auto-Reject on Critical Photo Splicing</span>
              <input
                type="checkbox"
                checked={tempConfig.autoRejectHighRisk}
                onChange={(e) =>
                  setTempConfig({ ...tempConfig, autoRejectHighRisk: e.target.checked })
                }
                className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-white bg-blue-600 hover:bg-blue-500 text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
