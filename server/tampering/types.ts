/**
 * IDShield AI — AI Tampering Detection Module Types
 */

import { ValidationStatus } from '../../src/types';

export type TamperingType = 
  | 'photo_manipulation' 
  | 'text_manipulation' 
  | 'metadata_anomaly' 
  | 'substrate_irregularity';

export interface TamperingAnomalyItem {
  id: string;
  componentName: string;
  type: TamperingType;
  status: ValidationStatus;
  confidenceScore: number; // 0 - 100
  description: string;
  locationCoordinates?: { x: number; y: number; width: number; height: number };
}

export interface TamperingAnalysisResponse {
  overallTamperingScore: number; // 0 - 100 (0 = clean, 100 = heavily tampered)
  photoManipulationStatus: ValidationStatus;
  textManipulationStatus: ValidationStatus;
  metadataAnomalyStatus: ValidationStatus;
  substrateStatus: ValidationStatus;
  items: TamperingAnomalyItem[];
  status: 'SUCCESS' | 'WARNING' | 'REVIEW_REQUIRED' | 'NOT_AVAILABLE' | 'FAILED';
  executionTimeMs: number;
}

export interface TamperingAnalysisPayload {
  imagePayload?: string;
  fileName?: string;
  documentType?: string;
  ocrText?: string;
  mrzRaw?: string;
}
