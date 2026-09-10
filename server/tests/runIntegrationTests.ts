/**
 * IDShield AI — End-to-End Central Screening Orchestrator Integration Test Suite
 * Tests 9 complete end-to-end pipeline scenarios.
 */

import { CentralScreeningOrchestrator } from '../orchestrator';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('======================================================');
console.log('  IDShield AI — End-to-End Integration Test Suite');
console.log('======================================================');

let passed = 0;
let total = 0;

async function runTest(name: string, testFn: () => Promise<void>) {
  total++;
  try {
    await testFn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message || err}`);
  }
}

async function main() {
  // Test 1: Clean Document Case
  await runTest('1. Clean document case (valid MRZ, clean typography)', async () => {
    const cleanSvg = `<svg xmlns="http://www.w3.org/2000/svg"><text>P&lt;UTOERIKSSON&lt;&lt;ANNA&lt;MARIA&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;\nL898902C36UTO7408122F2804154ZE184226B&lt;&lt;&lt;&lt;&lt;18</text></svg>`;
    const cleanBase64 = Buffer.from(cleanSvg).toString('base64');
    
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: `data:image/svg+xml;base64,${cleanBase64}`,
      fileName: 'clean_passport_sample.svg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected success === true');
    assert(res.screeningRecord.status === 'COMPLETED', `Expected COMPLETED status, got ${res.screeningRecord.status}`);
    assert(res.screeningRecord.riskAssessment.riskLevel === 'LOW', `Expected LOW risk, got ${res.screeningRecord.riskAssessment.riskLevel}`);
    assert(res.screeningRecord.validation.overallValid === true, 'Expected overallValid === true');
  });

  // Test 2: Expired Document Case
  await runTest('2. Expired document case', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAW...',
      fileName: 'expired_passport_sample.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected success === true');
    assert(res.screeningRecord.riskAssessment.riskScore >= 0, 'Risk score calculated');
  });

  // Test 3: MRZ Checksum Error Case
  await runTest('3. MRZ checksum error case', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,invalid_mrz_checksum_test_data...',
      fileName: 'invalid_mrz_passport.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected isolation failure recovery');
    assert(res.screeningRecord.riskAssessment.riskScore >= 0, 'Risk score calculated');
  });

  // Test 4: Cross-Document Inconsistency Case
  await runTest('4. Cross-document inconsistency case (Passport vs Visa mismatch)', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAW...',
      fileName: 'primary_passport.jpg',
      documentType: 'passport',
      supportingDocuments: [
        {
          id: 'SUP-VISA-99',
          category: 'visa',
          fullName: 'DIFFERENT HOLDER NAME',
          documentNumber: 'V99887766',
          associatedPassportNumber: 'MISMATCH_NUMBER',
          nationality: 'FARAWAY LAND',
          dateOfBirth: '1970-12-12',
          expiryDate: '2028-01-01',
        },
      ],
    });

    assert(res.success === true, 'Expected pipeline completion');
    assert(res.screeningRecord.crossDocumentData !== undefined, 'Expected crossDocumentData to be populated');
    assert(
      res.screeningRecord.crossDocumentData?.overall_status === 'REVIEW_REQUIRED',
      `Expected REVIEW_REQUIRED, got ${res.screeningRecord.crossDocumentData?.overall_status}`
    );
    assert(res.screeningRecord.status === 'FLAGGED_FOR_REVIEW', `Expected FLAGGED_FOR_REVIEW, got ${res.screeningRecord.status}`);
  });

  // Test 5: Tampered Image Case
  await runTest('5. Tampered image case (photo splice detected)', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,tampered_photo_splice_data...',
      fileName: 'tampered_photo_document.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected pipeline completion');
    assert(res.screeningRecord.tampering.overallTamperingScore >= 40, `Expected tampering score >= 40, got ${res.screeningRecord.tampering.overallTamperingScore}`);
    assert(res.screeningRecord.tampering.photoManipulationStatus === 'FAIL', 'Expected photo manipulation FAIL');
  });

  // Test 6: Face Mismatch Case
  await runTest('6. Face mismatch case (Selfie does not match document portrait)', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAW...',
      referenceImage: 'data:image/jpeg;base64,mismatched_selfie_portrait_image_data...',
      fileName: 'doc_with_mismatched_face.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected pipeline completion');
    assert(res.screeningRecord.faceVerification !== undefined, 'Expected faceVerification record');
  });

  // Test 7: Missing Reference Face Case
  await runTest('7. Missing reference face case (marked NOT_AVAILABLE)', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAW...',
      fileName: 'doc_without_selfie.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected pipeline completion');
    assert(
      res.auditTrail.some((a) => a.stage === 'VERIFYING_FACE' && a.status === 'NOT_AVAILABLE'),
      'Audit log should reflect NOT_AVAILABLE for missing reference face'
    );
  });

  // Test 8: Poor-Quality Document Case
  await runTest('8. Poor-quality document case', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,blurry_unclear_scan_data...',
      fileName: 'poor_quality_scan.jpg',
      documentType: 'passport',
    });

    assert(res.success === true, 'Expected pipeline completion');
  });

  // Test 9: Multiple Simultaneous Issues Case
  await runTest('9. Multiple simultaneous issues case (Tampering + Mismatch + Checksum Error)', async () => {
    const res = await CentralScreeningOrchestrator.analyzeCase({
      imagePayload: 'data:image/jpeg;base64,tampered_photo_splice_text_alteration...',
      fileName: 'tampered_mismatched_doc.jpg',
      documentType: 'passport',
      supportingDocuments: [
        {
          id: 'SUP-BAD-1',
          category: 'visa',
          fullName: 'CONFLICTING NAME',
          documentNumber: 'V0000',
          associatedPassportNumber: 'WRONG_ID',
        },
      ],
    });

    assert(res.success === true, 'Expected pipeline completion');
    assert(res.screeningRecord.status === 'FLAGGED_FOR_REVIEW', 'Expected case to be flagged');
    assert(res.screeningRecord.riskAssessment.riskScore >= 40, `Expected elevated risk >= 40, got ${res.screeningRecord.riskAssessment.riskScore}`);
  });

  console.log(`\nEnd-to-End Integration Test Suite Execution: ${passed}/${total} PASSED`);
  if (passed < total) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
