import { MrzDetectionResult } from './types';
import { parseTd3Mrz } from './mrzParser';
import { validateTd3Checksums } from './mrzChecksum';

/**
 * Normalizes potential OCR MRZ line: converts to uppercase, replaces common OCR misreads in MRZ area.
 */
export function cleanMrzLine(rawLine: string): string {
  if (!rawLine) return '';
  return rawLine
    .trim()
    .toUpperCase()
    .replace(/«/g, '<')
    .replace(/\s+/g, '<')
    .replace(/[^A-Z0-9<]/g, '<');
}

/**
 * Detects and extracts ICAO TD3 MRZ (2 lines of 44 chars) from raw OCR text.
 */
export function detectMrzFromText(ocrText: string): MrzDetectionResult {
  if (!ocrText || typeof ocrText !== 'string') {
    return {
      detected: false,
      raw: '',
      normalized: '',
      error: 'No text supplied for MRZ extraction.',
    };
  }

  const lines = ocrText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Look for lines that look like MRZ lines
  // TD3 passport line 1 starts with P<, P, or has many '<' and length > 30
  let candidateLine1: string | null = null;
  let candidateLine2: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const current = cleanMrzLine(lines[i]);
    const fillerCount = (current.match(/</g) || []).length;

    // Check if line looks like Line 1 (starts with P and has fillers, or has high count of fillers and length > 30)
    const isLine1Candidate =
      (current.startsWith('P') || current.startsWith('V') || current.startsWith('I')) &&
      fillerCount >= 2 &&
      current.length >= 30;

    if (isLine1Candidate && i + 1 < lines.length) {
      const next = cleanMrzLine(lines[i + 1]);
      if (next.length >= 30) {
        candidateLine1 = current;
        candidateLine2 = next;
        break;
      }
    }
  }

  // Fallback: search for any two consecutive lines with high length (>30) and '<'
  if (!candidateLine1 || !candidateLine2) {
    for (let i = 0; i < lines.length - 1; i++) {
      const l1 = cleanMrzLine(lines[i]);
      const l2 = cleanMrzLine(lines[i + 1]);
      const fillers1 = (l1.match(/</g) || []).length;
      const fillers2 = (l2.match(/</g) || []).length;

      if (l1.length >= 35 && l2.length >= 35 && (fillers1 >= 2 || fillers2 >= 2)) {
        candidateLine1 = l1;
        candidateLine2 = l2;
        break;
      }
    }
  }

  if (!candidateLine1 || !candidateLine2) {
    return {
      detected: false,
      raw: '',
      normalized: '',
      error: 'ICAO TD3 2-line MRZ was not detected in the provided text.',
    };
  }

  // Normalize lines to 44 characters
  const line1Padded = candidateLine1.padEnd(44, '<').substring(0, 44);
  const line2Padded = candidateLine2.padEnd(44, '<').substring(0, 44);
  const rawMrz = `${line1Padded}\n${line2Padded}`;

  try {
    const parsed = parseTd3Mrz(line1Padded, line2Padded);
    const checksum_validation = validateTd3Checksums(line2Padded);

    return {
      detected: true,
      format: 'TD3',
      raw: rawMrz,
      line1: line1Padded,
      line2: line2Padded,
      normalized: rawMrz,
      parsed,
      checksum_validation,
    };
  } catch (err: any) {
    return {
      detected: true,
      format: 'TD3',
      raw: rawMrz,
      line1: line1Padded,
      line2: line2Padded,
      normalized: rawMrz,
      error: `Failed to parse detected MRZ: ${err.message || err}`,
    };
  }
}
