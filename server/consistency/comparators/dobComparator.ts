/**
 * IDShield AI — Date of Birth Consistency Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class DobComparator implements ICrossDocumentComparator {
  id = 'dob_consistency';
  field = 'date_of_birth';
  label = 'Date of Birth';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    const rawA = docA.date_of_birth.raw;
    const rawB = docB.date_of_birth.raw;

    const isoA = docA.date_of_birth.iso;
    const isoB = docB.date_of_birth.iso;

    if (!isoA || !isoB) {
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
        explanation: `Date of birth is not available on both documents (${docA.label}: ${rawA || 'None'}, ${docB.label}: ${rawB || 'None'}).`,
      };
    }

    if (isoA === isoB) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: isoA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: isoB,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Date of birth matches exactly between ${docA.label} and ${docB.label} (${isoA}).`,
      };
    }

    // Mismatch
    const severity = config?.severities?.dob_mismatch || 'HIGH';
    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: isoA,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: isoB,
      },
      status: 'MISMATCH',
      confidence: null,
      severity,
      explanation: `${docA.label} DOB is ${isoA} while ${docB.label} DOB is ${isoB}. This birth date discrepancy requires manual operator verification.`,
      evidence: {
        dob_doc_a: isoA,
        dob_doc_b: isoB,
        difference_years: Math.abs((docA.date_of_birth.year || 0) - (docB.date_of_birth.year || 0)),
      },
    };
  }
}
