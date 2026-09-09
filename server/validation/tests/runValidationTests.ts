/**
 * Automated Verification Suite for IDShield AI — Document Validation Engine
 *
 * Covers:
 * 1. Required fields rule (all present, missing name, missing doc#, missing dob/expiry)
 * 2. Passport number syntax and bounds (valid alphanumeric, illegal chars, lengths, normalization)
 * 3. Calendar date validity and chronology (leap years, non-leap Feb 29, invalid months/days, future DOB)
 * 4. Expiry horizon analysis (VALID, EXPIRING_SOON, EXPIRED, NOT_CHECKED, config overrides)
 * 5. Nationality & Country code registry (ISO 3166-1 alpha-3 & ICAO 9303 standards, invalid codes)
 * 6. Gender / Sex normalization ('M', 'F', 'X', '<', multilingual labels)
 * 7. MRZ Checksum Integration (consuming deterministic 7-3-1 results without duplication)
 * 8. OCR ↔ MRZ Consistency Cross-Checking (anomaly signals without forgery presumption)
 * 9. Cross-Field Deterministic Relationships (DOB < today, DOB < Expiry, Issue < Expiry)
 * 10. Validation Engine Aggregation (VALID, WARNING, INVALID, INCOMPLETE, counts, severities)
 */

import { ValidationEngine } from '../engine/validationEngine';
import { PassportRequiredFieldsRule } from '../rules/passport/requiredFieldsRule';
import { PassportNumberRule } from '../rules/passport/passportNumberRule';
import { PassportDateRule } from '../rules/passport/dateRule';
import { PassportExpiryRule } from '../rules/passport/expiryRule';
import { PassportNationalityRule } from '../rules/passport/nationalityRule';
import { PassportGenderRule } from '../rules/passport/genderRule';
import { PassportMrzChecksumRule } from '../rules/passport/mrzChecksumRule';
import { PassportOcrMrzConsistencyRule } from '../rules/passport/ocrMrzConsistencyRule';
import { PassportCrossFieldRule } from '../rules/passport/crossFieldRule';
import { DEFAULT_VALIDATION_CONFIG } from '../schemas/config';
import { StructuredPassportInput } from '../schemas/validationTypes';
import { isValidCalendarDate, parseAndValidateDate, isLeapYear } from '../utils/dateUtils';
import { isValidCountryCode } from '../utils/countryCodes';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, failureDetails?: any) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}`);
    if (failureDetails !== undefined) {
      console.error(`     Details:`, failureDetails);
    }
  }
}

async function runAllValidationTests() {
  console.log('======================================================');
  console.log('  IDShield AI — Document Validation Engine Test Suite');
  console.log('======================================================');

  // Baseline standard valid specimen (Utopia sample)
  const createValidSpecimen = (): StructuredPassportInput => ({
    document_type: 'passport',
    fields: {
      full_name: { value: 'ERIKSSON, ANNA MARIA', confidence: 0.98 },
      passport_number: { value: 'L898902C3', confidence: 0.99 },
      nationality: { value: 'UTO', confidence: 0.99 },
      date_of_birth: { value: '1974-08-12', confidence: 0.95 },
      date_of_expiry: { value: '2028-04-15', confidence: 0.96 },
      gender: { value: 'F', confidence: 0.98 },
      issuing_country: { value: 'UTO', confidence: 0.99 },
    },
    mrz: {
      detected: true,
      format: 'TD3',
      line1: 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<',
      line2: 'L898902C36UTO7408122F2804154ZE184226B<<<<<18',
      parsed: {
        documentCode: 'P<',
        issuingState: 'UTO',
        surname: 'ERIKSSON',
        givenNames: 'ANNA MARIA',
        fullName: 'ERIKSSON, ANNA MARIA',
        passportNumber: 'L898902C3',
        nationality: 'UTO',
        dateOfBirth: '1974-08-12',
        rawDob: '740812',
        sex: 'F',
        expiryDate: '2028-04-15',
        rawExpiryDate: '280415',
        personalNumber: 'ZE184226B',
      },
      checksum_validation: {
        passport_number: true,
        date_of_birth: true,
        expiry_date: true,
        personal_number: true,
        composite: true,
        all_passed: true,
        details: {
          passportNumber: { expected: '6', actual: '6', valid: true },
          dateOfBirth: { expected: '2', actual: '2', valid: true },
          dateOfExpiry: { expected: '4', actual: '4', valid: true },
          personalNumber: { expected: '1', actual: '1', valid: true },
          composite: { expected: '8', actual: '8', valid: true },
        },
      },
    },
    consistency: {
      overallMatch: true,
      matchCount: 6,
      mismatchCount: 0,
      comparisons: [
        { field: 'passport_number', fieldLabel: 'Passport Number', ocrValue: 'L898902C3', mrzValue: 'L898902C3', status: 'MATCH', detail: 'Exact match' },
        { field: 'full_name', fieldLabel: 'Full Name', ocrValue: 'ERIKSSON, ANNA MARIA', mrzValue: 'ERIKSSON, ANNA MARIA', status: 'MATCH', detail: 'Exact match' },
        { field: 'nationality', fieldLabel: 'Nationality', ocrValue: 'UTO', mrzValue: 'UTO', status: 'MATCH', detail: 'Exact match' },
        { field: 'date_of_birth', fieldLabel: 'Date of Birth', ocrValue: '1974-08-12', mrzValue: '1974-08-12', status: 'MATCH', detail: 'Exact match' },
        { field: 'date_of_expiry', fieldLabel: 'Date of Expiry', ocrValue: '2028-04-15', mrzValue: '2028-04-15', status: 'MATCH', detail: 'Exact match' },
        { field: 'gender', fieldLabel: 'Gender', ocrValue: 'F', mrzValue: 'F', status: 'MATCH', detail: 'Exact match' },
      ],
      summary: 'All visual inspection fields match decoded MRZ tokens.',
    },
  });

  // ==========================================================
  // Group 1: Calendar Date Utilities & Edge Cases
  // ==========================================================
  console.log('\n--- Group 1: Calendar Date Utilities & Edge Cases ---');
  assert(isValidCalendarDate(2024, 2, 29) === true, 'Leap year Feb 29 (2024) is valid');
  assert(isValidCalendarDate(2023, 2, 29) === false, 'Non-leap year Feb 29 (2023) is invalid');
  assert(isValidCalendarDate(2000, 2, 29) === true, 'Century leap year Feb 29 (2000) is valid');
  assert(isValidCalendarDate(1900, 2, 29) === false, 'Century non-leap year Feb 29 (1900) is invalid');
  assert(isValidCalendarDate(2025, 4, 31) === false, 'April 31 is invalid (April has 30 days)');
  assert(isValidCalendarDate(2025, 13, 1) === false, 'Month 13 is invalid');
  assert(isValidCalendarDate(2025, 0, 10) === false, 'Month 0 is invalid');
  assert(isLeapYear(2024) === true, 'isLeapYear(2024) is true');
  assert(isLeapYear(2025) === false, 'isLeapYear(2025) is false');

  const p1 = parseAndValidateDate('1974-08-12');
  assert(p1.valid === true && p1.iso === '1974-08-12', 'parseAndValidateDate standard ISO date');

  const p2 = parseAndValidateDate('1990/02/30');
  assert(p2.valid === false, 'parseAndValidateDate rejects Feb 30');

  // ==========================================================
  // Group 2: Country Codes Registry
  // ==========================================================
  console.log('\n--- Group 2: Country Codes Registry ---');
  assert(isValidCountryCode('USA') === true, 'Country code USA recognized');
  assert(isValidCountryCode('GBR') === true, 'Country code GBR recognized');
  assert(isValidCountryCode('IND') === true, 'Country code IND recognized');
  assert(isValidCountryCode('UTO') === true, 'ICAO specimen code UTO recognized');
  assert(isValidCountryCode('D<<') === true, 'Special ICAO code D<< recognized');
  assert(isValidCountryCode('XYZ') === false, 'Invalid country code XYZ rejected');
  assert(isValidCountryCode('123') === false, 'Numeric country code 123 rejected');
  assert(isValidCountryCode('') === false, 'Empty country code rejected');

  // ==========================================================
  // Group 3: Passport Required Fields Rule
  // ==========================================================
  console.log('\n--- Group 3: Passport Required Fields Rule ---');
  const reqRule = new PassportRequiredFieldsRule();

  // 1. All fields present
  const fullSpecimen = createValidSpecimen();
  const resReqFull = reqRule.execute(fullSpecimen, DEFAULT_VALIDATION_CONFIG);
  assert(resReqFull.status === 'PASS', 'Required fields pass when all present');

  // 2. Missing passport number (Critical failure)
  const noDocNum = createValidSpecimen();
  noDocNum.fields.passport_number = { value: '' };
  if (noDocNum.mrz?.parsed) noDocNum.mrz.parsed.passportNumber = '';
  const resNoDoc = reqRule.execute(noDocNum, DEFAULT_VALIDATION_CONFIG);
  assert(resNoDoc.status === 'FAIL', 'Missing passport number triggers FAIL status');
  assert(resNoDoc.severity === 'HIGH', 'Missing passport number has HIGH severity');

  // 3. Missing full name (Important missing)
  const noName = createValidSpecimen();
  noName.fields.full_name = { value: '' };
  if (noName.mrz?.parsed) noName.mrz.parsed.fullName = '';
  const resNoName = reqRule.execute(noName, DEFAULT_VALIDATION_CONFIG);
  assert(resNoName.status === 'WARNING', 'Missing full name triggers WARNING status');

  // ==========================================================
  // Group 4: Passport Number Rule
  // ==========================================================
  console.log('\n--- Group 4: Passport Number Rule ---');
  const numRule = new PassportNumberRule();

  // 1. Valid alphanumeric
  const validNumDoc = createValidSpecimen();
  const resNumValid = numRule.execute(validNumDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNumValid.status === 'PASS', 'Valid alphanumeric passport number passes');

  // 2. Disallowed symbols
  const illegalCharDoc = createValidSpecimen();
  illegalCharDoc.fields.passport_number = { value: 'L89#902@3' };
  const resIllegal = numRule.execute(illegalCharDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resIllegal.status === 'FAIL', 'Passport number with illegal symbols rejected');

  // 3. Out-of-bounds length
  const shortDoc = createValidSpecimen();
  shortDoc.fields.passport_number = { value: 'P12' };
  const resShort = numRule.execute(shortDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resShort.status === 'WARNING', 'Short passport number (<6 chars) produces WARNING');

  // 4. Missing number
  const emptyNumDoc = createValidSpecimen();
  emptyNumDoc.fields.passport_number = { value: '' };
  if (emptyNumDoc.mrz?.parsed) emptyNumDoc.mrz.parsed.passportNumber = '';
  const resEmptyNum = numRule.execute(emptyNumDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resEmptyNum.status === 'FAIL', 'Empty passport number produces FAIL');

  // ==========================================================
  // Group 5: Date Validation & Chronology Rule
  // ==========================================================
  console.log('\n--- Group 5: Date Validation & Chronology Rule ---');
  const dateRule = new PassportDateRule();

  // 1. Valid DOB and Expiry
  const validDatesDoc = createValidSpecimen();
  const resDateValid = dateRule.execute(validDatesDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resDateValid.status === 'PASS', 'Valid DOB and Expiry dates pass');

  // 2. Future DOB
  const futureDobDoc = createValidSpecimen();
  futureDobDoc.fields.date_of_birth = { value: '2035-05-12' };
  const resFutureDob = dateRule.execute(futureDobDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: '2026-09-09',
  });
  assert(resFutureDob.status === 'FAIL', 'Future DOB fails with date rule');
  assert(resFutureDob.severity === 'HIGH', 'Future DOB has HIGH severity');

  // 3. Invalid calendar date in DOB (e.g. Feb 30)
  const invalidCalDoc = createValidSpecimen();
  invalidCalDoc.fields.date_of_birth = { value: '1985-02-30' };
  const resInvalidCal = dateRule.execute(invalidCalDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resInvalidCal.status === 'FAIL', 'Non-existent calendar date (Feb 30) fails');

  // 4. Chronological reversal (DOB after Expiry)
  const reversedDateDoc = createValidSpecimen();
  reversedDateDoc.fields.date_of_birth = { value: '2029-01-01' };
  reversedDateDoc.fields.date_of_expiry = { value: '2025-01-01' };
  const resReversed = dateRule.execute(reversedDateDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: '2030-01-01',
  });
  assert(resReversed.status === 'FAIL', 'DOB after Expiry date triggers chronological failure');

  // ==========================================================
  // Group 6: Expiry Horizon Rule
  // ==========================================================
  console.log('\n--- Group 6: Expiry Horizon Rule ---');
  const expiryRule = new PassportExpiryRule();
  const fixedToday = '2026-09-09';

  // 1. Valid future document (Expires 2028-04-15 > 180 days away)
  const activeExpDoc = createValidSpecimen();
  const resActiveExp = expiryRule.execute(activeExpDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: fixedToday,
  });
  assert(resActiveExp.status === 'PASS', 'Document expiring in 2028 is classified as VALID');

  // 2. Expiring soon (Expires in 60 days on 2026-11-08)
  const expiringSoonDoc = createValidSpecimen();
  expiringSoonDoc.fields.date_of_expiry = { value: '2026-11-08' };
  const resSoon = expiryRule.execute(expiringSoonDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: fixedToday,
    expiry_warning_days: 180,
  });
  assert(resSoon.status === 'WARNING', 'Document expiring in 60 days produces WARNING');
  assert((resSoon.evidence as any).state === 'EXPIRING_SOON', 'Evidence state is EXPIRING_SOON');

  // 3. Expired document (Expired 2025-01-01)
  const expiredDoc = createValidSpecimen();
  expiredDoc.fields.date_of_expiry = { value: '2025-01-01' };
  const resExpired = expiryRule.execute(expiredDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: fixedToday,
  });
  assert(resExpired.status === 'FAIL', 'Expired passport fails validation');
  assert((resExpired.evidence as any).state === 'EXPIRED', 'Evidence state is EXPIRED');

  // 4. Missing expiry
  const missingExpDoc = createValidSpecimen();
  missingExpDoc.fields.date_of_expiry = { value: '' };
  if (missingExpDoc.mrz?.parsed) missingExpDoc.mrz.parsed.expiryDate = '';
  const resNoExp = expiryRule.execute(missingExpDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNoExp.status === 'NOT_CHECKED', 'Missing expiry returns NOT_CHECKED');

  // ==========================================================
  // Group 7: Nationality Rule
  // ==========================================================
  console.log('\n--- Group 7: Nationality Rule ---');
  const natRule = new PassportNationalityRule();

  // 1. Recognized ISO code
  const validNatDoc = createValidSpecimen();
  const resNatValid = natRule.execute(validNatDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNatValid.status === 'PASS', 'Recognized country code UTO passes');

  // 2. Unrecognized code
  const invalidNatDoc = createValidSpecimen();
  invalidNatDoc.fields.nationality = { value: 'XYZ' };
  if (invalidNatDoc.mrz?.parsed) invalidNatDoc.mrz.parsed.nationality = 'XYZ';
  const resNatInvalid = natRule.execute(invalidNatDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNatInvalid.status === 'FAIL', 'Unrecognized country code XYZ fails');

  // 3. Missing nationality
  const emptyNatDoc = createValidSpecimen();
  emptyNatDoc.fields.nationality = { value: '' };
  if (emptyNatDoc.mrz?.parsed) emptyNatDoc.mrz.parsed.nationality = '';
  const resNatEmpty = natRule.execute(emptyNatDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNatEmpty.status === 'NOT_CHECKED', 'Empty nationality returns NOT_CHECKED');

  // ==========================================================
  // Group 8: Gender / Sex Normalization Rule
  // ==========================================================
  console.log('\n--- Group 8: Gender / Sex Normalization Rule ---');
  const genderRule = new PassportGenderRule();

  // 1. Standard 'F'
  const validGenderDoc = createValidSpecimen();
  const resGenValid = genderRule.execute(validGenderDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resGenValid.status === 'PASS', 'Standard code F passes');

  // 2. Word 'Female' normalized
  const femaleWordDoc = createValidSpecimen();
  femaleWordDoc.fields.gender = { value: 'FEMALE' };
  const resFem = genderRule.execute(femaleWordDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resFem.status === 'PASS', 'Word FEMALE is normalized to F');

  // 3. Unspecified '<' or 'X'
  const xGenderDoc = createValidSpecimen();
  xGenderDoc.fields.gender = { value: 'X' };
  const resX = genderRule.execute(xGenderDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resX.status === 'PASS', 'Non-binary code X passes');

  // 4. Invalid gender string
  const invalidGenDoc = createValidSpecimen();
  invalidGenDoc.fields.gender = { value: 'UNKNOWN_VALUE_123' };
  const resGenInvalid = genderRule.execute(invalidGenDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resGenInvalid.status === 'WARNING', 'Non-standard gender string triggers WARNING');

  // ==========================================================
  // Group 9: MRZ Checksum Rule Integration
  // ==========================================================
  console.log('\n--- Group 9: MRZ Checksum Rule Integration ---');
  const mrzRule = new PassportMrzChecksumRule();

  // 1. Valid checksums
  const validMrzDoc = createValidSpecimen();
  const resMrzValid = mrzRule.execute(validMrzDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resMrzValid.status === 'PASS', 'Valid 7-3-1 MRZ checksums pass');

  // 2. Corrupted checksums
  const corruptedMrzDoc = createValidSpecimen();
  if (corruptedMrzDoc.mrz?.checksum_validation) {
    corruptedMrzDoc.mrz.checksum_validation.passport_number = false;
    corruptedMrzDoc.mrz.checksum_validation.all_passed = false;
  }
  const resMrzCorrupt = mrzRule.execute(corruptedMrzDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resMrzCorrupt.status === 'FAIL', 'Failing MRZ checksum triggers FAIL status');
  assert(resMrzCorrupt.severity === 'HIGH', 'Failing MRZ checksum has HIGH severity');

  // 3. Missing MRZ
  const noMrzDoc = createValidSpecimen();
  noMrzDoc.mrz = { detected: false, raw: '' };
  const resNoMrz = mrzRule.execute(noMrzDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resNoMrz.status === 'NOT_CHECKED', 'Missing MRZ returns NOT_CHECKED');

  // ==========================================================
  // Group 10: OCR ↔ MRZ Consistency Integration Rule
  // ==========================================================
  console.log('\n--- Group 10: OCR ↔ MRZ Consistency Integration Rule ---');
  const consistRule = new PassportOcrMrzConsistencyRule();

  // 1. Full match
  const matchDoc = createValidSpecimen();
  const resMatch = consistRule.execute(matchDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resMatch.status === 'PASS', '100% OCR vs MRZ match passes');

  // 2. Mismatch (e.g. DOB discrepancy)
  const mismatchDoc = createValidSpecimen();
  mismatchDoc.consistency = {
    overallMatch: false,
    matchCount: 5,
    mismatchCount: 1,
    comparisons: [
      { field: 'date_of_birth', fieldLabel: 'Date of Birth', ocrValue: '1974-08-12', mrzValue: '1984-08-12', status: 'MISMATCH', detail: 'Visual DOB differs from MRZ DOB' },
    ],
    summary: 'Visual DOB differs from MRZ encoded DOB.',
  };
  const resMismatch = consistRule.execute(mismatchDoc, DEFAULT_VALIDATION_CONFIG);
  assert(resMismatch.status === 'WARNING', 'OCR/MRZ mismatch produces WARNING (anomaly signal)');

  // ==========================================================
  // Group 11: Cross-Field Deterministic Rule
  // ==========================================================
  console.log('\n--- Group 11: Cross-Field Deterministic Rule ---');
  const crossRule = new PassportCrossFieldRule();

  // 1. Valid cross-fields
  const validCrossDoc = createValidSpecimen();
  const resCrossValid = crossRule.execute(validCrossDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: fixedToday,
  });
  assert(resCrossValid.status === 'PASS', 'Valid cross-field relationships pass');

  // 2. Issue date after expiry date
  const badIssueDoc = createValidSpecimen();
  badIssueDoc.fields.issue_date = { value: '2029-01-01' };
  badIssueDoc.fields.date_of_expiry = { value: '2028-01-01' };
  const resBadIssue = crossRule.execute(badIssueDoc, {
    ...DEFAULT_VALIDATION_CONFIG,
    reference_date: fixedToday,
  });
  assert(resBadIssue.status === 'FAIL', 'Issue date after Expiry date fails cross-field check');

  // ==========================================================
  // Group 12: Validation Engine Aggregator & Summary
  // ==========================================================
  console.log('\n--- Group 12: Validation Engine Aggregator & Summary ---');
  const engine = new ValidationEngine();

  // 1. Clean genuine specimen -> VALID
  const cleanDoc = createValidSpecimen();
  const summaryClean = await engine.validatePassport(cleanDoc, {
    configOverride: { reference_date: fixedToday },
  });
  assert(summaryClean.overall_status === 'VALID', 'Clean document receives overall_status VALID');
  assert(summaryClean.failed === 0, 'Clean document has 0 failed rules');
  assert(summaryClean.passed >= 8, `Clean document passed ${summaryClean.passed} rules`);

  // 2. Specimen with warning (expiring soon) -> WARNING
  const soonDoc = createValidSpecimen();
  soonDoc.fields.date_of_expiry = { value: '2026-11-01' };
  if (soonDoc.mrz?.parsed) soonDoc.mrz.parsed.expiryDate = '2026-11-01';
  const summarySoon = await engine.validatePassport(soonDoc, {
    configOverride: { reference_date: fixedToday, expiry_warning_days: 180 },
  });
  assert(summarySoon.overall_status === 'WARNING', 'Expiring-soon document receives overall_status WARNING');
  assert(summarySoon.warnings > 0, 'Expiring-soon document has warnings > 0');

  // 3. Specimen with failure (bad checksum + invalid doc num) -> INVALID
  const invalidDoc = createValidSpecimen();
  invalidDoc.fields.passport_number = { value: 'L89#902@3' };
  if (invalidDoc.mrz?.checksum_validation) {
    invalidDoc.mrz.checksum_validation.passport_number = false;
    invalidDoc.mrz.checksum_validation.all_passed = false;
  }
  const summaryInvalid = await engine.validatePassport(invalidDoc, {
    configOverride: { reference_date: fixedToday },
  });
  assert(summaryInvalid.overall_status === 'INVALID', 'Tampered/invalid specimen receives overall_status INVALID');
  assert(summaryInvalid.failed > 0, 'Invalid document has failed > 0');

  // 4. Empty/Incomplete payload -> INCOMPLETE
  const emptyDoc: StructuredPassportInput = {
    document_type: 'passport',
    fields: {},
  };
  const summaryEmpty = await engine.validatePassport(emptyDoc);
  assert(summaryEmpty.overall_status === 'INCOMPLETE', 'Empty document payload receives overall_status INCOMPLETE');

  console.log('======================================================');
  console.log(`  Validation Suite Execution: ${passedTests}/${totalTests} PASSED (${failedTests} failed)`);
  console.log('======================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAllValidationTests().catch((err) => {
  console.error('Fatal error running validation test suite:', err);
  process.exit(1);
});
