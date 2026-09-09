import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';
import { parseAndValidateDate, isDateInFuture, isDateBefore } from '../../utils/dateUtils';

export class PassportDateRule implements IValidationRule {
  readonly id = 'date_validity_chronology';
  readonly name = 'Date Validity & Chronological Sequence';
  readonly category = 'dates' as const;
  readonly description = 'Validates calendar correctness of dates of birth/expiry and chronological alignment.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const rawDob = input.fields?.date_of_birth?.value || input.mrz?.parsed?.dateOfBirth;
    const rawExpiry = input.fields?.date_of_expiry?.value || input.mrz?.parsed?.expiryDate;

    if (!rawDob && !rawExpiry) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'No date of birth or expiry date available for calendar evaluation.',
        evidence: 'Both DOB and Expiry date fields are absent.',
      };
    }

    const refDate = config.reference_date ? new Date(config.reference_date) : new Date();

    // 1. Validate Date of Birth
    let dobParsed;
    if (rawDob) {
      dobParsed = parseAndValidateDate(rawDob);
      if (!dobParsed.valid || !dobParsed.date) {
        return {
          rule_id: this.id,
          category: this.category,
          status: 'FAIL',
          severity: config.severities?.invalid_date || 'HIGH',
          message: `Date of birth "${rawDob}" is not a valid calendar date: ${dobParsed.error || 'Syntax error'}.`,
          evidence: { rawDob, error: dobParsed.error },
          field: 'date_of_birth',
        };
      }

      // Check if DOB is in future
      if (isDateInFuture(dobParsed.date, refDate)) {
        return {
          rule_id: this.id,
          category: this.category,
          status: 'FAIL',
          severity: config.severities?.future_dob || 'HIGH',
          message: `Date of birth (${dobParsed.iso}) cannot be in the future (reference date: ${refDate.toISOString().slice(0, 10)}).`,
          evidence: {
            dobIso: dobParsed.iso,
            referenceDate: refDate.toISOString().slice(0, 10),
          },
          field: 'date_of_birth',
        };
      }
    }

    // 2. Validate Expiry Date
    let expiryParsed;
    if (rawExpiry) {
      expiryParsed = parseAndValidateDate(rawExpiry);
      if (!expiryParsed.valid || !expiryParsed.date) {
        return {
          rule_id: this.id,
          category: this.category,
          status: 'FAIL',
          severity: config.severities?.invalid_date || 'HIGH',
          message: `Date of expiry "${rawExpiry}" is not a valid calendar date: ${expiryParsed.error || 'Syntax error'}.`,
          evidence: { rawExpiry, error: expiryParsed.error },
          field: 'date_of_expiry',
        };
      }
    }

    // 3. Chronological Consistency: DOB < Expiry Date
    if (dobParsed?.date && expiryParsed?.date) {
      if (!isDateBefore(dobParsed.date, expiryParsed.date)) {
        return {
          rule_id: this.id,
          category: this.category,
          status: 'FAIL',
          severity: config.severities?.cross_field_violation || 'HIGH',
          message: `Chronological violation: Date of birth (${dobParsed.iso}) is not prior to document expiry date (${expiryParsed.iso}).`,
          evidence: {
            dateOfBirth: dobParsed.iso,
            dateOfExpiry: expiryParsed.iso,
          },
          field: 'date_of_expiry',
        };
      }
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: 'Dates of birth and expiry are verified real calendar dates with correct chronological order.',
      evidence: {
        dateOfBirth: dobParsed?.iso,
        dateOfExpiry: expiryParsed?.iso,
      },
    };
  }
}
