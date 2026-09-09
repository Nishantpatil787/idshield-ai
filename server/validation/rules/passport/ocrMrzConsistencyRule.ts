import { IValidationRule } from '../baseRule';
import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../../schemas/validationTypes';

export class PassportOcrMrzConsistencyRule implements IValidationRule {
  readonly id = 'ocr_mrz_consistency';
  readonly name = 'Visual Zone (OCR) ↔ MRZ Cross-Consistency';
  readonly category = 'consistency' as const;
  readonly description = 'Cross-references extracted visual text with decoded MRZ strings to detect anomalies.';

  execute(input: StructuredPassportInput, config: ValidationConfig): ValidationRuleResult {
    const consistency = input.consistency;

    if (!consistency || !input.mrz?.detected) {
      return {
        rule_id: this.id,
        category: this.category,
        status: 'NOT_CHECKED',
        severity: 'INFO',
        message: 'Visual zone and MRZ pair not both available for consistency cross-check.',
        evidence: {
          hasMrz: Boolean(input.mrz?.detected),
          hasConsistencyResult: Boolean(consistency),
        },
      };
    }

    const mismatches = consistency.comparisons.filter((c) => c.status === 'MISMATCH');

    if (mismatches.length > 0) {
      const mismatchSummaries = mismatches.map(
        (m) => `${m.fieldLabel} (Visual: "${m.ocrValue || 'N/A'}" vs MRZ: "${m.mrzValue || 'N/A'}")`
      );

      return {
        rule_id: this.id,
        category: this.category,
        status: 'WARNING',
        severity: config.severities?.ocr_mrz_mismatch || 'MEDIUM',
        message: `Optical discrepancy detected in ${mismatches.length} field(s): ${mismatchSummaries.join(', ')}. Manual inspection recommended.`,
        evidence: {
          mismatchCount: mismatches.length,
          mismatches: mismatches.map((m) => ({
            field: m.field,
            label: m.fieldLabel,
            ocr: m.ocrValue,
            mrz: m.mrzValue,
            detail: m.detail,
          })),
        },
      };
    }

    return {
      rule_id: this.id,
      category: this.category,
      status: 'PASS',
      severity: 'INFO',
      message: `Full parity confirmed: All ${consistency.matchCount} cross-checked fields match between Visual Zone and MRZ.`,
      evidence: {
        matchCount: consistency.matchCount,
        comparisons: consistency.comparisons.map((c) => ({
          field: c.field,
          status: c.status,
        })),
      },
    };
  }
}
