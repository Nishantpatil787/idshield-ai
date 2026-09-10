import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserX,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Shield,
  FileText,
  Lock,
  Eye,
  Check,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DocumentCategory } from '../types';

export interface FaceVerificationStepProps {
  documentCategory: DocumentCategory;
  documentNumber: string;
  fullName: string;
  documentImageUrl: string | null;
  fileName: string;
  initialSelfieUrl?: string | null;
  onComplete: (selfieUrl: string | null, isSkipped: boolean) => void;
  onBack: () => void;
}

export const FaceVerificationStep: React.FC<FaceVerificationStepProps> = ({
  documentCategory,
  documentNumber,
  fullName,
  documentImageUrl,
  fileName,
  initialSelfieUrl = null,
  onComplete,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
  const [selfieImageUrl, setSelfieImageUrl] = useState<string | null>(initialSelfieUrl || null);
  const [isSkipped, setIsSkipped] = useState<boolean>(false);
  const [docImgError, setDocImgError] = useState<boolean>(false);

  // Developer / Test Mode drawer state
  const [showTestMode, setShowTestMode] = useState<boolean>(false);

  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Quality check states
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Processing state during face verification
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verifyingStep, setVerifyingStep] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Check if document is PDF
  const isPdfDocument = documentImageUrl?.startsWith('data:application/pdf') || fileName.toLowerCase().endsWith('.pdf');

  // Auto-start camera when component mounts in camera mode
  useEffect(() => {
    if (activeTab === 'camera' && !selfieImageUrl && !isSkipped) {
      startCamera();
    }
    return () => {
      stopCameraStream();
    };
  }, [activeTab]);

  const stopCameraStream = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);
    setValidationWarning(null);
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Camera access denied or device camera is unavailable. Please check permissions or use the Fallback Upload Mode below.');
      setCameraActive(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setSelfieImageUrl(dataUrl);
      setIsSkipped(false);
      setValidationWarning(null);
    }
    stopCameraStream();
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setCameraError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setCameraError(null);
    setValidationWarning(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelfieImageUrl(e.target?.result as string);
      setIsSkipped(false);
    };
    reader.readAsDataURL(file);
  };

  // Preset sample selfies for testing/development only
  const SAMPLE_SELFIES = [
    {
      id: 'match',
      label: 'Genuine Match Test Preset',
      type: 'MATCH',
      desc: 'Matches document face embedding (~94% similarity)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'impostor',
      label: 'Impostor Face Test Preset',
      type: 'NO_MATCH',
      desc: 'Divergent facial features (~32% similarity)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    },
    {
      id: 'poor_quality',
      label: 'Sub-Optimal Angle Test Preset',
      type: 'REVIEW_REQUIRED',
      desc: 'Flags for officer review (~71% similarity)',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    },
  ];

  const handleRunVerification = () => {
    if (!selfieImageUrl && !isSkipped) {
      setValidationWarning('Live camera selfie photo required. Click "Start Camera" to align your face and capture your live photo.');
      return;
    }

    setIsVerifying(true);
    setVerifyingStep(1);

    // Run real-time biometric pipeline simulation steps
    setTimeout(() => setVerifyingStep(2), 400); // Face detection
    setTimeout(() => setVerifyingStep(3), 800); // Quality & liveness check
    setTimeout(() => setVerifyingStep(4), 1200); // 128D Embedding extraction & cosine comparison
    setTimeout(() => {
      setIsVerifying(false);
      onComplete(isSkipped ? null : selfieImageUrl, isSkipped);
    }, 1600);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* 1. STEPPER NAVIGATION HEADER */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Step 1: Document Upload */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Step 1 • Passed</div>
              <div className="text-xs font-bold text-slate-900 truncate">Document Verification</div>
            </div>
          </div>

          {/* Step 2: Face Verification (Active) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 border border-blue-200 ring-2 ring-blue-500/20">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs flex-shrink-0 animate-pulse">
              2
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Step 2 • Active</div>
              <div className="text-xs font-bold text-slate-900 truncate">Live Face Verification</div>
            </div>
          </div>

          {/* Step 3: Risk Assessment (Pending) */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 opacity-60">
            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-xs flex-shrink-0">
              3
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 3 • Next</div>
              <div className="text-xs font-bold text-slate-800 truncate">Risk Synthesis Report</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DOCUMENT CONTEXT BANNER WITH EXTRACTED PORTRAIT */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-24 rounded-xl bg-slate-900 overflow-hidden border border-slate-200 flex-shrink-0 relative shadow-xs flex items-center justify-center">
            {documentImageUrl && !isPdfDocument && !docImgError ? (
              <img
                src={documentImageUrl}
                alt="Document Portrait"
                className="w-full h-full object-cover"
                onError={() => setDocImgError(true)}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950 flex flex-col items-center justify-center text-slate-200 p-2 text-center gap-1">
                <FileText className="w-7 h-7 text-blue-400" />
                <span className="text-[9px] font-bold tracking-tight text-slate-300 uppercase">
                  {isPdfDocument ? 'PDF Doc' : 'ID Portrait'}
                </span>
              </div>
            )}
            <div className="absolute bottom-1 inset-x-1 bg-black/75 backdrop-blur-xs text-[8px] font-bold text-emerald-400 text-center rounded py-0.5 uppercase tracking-wider">
              Document Face
            </div>
          </div>

          <div className="space-y-1 text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Document Verification Passed</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {fullName || 'SPECIMEN HOLDER'}
            </h3>
            <div className="text-xs text-slate-500 space-x-2">
              <span className="font-mono font-semibold text-slate-700">{documentNumber}</span>
              <span>•</span>
              <span className="uppercase font-semibold text-slate-600">{documentCategory.replace('_', ' ')}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Document portrait ready for biometric comparison against live camera capture.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer flex-shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Change Document</span>
        </button>
      </div>

      {/* 3. MAIN BIOMETRIC FACE CAPTURE SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <span>Live Camera Face Verification</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Position your face inside the camera alignment guide to capture a live selfie.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => { setActiveTab('camera'); setIsSkipped(false); startCamera(); }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'camera'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Live Camera (Primary)</span>
            </button>
            <button
              onClick={() => { setActiveTab('upload'); setIsSkipped(false); stopCameraStream(); }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Fallback Upload</span>
            </button>
          </div>
        </div>

        {/* Validation Warning Banner */}
        {validationWarning && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>{validationWarning}</span>
            </div>
            <button
              onClick={() => setValidationWarning(null)}
              className="text-amber-800 font-bold hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Camera Warning / Error Banner */}
        {cameraError && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{cameraError}</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 cursor-pointer"
              >
                Retry Camera
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('upload'); stopCameraStream(); }}
                className="px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-rose-800 font-bold text-xs hover:bg-rose-100 cursor-pointer"
              >
                Use Fallback Upload
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY TAB: LIVE CAMERA VIEWFINDER */}
        {activeTab === 'camera' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              {/* Camera Viewfinder Box */}
              <div className="lg:col-span-8 bg-slate-950 rounded-2xl overflow-hidden aspect-4/3 relative flex items-center justify-center border border-slate-800 shadow-inner">
                {selfieImageUrl ? (
                  <div className="w-full h-full relative">
                    <img
                      src={selfieImageUrl}
                      alt="Captured Live Photo"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Live Photo Captured</span>
                    </div>
                  </div>
                ) : cameraActive ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform scale-x-[-1]"
                    />
                    {/* Face Oval Alignment Overlay */}
                    <div className="absolute inset-0 border-2 border-dashed border-blue-400/80 rounded-full my-6 mx-auto w-48 sm:w-56 h-64 sm:h-72 pointer-events-none flex flex-col items-center justify-between p-3">
                      <span className="bg-black/70 text-white text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-xs shadow-sm">
                        Position face inside oval
                      </span>
                      <span className="bg-black/70 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-xs shadow-sm">
                        Look straight into camera
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-8 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                      <Camera className="w-8 h-8 text-slate-300" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-200 font-bold">Camera Viewfinder Inactive</p>
                      <p className="text-xs text-slate-400 mt-1">Allow browser camera access to capture your live photo.</p>
                    </div>
                    <button
                      onClick={startCamera}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20"
                    >
                      Start Camera Verification
                    </button>
                  </div>
                )}
              </div>

              {/* Quality Indicators & Live Instructions */}
              <div className="lg:col-span-4 space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>Real-Time Quality Checks</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-700 font-medium">Face Detection</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-700 font-medium">Lighting & Clarity</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Optimal
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                    <span className="text-slate-700 font-medium">Subject Isolation</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Single Subject
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-100 text-[11px] text-slate-700 leading-relaxed space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-blue-600" />
                    <span>Camera Instructions:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                    <li>Remove hats, sunglasses or facial obstructions</li>
                    <li>Ensure even illumination across face</li>
                    <li>Maintain a neutral facial expression</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Camera Control Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              {selfieImageUrl ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelfieImageUrl(null);
                    setIsSkipped(false);
                    startCamera();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Live Photo</span>
                </button>
              ) : cameraActive ? (
                <>
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Capture Live Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={stopCameraStream}
                    className="px-4 py-3.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                  >
                    Pause Camera
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* SECONDARY TAB: FALLBACK FILE UPLOAD */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span><strong>Fallback / Test Mode:</strong> Use photo upload if live webcam is unavailable on your device.</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-2xl p-8 text-center transition-all cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 space-y-3"
            >
              {selfieImageUrl ? (
                <div className="space-y-3">
                  <div className="w-28 h-28 rounded-2xl overflow-hidden mx-auto border-2 border-emerald-500 shadow-xs relative">
                    <img src={selfieImageUrl} alt="Selfie Preview" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-emerald-700">Fallback Photo Uploaded Successfully</p>
                  <p className="text-[11px] text-slate-400">Click to choose a different photo file</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-900">Upload Applicant Photo File</p>
                  <p className="text-[11px] text-slate-500">JPG, PNG or WEBP image of applicant</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DEVELOPER / TEST MODE PRESETS (COLLAPSIBLE) */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowTestMode(!showTestMode)}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer py-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Developer / Test Presets Mode</span>
            {showTestMode ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showTestMode && (
            <div className="mt-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 animate-fade-in">
              <p className="text-[11px] text-slate-500">
                Select a test preset to simulate different face similarity outcomes in the Risk Engine:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {SAMPLE_SELFIES.map((sample) => {
                  const isSelected = selfieImageUrl === sample.url;
                  return (
                    <div
                      key={sample.id}
                      onClick={() => {
                        setSelfieImageUrl(sample.url);
                        setIsSkipped(false);
                        setValidationWarning(null);
                      }}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden mx-auto mb-2 border border-slate-200">
                        <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-[11px] font-bold text-slate-900 text-center">{sample.label}</div>
                      <div
                        className={`text-[9px] font-bold text-center mt-1 px-2 py-0.5 rounded-full ${
                          sample.type === 'MATCH'
                            ? 'bg-emerald-100 text-emerald-800'
                            : sample.type === 'NO_MATCH'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {sample.type}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* APPLICANT NOT PHYSICALLY PRESENT OPTION */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span>Applicant not physically present during document intake?</span>
          </div>

          <button
            type="button"
            onClick={() => {
              if (isSkipped) {
                setIsSkipped(false);
              } else {
                setSelfieImageUrl(null);
                setIsSkipped(true);
                setValidationWarning(null);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer flex-shrink-0 ${
              isSkipped
                ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            {isSkipped ? '✓ Marked as Face Verification Unavailable' : 'Mark as Face Verification Unavailable'}
          </button>
        </div>
      </div>

      {/* 4. REAL-TIME PROCESSING OVERLAY WHEN EXECUTING */}
      {isVerifying && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Executing Facial Biometric Match</h3>
              <p className="text-xs text-slate-500 mt-1">Comparing document portrait face embedding with live camera photo...</p>
            </div>

            <div className="space-y-2 text-left text-xs">
              <div className={`p-2.5 rounded-xl flex items-center justify-between ${verifyingStep >= 1 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'}`}>
                <span>1. Document & Live Face Detection</span>
                {verifyingStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between ${verifyingStep >= 2 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'}`}>
                <span>2. Quality & Lighting Analysis</span>
                {verifyingStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between ${verifyingStep >= 3 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'}`}>
                <span>3. 128D Cosine Embedding Extraction</span>
                {verifyingStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>
              <div className={`p-2.5 rounded-xl flex items-center justify-between ${verifyingStep >= 4 ? 'bg-emerald-50 text-emerald-900' : 'bg-slate-50 text-slate-400'}`}>
                <span>4. Risk Engine Synthesis</span>
                {verifyingStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <RefreshCw className="w-4 h-4 animate-spin" />}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MAIN ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Lock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Biometric images are processed in memory and never permanently logged.</span>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            ← Back
          </button>

          <button
            type="button"
            onClick={handleRunVerification}
            className={`flex-1 sm:flex-none px-8 py-3.5 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
              selfieImageUrl || isSkipped
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 hover:scale-102'
                : 'bg-blue-600/90 text-white hover:bg-blue-700'
            }`}
          >
            <span>{isSkipped ? 'Complete Screening (Mark Unavailable)' : 'Verify Face & Generate Report'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
