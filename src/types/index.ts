export type DocumentCategory = 
  | 'passport'
  | 'visa'
  | 'national_id'
  | 'driving_licence'
  | 'permit';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type ScreeningStatus = 
  | 'COMPLETED'
  | 'PENDING'
  | 'FLAGGED_FOR_REVIEW'
  | 'REJECTED';

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL' | 'INCONCLUSIVE' | 'NOT_CHECKED';

export type ValidationSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

export type DocumentValidationOverallStatus = 'VALID' | 'WARNING' | 'INVALID' | 'INCOMPLETE' | 'NOT_CHECKED';

export interface ValidationRuleItem {
  rule_id: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'NOT_CHECKED';
  severity: ValidationSeverity;
  message: string;
  evidence: string | Record<string, any>;
  field?: string;
}

export interface DocumentValidationData {
  overall_status: DocumentValidationOverallStatus;
  passed: number;
  warnings: number;
  failed: number;
  not_checked: number;
  total_rules: number;
  results: ValidationRuleItem[];
  summary: string;
  timestamp: string;
}

export interface DocumentInfo {
  id: string;
  category: DocumentCategory;
  categoryLabel: string;
  documentNumber: string;
  fullName: string;
  nationality: string;
  countryCode: string;
  dateOfBirth: string;
  expiryDate: string;
  issueDate?: string;
  issuingAuthority?: string;
  gender?: string;
  mrzCode?: string;
  rawUploadedFileName?: string;
  fileSizeBytes?: number;
  uploadedAt: string;
  imageUrl?: string;
}

export interface ExtractedField {
  fieldName: string;
  extractedValue: string;
  confidence: number; // 0.0 - 1.0
  validationStatus: ValidationStatus;
  mrzMatched?: boolean;
}

export interface ValidationItem {
  id: string;
  title: string;
  category: 'required_fields' | 'format_validation' | 'mrz_validation' | 'cross_field_consistency';
  status: ValidationStatus;
  detail: string;
  technicalCode?: string;
}

export interface ValidationResult {
  overallValid: boolean;
  score: number; // 0 - 100
  requiredFieldsStatus: ValidationStatus;
  formatValidationStatus: ValidationStatus;
  mrzValidationStatus: ValidationStatus;
  crossFieldConsistencyStatus: ValidationStatus;
  items: ValidationItem[];
}

export interface TamperingItem {
  id: string;
  componentName: string;
  type: 'photo_manipulation' | 'text_manipulation' | 'metadata_anomaly' | 'substrate_irregularity';
  status: ValidationStatus;
  confidenceScore: number; // 0 - 100
  description: string;
  locationCoordinates?: { x: number; y: number; width: number; height: number };
}

export interface TamperingResult {
  overallTamperingScore: number; // 0 - 100 (0 = clean, 100 = heavily tampered)
  photoManipulationStatus: ValidationStatus;
  textManipulationStatus: ValidationStatus;
  metadataAnomalyStatus: ValidationStatus;
  items: TamperingItem[];
}

export interface FaceVerificationResult {
  faceDetectedInDocument: boolean;
  faceDetectedInReference?: boolean;
  similarityScore: number; // 0 - 100
  matchStatus: 'MATCHED' | 'UNMATCHED' | 'INCONCLUSIVE' | 'NOT_APPLICABLE';
  livenessConfidence?: number;
  notes: string;
  documentFaceUrl?: string;
  referenceFaceUrl?: string;
}

export interface RiskFactor {
  id: string;
  factor: string;
  weight: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactPoints: number;
  description: string;
  mitigationSuggestion?: string;
}

export interface RiskAssessment {
  riskScore: number; // 0 - 100 (0 = lowest risk, 100 = critical risk)
  riskLevel: RiskLevel;
  primaryRiskSummary: string;
  explainableFactors: RiskFactor[];
  recommendedAction: 'CLEAR' | 'SECONDARY_INTERVIEW' | 'PHYSICAL_INSPECTION' | 'DENY_ENTRY';
}

export interface MrzChecksumDetail {
  passportNumber: { expected: string; actual: string; valid: boolean };
  dateOfBirth: { expected: string; actual: string; valid: boolean };
  dateOfExpiry: { expected: string; actual: string; valid: boolean };
  personalNumber?: { expected: string; actual: string; valid: boolean };
  composite: { expected: string; actual: string; valid: boolean };
}

export interface MrzPipelineData {
  detected: boolean;
  format?: 'TD3' | 'TD2' | 'TD1' | 'UNKNOWN';
  raw?: string;
  line1?: string;
  line2?: string;
  parsed?: {
    documentCode: string;
    issuingState: string;
    surname: string;
    givenNames: string;
    fullName: string;
    passportNumber: string;
    nationality: string;
    dateOfBirth: string;
    rawDob: string;
    sex: string;
    expiryDate: string;
    rawExpiryDate: string;
    personalNumber?: string;
  };
  checksumValidation?: {
    passport_number: boolean;
    date_of_birth: boolean;
    expiry_date: boolean;
    personal_number: boolean;
    composite: boolean;
    all_passed: boolean;
    details: MrzChecksumDetail;
  };
}

export interface ConsistencyItemData {
  field: string;
  fieldLabel: string;
  ocrValue: string | null;
  mrzValue: string | null;
  status: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  detail: string;
}

export interface ConsistencyPipelineData {
  overallMatch: boolean;
  matchCount: number;
  mismatchCount: number;
  comparisons: ConsistencyItemData[];
  summary: string;
}

export type CrossDocComparisonStatus = 'MATCH' | 'MISMATCH' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE';
export type CrossDocOverallStatus = 'CONSISTENT' | 'REVIEW_REQUIRED' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA';

export interface CrossDocumentFieldComparisonItem {
  id: string;
  field: string;
  field_label: string;
  document_a: {
    id: string;
    type: string;
    label: string;
    value: string | null;
  };
  document_b: {
    id: string;
    type: string;
    label: string;
    value: string | null;
  };
  status: CrossDocComparisonStatus;
  confidence: number | null;
  severity: ValidationSeverity;
  explanation: string;
  evidence?: Record<string, any>;
}

export interface CrossDocumentConsistencyData {
  case_id: string;
  documents_compared: number;
  document_pairs: Array<{ doc_a: string; doc_b: string; relation: string }>;
  comparisons: CrossDocumentFieldComparisonItem[];
  summary: {
    matches: number;
    mismatches: number;
    review_required: number;
    not_available: number;
    total_comparisons: number;
  };
  overall_status: CrossDocOverallStatus;
  explanations: string[];
  timestamp: string;
}

export interface SupportingDocumentInfo {
  id: string;
  category: DocumentCategory;
  categoryLabel: string;
  documentNumber?: string;
  associatedPassportNumber?: string;
  fullName?: string;
  nationality?: string;
  countryCode?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  issueDate?: string;
  issuingAuthority?: string;
  gender?: string;
  visaType?: string;
  imageUrl?: string;
  rawUploadedFileName?: string;
  fileSizeBytes?: number;
}

export interface ScreeningRecord {
  screeningId: string;
  timestamp: string;
  operatorId: string;
  stationId: string;
  status: ScreeningStatus;
  document: DocumentInfo;
  supportingDocuments?: SupportingDocumentInfo[];
  extractedFields: ExtractedField[];
  validation: ValidationResult;
  tampering: TamperingResult;
  faceVerification: FaceVerificationResult;
  riskAssessment: RiskAssessment;
  isDemoData: boolean;
  notes?: string;
  ocrProvider?: string;
  rawOcrText?: string;
  ocrConfidence?: number;
  mrzData?: MrzPipelineData;
  consistencyData?: ConsistencyPipelineData;
  validationData?: DocumentValidationData;
  crossDocumentData?: CrossDocumentConsistencyData;
}

export interface DashboardStats {
  totalScreenings: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  flaggedCount: number;
  avgProcessingTimeSec: number;
  systemStatus: 'OPERATIONAL' | 'DEGRADED' | 'MAINTENANCE';
  activeStationCount: number;
}

export interface SystemSettings {
  riskThresholds: {
    lowMax: number;
    mediumMax: number;
  };
  documentRules: {
    requireStrictMrz: boolean;
    minimumExpiryBufferMonths: number;
    requireBiometricCrossCheck: boolean;
    flagHandwrittenPassports: boolean;
  };
  aiConfiguration: {
    ocrConfidenceThreshold: number;
    tamperSensitivity: 'Standard' | 'High' | 'Aggressive';
    faceMatchStrictness: number;
    modelBackendEndpoint: string;
  };
  systemConfig: {
    stationName: string;
    operatorRole: string;
    dataRetentionDays: number;
    enableAuditLogging: boolean;
    academicDisclaimerAcknowledged: boolean;
  };
}
