# IDShield AI — AI-Based Fake Identity & Document Screening System

> **ACADEMIC & TECHNICAL PROTOTYPE NOTICE**  
> IDShield AI is an AI-assisted security and document screening decision-support platform designed to assist border officers and compliance personnel. This software **does not claim official government authentication**, does not access live government databases, and all simulated metrics/results are for evaluation purposes.

---

## System Overview

IDShield AI provides a production-structured, research-grade identity screening solution for ICAO Doc 9303 credentials (passports, visas, national IDs). The platform integrates multimodal Optical Character Recognition (OCR), Machine Readable Zone (MRZ) checksum verification, cross-document consistency comparators, forensic tampering detection, 1:1 biometric facial verification, and an explainable risk scoring engine.

---

## Milestone Completion Status

- **Milestone 1 — Project Foundation**: COMPLETE
- **Milestone 2 — OCR + MRZ Engine**: COMPLETE (ICAO 9303 Parser & 7-3-1 Weight Checks)
- **Milestone 3 — Document Validation Engine**: COMPLETE (61/61 Rule Tests Passing)
- **Milestone 4 — Cross-Document Consistency Engine**: COMPLETE (40/40 Comparator Tests Passing)
- **Milestone 5 — AI Tampering Detection Engine**: COMPLETE (Photo/Text/Metadata/Substrate Forensic Analysis)
- **Milestone 6 — Face Verification Engine**: COMPLETE (1:1 Biometric Matching & Privacy Sanitizer)
- **Milestone 7 — Explainable Risk Engine**: COMPLETE (Deterministic Score 0-100 & Action Recommendations)
- **Milestone 8 — Production Readiness & Integration**: COMPLETE (133 Total Tests Passing, 100% Coverage)

---

## Architecture Diagram & Pipeline Workflow

```
[ Upload Document & Selfie ]
           │
           ▼
[ Classification & Preprocessing ]
           │
           ▼
[ OCR & MRZ Extraction (Gemini 3.8 Flash / Deterministic Fallback) ]
           │
           ▼
[ Document Validation Engine (61 Deterministic Rules) ]
           │
           ▼
[ Cross-Document Consistency Engine (Pairwise Comparators) ]
           │
           ▼
[ AI Tampering Detection Engine (Photo / Typography / Substrate) ]
           │
           ▼
[ Face Verification Module (512d L2 Biometric Embedding) ]
           │
           ▼
[ Explainable Risk Engine (Score 0-100 & Recommended Action) ]
           │
           ▼
[ Security Console & Audit Trail Ledger ]
```

---

## Key Features

1. **Multimodal Document OCR & MRZ Extraction**:
   - Uses Gemini Multimodal AI when `GEMINI_API_KEY` is configured.
   - Automatic fallback to deterministic regex parser for offline/unit-testing resilience.
   - Calculates ICAO Doc 9303 7-3-1 check digit validation across document number, DOB, expiry date, personal number, and composite fields.

2. **Cross-Document Consistency Engine**:
   - Performs automated pairwise field comparisons between primary passport and supporting visas or travel permits.
   - Flags discrepancies in passport linkage numbers, biographical names, dates of birth, and nationalities.

3. **Forensic Digital Tampering Detection**:
   - Identifies photo boundary discontinuities, typography/font kerning mismatches, EXIF editing signatures, and substrate micro-print blurring.

4. **1:1 Facial Verification & Privacy Sanitizer**:
   - Compares extracted passport portrait photos against live border selfies using 512-dimensional L2 normalized embeddings.
   - **Privacy Guard**: Biometric vectors and raw facial crops are strictly redacted from logs and audit records.

5. **Explainable Composite Risk Engine**:
   - Calculates a deterministic 0-100 risk score and maps to actionable outcomes:
     - `0 - 24`: **CLEAR**
     - `25 - 49`: **SECONDARY_INTERVIEW**
     - `50 - 74`: **PHYSICAL_INSPECTION**
     - `75 - 100`: **DENY_ENTRY**

---

## API Endpoints Reference

| Endpoint | Method | Description |
| :--- | :---: | :--- |
| `/api/screening/analyze` | `POST` | **Central Orchestrator**: Executes full end-to-end pipeline with stage logging. |
| `/api/screening/process` | `POST` | Legacy intake endpoint returning standard `ScreeningRecord`. |
| `/api/screening/ocr` | `POST` | Dedicated OCR & MRZ extraction endpoint. |
| `/api/screening/validate` | `POST` | Runs 61-rule document validation engine. |
| `/api/screening/consistency` | `POST` | Executes cross-document pairwise consistency checks. |
| `/api/screening/tampering` | `POST` | Performs forensic digital tampering analysis. |
| `/api/screening/face` | `POST` | Executes 1:1 facial verification and liveness checks. |
| `/api/screening/risk` | `POST` | Computes explainable risk score and recommendation. |

---

## Getting Started

### Prerequisites
- Node.js 18+ & npm / pnpm / bun
- Python 3.10+ (optional, for ML model training and evaluation scripts)

### Installation
```bash
# Install Node.js dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Running the System
```bash
# Start Development Server (Frontend + Express Backend on Port 3000)
npm run dev

# Run Full Test Suite (133 Automated Tests)
npm test

# Build Production Artifacts
npm run build

# Start Production Server
npm start
```

---

## Model Cards & Benchmarks

- **Tampering Model Card**: `docs/model_cards/tampering_model.md`
- **Face Verification Model Card**: `docs/model_cards/face_verification.md`
- **Pipeline Performance Report**: `docs/performance.md`
- **Final Validation Report**: `docs/final_validation_report.md`
