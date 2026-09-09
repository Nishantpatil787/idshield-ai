/**
 * IDShield AI — Passport Number / Document Association Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class PassportNumberComparator implements ICrossDocumentComparator {
  id = 'passport_number_consistency';
  field = 'passport_number';
  label = 'Passport Number Linkage';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    // Determine passport number on Doc A and associated passport number on Doc B (or vice versa)
    let passportDoc = docA.document_type === 'passport' ? docA : docB.document_type === 'passport' ? docB : null;
    let otherDoc = passportDoc === docA ? docB : docA;

    const primaryPassportNumber = passportDoc ? (passportDoc.passport_number || passportDoc.document_number) : (docA.passport_number || docA.document_number);
    const associatedPassportNumber = otherDoc.associated_passport_number || otherDoc.passport_number;

    if (!primaryPassportNumber || !associatedPassportNumber) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: docA.passport_number || docA.associated_passport_number || docA.document_number || null,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: docB.passport_number || docB.associated_passport_number || docB.document_number || null,
        },
        status: 'NOT_AVAILABLE',
        confidence: null,
        severity: 'INFO',
        explanation: `Passport linkage number is not available on both documents (${docA.label}: ${docA.passport_number || docA.associated_passport_number || 'None'}, ${docB.label}: ${docB.passport_number || docB.associated_passport_number || 'None'}).`,
      };
    }

    if (primaryPassportNumber === associatedPassportNumber) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: docA.passport_number || docA.associated_passport_number || docA.document_number,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: docB.passport_number || docB.associated_passport_number || docB.document_number,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Passport number linkage matches exactly between ${docA.label} and ${docB.label} ("${primaryPassportNumber}").`,
      };
    }

    // Mismatch
    const severity = config?.severities?.passport_number_mismatch || 'HIGH';
    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: docA.passport_number || docA.associated_passport_number || docA.document_number,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: docB.passport_number || docB.associated_passport_number || docB.document_number,
      },
      status: 'MISMATCH',
      confidence: null,
      severity,
      explanation: `Primary passport document number ("${primaryPassportNumber}") does not match the associated passport number recorded on ${otherDoc.label} ("${associatedPassportNumber}"). This high-severity discrepancy requires manual operator verification.`,
      evidence: {
        primary_passport_number: primaryPassportNumber,
        associated_passport_number: associatedPassportNumber,
        difference: `Expected ${primaryPassportNumber}, found ${associatedPassportNumber}`,
      },
    };
  }
}
