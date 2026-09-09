import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';

export class PassportNumberRule implements IValidationRule {
  readonly id = 'passport_number_format';
  readonly name = 'Passport Number Syntax & Format';
  readonly category = 'passport_number' as const;
  readonly description = 'Validates passport document number against standard alphanumeric constraints and MRZ alignment.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const vizDocNum = input.fields?.passport_number?.value?.trim();
    const mrzDocNum = input.mrz?.parsed?.passportNumber?.trim();

    const rawNum = vizDocNum || mrzDocNum;

    if (!rawNum) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.invalid_passport_number || 'HIGH',
        message: 'No passport document number found in visual inspection zone or MRZ.',
        evidence: 'Passport number field is empty.',
        field: 'passport_number',
      };
    }

    // Normalize: remove filler '<', spaces, hyphens
    const normalized = rawNum.replace(/</g, '').replace(/[\s-]/g, '').toUpperCase();

    // Check allowed character set: standard ICAO TD3 passport numbers are alphanumeric [A-Z0-9]
    const validCharsetRegex = /^[A-Z0-9]+$/;
    if (!validCharsetRegex.test(normalized)) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.invalid_passport_number || 'HIGH',
        message: `Passport number contains invalid characters: "${rawNum}". Allowed character set is alphanumeric (A-Z, 0-9).`,
        evidence: {
          rawValue: rawNum,
          normalizedValue: normalized,
          disallowedCharacters: rawNum.replace(/[A-Z0-9\s<-]/gi, ''),
        },
        field: 'passport_number',
      };
    }

    // Check length against configurable bounds
    const minLen = config.passport_number_min_length || 6;
    const maxLen = config.passport_number_max_length || 12;

    if (normalized.length < minLen || normalized.length > maxLen) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'WARNING',
        severity: 'MEDIUM',
        message: `Passport number length (${normalized.length}) outside standard range (${minLen}-${maxLen} characters).`,
        evidence: {
          normalizedValue: normalized,
          length: normalized.length,
          expectedRange: `${minLen}-${maxLen}`,
        },
        field: 'passport_number',
      };
    }

    // Check consistency between VIZ and MRZ if both exist
    if (vizDocNum && mrzDocNum) {
      const vizNorm = vizDocNum.replace(/[\s-]/g, '').toUpperCase();
      const mrzNorm = mrzDocNum.replace(/</g, '').replace(/[\s-]/g, '').toUpperCase();

      if (vizNorm !== mrzNorm) {
        return {
          rule_id: this.id,
          category: this.category,
          status: 'WARNING',
          severity: config.severities?.ocr_mrz_mismatch || 'MEDIUM',
          message: `Passport number in visual zone ("${vizDocNum}") does not match MRZ document number ("${mrzDocNum}").`,
          evidence: {
            visualZoneValue: vizDocNum,
            mrzValue: mrzDocNum,
          },
          field: 'passport_number',
        };
      }
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `Passport number "${normalized}" conforms to standard alphanumeric structure.`,
      evidence: {
        normalizedValue: normalized,
        length: normalized.length,
      },
      field: 'passport_number',
    };
  }
}
