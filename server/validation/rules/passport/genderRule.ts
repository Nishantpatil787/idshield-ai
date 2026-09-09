import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';

export class PassportGenderRule implements IValidationRule {
  readonly id = 'gender_sex_normalization';
  readonly name = 'Gender / Sex Field Normalization';
  readonly category = 'gender' as const;
  readonly description = 'Validates and normalizes gender/sex against ICAO Doc 9303 standards (M, F, X, <).';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const vizGender = input.fields?.gender?.value;
    const mrzGender = input.mrz?.parsed?.sex;

    const raw = vizGender || mrzGender;

    if (!raw) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'No gender or sex indicator found for evaluation.',
        evidence: 'Gender field is empty.',
        field: 'gender',
      };
    }

    const clean = raw.trim().toUpperCase();
    let normalized: string | null = null;

    if (clean === 'M' || clean === 'MALE' || clean === 'HOMME' || clean === 'MASCULINO') {
      normalized = 'M';
    } else if (clean === 'F' || clean === 'FEMALE' || clean === 'FEMME' || clean === 'FEMENINO') {
      normalized = 'F';
    } else if (clean === 'X' || clean === 'NON-BINARY' || clean === 'OTHER' || clean === 'UNSPECIFIED') {
      normalized = 'X';
    } else if (clean === '<' || clean === 'U' || clean === 'UNKNOWN') {
      normalized = '<';
    }

    const allowed = config.allowed_gender_codes || ['M', 'F', 'X', '<'];

    if (!normalized || !allowed.includes(normalized)) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'WARNING',
        severity: config.severities?.invalid_gender || 'LOW',
        message: `Non-standard gender value: "${raw}". Standard ICAO values are M (Male), F (Female), X (Unspecified), < (Unrecorded).`,
        evidence: {
          rawValue: raw,
          normalizedAttempt: normalized,
          allowedStandards: allowed,
        },
        field: 'gender',
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `Gender "${normalized}" normalized and complies with ICAO Doc 9303 standard.`,
      evidence: {
        normalizedCode: normalized,
        rawValue: raw,
      },
      field: 'gender',
    };
  }
}
