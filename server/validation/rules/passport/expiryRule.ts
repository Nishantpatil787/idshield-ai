import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';
import { parseAndValidateDate, getDaysDifference } from '../../utils/dateUtils';

export class PassportExpiryRule implements IValidationRule {
  readonly id = 'document_expiry_status';
  readonly name = 'Passport Expiration Validity';
  readonly category = 'expiry' as const;
  readonly description = 'Verifies whether the passport is active, expiring soon within warning buffer, or expired.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const rawExpiry = input.fields?.date_of_expiry?.value || input.mrz?.parsed?.expiryDate;

    if (!rawExpiry) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'Expiry date is missing; cannot evaluate validity horizon.',
        evidence: 'No expiry date found.',
        field: 'date_of_expiry',
      };
    }

    const parsed = parseAndValidateDate(rawExpiry);
    if (!parsed.valid || !parsed.date) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.invalid_date || 'HIGH',
        message: `Unable to evaluate expiry: "${rawExpiry}" is not a valid calendar date.`,
        evidence: { rawExpiry, error: parsed.error },
        field: 'date_of_expiry',
      };
    }

    const refDate = config.reference_date ? new Date(config.reference_date) : new Date();
    const daysUntilExpiry = getDaysDifference(refDate, parsed.date);
    const warningBufferDays = config.expiry_warning_days ?? 180;

    // Case 1: Expired (daysUntilExpiry < 0)
    if (daysUntilExpiry < 0) {
      const daysPast = Math.abs(daysUntilExpiry);
      return {
        rule_id: this.id,
        category: this.category,
        status: 'FAIL',
        severity: config.severities?.expired_document || 'HIGH',
        message: `Passport expired ${daysPast} days ago on ${parsed.iso}.`,
        evidence: {
          expiryDate: parsed.iso,
          referenceDate: refDate.toISOString().slice(0, 10),
          daysExpired: daysPast,
          state: 'EXPIRED',
        },
        field: 'date_of_expiry',
      };
    }

    // Case 2: Expiring soon (0 <= daysUntilExpiry <= warningBufferDays)
    if (daysUntilExpiry <= warningBufferDays) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'WARNING',
        severity: config.severities?.expiring_soon || 'LOW',
        message: `Passport expires in ${daysUntilExpiry} days (${parsed.iso}), which is within the ${warningBufferDays}-day warning threshold.`,
        evidence: {
          expiryDate: parsed.iso,
          referenceDate: refDate.toISOString().slice(0, 10),
          daysRemaining: daysUntilExpiry,
          warningThresholdDays: warningBufferDays,
          state: 'EXPIRING_SOON',
        },
        field: 'date_of_expiry',
      };
    }

    // Case 3: Valid active document
    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `Passport is valid. Expires on ${parsed.iso} (${daysUntilExpiry} days remaining).`,
      evidence: {
        expiryDate: parsed.iso,
        daysRemaining: daysUntilExpiry,
        state: 'VALID',
      },
      field: 'date_of_expiry',
    };
  }
}
