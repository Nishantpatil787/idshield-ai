import {
  ExtractedPassportFields,
  MrzDetectionResult,
  ConsistencyComparisonItem,
  ConsistencyCheckResult,
  ConsistencyMatchStatus,
} from './types';

/**
 * Normalizes an alphanumeric string for comparison: removes punctuation, spaces, and lowercase.
 */
function normalizeAlphanumeric(val: string | null | undefined): string {
  if (!val) return '';
  return val.replace(/[^A-Z0-9]/gi, '').toUpperCase();
}

/**
 * Normalizes date representations (YYYY-MM-DD, DD/MM/YYYY, DD-MMM-YYYY, YYMMDD) to YYYY-MM-DD or standard digits.
 */
function normalizeDate(val: string | null | undefined): string {
  if (!val) return '';
  const trimmed = val.trim();

  // If already ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  // DD/MM/YYYY or DD.MM.YYYY or DD-MM-YYYY
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\.-](\d{1,2})[\/\.-](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }

  // YYYY/MM/DD
  const ymdMatch = trimmed.match(/^(\d{4})[\/\.-](\d{1,2})[\/\.-](\d{1,2})$/);
  if (ymdMatch) {
    const y = ymdMatch[1];
    const m = ymdMatch[2].padStart(2, '0');
    const d = ymdMatch[3].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // Default: extract all digits
  return trimmed.replace(/[^0-9]/g, '');
}

/**
 * Normalizes sex/gender values: 'MALE', 'M' -> 'M', 'FEMALE', 'F' -> 'F', 'X' -> 'X'
 */
function normalizeGender(val: string | null | undefined): string {
  if (!val) return '';
  const upper = val.toUpperCase().trim();
  if (upper.startsWith('M') || upper === '1') return 'M';
  if (upper.startsWith('F') || upper === '2' || upper === 'W') return 'F';
  if (upper.startsWith('X')) return 'X';
  return upper;
}

/**
 * Compares two name strings allowing for "SURNAME, GIVEN" vs "GIVEN SURNAME" format differences.
 */
function compareNames(ocrName: string | null | undefined, mrzName: string | null | undefined): boolean {
  if (!ocrName || !mrzName) return false;

  const cleanOcr = ocrName.replace(/[^A-Z]/gi, ' ').toUpperCase().replace(/\s+/g, ' ').trim();
  const cleanMrz = mrzName.replace(/[^A-Z]/gi, ' ').toUpperCase().replace(/\s+/g, ' ').trim();

  if (cleanOcr === cleanMrz) return true;

  // Check if token sets match or overlap significantly
  const ocrTokens = new Set(cleanOcr.split(' ').filter((t) => t.length > 1));
  const mrzTokens = new Set(cleanMrz.split(' ').filter((t) => t.length > 1));

  if (ocrTokens.size === 0 || mrzTokens.size === 0) return false;

  let matches = 0;
  for (const token of mrzTokens) {
    if (ocrTokens.has(token)) {
      matches++;
    }
  }

  // If at least 75% of MRZ name tokens are present in visual name
  return matches >= Math.min(mrzTokens.size, ocrTokens.size) * 0.75;
}

/**
 * Performs comprehensive OCR vs MRZ consistency verification.
 */
export function checkOcrMrzConsistency(
  ocrFields: ExtractedPassportFields,
  mrzResult: MrzDetectionResult
): ConsistencyCheckResult {
  const comparisons: ConsistencyComparisonItem[] = [];

  if (!mrzResult.detected || !mrzResult.parsed) {
    return {
      overallMatch: false,
      mismatchCount: 0,
      matchCount: 0,
      comparisons: [
        {
          field: 'passport_number',
          fieldLabel: 'Passport / Document Number',
          ocrValue: ocrFields.passport_number?.value || null,
          mrzValue: null,
          status: 'INCONCLUSIVE',
          detail: 'MRZ not detected. Consistency comparison could not be performed.',
        },
      ],
      summary: 'MRZ data was not detected on this document. Cross-validation inconclusive.',
    };
  }

  const parsed = mrzResult.parsed;

  // 1. Passport Number Comparison
  const ocrDocNum = normalizeAlphanumeric(ocrFields.passport_number?.value);
  const mrzDocNum = normalizeAlphanumeric(parsed.passportNumber);
  const docNumMatch = Boolean(ocrDocNum && mrzDocNum && ocrDocNum === mrzDocNum);
  comparisons.push({
    field: 'passport_number',
    fieldLabel: 'Passport / Document Number',
    ocrValue: ocrFields.passport_number?.value || null,
    mrzValue: parsed.passportNumber || null,
    status: docNumMatch ? 'MATCH' : ocrDocNum && mrzDocNum ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: docNumMatch
      ? 'Visual document number matches MRZ payload exactly.'
      : 'Visual document number differs from MRZ payload — manual review recommended.',
  });

  // 2. Date of Birth Comparison
  const ocrDobNorm = normalizeDate(ocrFields.date_of_birth?.value);
  const mrzDobNorm = normalizeDate(parsed.dateOfBirth);
  const dobMatch = Boolean(ocrDobNorm && mrzDobNorm && (ocrDobNorm === mrzDobNorm || ocrDobNorm.endsWith(parsed.rawDob)));
  comparisons.push({
    field: 'date_of_birth',
    fieldLabel: 'Date of Birth (DOB)',
    ocrValue: ocrFields.date_of_birth?.value || null,
    mrzValue: parsed.dateOfBirth || null,
    status: dobMatch ? 'MATCH' : ocrDobNorm && mrzDobNorm ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: dobMatch
      ? 'Extracted birth date matches decoded MRZ DOB.'
      : 'Visual date of birth does not match MRZ — manual review recommended.',
  });

  // 3. Date of Expiry Comparison
  const ocrExpNorm = normalizeDate(ocrFields.date_of_expiry?.value);
  const mrzExpNorm = normalizeDate(parsed.expiryDate);
  const expMatch = Boolean(ocrExpNorm && mrzExpNorm && (ocrExpNorm === mrzExpNorm || ocrExpNorm.endsWith(parsed.rawExpiryDate)));
  comparisons.push({
    field: 'date_of_expiry',
    fieldLabel: 'Date of Expiry',
    ocrValue: ocrFields.date_of_expiry?.value || null,
    mrzValue: parsed.expiryDate || null,
    status: expMatch ? 'MATCH' : ocrExpNorm && mrzExpNorm ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: expMatch
      ? 'Visual expiry date aligns with MRZ expiry date.'
      : 'Visual expiry date differs from MRZ expiry — manual review recommended.',
  });

  // 4. Nationality Comparison
  const ocrNat = normalizeAlphanumeric(ocrFields.nationality?.value);
  const mrzNat = normalizeAlphanumeric(parsed.nationality);
  const natMatch = Boolean(ocrNat && mrzNat && (ocrNat.includes(mrzNat) || mrzNat.includes(ocrNat) || ocrNat.slice(0, 3) === mrzNat));
  comparisons.push({
    field: 'nationality',
    fieldLabel: 'Nationality / Issuing State',
    ocrValue: ocrFields.nationality?.value || null,
    mrzValue: parsed.nationality || null,
    status: natMatch ? 'MATCH' : ocrNat && mrzNat ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: natMatch
      ? 'Nationality matches MRZ state code.'
      : 'Visual nationality differs from MRZ country code — manual review recommended.',
  });

  // 5. Gender / Sex Comparison
  const ocrGen = normalizeGender(ocrFields.gender?.value);
  const mrzGen = normalizeGender(parsed.sex);
  const genMatch = Boolean(ocrGen && mrzGen && (ocrGen === mrzGen || mrzGen === '<'));
  comparisons.push({
    field: 'gender',
    fieldLabel: 'Sex / Gender Indicator',
    ocrValue: ocrFields.gender?.value || null,
    mrzValue: parsed.sex || null,
    status: genMatch ? 'MATCH' : ocrGen && mrzGen ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: genMatch
      ? 'Visual gender marker is consistent with MRZ sex.'
      : 'Gender marker mismatch detected — manual review recommended.',
  });

  // 6. Name Comparison
  const ocrName = ocrFields.full_name?.value;
  const mrzFullName = parsed.fullName;
  const nameMatch = compareNames(ocrName, mrzFullName);
  comparisons.push({
    field: 'full_name',
    fieldLabel: 'Full Name / Holder Identity',
    ocrValue: ocrName || null,
    mrzValue: mrzFullName || null,
    status: nameMatch ? 'MATCH' : ocrName && mrzFullName ? 'MISMATCH' : 'INCONCLUSIVE',
    detail: nameMatch
      ? 'Visual name elements correspond with decoded MRZ name tokens.'
      : 'Visual name has discrepancy with MRZ line 1 name format — manual review recommended.',
  });

  const matchCount = comparisons.filter((c) => c.status === 'MATCH').length;
  const mismatchCount = comparisons.filter((c) => c.status === 'MISMATCH').length;
  const overallMatch = mismatchCount === 0 && matchCount >= 3;

  let summary = 'Visual OCR fields and decoded MRZ data are fully consistent.';
  if (mismatchCount > 0) {
    summary = `Detected ${mismatchCount} field mismatch(es) between visual text and MRZ. Manual review recommended.`;
  }

  return {
    overallMatch,
    matchCount,
    mismatchCount,
    comparisons,
    summary,
  };
}
