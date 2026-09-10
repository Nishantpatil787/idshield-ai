/**
 * IDShield AI — End-to-End Face Verification Engine (TypeScript)
 */

import {
  FaceVerificationPayload,
  FaceVerificationResponse,
} from './types';
import { FaceDetectorTS } from './detection';
import { FaceQualityAnalyzerTS } from './quality';
import { FaceEmbeddingExtractorTS } from './embedding';
import { FaceVerifierTS } from './verifier';
import { FaceConfigOptions, getEffectiveConfig } from './config';

export class FaceVerificationEngineTS {
  private detector: FaceDetectorTS;
  private qualityAnalyzer: FaceQualityAnalyzerTS;
  private embeddingExtractor: FaceEmbeddingExtractorTS;

  constructor(options?: FaceConfigOptions) {
    const cfg = getEffectiveConfig(options);
    this.detector = new FaceDetectorTS(cfg.minDetectionConfidence);
    this.qualityAnalyzer = new FaceQualityAnalyzerTS(cfg.minQualityScore);
    this.embeddingExtractor = new FaceEmbeddingExtractorTS();
  }

  public verifyFaces(payload: FaceVerificationPayload): FaceVerificationResponse {
    const startTime = Date.now();

    const refImage = payload.referenceImage || '';
    const probeImage = payload.probeImage || '';
    const activeOptions: FaceConfigOptions = {
      matchThreshold: payload.configOverride?.matchThreshold,
      reviewThreshold: payload.configOverride?.reviewThreshold,
    };
    const verifier = new FaceVerifierTS(activeOptions);

    // 1. Invalid Input Check
    if (!refImage || !probeImage) {
      const execMs = Date.now() - startTime;
      const evidence: string[] = [];
      if (!refImage && !probeImage) {
        evidence.push('Both referenceImage and probeImage payloads are missing');
      } else if (!refImage) {
        evidence.push('referenceImage payload is missing');
      } else {
        evidence.push('probeImage payload is missing');
      }

      return {
        status: 'INVALID_INPUT',
        similarityScore: 0.0,
        referenceFaceDetected: false,
        probeFaceDetected: false,
        referenceFaceCount: 0,
        probeFaceCount: 0,
        thresholds: {
          match: payload.configOverride?.matchThreshold ?? 0.80,
          review: payload.configOverride?.reviewThreshold ?? 0.65,
        },
        referenceQuality: {
          qualityScore: 0.0,
          qualityStatus: 'INVALID',
          issues: ['Missing image payload'],
          metrics: {},
        },
        probeQuality: {
          qualityScore: 0.0,
          qualityStatus: 'INVALID',
          issues: ['Missing image payload'],
          metrics: {},
        },
        evidence,
        executionTimeMs: execMs,
        disclaimer:
          'Face verification is an AI-assisted similarity assessment and is not a legally conclusive identity determination.',
      };
    }

    // 2. Detection
    const refDetection = this.detector.detectFaces(refImage);
    const probeDetection = this.detector.detectFaces(probeImage);

    // 3. Quality Analysis
    const refQuality = this.qualityAnalyzer.analyzeQuality(refImage, refDetection);
    const probeQuality = this.qualityAnalyzer.analyzeQuality(probeImage, probeDetection);

    // 4. Embedding Extraction
    let refEmbedding: number[] = [];
    if (refDetection.faceDetected && refDetection.faces.length > 0) {
      refEmbedding = this.embeddingExtractor.extractEmbedding(refImage, refDetection.faces[0].bbox);
    }

    let probeEmbedding: number[] = [];
    if (probeDetection.faceDetected && probeDetection.faces.length > 0) {
      probeEmbedding = this.embeddingExtractor.extractEmbedding(probeImage, probeDetection.faces[0].bbox);
    }

    const execMs = Date.now() - startTime;

    // 5. Verifier Decision
    return verifier.verify(
      refDetection,
      probeDetection,
      refQuality,
      probeQuality,
      refEmbedding,
      probeEmbedding,
      execMs
    );
  }
}
