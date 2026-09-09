import { MrzCheckDigits, MrzChecksumValidation } from './types';

/**
 * ICAO Doc 9303 7-3-1 Weight Cycle Constants
 */
export const ICAO_WEIGHTS = [7, 3, 1] as const;

/**
 * Maps ICAO MRZ characters to their standardized numeric values:
 * 0-9 -> 0-9
 * A-Z -> 10-35
 * < (filler) -> 0
 */
export function getIcaoCharacterValue(char: string): number {
  if (!char) return 0;
  const upper = char.toUpperCase();
  const code = upper.charCodeAt(0);

  // '0' to '9'
  if (code >= 48 && code <= 57) {
    return code - 48;
  }
  // 'A' to 'Z'
  if (code >= 65 && code <= 90) {
    return code - 55; // 'A' (65) -> 10, 'Z' (90) -> 35
  }
  // Filler '<' or any other non-alphanumeric character is treated as 0
  return 0;
}

/**
 * Computes ICAO 9303 check digit for an input string using 7-3-1 weighting.
 * @param input Raw alphanumeric string
 * @returns Expected single check digit character ('0'-'9')
 */
export function calculateIcaoCheckDigit(input: string): string {
  if (!input) return '0';

  let total = 0;
  for (let i = 0; i < input.length; i++) {
    const weight = ICAO_WEIGHTS[i % 3];
    const val = getIcaoCharacterValue(input[i]);
    total += val * weight;
  }

  const remainder = total % 10;
  return remainder.toString();
}

/**
 * Validates a value against its given check digit.
 * Note: For personal number fields, if the field is all fillers '<' and check digit is '<' or '0', it is considered valid.
 */
export function verifyIcaoCheckDigit(
  data: string,
  checkDigit: string,
  isOptionalField: boolean = false
): { expected: string; actual: string; valid: boolean } {
  const actual = (checkDigit || '<').trim().toUpperCase();
  const expected = calculateIcaoCheckDigit(data);

  // Handle empty / filler optional field check digits
  if (isOptionalField) {
    const isDataAllFillers = data.replace(/</g, '').trim().length === 0;
    if (isDataAllFillers && (actual === '<' || actual === '0' || actual === expected)) {
      return { expected, actual, valid: true };
    }
  }

  const valid = actual === expected;
  return { expected, actual, valid };
}

/**
 * Validates all TD3 passport check digits deterministically according to ICAO Doc 9303.
 *
 * TD3 Line 2 format (44 chars):
 * Pos 1-9   (idx 0..8):   Passport Number (9)
 * Pos 10    (idx 9):      Passport Number Check Digit (1)
 * Pos 11-13 (idx 10..12): Nationality (3)
 * Pos 14-19 (idx 13..18): Date of Birth YYMMDD (6)
 * Pos 20    (idx 19):     DOB Check Digit (1)
 * Pos 21    (idx 20):     Sex (1)
 * Pos 22-27 (idx 21..26): Expiry Date YYMMDD (6)
 * Pos 28    (idx 27):     Expiry Date Check Digit (1)
 * Pos 29-42 (idx 28..41): Optional / Personal Number (14)
 * Pos 43    (idx 42):     Personal Number Check Digit (1)
 * Pos 44    (idx 43):     Composite Check Digit (1)
 */
export function validateTd3Checksums(line2: string): MrzChecksumValidation {
  // Normalize length to 44 characters (pad with '<' if shorter)
  const paddedLine = line2.padEnd(44, '<').substring(0, 44).toUpperCase();

  const docNumberPart = paddedLine.substring(0, 9);
  const docNumberCheck = paddedLine.charAt(9);

  const dobPart = paddedLine.substring(13, 19);
  const dobCheck = paddedLine.charAt(19);

  const expiryPart = paddedLine.substring(21, 27);
  const expiryCheck = paddedLine.charAt(27);

  const personalNumberPart = paddedLine.substring(28, 42);
  const personalNumberCheck = paddedLine.charAt(42);

  const compositeCheck = paddedLine.charAt(43);

  // Composite check data: Line 2 positions 1-10 + 14-20 + 22-43 (indices 0..9 + 13..19 + 21..42)
  const compositeData =
    paddedLine.substring(0, 10) +
    paddedLine.substring(13, 20) +
    paddedLine.substring(21, 43);

  const docCheckResult = verifyIcaoCheckDigit(docNumberPart, docNumberCheck);
  const dobCheckResult = verifyIcaoCheckDigit(dobPart, dobCheck);
  const expiryCheckResult = verifyIcaoCheckDigit(expiryPart, expiryCheck);
  const personalCheckResult = verifyIcaoCheckDigit(personalNumberPart, personalNumberCheck, true);
  const compositeCheckResult = verifyIcaoCheckDigit(compositeData, compositeCheck);

  const all_passed =
    docCheckResult.valid &&
    dobCheckResult.valid &&
    expiryCheckResult.valid &&
    personalCheckResult.valid &&
    compositeCheckResult.valid;

  return {
    passport_number: docCheckResult.valid,
    date_of_birth: dobCheckResult.valid,
    expiry_date: expiryCheckResult.valid,
    personal_number: personalCheckResult.valid,
    composite: compositeCheckResult.valid,
    all_passed,
    details: {
      passportNumber: docCheckResult,
      dateOfBirth: dobCheckResult,
      dateOfExpiry: expiryCheckResult,
      personalNumber: personalCheckResult,
      composite: compositeCheckResult,
    },
  };
}
