import { MrzParsedData } from './types';

/**
 * Converts a 6-character MRZ date string (YYMMDD) into an ISO standard YYYY-MM-DD date.
 * Uses current calendar horizon heuristics to determine century.
 */
export function parseMrzDate(yymmdd: string, isExpiry: boolean = false): { isoDate: string; raw: string; isValid: boolean } {
  const clean = (yymmdd || '').replace(/[^0-9]/g, '').padStart(6, '0').slice(0, 6);
  if (clean.length < 6) {
    return { isoDate: 'INVALID_DATE', raw: yymmdd, isValid: false };
  }

  const yy = parseInt(clean.substring(0, 2), 10);
  const mm = parseInt(clean.substring(2, 4), 10);
  const dd = parseInt(clean.substring(4, 6), 10);

  // Validate month and day bounds
  if (isNaN(yy) || isNaN(mm) || isNaN(dd) || mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return { isoDate: 'INVALID_DATE', raw: clean, isValid: false };
  }

  const currentFullYear = new Date().getFullYear(); // e.g. 2026
  const currentTwoDigitYear = currentFullYear % 100; // e.g. 26

  let century: number;
  if (isExpiry) {
    // Expiry dates are typically within 0-25 years in the future, rarely 50
    // If yy is within 50 years after current year, assume 2000s, else 1900s
    if (yy <= (currentTwoDigitYear + 50) % 100) {
      century = 2000;
    } else {
      century = 1900;
    }
  } else {
    // Date of Birth: If yy > current two digit year, it is in 1900s; otherwise 2000s
    if (yy > currentTwoDigitYear) {
      century = 1900;
    } else {
      century = 2000;
    }
  }

  const fullYear = century + yy;
  const formattedMm = String(mm).padStart(2, '0');
  const formattedDd = String(dd).padStart(2, '0');
  const isoDate = `${fullYear}-${formattedMm}-${formattedDd}`;

  return { isoDate, raw: clean, isValid: true };
}

/**
 * Normalizes and extracts name fields from ICAO Line 1.
 * Standard ICAO format: `SURNAME<<GIVEN<NAMES<<<<<<<`
 */
export function parseIcaoNameField(rawNameBlock: string): { surname: string; givenNames: string; fullName: string } {
  if (!rawNameBlock) {
    return { surname: '', givenNames: '', fullName: '' };
  }

  const parts = rawNameBlock.split('<<');
  const rawSurname = parts[0] || '';
  const rawGivenNames = parts.slice(1).join(' ');

  const surname = rawSurname.replace(/</g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  const givenNames = rawGivenNames.replace(/</g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();

  let fullName = '';
  if (surname && givenNames) {
    fullName = `${surname}, ${givenNames}`;
  } else if (surname) {
    fullName = surname;
  } else if (givenNames) {
    fullName = givenNames;
  }

  return { surname, givenNames, fullName };
}

/**
 * Deterministically parses standard ICAO TD3 passport MRZ lines.
 *
 * TD3 Line 1:
 * P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<
 *
 * TD3 Line 2:
 * L898902C36UTO7408122F2804154ZE184226B<<<<<10
 */
export function parseTd3Mrz(line1: string, line2: string): MrzParsedData {
  const cleanLine1 = line1.replace(/[^A-Z0-9<]/gi, '').toUpperCase().padEnd(44, '<').slice(0, 44);
  const cleanLine2 = line2.replace(/[^A-Z0-9<]/gi, '').toUpperCase().padEnd(44, '<').slice(0, 44);

  // Line 1 breakdown
  const documentCode = cleanLine1.substring(0, 2);
  const issuingState = cleanLine1.substring(2, 5).replace(/</g, '').trim();
  const rawNameBlock = cleanLine1.substring(5, 44);
  const { surname, givenNames, fullName } = parseIcaoNameField(rawNameBlock);

  // Line 2 breakdown
  const rawPassportNumber = cleanLine2.substring(0, 9);
  const passportNumber = rawPassportNumber.replace(/</g, '').trim();
  const passportNumberCheck = cleanLine2.charAt(9);

  const nationality = cleanLine2.substring(10, 13).replace(/</g, '').trim();

  const rawDob = cleanLine2.substring(13, 19);
  const dobCheck = cleanLine2.charAt(19);
  const parsedDob = parseMrzDate(rawDob, false);

  const rawSexChar = cleanLine2.charAt(20);
  let sex: 'M' | 'F' | 'X' | '<' | 'UNKNOWN' = 'UNKNOWN';
  if (rawSexChar === 'M') sex = 'M';
  else if (rawSexChar === 'F') sex = 'F';
  else if (rawSexChar === 'X') sex = 'X';
  else if (rawSexChar === '<') sex = '<';

  const rawExpiryDate = cleanLine2.substring(21, 27);
  const expiryCheck = cleanLine2.charAt(27);
  const parsedExpiry = parseMrzDate(rawExpiryDate, true);

  const rawPersonalNumber = cleanLine2.substring(28, 42);
  const personalNumber = rawPersonalNumber.replace(/</g, '').trim();
  const personalNumberCheck = cleanLine2.charAt(42);

  const compositeCheck = cleanLine2.charAt(43);

  return {
    format: 'TD3',
    documentCode,
    issuingState,
    surname,
    givenNames,
    fullName,
    passportNumber,
    nationality,
    dateOfBirth: parsedDob.isoDate,
    rawDob,
    sex,
    expiryDate: parsedExpiry.isoDate,
    rawExpiryDate,
    personalNumber,
    rawCheckDigits: {
      passportNumberCheck,
      dobCheck,
      expiryCheck,
      personalNumberCheck,
      compositeCheck,
    },
  };
}
