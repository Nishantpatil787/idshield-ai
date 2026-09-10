import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Camera, RefreshCw, Sparkles, CheckCircle2, AlertTriangle, 
  FileText, ShieldCheck, UserCheck, Eye, ArrowRight, X, Image as ImageIcon 
} from 'lucide-react';
import { DocumentType, SampleDocumentPreset, VerificationRuleConfig } from '../types';
import { SAMPLE_DOCUMENT_PRESETS } from '../utils/sampleData';

interface DocumentScannerProps {
  onAnalyze: (documentImage: string, documentType: DocumentType, fileName: string, selfieImage?: string) => Promise<void>;
  isAnalyzing: boolean;
  selectedPreset: SampleDocumentPreset | null;
  onSelectPreset: (preset: SampleDocumentPreset) => void;
  rulesConfig: VerificationRuleConfig;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({
  onAnalyze,
  isAnalyzing,
  selectedPreset,
  onSelectPreset,
}) => {
  const [documentType, setDocumentType] = useState<DocumentType>('aadhaar');
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('sample_aadhaar.png');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'document' | 'selfie'>('document');
  const [selfieRequired, setSelfieRequired] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selfieInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize with the first sample preset by default if empty
  useEffect(() => {
    if (!documentImage && SAMPLE_DOCUMENT_PRESETS.length > 0) {
      const defaultSample = SAMPLE_DOCUMENT_PRESETS[0];
      setDocumentImage(defaultSample.imageUrl);
      setSelfieImage(defaultSample.selfieUrl || null);
      setDocumentType(defaultSample.documentType);
      setFileName(defaultSample.simulatedReport.fileName);
      onSelectPreset(defaultSample);
    }
  }, []);

  // Sync when preset is chosen from outside
  useEffect(() => {
    if (selectedPreset) {
      setDocumentImage(selectedPreset.imageUrl);
      setSelfieImage(selectedPreset.selfieUrl || null);
      setDocumentType(selectedPreset.documentType);
      setFileName(selectedPreset.simulatedReport.fileName);
    }
  }, [selectedPreset]);

  // Handle File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: 'document' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (target === 'document') {
        setDocumentImage(dataUrl);
        setFileName(file.name);
      } else {
        setSelfieImage(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle Drag & Drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setDocumentImage(event.target?.result as string);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  // Start Camera
  const startCamera = async (target: 'document' | 'selfie') => {
    setCameraTarget(target);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'document' ? 'environment' : 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('Camera access failed:', err);
      setCameraActive(false);
    }
  };

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (cameraTarget === 'document') {
        setDocumentImage(dataUrl);
        setFileName('live_camera_document.jpg');
      } else {
        setSelfieImage(dataUrl);
      }
    }
    stopCamera();
  };

  // Stop Camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const handleStartAnalysis = () => {
    if (!documentImage) return;
    onAnalyze(documentImage, documentType, fileName, selfieRequired && selfieImage ? selfieImage : undefined);
  };

  return (
    <div className="space-y-6">
      {/* SIH Sample Preset Selector Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Smart India Hackathon Benchmark Test Presets
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Select a sample to evaluate tampering & fraud detection accuracy
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_DOCUMENT_PRESETS.map((preset) => {
            const isSelected = selectedPreset?.id === preset.id;
            const isTampered = preset.expectedOutcome !== 'GENUINE';

            return (
              <button
                key={preset.id}
                id={`preset-${preset.id}`}
                onClick={() => onSelectPreset(preset)}
                className={`flex flex-col text-left p-3 rounded-xl border transition-all relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/80 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/50'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                    isTampered 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {preset.expectedOutcome.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {preset.documentType}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-300 transition-colors line-clamp-1">
                  {preset.title}
                </h4>
                <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                  {preset.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload & Configuration Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Document Upload & Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            {/* Header: Document Type Selection */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Target Document Type
                </label>
                <p className="text-xs text-slate-400">Specifies forensic security feature template</p>
              </div>

              <select
                id="select-document-type"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="passport">Passport (ICAO 9303 Biometric)</option>
                <option value="visa">Visa / Travel Visa (Consular MRV)</option>
                <option value="national_id">National ID Card</option>
                <option value="aadhaar">National ID (Aadhaar / Smart Card)</option>
              </select>
            </div>

            {/* Document Upload / Preview Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`relative rounded-xl border-2 border-dashed transition-all overflow-hidden flex flex-col items-center justify-center min-h-[280px] p-4 text-center ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10'
                  : documentImage
                  ? 'border-slate-700/80 bg-slate-950/60'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
              }`}
            >
              {documentImage ? (
                <div className="relative w-full h-full flex flex-col items-center">
                  <div className="relative max-h-[260px] max-w-full rounded-lg overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                    <img
                      src={documentImage}
                      alt="Uploaded Document"
                      className="max-h-[250px] w-auto object-contain"
                    />
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-blue-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center">
                        <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#38bdf8] animate-scanline" />
                      </div>
                    )}
                  </div>

                  {/* Overlay File Info Bar */}
                  <div className="flex items-center justify-between w-full mt-3 px-2 text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-blue-400" />
                      <span className="font-mono text-[11px] truncate max-w-[200px]">{fileName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        Replace Image
                      </button>
                      <button
                        onClick={() => startCamera('document')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                      >
                        Camera
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 py-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Drag and drop document image here
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supports high-resolution PNG, JPG, JPEG or SVG
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      id="btn-upload-file"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/20"
                    >
                      Browse Files
                    </button>
                    <button
                      id="btn-open-camera"
                      onClick={() => startCamera('document')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700"
                    >
                      Use Camera
                    </button>
                  </div>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileChange(e, 'document')}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Facial Match Module & Action (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl space-y-4">
            {/* Header: Biometric Cross Match */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Live Facial Cross-Match
                </h3>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={selfieRequired}
                  onChange={(e) => setSelfieRequired(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Enable Face Match</span>
              </label>
            </div>

            {selfieRequired ? (
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3 space-y-3">
                <div className="flex items-center justify-center min-h-[160px] rounded-lg border border-dashed border-slate-800 bg-slate-900/40 relative overflow-hidden">
                  {selfieImage ? (
                    <div className="relative flex flex-col items-center">
                      <img
                        src={selfieImage}
                        alt="Applicant Selfie"
                        className="h-36 w-36 object-cover rounded-xl border border-slate-700 shadow-md"
                      />
                      <button
                        onClick={() => setSelfieImage(null)}
                        className="absolute -top-2 -right-2 p-1 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                        title="Remove selfie"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-3 space-y-2">
                      <div className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
                        <Camera className="w-4 h-4" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">Applicant Selfie (Optional)</p>
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => selfieInputRef.current?.click()}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-semibold"
                        >
                          Upload Photo
                        </button>
                        <button
                          onClick={() => startCamera('selfie')}
                          className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded text-[11px] font-semibold"
                        >
                          Capture Selfie
                        </button>
                      </div>
                    </div>
                  )}
                  <input
                    ref={selfieInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'selfie')}
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Performs 128-point cosine landmark matching against the document portrait and checks for screen replay / paper mask spoofing.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-400">
                Facial matching disabled. Document will be inspected strictly for tampering, font consistency, and security features.
              </div>
            )}

            {/* Run Forensic Inspection Button */}
            <div className="pt-2">
              <button
                id="btn-run-analysis"
                disabled={!documentImage || isAnalyzing}
                onClick={handleStartAnalysis}
                className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-xl ${
                  isAnalyzing
                    ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                    : !documentImage
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 text-white shadow-blue-500/25 hover:shadow-blue-500/40 ring-1 ring-blue-400/30'
                }`}
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Executing Deep Multimodal Forensics...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>Execute AI Forensic Verification</span>
                    <ArrowRight className="w-4 h-4 opacity-70" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Live Modal Overlay */}
      {cameraActive && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                <Camera className="w-4 h-4 text-blue-400" />
                <span>
                  Capture {cameraTarget === 'document' ? 'Document ID' : 'Applicant Selfie'}
                </span>
              </h3>
              <button
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {/* Document Alignment Frame */}
              <div className="absolute inset-6 border-2 border-blue-500/60 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 -mt-1 -ml-1" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 -mt-1 -mr-1" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 -mb-1 -ml-1" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 -mb-1 -mr-1" />
                <span className="text-[10px] uppercase font-bold text-blue-300/80 tracking-widest bg-slate-950/70 px-2 py-0.5 rounded">
                  Align ID Card within box
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={stopCamera}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={capturePhoto}
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30"
              >
                Capture Frame
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
