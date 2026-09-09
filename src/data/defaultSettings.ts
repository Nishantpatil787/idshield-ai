import { SystemSettings } from '../types';

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  riskThresholds: {
    lowMax: 30,
    mediumMax: 70,
  },
  documentRules: {
    requireStrictMrz: true,
    minimumExpiryBufferMonths: 6,
    requireBiometricCrossCheck: true,
    flagHandwrittenPassports: true,
  },
  aiConfiguration: {
    ocrConfidenceThreshold: 85,
    tamperSensitivity: 'High',
    faceMatchStrictness: 75,
    modelBackendEndpoint: 'https://api.internal-security.local/v1/pipeline',
  },
  systemConfig: {
    stationName: 'BORDER-CONSOLE-PRIMARY-01',
    operatorRole: 'SUPERVISORY_AGENT',
    dataRetentionDays: 90,
    enableAuditLogging: true,
    academicDisclaimerAcknowledged: true,
  },
};
