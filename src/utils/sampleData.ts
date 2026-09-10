import { SampleDocumentPreset } from '../types';

// Helper to generate realistic visual ID SVG data URLs
export function generateMockIdSvg(
  type: 'aadhaar' | 'pan' | 'passport' | 'visa' | 'driving_license',
  tampered: boolean,
  tamperType: 'dob' | 'photo' | 'font' | 'watermark' | 'none' = 'none'
): string {
  const isAadhaar = type === 'aadhaar';
  const isPan = type === 'pan';
  const isPassport = type === 'passport';
  const isVisa = type === 'visa';
  const isDL = type === 'driving_license';

  let title = 'GOVERNMENT OF INDIA';
  let subTitle = 'UNIQUE IDENTIFICATION AUTHORITY OF INDIA';
  let primaryColor = '#0284c7';
  let accentColor = '#f97316';
  let docNumber = '8492 5102 9918';
  let name = 'RAHUL SHARMA';
  let dob = '14/08/1994';
  let gender = 'MALE';

  if (isPan) {
    title = 'INCOME TAX DEPARTMENT';
    subTitle = 'GOVT. OF INDIA';
    primaryColor = '#1e3a8a';
    accentColor = '#eab308';
    docNumber = 'ABCPS8192K';
    name = 'PRIYA NAIR';
    dob = tampered && tamperType === 'dob' ? '12/03/1990' : '12/03/2001';
  } else if (isPassport) {
    title = 'REPUBLIC OF INDIA / PASSPORT';
    subTitle = 'MINISTRY OF EXTERNAL AFFAIRS';
    primaryColor = '#0f172a';
    accentColor = '#f59e0b';
    docNumber = 'Z8491023';
    name = 'VIKRAM MALHOTRA';
    dob = '22/11/1988';
  } else if (isVisa) {
    title = 'CONSULAR ENTRY VISA / MRV-A';
    subTitle = 'IMMIGRATION & BORDER CONTROL AUTHORITY';
    primaryColor = '#1e3a8a';
    accentColor = '#2563eb';
    docNumber = 'V10298492';
    name = 'EMMA WATSON';
    dob = '15/04/1990';
  } else if (isDL) {
    title = 'NATIONAL IDENTITY CARD';
    subTitle = 'DEPARTMENT OF CIVIL REGISTRATION';
    primaryColor = '#065f46';
    accentColor = '#10b981';
    docNumber = 'ID-8819283-A';
    name = 'AMIT VERMA';
    dob = '05/06/1996';
  }

  // SVG representation with microprint patterns, hologram simulations, guilloche lines, barcodes, stamps
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 380" width="600" height="380" style="background:#f8fafc; font-family:sans-serif; border-radius:12px; overflow:hidden;">
    <defs>
      <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${isPan ? '#eff6ff' : isAadhaar ? '#fffbeb' : isPassport ? '#f1f5f9' : '#ecfdf5'}" />
        <stop offset="50%" stop-color="#ffffff" />
        <stop offset="100%" stop-color="${isPan ? '#dbeafe' : isAadhaar ? '#fef3c7' : isPassport ? '#e2e8f0' : '#d1fae5'}" />
      </linearGradient>
      <pattern id="guilloche" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M0 15 Q 7.5 0, 15 15 T 30 15" fill="none" stroke="${tampered && tamperType === 'watermark' ? 'rgba(239,68,68,0.3)' : 'rgba(100,116,139,0.12)'}" stroke-width="0.75"/>
        <circle cx="15" cy="15" r="8" fill="none" stroke="${tampered && tamperType === 'watermark' ? 'rgba(239,68,68,0.2)' : 'rgba(148,163,184,0.1)'}" stroke-width="0.5"/>
      </pattern>
      <linearGradient id="holoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f43f5e" stop-opacity="0.8"/>
        <stop offset="25%" stop-color="#eab308" stop-opacity="0.8"/>
        <stop offset="50%" stop-color="#10b981" stop-opacity="0.8"/>
        <stop offset="75%" stop-color="#06b6d4" stop-opacity="0.8"/>
        <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0.8"/>
      </linearGradient>
    </defs>

    <!-- Card Base -->
    <rect width="600" height="380" rx="12" fill="url(#bgGrad)" stroke="#cbd5e1" stroke-width="2"/>
    <rect width="600" height="380" fill="url(#guilloche)" />

    <!-- Top Header Bar -->
    <rect x="0" y="0" width="600" height="58" fill="${primaryColor}"/>
    <line x1="0" y1="58" x2="600" y2="58" stroke="${accentColor}" stroke-width="3"/>
    
    <!-- Emblem & Header Text -->
    <circle cx="35" cy="29" r="18" fill="#ffffff" opacity="0.9"/>
    <path d="M35 15 L38 23 L47 24 L40 30 L42 39 L35 34 L28 39 L30 30 L23 24 L32 23 Z" fill="${accentColor}" transform="scale(0.5) translate(35, 29)"/>
    <text x="65" y="26" font-size="14" font-weight="bold" fill="#ffffff" letter-spacing="1">${title}</text>
    <text x="65" y="44" font-size="10" font-weight="600" fill="#e2e8f0" letter-spacing="0.5">${subTitle}</text>

    <!-- Photo Container -->
    <g transform="translate(35, 80)">
      <rect width="115" height="145" rx="6" fill="#e2e8f0" stroke="${tampered && tamperType === 'photo' ? '#ef4444' : '#94a3b8'}" stroke-width="${tampered && tamperType === 'photo' ? '2' : '1.5'}" stroke-dasharray="${tampered && tamperType === 'photo' ? '4,2' : 'none'}"/>
      <!-- Portrait Silhouette -->
      <circle cx="57.5" cy="55" r="28" fill="${tampered && tamperType === 'photo' ? '#fb7185' : '#64748b'}"/>
      <path d="M22 130 C22 95, 93 95, 93 130 Z" fill="${tampered && tamperType === 'photo' ? '#fda4af' : '#475569'}"/>
      ${tampered && tamperType === 'photo' ? '<text x="10" y="140" font-size="8" fill="#dc2626" font-weight="bold">[EDITED PHOTO SPLICING]</text>' : ''}
    </g>

    <!-- Ghost image / holographic seal -->
    <g transform="translate(480, 80)">
      <circle cx="45" cy="45" r="35" fill="url(#holoGrad)" opacity="${tampered && tamperType === 'watermark' ? '0.2' : '0.75'}"/>
      <circle cx="45" cy="45" r="28" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="3,2"/>
      <text x="45" y="48" font-size="9" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">SECURE ID</text>
    </g>

    <!-- OCR & Personal Details Fields -->
    <g transform="translate(170, 85)" font-family="sans-serif">
      <text x="0" y="15" font-size="10" font-weight="600" fill="#64748b">NAME / Name</text>
      <text x="0" y="35" font-size="14" font-weight="bold" fill="#0f172a" letter-spacing="0.5">${name}</text>

      <text x="0" y="65" font-size="10" font-weight="600" fill="#64748b">DATE OF BIRTH / DOB</text>
      <text x="0" y="85" font-size="13" font-weight="${tampered && tamperType === 'dob' ? '900' : 'bold'}" fill="${tampered && tamperType === 'dob' ? '#b91c1c' : '#0f172a'}" font-family="${tampered && tamperType === 'dob' ? 'Courier, monospace' : 'inherit'}">${dob}</text>

      <text x="160" y="65" font-size="10" font-weight="600" fill="#64748b">GENDER</text>
      <text x="160" y="85" font-size="13" font-weight="bold" fill="#0f172a">${gender}</text>

      <text x="0" y="115" font-size="10" font-weight="600" fill="#64748b">DOCUMENT NUMBER / ID</text>
      <text x="0" y="137" font-size="15" font-weight="800" fill="${primaryColor}" letter-spacing="2" font-family="monospace">${docNumber}</text>
    </g>

    <!-- Bottom Verification Band & Barcode / QR Simulation -->
    <rect x="25" y="245" width="550" height="110" rx="8" fill="#ffffff" stroke="#e2e8f0" stroke-width="1"/>
    
    <!-- QR Code Mock -->
    <g transform="translate(40, 255)">
      <rect width="85" height="85" fill="#0f172a" rx="4"/>
      <rect x="6" y="6" width="24" height="24" fill="#ffffff"/>
      <rect x="10" y="10" width="16" height="16" fill="#0f172a"/>
      <rect x="55" y="6" width="24" height="24" fill="#ffffff"/>
      <rect x="59" y="10" width="16" height="16" fill="#0f172a"/>
      <rect x="6" y="55" width="24" height="24" fill="#ffffff"/>
      <rect x="10" y="59" width="16" height="16" fill="#0f172a"/>
      <!-- QR Pattern dots -->
      <circle cx="42" cy="20" r="3" fill="#ffffff"/>
      <circle cx="42" cy="40" r="3" fill="#ffffff"/>
      <circle cx="42" cy="65" r="3" fill="#ffffff"/>
      <circle cx="65" cy="45" r="3" fill="#ffffff"/>
      <circle cx="25" cy="45" r="3" fill="#ffffff"/>
    </g>

    <!-- MRZ / Machine Readable Zone simulation -->
    <g transform="translate(145, 275)" font-family="monospace" font-size="11" fill="#334155" letter-spacing="1.5">
      <text x="0" y="15">IDIND${docNumber.replace(/\\s/g, '')}&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="0" y="38">9408144M3009096IND&lt;&lt;${name.replace(/\\s/g, '&lt;')}&lt;&lt;&lt;&lt;&lt;&lt;</text>
      <text x="0" y="58" font-size="9" fill="#94a3b8">AUTHENTICATED DIGITAL IDENTITY EMBEDDED CHIP V4.2</text>
    </g>

    <!-- Tamper Alert Banner if tampered -->
    ${tampered ? `
      <rect x="350" y="12" width="230" height="24" rx="4" fill="#ef4444"/>
      <text x="465" y="28" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">🚨 SIMULATED TAMPERED SAMPLE</text>
    ` : `
      <rect x="420" y="12" width="160" height="24" rx="4" fill="#10b981"/>
      <text x="500" y="28" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">✓ GENUINE TEST SAMPLE</text>
    `}
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function generateSelfieMockSvg(match: boolean): string {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300" style="background:#0f172a; border-radius:12px;">
    <defs>
      <radialGradient id="faceGrad" cx="50%" cy="45%" r="50%">
        <stop offset="0%" stop-color="#fed7aa"/>
        <stop offset="80%" stop-color="#fdba74"/>
        <stop offset="100%" stop-color="#fb923c"/>
      </radialGradient>
      <linearGradient id="liveRing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3b82f6"/>
        <stop offset="100%" stop-color="#10b981"/>
      </linearGradient>
    </defs>

    <circle cx="150" cy="150" r="140" fill="#1e293b"/>
    <circle cx="150" cy="150" r="135" fill="none" stroke="url(#liveRing)" stroke-width="3" stroke-dasharray="8,4"/>
    
    <!-- Person Head -->
    <ellipse cx="150" cy="130" rx="55" ry="70" fill="url(#faceGrad)"/>
    <!-- Hair -->
    <path d="M95 120 Q150 45 205 120 Q190 70 150 70 Q110 70 95 120 Z" fill="${match ? '#1e293b' : '#7c2d12'}"/>
    <!-- Eyes -->
    <circle cx="130" cy="125" r="6" fill="#0f172a"/>
    <circle cx="170" cy="125" r="6" fill="#0f172a"/>
    <!-- Smile -->
    <path d="M135 155 Q150 170 165 155" fill="none" stroke="#9a3412" stroke-width="3" stroke-linecap="round"/>
    
    <!-- Body -->
    <path d="M80 270 C80 210, 220 210, 220 270 Z" fill="#334155"/>

    <!-- Liveness Overlay Stamp -->
    <rect x="80" y="255" width="140" height="24" rx="12" fill="rgba(16, 185, 129, 0.9)"/>
    <text x="150" y="271" font-size="10" font-weight="bold" fill="#ffffff" text-anchor="middle">LIVE SELFIE 3D VERIFIED</text>
  </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_DOCUMENT_PRESETS: SampleDocumentPreset[] = [
  {
    id: 'sample-aadhaar-genuine',
    title: 'Genuine Aadhaar ID (Standard Pass)',
    documentType: 'aadhaar',
    expectedOutcome: 'GENUINE',
    description: 'Original UIDAI Aadhaar document featuring intact guilloche background patterns, uniform microtext fonts, valid QR verification hash, and hologram authenticity.',
    tags: ['Aadhaar', 'Genuine', '100% Match', 'Valid QR'],
    imageUrl: generateMockIdSvg('aadhaar', false),
    selfieUrl: generateSelfieMockSvg(true),
    simulatedReport: {
      id: 'REP-AADHAAR-84920',
      timestamp: new Date().toISOString(),
      documentType: 'aadhaar',
      fileName: 'uidai_aadhaar_rahul_sharma.png',
      fileSize: '1.42 MB',
      imageDimensions: { width: 1200, height: 760 },
      authenticityScore: 98,
      overallStatus: 'PASSED',
      riskLevel: 'LOW',
      summary: 'Document verified as genuine with high cryptographic confidence. All security features including UIDAI guilloche pattern, embedded QR payload, and font layout are consistent with official standards.',
      tamperingDetected: false,
      ocrData: {
        documentNumber: '8492 5102 9918',
        documentType: 'aadhaar',
        fullName: 'RAHUL SHARMA',
        dateOfBirth: '14/08/1994',
        gender: 'MALE',
        address: 'H-402, Green Meadows, MG Road, Bengaluru, Karnataka - 560001',
        qrDataMatchesOcr: true,
        qrCodeData: 'V4:UIDAI:849251029918:RAHUL_SHARMA:14081994:M:PASS'
      },
      securityChecks: [
        { id: 'sc-1', name: 'Guilloche Micro-Pattern Continuity', category: 'tamper', status: 'PASS', score: 99, message: 'Continuous vector curves with no pixel discontinuity or erasure.' },
        { id: 'sc-2', name: 'Font Typography & Kerning Consistency', category: 'font', status: 'PASS', score: 97, message: 'Identified official UIDAI font glyphs without secondary raster artifacts.' },
        { id: 'sc-3', name: 'QR Code Hash vs OCR Payload', category: 'data_integrity', status: 'PASS', score: 100, message: 'Digital signature inside QR matches extracted OCR plain fields exactly.' },
        { id: 'sc-4', name: 'Photo Edge Boundary & Pixel Artifacts', category: 'tamper', status: 'PASS', score: 96, message: 'No cut-and-paste boundaries, clone brush artifacts, or shadow mismatch.' },
        { id: 'sc-5', name: 'Emblem Hologram Refraction Index', category: 'security_feature', status: 'PASS', score: 95, message: 'Holographic diffraction spectrum matches standard biometric cards.' }
      ],
      boundingBoxes: [
        { id: 'bb-1', label: 'UIDAI QR Code (Valid Hash)', type: 'qr_code', confidence: 0.99, severity: 'low', x: 6, y: 67, width: 15, height: 23, description: 'Cryptographically signed QR payload confirmed' },
        { id: 'bb-2', label: 'Photo ID (Intact Border)', type: 'ocr_field', confidence: 0.97, severity: 'low', x: 5, y: 21, width: 20, height: 38, description: 'Biometric photo bounds clean' },
        { id: 'bb-3', label: 'National Emblem Hologram', type: 'watermark', confidence: 0.96, severity: 'low', x: 80, y: 21, width: 14, height: 23, description: 'Hologram diffraction verified' }
      ],
      faceMatch: {
        performed: true,
        matchScore: 96.4,
        status: 'MATCH',
        livenessDetected: true,
        spoofRiskScore: 3.2,
        landmarksVerified: true,
        notes: 'High cosine similarity across 128 facial anchor points. Live 3D texture confirmed.'
      },
      forensicHash: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      modelUsed: 'gemini-3.8-flash (Multimodal Document Forensics)',
      executionTimeMs: 430
    }
  },
  {
    id: 'sample-pan-tampered-dob',
    title: 'Forged PAN Card (Altered Date of Birth)',
    documentType: 'pan',
    expectedOutcome: 'TAMPERED_DOB',
    description: 'PAN card with suspicious font replacement and digital pixel mismatch in the Date of Birth field to artificially change age eligibility.',
    tags: ['PAN', 'DOB Tampering', 'High Risk', 'Font Mismatch'],
    imageUrl: generateMockIdSvg('pan', true, 'dob'),
    selfieUrl: generateSelfieMockSvg(true),
    simulatedReport: {
      id: 'REP-PAN-FORGERY-3019',
      timestamp: new Date().toISOString(),
      documentType: 'pan',
      fileName: 'pan_card_priya_nair_forged.png',
      fileSize: '2.18 MB',
      imageDimensions: { width: 1200, height: 760 },
      authenticityScore: 34,
      overallStatus: 'REJECTED',
      riskLevel: 'HIGH',
      summary: 'Critical tampering identified in the Date of Birth field. The font kerning, baseline pixel density, and anti-aliasing gradient around "12/03/1990" diverge significantly from Income Tax Department typography standards.',
      tamperingDetected: true,
      ocrData: {
        documentNumber: 'ABCPS8192K',
        documentType: 'pan',
        fullName: 'PRIYA NAIR',
        dateOfBirth: '12/03/1990',
        gender: 'FEMALE',
        fatherOrSpouseName: 'K. NAIR',
        qrDataMatchesOcr: false,
        qrCodeData: 'NSDL:PAN:ABCPS8192K:PRIYA_NAIR:12032001:F'
      },
      securityChecks: [
        { id: 'sc-1', name: 'DOB Field Font Geometry & Raster Artifacts', category: 'font', status: 'FAIL', score: 18, message: 'Mismatched typeface detected (Courier/Monospace substituted over Arial/OCR-B).', technicalDetails: 'Laplacian variance of blur around DOB bounding box indicates secondary digital editing.' },
        { id: 'sc-2', name: 'QR Code vs OCR Cross-Validation', category: 'data_integrity', status: 'FAIL', score: 25, message: 'QR payload contains DOB 12/03/2001 while printed OCR text displays 12/03/1990.', technicalDetails: 'Discrepancy of 11 years indicates deliberate age inflation fraud.' },
        { id: 'sc-3', name: 'Guilloche Background Pattern Continuity', category: 'tamper', status: 'WARNING', score: 55, message: 'Background wave lines exhibit slight smudging under the DOB bounding box.' },
        { id: 'sc-4', name: 'PAN Checksum Algorithm Validation', category: 'data_integrity', status: 'PASS', score: 92, message: 'PAN structure format matches standard 5 alpha + 4 numeric + 1 alpha pattern.' },
        { id: 'sc-5', name: 'Hologram / Seal Reflection', category: 'security_feature', status: 'PASS', score: 88, message: 'Holographic seal structure is authentic.' }
      ],
      boundingBoxes: [
        { id: 'bb-1', label: 'Tampered Date of Birth (Font Alteration)', type: 'font_anomaly', confidence: 0.94, severity: 'high', x: 28, y: 22, width: 22, height: 10, description: 'Pixel compression mismatch and divergent baseline font' },
        { id: 'bb-2', label: 'QR Payload Conflict', type: 'qr_code', confidence: 0.91, severity: 'high', x: 6, y: 67, width: 15, height: 23, description: 'QR encoded date does not match modified text' }
      ],
      faceMatch: {
        performed: true,
        matchScore: 91.2,
        status: 'MATCH',
        livenessDetected: true,
        spoofRiskScore: 6.8,
        landmarksVerified: true,
        notes: 'Facial recognition matched, but overall verification rejected due to document data manipulation.'
      },
      forensicHash: 'SHA256:3a91f422e039408b08112c30089e5a1b0289ec092c47890a8276f59190ab1288',
      modelUsed: 'gemini-3.8-flash (Multimodal Document Forensics)',
      executionTimeMs: 512
    }
  },
  {
    id: 'sample-passport-photo-splice',
    title: 'Passport (Photo Substitution / Splicing)',
    documentType: 'passport',
    expectedOutcome: 'PHOTO_SPLICE',
    description: 'Passport with synthetic photo replacement where the original identity photograph was digitally overlaid or spliced over the underlying watermark.',
    tags: ['Passport', 'Photo Substitution', 'Severe Fraud', 'Border Security'],
    imageUrl: generateMockIdSvg('passport', true, 'photo'),
    selfieUrl: generateSelfieMockSvg(false),
    simulatedReport: {
      id: 'REP-PASSPORT-SPLICE-9921',
      timestamp: new Date().toISOString(),
      documentType: 'passport',
      fileName: 'indian_passport_vikram_malhotra.jpg',
      fileSize: '3.45 MB',
      imageDimensions: { width: 1200, height: 760 },
      authenticityScore: 18,
      overallStatus: 'REJECTED',
      riskLevel: 'CRITICAL_FRAUD',
      summary: 'Severe document tampering detected. The primary photo exhibits edge blur discontinuities, color-temperature divergence, and disruption of the national security guilloche security pattern behind the portrait.',
      tamperingDetected: true,
      ocrData: {
        documentNumber: 'Z8491023',
        documentType: 'passport',
        fullName: 'VIKRAM MALHOTRA',
        dateOfBirth: '22/11/1988',
        gender: 'MALE',
        issueDate: '10/01/2019',
        expiryDate: '09/01/2029',
        qrDataMatchesOcr: false
      },
      securityChecks: [
        { id: 'sc-1', name: 'Photo Cut-Line & Boundary Analysis', category: 'tamper', status: 'FAIL', score: 12, message: 'Hard rectangular boundary seam detected around the facial portrait.', technicalDetails: 'Error Level Analysis (ELA) reveals high frequency compression differences between portrait canvas and passport substrate.' },
        { id: 'sc-2', name: 'Ghost Image Cross-Correlation', category: 'security_feature', status: 'FAIL', score: 15, message: 'Secondary ghost image in UV region does not match primary photo subject.', technicalDetails: 'Facial landmark difference > 45% between ghost watermark and primary photo.' },
        { id: 'sc-3', name: 'Face Match vs Applicant Selfie', category: 'face_match', status: 'FAIL', score: 28, message: 'Facial similarity between document photo and live selfie is below safety threshold.', technicalDetails: 'Cosine similarity 0.28 (Threshold: 0.80).' },
        { id: 'sc-4', name: 'MRZ (Machine Readable Zone) Checksum', category: 'data_integrity', status: 'PASS', score: 95, message: 'MRZ check digits match document parameters.' },
        { id: 'sc-5', name: 'Paper Substrate Microtext Integrity', category: 'security_feature', status: 'WARNING', score: 62, message: 'Interrupted microtext lines along left boundary of the photo box.' }
      ],
      boundingBoxes: [
        { id: 'bb-1', label: 'Photo Substitution Boundary', type: 'photo_splice', confidence: 0.98, severity: 'high', x: 5, y: 21, width: 20, height: 38, description: 'Inconsistent JPEG compression and severed background security fibers' },
        { id: 'bb-2', label: 'Ghost Watermark Discrepancy', type: 'ghost_image', confidence: 0.93, severity: 'high', x: 80, y: 21, width: 14, height: 23, description: 'Ghost watermark depicts a different facial structure' }
      ],
      faceMatch: {
        performed: true,
        matchScore: 28.5,
        status: 'MISMATCH',
        livenessDetected: true,
        spoofRiskScore: 12.0,
        landmarksVerified: false,
        notes: 'Live applicant facial features do not correlate with the substituted photo on the ID.'
      },
      forensicHash: 'SHA256:d894b917c0a9821ef9a1284a0d9237e1927346129849281a0b1274c98234abcc',
      modelUsed: 'gemini-3.8-flash (Multimodal Document Forensics)',
      executionTimeMs: 580
    }
  },
  {
    id: 'sample-visa-consular',
    title: 'Travel Visa (Consular Entry MRV-A)',
    documentType: 'visa',
    expectedOutcome: 'GENUINE',
    description: 'Consular travel visa sticker featuring official machine-readable zone (MRV-A), multi-spectral background printing, and intact security Guilloche wave patterns.',
    tags: ['Travel Visa', 'Consular Stamp', 'Genuine', 'Valid MRZ'],
    imageUrl: generateMockIdSvg('visa', false, 'none'),
    selfieUrl: generateSelfieMockSvg(true),
    simulatedReport: {
      id: 'REP-VISA-CONSULAR-501',
      timestamp: new Date().toISOString(),
      documentType: 'visa',
      fileName: 'consular_travel_visa_emma_watson.png',
      fileSize: '1.65 MB',
      imageDimensions: { width: 1200, height: 760 },
      authenticityScore: 97,
      overallStatus: 'PASSED',
      riskLevel: 'LOW',
      summary: 'Consular travel visa verified genuine. ICAO 9303 MRV-A checksums compute with zero parity defects, guilloche background lines continuous, and consular security seal intact.',
      tamperingDetected: false,
      ocrData: {
        documentNumber: 'V10298492',
        documentType: 'visa',
        fullName: 'EMMA WATSON',
        dateOfBirth: '15/04/1990',
        gender: 'FEMALE',
        issueDate: '01/02/2024',
        expiryDate: '01/02/2029'
      },
      securityChecks: [
        { id: 'sc-1', name: 'ICAO MRV-A Checksum Mathematical Parity', category: 'data_integrity', status: 'PASS', score: 99, message: 'All numeric 7-3-1 weight check digits validate with zero errors.' },
        { id: 'sc-2', name: 'Consular Security Hologram & Intaglio Print', category: 'security_feature', status: 'PASS', score: 95, message: 'Intaglio tactile texture and diffraction spectrum confirmed.' },
        { id: 'sc-3', name: 'Font Typography & Kerning Standards', category: 'font', status: 'PASS', score: 98, message: 'Official consular OCR-B typeface with consistent baseline alignment.' },
        { id: 'sc-4', name: 'Photo ID Integration & Anti-Tamper Edge', category: 'tamper', status: 'PASS', score: 96, message: 'No photo splicing detected; continuous security substrate.' }
      ],
      boundingBoxes: [
        { id: 'bb-1', label: 'Consular Seal (Verified)', type: 'watermark', confidence: 0.98, severity: 'low', x: 80, y: 21, width: 14, height: 23, description: 'High-definition micro-line seal structure confirmed' },
        { id: 'bb-2', label: 'MRV-A Optical Zone', type: 'ocr_field', confidence: 0.99, severity: 'low', x: 10, y: 78, width: 80, height: 18, description: 'ICAO 9303 Part 7 compliance verified' }
      ],
      faceMatch: {
        performed: true,
        matchScore: 95.8,
        status: 'MATCH',
        livenessDetected: true,
        spoofRiskScore: 2.9,
        landmarksVerified: true,
        notes: 'Selfie matched the photograph on the visa document with high confidence.'
      },
      forensicHash: 'SHA256:6e1892a01948bc12984a9182379a081298374a91b928347102938472910ab384',
      modelUsed: 'gemini-3.8-flash (Multimodal Document Forensics)',
      executionTimeMs: 440
    }
  }
];
