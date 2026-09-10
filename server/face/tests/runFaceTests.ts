/**
 * IDShield AI — Face Verification TypeScript Verification Suite
 */

import assert from 'assert';
import { FaceVerificationEngineTS } from '../inference';
import { BiometricPrivacyGuardTS } from '../privacy';

export function runFaceVerificationTests() {
  console.log('\n======================================================');
  console.log('  IDShield AI — Face Verification Verification Suite');
  console.log('======================================================');

  const engine = new FaceVerificationEngineTS();
  const results: { name: string; passed: boolean }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
      console.log(`  ✓ [PASS] ${name}`);
    } catch (err: any) {
      results.push({ name, passed: false });
      console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
    }
  }

  const dummyValidImg1 = 'data:image/jpeg;base64,person_a_sample_image_1_data_payload_bytes_valid';
  const dummyValidImg2 = 'data:image/jpeg;base64,person_a_sample_image_1_data_payload_bytes_valid';
  const dummyDifferentImg = 'data:image/jpeg;base64,person_b_sample_different_face_payload_bytes';

  // Group 1: Valid Matching Faces
  console.log('\n--- Group 1: Genuine Matching Face Pairs ---');
  test('Matching face pair yields MATCH status', () => {
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: dummyValidImg2 });
    assert.strictEqual(res.status, 'MATCH');
    assert.strictEqual(res.referenceFaceDetected, true);
    assert.strictEqual(res.probeFaceDetected, true);
    assert.strictEqual(res.similarityScore >= 0.80, true);
  });

  test('Evidence list generated with cosine similarity details', () => {
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: dummyValidImg2 });
    assert.strictEqual(Array.isArray(res.evidence), true);
    assert.strictEqual(res.evidence.length >= 3, true);
  });

  // Group 2: Non-Matching Faces
  console.log('\n--- Group 2: Impostor / Non-Matching Face Pairs ---');
  test('Different faces yield NO_MATCH or REVIEW_REQUIRED status', () => {
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: dummyDifferentImg });
    assert.strictEqual(res.status === 'NO_MATCH' || res.status === 'REVIEW_REQUIRED', true);
    assert.strictEqual(res.similarityScore < 0.80, true);
  });

  // Group 3: Missing Faces
  console.log('\n--- Group 3: Missing Face Handling ---');
  test('Missing face in reference image yields NOT_AVAILABLE', () => {
    const noFaceRef = 'data:image/jpeg;base64,no_face_blank_document_background';
    const res = engine.verifyFaces({ referenceImage: noFaceRef, probeImage: dummyValidImg1 });
    assert.strictEqual(res.status, 'NOT_AVAILABLE');
    assert.strictEqual(res.referenceFaceDetected, false);
  });

  test('Missing face in probe image yields NOT_AVAILABLE', () => {
    const noFaceProbe = 'data:image/jpeg;base64,noface_text_credential';
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: noFaceProbe });
    assert.strictEqual(res.status, 'NOT_AVAILABLE');
    assert.strictEqual(res.probeFaceDetected, false);
  });

  // Group 4: Multiple Faces
  console.log('\n--- Group 4: Multiple Face Ambiguity Handling ---');
  test('Multiple faces in probe yields REVIEW_REQUIRED', () => {
    const multiFaceProbe = 'data:image/jpeg;base64,multi_face_group_photo';
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: multiFaceProbe });
    assert.strictEqual(res.status, 'REVIEW_REQUIRED');
    assert.strictEqual(res.probeFaceCount > 1, true);
  });

  // Group 5: Poor Quality Faces
  console.log('\n--- Group 5: Image Quality Assessment ---');
  test('Poor quality blurred face yields REVIEW_REQUIRED status', () => {
    const poorImg = 'data:image/jpeg;base64,poor_quality_blurred_face_image';
    const res = engine.verifyFaces({ referenceImage: dummyValidImg1, probeImage: poorImg });
    assert.strictEqual(res.status, 'REVIEW_REQUIRED');
    assert.strictEqual(res.probeQuality.qualityStatus === 'POOR' || res.probeQuality.qualityStatus === 'INVALID', true);
  });

  // Group 6: Invalid Input & Corrupted Payload
  console.log('\n--- Group 6: Payload Validation & Error Gracefulness ---');
  test('Empty payload yields INVALID_INPUT', () => {
    const res = engine.verifyFaces({ referenceImage: '', probeImage: dummyValidImg1 });
    assert.strictEqual(res.status, 'INVALID_INPUT');
  });

  // Group 7: Threshold Override
  console.log('\n--- Group 7: Threshold Customization ---');
  test('Custom thresholds override default match/review levels', () => {
    const res = engine.verifyFaces({
      referenceImage: dummyValidImg1,
      probeImage: dummyDifferentImg,
      configOverride: { matchThreshold: 0.95, reviewThreshold: 0.85 },
    });
    assert.strictEqual(res.thresholds.match, 0.95);
    assert.strictEqual(res.thresholds.review, 0.85);
  });

  // Group 8: Biometric Privacy Guard
  console.log('\n--- Group 8: Biometric Privacy Guard ---');
  test('Privacy sanitizer redacts raw images and vectors from logs', () => {
    const sensitive = {
      referenceImage: 'data:image/jpeg;base64,SENSITIVE_FACE_BYTES_123456789',
      similarityScore: 0.89,
    };
    const sanitized = BiometricPrivacyGuardTS.sanitizeForLog(sensitive);
    assert.strictEqual(sanitized.referenceImage.includes('REDACTED'), true);
    assert.strictEqual(sanitized.referenceImage.includes('SENSITIVE_FACE_BYTES'), false);
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n======================================================');
  console.log(`  Face Verification Suite Execution: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

// Auto-run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runFaceVerificationTests();
}
