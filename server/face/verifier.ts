/**
 * IDShield AI — TypeScript Face Verifier Engine
 */

import {
  FaceDetectionResult,
  FaceQualityResult,
  FaceVerificationResponse,
  FaceVerificationStatus,
} from './types';
import { getEffectiveConfig, FaceConfigOptions } from './config';
import { FaceEmbeddingExtractorTS } from './embedding';

export class FaceVerifierTS {
  private config: ReturnType<typeof getEffectiveConfig>;
  private embeddingExtractor: FaceEmbeddingExtractorTS;

  constructor(options?: FaceConfigOptions) {
    this.config = getEffectiveConfig(options);
    this.embeddingExtractor = new FaceEmbeddingExtractorTS();
  }

  public verify(
    refDetection: FaceDetectionResult,
    probeDetection: FaceDetectionResult,
    refQuality: FaceQualityResult,
    probeQuality: FaceQualityResult,
    refEmbedding: number[],
    probeEmbedding: number[],
    executionTimeMs: number = 0
  ): FaceVerificationResponse {
    const evidence: string[] = [];

    const refDetected = refDetection.faceDetected;
    const probeDetected = probeDetection.faceDetected;
    const refCount = refDetection.faceCount;
    const probeCount = probeDetection.faceCount;

    // Disclaimer statement
    const disclaimer =
      'Face verification is an AI-assisted similarity assessment and is not a legally conclusive identity determination.';

    // 1. Missing Face
    if (!refDetected || !probeDetected) {
      if (!refDetected && !probeDetected) {
        evidence.push('No faces detected in either reference or probe image');
      } else if (!refDetected) {
        evidence.push('Reference image does not contain a detectable face');
        evidence.push(`Probe document image contains ${probeCount} detected face(s)`);
      } else {
        evidence.push(`Reference image contains ${refCount} detected face(s)`);
        evidence.push('Probe document image does not contain a detectable face');
      }

      return {
        status: 'NOT_AVAILABLE',
        similarityScore: 0.0,
        referenceFaceDetected: refDetected,
        probeFaceDetected: probeDetected,
        referenceFaceCount: refCount,
        probeFaceCount: probeCount,
        thresholds: {
          match: this.config.matchThreshold,
          review: this.config.reviewThreshold,
        },
        referenceQuality: refQuality,
        probeQuality: probeQuality,
        evidence,
        executionTimeMs: parseFloat(executionTimeMs.toFixed(2)),
        disclaimer,
      };
    }

    evidence.push(`Reference face detected (${refCount} face found)`);
    evidence.push(`Probe document face detected (${probeCount} face found)`);

    // 2. Multiple Faces
    if (refCount > this.config.maxAllowedFaces || probeCount > this.config.maxAllowedFaces) {
      if (refCount > 1) {
        evidence.push(`Ambiguous input: Reference image contains ${refCount} faces (expected single face)`);
      }
      if (probeCount > 1) {
        evidence.push(`Ambiguous input: Probe document contains ${probeCount} faces (expected single face)`);
      }
      evidence.push('Multiple face candidates require supervisor review');

      return {
        status: 'REVIEW_REQUIRED',
        similarityScore: 0.0,
        referenceFaceDetected: refDetected,
        probeFaceDetected: probeDetected,
        referenceFaceCount: refCount,
        probeFaceCount: probeCount,
        thresholds: {
          match: this.config.matchThreshold,
          review: this.config.reviewThreshold,
        },
        referenceQuality: refQuality,
        probeQuality: probeQuality,
        evidence,
        executionTimeMs: parseFloat(executionTimeMs.toFixed(2)),
        disclaimer,
      };
    }

    // 3. Compute Similarity
    const similarity = this.embeddingExtractor.computeCosineSimilarity(refEmbedding, probeEmbedding);
    evidence.push(`Facial embedding cosine similarity: ${(similarity * 100).toFixed(1)}% (${similarity.toFixed(3)})`);

    // 4. Quality Defects
    const hasQualityDefect = refQuality.qualityStatus === 'POOR' || probeQuality.qualityStatus === 'POOR' || refQuality.qualityStatus === 'INVALID' || probeQuality.qualityStatus === 'INVALID';

    if (hasQualityDefect) {
      refQuality.issues.forEach((i) => evidence.push(`Reference quality issue: ${i}`));
      probeQuality.issues.forEach((i) => evidence.push(`Probe quality issue: ${i}`));
      evidence.push('Image quality is below optimal threshold; flagged for manual review rather than immediate rejection');

      return {
        status: 'REVIEW_REQUIRED',
        similarityScore: parseFloat(similarity.toFixed(4)),
        referenceFaceDetected: refDetected,
        probeFaceDetected: probeDetected,
        referenceFaceCount: refCount,
        probeFaceCount: probeCount,
        thresholds: {
          match: this.config.matchThreshold,
          review: this.config.reviewThreshold,
        },
        referenceQuality: refQuality,
        probeQuality: probeQuality,
        evidence,
        executionTimeMs: parseFloat(executionTimeMs.toFixed(2)),
        disclaimer,
      };
    }

    // 5. Threshold Decision
    let status: FaceVerificationStatus = 'NO_MATCH';
    if (similarity >= this.config.matchThreshold) {
      status = 'MATCH';
      evidence.push(`Similarity score (${similarity.toFixed(2)}) meets or exceeds match threshold (${this.config.matchThreshold})`);
      evidence.push('Facial biometric features strongly indicate matching identity holder');
    } else if (similarity >= this.config.reviewThreshold) {
      status = 'REVIEW_REQUIRED';
      evidence.push(`Similarity score (${similarity.toFixed(2)}) lies in review band (${this.config.reviewThreshold} - ${this.config.matchThreshold})`);
      evidence.push('Secondary biometric review recommended before final clearance');
    } else {
      status = 'NO_MATCH';
      evidence.push(`Similarity score (${similarity.toFixed(2)}) is below review threshold (${this.config.reviewThreshold})`);
      evidence.push('Facial feature cross-correlation indicates non-matching facial identities');
    }

    return {
      status,
      similarityScore: parseFloat(similarity.toFixed(4)),
      referenceFaceDetected: refDetected,
      probeFaceDetected: probeDetected,
      referenceFaceCount: refCount,
      probeFaceCount: probeCount,
      thresholds: {
        match: this.config.matchThreshold,
        review: this.config.reviewThreshold,
      },
      referenceQuality: refQuality,
      probeQuality: probeQuality,
      evidence,
      executionTimeMs: parseFloat(executionTimeMs.toFixed(2)),
      disclaimer,
    };
  }
}
