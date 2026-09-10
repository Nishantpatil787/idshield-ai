import { ScreeningRecord } from '../../src/types';

export interface ScreeningReportOptions {
  generatedBy?: string;
  reportVersion?: string;
  includeImages?: boolean;
}

export interface SanitizedAuditInfo {
  caseId: string;
  screeningId: string;
  reportId: string;
  generatedAt: string;
  screeningTimestamp: string;
  operatorId: string;
  stationId: string;
  modulesExecuted: string[];
  ruleSetVersion: string;
  reportGeneratorVersion: string;
}

export type { ScreeningRecord };
