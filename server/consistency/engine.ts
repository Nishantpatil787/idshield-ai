/**
 * IDShield AI — Cross-Document Consistency Engine
 * Deterministically evaluates consistency across identity and travel documents in a screening case.
 */

import {
  ScreeningCaseInput,
  CaseDocumentInput,
  NormalizedIdentityProfile,
  CrossDocumentFieldComparison,
  CrossDocumentConsistencyResult,
  CrossDocumentSummary,
  CrossDocumentOverallStatus,
  CrossDocumentConfig,
} from './types';
import { buildNormalizedIdentityProfile } from './normalizer';
import { ICrossDocumentComparator } from './comparators/base';
import { NameComparator } from './comparators/nameComparator';
import { PassportNumberComparator } from './comparators/passportNumberComparator';
import { DobComparator } from './comparators/dobComparator';
import { NationalityComparator } from './comparators/nationalityComparator';
import { GenderComparator } from './comparators/genderComparator';
import { DateRelationshipComparator } from './comparators/dateRelationshipComparator';

export class CrossDocumentConsistencyEngine {
  private comparators: ICrossDocumentComparator[];
  private defaultConfig: CrossDocumentConfig;

  constructor(config?: CrossDocumentConfig) {
    this.defaultConfig = config || {};
    this.comparators = [
      new NameComparator(),
      new PassportNumberComparator(),
      new DobComparator(),
      new NationalityComparator(),
      new GenderComparator(),
      new DateRelationshipComparator(),
    ];
  }

  /**
   * Register an additional custom comparator (extensible architecture)
   */
  public registerComparator(comparator: ICrossDocumentComparator) {
    this.comparators.push(comparator);
  }

  /**
   * Evaluates a full screening case containing multiple documents
   */
  public evaluateCase(caseInput: ScreeningCaseInput): CrossDocumentConsistencyResult {
    const timestamp = new Date().toISOString();
    const caseId = caseInput.case_id || `CASE-${Date.now().toString(36).toUpperCase()}`;

    // Collect all unique documents
    const docList: CaseDocumentInput[] = [];
    if (caseInput.primary_document) {
      docList.push({
        ...caseInput.primary_document,
        role: 'primary',
      });
    }

    if (caseInput.supporting_documents && Array.isArray(caseInput.supporting_documents)) {
      for (const sup of caseInput.supporting_documents) {
        if (sup && !docList.some((d) => d.document_id === sup.document_id)) {
          docList.push({
            ...sup,
            role: 'supporting',
          });
        }
      }
    }

    if (caseInput.all_documents && Array.isArray(caseInput.all_documents)) {
      for (const d of caseInput.all_documents) {
        if (d && !docList.some((existing) => existing.document_id === d.document_id)) {
          docList.push(d);
        }
      }
    }

    // If fewer than 2 documents are present in the case, cross-document comparison is Not Applicable
    if (docList.length < 2) {
      return {
        case_id: caseId,
        documents_compared: docList.length,
        document_pairs: [],
        comparisons: [],
        summary: {
          matches: 0,
          mismatches: 0,
          review_required: 0,
          not_available: 0,
          total_comparisons: 0,
        },
        overall_status: 'NOT_APPLICABLE',
        explanations: [
          docList.length === 1
            ? `Single document (${docList[0].document_type.toUpperCase()}) presented. Cross-document comparison requires at least two documents in the screening case.`
            : 'No documents provided in screening case.',
        ],
        timestamp,
      };
    }

    // Build normalized profiles
    const profiles: NormalizedIdentityProfile[] = docList.map((d) => buildNormalizedIdentityProfile(d));

    // Construct pairwise comparison graph without duplicate symmetric comparisons
    const pairs: Array<{ docA: NormalizedIdentityProfile; docB: NormalizedIdentityProfile; relation: string }> = [];
    const pairKeys = new Set<string>();

    const primaryDoc = profiles.find((p) => p.role === 'primary') || profiles[0];
    const otherDocs = profiles.filter((p) => p !== primaryDoc);

    // Primary ↔ Each Supporting Document
    for (const sup of otherDocs) {
      const key = `${primaryDoc.document_id}_${sup.document_id}`;
      if (!pairKeys.has(key)) {
        pairKeys.add(key);
        pairs.push({
          docA: primaryDoc,
          docB: sup,
          relation: `${primaryDoc.document_type.toUpperCase()} ↔ ${sup.document_type.toUpperCase()}`,
        });
      }
    }

    // If there are multiple supporting documents, compare secondary pairs where meaningful (e.g. Visa 1 ↔ Visa 2 or Visa ↔ Permit)
    if (otherDocs.length > 1) {
      for (let i = 0; i < otherDocs.length; i++) {
        for (let j = i + 1; j < otherDocs.length; j++) {
          const key = `${otherDocs[i].document_id}_${otherDocs[j].document_id}`;
          if (!pairKeys.has(key)) {
            pairKeys.add(key);
            pairs.push({
              docA: otherDocs[i],
              docB: otherDocs[j],
              relation: `${otherDocs[i].document_type.toUpperCase()} ↔ ${otherDocs[j].document_type.toUpperCase()}`,
            });
          }
        }
      }
    }

    const comparisons: CrossDocumentFieldComparison[] = [];
    const explanations: string[] = [];

    const summary: CrossDocumentSummary = {
      matches: 0,
      mismatches: 0,
      review_required: 0,
      not_available: 0,
      total_comparisons: 0,
    };

    const effectiveConfig: CrossDocumentConfig = {
      ...this.defaultConfig,
      ...(caseInput.config || {}),
    };

    // Execute comparators across selected document pairs
    for (const pair of pairs) {
      for (const comp of this.comparators) {
        const result = comp.compare(pair.docA, pair.docB, effectiveConfig);
        if (result) {
          comparisons.push(result);
          summary.total_comparisons++;

          if (result.status === 'MATCH') {
            summary.matches++;
          } else if (result.status === 'MISMATCH') {
            summary.mismatches++;
            explanations.push(
              `[${pair.relation} - ${result.field_label}] ${result.explanation}`
            );
          } else if (result.status === 'REVIEW_REQUIRED') {
            summary.review_required++;
            explanations.push(
              `[${pair.relation} - ${result.field_label}] ${result.explanation}`
            );
          } else if (result.status === 'NOT_AVAILABLE') {
            summary.not_available++;
          }
        }
      }
    }

    // Compute Overall Status (Never 'FAKE' or 'FORGED', only CONSISTENT vs REVIEW_REQUIRED)
    let overall_status: CrossDocumentOverallStatus = 'CONSISTENT';
    if (summary.mismatches > 0 || summary.review_required > 0) {
      overall_status = 'REVIEW_REQUIRED';
    }

    if (explanations.length === 0) {
      explanations.push(
        `All evaluated identity and travel credential fields across ${docList.length} documents are consistent without detected discrepancies.`
      );
    }

    return {
      case_id: caseId,
      documents_compared: docList.length,
      document_pairs: pairs.map((p) => ({
        doc_a: p.docA.document_id,
        doc_b: p.docB.document_id,
        relation: p.relation,
      })),
      comparisons,
      summary,
      overall_status,
      explanations,
      timestamp,
    };
  }
}
