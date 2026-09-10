import { calculateIcaoCheckDigit, verifyIcaoCheckDigit, validateTd3Checksums, getIcaoCharacterValue } from './mrzChecksum';
import { parseTd3Mrz, parseMrzDate, parseIcaoNameField } from './mrzParser';
import { detectMrzFromText } from './mrzDetector';
import { checkOcrMrzConsistency } from './consistencyChecker';
import { validateAndPreprocessImage } from './preprocessing';
import { ExtractedPassportFields } from './types';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, errorDetail?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    results.push({ name: testName, passed: false, error: errorDetail || 'Assertion failed' });
    console.error(`  ✗ [FAIL] ${testName}: ${errorDetail || 'Assertion failed'}`);
  }
}

export function runAllMrzTests(): { passed: number; failed: number; total: number } {
  console.log('\n======================================================');
  console.log('  IDShield AI — OCR & MRZ Pipeline Verification Suite');
  console.log('======================================================\n');

  // ==========================================================
  // Group 1: Character Value Mapping & 7-3-1 Weight Calculation
  // ==========================================================
  console.log('--- Group 1: Character Value Mapping & 7-3-1 Checksum Algorithm ---');
  assert(getIcaoCharacterValue('0') === 0, 'Character value 0 is 0');
  assert(getIcaoCharacterValue('9') === 9, 'Character value 9 is 9');
  assert(getIcaoCharacterValue('A') === 10, 'Character value A is 10');
  assert(getIcaoCharacterValue('B') === 11, 'Character value B is 11');
  assert(getIcaoCharacterValue('Z') === 35, 'Character value Z is 35');
  assert(getIcaoCharacterValue('<') === 0, 'Character value < is 0');

  // ICAO Doc 9303 Official Test Specimen: Passport Number "L898902C3" -> Check Digit is 6
  // L(21)*7 + 8*3 + 9*1 + 8*7 + 9*3 + 0*1 + 2*7 + C(12)*3 + 3*1
  // 147 + 24 + 9 + 56 + 27 + 0 + 14 + 36 + 3 = 316 % 10 = 6
  const calcDocCheck = calculateIcaoCheckDigit('L898902C3');
  assert(calcDocCheck === '6', `Doc number check digit calculation for L898902C3 (Expected 6, Got ${calcDocCheck})`);

  // Official Specimen DOB "740812" -> Check Digit is 2
  // 7*7 + 4*3 + 0*1 + 8*7 + 1*3 + 2*1 = 49 + 12 + 0 + 56 + 3 + 2 = 122 % 10 = 2
  const calcDobCheck = calculateIcaoCheckDigit('740812');
  assert(calcDobCheck === '2', `DOB check digit calculation for 740812 (Expected 2, Got ${calcDobCheck})`);

  // Official Specimen Expiry "280415" -> Check Digit is 4
  // 2*7 + 8*3 + 0*1 + 4*7 + 1*3 + 5*1 = 14 + 24 + 0 + 28 + 3 + 5 = 74 % 10 = 4
  const calcExpCheck = calculateIcaoCheckDigit('280415');
  assert(calcExpCheck === '4', `Expiry check digit calculation for 280415 (Expected 4, Got ${calcExpCheck})`);

  // Personal number "ZE184226B<<<<<" -> Check Digit is 1
  const calcPersonalCheck = calculateIcaoCheckDigit('ZE184226B<<<<<');
  assert(calcPersonalCheck === '1', `Personal number check digit for ZE184226B<<<<< (Expected 1, Got ${calcPersonalCheck})`);

  // ==========================================================
  // Group 2: TD3 Full Checksum Parity Verification
  // ==========================================================
  console.log('\n--- Group 2: Full TD3 Parity Checksum Suite ---');
  const validLine2 = 'L898902C36UTO7408122F2804154ZE184226B<<<<<18';
  const validParity = validateTd3Checksums(validLine2);
  assert(validParity.passport_number === true, 'Valid line2 passport number check passes');
  assert(validParity.date_of_birth === true, 'Valid line2 DOB check passes');
  assert(validParity.expiry_date === true, 'Valid line2 expiry check passes');
  assert(validParity.personal_number === true, 'Valid line2 personal number check passes');
  assert(validParity.composite === true, 'Valid line2 composite check passes');
  assert(validParity.all_passed === true, 'Valid line2 all checks passed');

  // Negative Checksum Test: Corrupted passport number check digit ('7' instead of '6')
  const tamperedLine2 = 'L898902C37UTO7408122F2804154ZE184226B<<<<<18';
  const tamperedParity = validateTd3Checksums(tamperedLine2);
  assert(tamperedParity.passport_number === false, 'Tampered passport number check fails correctly');
  assert(tamperedParity.composite === false, 'Tampered line2 composite check fails as expected');
  assert(tamperedParity.all_passed === false, 'Tampered line2 all_passed is false');

  // Corrupted DOB check digit ('9' instead of '2')
  const corruptedDobLine2 = 'L898902C36UTO7408129F2804154ZE184226B<<<<<18';
  const corruptedDobParity = validateTd3Checksums(corruptedDobLine2);
  assert(corruptedDobParity.date_of_birth === false, 'Corrupted DOB check fails correctly');

  // ==========================================================
  // Group 3: MRZ Date Parsing & Century Normalization
  // ==========================================================
  console.log('\n--- Group 3: Date Parsing & Century Resolution ---');
  const parsedDob1 = parseMrzDate('740812', false);
  assert(parsedDob1.isValid === true && parsedDob1.isoDate === '1974-08-12', 'DOB 740812 parsed to 1974-08-12');

  const parsedDob2 = parseMrzDate('050319', false);
  assert(parsedDob2.isValid === true && parsedDob2.isoDate === '2005-03-19', 'DOB 050319 parsed to 2005-03-19');

  const parsedExp1 = parseMrzDate('280415', true);
  assert(parsedExp1.isValid === true && parsedExp1.isoDate === '2028-04-15', 'Expiry 280415 parsed to 2028-04-15');

  const parsedInvalidDate = parseMrzDate('999999', false);
  assert(parsedInvalidDate.isValid === false, 'Invalid date 999999 rejected correctly');

  // ==========================================================
  // Group 4: ICAO Name Parsing
  // ==========================================================
  console.log('\n--- Group 4: ICAO Name Token Extraction ---');
  const name1 = parseIcaoNameField('ERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<');
  assert(name1.surname === 'ERIKSSON', 'Extracted surname ERIKSSON');
  assert(name1.givenNames === 'ANNA MARIA', 'Extracted given names ANNA MARIA');
  assert(name1.fullName === 'ERIKSSON, ANNA MARIA', 'Formatted full name ERIKSSON, ANNA MARIA');

  const nameSingle = parseIcaoNameField('SMITH<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<');
  assert(nameSingle.surname === 'SMITH' && nameSingle.givenNames === '', 'Single name surname extracted correctly');

  // ==========================================================
  // Group 5: Deterministic TD3 MRZ Parser
  // ==========================================================
  console.log('\n--- Group 5: TD3 MRZ Parser ---');
  const line1 = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<';
  const line2 = 'L898902C36UTO7408122F2804154ZE184226B<<<<<18';
  const parsedTd3 = parseTd3Mrz(line1, line2);

  assert(parsedTd3.format === 'TD3', 'Parsed format is TD3');
  assert(parsedTd3.documentCode === 'P<', 'Document code is P<');
  assert(parsedTd3.issuingState === 'UTO', 'Issuing state is UTO');
  assert(parsedTd3.passportNumber === 'L898902C3', 'Passport number is L898902C3');
  assert(parsedTd3.nationality === 'UTO', 'Nationality is UTO');
  assert(parsedTd3.sex === 'F', 'Sex is F');
  assert(parsedTd3.dateOfBirth === '1974-08-12', 'Date of birth is 1974-08-12');
  assert(parsedTd3.expiryDate === '2028-04-15', 'Expiry date is 2028-04-15');
  assert(parsedTd3.personalNumber === 'ZE184226B', 'Personal number is ZE184226B');

  // ==========================================================
  // Group 6: MRZ Detection from OCR Text
  // ==========================================================
  console.log('\n--- Group 6: MRZ Detection from OCR Stream ---');
  const mockOcrText = `PASSPORT / PASSEPORT\nType: P Country: UTO\nName: ERIKSSON, ANNA MARIA\nNo: L898902C3\nDOB: 12/08/1974\n\nP<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<\nL898902C36UTO7408122F2804154ZE184226B<<<<<18`;
  const detectedMrz = detectMrzFromText(mockOcrText);

  assert(detectedMrz.detected === true, 'MRZ detected from full text stream');
  assert(detectedMrz.parsed?.passportNumber === 'L898902C3', 'MRZ parsed passport number matches from text stream');
  assert(detectedMrz.checksum_validation?.all_passed === true, 'MRZ checksums verified from text stream');

  // Negative test: No MRZ in text
  const noMrzText = `DRIVING LICENCE\nName: John Doe\nClass: B`;
  const noMrzResult = detectMrzFromText(noMrzText);
  assert(noMrzResult.detected === false, 'MRZ not detected on plain text document');

  // ==========================================================
  // Group 7: OCR ↔ MRZ Consistency Checker
  // ==========================================================
  console.log('\n--- Group 7: OCR ↔ MRZ Consistency Comparison ---');
  const matchingFields: ExtractedPassportFields = {
    full_name: { value: 'ANNA MARIA ERIKSSON', confidence: 0.98 },
    passport_number: { value: 'L898902C3', confidence: 0.99 },
    nationality: { value: 'UTOPIA (UTO)', confidence: 0.99 },
    date_of_birth: { value: '1974-08-12', confidence: 0.96 },
    date_of_expiry: { value: '2028-04-15', confidence: 0.97 },
    gender: { value: 'F', confidence: 0.99 },
  };
  const consistencyMatch = checkOcrMrzConsistency(matchingFields, detectedMrz);
  assert(consistencyMatch.overallMatch === true, 'Consistent fields return overallMatch true');
  assert(consistencyMatch.mismatchCount === 0, 'Consistent fields have 0 mismatches');

  // Mismatched passport number test (Visual: L898902C9, MRZ: L898902C3)
  const mismatchedFields: ExtractedPassportFields = {
    ...matchingFields,
    passport_number: { value: 'L898902C9', confidence: 0.95 },
  };
  const consistencyMismatch = checkOcrMrzConsistency(mismatchedFields, detectedMrz);
  assert(consistencyMismatch.overallMatch === false, 'Mismatched passport number returns overallMatch false');
  assert(consistencyMismatch.mismatchCount > 0, 'Mismatched field recorded in mismatchCount');

  // ==========================================================
  // Group 8: File Validation & Error Handling
  // ==========================================================
  console.log('\n--- Group 8: Image Validation & Error Handling ---');
  // Valid Base64 Image
  const dummyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const validImagePrep = validateAndPreprocessImage(dummyBase64, 'passport.png');
  assert(validImagePrep.valid === true, 'Valid PNG base64 accepted');
  assert(validImagePrep.mimeType === 'image/png', 'MIME type inferred as image/png');

  // Valid SVG document (data URI and raw SVG)
  const dummySvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg"><text>P&lt;UTOERIKSSON&lt;&lt;ANNA</text></svg>';
  const validSvgPrep = validateAndPreprocessImage(dummySvg, 'specimen.svg');
  assert(validSvgPrep.valid === true, 'Valid SVG document accepted');
  assert(validSvgPrep.mimeType === 'image/svg+xml', 'MIME type inferred as image/svg+xml');

  // Unsupported format (e.g. text/plain or executable)
  const badMimePrep = validateAndPreprocessImage('data:application/pdf;base64,JVBERi0xLjQKJc==', 'document.pdf');
  assert(badMimePrep.valid === false, 'PDF/non-image format rejected gracefully');

  // Empty string
  const emptyPrep = validateAndPreprocessImage('', 'test.jpg');
  assert(emptyPrep.valid === false, 'Empty payload rejected gracefully');

  // Summary
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const total = results.length;

  console.log('\n======================================================');
  console.log(`  Test Execution Complete: ${passed}/${total} PASSED (${failed} failed)`);
  console.log('======================================================\n');

  return { passed, failed, total };
}

// Auto-run when executed directly
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('runTests')) {
  const summary = runAllMrzTests();
  if (summary.failed > 0) {
    process.exit(1);
  }
}
