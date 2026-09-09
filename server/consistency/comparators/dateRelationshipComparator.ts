/**
 * IDShield AI — Document Date Chronology & Relationship Comparator
 */

import { ICrossDocumentComparator } from './base';
import { NormalizedIdentityProfile, CrossDocumentFieldComparison, CrossDocumentConfig } from '../types';

export class DateRelationshipComparator implements ICrossDocumentComparator {
  id = 'date_relationship_consistency';
  field = 'validity_chronology';
  label = 'Document Validity Chronology';

  compare(
    docA: NormalizedIdentityProfile,
    docB: NormalizedIdentityProfile,
    config?: CrossDocumentConfig
  ): CrossDocumentFieldComparison {
    const passportDoc = docA.document_type === 'passport' ? docA : docB.document_type === 'passport' ? docB : null;
    const visaDoc = docA.document_type === 'visa' ? docA : docB.document_type === 'visa' ? docB : null;

    // If comparing Passport ↔ Visa with issue dates available
    if (passportDoc && visaDoc && passportDoc.validity.issue_date && visaDoc.validity.issue_date) {
      const passportIssueTime = new Date(passportDoc.validity.issue_date).getTime();
      const visaIssueTime = new Date(visaDoc.validity.issue_date).getTime();

      // Visa issue date precedes passport issue date
      if (visaIssueTime < passportIssueTime) {
        return {
          id: `${this.id}_${docA.document_id}_${docB.document_id}`,
          field: this.field,
          field_label: this.label,
          document_a: {
            id: docA.document_id,
            type: docA.document_type,
            label: docA.label,
            value: `Issue: ${docA.validity.issue_date || 'N/A'}`,
          },
          document_b: {
            id: docB.document_id,
            type: docB.document_type,
            label: docB.label,
            value: `Issue: ${docB.validity.issue_date || 'N/A'}`,
          },
          status: 'REVIEW_REQUIRED',
          confidence: null,
          severity: config?.severities?.chronology_violation || 'MEDIUM',
          explanation: `Visa issuance date (${visaDoc.validity.issue_date}) precedes the associated passport issuance date (${passportDoc.validity.issue_date}). Verify whether this visa was issued against a prior expired passport or re-linked.`,
          evidence: {
            passport_issue_date: passportDoc.validity.issue_date,
            visa_issue_date: visaDoc.validity.issue_date,
            chronological_difference_days: Math.round((passportIssueTime - visaIssueTime) / (1000 * 60 * 60 * 24)),
          },
        };
      }
    }

    // Check expiry horizon relationship between Passport and Visa
    if (passportDoc && visaDoc && passportDoc.validity.expiry_date && visaDoc.validity.expiry_date) {
      const passportExpiryTime = new Date(passportDoc.validity.expiry_date).getTime();
      const visaExpiryTime = new Date(visaDoc.validity.expiry_date).getTime();

      if (visaExpiryTime > passportExpiryTime) {
        return {
          id: `${this.id}_${docA.document_id}_${docB.document_id}`,
          field: this.field,
          field_label: this.label,
          document_a: {
            id: docA.document_id,
            type: docA.document_type,
            label: docA.label,
            value: `Expiry: ${docA.validity.expiry_date || 'N/A'}`,
          },
          document_b: {
            id: docB.document_id,
            type: docB.document_type,
            label: docB.label,
            value: `Expiry: ${docB.validity.expiry_date || 'N/A'}`,
          },
          status: 'REVIEW_REQUIRED',
          confidence: null,
          severity: 'LOW',
          explanation: `Visa validity period (${visaDoc.validity.expiry_date}) extends beyond the current passport expiration date (${passportDoc.validity.expiry_date}). Secondary verification may be needed to confirm passport renewal status.`,
          evidence: {
            passport_expiry_date: passportDoc.validity.expiry_date,
            visa_expiry_date: visaDoc.validity.expiry_date,
          },
        };
      }
    }

    // If both have issue and expiry dates and they are chronologically sound
    if (docA.validity.expiry_date && docB.validity.expiry_date) {
      return {
        id: `${this.id}_${docA.document_id}_${docB.document_id}`,
        field: this.field,
        field_label: this.label,
        document_a: {
          id: docA.document_id,
          type: docA.document_type,
          label: docA.label,
          value: `Exp: ${docA.validity.expiry_date}`,
        },
        document_b: {
          id: docB.document_id,
          type: docB.document_type,
          label: docB.label,
          value: `Exp: ${docB.validity.expiry_date}`,
        },
        status: 'MATCH',
        confidence: null,
        severity: 'INFO',
        explanation: `Document chronological relationships between ${docA.label} and ${docB.label} are consistent.`,
      };
    }

    return {
      id: `${this.id}_${docA.document_id}_${docB.document_id}`,
      field: this.field,
      field_label: this.label,
      document_a: {
        id: docA.document_id,
        type: docA.document_type,
        label: docA.label,
        value: docA.validity.expiry_date || null,
      },
      document_b: {
        id: docB.document_id,
        type: docB.document_type,
        label: docB.label,
        value: docB.validity.expiry_date || null,
      },
      status: 'NOT_AVAILABLE',
      confidence: null,
      severity: 'INFO',
      explanation: `Insufficient date data to cross-evaluate document validity relationships between ${docA.label} and ${docB.label}.`,
    };
  }
}
