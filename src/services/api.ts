import { 
  ScreeningRecord, 
  DashboardStats, 
  SystemSettings, 
  DocumentCategory,
  RiskLevel,
  ScreeningStatus
} from '../types';
import { MOCK_SCREENING_RECORDS } from '../data/mockScreenings';
import { DEFAULT_SYSTEM_SETTINGS } from '../data/defaultSettings';

// In-memory state for client-side prototype persistence
let localScreenings: ScreeningRecord[] = [...MOCK_SCREENING_RECORDS];
let localSettings: SystemSettings = { ...DEFAULT_SYSTEM_SETTINGS };

export interface ScreeningFilterParams {
  category?: DocumentCategory | 'ALL';
  riskLevel?: RiskLevel | 'ALL';
  status?: ScreeningStatus | 'ALL';
  searchQuery?: string;
  startDate?: string;
  endDate?: string;
}

export interface SupportingDocumentPayload {
  id?: string;
  category: DocumentCategory;
  categoryLabel?: string;
  documentNumber?: string;
  associatedPassportNumber?: string;
  fullName?: string;
  nationality?: string;
  dateOfBirth?: string;
  issueDate?: string;
  expiryDate?: string;
  gender?: string;
  visaType?: string;
  imagePreviewUrl?: string;
  rawUploadedFileName?: string;
  fileSizeBytes?: number;
}

export interface CreateScreeningPayload {
  category: DocumentCategory;
  documentNumber?: string;
  fullName?: string;
  nationality?: string;
  expiryDate?: string;
  uploadedFileName: string;
  fileSizeBytes: number;
  imagePreviewUrl?: string;
  selfieImageUrl?: string;
  referenceImage?: string;
  additionalNotes?: string;
  supportingDocuments?: SupportingDocumentPayload[];
}

/**
 * Centralized API service layer.
 * All functions return Promises to seamlessly integrate with real backend endpoints later.
 */
export const ScreeningService = {
  /**
   * Fetch list of screenings with optional filters
   */
  async getScreenings(params: ScreeningFilterParams = {}): Promise<ScreeningRecord[]> {
    await new Promise((resolve) => setTimeout(resolve, 150)); // Simulated network latency

    return localScreenings.filter((item) => {
      if (params.category && params.category !== 'ALL' && item.document.category !== params.category) {
        return false;
      }
      if (params.riskLevel && params.riskLevel !== 'ALL' && item.riskAssessment.riskLevel !== params.riskLevel) {
        return false;
      }
      if (params.status && params.status !== 'ALL' && item.status !== params.status) {
        return false;
      }
      if (params.searchQuery && params.searchQuery.trim()) {
        const q = params.searchQuery.toLowerCase().trim();
        const matchesName = item.document.fullName.toLowerCase().includes(q);
        const matchesDoc = item.document.documentNumber.toLowerCase().includes(q);
        const matchesId = item.screeningId.toLowerCase().includes(q);
        const matchesNat = item.document.nationality.toLowerCase().includes(q);
        if (!matchesName && !matchesDoc && !matchesId && !matchesNat) {
          return false;
        }
      }
      return true;
    });
  },

  /**
   * Fetch single screening record by ID
   */
  async getScreeningById(screeningId: string): Promise<ScreeningRecord | null> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    const found = localScreenings.find((s) => s.screeningId === screeningId);
    return found ? { ...found } : null;
  },

  /**
   * Create a new screening record by invoking the server-side OCR & MRZ processing pipeline
   */
  async createScreening(payload: CreateScreeningPayload): Promise<ScreeningRecord> {
    // If an image payload is provided and document category is passport, call backend pipeline
    if (payload.imagePreviewUrl) {
      try {
        const response = await fetch('/api/screening/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imagePayload: payload.imagePreviewUrl,
            fileName: payload.uploadedFileName,
            fileSizeBytes: payload.fileSizeBytes,
            selfieImage: payload.selfieImageUrl || payload.referenceImage,
            referenceImage: payload.selfieImageUrl || payload.referenceImage,
            additionalNotes: payload.additionalNotes,
            supportingDocuments: payload.supportingDocuments,
          }),
        });

        if (response.ok) {
          const liveRecord: ScreeningRecord = await response.json();
          // Prepend to local screening cache
          localScreenings = [liveRecord, ...localScreenings];
          return liveRecord;
        }
      } catch (err) {
        console.warn('Backend screening endpoint unavailable, using structured fallback:', err);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const idSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const newId = `SCR-2026-${idSuffix}`;
    const docNum = payload.documentNumber || `ID-${Math.floor(1000000 + Math.random() * 8999999)}`;
    const fullName = (payload.fullName || 'DOE, JANE ALEXIS').toUpperCase();
    const nat = (payload.nationality || 'UNITED KINGDOM').toUpperCase();
    const expiry = payload.expiryDate || '2030-08-15';

    const categoryLabels: Record<DocumentCategory, string> = {
      passport: 'Standard Biometric Passport',
      visa: 'Electronic Travel Authorization (e-Visa)',
      national_id: 'National Identity Card',
      driving_licence: 'Driving Licence (Standard)',
      permit: 'Temporary Border Permit',
    };

    const newRecord: ScreeningRecord = {
      screeningId: newId,
      timestamp: new Date().toISOString(),
      operatorId: 'OFFICER-4819',
      stationId: 'TERM-3-SEC-A',
      status: 'COMPLETED',
      isDemoData: true,
      document: {
        id: `DOC-${idSuffix}`,
        category: payload.category,
        categoryLabel: categoryLabels[payload.category] || 'Identity Document',
        documentNumber: docNum,
        fullName: fullName,
        nationality: nat,
        countryCode: nat.slice(0, 3),
        dateOfBirth: '1991-03-22',
        expiryDate: expiry,
        issueDate: '2020-08-16',
        issuingAuthority: 'PASSPORT & CITIZENSHIP OFFICE',
        gender: 'F',
        mrzCode: `P<${nat.slice(0, 3)}${fullName.replace(/[^A-Z]/g, '<')}<<<<<<<<<<<<<<<<<<\n${docNum}${nat.slice(0, 3)}9103225F3008154<<<<<<<<<<<<<<<00`,
        rawUploadedFileName: payload.uploadedFileName,
        fileSizeBytes: payload.fileSizeBytes,
        uploadedAt: new Date().toISOString(),
        imageUrl: payload.imagePreviewUrl || MOCK_SCREENING_RECORDS[0].document.imageUrl,
      },
      extractedFields: [
        { fieldName: 'Document Number', extractedValue: docNum, confidence: 0.98, validationStatus: 'PASS', mrzMatched: true },
        { fieldName: 'Full Name', extractedValue: fullName, confidence: 0.97, validationStatus: 'PASS', mrzMatched: true },
        { fieldName: 'Nationality', extractedValue: nat, confidence: 0.99, validationStatus: 'PASS', mrzMatched: true },
        { fieldName: 'Expiry Date', extractedValue: expiry, confidence: 0.96, validationStatus: 'PASS', mrzMatched: true },
      ],
      validation: {
        overallValid: true,
        score: 95,
        requiredFieldsStatus: 'PASS',
        formatValidationStatus: 'PASS',
        mrzValidationStatus: 'PASS',
        crossFieldConsistencyStatus: 'PASS',
        items: [
          { id: 'v-1', title: 'Required Fields Presence', category: 'required_fields', status: 'PASS', detail: 'Visual elements identified with standard layout confidence.' },
          { id: 'v-2', title: 'Format & Typography Verification', category: 'format_validation', status: 'PASS', detail: 'Font alignment and serial prefix conform to document standards.' },
          { id: 'v-3', title: 'MRZ Checksum Validation', category: 'mrz_validation', status: 'PASS', detail: 'ICAO 9303 check digits computed with zero parity errors.' },
          { id: 'v-4', title: 'Visual vs Code Consistency', category: 'cross_field_consistency', status: 'PASS', detail: 'Extracted visual zone matches decoded metadata payload.' },
        ],
      },
      tampering: {
        overallTamperingScore: 5,
        photoManipulationStatus: 'PASS',
        textManipulationStatus: 'PASS',
        metadataAnomalyStatus: 'PASS',
        items: [
          { id: 't-1', componentName: 'Facial Portrait Envelope', type: 'photo_manipulation', status: 'PASS', confidenceScore: 97, description: 'No boundary discontinuity or pixel level noise elevation detected.' },
          { id: 't-2', componentName: 'Text Character Baselines', type: 'text_manipulation', status: 'PASS', confidenceScore: 98, description: 'Character spacing and ink bleed consistency within acceptable variance.' },
          { id: 't-3', componentName: 'EXIF Metadata Analysis', type: 'metadata_anomaly', status: 'PASS', confidenceScore: 95, description: 'Original capture profile present without manipulation software markers.' },
        ],
      },
      faceVerification: {
        faceDetectedInDocument: true,
        faceDetectedInReference: true,
        similarityScore: 93.8,
        matchStatus: 'MATCHED',
        livenessConfidence: 96.5,
        notes: 'High landmark congruence. Biometric profile clear for automated processing.',
      },
      riskAssessment: {
        riskScore: 9,
        riskLevel: 'LOW',
        primaryRiskSummary: 'Low Risk. Document structural checks passed with consistent optical and cryptographic markers.',
        recommendedAction: 'CLEAR',
        explainableFactors: [
          { id: 'rf-1', factor: 'Document Format Conformity', weight: 'LOW', impactPoints: 0, description: 'Standard layout validated against reference templates.' },
          { id: 'rf-2', factor: 'Zero Tampering Traces Detected', weight: 'LOW', impactPoints: 0, description: 'No digital editing signatures identified.' },
        ],
      },
      notes: payload.additionalNotes || 'Screening generated in prototype evaluation mode.',
    };

    localScreenings = [newRecord, ...localScreenings];
    return newRecord;
  },

  /**
   * Get aggregate dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    await new Promise((resolve) => setTimeout(resolve, 80));

    const total = localScreenings.length;
    const low = localScreenings.filter((s) => s.riskAssessment.riskLevel === 'LOW').length;
    const med = localScreenings.filter((s) => s.riskAssessment.riskLevel === 'MEDIUM').length;
    const high = localScreenings.filter((s) => s.riskAssessment.riskLevel === 'HIGH').length;
    const flagged = localScreenings.filter((s) => s.status === 'FLAGGED_FOR_REVIEW' || s.status === 'REJECTED').length;

    return {
      totalScreenings: total,
      lowRiskCount: low,
      mediumRiskCount: med,
      highRiskCount: high,
      flaggedCount: flagged,
      avgProcessingTimeSec: 1.4,
      systemStatus: 'OPERATIONAL',
      activeStationCount: 4,
    };
  },

  /**
   * Get system settings
   */
  async getSettings(): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return { ...localSettings };
  },

  /**
   * Update system settings
   */
  async updateSettings(updated: Partial<SystemSettings>): Promise<SystemSettings> {
    await new Promise((resolve) => setTimeout(resolve, 100));
    localSettings = {
      ...localSettings,
      ...updated,
      riskThresholds: { ...localSettings.riskThresholds, ...updated.riskThresholds },
      documentRules: { ...localSettings.documentRules, ...updated.documentRules },
      aiConfiguration: { ...localSettings.aiConfiguration, ...updated.aiConfiguration },
      systemConfig: { ...localSettings.systemConfig, ...updated.systemConfig },
    };
    return { ...localSettings };
  },

  /**
   * Directly validate a structured document using the Validation Engine
   */
  async validateDocument(documentPayload: any, configOverride?: any) {
    const response = await fetch('/api/screening/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: documentPayload, configOverride }),
    });
    if (!response.ok) {
      throw new Error(`Validation failed with status ${response.status}`);
    }
    return response.json();
  },

  /**
   * Dedicated Face Verification service endpoint
   */
  async verifyFace(referenceImage: string, probeImage: string, configOverride?: any) {
    try {
      const response = await fetch('/api/screening/face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference_image: referenceImage,
          probe_image: probeImage,
          config_override: configOverride,
        }),
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      console.warn('Backend face verification endpoint offline, using local engine:', err);
    }

    const { FaceVerificationEngineTS } = await import('../../server/face');
    const engine = new FaceVerificationEngineTS();
    return engine.verifyFaces({
      referenceImage,
      probeImage,
      configOverride,
    });
  },

  /**
   * Reset data to default initial state
   */
  async resetToDemoDefaults(): Promise<void> {
    localScreenings = [...MOCK_SCREENING_RECORDS];
    localSettings = { ...DEFAULT_SYSTEM_SETTINGS };
  },
};
