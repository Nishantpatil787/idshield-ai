import { generateScreeningPdf } from '../reportGenerator';
import { ScreeningRecord } from '../../../src/types';

const MOCK_SCREENING_RECORD: ScreeningRecord = {
  screeningId: 'SCR-TEST-998811',
  timestamp: new Date().toISOString(),
  operatorId: 'OFFICER-TEST-01',
  stationId: 'KIOSK-NORTH-GATE',
  status: 'COMPLETED',
  isDemoData: true,
  document: {
    id: 'DOC-9988',
    category: 'passport',
    categoryLabel: 'PASSPORT',
    documentNumber: 'P9876543',
    fullName: 'ALEXANDER SMITH',
    nationality: 'GBR',
    countryCode: 'GBR',
    dateOfBirth: '1988-06-15',
    expiryDate: '2030-12-31',
    issueDate: '2020-01-10',
    gender: 'M',
    mrzCode: 'P<GBRSMITH<<ALEXANDER<<<<<<<<<<<<<<<<<<<<<<<\nP9876543<8GBR8806154M3012314<<<<<<<<<<<<<<<08',
    rawUploadedFileName: 'test_passport.png',
    uploadedAt: new Date().toISOString(),
  },
  extractedFields: [
    { fieldName: 'fullName', extractedValue: 'ALEXANDER SMITH', confidence: 0.99, validationStatus: 'PASS' },
    { fieldName: 'documentNumber', extractedValue: 'P9876543', confidence: 0.99, validationStatus: 'PASS' },
  ],
  validation: {
    overallValid: true,
    score: 98,
    requiredFieldsStatus: 'PASS',
    formatValidationStatus: 'PASS',
    mrzValidationStatus: 'PASS',
    crossFieldConsistencyStatus: 'PASS',
    items: [],
  },
  tampering: {
    overallTamperingScore: 12,
    photoManipulationStatus: 'PASS',
    textManipulationStatus: 'PASS',
    metadataAnomalyStatus: 'PASS',
    items: [],
  },
  faceVerification: {
    faceDetectedInDocument: true,
    faceDetectedInReference: true,
    similarityScore: 92,
    matchStatus: 'MATCHED',
    livenessConfidence: 96,
    notes: 'Biometric face 128D embedding match confirmed.',
  },
  riskAssessment: {
    riskScore: 15,
    riskLevel: 'LOW',
    primaryRiskSummary: 'No significant anomalies were detected by configured screening checks.',
    explainableFactors: [],
    recommendedAction: 'CLEAR',
  },
};

async function runReportTests() {
  console.log('======================================================');
  console.log('  IDShield AI — Structured PDF Report Generator Test Suite');
  console.log('======================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, title: string) {
    if (condition) {
      console.log(`  ✓ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] ${title}`);
      failed++;
    }
  }

  // Group 1: Basic PDF Generation
  console.log('--- Group 1: PDF Document Generation ---');
  try {
    const pdfBuffer = await generateScreeningPdf(MOCK_SCREENING_RECORD);
    assert(Buffer.isBuffer(pdfBuffer), 'PDF generator returns a Buffer object');
    assert(pdfBuffer.length > 5000, `PDF buffer length is substantial (${pdfBuffer.length} bytes)`);
    assert(pdfBuffer.toString('utf-8', 0, 8).startsWith('%PDF-1.'), 'PDF buffer starts with standard %PDF header');
  } catch (err: any) {
    assert(false, `PDF generation failed with exception: ${err.message}`);
  }

  // Group 2: Single-Document Handling
  console.log('\n--- Group 2: Single-Document Case (Cross-Doc NOT_APPLICABLE) ---');
  try {
    const singleDocRecord = { ...MOCK_SCREENING_RECORD, crossDocumentData: undefined };
    const pdfBuffer = await generateScreeningPdf(singleDocRecord);
    assert(pdfBuffer.length > 0, 'Single-document case generates PDF without error');
  } catch (err: any) {
    assert(false, `Single-document case failed: ${err.message}`);
  }

  // Group 3: Skipped / Unavailable Face Verification
  console.log('\n--- Group 3: Skipped / Unavailable Face Verification ---');
  try {
    const skippedFaceRecord: ScreeningRecord = {
      ...MOCK_SCREENING_RECORD,
      faceVerification: {
        faceDetectedInDocument: true,
        faceDetectedInReference: false,
        similarityScore: 0,
        matchStatus: 'NOT_APPLICABLE',
        notes: 'Face verification marked unavailable.',
      },
    };
    const pdfBuffer = await generateScreeningPdf(skippedFaceRecord);
    assert(pdfBuffer.length > 0, 'Skipped face verification generates PDF successfully');
  } catch (err: any) {
    assert(false, `Skipped face verification case failed: ${err.message}`);
  }

  // Group 4: High Risk & Multiple Findings Case
  console.log('\n--- Group 4: High-Risk Case with Findings ---');
  try {
    const highRiskRecord: ScreeningRecord = {
      ...MOCK_SCREENING_RECORD,
      riskAssessment: {
        riskScore: 88,
        riskLevel: 'HIGH',
        primaryRiskSummary: 'Multiple high-risk signals detected including tampering and face mismatch.',
        recommendedAction: 'PHYSICAL_INSPECTION',
        explainableFactors: [
          {
            id: 'RF-1',
            factor: 'Biometric Face Match Divergence',
            weight: 'HIGH',
            impactPoints: 45,
            description: 'Facial similarity (32%) is below threshold.',
            mitigationSuggestion: 'Perform physical inspection and interview.',
          },
          {
            id: 'RF-2',
            factor: 'Document Photo Splicing Artifact',
            weight: 'HIGH',
            impactPoints: 40,
            description: 'Edge gradient discontinuities around photo boundary.',
          },
        ],
      },
      tampering: {
        overallTamperingScore: 78,
        photoManipulationStatus: 'FAIL',
        textManipulationStatus: 'PASS',
        metadataAnomalyStatus: 'PASS',
        items: [
          {
            id: 'T-1',
            componentName: 'Photo Splicing Edge',
            type: 'photo_manipulation',
            status: 'FAIL',
            confidenceScore: 85,
            description: 'Suspicious pixel edge gradient around portrait frame.',
          },
        ],
      },
      faceVerification: {
        faceDetectedInDocument: true,
        faceDetectedInReference: true,
        similarityScore: 32,
        matchStatus: 'UNMATCHED',
        notes: 'Low similarity score indicating different identity.',
      },
    };
    const pdfBuffer = await generateScreeningPdf(highRiskRecord);
    assert(pdfBuffer.length > 0, 'High-risk case with tampering & face mismatch generates PDF successfully');
  } catch (err: any) {
    assert(false, `High-risk case failed: ${err.message}`);
  }

  // Group 5: Validation of Invalid Input
  console.log('\n--- Group 5: Invalid Input Validation ---');
  try {
    await generateScreeningPdf(null as any);
    assert(false, 'Should reject null input');
  } catch (err: any) {
    assert(true, 'Null input properly rejected with exception');
  }

  console.log('\n======================================================');
  console.log(`  Report Suite Execution: ${passed}/${passed + failed} PASSED (${failed} failed)`);
  console.log('======================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runReportTests();
