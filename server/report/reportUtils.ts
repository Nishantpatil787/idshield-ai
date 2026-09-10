import PDFDocument from 'pdfkit';

// Color Palette for Security Report Theme
export const REPORT_COLORS = {
  headerBg: '#0f172a',      // Dark Slate 900
  headerText: '#ffffff',    // Pure White
  cardBg: '#f8fafc',        // Light Slate 50
  cardBorder: '#e2e8f0',    // Slate 200
  primary: '#2563eb',       // Blue 600
  primaryDark: '#1d4ed8',   // Blue 700
  textDark: '#0f172a',      // Slate 900
  textMuted: '#64748b',     // Slate 500
  textLight: '#475569',     // Slate 600
  divider: '#cbd5e1',       // Slate 300

  // Status Colors
  passBg: '#dcfce7',        // Emerald 100
  passText: '#15803d',      // Emerald 700
  passBorder: '#bbf7d0',    // Emerald 200

  warnBg: '#fef3c7',        // Amber 100
  warnText: '#b45309',      // Amber 700
  warnBorder: '#fde68a',    // Amber 200

  failBg: '#fee2e2',        // Rose 100
  failText: '#b91c1c',      // Rose 700
  failBorder: '#fca5a5',    // Rose 300

  neutralBg: '#f1f5f9',     // Slate 100
  neutralText: '#475569',   // Slate 600
  neutralBorder: '#e2e8f0', // Slate 200
};

// Formatting & Sanitization Helpers
export function safeText(value: any, fallback: string = 'NOT_AVAILABLE'): string {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE';
  const str = String(value).trim();
  if (str === '' || str.toUpperCase() === 'UNDEFINED' || str.toUpperCase() === 'NULL') {
    return fallback;
  }
  return str;
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'NOT_AVAILABLE';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().split('T')[0] + ' ' + d.toTimeString().split(' ')[0] + ' UTC';
  } catch {
    return dateString;
  }
}

export function formatShortDate(dateString?: string): string {
  if (!dateString) return 'NOT_AVAILABLE';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toISOString().split('T')[0];
  } catch {
    return dateString;
  }
}

export function safeImageBuffer(dataUrl?: string): Buffer | null {
  if (!dataUrl) return null;
  try {
    if (dataUrl.startsWith('data:image/png;base64,') || dataUrl.startsWith('data:image/jpeg;base64,') || dataUrl.startsWith('data:image/jpg;base64,')) {
      const base64Data = dataUrl.split(',')[1];
      if (base64Data && base64Data.length > 100) {
        const buf = Buffer.from(base64Data, 'base64');
        if (buf.length > 0) return buf;
      }
    }
  } catch {
    return null;
  }
  return null;
}

export function ensureVerticalSpace(
  doc: PDFKit.PDFDocument,
  requiredHeight: number,
  pageBottomMargin: number = 50,
  pageHeight: number = 841.89
): boolean {
  if (doc.y + requiredHeight > pageHeight - pageBottomMargin) {
    doc.addPage();
    return true;
  }
  return false;
}

export function drawBadge(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  statusType: 'PASS' | 'WARN' | 'FAIL' | 'NEUTRAL' = 'NEUTRAL',
  fontSize: number = 8
): number {
  let bg = REPORT_COLORS.neutralBg;
  let fg = REPORT_COLORS.neutralText;
  let border = REPORT_COLORS.neutralBorder;

  const upper = text.toUpperCase();
  if (statusType === 'PASS' || upper.includes('PASS') || upper.includes('MATCH') || upper.includes('CLEAR') || upper.includes('VALID')) {
    bg = REPORT_COLORS.passBg;
    fg = REPORT_COLORS.passText;
    border = REPORT_COLORS.passBorder;
  } else if (statusType === 'WARN' || upper.includes('WARN') || upper.includes('REVIEW') || upper.includes('MEDIUM') || upper.includes('EXPIRING')) {
    bg = REPORT_COLORS.warnBg;
    fg = REPORT_COLORS.warnText;
    border = REPORT_COLORS.warnBorder;
  } else if (statusType === 'FAIL' || upper.includes('FAIL') || upper.includes('HIGH') || upper.includes('CRITICAL') || upper.includes('INVALID') || upper.includes('REJECT') || upper.includes('UNMATCH')) {
    bg = REPORT_COLORS.failBg;
    fg = REPORT_COLORS.failText;
    border = REPORT_COLORS.failBorder;
  }

  const paddingX = 6;
  const paddingY = 2;
  doc.fontSize(fontSize).font('Helvetica-Bold');
  const textWidth = doc.widthOfString(text);
  const badgeWidth = textWidth + paddingX * 2;
  const badgeHeight = fontSize + paddingY * 2;

  doc.save();
  doc.roundedRect(x, y, badgeWidth, badgeHeight, 3)
     .fillAndStroke(bg, border);

  doc.fillColor(fg)
     .text(text, x + paddingX, y + paddingY, { width: textWidth, align: 'center' });
  doc.restore();

  return badgeWidth;
}
