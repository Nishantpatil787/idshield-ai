/**
 * IDShield AI — Face Verification Module TypeScript Interfaces
 */

export type FaceVerificationStatus = 
  | 'MATCH' 
  | 'REVIEW_REQUIRED' 
  | 'NO_MATCH' 
  | 'NOT_AVAILABLE' 
  | 'INVALID_INPUT';

export type QualityStatus = 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'INVALID';

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
}

export interface FaceDetectionResult {
  faceDetected: boolean;
  faceCount: number;
  faces: Array<{
    bbox: [number, number, number, number];
    confidence: number;
  }>;
  imageDimensions: {
    width: number;
    height: number;
  };
}

export interface FaceQualityResult {
  qualityScore: number; // 0.0 - 1.0
  qualityStatus: QualityStatus;
  issues: string[];
  metrics: {
    faceWidthPx?: number;
    faceHeightPx?: number;
    faceAreaPx?: number;
    sharpnessScore?: number;
    exposureScore?: number;
    detectionConfidence?: number;
  };
}

export interface FaceVerificationThresholds {
  matchThreshold: number;
  reviewThreshold: number;
  minDetectionConfidence?: number;
  minQualityScore?: number;
}

export interface FaceVerificationResponse {
  status: FaceVerificationStatus;
  similarityScore: number; // 0.0 - 1.0
  referenceFaceDetected: boolean;
  probeFaceDetected: boolean;
  referenceFaceCount: number;
  probeFaceCount: number;
  thresholds: {
    match: number;
    review: number;
  };
  referenceQuality: FaceQualityResult;
  probeQuality: FaceQualityResult;
  evidence: string[];
  executionTimeMs: number;
  disclaimer: string;
}

export interface FaceVerificationPayload {
  referenceImage: string;
  probeImage: string;
  configOverride?: Partial<FaceVerificationThresholds>;
}
