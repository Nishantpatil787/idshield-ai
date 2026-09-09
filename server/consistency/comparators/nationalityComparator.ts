/**
 * IDShield AI — Nationality Consistency Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class NationalityComparator implements ICrossDocumentComparator {
  id = 'nationality_consistency';
  field = 'nationality';
  label = 'Nationality / Citizenship';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    const rawA = docA.nationality.raw;
    const rawB = docB.nationality.raw;

    const codeA = docA.nationality.code3;
    const codeB = docB.nationality.code3;

    if (!codeA || !codeB) {
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
        explanation: `Nationality is not available on both documents (${docA.label}: ${rawA || 'None'}, ${docB.label}: ${rawB || 'None'}).`,
      };
    }

    if (codeA === codeB) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: codeA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: codeB,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Nationality code matches exactly between ${docA.label} and ${docB.label} (${codeA}).`,
      };
    }

    // Mismatch
    const severity = config?.severities?.nationality_mismatch || 'MEDIUM';
    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: codeA,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: codeB,
      },
      status: 'MISMATCH',
      confidence: null,
      severity,
      explanation: `Nationality code differs: ${docA.label} indicates ${codeA} while ${docB.label} indicates ${codeB}. While holders can legitimately possess dual nationalities or resident statuses, this difference warrants operator review.`,
      evidence: {
        nationality_doc_a: codeA,
        nationality_doc_b: codeB,
      },
    };
  }
}
