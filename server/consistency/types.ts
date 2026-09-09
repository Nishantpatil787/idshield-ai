/**
 * IDShield AI — Cross-Document Consistency Engine Types
 */

import { DocumentCategory, ValidationSeverity } from '../../src/types';

export type ComparisonStatus = 'MATCH' | 'MISMATCH' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE';

export type CrossDocumentOverallStatus = 'CONSISTENT' | 'REVIEW_REQUIRED' | 'NOT_APPLICABLE' | 'INSUFFICIENT_DATA';

export interface DocumentIdentityFields {
  full_name?: string | null;
  given_names?: string | null;
  surname?: string | null;
  passport_number?: string | null;
  associated_passport_number?: string | null;
  document_number?: string | null;
  date_of_birth?: string | null;
  nationality?: string | null;
  issuing_country?: string | null;
  gender?: string | null;
  issue_date?: string | null;
  expiry_date?: string | null;
  visa_type?: string | null;
  stay_duration_days?: number | null;
  [key: string]: any;
}

export interface CaseDocumentInput {
  document_id: string;
  document_type: DocumentCategory | 'passport' | 'visa' | 'permit' | 'national_id' | 'driving_licence';
  role?: 'primary' | 'supporting';
  label?: string;
  extracted_fields: DocumentIdentityFields;
  mrz_data?: any;
  raw_text?: string;
}

export interface ScreeningCaseInput {
  case_id: string;
  primary_document: CaseDocumentInput;
  supporting_documents?: CaseDocumentInput[];
  all_documents?: CaseDocumentInput[];
  config?: CrossDocumentConfig;
}

export interface NormalizedIdentityProfile {
  document_id: string;
  document_type: string;
  role: 'primary' | 'supporting';
  label: string;
  name: {
    raw: string | null;
    normalized: string | null;
    surname: string | null;
    given_names: string | null;
    tokens: string[];
  };
  passport_number: string | null;
  associated_passport_number: string | null;
  document_number: string | null;
  date_of_birth: {
    raw: string | null;
    iso: string | null;
    year: number | null;
    month: number | null;
    day: number | null;
  };
  nationality: {
    raw: string | null;
    code3: string | null;
  };
  gender: {
    raw: string | null;
    standard: 'M' | 'F' | 'X' | '<' | null;
  };
  validity: {
    issue_date: string | null;
    expiry_date: string | null;
  };
}

export interface CrossDocumentFieldComparison {
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
  status: ComparisonStatus;
  confidence: number | null; // null for deterministic comparisons
  severity: ValidationSeverity;
  explanation: string;
  evidence?: Record<string, any>;
}

export interface CrossDocumentSummary {
  matches: number;
  mismatches: number;
  review_required: number;
  not_available: number;
  total_comparisons: number;
}

export interface CrossDocumentConsistencyResult {
  case_id: string;
  documents_compared: number;
  document_pairs: Array<{ doc_a: string; doc_b: string; relation: string }>;
  comparisons: CrossDocumentFieldComparison[];
  summary: CrossDocumentSummary;
  overall_status: CrossDocumentOverallStatus;
  explanations: string[];
  timestamp: string;
}

export interface CrossDocumentConfig {
  severities?: {
    passport_number_mismatch?: ValidationSeverity;
    dob_mismatch?: ValidationSeverity;
    nationality_mismatch?: ValidationSeverity;
    gender_mismatch?: ValidationSeverity;
    name_mismatch?: ValidationSeverity;
    name_review_required?: ValidationSeverity;
    chronology_violation?: ValidationSeverity;
  };
  strict_name_matching?: boolean;
  allow_partial_first_names?: boolean;
}
