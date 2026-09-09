import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';
import { parseAndValidateDate, isDateBefore, isDateInFuture } from '../../utils/dateUtils';
import { normalizeCountryCode } from '../../utils/countryCodes';

export class PassportCrossFieldRule implements IValidationRule {
  readonly id = 'cross_field_deterministic';
  readonly name = 'Cross-Field Logical & Chronological Alignment';
  readonly category = 'cross_field' as const;
  readonly description = 'Evaluates logical relationships between issuance, birth, expiry, and identity tokens.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const fields = input.fields || {};
    const refDate = config.reference_date ? new Date(config.reference_date) : new Date();

    const violations: string[] = [];
    const verifiedRelations: string[] = [];
    let checksRun = 0;

    // 1. DOB vs Current Date
    const rawDob = fields.date_of_birth?.value || input.mrz?.parsed?.dateOfBirth;
    const parsedDob = rawDob ? parseAndValidateDate(rawDob) : null;
    if (parsedDob?.valid && parsedDob.date) {
      checksRun++;
      if (isDateInFuture(parsedDob.date, refDate)) {
        violations.push(`Date of birth (${parsedDob.iso}) is in the future.`);
      } else {
        verifiedRelations.push('Date of birth is in the past.');
      }
    }

    // 2. DOB vs Expiry Date
    const rawExpiry = fields.date_of_expiry?.value || input.mrz?.parsed?.expiryDate;
    const parsedExpiry = rawExpiry ? parseAndValidateDate(rawExpiry) : null;
    if (parsedDob?.valid && parsedDob.date && parsedExpiry?.valid && parsedExpiry.date) {
      checksRun++;
      if (!isDateBefore(parsedDob.date, parsedExpiry.date)) {
        violations.push(`Date of birth (${parsedDob.iso}) occurs on or after Expiry date (${parsedExpiry.iso}).`);
      } else {
        verifiedRelations.push('Date of birth chronologically precedes expiry date.');
      }
    }

    // 3. Issue Date vs Expiry Date (when issue date available)
    const rawIssue = fields.issue_date?.value;
    const parsedIssue = rawIssue ? parseAndValidateDate(rawIssue) : null;
    if (parsedIssue?.valid && parsedIssue.date && parsedExpiry?.valid && parsedExpiry.date) {
      checksRun++;
      if (!isDateBefore(parsedIssue.date, parsedExpiry.date)) {
        violations.push(`Document issue date (${parsedIssue.iso}) occurs on or after Expiry date (${parsedExpiry.iso}).`);
      } else {
        verifiedRelations.push('Document issue date is strictly prior to expiry date.');
      }
    }

    // 4. Issue Date vs DOB (bearer must be born before document is issued)
    if (parsedDob?.valid && parsedDob.date && parsedIssue?.valid && parsedIssue.date) {
      checksRun++;
      if (!isDateBefore(parsedDob.date, parsedIssue.date)) {
        violations.push(`Date of birth (${parsedDob.iso}) is after document issuance date (${parsedIssue.iso}).`);
      } else {
        verifiedRelations.push('Date of birth precedes document issue date.');
      }
    }

    // 5. Nationality VIZ vs MRZ (if both exist)
    const vizNat = fields.nationality?.value;
    const mrzNat = input.mrz?.parsed?.nationality;
    if (vizNat && mrzNat) {
      checksRun++;
      const normViz = normalizeCountryCode(vizNat);
      const normMrz = normalizeCountryCode(mrzNat);
      if (normViz && normMrz && normViz !== normMrz) {
        violations.push(`Visual nationality (${normViz}) conflicts with MRZ issuing/nationality code (${normMrz}).`);
      } else {
        verifiedRelations.push('Nationality and MRZ country codes align.');
      }
    }

    if (checksRun === 0) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'Insufficient comparative fields present for cross-field logical evaluation.',
        evidence: 'No interrelated date or nationality pairs available.',
      };
    }

    if (violations.length > 0) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.cross_field_violation || 'HIGH',
        message: `Cross-field logical contradiction(s): ${violations.join('; ')}`,
        evidence: {
          violations,
          verifiedRelations,
          checksRun,
        },
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `All ${checksRun} cross-field logical and chronological relationships verified successfully.`,
      evidence: {
        verifiedRelations,
        checksRun,
      },
    };
  }
}
