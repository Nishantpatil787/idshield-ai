import { ValidationConfig } from './validationTypes';

export const DEFAULT_VALIDATION_CONFIG: ValidationConfig = {
  expiry_warning_days: 180,
  passport_number_min_length: 6,
  passport_number_max_length: 12,
  allowed_gender_codes: ['M', 'F', 'X', '<'],
  severities: {
    missing_required_field: 'HIGH',
    invalid_passport_number: 'HIGH',
    invalid_date: 'HIGH',
    future_dob: 'HIGH',
    expired_document: 'HIGH',
    expiring_soon: 'LOW',
    invalid_country_code: 'MEDIUM',
    invalid_gender: 'LOW',
    mrz_checksum_failure: 'HIGH',
    ocr_mrz_mismatch: 'MEDIUM',
    cross_field_violation: 'HIGH',
  },
};

export function createValidationConfig(overrides?: Partial<ValidationConfig>): ValidationConfig {
  if (!overrides) {
    return { ...DEFAULT_VALIDATION_CONFIG };
  }

  return {
    ...DEFAULT_VALIDATION_CONFIG,
    ...overrides,
    severities: {
      ...DEFAULT_VALIDATION_CONFIG.severities,
      ...(overrides.severities || {}),
    },
  };
}
