import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';
import { isValidCountryCode, normalizeCountryCode } from '../../utils/countryCodes';

export class PassportNationalityRule implements IValidationRule {
  readonly id = 'nationality_country_code';
  readonly name = 'Nationality & Issuing Country Code Standard';
  readonly category = 'nationality' as const;
  readonly description = 'Validates nationality/issuing country against standardized ICAO Doc 9303 / ISO 3166-1 alpha-3 registry.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const vizNationality = input.fields?.nationality?.value;
    const mrzNationality = input.mrz?.parsed?.nationality;

    const rawNat = mrzNationality || vizNationality;

    if (!rawNat) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'No nationality or issuing country code found for evaluation.',
        evidence: 'Nationality field is empty.',
        field: 'nationality',
      };
    }

    const normalized = normalizeCountryCode(rawNat);

    if (!normalized || !isValidCountryCode(normalized)) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.invalid_country_code || 'MEDIUM',
        message: `Nationality code "${rawNat}" is not a recognized ISO 3166-1 alpha-3 or ICAO 9303 country code.`,
        evidence: {
          rawValue: rawNat,
          normalizedAttempt: normalized,
        },
        field: 'nationality',
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `Nationality code "${normalized}" is a recognized ICAO Doc 9303 issuing country.`,
      evidence: {
        code: normalized,
        rawValue: rawNat,
      },
      field: 'nationality',
    };
  }
}
