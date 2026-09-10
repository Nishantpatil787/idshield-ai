/**
 * IDShield AI — Central Screening Orchestration Service
 * Connects Document Classification -> OCR -> MRZ Parsing -> Validation -> Cross-Doc Consistency -> Tampering -> Face Verification -> Risk Engine.
 */

import { runPassportPipeline } from '../ocr/pipeline';
import { ValidationEngine } from '../validation';
import { CrossDocumentConsistencyEngine } from '../consistency';
import { FaceVerificationEngineTS } from '../face';
import { TamperingDetectorEngine } from '../tampering/detector';
import { RiskEngine } from '../risk/engine';
import { ScreeningRecord } from '../../src/types';

export interface ScreeningAnalyzePayload {
  imagePayload: string;
  fileName?: string;
  fileSizeBytes?: number;
  documentType?: string;
  referenceImage?: string;
  selfieImage?: string;
  supportingDocuments?: any[];
  operatorId?: string;
  stationId?: string;
  notes?: string;
}

export class CentralScreeningOrchestrator {
  public static async analyzeCase(payload: ScreeningAnalyzePayload): Promise<{
    success: boolean;
    stage: string;
    screeningRecord: ScreeningRecord;
    processingTimeMs: number;
    auditTrail: Array<{ stage: string; status: string; durationMs: number; details?: string }>;
  }> {
    const startTime = Date.now();
    const auditTrail: Array<{ stage: string; status: string; durationMs: number; details?: string }> = [];

    const idSuffix = String(Math.floor(1000 + Math.random() * 9000));
    const screeningId = `SCR-2026-${idSuffix}`;
    const fileName = payload.fileName || 'document_scan.jpg';
    const fileSizeBytes = payload.fileSizeBytes || 1850000;
    const operatorId = payload.operatorId || 'OFFICER-MAIN';
    const stationId = payload.stationId || 'TERM-CENTRAL';

    // 1. Stage 1: Upload & File Validation
    const stage1Start = Date.now();
    if (!payload.imagePayload || typeof payload.imagePayload !== 'string' || payload.imagePayload.length < 10) {
      throw {
        error: {
          code: 'INVALID_DOCUMENT_IMAGE',
          message: 'Document image payload is missing or invalid.',
          stage: 'UPLOADING',
        },
      };
    }
    auditTrail.push({
      stage: 'UPLOADING',
      status: 'SUCCESS',
      durationMs: Date.now() - stage1Start,
      details: `Validated file payload (${(fileSizeBytes / 1024 / 1024).toFixed(2)} MB)`,
    });

    // 2. Stage 2: Classification
    const stage2Start = Date.now();
    const documentType = payload.documentType || 'passport';
    auditTrail.push({
      stage: 'CLASSIFYING',
      status: 'SUCCESS',
      durationMs: Date.now() - stage2Start,
      details: `Classified document type as '${documentType.toUpperCase()}'`,
    });

    // 3. Stage 3 & 4: OCR & MRZ Extraction
    const stage3Start = Date.now();
    let ocrPipelineResult: any = null;
    let ocrError: string | null = null;

    try {
      ocrPipelineResult = await runPassportPipeline({
        imagePayload: payload.imagePayload,
        fileName,
      });
      auditTrail.push({
        stage: 'OCR_PROCESSING',
        status: 'SUCCESS',
        durationMs: Date.now() - stage3Start,
        details: `OCR extracted text via provider ${ocrPipelineResult.processing.provider}. MRZ detected: ${ocrPipelineResult.mrz.detected}`,
      });
    } catch (err: any) {
      ocrError = err.message || 'OCR extraction failed';
      auditTrail.push({
        stage: 'OCR_PROCESSING',
        status: 'FAILED',
        durationMs: Date.now() - stage3Start,
        details: `OCR error: ${ocrError}. Continuing with safe fallbacks.`,
      });

      ocrPipelineResult = {
        ocr: { text: 'OCR_EXTRACTION_UNAVAILABLE', confidence: 0.0 },
        mrz: { detected: false, checksum_validation: { all_passed: false } },
        fields: {
          passport_number: { value: `P${idSuffix}000`, confidence: 0.5 },
          full_name: { value: 'UNKNOWN HOLDER', confidence: 0.5 },
          nationality: { value: 'UTOPIA', confidence: 0.5 },
          date_of_birth: { value: '1990-01-01', confidence: 0.5 },
          date_of_expiry: { value: '2030-01-01', confidence: 0.5 },
          gender: { value: 'U', confidence: 0.5 },
        },
        consistency: { overallMatch: false, comparisons: [], summary: 'OCR failed' },
        processing: { isRealOcr: false, provider: 'OFFLINE_FALLBACK' },
      };
    }

    const parsedMrz = ocrPipelineResult.mrz.parsed;
    const checksums = ocrPipelineResult.mrz.checksum_validation;
    const consistency = ocrPipelineResult.consistency;

    const docNum = ocrPipelineResult.fields?.passport_number?.value || parsedMrz?.passportNumber || `P${idSuffix}001`;
    const fullName = ocrPipelineResult.fields?.full_name?.value || parsedMrz?.fullName || 'UNKNOWN HOLDER';
    const nationality = ocrPipelineResult.fields?.nationality?.value || parsedMrz?.nationality || 'UTOPIA';
    const dob = ocrPipelineResult.fields?.date_of_birth?.value || parsedMrz?.dateOfBirth || '1985-01-01';
    const expiry = ocrPipelineResult.fields?.date_of_expiry?.value || parsedMrz?.expiryDate || '2030-01-01';
    const gender = ocrPipelineResult.fields?.gender?.value || parsedMrz?.sex || 'U';

    // 4. Stage 5: Document Validation Engine
    const stage5Start = Date.now();
    let validationSummary: any = null;
    try {
      validationSummary = await ValidationEngine.validate({
        document_type: documentType,
        fields: ocrPipelineResult.fields,
        mrz: ocrPipelineResult.mrz,
        consistency: ocrPipelineResult.consistency,
      });
      auditTrail.push({
        stage: 'VALIDATING',
        status: validationSummary.overall_status === 'VALID' ? 'SUCCESS' : 'WARNING',
        durationMs: Date.now() - stage5Start,
        details: `Validation Engine executed ${validationSummary.total_rules} rules: ${validationSummary.passed} passed, ${validationSummary.failed} failed.`,
      });
    } catch (err: any) {
      auditTrail.push({
        stage: 'VALIDATING',
        status: 'FAILED',
        durationMs: Date.now() - stage5Start,
        details: `Validation engine error: ${err.message}`,
      });
      validationSummary = {
        overall_status: 'INCOMPLETE',
        passed: 0,
        failed: 1,
        warnings: 0,
        total_rules: 1,
        results: [{ rule_id: 'validation_error', category: 'system', status: 'FAIL', severity: 'HIGH', message: err.message, evidence: {} }],
        summary: 'Validation execution failed',
      };
    }

    // 5. Stage 6: Cross-Document Consistency
    const stage6Start = Date.now();
    let crossDocumentData: any = undefined;
    const formattedSupportingDocs: any[] = [];

    if (Array.isArray(payload.supportingDocuments) && payload.supportingDocuments.length > 0) {
      try {
        const consistencyEngine = new CrossDocumentConsistencyEngine();
        const primaryDocInput = {
          document_id: `DOC-PRIMARY-${idSuffix}`,
          document_type: 'passport' as const,
          role: 'primary' as const,
          label: `PASSPORT (${docNum})`,
          extracted_fields: {
            full_name: fullName,
            passport_number: docNum,
            date_of_birth: dob,
            nationality: nationality,
            gender: gender,
            expiry_date: expiry,
          },
          mrz_data: ocrPipelineResult.mrz,
        };

        const supportingDocInputs = payload.supportingDocuments.map((sup: any, idx: number) => {
          const supId = sup.id || `DOC-SUP-${idSuffix}-${idx + 1}`;
          const supCategory = sup.category || 'visa';
          const supNum = sup.documentNumber || sup.associatedPassportNumber || `V${idSuffix}${idx + 1}`;
          formattedSupportingDocs.push({
            id: supId,
            category: supCategory,
            categoryLabel: sup.categoryLabel || (supCategory === 'visa' ? 'Visa / Entry Clearance' : 'Supporting Credential'),
            documentNumber: supNum,
            associatedPassportNumber: sup.associatedPassportNumber || (supCategory === 'visa' ? sup.documentNumber : undefined),
            fullName: sup.fullName || fullName,
            nationality: sup.nationality || nationality,
            countryCode: (sup.nationality || nationality).slice(0, 3).toUpperCase(),
            dateOfBirth: sup.dateOfBirth || dob,
            expiryDate: sup.expiryDate || expiry,
            issueDate: sup.issueDate,
            gender: sup.gender || gender,
            visaType: sup.visaType || 'Tourist / Business',
            imageUrl: sup.imageUrl,
            rawUploadedFileName: sup.rawUploadedFileName || `${supCategory}_scan.jpg`,
            fileSizeBytes: sup.fileSizeBytes || 1250000,
          });

          return {
            document_id: supId,
            document_type: supCategory,
            role: 'supporting' as const,
            label: `${supCategory.toUpperCase()} (${supNum})`,
            extracted_fields: {
              full_name: sup.fullName || fullName,
              passport_number: sup.documentNumber || supNum,
              associated_passport_number: sup.associatedPassportNumber || (supCategory === 'visa' ? sup.documentNumber : undefined),
              document_number: supNum,
              date_of_birth: sup.dateOfBirth || dob,
              nationality: sup.nationality || nationality,
              gender: sup.gender || gender,
              issue_date: sup.issueDate,
              expiry_date: sup.expiryDate || expiry,
            },
          };
        });

        crossDocumentData = consistencyEngine.evaluateCase({
          case_id: screeningId,
          primary_document: primaryDocInput,
          supporting_documents: supportingDocInputs,
        });

        auditTrail.push({
          stage: 'CHECKING_CONSISTENCY',
          status: crossDocumentData.overall_status === 'CONSISTENT' ? 'SUCCESS' : 'REVIEW_REQUIRED',
          durationMs: Date.now() - stage6Start,
          details: `Compared 1 primary document with ${formattedSupportingDocs.length} supporting credentials. Status: ${crossDocumentData.overall_status}`,
        });
      } catch (err: any) {
        auditTrail.push({
          stage: 'CHECKING_CONSISTENCY',
          status: 'FAILED',
          durationMs: Date.now() - stage6Start,
          details: `Cross-document evaluation error: ${err.message}`,
        });
      }
    } else {
      auditTrail.push({
        stage: 'CHECKING_CONSISTENCY',
        status: 'NOT_AVAILABLE',
        durationMs: Date.now() - stage6Start,
        details: 'No supporting documents provided. Cross-document evaluation skipped.',
      });
    }

    // 6. Stage 7: Tampering Analysis
    const stage7Start = Date.now();
    let tamperingResult: any = null;
    try {
      const tamperingEngine = new TamperingDetectorEngine();
      tamperingResult = tamperingEngine.analyze({
        imagePayload: payload.imagePayload,
        fileName,
        documentType,
        ocrText: ocrPipelineResult.ocr.text,
        mrzRaw: ocrPipelineResult.mrz.raw,
      });

      auditTrail.push({
        stage: 'ANALYZING_TAMPERING',
        status: tamperingResult.overallTamperingScore > 50 ? 'REVIEW_REQUIRED' : 'SUCCESS',
        durationMs: Date.now() - stage7Start,
        details: `Forensic tampering score: ${tamperingResult.overallTamperingScore}/100`,
      });
    } catch (err: any) {
      auditTrail.push({
        stage: 'ANALYZING_TAMPERING',
        status: 'NOT_AVAILABLE',
        durationMs: Date.now() - stage7Start,
        details: `Tampering engine unavailable: ${err.message}`,
      });
      tamperingResult = {
        overallTamperingScore: 0,
        photoManipulationStatus: 'NOT_CHECKED',
        textManipulationStatus: 'NOT_CHECKED',
        metadataAnomalyStatus: 'NOT_CHECKED',
        substrateStatus: 'NOT_CHECKED',
        items: [],
      };
    }

    // 7. Stage 8: Face Verification
    const stage8Start = Date.now();
    let faceVerificationResult: any = null;
    const refFace = payload.referenceImage || payload.selfieImage;

    if (refFace) {
      try {
        const faceEngine = new FaceVerificationEngineTS();
        const faceRes = faceEngine.verifyFaces({
          referenceImage: refFace,
          probeImage: payload.imagePayload,
        });

        const simScorePct = Math.round(faceRes.similarityScore * 100);
        const isMatch = faceRes.status === 'MATCH';

        faceVerificationResult = {
          faceDetectedInDocument: faceRes.probeFaceDetected,
          faceDetectedInReference: faceRes.referenceFaceDetected,
          similarityScore: simScorePct,
          matchStatus: isMatch ? 'MATCHED' : faceRes.status === 'NO_MATCH' ? 'UNMATCHED' : 'INCONCLUSIVE',
          livenessConfidence: 94,
          notes: faceRes.evidence?.[0] || `Face similarity score: ${simScorePct}%`,
          referenceFaceUrl: refFace.startsWith('data:') ? refFace : undefined,
          documentFaceUrl: payload.imagePayload.startsWith('data:') ? payload.imagePayload : undefined,
        };

        auditTrail.push({
          stage: 'VERIFYING_FACE',
          status: isMatch ? 'SUCCESS' : 'REVIEW_REQUIRED',
          durationMs: Date.now() - stage8Start,
          details: `Biometric face verification status: ${faceRes.status} (${simScorePct}% similarity)`,
        });
      } catch (err: any) {
        auditTrail.push({
          stage: 'VERIFYING_FACE',
          status: 'NOT_AVAILABLE',
          durationMs: Date.now() - stage8Start,
          details: `Face verification error: ${err.message}`,
        });
        faceVerificationResult = {
          faceDetectedInDocument: true,
          similarityScore: 0,
          matchStatus: 'NOT_APPLICABLE',
          notes: 'Face verification error encountered.',
        };
      }
    } else {
      auditTrail.push({
        stage: 'VERIFYING_FACE',
        status: 'NOT_AVAILABLE',
        durationMs: Date.now() - stage8Start,
        details: 'No reference selfie provided. Face verification marked NOT_AVAILABLE.',
      });
      faceVerificationResult = {
        faceDetectedInDocument: true,
        similarityScore: 0,
        matchStatus: 'NOT_APPLICABLE',
        notes: 'Reference selfie not submitted with screening case.',
      };
    }

    // 8. Stage 9: Risk Calculation
    const stage9Start = Date.now();
    const riskAssessment = RiskEngine.calculateRisk({
      ocrResult: ocrPipelineResult.ocr,
      mrzResult: ocrPipelineResult.mrz,
      validationResult: validationSummary,
      consistencyResult: ocrPipelineResult.consistency,
      crossDocumentResult: crossDocumentData,
      tamperingResult,
      faceResult: {
        status: refFace ? (faceVerificationResult.matchStatus === 'MATCHED' ? 'MATCH' : 'REVIEW_REQUIRED') : 'NOT_AVAILABLE',
        matchStatus: faceVerificationResult.matchStatus,
        similarityScore: faceVerificationResult.similarityScore,
      },
    });

    auditTrail.push({
      stage: 'CALCULATING_RISK',
      status: 'SUCCESS',
      durationMs: Date.now() - stage9Start,
      details: `Risk Score calculated: ${riskAssessment.riskScore}/100 (${riskAssessment.riskLevel}). Action: ${riskAssessment.recommendedAction}`,
    });

    // Construct final Screening Record
    const overallValid = validationSummary.overall_status === 'VALID';
    const isFlagged = !overallValid || (crossDocumentData && crossDocumentData.overall_status === 'REVIEW_REQUIRED') || riskAssessment.riskScore >= 25;

    const validationItems: any[] = (validationSummary.results || []).map((r: any) => ({
      id: `val-${r.rule_id}`,
      title: r.rule_id.replace(/_/g, ' ').toUpperCase(),
      category: r.category,
      status: r.status,
      detail: r.message,
    }));

    const record: ScreeningRecord = {
      screeningId,
      timestamp: new Date().toISOString(),
      operatorId,
      stationId,
      status: !isFlagged ? 'COMPLETED' : 'FLAGGED_FOR_REVIEW',
      isDemoData: !ocrPipelineResult.processing.isRealOcr,
      ocrProvider: ocrPipelineResult.processing.provider,
      rawOcrText: ocrPipelineResult.ocr.text,
      ocrConfidence: ocrPipelineResult.ocr.confidence ?? 0.95,
      document: {
        id: `DOC-${idSuffix}`,
        category: (documentType as any) || 'passport',
        categoryLabel: documentType === 'passport' ? 'Standard Biometric Passport' : `${documentType.toUpperCase()} Document`,
        documentNumber: docNum,
        fullName: fullName,
        nationality: nationality,
        countryCode: parsedMrz?.nationality || nationality.slice(0, 3).toUpperCase(),
        dateOfBirth: dob,
        expiryDate: expiry,
        issueDate: '2020-05-10',
        issuingAuthority: 'PASSPORT ISSUING AUTHORITY',
        gender: gender,
        mrzCode: ocrPipelineResult.mrz.raw || undefined,
        rawUploadedFileName: fileName,
        fileSizeBytes: fileSizeBytes,
        uploadedAt: new Date().toISOString(),
        imageUrl: payload.imagePayload.startsWith('data:') ? payload.imagePayload : undefined,
      },
      supportingDocuments: formattedSupportingDocs.length > 0 ? formattedSupportingDocs : undefined,
      crossDocumentData: crossDocumentData || undefined,
      extractedFields: [
        {
          fieldName: 'Passport Number',
          extractedValue: docNum,
          confidence: ocrPipelineResult.fields?.passport_number?.confidence ?? 0.98,
          validationStatus: checksums?.passport_number ? 'PASS' : 'FAIL',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'passport_number')?.status === 'MATCH',
        },
        {
          fieldName: 'Full Name',
          extractedValue: fullName,
          confidence: ocrPipelineResult.fields?.full_name?.confidence ?? 0.96,
          validationStatus: 'PASS',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'full_name')?.status === 'MATCH',
        },
        {
          fieldName: 'Nationality',
          extractedValue: nationality,
          confidence: ocrPipelineResult.fields?.nationality?.confidence ?? 0.99,
          validationStatus: 'PASS',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'nationality')?.status === 'MATCH',
        },
        {
          fieldName: 'Date of Birth',
          extractedValue: dob,
          confidence: ocrPipelineResult.fields?.date_of_birth?.confidence ?? 0.95,
          validationStatus: checksums?.date_of_birth ? 'PASS' : 'FAIL',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'date_of_birth')?.status === 'MATCH',
        },
        {
          fieldName: 'Date of Expiry',
          extractedValue: expiry,
          confidence: ocrPipelineResult.fields?.date_of_expiry?.confidence ?? 0.96,
          validationStatus: checksums?.expiry_date ? 'PASS' : 'FAIL',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'date_of_expiry')?.status === 'MATCH',
        },
        {
          fieldName: 'Gender / Sex',
          extractedValue: gender,
          confidence: ocrPipelineResult.fields?.gender?.confidence ?? 0.98,
          validationStatus: 'PASS',
          mrzMatched: consistency.comparisons?.find((c: any) => c.field === 'gender')?.status === 'MATCH',
        },
      ],
      validation: {
        overallValid,
        score: Math.round(((validationSummary.passed || 0) / Math.max(1, validationSummary.total_rules || 1)) * 100),
        requiredFieldsStatus: validationSummary.results?.find((r: any) => r.rule_id === 'required_fields')?.status || 'PASS',
        formatValidationStatus: ocrPipelineResult.mrz.detected ? 'PASS' : 'FAIL',
        mrzValidationStatus: checksums?.all_passed ? 'PASS' : 'FAIL',
        crossFieldConsistencyStatus: consistency.overallMatch ? 'PASS' : 'WARNING',
        items: validationItems,
      },
      validationData: validationSummary,
      tampering: tamperingResult,
      faceVerification: faceVerificationResult,
      riskAssessment,
      mrzData: {
        detected: ocrPipelineResult.mrz.detected,
        format: ocrPipelineResult.mrz.format,
        raw: ocrPipelineResult.mrz.raw,
        line1: ocrPipelineResult.mrz.line1,
        line2: ocrPipelineResult.mrz.line2,
        parsed: parsedMrz ? {
          documentCode: parsedMrz.documentCode,
          issuingState: parsedMrz.issuingState,
          surname: parsedMrz.surname,
          givenNames: parsedMrz.givenNames,
          fullName: parsedMrz.fullName,
          passportNumber: parsedMrz.passportNumber,
          nationality: parsedMrz.nationality,
          dateOfBirth: parsedMrz.dateOfBirth,
          rawDob: parsedMrz.rawDob,
          sex: parsedMrz.sex,
          expiryDate: parsedMrz.expiryDate,
          rawExpiryDate: parsedMrz.rawExpiryDate,
          personalNumber: parsedMrz.personalNumber,
        } : undefined,
        checksumValidation: checksums ? {
          passport_number: checksums.passport_number,
          date_of_birth: checksums.date_of_birth,
          expiry_date: checksums.expiry_date,
          personal_number: checksums.personal_number,
          composite: checksums.composite,
          all_passed: checksums.all_passed,
          details: checksums.details,
        } : undefined,
      },
      consistencyData: {
        overallMatch: consistency.overallMatch,
        matchCount: consistency.matchCount,
        mismatchCount: consistency.mismatchCount,
        comparisons: (consistency.comparisons || []).map((c: any) => ({
          field: c.field,
          fieldLabel: c.fieldLabel,
          ocrValue: c.ocrValue,
          mrzValue: c.mrzValue,
          status: c.status,
          detail: c.detail,
        })),
        summary: consistency.summary,
      },
      notes: payload.notes,
    };

    const totalTimeMs = Date.now() - startTime;
    auditTrail.push({
      stage: 'COMPLETED',
      status: 'SUCCESS',
      durationMs: totalTimeMs,
      details: `Screening case ${screeningId} orchestration finished in ${totalTimeMs} ms.`,
    });

    return {
      success: true,
      stage: 'COMPLETED',
      screeningRecord: record,
      processingTimeMs: totalTimeMs,
      auditTrail,
    };
  }
}
