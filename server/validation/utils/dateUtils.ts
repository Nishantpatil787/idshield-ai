/**
 * Robust calendar date utilities for deterministic passport screening
 */

export interface ParsedDateResult {
  valid: boolean;
  date?: Date;
  iso?: string; // YYYY-MM-DD
  year?: number;
  month?: number; // 1-12
  day?: number; // 1-31
  error?: string;
}

/**
 * Validates if the given year, month (1-12), and day (1-31) form a real calendar date.
 * Accurately handles leap years (Feb 29) and month day limits.
 */
export function isValidCalendarDate(year: number, month: number, day: number): boolean {
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return false;
  }
  if (year < 1850 || year > 2200) {
    return false;
  }
  if (month < 1 || month > 12) {
    return false;
  }
  if (day < 1 || day > 31) {
    return false;
  }

  // Days in month validation
  const daysInMonths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDay = daysInMonths[month - 1];

  return day <= maxDay;
}

export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Parses and verifies an ISO (YYYY-MM-DD), standard slash (YYYY/MM/DD or DD/MM/YYYY), or dotted date.
 */
export function parseAndValidateDate(dateStr: string | null | undefined): ParsedDateResult {
  if (!dateStr || typeof dateStr !== 'string') {
    return { valid: false, error: 'Empty or undefined date string' };
  }

  const clean = dateStr.trim();

  // Pattern 1: ISO Format YYYY-MM-DD or YYYY/MM/DD
  const isoMatch = clean.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    const year = parseInt(isoMatch[1], 10);
    const month = parseInt(isoMatch[2], 10);
    const day = parseInt(isoMatch[3], 10);

    if (!isValidCalendarDate(year, month, day)) {
      return { valid: false, error: `Invalid calendar date: ${clean}` };
    }

    const iso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return { valid: true, date, iso, year, month, day };
  }

  // Pattern 2: DD/MM/YYYY or DD-MM-YYYY
  const euMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (euMatch) {
    const day = parseInt(euMatch[1], 10);
    const month = parseInt(euMatch[2], 10);
    const year = parseInt(euMatch[3], 10);

    if (!isValidCalendarDate(year, month, day)) {
      return { valid: false, error: `Invalid calendar date: ${clean}` };
    }

    const iso = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const date = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
    return { valid: true, date, iso, year, month, day };
  }

  return { valid: false, error: `Unrecognized date format: ${clean}` };
}

/**
 * Calculates day difference between two dates (to - from).
 */
export function getDaysDifference(from: Date, to: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcFrom = Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate());
  const utcTo = Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate());
  return Math.round((utcTo - utcFrom) / msPerDay);
}

/**
 * Checks if targetDate is strictly in the future compared to referenceDate (defaults to now).
 */
export function isDateInFuture(targetDate: Date, referenceDate?: Date): boolean {
  const ref = referenceDate || new Date();
  const utcTarget = Date.UTC(targetDate.getUTCFullYear(), targetDate.getUTCMonth(), targetDate.getUTCDate());
  const utcRef = Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate());
  return utcTarget > utcRef;
}

/**
 * Checks if firstDate is strictly before secondDate.
 */
export function isDateBefore(firstDate: Date, secondDate: Date): boolean {
  const utcFirst = Date.UTC(firstDate.getUTCFullYear(), firstDate.getUTCMonth(), firstDate.getUTCDate());
  const utcSecond = Date.UTC(secondDate.getUTCFullYear(), secondDate.getUTCMonth(), secondDate.getUTCDate());
  return utcFirst < utcSecond;
}
