import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';

export class PassportMrzChecksumRule implements IValidationRule {
  readonly id = 'mrz_checksum_parity';
  readonly name = 'ICAO Doc 9303 MRZ Checksum Parity';
  readonly category = 'mrz_checksum' as const;
  readonly description = 'Evaluates mathematical integrity of all 7-3-1 weight check digits in the Machine Readable Zone.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const mrz = input.mrz;

    if (!mrz || !mrz.detected || !mrz.checksum_validation) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'MRZ not detected or unavailable for check-digit verification.',
        evidence: { detected: Boolean(mrz?.detected) },
      };
    }

    const validation = mrz.checksum_validation;
    const details = validation.details;
    const failingFields: string[] = [];

    if (!validation.passport_number) {
      failingFields.push(`Passport Number (Expected ${details.passportNumber.expected}, Got ${details.passportNumber.actual})`);
    }

    if (!validation.date_of_birth) {
      failingFields.push(`Date of Birth (Expected ${details.dateOfBirth.expected}, Got ${details.dateOfBirth.actual})`);
    }

    if (!validation.expiry_date) {
      failingFields.push(`Expiry Date (Expected ${details.dateOfExpiry.expected}, Got ${details.dateOfExpiry.actual})`);
    }

    if (details.personalNumber && !validation.personal_number) {
      failingFields.push(`Personal Number (Expected ${details.personalNumber.expected}, Got ${details.personalNumber.actual})`);
    }

    if (!validation.composite) {
      failingFields.push(`Composite Check Digit (Expected ${details.composite.expected}, Got ${details.composite.actual})`);
    }

    if (failingFields.length > 0) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.mrz_checksum_failure || 'HIGH',
        message: `MRZ 7-3-1 check digit validation failed on: ${failingFields.join('; ')}.`,
        evidence: {
          allPassed: validation.all_passed,
          failingFields,
          details,
        },
        field: 'mrz',
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: 'All ICAO Doc 9303 (7-3-1) check digits passed parity verification.',
      evidence: {
        passportNumberValid: validation.passport_number,
        dobValid: validation.date_of_birth,
        expiryValid: validation.expiry_date,
        compositeValid: validation.composite,
        details,
      },
      field: 'mrz',
    };
  }
}
