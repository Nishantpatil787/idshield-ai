export interface OcrFieldResult {
  value: string;
  confidence: number | null;
  raw?: string;
}

export interface ExtractedPassportFields {
  full_name: OcrFieldResult;
  passport_number: OcrFieldResult;
  nationality: OcrFieldResult;
  date_of_birth: OcrFieldResult;
  date_of_expiry: OcrFieldResult;
  gender: OcrFieldResult;
  issuing_country?: OcrFieldResult;
  personal_number?: OcrFieldResult;
}

export interface MrzCheckDigits {
  passportNumber: { expected: string; actual: string; valid: boolean };
  dateOfBirth: { expected: string; actual: string; valid: boolean };
  dateOfExpiry: { expected: string; actual: string; valid: boolean };
  personalNumber?: { expected: string; actual: string; valid: boolean };
  composite: { expected: string; actual: string; valid: boolean };
}

export interface MrzChecksumValidation {
  passport_number: boolean;
  date_of_birth: boolean;
  expiry_date: boolean;
  personal_number: boolean;
  composite: boolean;
  all_passed: boolean;
  details: MrzCheckDigits;
}

export interface MrzParsedData {
  format: 'TD3' | 'TD2' | 'TD1' | 'UNKNOWN';
  documentCode: string;
  issuingState: string;
  surname: string;
  givenNames: string;
  fullName: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string; // YYYY-MM-DD
  rawDob: string; // YYMMDD
  sex: 'M' | 'F' | 'X' | '<' | 'UNKNOWN';
  expiryDate: string; // YYYY-MM-DD
  rawExpiryDate: string; // YYMMDD
  personalNumber: string;
  rawCheckDigits: {
    passportNumberCheck: string;
    dobCheck: string;
    expiryCheck: string;
    personalNumberCheck: string;
    compositeCheck: string;
  };
}

export interface MrzDetectionResult {
  detected: boolean;
  format?: 'TD3' | 'TD2' | 'TD1';
  raw: string;
  line1?: string;
  line2?: string;
  line3?: string;
  normalized: string;
  parsed?: MrzParsedData;
  checksum_validation?: MrzChecksumValidation;
  error?: string;
}

export type ConsistencyMatchStatus = 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE' | 'NOT_APPLICABLE';

export interface ConsistencyComparisonItem {
  field: 'passport_number' | 'date_of_birth' | 'date_of_expiry' | 'nationality' | 'gender' | 'full_name' | 'issuing_country';
  fieldLabel: string;
  ocrValue: string | null;
  mrzValue: string | null;
  status: ConsistencyMatchStatus;
  detail: string;
}

export interface ConsistencyCheckResult {
  overallMatch: boolean;
  mismatchCount: number;
  matchCount: number;
  comparisons: ConsistencyComparisonItem[];
  summary: string;
}

export interface RawOcrRegion {
  text: string;
  confidence?: number;
  boundingBox?: { x: number; y: number; width: number; height: number };
}

export interface RawOcrOutput {
  text: string;
  confidence: number | null;
  provider: string;
  regions?: RawOcrRegion[];
}

export interface PassportProcessingResult {
  document_type: 'passport';
  ocr: RawOcrOutput;
  fields: ExtractedPassportFields;
  mrz: MrzDetectionResult;
  consistency: ConsistencyCheckResult;
  processing: {
    status: 'complete' | 'failed' | 'partial';
    executionTimeMs: number;
    isRealOcr: boolean;
    provider: string;
    warnings?: string[];
  };
}
