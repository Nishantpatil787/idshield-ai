/**
 * IDShield AI — Cross-Document Identity Profile Normalizer
 */

import { CaseDocumentInput, NormalizedIdentityProfile } from './types';
import { parseAndValidateDate } from '../validation/utils/dateUtils';
import { normalizeCountryCode } from '../validation/utils/countryCodes';

/**
 * Normalizes name strings by stripping excess whitespace, uppercase conversion,
 * and handling ICAO MRZ filler characters ('<').
 */
export function normalizeNameString(name?: string | null): {
  normalized: string | null;
  surname: string | null;
  givenNames: string | null;
  tokens: string[];
} {
  if (!name || typeof name !== 'string') {
    return { normalized: null, surname: null, givenNames: null, tokens: [] };
  }

  // Replace '<' with spaces, strip punctuation other than commas/hyphens, normalize whitespace
  let cleaned = name.toUpperCase().replace(/</g, ' ').replace(/[^\p{L}\s,-]/gu, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (!cleaned) {
    return { normalized: null, surname: null, givenNames: null, tokens: [] };
  }

  let surname: string | null = null;
  let givenNames: string | null = null;

  if (cleaned.includes(',')) {
    const parts = cleaned.split(',').map((p) => p.trim()).filter(Boolean);
    surname = parts[0] || null;
    givenNames = parts.slice(1).join(' ') || null;
  }

  // Extract individual alphabetic tokens (filter out single char symbols if any)
  const tokens = cleaned
    .replace(/,/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    normalized: cleaned,
    surname,
    givenNames,
    tokens,
  };
}

/**
 * Normalizes document numbers (passport numbers, visa numbers, national IDs)
 */
export function normalizeDocumentNumber(docNum?: string | null): string | null {
  if (!docNum || typeof docNum !== 'string') return null;
  const cleaned = docNum.toUpperCase().replace(/[^A-Z0-9]/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

/**
 * Normalizes gender/sex tokens into ICAO Doc 9303 standards ('M', 'F', 'X', '<')
 */
export function normalizeGender(gender?: string | null): 'M' | 'F' | 'X' | '<' | null {
  if (!gender || typeof gender !== 'string') return null;
  const clean = gender.trim().toUpperCase();

  if (clean === 'M' || clean === 'MALE' || clean === 'MASCULIN' || clean === 'HOMBRE') return 'M';
  if (clean === 'F' || clean === 'FEMALE' || clean === 'FEMININ' || clean === 'MUJER') return 'F';
  if (clean === 'X' || clean === 'NON-BINARY' || clean === 'OTHER' || clean === 'UNSPECIFIED') return 'X';
  if (clean === '<' || clean === 'U' || clean === 'UNKNOWN') return '<';

  return null;
}

/**
 * Builds a NormalizedIdentityProfile from a raw CaseDocumentInput
 */
export function buildNormalizedIdentityProfile(doc: CaseDocumentInput): NormalizedIdentityProfile {
  const fields = doc.extracted_fields || {};
  const mrzParsed = doc.mrz_data?.parsed;

  // Name resolution
  const rawName = fields.full_name || (fields.surname && fields.given_names ? `${fields.surname}, ${fields.given_names}` : null) || mrzParsed?.fullName || mrzParsed?.surname;
  const nameNorm = normalizeNameString(rawName);

  // Passport Number / Document Number resolution
  const docNum = normalizeDocumentNumber(fields.passport_number || fields.document_number || mrzParsed?.passportNumber);
  const assocPassportNum = normalizeDocumentNumber(fields.associated_passport_number || (doc.document_type === 'visa' ? fields.passport_number : null));

  // Date of Birth resolution
  const rawDob = fields.date_of_birth || mrzParsed?.dateOfBirth;
  const parsedDob = rawDob ? parseAndValidateDate(rawDob) : null;

  // Nationality resolution
  const rawNat = fields.nationality || fields.issuing_country || mrzParsed?.nationality || mrzParsed?.issuingState;
  const normNat = rawNat ? normalizeCountryCode(rawNat) : null;

  // Gender resolution
  const rawGender = fields.gender || mrzParsed?.sex;
  const normGender = normalizeGender(rawGender);

  // Validity Dates
  const rawIssue = fields.issue_date;
  const parsedIssue = rawIssue ? parseAndValidateDate(rawIssue) : null;

  const rawExpiry = fields.date_of_expiry || fields.expiry_date || mrzParsed?.expiryDate;
  const parsedExpiry = rawExpiry ? parseAndValidateDate(rawExpiry) : null;

  return {
    document_id: doc.document_id,
    document_type: doc.document_type,
    role: doc.role || (doc.document_type === 'passport' ? 'primary' : 'supporting'),
    label: doc.label || `${doc.document_type.toUpperCase()} (${doc.document_id})`,
    name: {
      raw: rawName,
      normalized: nameNorm.normalized,
      surname: nameNorm.surname || (mrzParsed?.surname ? normalizeNameString(mrzParsed.surname).normalized : null),
      given_names: nameNorm.givenNames || (mrzParsed?.givenNames ? normalizeNameString(mrzParsed.givenNames).normalized : null),
      tokens: nameNorm.tokens,
    },
    passport_number: doc.document_type === 'passport' ? docNum : null,
    associated_passport_number: assocPassportNum,
    document_number: docNum,
    date_of_birth: {
      raw: rawDob || null,
      iso: parsedDob?.valid ? parsedDob.iso : null,
      year: parsedDob?.valid ? parsedDob.year : null,
      month: parsedDob?.valid ? parsedDob.month : null,
      day: parsedDob?.valid ? parsedDob.day : null,
    },
    nationality: {
      raw: rawNat || null,
      code3: normNat,
    },
    gender: {
      raw: rawGender || null,
      standard: normGender,
    },
    validity: {
      issue_date: parsedIssue?.valid ? parsedIssue.iso : null,
      expiry_date: parsedExpiry?.valid ? parsedExpiry.iso : null,
    },
  };
}
