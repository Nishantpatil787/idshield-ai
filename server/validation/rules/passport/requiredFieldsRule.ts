import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';

export class PassportRequiredFieldsRule implements IValidationRule {
  readonly id = 'passport_required_fields';
  readonly name = 'Mandatory Passport Fields Completeness';
  readonly category = 'required_fields' as const;
  readonly description = 'Verifies all mandatory ICAO identity and biographical fields are present.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const fields = input.fields || {};
    const missingCritical: string[] = [];
    const missingImportant: string[] = [];
    const presentFields: string[] = [];

    // Helper to check if a field contains actual text
    const hasValue = (val: string | null | undefined): boolean => {
      return Boolean(val && typeof val === 'string' && val.trim().length > 0 && !val.trim().includes('<<<'));
    };

    // Critical fields (Missing Passport Number is a critical failure)
    if (!hasValue(fields.passport_number?.value) && !hasValue(input.mrz?.parsed?.passportNumber)) {
      missingCritical.push('Passport Number');
    } else {
      presentFields.push('Passport Number');
    }

    // Important biographical fields
    if (!hasValue(fields.full_name?.value) && !hasValue(input.mrz?.parsed?.fullName)) {
      missingImportant.push('Full Name');
    } else {
      presentFields.push('Full Name');
    }

    if (!hasValue(fields.date_of_birth?.value) && !hasValue(input.mrz?.parsed?.dateOfBirth)) {
      missingImportant.push('Date of Birth');
    } else {
      presentFields.push('Date of Birth');
    }

    if (!hasValue(fields.date_of_expiry?.value) && !hasValue(input.mrz?.parsed?.expiryDate)) {
      missingImportant.push('Date of Expiry');
    } else {
      presentFields.push('Date of Expiry');
    }

    if (!hasValue(fields.nationality?.value) && !hasValue(input.mrz?.parsed?.nationality)) {
      missingImportant.push('Nationality / Issuing Country');
    } else {
      presentFields.push('Nationality');
    }

    if (!hasValue(fields.gender?.value) && !hasValue(input.mrz?.parsed?.sex)) {
      missingImportant.push('Gender / Sex');
    } else {
      presentFields.push('Gender');
    }

    // Determine status & severity
    if (missingCritical.length > 0) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.missing_required_field || 'HIGH',
        message: `Missing critical required passport fields: ${missingCritical.join(', ')}.`,
        evidence: {
          missingCritical,
          missingImportant,
          presentFields,
        },
        field: 'passport_number',
      };
    }

    if (missingImportant.length > 0) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'WARNING',
        severity: 'MEDIUM',
        message: `Missing mandatory identity fields: ${missingImportant.join(', ')}.`,
        evidence: {
          missingImportant,
          presentFields,
        },
        field: missingImportant[0].toLowerCase().replace(/\s+/g, '_'),
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: 'All mandatory ICAO biographical and credential fields are present.',
      evidence: {
        presentCount: presentFields.length,
        fields: presentFields,
      },
    };
  }
}
