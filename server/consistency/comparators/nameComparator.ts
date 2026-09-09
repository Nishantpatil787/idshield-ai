/**
 * IDShield AI — Name Consistency Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class NameComparator implements ICrossDocumentComparator {
  id = 'name_consistency';
  field = 'full_name';
  label = 'Holder Full Name';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    const rawA = docA.name.raw;
    const rawB = docB.name.raw;

    const normA = docA.name.normalized;
    const normB = docB.name.normalized;

    // Handle missing data
    if (!normA || !normB) {
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
        explanation: `Holder name is not available on both documents (${docA.label}: ${rawA || 'None'}, ${docB.label}: ${rawB || 'None'}).`,
      };
    }

    // Exact normalized string match
    if (normA === normB) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: rawA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: rawB,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Holder full name matches exactly between ${docA.label} and ${docB.label} ("${normA}").`,
      };
    }

    const tokensA = docA.name.tokens;
    const tokensB = docB.name.tokens;

    const setA = new Set(tokensA);
    const setB = new Set(tokensB);

    // Check if token sets are identical (order-independent match like "DOE, JOHN" vs "JOHN DOE")
    const areSetsEqual = tokensA.length === tokensB.length && tokensA.every((t) => setB.has(t));
    if (areSetsEqual) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: rawA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: rawB,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Holder name tokens match completely across different formatting representations ("${rawA}" vs "${rawB}").`,
      };
    }

    // Check if one name is a subset of another (e.g. middle name omitted in one document)
    const isASubsetOfB = tokensA.length > 0 && tokensA.every((t) => setB.has(t));
    const isBSubsetOfA = tokensB.length > 0 && tokensB.every((t) => setA.has(t));

    if (isASubsetOfB || isBSubsetOfA) {
      const omitted = isASubsetOfB
        ? tokensB.filter((t) => !setA.has(t)).join(' ')
        : tokensA.filter((t) => !setB.has(t)).join(' ');

      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: rawA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: rawB,
        },
        status: 'REVIEW_REQUIRED',
        confidence: null,
        severity: config?.severities?.name_review_required || 'LOW',
        explanation: `Holder name in one document contains additional tokens ("${omitted}") not present in the other ("${rawA}" vs "${rawB}"). Manual review recommended to confirm middle names or title omission.`,
        evidence: {
          tokens_doc_a: tokensA,
          tokens_doc_b: tokensB,
          omitted_tokens: omitted,
        },
      };
    }

    // Check for single token differences / potential spelling variants vs completely distinct names
    const sharedTokens = tokensA.filter((t) => setB.has(t));
    if (sharedTokens.length > 0) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: rawA,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: rawB,
        },
        status: 'REVIEW_REQUIRED',
        confidence: null,
        severity: config?.severities?.name_review_required || 'MEDIUM',
        explanation: `Holder names share partial components (${sharedTokens.join(', ')}) but differ in remaining tokens ("${rawA}" vs "${rawB}"). Manual verification required.`,
        evidence: {
          shared_tokens: sharedTokens,
          tokens_doc_a: tokensA,
          tokens_doc_b: tokensB,
        },
      };
    }

    // Distinct names
    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: rawA,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: rawB,
      },
      status: 'MISMATCH',
      confidence: null,
      severity: config?.severities?.name_mismatch || 'HIGH',
      explanation: `Holder name on ${docA.label} ("${rawA}") is completely inconsistent with name on ${docB.label} ("${rawB}").`,
      evidence: {
        name_doc_a: rawA,
        name_doc_b: rawB,
      },
    };
  }
}
