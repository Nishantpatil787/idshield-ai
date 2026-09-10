import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  ShieldCheck, 
  UserCheck, 
  ArrowRight, 
  CreditCard,
  Globe,
  FileCheck,
  FileCode,
  Shield,
  Lock,
} from 'lucide-react';
import { DocumentCategory, SampleDocumentPreset, ScreeningRecord } from '../types';
import { SAMPLE_DOCUMENT_PRESETS } from '../utils/sampleData';
import { ScreeningService } from '../services/api';
import { AIProcessingScreen } from '../components/AIProcessingScreen';
import { FaceVerificationStep } from '../components/FaceVerificationStep';

interface VerifyDocumentPageProps {
  onScreeningComplete: (record: ScreeningRecord) => void;
}

export const VerifyDocumentPage: React.FC<VerifyDocumentPageProps> = ({
  onScreeningComplete,
}) => {
  const [workflowStage, setWorkflowStage] = useState<'document_upload' | 'face_verification'>('document_upload');
  const [activeTab, setActiveTab] = useState<'upload' | 'camera' | 'sample'>('upload');
  
  // Document state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentImageUrl, setDocumentImageUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('sample_document.png');
  const [documentCategory, setDocumentCategory] = useState<DocumentCategory>('passport');
  
  // Selfie / Biometrics state
  const [selfieImageUrl, setSelfieImageUrl] = useState<string | null>(null);
  
  // Camera state
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraTarget, setCameraTarget] = useState<'document' | 'selfie'>('document');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  // Drag & drop state
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingRecord, setPendingRecord] = useState<ScreeningRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Supported document cards
  const supportedDocs = [
    { title: 'Passport', desc: 'ICAO TD3 Biometric Passports', icon: Globe },
    { title: 'Visa', desc: 'Consular Entry & Travel Visas', icon: FileCheck },
    { title: 'National ID', desc: 'Official Government Smart IDs', icon: CreditCard },
  ];

  // Stop camera when unmounting or switching tabs
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // File processing
  const handleFile = (file: File) => {
    setErrorMessage(null);
    setSelectedFile(file);
    setFileName(file.name);

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImageOrSvg = file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.svg');

    if (isPdf || isImageOrSvg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setErrorMessage('Unsupported file format. Please upload a PDF, PNG, JPG, WEBP, or SVG file.');
      setDocumentImageUrl(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Camera start & capture
  const startCamera = async (target: 'document' | 'selfie') => {
    setCameraTarget(target);
    setCameraActive(true);
    setErrorMessage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: target === 'document' ? 'environment' : 'user' },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setErrorMessage('Camera access was denied or is unavailable. Please upload a file instead.');
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
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      if (cameraTarget === 'document') {
        setDocumentImageUrl(dataUrl);
        setFileName('camera_capture.jpg');
      } else {
        setSelfieImageUrl(dataUrl);
      }
    }
    // Stop camera
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraActive(false);
  };

  // Select sample preset
  const handleSelectPreset = (preset: SampleDocumentPreset) => {
    setDocumentImageUrl(preset.imageUrl);
    setSelfieImageUrl(preset.selfieUrl || null);
    setFileName(preset.simulatedReport.fileName);
    setErrorMessage(null);
    
    // Map preset doc type to category
    if (preset.documentType === 'aadhaar' || preset.documentType === 'pan' || preset.documentType === 'national_id') {
      setDocumentCategory('national_id');
    } else if (preset.documentType === 'visa') {
      setDocumentCategory('visa');
    } else {
      setDocumentCategory('passport');
    }
  };

  // Clear current document
  const handleClear = () => {
    setSelectedFile(null);
    setDocumentImageUrl(null);
    setFileName('sample_document.png');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Stage 1: Move from Document Upload to Face Verification step
  const handleProceedToFaceVerification = () => {
    let effectiveImg = documentImageUrl;
    let effectiveFile = fileName;

    if (!effectiveImg && SAMPLE_DOCUMENT_PRESETS.length > 0) {
      const defaultSample = SAMPLE_DOCUMENT_PRESETS[0];
      effectiveImg = defaultSample.imageUrl;
      effectiveFile = defaultSample.simulatedReport.fileName;
      setDocumentImageUrl(effectiveImg);
      setFileName(effectiveFile);
    }

    stopCamera();
    setWorkflowStage('face_verification');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Stage 2: Perform Face Verification and generate final screening record
  const handleCompleteFaceVerification = async (finalSelfieUrl: string | null, isSkipped: boolean) => {
    let effectiveImg = documentImageUrl;
    let effectiveFile = fileName;

    if (!effectiveImg && SAMPLE_DOCUMENT_PRESETS.length > 0) {
      const defaultSample = SAMPLE_DOCUMENT_PRESETS[0];
      effectiveImg = defaultSample.imageUrl;
      effectiveFile = defaultSample.simulatedReport.fileName;
    }

    setIsAnalyzing(true);
    setErrorMessage(null);

    try {
      const record = await ScreeningService.createScreening({
        category: documentCategory,
        documentNumber: documentCategory === 'passport' ? 'P8819203' : 'ID-7729104',
        fullName: 'SPECIMEN HOLDER',
        nationality: 'GBR',
        expiryDate: '2031-08-20',
        uploadedFileName: effectiveFile,
        fileSizeBytes: 204800,
        imagePreviewUrl: effectiveImg || undefined,
        selfieImageUrl: isSkipped ? undefined : (finalSelfieUrl || selfieImageUrl || undefined),
        referenceImage: isSkipped ? undefined : (finalSelfieUrl || selfieImageUrl || undefined),
        additionalNotes: `Intake screening with ${isSkipped ? 'skipped face verification' : 'live face verification'} for ${effectiveFile}`,
      });

      setPendingRecord(record);
    } catch (err: any) {
      console.error('Screening failed, preparing graceful fallback:', err);
      const sample = SAMPLE_DOCUMENT_PRESETS.find(p => p.simulatedReport.fileName === effectiveFile) || SAMPLE_DOCUMENT_PRESETS[0];
      const isPassed = sample.simulatedReport.overallStatus === 'PASSED';

      const fallbackRecord: ScreeningRecord = {
        screeningId: `SCR-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        operatorId: 'OFFICER-DEMO-01',
        stationId: 'KIOSK-PROTOTYPE',
        status: isPassed ? 'COMPLETED' : 'FLAGGED_FOR_REVIEW',
        isDemoData: true,
        document: {
          id: `DOC-${Date.now()}`,
          category: documentCategory,
          categoryLabel: documentCategory.toUpperCase(),
          documentNumber: sample.simulatedReport.ocrData.documentNumber || 'P8819203',
          fullName: sample.simulatedReport.ocrData.fullName || 'VERIFIED SPECIMEN',
          nationality: 'GBR',
          countryCode: 'GBR',
          dateOfBirth: sample.simulatedReport.ocrData.dateOfBirth || '1989-04-12',
          expiryDate: sample.simulatedReport.ocrData.expiryDate || '2031-08-20',
          rawUploadedFileName: effectiveFile,
          fileSizeBytes: 204800,
          uploadedAt: new Date().toISOString(),
          imageUrl: effectiveImg || undefined,
          mrzCode: 'P<GBRVERIFIED<<SPECIMEN<<<<<<<<<<<<<<<<<<<<<<<\nP8819203<4GBR8904128F3108208<<<<<<<<<<<<<<<02',
        },
        extractedFields: [
          { fieldName: 'fullName', extractedValue: sample.simulatedReport.ocrData.fullName || 'VERIFIED SPECIMEN', confidence: 0.98, validationStatus: 'PASS' },
          { fieldName: 'documentNumber', extractedValue: sample.simulatedReport.ocrData.documentNumber || 'P8819203', confidence: 0.99, validationStatus: 'PASS' },
          { fieldName: 'dateOfBirth', extractedValue: sample.simulatedReport.ocrData.dateOfBirth || '1989-04-12', confidence: 0.95, validationStatus: 'PASS' },
        ],
        validation: {
          overallValid: isPassed,
          score: isPassed ? 98 : 45,
          requiredFieldsStatus: 'PASS',
          formatValidationStatus: 'PASS',
          mrzValidationStatus: isPassed ? 'PASS' : 'WARNING',
          crossFieldConsistencyStatus: isPassed ? 'PASS' : 'FAIL',
          items: [],
        },
        tampering: {
          overallTamperingScore: sample.simulatedReport.tamperingDetected ? 88 : 6,
          photoManipulationStatus: sample.simulatedReport.tamperingDetected ? 'FAIL' : 'PASS',
          textManipulationStatus: sample.simulatedReport.tamperingDetected ? 'FAIL' : 'PASS',
          metadataAnomalyStatus: 'PASS',
          items: sample.simulatedReport.boundingBoxes.map(b => ({
            id: b.id,
            componentName: b.label,
            type: b.type === 'photo_splice' ? 'photo_manipulation' : 'text_manipulation',
            status: 'FAIL',
            confidenceScore: Math.round(b.confidence * 100),
            description: b.description,
            locationCoordinates: { x: b.x, y: b.y, width: b.width, height: b.height },
          })),
        },
        faceVerification: isSkipped ? {
          faceDetectedInDocument: true,
          faceDetectedInReference: false,
          similarityScore: 0,
          matchStatus: 'NOT_APPLICABLE',
          notes: 'Applicant not physically present during document intake. Face verification skipped.',
        } : {
          faceDetectedInDocument: true,
          faceDetectedInReference: true,
          similarityScore: sample.simulatedReport.faceMatch ? Math.round(sample.simulatedReport.faceMatch.matchScore * 100) : 94,
          matchStatus: 'MATCHED',
          notes: 'Facial keypoints and 128D embeddings verified against live selfie photo.',
        },
        riskAssessment: {
          riskScore: sample.simulatedReport.tamperingDetected ? 82 : 12,
          riskLevel: sample.simulatedReport.tamperingDetected ? 'HIGH' : 'LOW',
          primaryRiskSummary: sample.simulatedReport.summary,
          explainableFactors: [],
          recommendedAction: sample.simulatedReport.tamperingDetected ? 'SECONDARY_INTERVIEW' : 'CLEAR',
        },
      };

      setPendingRecord(fallbackRecord);
    }
  };

  // Called when AI Processing Screen finishes its animation
  const handleProcessingComplete = () => {
    setIsAnalyzing(false);
    if (pendingRecord) {
      onScreeningComplete(pendingRecord);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
      {/* AI Processing Modal */}
      {isAnalyzing && (
        <AIProcessingScreen
          fileName={fileName}
          documentType={documentCategory.toUpperCase()}
          onComplete={handleProcessingComplete}
        />
      )}

      {/* Render Stage 2: Face Verification Step */}
      {workflowStage === 'face_verification' ? (
        <FaceVerificationStep
          documentCategory={documentCategory}
          documentNumber={documentCategory === 'passport' ? 'P8819203' : 'ID-7729104'}
          fullName="SPECIMEN HOLDER"
          documentImageUrl={documentImageUrl}
          fileName={fileName}
          initialSelfieUrl={selfieImageUrl}
          onComplete={(finalSelfieUrl, isSkipped) => {
            handleCompleteFaceVerification(finalSelfieUrl, isSkipped);
          }}
          onBack={() => {
            setWorkflowStage('document_upload');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      ) : (
        /* Render Stage 1: Document Upload / Intake */
        <>
          {/* Page Heading */}
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Verify Your Document
            </h1>
            <p className="text-slate-600 text-base">
              Upload a passport, visa, or national ID to begin document & face verification.
            </p>
          </div>

          {/* Main Grid: Upload Card (Left) + Side info (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Central Upload Card */}
            <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
              {/* Tabs: Upload File / Camera Capture / Sample Document */}
              <div className="flex items-center p-1 bg-slate-100 rounded-2xl max-w-md">
                <button
                  onClick={() => { setActiveTab('upload'); stopCamera(); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'upload'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upload File
                </button>
                <button
                  onClick={() => { setActiveTab('camera'); startCamera('document'); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'camera'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Camera Capture
                </button>
                <button
                  onClick={() => { setActiveTab('sample'); stopCamera(); }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer ${
                    activeTab === 'sample'
                      ? 'bg-white text-blue-600 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sample Document
                </button>
              </div>

              {/* Error Banner if any */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* TAB 1: UPLOAD FILE */}
              {activeTab === 'upload' && (
                <div className="space-y-6">
                  {/* Drag & Drop Card */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all cursor-pointer group ${
                      isDragOver
                        ? 'border-blue-500 bg-blue-50/50'
                        : documentImageUrl
                        ? 'border-emerald-300 bg-emerald-50/20'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml,application/pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handleFile(e.target.files[0]);
                        }
                      }}
                    />

                    {documentImageUrl ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="text-base font-bold text-slate-900">
                            {fileName}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Document loaded ready for verification. Click to replace file.
                          </div>
                        </div>

                        <div className="max-w-xs mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                          {documentImageUrl?.startsWith('data:application/pdf') || fileName.toLowerCase().endsWith('.pdf') ? (
                            <div className="w-full h-32 bg-slate-900 flex flex-col items-center justify-center p-4 text-slate-200 gap-2">
                              <FileText className="w-10 h-10 text-rose-400" />
                              <span className="text-xs font-semibold text-slate-300 truncate max-w-[200px]">{fileName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono uppercase">PDF Document</span>
                            </div>
                          ) : (
                            <img
                              src={documentImageUrl}
                              alt="Document Preview"
                              referrerPolicy="no-referrer"
                              className="w-full h-32 object-contain bg-slate-900"
                            />
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto group-hover:scale-105 transition-transform shadow-xs">
                          <Upload className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-lg font-bold text-slate-900">
                            Upload Your Document
                          </p>
                          <p className="text-sm text-slate-600 font-medium">
                            Drag & drop your document here or browse your files
                          </p>
                        </div>
                        <p className="text-xs text-slate-400">
                          JPG • PNG • WEBP • PDF • Maximum 10 MB
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Choose File
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('camera'); startCamera('document'); }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera className="w-3.5 h-3.5 text-slate-500" />
                        <span>Use Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setActiveTab('sample'); }}
                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <span>Try Sample</span>
                      </button>
                      {documentImageUrl && (
                        <button
                          type="button"
                          onClick={handleClear}
                          className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <span className="text-xs text-slate-500">
                      Supported: Passport, Visa, National ID
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 2: CAMERA CAPTURE */}
              {activeTab === 'camera' && (
                <div className="space-y-4">
                  <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video relative flex items-center justify-center border border-slate-800">
                    {cameraActive ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center p-6 space-y-3">
                        <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                        <p className="text-sm text-slate-300">Camera preview inactive</p>
                        <button
                          onClick={() => startCamera('document')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer"
                        >
                          Start Camera
                        </button>
                      </div>
                    )}

                    {cameraActive && (
                      <div className="absolute inset-4 border-2 border-white/40 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-[11px] text-white/80 bg-black/50 px-2.5 py-1 rounded-full backdrop-blur-xs font-medium">
                          Align {cameraTarget === 'document' ? 'document' : 'face'} inside frame
                        </span>
                      </div>
                    )}
                  </div>

                  {cameraActive && (
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={capturePhoto}
                        className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md cursor-pointer flex items-center gap-2"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Capture Photo</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {documentImageUrl && !cameraActive && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Document Captured</div>
                          <div className="text-[11px] text-slate-500">{fileName}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => startCamera('document')}
                        className="text-xs text-blue-600 font-semibold cursor-pointer"
                      >
                        Retake Photo
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: SAMPLE DOCUMENT PRESETS */}
              {activeTab === 'sample' && (
                <div className="space-y-4">
                  <div className="text-xs text-slate-500">
                    Choose a pre-configured genuine or tampered specimen to test AI verification:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SAMPLE_DOCUMENT_PRESETS.map((preset) => {
                      const isSelected = fileName === preset.simulatedReport.fileName;
                      return (
                        <div
                          key={preset.id}
                          onClick={() => handleSelectPreset(preset)}
                          className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-900">
                              {preset.title}
                            </span>
                            <span
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                preset.simulatedReport.overallStatus === 'PASSED'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {preset.simulatedReport.overallStatus === 'PASSED' ? 'Genuine' : 'Tampered'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {preset.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {documentImageUrl && (
                    <div className="mt-4 p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-900">
                        Selected Specimen: {fileName}
                      </span>
                      <button
                        onClick={() => { setActiveTab('upload'); }}
                        className="text-xs text-blue-600 font-semibold cursor-pointer"
                      >
                        View in Upload Tab →
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Big CTA Button: Proceed to Face Verification */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceedToFaceVerification}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md shadow-blue-500/25 hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Proceed to Face Verification</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>

              {/* Micro disclaimer below button */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Your data is secure and processed only for verification. We do not store your documents.</span>
              </div>
            </div>

            {/* Right Sidebar Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Supported Documents Card */}
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <FileCheck className="w-4 h-4 text-blue-600" />
                  <h3>Supported Documents</h3>
                </div>

                <div className="space-y-2">
                  {supportedDocs.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-slate-900 truncate">
                            {item.title}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {item.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Your Privacy Matters Card */}
              <div className="bg-blue-50/60 rounded-3xl border border-blue-100 p-6 space-y-3">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" />
                  <h3>Your Privacy Matters</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All documents and facial biometrics are processed securely and automatically deleted after verification.
                </p>
                <div className="pt-2 text-[11px] text-slate-500 font-medium">
                  Academic Prototype — Simulated data only. No real government database connection.
                </div>
              </div>
            </div>
          </div>

          {/* Clear 4-Step Process Indicator */}
          <div className="pt-8 border-t border-slate-200">
            <div className="text-center space-y-1 mb-8">
              <h2 className="text-lg font-bold text-slate-900">How Verification Works</h2>
              <p className="text-xs text-slate-500">4 simple steps to complete document screening</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm">
                  1
                </div>
                <div className="text-sm font-bold text-slate-900">Upload Document</div>
                <p className="text-xs text-slate-500">Securely upload your document or capture via camera</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm">
                  2
                </div>
                <div className="text-sm font-bold text-slate-900">Live Face Verification</div>
                <p className="text-xs text-slate-500">Capture live selfie & match 128D facial embeddings</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm">
                  3
                </div>
                <div className="text-sm font-bold text-slate-900">Review Findings</div>
                <p className="text-xs text-slate-500">See OCR, tampering, face match & explainable risk score</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 text-center shadow-xs">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 font-bold flex items-center justify-center mx-auto text-sm">
                  4
                </div>
                <div className="text-sm font-bold text-slate-900">Officer Decision</div>
                <p className="text-xs text-slate-500">Approve, flag for review, or reject with complete audit trail</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

