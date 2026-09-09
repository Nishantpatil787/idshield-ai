export type DocumentType = 
  | 'aadhaar'
  | 'pan'
  | 'passport'
  | 'driving_license'
  | 'voter_id'
  | 'custom_id';

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL_FRAUD';

export type VerificationStatus = 'PASSED' | 'SUSPICIOUS' | 'REJECTED' | 'MANUAL_REVIEW';

export interface BoundingBox {
  id: string;
  label: string;
  type: 'tamper' | 'font_anomaly' | 'photo_splice' | 'ghost_image' | 'watermark' | 'ocr_field' | 'qr_code';
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  description: string;
}

export interface SecurityCheckResult {
  id: string;
  name: string;
  category: 'tamper' | 'font' | 'security_feature' | 'face_match' | 'layout' | 'data_integrity';
  status: 'PASS' | 'WARNING' | 'FAIL';
  score: number; // 0 - 100
  message: string;
  technicalDetails?: string;
}

export interface ExtractedOCRData {
  documentNumber?: string;
  documentType: DocumentType;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  fatherOrSpouseName?: string;
  address?: string;
  issueDate?: string;
  expiryDate?: string;
  rawText?: string;
  qrCodeData?: string;
  qrDataMatchesOcr?: boolean;
}

export interface FaceMatchData {
  performed: boolean;
  matchScore: number; // 0 - 100
  status: 'MATCH' | 'INCONCLUSIVE' | 'MISMATCH' | 'NOT_PROVIDED';
  livenessDetected: boolean;
  spoofRiskScore: number; // 0 - 100 (high = likely spoof)
  landmarksVerified: boolean;
  notes?: string;
}

export interface ForensicReport {
  id: string;
  timestamp: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: string;
  imageDimensions?: { width: number; height: number };
  authenticityScore: number; // 0 - 100 (100 is perfectly genuine)
  overallStatus: VerificationStatus;
  riskLevel: RiskLevel;
  summary: string;
  tamperingDetected: boolean;
  ocrData: ExtractedOCRData;
  securityChecks: SecurityCheckResult[];
  boundingBoxes: BoundingBox[];
  faceMatch?: FaceMatchData;
  forensicHash: string;
  modelUsed: string;
  executionTimeMs: number;
}

export interface BatchItem {
  id: string;
  name: string;
  documentType: DocumentType;
  status: 'queued' | 'processing' | 'completed' | 'error';
  imageUrl: string;
  report?: ForensicReport;
  error?: string;
}

export interface VerificationRuleConfig {
  minimumAuthenticityScore: number;
  strictFontConsistency: boolean;
  strictFaceMatchThreshold: number;
  requireQrValidation: boolean;
  flagGhostImageAbsence: boolean;
  autoRejectHighRisk: boolean;
}

export interface SampleDocumentPreset {
  id: string;
  title: string;
  documentType: DocumentType;
  expectedOutcome: 'GENUINE' | 'TAMPERED_DOB' | 'PHOTO_SPLICE' | 'SYNTHETIC_FORGERY' | 'DAMAGED_WATERMARK';
  description: string;
  tags: string[];
  imageUrl: string;
  selfieUrl?: string;
  simulatedReport: ForensicReport;
}
