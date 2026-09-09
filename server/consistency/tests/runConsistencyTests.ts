/**
 * IDShield AI — Cross-Document Consistency Engine Test Suite
 */

import { CrossDocumentConsistencyEngine } from '../engine';
import {
  normalizeNameString,
  normalizeDocumentNumber,
  normalizeGender,
  buildNormalizedIdentityProfile,
} from '../normalizer';
import { CaseDocumentInput, ScreeningCaseInput } from '../types';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ [PASS] ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ [FAIL] ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

console.log('======================================================');
console.log('  IDShield AI — Cross-Document Consistency Test Suite');
console.log('======================================================');

const engine = new CrossDocumentConsistencyEngine();

// --- Group 1: Identity Normalization ---
console.log('\n--- Group 1: Identity Normalization ---');

const norm1 = normalizeNameString('JOHN DOE');
const norm2 = normalizeNameString('John Doe');
const norm3 = normalizeNameString('DOE<<JOHN<<<<<<<<<<<<<<<<<<');
assert(norm1.normalized === 'JOHN DOE', 'Uppercase name normalized correctly');
assert(norm2.normalized === 'JOHN DOE', 'Mixed-case name normalized to uppercase');
assert(norm3.tokens.includes('DOE') && norm3.tokens.includes('JOHN'), 'MRZ name with filler characters parsed to tokens');

const docNum1 = normalizeDocumentNumber('A 123-4567');
const docNum2 = normalizeDocumentNumber('a1234567');
assert(docNum1 === 'A1234567', 'Document number strips spaces and dashes');
assert(docNum2 === 'A1234567', 'Document number converts to uppercase');

assert(normalizeGender('M') === 'M', 'Gender M normalized');
assert(normalizeGender('Female') === 'F', 'Gender Female normalized to F');
assert(normalizeGender('Non-Binary') === 'X', 'Gender Non-Binary normalized to X');
assert(normalizeGender('') === null, 'Empty gender returns null');

// --- Group 2: Matching Passport ↔ Visa ---
console.log('\n--- Group 2: Matching Passport ↔ Visa ---');

const matchingCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-001',
  primary_document: {
    document_id: 'DOC-P1',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'JOHN DOE',
      passport_number: 'A1234567',
      date_of_birth: '1990-05-15',
      nationality: 'IND',
      gender: 'M',
      issue_date: '2020-01-10',
      expiry_date: '2030-01-09',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V1',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'John Doe',
        associated_passport_number: 'A1234567',
        date_of_birth: '1990-05-15',
        nationality: 'IND',
        gender: 'M',
        issue_date: '2021-06-01',
        expiry_date: '2026-05-31',
      },
    },
  ],
};

const resultMatching = engine.evaluateCase(matchingCase);
assert(resultMatching.overall_status === 'CONSISTENT', 'Matching Passport + Visa receives CONSISTENT status');
assert(resultMatching.summary.mismatches === 0, 'Matching case has 0 mismatches');
assert(resultMatching.summary.matches >= 5, 'Matching case has at least 5 matching fields');
assert(resultMatching.documents_compared === 2, 'Documents compared count is 2');

// --- Group 3: DOB Mismatch Detection ---
console.log('\n--- Group 3: DOB Mismatch Detection ---');

const dobMismatchCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-002',
  primary_document: {
    document_id: 'DOC-P2',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'JOHN DOE',
      passport_number: 'A1234567',
      date_of_birth: '1999-04-12',
      nationality: 'IND',
      gender: 'M',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V2',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'JOHN DOE',
        associated_passport_number: 'A1234567',
        date_of_birth: '1989-04-12',
        nationality: 'IND',
        gender: 'M',
      },
    },
  ],
};

const resultDobMismatch = engine.evaluateCase(dobMismatchCase);
assert(resultDobMismatch.overall_status === 'REVIEW_REQUIRED', 'DOB mismatch triggers REVIEW_REQUIRED status');
assert(resultDobMismatch.summary.mismatches > 0, 'DOB mismatch increments mismatch count');
const dobComparison = resultDobMismatch.comparisons.find((c) => c.field === 'date_of_birth');
assert(dobComparison?.status === 'MISMATCH', 'Date of birth comparison status is MISMATCH');
assert(dobComparison?.severity === 'HIGH', 'Date of birth mismatch is HIGH severity');
assert(dobComparison?.explanation.includes('1999-04-12') && dobComparison?.explanation.includes('1989-04-12'), 'DOB explanation contains specific factual dates');

// --- Group 4: Passport Number Linkage Mismatch ---
console.log('\n--- Group 4: Passport Number Linkage Mismatch ---');

const passportMismatchCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-003',
  primary_document: {
    document_id: 'DOC-P3',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'ALICE SMITH',
      passport_number: 'A1234567',
      date_of_birth: '1985-11-20',
      nationality: 'GBR',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V3',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'ALICE SMITH',
        associated_passport_number: 'A7654321', // Different passport number
        date_of_birth: '1985-11-20',
        nationality: 'GBR',
      },
    },
  ],
};

const resultPassportMismatch = engine.evaluateCase(passportMismatchCase);
assert(resultPassportMismatch.overall_status === 'REVIEW_REQUIRED', 'Passport number mismatch triggers REVIEW_REQUIRED');
const passComp = resultPassportMismatch.comparisons.find((c) => c.field === 'passport_number');
assert(passComp?.status === 'MISMATCH', 'Passport number comparison status is MISMATCH');
assert(passComp?.severity === 'HIGH', 'Passport number mismatch has HIGH severity');
assert(passComp?.explanation.includes('A1234567') && passComp?.explanation.includes('A7654321'), 'Explanation cites both passport numbers');

// --- Group 5: Nationality Mismatch ---
console.log('\n--- Group 5: Nationality Mismatch ---');

const nationalityMismatchCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-004',
  primary_document: {
    document_id: 'DOC-P4',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'RAJESH PATEL',
      passport_number: 'N8899001',
      date_of_birth: '1988-03-03',
      nationality: 'IND',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V4',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'RAJESH PATEL',
        associated_passport_number: 'N8899001',
        date_of_birth: '1988-03-03',
        nationality: 'USA',
      },
    },
  ],
};

const resultNat = engine.evaluateCase(nationalityMismatchCase);
const natComp = resultNat.comparisons.find((c) => c.field === 'nationality');
assert(natComp?.status === 'MISMATCH', 'Nationality mismatch is flagged as MISMATCH');
assert(natComp?.severity === 'MEDIUM', 'Nationality mismatch default severity is MEDIUM');
assert(natComp?.explanation.includes('IND') && natComp?.explanation.includes('USA'), 'Nationality explanation details codes');

// --- Group 6: Gender Consistency & Missing Field Handling ---
console.log('\n--- Group 6: Gender Consistency & Missing Field Handling ---');

const genderMismatchCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-005',
  primary_document: {
    document_id: 'DOC-P5',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'MORGAN LEE',
      passport_number: 'K3344552',
      gender: 'M',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V5',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'MORGAN LEE',
        associated_passport_number: 'K3344552',
        gender: 'F',
      },
    },
  ],
};

const resultGender = engine.evaluateCase(genderMismatchCase);
const genderComp = resultGender.comparisons.find((c) => c.field === 'gender');
assert(genderComp?.status === 'MISMATCH', 'Gender M vs F results in MISMATCH');

const missingGenderCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-006',
  primary_document: {
    document_id: 'DOC-P6',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'MORGAN LEE',
      passport_number: 'K3344552',
      gender: 'M',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V6',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'MORGAN LEE',
        associated_passport_number: 'K3344552',
        // gender not present on visa
      },
    },
  ],
};

const resultMissingGender = engine.evaluateCase(missingGenderCase);
const missingGenderComp = resultMissingGender.comparisons.find((c) => c.field === 'gender');
assert(missingGenderComp?.status === 'NOT_AVAILABLE', 'Missing gender on one document returns NOT_AVAILABLE without generating false mismatch');

// --- Group 7: Name Formatting & Ambiguous Names ---
console.log('\n--- Group 7: Name Formatting & Ambiguous Names ---');

// Reordered name tokens ("DOE, JOHN" vs "JOHN DOE")
const reorderedCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-007',
  primary_document: {
    document_id: 'DOC-P7',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'DOE, JOHN',
      passport_number: 'A1122334',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V7',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'JOHN DOE',
        associated_passport_number: 'A1122334',
      },
    },
  ],
};

const resultReordered = engine.evaluateCase(reorderedCase);
const reorderedComp = resultReordered.comparisons.find((c) => c.field === 'full_name');
assert(reorderedComp?.status === 'MATCH', 'Reordered name tokens match cleanly');

// Middle name omitted (e.g. "ANNA MARIA ERIKSSON" vs "ANNA ERIKSSON")
const middleNameOmittedCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-008',
  primary_document: {
    document_id: 'DOC-P8',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'ERIKSSON, ANNA MARIA',
      passport_number: 'L898902C3',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V8',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'ANNA ERIKSSON',
        associated_passport_number: 'L898902C3',
      },
    },
  ],
};

const resultMiddleName = engine.evaluateCase(middleNameOmittedCase);
const nameCompMiddle = resultMiddleName.comparisons.find((c) => c.field === 'full_name');
assert(nameCompMiddle?.status === 'REVIEW_REQUIRED', 'Middle name omission flagged as REVIEW_REQUIRED');

// Completely distinct names ("JOHN DOE" vs "JONATHAN SMITH")
const distinctNameCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-009',
  primary_document: {
    document_id: 'DOC-P9',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'JOHN DOE',
      passport_number: 'A1122334',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V9',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'JONATHAN SMITH',
        associated_passport_number: 'A1122334',
      },
    },
  ],
};

const resultDistinct = engine.evaluateCase(distinctNameCase);
const distinctNameComp = resultDistinct.comparisons.find((c) => c.field === 'full_name');
assert(distinctNameComp?.status === 'MISMATCH', 'Completely distinct names produce MISMATCH');
assert(distinctNameComp?.severity === 'HIGH', 'Distinct name mismatch has HIGH severity');

// --- Group 8: Date Chronology & Validity Relationships ---
console.log('\n--- Group 8: Date Chronology & Validity Relationships ---');

// Visa issued BEFORE passport
const visaIssuedBeforePassportCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-010',
  primary_document: {
    document_id: 'DOC-P10',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'CLARA OSWALD',
      passport_number: 'P9988776',
      issue_date: '2023-01-01',
      expiry_date: '2033-01-01',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V10',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'CLARA OSWALD',
        associated_passport_number: 'P9988776',
        issue_date: '2021-01-01', // Precedes passport issue
        expiry_date: '2025-01-01',
      },
    },
  ],
};

const resultChrono = engine.evaluateCase(visaIssuedBeforePassportCase);
const chronoComp = resultChrono.comparisons.find((c) => c.field === 'validity_chronology');
assert(chronoComp?.status === 'REVIEW_REQUIRED', 'Visa issued before passport issue date raises REVIEW_REQUIRED');

// --- Group 9: Multi-Document Cases (Passport + Visa + Permit) ---
console.log('\n--- Group 9: Multi-Document Cases (Passport + Visa + Permit) ---');

const multiDocCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-011',
  primary_document: {
    document_id: 'DOC-P11',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'ELENA ROSTOVA',
      passport_number: 'R5544332',
      date_of_birth: '1994-08-22',
      nationality: 'UTO',
      gender: 'F',
    },
  },
  supporting_documents: [
    {
      document_id: 'DOC-V11',
      document_type: 'visa',
      extracted_fields: {
        full_name: 'ELENA ROSTOVA',
        associated_passport_number: 'R5544332',
        date_of_birth: '1994-08-22',
        nationality: 'UTO',
        gender: 'F',
      },
    },
    {
      document_id: 'DOC-PERMIT-11',
      document_type: 'permit',
      extracted_fields: {
        full_name: 'ELENA ROSTOVA',
        document_number: 'PERMIT-9988',
        associated_passport_number: 'R5544332',
        date_of_birth: '1994-08-22',
        nationality: 'UTO',
        gender: 'F',
      },
    },
  ],
};

const resultMulti = engine.evaluateCase(multiDocCase);
assert(resultMulti.documents_compared === 3, 'Multi-document case correctly registers 3 documents');
assert(resultMulti.overall_status === 'CONSISTENT', 'Consistent 3-document case receives CONSISTENT status');
assert(resultMulti.document_pairs.length === 3, 'Constructs 3 pairwise comparisons without duplicates (P-V, P-Permit, V-Permit)');

// --- Group 10: Single-Document / Passport-Only Case ---
console.log('\n--- Group 10: Single-Document / Passport-Only Case ---');

const singleDocCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-012',
  primary_document: {
    document_id: 'DOC-P12',
    document_type: 'passport',
    extracted_fields: {
      full_name: 'LONE TRAVELER',
      passport_number: 'L0001112',
    },
  },
  supporting_documents: [],
};

const resultSingle = engine.evaluateCase(singleDocCase);
assert(resultSingle.overall_status === 'NOT_APPLICABLE', 'Single document case returns NOT_APPLICABLE');
assert(resultSingle.documents_compared === 1, 'Single document case documents_compared is 1');
assert(resultSingle.comparisons.length === 0, 'No comparisons executed for single document');

// --- Group 11: Invalid / Empty Input Handling ---
console.log('\n--- Group 11: Invalid / Empty Input Handling ---');

const emptyCase: ScreeningCaseInput = {
  case_id: 'CASE-TEST-013',
  primary_document: null as any,
  supporting_documents: [],
};

const resultEmpty = engine.evaluateCase(emptyCase);
assert(resultEmpty.overall_status === 'NOT_APPLICABLE', 'Empty screening case handled safely');
assert(resultEmpty.documents_compared === 0, 'Empty case documents_compared is 0');

console.log('======================================================');
console.log(`  Cross-Document Consistency Suite Execution: ${passedTests}/${totalTests} PASSED (${failedTests} failed)`);
console.log('======================================================');

if (failedTests > 0) {
  process.exit(1);
}
