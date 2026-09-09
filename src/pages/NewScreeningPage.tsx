import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Shield, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  ArrowRight,
  Sparkles,
  Info,
  CreditCard,
  Globe,
  FileCheck,
  FileCode,
  Tag,
  Plus,
  Trash2,
  Layers,
  HelpCircle,
  FolderPlus
} from 'lucide-react';
import { DocumentCategory, ScreeningRecord } from '../types';
import { ScreeningService, SupportingDocumentPayload } from '../services/api';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

interface NewScreeningPageProps {
  onScreeningCreated: (screening: ScreeningRecord) => void;
  onCancel: () => void;
}

interface SupportingDocState {
  id: string;
  category: DocumentCategory;
  documentNumber: string;
  associatedPassportNumber: string;
  fullName: string;
  nationality: string;
  dateOfBirth: string;
  issueDate: string;
  expiryDate: string;
  gender: string;
  visaType: string;
  fileName?: string;
  fileSizeBytes?: number;
  previewUrl?: string;
}

export const NewScreeningPage: React.FC<NewScreeningPageProps> = ({
  onScreeningCreated,
  onCancel,
}) => {
  const [category, setCategory] = useState<DocumentCategory>('passport');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentNumber, setDocumentNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [nationality, setNationality] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [notes, setNotes] = useState('');
  const [supportingDocs, setSupportingDocs] = useState<SupportingDocState[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories: Array<{ id: DocumentCategory; label: string; desc: string; icon: React.FC<{ className?: string }> }> = [
    { id: 'passport', label: 'Passport', desc: 'ICAO 9303 Standard Biometric / Machine Readable', icon: Globe },
    { id: 'visa', label: 'Visa / e-Visa', desc: 'Electronic Entry Clearance or Consular Visa', icon: FileCheck },
    { id: 'national_id', label: 'National ID', desc: 'State Identity Card with Hologram / Chip', icon: CreditCard },
    { id: 'driving_licence', label: 'Driving Licence', desc: 'Physical / Digital Driver Authorization', icon: FileText },
    { id: 'permit', label: 'Travel Permit', desc: 'Cross-Border or Temporary Resident Permit', icon: FileCode },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    setError(null);
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddSupportingDoc = (cat: DocumentCategory = 'visa') => {
    const newDoc: SupportingDocState = {
      id: `SUP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      category: cat,
      documentNumber: cat === 'visa' ? `VS-${Math.floor(1000000 + Math.random() * 8999999)}` : `PRM-${Math.floor(100000 + Math.random() * 899999)}`,
      associatedPassportNumber: documentNumber || '',
      fullName: fullName || '',
      nationality: nationality || '',
      dateOfBirth: dateOfBirth || '',
      issueDate: '2024-01-15',
      expiryDate: '2027-01-15',
      gender: 'M',
      visaType: cat === 'visa' ? 'Tourist / Business' : 'Resident Transit',
    };
    setSupportingDocs([...supportingDocs, newDoc]);
  };

  const handleUpdateSupportingDoc = (id: string, updates: Partial<SupportingDocState>) => {
    setSupportingDocs(supportingDocs.map(doc => doc.id === id ? { ...doc, ...updates } : doc));
  };

  const handleRemoveSupportingDoc = (id: string) => {
    setSupportingDocs(supportingDocs.filter(doc => doc.id !== id));
  };

  // Quick preset loader helper
  const applyPreset = (presetType: 'standard_passport' | 'consistent_visa' | 'dob_mismatch_visa' | 'passport_link_mismatch') => {
    setError(null);
    if (presetType === 'standard_passport') {
      setCategory('passport');
      setDocumentNumber('P8819203');
      setFullName('SMITH, JOHN ALEXANDER');
      setNationality('UNITED KINGDOM');
      setDateOfBirth('1989-04-12');
      setExpiryDate('2031-08-20');
      setNotes('Standard single-document passport screening');
      setSupportingDocs([]);
      // Mock File object
      const dummyBlob = new Blob(['sample-img'], { type: 'image/png' });
      const file = new File([dummyBlob], 'passport_smith_j.png', { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl('data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300" style="background:#0f172a; border-radius:8px;">
          <rect width="500" height="40" fill="#1e3a8a"/>
          <text x="20" y="26" fill="#fff" font-family="monospace" font-weight="bold" font-size="14">PASSPORT SPECIMEN (P8819203)</text>
          <text x="20" y="80" fill="#94a3b8" font-family="sans-serif" font-size="11">HOLDER: SMITH, JOHN ALEXANDER</text>
          <text x="20" y="110" fill="#94a3b8" font-family="sans-serif" font-size="11">DOB: 1989-04-12 | NAT: GBR</text>
          <text x="20" y="140" fill="#94a3b8" font-family="sans-serif" font-size="11">EXPIRY: 2031-08-20</text>
          <rect x="20" y="200" width="460" height="70" fill="#020617" rx="4"/>
          <text x="30" y="230" fill="#64748b" font-family="monospace" font-size="11">P&lt;GBRSMITH&lt;&lt;JOHN&lt;ALEXANDER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="30" y="250" fill="#64748b" font-family="monospace" font-size="11">P8819203&lt;4GBR8904128M3108204&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06</text>
        </svg>
      `));
    } else if (presetType === 'consistent_visa') {
      setCategory('passport');
      setDocumentNumber('K4891024');
      setFullName('NAKAMURA, KENJI');
      setNationality('JAPAN');
      setDateOfBirth('1988-06-15');
      setExpiryDate('2032-06-14');
      setNotes('Multi-document intake: Primary Passport with accompanying e-Visa. Consistent biographical data.');
      const dummyBlob = new Blob(['sample-img'], { type: 'image/png' });
      const file = new File([dummyBlob], 'passport_nakamura_k.png', { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl('data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300" style="background:#0f172a; border-radius:8px;">
          <rect width="500" height="40" fill="#1e3a8a"/>
          <text x="20" y="26" fill="#fff" font-family="monospace" font-weight="bold" font-size="14">PASSPORT (K4891024) - JAPAN</text>
          <text x="20" y="80" fill="#94a3b8" font-family="sans-serif" font-size="11">NAME: NAKAMURA, KENJI</text>
          <text x="20" y="110" fill="#94a3b8" font-family="sans-serif" font-size="11">DOB: 1988-06-15 | NAT: JPN</text>
          <text x="20" y="140" fill="#94a3b8" font-family="sans-serif" font-size="11">EXPIRY: 2032-06-14</text>
          <rect x="20" y="200" width="460" height="70" fill="#020617" rx="4"/>
          <text x="30" y="230" fill="#64748b" font-family="monospace" font-size="11">P&lt;JPNNAKAMURA&lt;&lt;KENJI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="30" y="250" fill="#64748b" font-family="monospace" font-size="11">K4891024&lt;5JPN8806152M3206148&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;08</text>
        </svg>
      `));
      setSupportingDocs([
        {
          id: 'SUP-VISA-01',
          category: 'visa',
          documentNumber: 'VS-JPN-2026-991',
          associatedPassportNumber: 'K4891024',
          fullName: 'KENJI NAKAMURA',
          nationality: 'JAPAN',
          dateOfBirth: '1988-06-15',
          issueDate: '2025-01-10',
          expiryDate: '2027-01-10',
          gender: 'M',
          visaType: 'Business / Long-Stay',
          fileName: 'visa_nakamura_k.png',
        },
      ]);
    } else if (presetType === 'dob_mismatch_visa') {
      setCategory('passport');
      setDocumentNumber('A9182304');
      setFullName('GARCIA, ALEJANDRO TOMAS');
      setNationality('SPAIN');
      setDateOfBirth('1984-11-25');
      setExpiryDate('2030-05-18');
      setNotes('Multi-document intake: Passport DOB is 1984-11-25, but Visa indicates 1974-11-25 (10-year discrepancy).');
      const dummyBlob = new Blob(['sample-img'], { type: 'image/png' });
      const file = new File([dummyBlob], 'passport_garcia_a.png', { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl('data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300" style="background:#0f172a; border-radius:8px;">
          <rect width="500" height="40" fill="#7c2d12"/>
          <text x="20" y="26" fill="#fff" font-family="monospace" font-weight="bold" font-size="14">PASSPORT (A9182304) - SPAIN</text>
          <text x="20" y="80" fill="#94a3b8" font-family="sans-serif" font-size="11">NAME: GARCIA, ALEJANDRO TOMAS</text>
          <text x="20" y="110" fill="#94a3b8" font-family="sans-serif" font-size="11">DOB: 1984-11-25 | NAT: ESP</text>
          <text x="20" y="140" fill="#94a3b8" font-family="sans-serif" font-size="11">EXPIRY: 2030-05-18</text>
          <rect x="20" y="200" width="460" height="70" fill="#020617" rx="4"/>
          <text x="30" y="230" fill="#64748b" font-family="monospace" font-size="11">P&lt;ESPGARCIA&lt;&lt;ALEJANDRO&lt;TOMAS&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="30" y="250" fill="#64748b" font-family="monospace" font-size="11">A9182304&lt;2ESP8411254M3005188&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;06</text>
        </svg>
      `));
      setSupportingDocs([
        {
          id: 'SUP-VISA-02',
          category: 'visa',
          documentNumber: 'VS-ESP-99410',
          associatedPassportNumber: 'A9182304',
          fullName: 'ALEJANDRO GARCIA',
          nationality: 'SPAIN',
          dateOfBirth: '1974-11-25', // 10 year difference
          issueDate: '2024-01-01',
          expiryDate: '2028-12-31',
          gender: 'M',
          visaType: 'Work / Employment',
          fileName: 'visa_garcia_a.png',
        },
      ]);
    } else if (presetType === 'passport_link_mismatch') {
      setCategory('passport');
      setDocumentNumber('B7740192');
      setFullName('CHEN, WEI');
      setNationality('CHINA');
      setDateOfBirth('1993-02-18');
      setExpiryDate('2033-02-17');
      setNotes('Multi-document intake: Visa references a different passport number (B9999999 vs B7740192).');
      const dummyBlob = new Blob(['sample-img'], { type: 'image/png' });
      const file = new File([dummyBlob], 'passport_chen_w.png', { type: 'image/png' });
      setSelectedFile(file);
      setPreviewUrl('data:image/svg+xml;utf8,' + encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 300" width="500" height="300" style="background:#0f172a; border-radius:8px;">
          <rect width="500" height="40" fill="#1e3a8a"/>
          <text x="20" y="26" fill="#fff" font-family="monospace" font-weight="bold" font-size="14">PASSPORT (B7740192) - CHINA</text>
          <text x="20" y="80" fill="#94a3b8" font-family="sans-serif" font-size="11">NAME: CHEN, WEI</text>
          <text x="20" y="110" fill="#94a3b8" font-family="sans-serif" font-size="11">DOB: 1993-02-18 | NAT: CHN</text>
          <text x="20" y="140" fill="#94a3b8" font-family="sans-serif" font-size="11">EXPIRY: 2033-02-17</text>
          <rect x="20" y="200" width="460" height="70" fill="#020617" rx="4"/>
          <text x="30" y="230" fill="#64748b" font-family="monospace" font-size="11">P&lt;CHNCHEN&lt;&lt;WEI&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
          <text x="30" y="250" fill="#64748b" font-family="monospace" font-size="11">B7740192&lt;1CHN9302188M3302172&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text>
        </svg>
      `));
      setSupportingDocs([
        {
          id: 'SUP-VISA-03',
          category: 'visa',
          documentNumber: 'VS-CHN-55019',
          associatedPassportNumber: 'B9999999', // Linkage mismatch
          fullName: 'WEI CHEN',
          nationality: 'CHINA',
          dateOfBirth: '1993-02-18',
          issueDate: '2024-05-01',
          expiryDate: '2026-05-01',
          gender: 'M',
          visaType: 'Student Clearance',
          fileName: 'visa_chen_w.png',
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please upload a document image or scan before initiating screening.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const supportingPayload: SupportingDocumentPayload[] = supportingDocs.map(doc => ({
        id: doc.id,
        category: doc.category,
        categoryLabel: doc.category === 'visa' ? 'Electronic Travel Visa' : doc.category === 'permit' ? 'Border Permit' : 'Supporting Document',
        documentNumber: doc.documentNumber,
        associatedPassportNumber: doc.associatedPassportNumber || undefined,
        fullName: doc.fullName,
        nationality: doc.nationality,
        dateOfBirth: doc.dateOfBirth || undefined,
        issueDate: doc.issueDate || undefined,
        expiryDate: doc.expiryDate || undefined,
        gender: doc.gender || undefined,
        visaType: doc.visaType || undefined,
        rawUploadedFileName: doc.fileName || `${doc.category}_specimen.png`,
        fileSizeBytes: doc.fileSizeBytes || 1200000,
        imagePreviewUrl: doc.previewUrl,
      }));

      const newScreening = await ScreeningService.createScreening({
        category,
        documentNumber: documentNumber.trim() || undefined,
        fullName: fullName.trim() || undefined,
        nationality: nationality.trim() || undefined,
        expiryDate: expiryDate.trim() || undefined,
        uploadedFileName: selectedFile.name,
        fileSizeBytes: selectedFile.size,
        imagePreviewUrl: previewUrl || undefined,
        additionalNotes: notes.trim() || undefined,
        supportingDocuments: supportingPayload.length > 0 ? supportingPayload : undefined,
      });

      onScreeningCreated(newScreening);
    } catch (err) {
      console.error('Failed to create screening:', err);
      setError('An error occurred while queueing the document for screening analysis.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="border-b border-slate-800 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold font-mono text-white tracking-tight flex items-center gap-2">
              <span>INTAKE: NEW DOCUMENT SCREENING</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                MULTI-CREDENTIAL PIPELINE
              </span>
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Upload primary identity credential scans and optionally attach supporting visas or permits for cross-document consistency verification.
            </p>
          </div>
        </div>

        {/* Quick Test Presets Bar */}
        <div className="mt-3.5 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Evaluation Test Specimen Presets:</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">1-Click Scenario Loaders</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('standard_passport')}
              className="px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono text-left transition-colors"
            >
              <div className="font-bold text-sky-400">1. Single Passport</div>
              <div className="text-[10px] text-slate-500">Standard Biometric</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('consistent_visa')}
              className="px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono text-left transition-colors"
            >
              <div className="font-bold text-emerald-400">2. Passport + Visa</div>
              <div className="text-[10px] text-slate-500">100% Data Parity</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('dob_mismatch_visa')}
              className="px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono text-left transition-colors"
            >
              <div className="font-bold text-amber-400">3. DOB Mismatch</div>
              <div className="text-[10px] text-slate-500">Cross-Doc Anomaly</div>
            </button>
            <button
              type="button"
              onClick={() => applyPreset('passport_link_mismatch')}
              className="px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono text-left transition-colors"
            >
              <div className="font-bold text-rose-400">4. Linkage Mismatch</div>
              <div className="text-[10px] text-slate-500">Passport Number Gap</div>
            </button>
          </div>
        </div>
      </div>

      <DisclaimerBanner />

      <form onSubmit={handleSubmit} className="space-y-6 font-mono">
        {/* Step 1: Select Primary Document Category */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[11px]">1</span>
              <span>Primary Document Category</span>
            </label>
            <span className="text-[11px] text-slate-500">Select standard format</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`
                    p-3 rounded-lg border text-left transition-all flex flex-col justify-between
                    ${
                      isSelected
                        ? 'bg-sky-950/70 border-sky-600 text-sky-100 shadow-sm'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                    <span className="text-xs font-bold">{cat.label}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 leading-snug">
                    {cat.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Upload Primary File Area */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[11px]">2</span>
              <span>Upload Primary Document Scan or Image</span>
            </label>
            <span className="text-[11px] text-slate-500">Supports PNG, JPG, PDF (Max 15MB)</span>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp, application/pdf"
            onChange={handleFileChange}
            className="hidden"
            id="doc-upload-input"
          />

          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${
                  dragActive
                    ? 'border-sky-500 bg-sky-950/30 text-sky-200'
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 text-slate-400'
                }
              `}
            >
              <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-sky-400 mb-3">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="text-sm font-semibold text-slate-200">
                Click to browse or drag & drop primary document file here
              </div>
              <p className="text-xs text-slate-400 mt-1">
                High resolution scan recommended for OCR & MRZ parity extraction
              </p>
            </div>
          ) : (
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Document preview"
                    className="w-16 h-12 object-cover rounded border border-slate-700 bg-slate-900 flex-shrink-0"
                  />
                ) : (
                  <div className="w-16 h-12 rounded border border-slate-700 bg-slate-900 flex items-center justify-center text-slate-400 flex-shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                )}
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Ready for intake
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClearFile}
                className="px-3 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 flex-shrink-0"
              >
                <X className="w-3.5 h-3.5" />
                <span>Replace</span>
              </button>
            </div>
          )}
        </div>

        {/* Step 3: Primary Document Metadata (Optional) */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[11px]">3</span>
              <span>Primary Document Parameters (Optional)</span>
            </label>
            <span className="text-[10px] text-slate-500">Auto-extracted via OCR if left blank</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Document Number / Serial
              </label>
              <input
                type="text"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="e.g. PA99182301"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Holder Full Name (SURNAME, Given)
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. SMITH, JOHN ALEXANDER"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Issuing Country / Citizenship
              </label>
              <input
                type="text"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                placeholder="e.g. UNITED STATES (USA)"
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Document Expiry Date
              </label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Supporting Credentials & Cross-Document Intake */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div>
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[11px]">4</span>
                <Layers className="w-4 h-4 text-sky-400" />
                <span>Supporting Credentials & Cross-Document Intake</span>
              </label>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Attach accompanying travel visas, entry permits, or secondary IDs to evaluate multi-document identity consistency.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleAddSupportingDoc('visa')}
                className="px-2.5 py-1.5 rounded bg-sky-950 hover:bg-sky-900 text-sky-300 border border-sky-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Visa</span>
              </button>
              <button
                type="button"
                onClick={() => handleAddSupportingDoc('permit')}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Permit</span>
              </button>
            </div>
          </div>

          {supportingDocs.length === 0 ? (
            <div className="p-4 rounded-lg bg-slate-950/50 border border-slate-800/80 text-center space-y-1.5 text-xs">
              <span className="text-slate-400 font-semibold block">No Supporting Documents Attached</span>
              <p className="text-[11px] text-slate-500 max-w-lg mx-auto leading-relaxed">
                Single-document screening will be performed. Click <strong>+ Add Visa</strong> or <strong>+ Add Permit</strong> (or choose a preset above) to enable Cross-Document Consistency validation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {supportingDocs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                        DOC #{idx + 2}: {doc.category.toUpperCase()}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">
                        {doc.category === 'visa' ? 'Electronic / Consular Visa' : 'Border Entry Permit'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSupportingDoc(doc.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                      title="Remove document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Credential Number
                      </label>
                      <input
                        type="text"
                        value={doc.documentNumber}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { documentNumber: e.target.value })}
                        placeholder="e.g. VS-9901428"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Associated Passport Linkage
                      </label>
                      <input
                        type="text"
                        value={doc.associatedPassportNumber}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { associatedPassportNumber: e.target.value })}
                        placeholder="e.g. K4891024"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Holder Full Name
                      </label>
                      <input
                        type="text"
                        value={doc.fullName}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { fullName: e.target.value })}
                        placeholder="e.g. NAKAMURA, KENJI"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={doc.dateOfBirth}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { dateOfBirth: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Nationality
                      </label>
                      <input
                        type="text"
                        value={doc.nationality}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { nationality: e.target.value })}
                        placeholder="e.g. JAPAN (JPN)"
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-slate-400 block mb-1 font-semibold uppercase">
                        Expiry Date
                      </label>
                      <input
                        type="date"
                        value={doc.expiryDate}
                        onChange={(e) => handleUpdateSupportingDoc(doc.id, { expiryDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 5: Inspection Notes */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center text-[11px]">5</span>
            <span>Inspection Notes / Station Log</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Optional notes or preliminary physical observations..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono text-xs"
          />
        </div>

        {error && (
          <div className="bg-rose-950/60 border border-rose-800 rounded-lg p-3 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isProcessing || !selectedFile}
            className={`
              px-5 py-2 rounded font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md
              ${
                isProcessing || !selectedFile
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer'
              }
            `}
          >
            {isProcessing ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Running Screening Pipeline...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Execute Screening Pipeline ({supportingDocs.length + 1} Docs)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
