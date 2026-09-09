import { GoogleGenAI, Type } from '@google/genai';
import { ExtractedPassportFields, RawOcrOutput } from './types';

export interface OcrExtractionResult {
  ocr: RawOcrOutput;
  fields: ExtractedPassportFields;
  detectedMrzLines?: { line1?: string; line2?: string; raw?: string };
}

export interface IOcrProvider {
  name: string;
  isAvailable(): boolean;
  extractPassportData(base64Image: string, mimeType: string): Promise<OcrExtractionResult>;
}

/**
 * Modern Multimodal OCR Provider powered by Gemini 3.8 Flash
 */
export class GeminiOcrProvider implements IOcrProvider {
  name = 'gemini-3.8-flash';
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    if (process.env.GEMINI_API_KEY) {
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
  }

  isAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
  }

  async extractPassportData(base64Image: string, mimeType: string): Promise<OcrExtractionResult> {
    if (!this.aiClient) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY environment variable is not configured.');
      }
      this.aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }

    const prompt = `You are a high-accuracy ICAO Doc 9303 standard passport Optical Character Recognition (OCR) and visual field extractor.
Analyze the provided passport image and extract all text with extreme precision.

Tasks:
1. Extract the complete raw visual text on the document.
2. Extract the exact two Machine Readable Zone (MRZ) lines at the bottom of the passport without modifying characters or check digits.
3. Extract each visual field (Full Name, Passport Number, Nationality, Date of Birth, Date of Expiry, Gender/Sex, Issuing Country/Authority).
4. Provide genuine estimated confidence for field extraction (0.0 to 1.0) based on image sharpness and clarity.

Output strictly valid JSON matching the schema.`;

    const response = await this.aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: base64Image,
            },
          },
          {
            text: prompt,
          },
        ],
      },
      config: {
        systemInstruction:
          'You are an expert passport OCR parsing engine. Extract visual fields and verbatim MRZ lines. Output only valid JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            raw_text: {
              type: Type.STRING,
              description: 'All visible text detected on the passport page',
            },
            overall_confidence: {
              type: Type.NUMBER,
              description: 'Overall optical character recognition confidence from 0.0 to 1.0',
            },
            mrz_line1: {
              type: Type.STRING,
              description: 'Line 1 of the MRZ starting with P< (44 characters)',
            },
            mrz_line2: {
              type: Type.STRING,
              description: 'Line 2 of the MRZ containing document number and check digits (44 characters)',
            },
            full_name: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            passport_number: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            nationality: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            date_of_birth: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            date_of_expiry: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            gender: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
              required: ['value'],
            },
            issuing_country: {
              type: Type.OBJECT,
              properties: {
                value: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
              },
            },
          },
          required: [
            'raw_text',
            'mrz_line1',
            'mrz_line2',
            'full_name',
            'passport_number',
            'nationality',
            'date_of_birth',
            'date_of_expiry',
            'gender',
          ],
        },
      },
    });

    const textOutput = response.text || '{}';
    const parsed = JSON.parse(textOutput);

    const rawText = parsed.raw_text || `${parsed.mrz_line1 || ''}\n${parsed.mrz_line2 || ''}`;
    const overallConf = typeof parsed.overall_confidence === 'number' ? parsed.overall_confidence : 0.95;

    const fields: ExtractedPassportFields = {
      full_name: {
        value: parsed.full_name?.value || '',
        confidence: typeof parsed.full_name?.confidence === 'number' ? parsed.full_name.confidence : null,
      },
      passport_number: {
        value: parsed.passport_number?.value || '',
        confidence: typeof parsed.passport_number?.confidence === 'number' ? parsed.passport_number.confidence : null,
      },
      nationality: {
        value: parsed.nationality?.value || '',
        confidence: typeof parsed.nationality?.confidence === 'number' ? parsed.nationality.confidence : null,
      },
      date_of_birth: {
        value: parsed.date_of_birth?.value || '',
        confidence: typeof parsed.date_of_birth?.confidence === 'number' ? parsed.date_of_birth.confidence : null,
      },
      date_of_expiry: {
        value: parsed.date_of_expiry?.value || '',
        confidence: typeof parsed.date_of_expiry?.confidence === 'number' ? parsed.date_of_expiry.confidence : null,
      },
      gender: {
        value: parsed.gender?.value || '',
        confidence: typeof parsed.gender?.confidence === 'number' ? parsed.gender.confidence : null,
      },
      issuing_country: {
        value: parsed.issuing_country?.value || parsed.nationality?.value || '',
        confidence: typeof parsed.issuing_country?.confidence === 'number' ? parsed.issuing_country.confidence : null,
      },
    };

    return {
      ocr: {
        text: rawText,
        confidence: overallConf,
        provider: 'gemini-3.8-flash',
      },
      fields,
      detectedMrzLines: {
        line1: parsed.mrz_line1,
        line2: parsed.mrz_line2,
        raw: `${parsed.mrz_line1 || ''}\n${parsed.mrz_line2 || ''}`,
      },
    };
  }
}

/**
 * Fallback OCR Provider used for offline unit testing and development when API key is not present.
 */
export class FallbackOcrProvider implements IOcrProvider {
  name = 'deterministic-fallback-ocr';

  isAvailable(): boolean {
    return true;
  }

  async extractPassportData(_base64Image: string, _mimeType: string): Promise<OcrExtractionResult> {
    // Default standard sample ICAO TD3 passport (Utopia specimen)
    const line1 = 'P<UTOERIKSSON<<ANNA<MARIA<<<<<<<<<<<<<<<<<<<';
    const line2 = 'L898902C36UTO7408122F2804154ZE184226B<<<<<18';

    const fields: ExtractedPassportFields = {
      full_name: { value: 'ERIKSSON, ANNA MARIA', confidence: 0.98 },
      passport_number: { value: 'L898902C3', confidence: 0.99 },
      nationality: { value: 'UTOPIA (UTO)', confidence: 0.99 },
      date_of_birth: { value: '1974-08-12', confidence: 0.96 },
      date_of_expiry: { value: '2028-04-15', confidence: 0.97 },
      gender: { value: 'F', confidence: 0.99 },
      issuing_country: { value: 'UTOPIA PASSPORT OFFICE', confidence: 0.95 },
    };

    return {
      ocr: {
        text: `PASSPORT / PASSEPORT\nType: P Country: UTO Passport No: L898902C3\nSurname: ERIKSSON\nGiven Names: ANNA MARIA\nNationality: UTOPIA\nDate of Birth: 12 AUG 1974\nSex: F Place of Birth: CAPITAL CITY\nDate of Issue: 16 APR 2018\nAuthority: PASSPORT OFFICE\nDate of Expiry: 15 APR 2028\n\n${line1}\n${line2}`,
        confidence: 0.97,
        provider: 'deterministic-fallback-ocr (Evaluation Specimen)',
      },
      fields,
      detectedMrzLines: {
        line1,
        line2,
        raw: `${line1}\n${line2}`,
      },
    };
  }
}
