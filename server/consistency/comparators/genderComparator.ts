/**
 * IDShield AI — Gender / Sex Consistency Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class GenderComparator implements ICrossDocumentComparator {
  id = 'gender_consistency';
  field = 'gender';
  label = 'Sex / Gender Designation';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    const rawA = docA.gender.raw;
    const rawB = docB.gender.raw;

    const stdA = docA.gender.standard;
    const stdB = docB.gender.standard;

    // If either document does not contain gender information, return NOT_AVAILABLE without generating a false mismatch
    if (!stdA || !stdB || stdA === '<' || stdB === '<') {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: rawA || null,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: rawB || null,
        },
        status: 'NOT_AVAILABLE',
        confidence: null,
        severity: 'INFO',
        explanation: `Sex / gender designation is not recorded or specified on both documents (${docA.label}: ${rawA || 'Unspecified'}, ${docB.label}: ${rawB || 'Unspecified'}).`,
      };
    }

    if (stdA === stdB) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: stdA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: stdB,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Sex / gender designation matches between ${docA.label} and ${docB.label} (${stdA}).`,
      };
    }

    // Mismatch
    const severity = config?.severities?.gender_mismatch || 'MEDIUM';
    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: stdA,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: stdB,
      },
      status: 'MISMATCH',
      confidence: null,
      severity,
      explanation: `Sex / gender designation discrepancy: ${docA.label} records "${stdA}" while ${docB.label} records "${stdB}". Manual review recommended.`,
      evidence: {
        gender_doc_a: stdA,
        gender_doc_b: stdB,
      },
    };
  }
}
