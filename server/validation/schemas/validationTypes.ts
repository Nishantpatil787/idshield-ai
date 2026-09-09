export type ValidationRuleStatus = 'PASS' | 'FAIL' | 'WARNING' | 'NOT_CHECKED';

export type ValidationSeverity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH';

export type DocumentValidationOverallStatus = 'VALID' | 'WARNING' | 'INVALID' | 'INCOMPLETE' | 'NOT_CHECKED';

export interface ValidationRuleResult {
  rule_id: string;
  category: string;
  status: ValidationRuleStatus;
  severity: ValidationSeverity;
  message: string;
  evidence: string | Record<string, any>;
  field?: string;
}

export interface DocumentValidationSummary {
  overall_status: DocumentValidationOverallStatus;
  passed: number;
  warnings: number;
  failed: number;
  not_checked: number;
  total_rules: number;
  results: ValidationRuleResult[];
  summary: string;
  timestamp: string;
}

export interface ValidationConfig {
  expiry_warning_days: number;
  passport_number_min_length: number;
  passport_number_max_length: number;
  allowed_gender_codes: string[];
  reference_date?: string; // ISO string, defaults to current date
  severities?: {
    missing_required_field?: ValidationSeverity;
    invalid_passport_number?: ValidationSeverity;
    invalid_date?: ValidationSeverity;
    future_dob?: ValidationSeverity;
    expired_document?: ValidationSeverity;
    expiring_soon?: ValidationSeverity;
    invalid_country_code?: ValidationSeverity;
    invalid_gender?: ValidationSeverity;
    mrz_checksum_failure?: ValidationSeverity;
    ocr_mrz_mismatch?: ValidationSeverity;
    cross_field_violation?: ValidationSeverity;
  };
}

export interface StructuredPassportInput {
  document_type?: 'passport';
  fields: {
    full_name?: { value?: string | null; confidence?: number | null };
    passport_number?: { value?: string | null; confidence?: number | null };
    nationality?: { value?: string | null; confidence?: number | null };
    date_of_birth?: { value?: string | null; confidence?: number | null };
    date_of_expiry?: { value?: string | null; confidence?: number | null };
    gender?: { value?: string | null; confidence?: number | null };
    issuing_country?: { value?: string | null; confidence?: number | null };
    issue_date?: { value?: string | null; confidence?: number | null };
    personal_number?: { value?: string | null; confidence?: number | null };
  };
  mrz?: {
    detected: boolean;
    format?: 'TD3' | 'TD2' | 'TD1' | 'UNKNOWN';
    raw?: string;
    line1?: string;
    line2?: string;
    parsed?: {
      documentCode?: string;
      issuingState?: string;
      surname?: string;
      givenNames?: string;
      fullName?: string;
      passportNumber?: string;
      nationality?: string;
      dateOfBirth?: string;
      rawDob?: string;
      sex?: string;
      expiryDate?: string;
      rawExpiryDate?: string;
      personalNumber?: string;
    };
    checksum_validation?: {
      passport_number: boolean;
      date_of_birth: boolean;
      expiry_date: boolean;
      personal_number: boolean;
      composite: boolean;
      all_passed: boolean;
      details: {
        passportNumber: { expected: string; actual: string; valid: boolean };
        dateOfBirth: { expected: string; actual: string; valid: boolean };
        dateOfExpiry: { expected: string; actual: string; valid: boolean };
        personalNumber?: { expected: string; actual: string; valid: boolean };
        composite: { expected: string; actual: string; valid: boolean };
      };
    };
  };
  consistency?: {
    overallMatch: boolean;
    matchCount: number;
    mismatchCount: number;
    comparisons: Array<{
      field: string;
      fieldLabel: string;
      ocrValue: string | null;
      mrzValue: string | null;
      status: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE' | 'NOT_APPLICABLE';
      detail: string;
    }>;
    summary: string;
  };
}
