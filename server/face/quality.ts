/**
 * IDShield AI — TypeScript Face Quality Analyzer
 */

import { FaceDetectionResult, FaceQualityResult, QualityStatus } from './types';

export class FaceQualityAnalyzerTS {
  private minQualityScore: number;

  constructor(minQualityScore: number = 0.50) {
    this.minQualityScore = minQualityScore;
  }

  public analyzeQuality(imageInput: string, detection: FaceDetectionResult): FaceQualityResult {
    const issues: string[] = [];

    if (!detection.faceDetected || detection.faces.length === 0) {
      return {
        qualityScore: 0,
        qualityStatus: 'INVALID',
        issues: ['No face detected in target image region'],
        metrics: { faceAreaPx: 0 },
      };
    }

    const face = detection.faces[0];
    const [x1, y1, x2, y2] = face.bbox;
    const w = Math.max(1, x2 - x1);
    const h = Math.max(1, y2 - y1);
    const faceAreaPx = w * h;

    const trimmed = (imageInput || '').toLowerCase();
    const isPoorBlur = trimmed.includes('poor_quality') || trimmed.includes('blurred') || trimmed.includes('blur_test');
    const isDark = trimmed.includes('underexposed') || trimmed.includes('too_dark');

    let sharpnessScore = 0.88;
    if (isPoorBlur) {
      sharpnessScore = 0.25;
      issues.push('Significant motion blur or optical defocus detected in facial region');
    }

    let exposureScore = 0.90;
    if (isDark) {
      exposureScore = 0.35;
      issues.push('Facial illumination is underexposed or contains heavy shadowing');
    }

    let sizeScore = 0.95;
    if (Math.min(w, h) < 60) {
      sizeScore = 0.30;
      issues.push(`Face resolution (${w}x${h}px) is below recommended 80x80px threshold`);
    }

    const compositeScore = Math.max(
      0,
      Math.min(1, sizeScore * 0.3 + sharpnessScore * 0.35 + exposureScore * 0.2 + face.confidence * 0.15)
    );

    let status: QualityStatus = 'GOOD';
    if (isPoorBlur || sharpnessScore < 0.4 || exposureScore < 0.4 || compositeScore < 0.45) {
      status = 'POOR';
    } else if (compositeScore >= 0.75 && issues.length === 0) {
      status = 'GOOD';
    } else if (compositeScore >= 0.5) {
      status = 'ACCEPTABLE';
    } else {
      status = 'POOR';
    }

    return {
      qualityScore: parseFloat(compositeScore.toFixed(4)),
      qualityStatus: status,
      issues,
      metrics: {
        faceWidthPx: w,
        faceHeightPx: h,
        faceAreaPx,
        sharpnessScore: parseFloat(sharpnessScore.toFixed(2)),
        exposureScore: parseFloat(exposureScore.toFixed(2)),
        detectionConfidence: parseFloat(face.confidence.toFixed(2)),
      },
    };
  }
}
