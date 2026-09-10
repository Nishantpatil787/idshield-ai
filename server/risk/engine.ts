/**
 * IDShield AI — Explainable Risk Engine
 * Aggregates evidence signals from OCR, MRZ, Validation, Cross-Document Consistency,
 * Tampering Detection, and Face Verification into a deterministic 0-100 risk score.
 */

import { RiskFactor, RiskLevel } from '../../src/types';

export interface RiskEngineInput {
  ocrResult?: {
    confidence?: number;
    text?: string;
  };
  mrzResult?: {
    detected?: boolean;
    checksumValidation?: {
      passport_number?: boolean;
      date_of_birth?: boolean;
      expiry_date?: boolean;
      composite?: boolean;
      all_passed?: boolean;
    };
  };
  validationResult?: {
    overall_status?: string;
    passed?: number;
    failed?: number;
    warnings?: number;
    results?: Array<{
      rule_id: string;
      status: string;
      severity: string;
      message: string;
    }>;
  };
  consistencyResult?: {
    overallMatch?: boolean;
    mismatchCount?: number;
    summary?: string;
  };
  crossDocumentResult?: {
    overall_status?: string;
    summary?: {
      matches?: number;
      mismatches?: number;
      review_required?: number;
    };
    explanations?: string[];
  };
  tamperingResult?: {
    overallTamperingScore?: number;
    photoManipulationStatus?: string;
    textManipulationStatus?: string;
    items?: Array<{
      type: string;
      status: string;
      description: string;
    }>;
  };
  faceResult?: {
    status?: string; // 'MATCH' | 'NO_MATCH' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE' | 'INVALID_INPUT'
    matchStatus?: string; // 'MATCHED' | 'UNMATCHED' | 'INCONCLUSIVE' | 'NOT_APPLICABLE'
    similarityScore?: number; // 0 - 100 or 0.0 - 1.0
    qualityScore?: number;
    referenceFaceDetected?: boolean;
    probeFaceDetected?: boolean;
  };
}

export interface RiskEngineOutput {
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel | 'CRITICAL';
  recommendedAction: 'CLEAR' | 'SECONDARY_INTERVIEW' | 'PHYSICAL_INSPECTION' | 'DENY_ENTRY';
  primaryRiskSummary: string;
  explainableFactors: RiskFactor[];
  timestamp: string;
}

export class RiskEngine {
  public static calculateRisk(input: RiskEngineInput): RiskEngineOutput {
    let riskScore = 5; // Base minimal score for clean scan
    const factors: RiskFactor[] = [];

    // 1. MRZ Checksum Signals
    const checksums = input.mrzResult?.checksumValidation;
    if (input.mrzResult?.detected) {
      if (checksums && checksums.all_passed === false) {
        if (checksums.passport_number === false) {
          riskScore += 30;
          factors.push({
            id: 'rf-mrz-passno',
            factor: 'MRZ Passport Number Check Digit Mismatch',
            weight: 'CRITICAL',
            impactPoints: 30,
            description: 'ICAO 9303 7-3-1 check digit failed on document number string.',
            mitigationSuggestion: 'Perform UV and infrared physical inspection of credential substrate.',
          });
        }
        if (checksums.date_of_birth === false) {
          riskScore += 25;
          factors.push({
            id: 'rf-mrz-dob',
            factor: 'MRZ Date of Birth Check Digit Violation',
            weight: 'HIGH',
            impactPoints: 25,
            description: 'Date of birth checksum does not mathematically correspond to birthdate string.',
            mitigationSuggestion: 'Verify holder identity against secondary birth registry databases.',
          });
        }
        if (checksums.expiry_date === false) {
          riskScore += 25;
          factors.push({
            id: 'rf-mrz-exp',
            factor: 'MRZ Expiry Date Check Digit Failure',
            weight: 'HIGH',
            impactPoints: 25,
            description: 'Expiry date check digit parity calculation failed.',
            mitigationSuggestion: 'Check document validity against national border registry.',
          });
        }
        if (checksums.composite === false) {
          riskScore += 20;
          factors.push({
            id: 'rf-mrz-comp',
            factor: 'Composite MRZ Checksum Violation',
            weight: 'CRITICAL',
            impactPoints: 20,
            description: 'Overall composite parity failed across Line 2 data components.',
            mitigationSuggestion: 'Escalate case to secondary border supervisor.',
          });
        }
      }
    } else {
      // MRZ not detected when expected
      riskScore += 15;
      factors.push({
        id: 'rf-mrz-missing',
        factor: 'Machine Readable Zone Unreadable or Absent',
        weight: 'MEDIUM',
        impactPoints: 15,
        description: 'MRZ lines could not be decoded from credential image.',
        mitigationSuggestion: 'Re-scan document with high-resolution flatbed scanner.',
      });
    }

    // 2. Document Validation Rule Failures
    if (input.validationResult?.results) {
      for (const res of input.validationResult.results) {
        if (res.status === 'FAIL') {
          const impact = res.severity === 'HIGH' ? 25 : res.severity === 'MEDIUM' ? 15 : 10;
          riskScore += impact;
          factors.push({
            id: `rf-val-${res.rule_id}`,
            factor: `Document Rule Failure: ${res.rule_id.replace(/_/g, ' ').toUpperCase()}`,
            weight: res.severity === 'HIGH' ? 'HIGH' : 'MEDIUM',
            impactPoints: impact,
            description: res.message,
            mitigationSuggestion: 'Verify physical credential against official document catalog specifications.',
          });
        } else if (res.status === 'WARNING') {
          const impact = 10;
          riskScore += impact;
          factors.push({
            id: `rf-val-${res.rule_id}`,
            factor: `Validation Warning: ${res.rule_id.replace(/_/g, ' ').toUpperCase()}`,
            weight: 'LOW',
            impactPoints: impact,
            description: res.message,
          });
        }
      }
    }

    // 3. OCR ↔ MRZ Visual Consistency
    if (input.consistencyResult && input.consistencyResult.overallMatch === false) {
      const impact = 20;
      riskScore += impact;
      factors.push({
        id: 'rf-ocr-mrz-mismatch',
        factor: 'Visual Text vs MRZ Discrepancy',
        weight: 'HIGH',
        impactPoints: impact,
        description: input.consistencyResult.summary || 'Extracted visual text fields do not match decoded MRZ data.',
        mitigationSuggestion: 'Inspect document for altered visual text overlay or re-printed MRZ.',
      });
    }

    // 4. Cross-Document Consistency
    if (input.crossDocumentResult && input.crossDocumentResult.overall_status === 'REVIEW_REQUIRED') {
      const mismatches = input.crossDocumentResult.summary?.mismatches || 1;
      const impact = Math.min(45, mismatches * 25);
      riskScore += impact;
      factors.push({
        id: 'rf-cross-doc-mismatch',
        factor: 'Cross-Document Identity Inconsistency',
        weight: 'HIGH',
        impactPoints: impact,
        description: input.crossDocumentResult.explanations?.[0] || 'Inconsistent identity data across submitted documents.',
        mitigationSuggestion: 'Conduct interview with document bearer regarding biographical discrepancy.',
      });
    }

    // 5. Digital Tampering Signals
    if (input.tamperingResult) {
      const tampScore = input.tamperingResult.overallTamperingScore || 0;
      if (tampScore > 20) {
        const impact = Math.min(50, Math.round(tampScore * 0.6));
        riskScore += impact;
        factors.push({
          id: 'rf-tamper-detected',
          factor: 'Forensic Tampering & Manipulation Evidence',
          weight: tampScore > 60 ? 'CRITICAL' : 'HIGH',
          impactPoints: impact,
          description: `Digital forensic analysis detected potential document tampering (Score: ${tampScore}/100).`,
          mitigationSuggestion: 'Perform UV/IR physical examination and check substrate micro-print.',
        });
      }
    }

    // 6. Biometric Face Verification Signals
    if (input.faceResult) {
      const faceStatus = input.faceResult.status || (input.faceResult.matchStatus === 'MATCHED' ? 'MATCH' : 'REVIEW_REQUIRED');
      let simScore = input.faceResult.similarityScore || 0;
      if (simScore <= 1.0 && simScore > 0) simScore = simScore * 100; // normalize percentage

      if (faceStatus === 'NO_MATCH' || input.faceResult.matchStatus === 'UNMATCHED') {
        const impact = 45;
        riskScore += impact;
        factors.push({
          id: 'rf-face-nomatch',
          factor: 'Biometric Face Match Divergence',
          weight: 'CRITICAL',
          impactPoints: impact,
          description: `Live selfie does not match document photo (Embedding similarity: ${simScore.toFixed(1)}%).`,
          mitigationSuggestion: 'Perform identity verification with secondary photo ID or live officer interview.',
        });
      } else if (faceStatus === 'REVIEW_REQUIRED') {
        const impact = 20;
        riskScore += impact;
        factors.push({
          id: 'rf-face-review',
          factor: 'Biometric Face Verification Review Recommended',
          weight: 'MEDIUM',
          impactPoints: impact,
          description: `Biometric similarity is ambiguous or image quality is suboptimal (${simScore.toFixed(1)}%).`,
          mitigationSuggestion: 'Re-capture selfie in clear lighting without facial obstructions.',
        });
      } else if (faceStatus === 'NOT_AVAILABLE' || faceStatus === 'NOT_PROVIDED') {
        // Missing reference face is handled as NOT_AVAILABLE without inflating risk to CRITICAL
        factors.push({
          id: 'rf-face-notavail',
          factor: 'Biometric Selfie Verification Not Conducted',
          weight: 'LOW',
          impactPoints: 0,
          description: 'No reference selfie or secondary portrait provided for biometric comparison.',
        });
      }
    }

    // Bound final risk score between 0 and 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    // Determine Risk Level & Recommendation
    let riskLevel: RiskLevel | 'CRITICAL' = 'LOW';
    let recommendedAction: 'CLEAR' | 'SECONDARY_INTERVIEW' | 'PHYSICAL_INSPECTION' | 'DENY_ENTRY' = 'CLEAR';

    if (riskScore >= 75) {
      riskLevel = 'HIGH';
      recommendedAction = 'DENY_ENTRY';
    } else if (riskScore >= 50) {
      riskLevel = 'HIGH';
      recommendedAction = 'PHYSICAL_INSPECTION';
    } else if (riskScore >= 25) {
      riskLevel = 'MEDIUM';
      recommendedAction = 'SECONDARY_INTERVIEW';
    } else {
      riskLevel = 'LOW';
      recommendedAction = 'CLEAR';
    }

    // Summary text
    let primaryRiskSummary = '';
    if (riskScore < 25) {
      primaryRiskSummary = 'Credential verified: Clean baseline structure with valid MRZ checksums and high data fidelity.';
    } else {
      primaryRiskSummary = factors[0]?.description || 'Multiple anomalies flagged during automated screening.';
    }

    if (factors.length === 0) {
      factors.push({
        id: 'rf-clean-baseline',
        factor: 'Clean Credential Baseline',
        weight: 'LOW',
        impactPoints: 0,
        description: 'No checksum violations or forensic tamper anomalies detected.',
      });
    }

    return {
      riskScore,
      riskLevel,
      recommendedAction,
      primaryRiskSummary,
      explainableFactors: factors,
      timestamp: new Date().toISOString(),
    };
  }
}
