export interface ImageValidationResult {
  valid: boolean;
  error?: string;
  mimeType: string;
  base64Data: string;
  fileSizeBytes: number;
}

const SUPPORTED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'image/svg',
]);

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB

/**
 * Validates an incoming document image payload (base64 string or data URL).
 */
export function validateAndPreprocessImage(
  rawPayload: string | undefined | null,
  fileName: string = 'document.png'
): ImageValidationResult {
  if (!rawPayload || typeof rawPayload !== 'string') {
    return {
      valid: false,
      error: 'No document image payload provided. Please upload a valid passport image.',
      mimeType: '',
      base64Data: '',
      fileSizeBytes: 0,
    };
  }

  const trimmed = rawPayload.trim();
  let mimeType = 'image/jpeg';
  let base64Data = trimmed;

  if (trimmed.startsWith('data:')) {
    const matches = trimmed.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      mimeType = matches[1].toLowerCase();
      base64Data = matches[2];
    } else {
      const svgMatch = trimmed.match(/^data:image\/svg\+xml(?:;[^,]*)?,(.+)$/i);
      if (svgMatch) {
        mimeType = 'image/svg+xml';
        const rawContent = svgMatch[1];
        try {
          base64Data = Buffer.from(decodeURIComponent(rawContent)).toString('base64');
        } catch {
          base64Data = Buffer.from(rawContent).toString('base64');
        }
      } else {
        return {
          valid: false,
          error: 'Corrupted image data URL structure. Could not extract base64 bytes.',
          mimeType: '',
          base64Data: '',
          fileSizeBytes: 0,
        };
      }
    }
  } else if (trimmed.startsWith('<svg') || trimmed.includes('<svg xmlns=')) {
    mimeType = 'image/svg+xml';
    base64Data = Buffer.from(trimmed).toString('base64');
  } else {
    // Infer mime type from filename extension if not in data URL
    const ext = (fileName.split('.').pop() || '').toLowerCase();
    if (ext === 'png') mimeType = 'image/png';
    else if (ext === 'webp') mimeType = 'image/webp';
    else if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
    else if (ext === 'svg') mimeType = 'image/svg+xml';
  }

  if (!SUPPORTED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image format: "${mimeType}". Please upload a JPG, PNG, WEBP, or SVG document image.`,
      mimeType,
      base64Data: '',
      fileSizeBytes: 0,
    };
  }

  // Calculate approximate file size from base64 length
  const fileSizeBytes = Math.round((base64Data.length * 3) / 4);

  if (fileSizeBytes < 10) {
    return {
      valid: false,
      error: 'Uploaded image file appears empty or corrupted (under 10 bytes).',
      mimeType,
      base64Data: '',
      fileSizeBytes,
    };
  }

  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Uploaded file size (${(fileSizeBytes / 1024 / 1024).toFixed(1)}MB) exceeds maximum limit of 20MB.`,
      mimeType,
      base64Data: '',
      fileSizeBytes,
    };
  }

  // Verify valid base64 character set
  const isBase64Valid = /^[A-Za-z0-9+/=]+$/.test(base64Data.replace(/[\r\n\s]/g, ''));
  if (!isBase64Valid) {
    return {
      valid: false,
      error: 'Uploaded image payload contains invalid base64 encoding characters.',
      mimeType,
      base64Data: '',
      fileSizeBytes,
    };
  }

  return {
    valid: true,
    mimeType,
    base64Data: base64Data.replace(/[\r\n\s]/g, ''),
    fileSizeBytes,
  };
}
