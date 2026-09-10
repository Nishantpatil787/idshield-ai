import { ScreeningRecord, DocumentCategory } from '../types';

// Helper to generate clean SVG sample placeholders for documents
function createDocPlaceholderSvg(title: string, code: string, color: string, badgeText: string): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 540 340" width="540" height="340" style="background:#0f172a; border-radius:10px; font-family:system-ui, sans-serif;">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b"/>
        <stop offset="100%" stop-color="#0f172a"/>
      </linearGradient>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(148, 163, 184, 0.08)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="540" height="340" rx="10" fill="url(#bg)" stroke="#334155" stroke-width="2"/>
    <rect width="540" height="340" fill="url(#grid)"/>
    
    <!-- Top Header -->
    <rect x="0" y="0" width="540" height="50" fill="${color}" opacity="0.9"/>
    <text x="24" y="32" fill="#ffffff" font-size="14" font-weight="700" letter-spacing="1.5">${title.toUpperCase()}</text>
    <text x="430" y="32" fill="#cbd5e1" font-size="11" font-family="monospace">${code}</text>

    <!-- Photo container -->
    <rect x="30" y="75" width="110" height="140" rx="6" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>
    <circle cx="85" cy="125" r="28" fill="#475569"/>
    <path d="M 50 195 C 50 165, 120 165, 120 195 Z" fill="#334155"/>
    <text x="85" y="205" fill="#94a3b8" font-size="8" font-weight="600" text-anchor="middle">FACIAL BIOMETRICS</text>

    <!-- Data Fields -->
    <g transform="translate(165, 75)" fill="#e2e8f0" font-size="11">
      <text x="0" y="15" fill="#94a3b8" font-size="9" font-weight="600">DOCUMENT HOLDER</text>
      <text x="0" y="32" font-size="14" font-weight="700">SPECIMEN / JOHN EDWARD</text>
      
      <text x="0" y="60" fill="#94a3b8" font-size="9" font-weight="600">NATIONALITY / CITIZENSHIP</text>
      <text x="0" y="76" font-size="12" font-weight="600">UTOPIA (UTO)</text>

      <text x="180" y="60" fill="#94a3b8" font-size="9" font-weight="600">DATE OF BIRTH</text>
      <text x="180" y="76" font-size="12" font-weight="600" font-family="monospace">14 MAY 1988</text>

      <text x="0" y="105" fill="#94a3b8" font-size="9" font-weight="600">EXPIRATION DATE</text>
      <text x="0" y="121" font-size="12" font-weight="600" font-family="monospace">28 OCT 2029</text>

      <text x="180" y="105" fill="#94a3b8" font-size="9" font-weight="600">ISSUING AUTHORITY</text>
      <text x="180" y="121" font-size="12" font-weight="600">IMMIGRATION BUREAU</text>
    </g>

    <!-- Security Band & MRZ Zone -->
    <rect x="20" y="235" width="500" height="85" rx="6" fill="#020617" stroke="#1e293b" stroke-width="1"/>
    <g transform="translate(35, 260)" font-family="monospace" font-size="11" fill="#64748b" letter-spacing="2">
      <text x="0" y="14">P&lt;UTOEDWARD&lt;&lt;JOHN&lt;SPECIMEN&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="0" y="36">${code}8UTO8805142M2910287&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;04</text>
    </g>

    <!-- Watermark Stamp -->
    <rect x="360" y="80" width="150" height="24" rx="4" fill="#334155" opacity="0.6"/>
    <text x="435" y="96" fill="#cbd5e1" font-size="9" font-weight="700" text-anchor="middle">${badgeText}</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const MOCK_SCREENING_RECORDS: ScreeningRecord[] = [
  {
    screeningId: 'SCR-2026-0091',
    timestamp: '2026-09-09T08:42:15Z',
    operatorId: 'OFFICER-4819',
    stationId: 'TERM-3-SEC-A',
    status: 'COMPLETED',
    isDemoData: true,
    document: {
      id: 'DOC-8819',
      category: 'passport',
      categoryLabel: 'Standard Passport',
      documentNumber: 'PA74910238',
      fullName: 'VOGEL, HELENA CHRISTINE',
      nationality: 'GERMANY',
      countryCode: 'DEU',
      dateOfBirth: '1992-04-18',
      expiryDate: '2031-11-20',
      issueDate: '2021-11-21',
      issuingAuthority: 'STADT FRANKFURT AM MAIN',
      gender: 'F',
      mrzCode: 'P<DEUVOGEL<<HELENA<CHRISTINE<<<<<<<<<<<<<<<<<<\nPA74910238DEU9204184F3111208<<<<<<<<<<<<<<<02',
      rawUploadedFileName: 'passport_scan_vogel_h.png',
      fileSizeBytes: 2411980,
      uploadedAt: '2026-09-09T08:42:00Z',
      imageUrl: createDocPlaceholderSvg('Federal Republic Passport', 'PA74910238', '#1e3a8a', 'DEMO RECORD #1'),
    },
    extractedFields: [
      { fieldName: 'Document Number', extractedValue: 'PA74910238', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Full Name', extractedValue: 'HELENA CHRISTINE VOGEL', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Nationality', extractedValue: 'DEU / GERMANY', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Date of Birth', extractedValue: '1992-04-18', confidence: 0.97, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Expiry Date', extractedValue: '2031-11-20', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Issuing Authority', extractedValue: 'STADT FRANKFURT AM MAIN', confidence: 0.94, validationStatus: 'PASS', mrzMatched: true },
    ],
    validation: {
      overallValid: true,
      score: 96,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'PASS',
      items: [
        { id: 'v-1', title: 'Required Fields Presence', category: 'required_fields', status: 'PASS', detail: 'All 7 mandatory ICAO Doc 9303 visual data elements detected.' },
        { id: 'v-2', title: 'Document Number Format', category: 'format_validation', status: 'PASS', detail: 'Conforms to German standard alphanumeric 9-character schema.' },
        { id: 'v-3', title: 'MRZ Checksum 7-3-1 Formula', category: 'mrz_validation', status: 'PASS', detail: 'All 3 check digits in lines 1 and 2 calculate correctly.' },
        { id: 'v-4', title: 'Visual Zone vs MRZ Consistency', category: 'cross_field_consistency', status: 'PASS', detail: 'Names, DOB, and expiry dates are identical between MRZ and VIZ.' },
      ],
    },
    validationData: {
      timestamp: '2026-03-08T10:14:22Z',
      overall_status: 'VALID',
      passed: 3,
      warnings: 0,
      failed: 0,
      not_checked: 0,
      total_rules: 3,
      summary: 'All 3 validation rules passed without discrepancies. ICAO 9303 check digits, visual-to-MRZ consistency, and chronological date logic are valid.',
      results: [
        {
          rule_id: 'passport_mrz_checksum',
          category: 'checksum',
          status: 'PASS',
          severity: 'INFO',
          message: 'All ICAO 9303 TD3 check digits (document number, DOB, expiration date, composite) match calculated 7-3-1 weights.',
          evidence: {
            format: 'TD3',
            document_number: { valid: true, actual: '8', calculated: '8' },
            date_of_birth: { valid: true, actual: '4', calculated: '4' },
            expiry_date: { valid: true, actual: '8', calculated: '8' },
            composite: { valid: true, actual: '2', calculated: '2' },
          },
        },
        {
          rule_id: 'passport_ocr_mrz_consistency',
          category: 'cross_reference',
          status: 'PASS',
          severity: 'INFO',
          message: 'Visual zone (OCR) and MRZ decoded fields are 100% consistent across document number, holder name, nationality, date of birth, and expiry date.',
          evidence: {
            matches: ['document_number', 'holder_name', 'nationality', 'date_of_birth', 'expiry_date'],
            mismatches: [],
          },
        },
        {
          rule_id: 'passport_cross_field',
          category: 'chronological',
          status: 'PASS',
          severity: 'INFO',
          message: 'Chronological sequence verified: Date of birth (1992-04-18) is prior to document issue/expiry, and document is within valid validity period.',
          evidence: {
            age_years: 34,
            validity_years: 10,
            days_to_expiry: 1898,
          },
        },
      ],
    },
    tampering: {
      overallTamperingScore: 4,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'PASS',
      items: [
        { id: 't-1', componentName: 'Facial Portrait Boundary', type: 'photo_manipulation', status: 'PASS', confidenceScore: 98, description: 'No pixel gradient seam, splicing or clone brush detected.' },
        { id: 't-2', componentName: 'Typography Baseline Alignment', type: 'text_manipulation', status: 'PASS', confidenceScore: 97, description: 'Font kerning, weight, and anti-aliasing match specimen font.' },
        { id: 't-3', componentName: 'File Metadata Exif Header', type: 'metadata_anomaly', status: 'PASS', confidenceScore: 95, description: 'Standard scanner hardware profile with no editing software trace.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 94.2,
      matchStatus: 'MATCHED',
      livenessConfidence: 96.0,
      notes: 'High biometric landmark correlation across jawline, eye spacing, and nose bridge.',
    },
    riskAssessment: {
      riskScore: 8,
      riskLevel: 'LOW',
      primaryRiskSummary: 'Clear screening. Standard passport with intact security features, valid MRZ checksums, and verified biometric consistency.',
      recommendedAction: 'CLEAR',
      explainableFactors: [
        { id: 'rf-1', factor: 'MRZ Checksum Match', weight: 'LOW', impactPoints: 0, description: 'Cryptographic parity check completed with 0 errors.' },
        { id: 'rf-2', factor: 'Document Validity Horizon', weight: 'LOW', impactPoints: 0, description: 'Document expires in 2031 (well above the 6-month threshold).' },
      ],
    },
  },
  {
    screeningId: 'SCR-2026-0092',
    timestamp: '2026-09-09T08:58:30Z',
    operatorId: 'OFFICER-4819',
    stationId: 'TERM-3-SEC-A',
    status: 'FLAGGED_FOR_REVIEW',
    isDemoData: true,
    document: {
      id: 'DOC-8820',
      category: 'visa',
      categoryLabel: 'Electronic Travel Visa (e-Visa)',
      documentNumber: 'VS9901428',
      fullName: 'AL-MANSOOR, TARIQ FAROUQ',
      nationality: 'UNITED ARAB EMIRATES',
      countryCode: 'ARE',
      dateOfBirth: '1985-09-12',
      expiryDate: '2026-09-15',
      issueDate: '2026-03-15',
      issuingAuthority: 'CONSULAR AFFAIRS DEPT',
      gender: 'M',
      rawUploadedFileName: 'evisa_authorization_tampered.pdf',
      fileSizeBytes: 1840120,
      uploadedAt: '2026-09-09T08:58:00Z',
      imageUrl: createDocPlaceholderSvg('Travel Authorization Visa', 'VS9901428', '#b45309', 'DEMO RECORD #2'),
    },
    extractedFields: [
      { fieldName: 'Visa Number', extractedValue: 'VS9901428', confidence: 0.92, validationStatus: 'PASS', mrzMatched: false },
      { fieldName: 'Applicant Name', extractedValue: 'TARIQ FAROUQ AL-MANSOOR', confidence: 0.89, validationStatus: 'PASS', mrzMatched: false },
      { fieldName: 'Date of Birth', extractedValue: '1985-09-12', confidence: 0.94, validationStatus: 'PASS', mrzMatched: false },
      { fieldName: 'Expiration Date', extractedValue: '2026-09-15', confidence: 0.62, validationStatus: 'WARNING', mrzMatched: false },
      { fieldName: 'Entry Type', extractedValue: 'MULTIPLE (MODIFIED)', confidence: 0.71, validationStatus: 'FAIL', mrzMatched: false },
    ],
    validation: {
      overallValid: false,
      score: 58,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'WARNING',
      mrzValidationStatus: 'INCONCLUSIVE',
      crossFieldConsistencyStatus: 'FAIL',
      items: [
        { id: 'v-1', title: 'Expiry Horizon Check', category: 'format_validation', status: 'WARNING', detail: 'Visa expires in under 7 days (2026-09-15).' },
        { id: 'v-2', title: 'Entry Classification Code', category: 'cross_field_consistency', status: 'FAIL', detail: 'Text displays MULTIPLE entry but barcode payload encodes SINGLE entry.' },
        { id: 'v-3', title: 'Digital Stamp Verification', category: 'required_fields', status: 'PASS', detail: 'Consular seal structure detected.' },
      ],
    },
    tampering: {
      overallTamperingScore: 68,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'FAIL',
      metadataAnomalyStatus: 'WARNING',
      items: [
        { id: 't-1', componentName: 'Entry Allowance Field ("MULTIPLE")', type: 'text_manipulation', status: 'FAIL', confidenceScore: 88, description: 'Font weight divergence and differing compression block grid detected in entry allowance text.' },
        { id: 't-2', componentName: 'PDF Producer Header', type: 'metadata_anomaly', status: 'WARNING', confidenceScore: 74, description: 'Document was re-saved in an open-source vector editing tool 2 hours before submission.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 87.5,
      matchStatus: 'MATCHED',
      livenessConfidence: 91.0,
      notes: 'Biometric face match is adequate, but document text layer shows indicators of alteration.',
    },
    riskAssessment: {
      riskScore: 68,
      riskLevel: 'MEDIUM',
      primaryRiskSummary: 'Potential text alteration in visa entry permissions. Barcode payload mismatches printed visual zone.',
      recommendedAction: 'SECONDARY_INTERVIEW',
      explainableFactors: [
        { id: 'rf-1', factor: 'Barcode vs Visual Field Discrepancy', weight: 'HIGH', impactPoints: 40, description: 'Barcode specifies SINGLE entry; visual field was altered to MULTIPLE.', mitigationSuggestion: 'Perform consular electronic lookup via reference terminal.' },
        { id: 'rf-2', factor: 'Imminent Expiry Date', weight: 'MEDIUM', impactPoints: 20, description: 'Validity expires within 6 days of arrival date.' },
        { id: 'rf-3', factor: 'Software Editing Trace in Metadata', weight: 'LOW', impactPoints: 8, description: 'PDF contains recent modifications by non-official editor tool.' },
      ],
    },
  },
  {
    screeningId: 'SCR-2026-0093',
    timestamp: '2026-09-09T09:05:10Z',
    operatorId: 'OFFICER-7204',
    stationId: 'TERM-1-NORTH',
    status: 'REJECTED',
    isDemoData: true,
    document: {
      id: 'DOC-8821',
      category: 'national_id',
      categoryLabel: 'National Identity Card',
      documentNumber: 'ID-9941-8820X',
      fullName: 'DUVAL, MARCEL LAURENT',
      nationality: 'FRANCE',
      countryCode: 'FRA',
      dateOfBirth: '1979-12-03',
      expiryDate: '2028-05-30',
      issueDate: '2018-05-31',
      issuingAuthority: 'PREFECTURE DE POLICE PARIS',
      gender: 'M',
      mrzCode: 'IDFRADUVAL<<<<<<<<<<<<<<<<<<<994188\n7912038M2805307FRA<<<<<<<<<<<8',
      rawUploadedFileName: 'national_id_fra_forged_photo.jpg',
      fileSizeBytes: 3120990,
      uploadedAt: '2026-09-09T09:04:45Z',
      imageUrl: createDocPlaceholderSvg('National Identity Card', 'ID-9941-8820X', '#991b1b', 'DEMO RECORD #3 (HIGH RISK)'),
    },
    extractedFields: [
      { fieldName: 'ID Card Number', extractedValue: 'ID-9941-8820X', confidence: 0.88, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Full Name', extractedValue: 'MARCEL LAURENT DUVAL', confidence: 0.84, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Date of Birth', extractedValue: '1979-12-03', confidence: 0.91, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Nationality', extractedValue: 'FRANCE (FRA)', confidence: 0.96, validationStatus: 'PASS', mrzMatched: true },
    ],
    validation: {
      overallValid: false,
      score: 32,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'FAIL',
      items: [
        { id: 'v-1', title: 'Ghost Image vs Primary Photo Match', category: 'cross_field_consistency', status: 'FAIL', detail: 'Secondary holographic ghost image depicts a completely different facial subject.' },
        { id: 'v-2', title: 'Guilloche Security Background', category: 'cross_field_consistency', status: 'FAIL', detail: 'Background guilloche security mesh is severed and blurred around portrait frame.' },
      ],
    },
    tampering: {
      overallTamperingScore: 89,
      photoManipulationStatus: 'FAIL',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'WARNING',
      items: [
        { id: 't-1', componentName: 'Primary ID Portrait Box', type: 'photo_manipulation', status: 'FAIL', confidenceScore: 96, description: 'Error Level Analysis (ELA) identifies distinct JPEG compression matrix from host document card. Direct photo splicing confirmed.' },
        { id: 't-2', componentName: 'UV Ghost Silhouette Overlay', type: 'substrate_irregularity', status: 'FAIL', confidenceScore: 92, description: 'Ghost image features do not align with overlaid photo.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 24.0,
      matchStatus: 'UNMATCHED',
      livenessConfidence: 94.0,
      notes: 'Severe biometric mismatch between live traveler and original card records. Spliced photo detected on document.',
    },
    riskAssessment: {
      riskScore: 92,
      riskLevel: 'HIGH',
      primaryRiskSummary: 'Severe fraudulent tampering detected. High-confidence photo substitution and ghost image discrepancy.',
      recommendedAction: 'DENY_ENTRY',
      explainableFactors: [
        { id: 'rf-1', factor: 'Synthetic / Spliced Photo Substitution', weight: 'CRITICAL', impactPoints: 60, description: 'Photo frame has severed background security lines and discordant compression.' },
        { id: 'rf-2', factor: 'Ghost Image Subject Conflict', weight: 'HIGH', impactPoints: 25, description: 'Ghost hologram depicts a different individual.' },
        { id: 'rf-3', factor: 'Biometric Face Verification Failure', weight: 'HIGH', impactPoints: 15, description: 'Cosine similarity score of 0.24 is far below the threshold (0.75).' },
      ],
    },
  },
  {
    screeningId: 'SCR-2026-0094',
    timestamp: '2026-09-09T09:18:22Z',
    operatorId: 'OFFICER-4819',
    stationId: 'TERM-3-SEC-A',
    status: 'COMPLETED',
    isDemoData: true,
    document: {
      id: 'DOC-8822',
      category: 'national_id',
      categoryLabel: 'National Identity Smart Card',
      documentNumber: 'ID-55209-CAL',
      fullName: 'HENDERSON, ROBERT BRUCE',
      nationality: 'UNITED STATES',
      countryCode: 'USA',
      dateOfBirth: '1974-06-25',
      expiryDate: '2029-06-25',
      issueDate: '2024-06-26',
      issuingAuthority: 'CIVIL IDENTIFICATION REGISTRY',
      gender: 'M',
      rawUploadedFileName: 'national_id_henderson.png',
      fileSizeBytes: 1540100,
      uploadedAt: '2026-09-09T09:18:00Z',
      imageUrl: createDocPlaceholderSvg('National Identity Card', 'ID-55209-CAL', '#047857', 'DEMO RECORD #4'),
    },
    extractedFields: [
      { fieldName: 'National ID Number', extractedValue: 'ID-55209-CAL', confidence: 0.98, validationStatus: 'PASS' },
      { fieldName: 'Full Name', extractedValue: 'ROBERT BRUCE HENDERSON', confidence: 0.97, validationStatus: 'PASS' },
      { fieldName: 'Date of Birth', extractedValue: '1974-06-25', confidence: 0.96, validationStatus: 'PASS' },
      { fieldName: 'Expiration Date', extractedValue: '2029-06-25', confidence: 0.99, validationStatus: 'PASS' },
      { fieldName: 'Issuing State', extractedValue: 'CALIFORNIA / CIVIL REGISTRY', confidence: 0.95, validationStatus: 'PASS' },
    ],
    validation: {
      overallValid: true,
      score: 94,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'PASS',
      items: [
        { id: 'v-1', title: 'National Smart ID Barcode Match', category: 'mrz_validation', status: 'PASS', detail: '2D barcode payload matches printed card typography fields.' },
        { id: 'v-2', title: 'State Security Pattern', category: 'format_validation', status: 'PASS', detail: 'State seal microprint and outline geometry verified.' },
      ],
    },
    tampering: {
      overallTamperingScore: 6,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'PASS',
      items: [
        { id: 't-1', componentName: 'Optical Variable Ink', type: 'substrate_irregularity', status: 'PASS', confidenceScore: 94, description: 'Micro-lettering and ink reflection verified.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 92.0,
      matchStatus: 'MATCHED',
      livenessConfidence: 95.0,
      notes: 'Facial landmarks match traveler profile.',
    },
    riskAssessment: {
      riskScore: 12,
      riskLevel: 'LOW',
      primaryRiskSummary: 'Authentic national identity credential with validated 2D barcode and intact holographic elements.',
      recommendedAction: 'CLEAR',
      explainableFactors: [
        { id: 'rf-1', factor: 'National Standard Barcode Verified', weight: 'LOW', impactPoints: 0, description: 'Payload signatures align.' },
      ],
    },
  },
  {
    screeningId: 'SCR-2026-0095',
    timestamp: '2026-09-09T09:25:05Z',
    operatorId: 'OFFICER-3108',
    stationId: 'TERM-2-WEST',
    status: 'COMPLETED',
    isDemoData: true,
    document: {
      id: 'DOC-8823',
      category: 'visa',
      categoryLabel: 'Consular Electronic Travel Visa',
      documentNumber: 'V-2026-88192',
      fullName: 'SINGH, HARPREET KAUR',
      nationality: 'INDIA',
      countryCode: 'IND',
      dateOfBirth: '1990-11-08',
      expiryDate: '2027-04-30',
      issueDate: '2025-05-01',
      issuingAuthority: 'CONSULAR IMMIGRATION SERVICE',
      gender: 'F',
      rawUploadedFileName: 'consular_visa_scan.pdf',
      fileSizeBytes: 2100400,
      uploadedAt: '2026-09-09T09:24:40Z',
      imageUrl: createDocPlaceholderSvg('Consular Travel Visa', 'V-2026-88192', '#0284c7', 'DEMO RECORD #5'),
    },
    extractedFields: [
      { fieldName: 'Visa Number', extractedValue: 'V-2026-88192', confidence: 0.98, validationStatus: 'PASS' },
      { fieldName: 'Holder Name', extractedValue: 'HARPREET KAUR SINGH', confidence: 0.96, validationStatus: 'PASS' },
      { fieldName: 'Visa Type', extractedValue: 'CONSULAR ENTRY MRV-B', confidence: 0.95, validationStatus: 'PASS' },
      { fieldName: 'Expiry Date', extractedValue: '2027-04-30', confidence: 0.97, validationStatus: 'PASS' },
    ],
    validation: {
      overallValid: true,
      score: 91,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'PASS',
      items: [
        { id: 'v-1', title: 'Cryptographic QR Signature', category: 'mrz_validation', status: 'PASS', detail: 'Signed public key matches issuing authority registry.' },
      ],
    },
    tampering: {
      overallTamperingScore: 8,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'PASS',
      items: [
        { id: 't-1', componentName: 'Digital Watermark', type: 'substrate_irregularity', status: 'PASS', confidenceScore: 92, description: 'Clean digital watermark envelope.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 93.4,
      matchStatus: 'MATCHED',
      livenessConfidence: 97.0,
      notes: 'Facial landmarks match traveler profile.',
    },
    riskAssessment: {
      riskScore: 10,
      riskLevel: 'LOW',
      primaryRiskSummary: 'Valid consular travel visa with verified digital signatures.',
      recommendedAction: 'CLEAR',
      explainableFactors: [
        { id: 'rf-1', factor: 'Signed Digital Payload', weight: 'LOW', impactPoints: 0, description: 'Electronic signature authenticated.' },
      ],
    },
  },
  {
    screeningId: 'SCR-2026-0096',
    timestamp: '2026-09-09T09:32:00Z',
    operatorId: 'OFFICER-4819',
    stationId: 'TERM-3-SEC-A',
    status: 'COMPLETED',
    isDemoData: true,
    document: {
      id: 'DOC-8824',
      category: 'passport',
      categoryLabel: 'Standard Biometric Passport',
      documentNumber: 'K4891024',
      fullName: 'NAKAMURA, KENJI',
      nationality: 'JAPAN',
      countryCode: 'JPN',
      dateOfBirth: '1988-06-15',
      expiryDate: '2032-06-14',
      issueDate: '2022-06-15',
      issuingAuthority: 'MINISTRY OF FOREIGN AFFAIRS',
      gender: 'M',
      mrzCode: 'P<JPNNAKAMURA<<KENJI<<<<<<<<<<<<<<<<<<<<<<<<<\nK4891024<5JPN8806152M3206148<<<<<<<<<<<<<<<08',
      rawUploadedFileName: 'passport_nakamura_k.png',
      fileSizeBytes: 2201940,
      uploadedAt: '2026-09-09T09:31:20Z',
      imageUrl: createDocPlaceholderSvg('Biometric Passport', 'K4891024', '#1e3a8a', 'PRIMARY PASSPORT'),
    },
    supportingDocuments: [
      {
        id: 'DOC-SUP-8824-1',
        category: 'visa',
        categoryLabel: 'Electronic Entry Clearance Visa',
        documentNumber: 'VS-JPN-2026-991',
        associatedPassportNumber: 'K4891024',
        fullName: 'KENJI NAKAMURA',
        nationality: 'JAPAN',
        countryCode: 'JPN',
        dateOfBirth: '1988-06-15',
        expiryDate: '2027-01-10',
        issueDate: '2025-01-10',
        issuingAuthority: 'IMMIGRATION SERVICES AGENCY',
        gender: 'M',
        visaType: 'Business / Long-Stay',
        rawUploadedFileName: 'visa_nakamura_k.png',
        fileSizeBytes: 1420500,
        imageUrl: createDocPlaceholderSvg('Consular Entry Visa', 'VS-JPN-2026-991', '#065f46', 'SUPPORTING VISA'),
      },
    ],
    extractedFields: [
      { fieldName: 'Passport Number', extractedValue: 'K4891024', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Full Name', extractedValue: 'KENJI NAKAMURA', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Nationality', extractedValue: 'JAPAN (JPN)', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Date of Birth', extractedValue: '1988-06-15', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Expiry Date', extractedValue: '2032-06-14', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Gender', extractedValue: 'MALE (M)', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
    ],
    validation: {
      overallValid: true,
      score: 98,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'PASS',
      items: [
        { id: 'v-1', title: 'Passport MRZ Checksum Parity', category: 'mrz_validation', status: 'PASS', detail: 'All ICAO 9303 check digits verified.' },
        { id: 'v-2', title: 'Cross-Document Linkage', category: 'cross_field_consistency', status: 'PASS', detail: 'Associated passport number matches primary passport.' },
      ],
    },
    tampering: {
      overallTamperingScore: 4,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'PASS',
      items: [
        { id: 't-1', componentName: 'Holographic Overlay', type: 'substrate_irregularity', status: 'PASS', confidenceScore: 98, description: 'Genuine optical wave patterns.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 96.8,
      matchStatus: 'MATCHED',
      livenessConfidence: 95.0,
      notes: 'Facial biometrics match across primary passport and supporting visa photos.',
    },
    riskAssessment: {
      riskScore: 8,
      riskLevel: 'LOW',
      primaryRiskSummary: 'Multi-document case verified: Full biographical and identifier parity confirmed between Passport and Visa.',
      recommendedAction: 'CLEAR',
      explainableFactors: [
        { id: 'rf-1', factor: 'Multi-Document Identity Parity', weight: 'LOW', impactPoints: 0, description: 'Full consistency across 2 submitted documents.' },
      ],
    },
    crossDocumentData: {
      case_id: 'SCR-2026-0096',
      documents_compared: 2,
      document_pairs: [
        { doc_a: 'DOC-8824', doc_b: 'DOC-SUP-8824-1', relation: 'PASSPORT (K4891024) ↔ VISA (VS-JPN-2026-991)' },
      ],
      comparisons: [
        {
          id: 'cd-1',
          field: 'full_name',
          field_label: 'Bearer Full Name',
          document_a: { id: 'DOC-8824', type: 'passport', label: 'PASSPORT (K4891024)', value: 'NAKAMURA, KENJI' },
          document_b: { id: 'DOC-SUP-8824-1', type: 'visa', label: 'VISA (VS-JPN-2026-991)', value: 'KENJI NAKAMURA' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Exact token match after standardizing ordering (SURNAME, Given vs Given SURNAME).',
        },
        {
          id: 'cd-2',
          field: 'passport_number_linkage',
          field_label: 'Passport Linkage Number',
          document_a: { id: 'DOC-8824', type: 'passport', label: 'PASSPORT (K4891024)', value: 'K4891024' },
          document_b: { id: 'DOC-SUP-8824-1', type: 'visa', label: 'VISA (VS-JPN-2026-991)', value: 'K4891024' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Visa references passport number "K4891024", matching primary passport exactly.',
        },
        {
          id: 'cd-3',
          field: 'date_of_birth',
          field_label: 'Date of Birth',
          document_a: { id: 'DOC-8824', type: 'passport', label: 'PASSPORT (K4891024)', value: '1988-06-15' },
          document_b: { id: 'DOC-SUP-8824-1', type: 'visa', label: 'VISA (VS-JPN-2026-991)', value: '1988-06-15' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Dates of birth match exactly (1988-06-15).',
        },
        {
          id: 'cd-4',
          field: 'nationality',
          field_label: 'Nationality / Citizenship',
          document_a: { id: 'DOC-8824', type: 'passport', label: 'PASSPORT (K4891024)', value: 'JPN' },
          document_b: { id: 'DOC-SUP-8824-1', type: 'visa', label: 'VISA (VS-JPN-2026-991)', value: 'JPN' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Nationalities match (JPN).',
        },
        {
          id: 'cd-5',
          field: 'gender',
          field_label: 'Gender / Sex',
          document_a: { id: 'DOC-8824', type: 'passport', label: 'PASSPORT (K4891024)', value: 'M' },
          document_b: { id: 'DOC-SUP-8824-1', type: 'visa', label: 'VISA (VS-JPN-2026-991)', value: 'M' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Gender markers match (M).',
        },
      ],
      summary: {
        matches: 5,
        mismatches: 0,
        review_required: 0,
        not_available: 0,
        total_comparisons: 5,
      },
      overall_status: 'CONSISTENT',
      explanations: [
        'All 5 compared biographical and linkage fields match consistently across 2 documents.',
      ],
      timestamp: '2026-09-09T09:32:00Z',
    },
  },
  {
    screeningId: 'SCR-2026-0097',
    timestamp: '2026-09-09T09:40:15Z',
    operatorId: 'OFFICER-4819',
    stationId: 'TERM-3-SEC-A',
    status: 'FLAGGED_FOR_REVIEW',
    isDemoData: true,
    document: {
      id: 'DOC-8825',
      category: 'passport',
      categoryLabel: 'Standard Biometric Passport',
      documentNumber: 'A9182304',
      fullName: 'GARCIA, ALEJANDRO TOMAS',
      nationality: 'SPAIN',
      countryCode: 'ESP',
      dateOfBirth: '1984-11-25',
      expiryDate: '2030-05-18',
      issueDate: '2020-05-19',
      issuingAuthority: 'DIRECCION GENERAL DE LA POLICIA',
      gender: 'M',
      mrzCode: 'P<ESPGARCIA<<ALEJANDRO<TOMAS<<<<<<<<<<<<<<<<\nA9182304<2ESP8411254M3005188<<<<<<<<<<<<<<<06',
      rawUploadedFileName: 'passport_garcia_a.png',
      fileSizeBytes: 2450000,
      uploadedAt: '2026-09-09T09:39:40Z',
      imageUrl: createDocPlaceholderSvg('Kingdom of Spain Passport', 'A9182304', '#7c2d12', 'PRIMARY PASSPORT'),
    },
    supportingDocuments: [
      {
        id: 'DOC-SUP-8825-1',
        category: 'visa',
        categoryLabel: 'Consular Working Visa',
        documentNumber: 'VS-ESP-99410',
        associatedPassportNumber: 'A9182304',
        fullName: 'ALEJANDRO GARCIA',
        nationality: 'SPAIN',
        countryCode: 'ESP',
        dateOfBirth: '1974-11-25', // Discrepancy (1974 vs 1984)
        expiryDate: '2028-12-31',
        issueDate: '2024-01-01',
        issuingAuthority: 'CONSULAR SERVICE',
        gender: 'M',
        visaType: 'Work / Employment',
        rawUploadedFileName: 'visa_garcia_a.png',
        fileSizeBytes: 1650000,
        imageUrl: createDocPlaceholderSvg('Consular Work Visa', 'VS-ESP-99410', '#854d0e', 'SUPPORTING VISA (MISMATCH)'),
      },
    ],
    extractedFields: [
      { fieldName: 'Passport Number', extractedValue: 'A9182304', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Full Name', extractedValue: 'ALEJANDRO TOMAS GARCIA', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Nationality', extractedValue: 'SPAIN (ESP)', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Date of Birth', extractedValue: '1984-11-25', confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
      { fieldName: 'Expiry Date', extractedValue: '2030-05-18', confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
    ],
    validation: {
      overallValid: true,
      score: 92,
      requiredFieldsStatus: 'PASS',
      formatValidationStatus: 'PASS',
      mrzValidationStatus: 'PASS',
      crossFieldConsistencyStatus: 'PASS',
      items: [
        { id: 'v-1', title: 'Passport MRZ Checksum Parity', category: 'mrz_validation', status: 'PASS', detail: 'ICAO 9303 checksums valid on individual passport.' },
      ],
    },
    tampering: {
      overallTamperingScore: 12,
      photoManipulationStatus: 'PASS',
      textManipulationStatus: 'PASS',
      metadataAnomalyStatus: 'PASS',
      items: [
        { id: 't-1', componentName: 'Substrate Examination', type: 'substrate_irregularity', status: 'PASS', confidenceScore: 94, description: 'Clean physical scan.' },
      ],
    },
    faceVerification: {
      faceDetectedInDocument: true,
      faceDetectedInReference: true,
      similarityScore: 94.1,
      matchStatus: 'MATCHED',
      livenessConfidence: 96.0,
      notes: 'Facial landmarks consistent across photos.',
    },
    riskAssessment: {
      riskScore: 58,
      riskLevel: 'MEDIUM',
      primaryRiskSummary: 'Cross-document biographical mismatch detected: Date of birth on Visa (1974-11-25) conflicts with Passport (1984-11-25).',
      recommendedAction: 'SECONDARY_INTERVIEW',
      explainableFactors: [
        {
          id: 'rf-cross-doc',
          factor: 'Cross-Document DOB Inconsistency',
          weight: 'HIGH',
          impactPoints: 35,
          description: 'Date of birth on Visa (1974-11-25) conflicts with Passport (1984-11-25). 10-year discrepancy.',
          mitigationSuggestion: 'Conduct physical examination and interview bearer to clarify biographical discrepancy on visa.',
        },
      ],
    },
    crossDocumentData: {
      case_id: 'SCR-2026-0097',
      documents_compared: 2,
      document_pairs: [
        { doc_a: 'DOC-8825', doc_b: 'DOC-SUP-8825-1', relation: 'PASSPORT (A9182304) ↔ VISA (VS-ESP-99410)' },
      ],
      comparisons: [
        {
          id: 'cd-1',
          field: 'date_of_birth',
          field_label: 'Date of Birth',
          document_a: { id: 'DOC-8825', type: 'passport', label: 'PASSPORT (A9182304)', value: '1984-11-25' },
          document_b: { id: 'DOC-SUP-8825-1', type: 'visa', label: 'VISA (VS-ESP-99410)', value: '1974-11-25' },
          status: 'MISMATCH',
          confidence: 1.0,
          severity: 'HIGH',
          explanation: 'Date of birth mismatch: PASSPORT (A9182304) has "1984-11-25" while VISA (VS-ESP-99410) has "1974-11-25".',
        },
        {
          id: 'cd-2',
          field: 'full_name',
          field_label: 'Bearer Full Name',
          document_a: { id: 'DOC-8825', type: 'passport', label: 'PASSPORT (A9182304)', value: 'GARCIA, ALEJANDRO TOMAS' },
          document_b: { id: 'DOC-SUP-8825-1', type: 'visa', label: 'VISA (VS-ESP-99410)', value: 'ALEJANDRO GARCIA' },
          status: 'MATCH',
          confidence: 0.95,
          severity: 'INFO',
          explanation: 'Name components match with high token overlap.',
        },
        {
          id: 'cd-3',
          field: 'passport_number_linkage',
          field_label: 'Passport Linkage Number',
          document_a: { id: 'DOC-8825', type: 'passport', label: 'PASSPORT (A9182304)', value: 'A9182304' },
          document_b: { id: 'DOC-SUP-8825-1', type: 'visa', label: 'VISA (VS-ESP-99410)', value: 'A9182304' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Visa correctly references passport number A9182304.',
        },
        {
          id: 'cd-4',
          field: 'nationality',
          field_label: 'Nationality / Citizenship',
          document_a: { id: 'DOC-8825', type: 'passport', label: 'PASSPORT (A9182304)', value: 'ESP' },
          document_b: { id: 'DOC-SUP-8825-1', type: 'visa', label: 'VISA (VS-ESP-99410)', value: 'ESP' },
          status: 'MATCH',
          confidence: 1.0,
          severity: 'INFO',
          explanation: 'Nationalities match (ESP).',
        },
      ],
      summary: {
        matches: 3,
        mismatches: 1,
        review_required: 1,
        not_available: 0,
        total_comparisons: 4,
      },
      overall_status: 'REVIEW_REQUIRED',
      explanations: [
        '1 biographical discrepancy detected across documents: Date of birth on Visa (1974-11-25) conflicts with Passport (1984-11-25).',
      ],
      timestamp: '2026-09-09T09:40:15Z',
    },
  },
];
