import { validateAndPreprocessImage } from './preprocessing';
import { GeminiOcrProvider, FallbackOcrProvider, IOcrProvider } from './ocrService';
import { detectMrzFromText } from './mrzDetector';
import { checkOcrMrzConsistency } from './consistencyChecker';
import { PassportProcessingResult, MrzDetectionResult } from './types';

export interface ProcessPassportOptions {
  imagePayload: string;
  fileName?: string;
  forceProvider?: 'gemini' | 'fallback';
}

/**
 * Master Passport OCR & MRZ Extraction Pipeline
 *
 * Flow:
 * Uploaded Passport
 *   ↓
 * Image Validation
 *   ↓
 * Image Preprocessing
 *   ↓
 * OCR (Gemini 3.8 Flash / Provider)
 *   ↓
 * Raw OCR Text & Visual Field Extraction
 *   ↓
 * MRZ Detection & ICAO 9303 Normalization
 *   ↓
 * Deterministic MRZ Parser
 *   ↓
 * Deterministic MRZ Checksum Validation (7-3-1 Weight Factor)
 *   ↓
 * OCR ↔ MRZ Consistency Check
 *   ↓
 * Structured Screening Result
 */
export async function runPassportPipeline(options: ProcessPassportOptions): Promise<PassportProcessingResult> {
  const startTime = Date.now();
  const fileName = options.fileName || 'passport_scan.jpg';

  // 1. Image Validation and Preprocessing
  const prepResult = validateAndPreprocessImage(options.imagePayload, fileName);
  if (!prepResult.valid) {
    throw new Error(prepResult.error || 'Invalid document image provided.');
  }

  // 2. Select OCR Provider
  let provider: IOcrProvider;
  if (options.forceProvider === 'fallback') {
    provider = new FallbackOcrProvider();
  } else if (process.env.GEMINI_API_KEY) {
    provider = new GeminiOcrProvider();
  } else {
    // Provide deterministic fallback when API key is unconfigured
    provider = new FallbackOcrProvider();
  }

  let ocrResult;
  let isRealOcr = provider.name.startsWith('gemini');

  try {
    ocrResult = await provider.extractPassportData(prepResult.base64Data, prepResult.mimeType);
  } catch (ocrErr: any) {
    // If Gemini API fails (e.g. rate limit, network), fall back to fallback provider with note
    if (provider.name.startsWith('gemini')) {
      console.info('Using deterministic OCR analyzer for credential extraction.');
      provider = new FallbackOcrProvider();
      ocrResult = await provider.extractPassportData(prepResult.base64Data, prepResult.mimeType);
      isRealOcr = false;
    } else {
      throw ocrErr;
    }
  }

  // 3. MRZ Detection and Parsing
  let mrzResult: MrzDetectionResult;
  const mrzCandidateText =
    ocrResult.detectedMrzLines?.raw ||
    `${ocrResult.detectedMrzLines?.line1 || ''}\n${ocrResult.detectedMrzLines?.line2 || ''}` ||
    ocrResult.ocr.text;

  mrzResult = detectMrzFromText(mrzCandidateText);

  // If not found in candidate lines, try full raw OCR text
  if (!mrzResult.detected && ocrResult.ocr.text) {
    mrzResult = detectMrzFromText(ocrResult.ocr.text);
  }

  // 4. OCR ↔ MRZ Consistency Comparison
  const consistencyResult = checkOcrMrzConsistency(ocrResult.fields, mrzResult);

  const executionTimeMs = Date.now() - startTime;

  return {
    document_type: 'passport',
    ocr: ocrResult.ocr,
    fields: ocrResult.fields,
    mrz: mrzResult,
    consistency: consistencyResult,
    processing: {
      status: 'complete',
      executionTimeMs,
      isRealOcr,
      provider: provider.name,
    },
  };
}
