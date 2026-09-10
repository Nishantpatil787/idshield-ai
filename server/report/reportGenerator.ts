import PDFDocument from 'pdfkit';
import { ScreeningRecord } from '../../src/types';
import { ScreeningReportOptions } from './reportTypes';
import { ScreeningReportTemplate } from './reportTemplate';

/**
 * Server-Side PDF Report Generator for IDShield AI
 * Generates a structured PDF document from a canonical ScreeningRecord.
 */
export async function generateScreeningPdf(
  record: ScreeningRecord,
  options: ScreeningReportOptions = {}
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      if (!record || !record.screeningId) {
        throw new Error('Invalid screening record provided for PDF generation.');
      }

      const reportId = `REP-${Date.now().toString(36).toUpperCase()}`;

      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        bufferPages: true,
        info: {
          Title: `IDShield AI Screening Report - ${record.screeningId}`,
          Author: 'IDShield AI Decision Support System',
          Subject: 'Identity & Document Screening Report',
          Keywords: 'IDShield, Security, Verification, OCR, Biometric',
          CreationDate: new Date(),
        },
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // Build report layout template
      const template = new ScreeningReportTemplate(doc, record, reportId);
      template.build();

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
