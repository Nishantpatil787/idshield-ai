/**
 * IDShield AI — Biometric Privacy Guard & Log Sanitizer (TypeScript)
 */

export class BiometricPrivacyGuardTS {
  /**
   * Redacts sensitive base64 image streams and embedding vectors before logging.
   */
  public static sanitizeForLog(data: any): any {
    if (!data || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitizeForLog(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (['referenceImage', 'probeImage', 'imagePayload', 'documentImage', 'selfieImage', 'embedding', 'vector'].includes(key)) {
        if (typeof value === 'string') {
          sanitized[key] = `[REDACTED_IMAGE_DATA_BYTES_${value.length}]`;
        } else if (Array.isArray(value)) {
          sanitized[key] = `[REDACTED_EMBEDDING_VECTOR_DIM_${value.length}]`;
        } else {
          sanitized[key] = '[REDACTED]';
        }
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeForLog(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
}
