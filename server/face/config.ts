/**
 * IDShield AI — Face Verification Configuration & Thresholds
 */

export const DEFAULT_MATCH_THRESHOLD = parseFloat(process.env.FACE_MATCH_THRESHOLD || '0.80');
export const DEFAULT_REVIEW_THRESHOLD = parseFloat(process.env.FACE_REVIEW_THRESHOLD || '0.65');
export const DEFAULT_MIN_DETECTION_CONFIDENCE = parseFloat(process.env.FACE_MIN_DETECTION_CONFIDENCE || '0.60');
export const DEFAULT_MIN_QUALITY_SCORE = parseFloat(process.env.FACE_MIN_QUALITY_SCORE || '0.50');
export const DEFAULT_MAX_ALLOWED_FACES = parseInt(process.env.FACE_MAX_ALLOWED_FACES || '1', 10);

export interface FaceConfigOptions {
  matchThreshold?: number;
  reviewThreshold?: number;
  minDetectionConfidence?: number;
  minQualityScore?: number;
  maxAllowedFaces?: number;
}

export function getEffectiveConfig(options?: FaceConfigOptions) {
  return {
    matchThreshold: options?.matchThreshold ?? DEFAULT_MATCH_THRESHOLD,
    reviewThreshold: options?.reviewThreshold ?? DEFAULT_REVIEW_THRESHOLD,
    minDetectionConfidence: options?.minDetectionConfidence ?? DEFAULT_MIN_DETECTION_CONFIDENCE,
    minQualityScore: options?.minQualityScore ?? DEFAULT_MIN_QUALITY_SCORE,
    maxAllowedFaces: options?.maxAllowedFaces ?? DEFAULT_MAX_ALLOWED_FACES,
  };
}
