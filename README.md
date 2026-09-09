# IDShield AI — AI-Based Fake Identity & Document Screening System

> **ACADEMIC & TECHNICAL PROTOTYPE NOTICE**  
> IDShield AI is a security-focused academic and experimental prototype designed to assist authorized personnel with identity and travel-document screening workflows. This software **does not claim official government authentication**, does not access live government border databases, and simulated metrics/results are for evaluation and development purposes.

---

## 1. Problem Statement
Cross-border identity verification and document authentication face increasing threats from sophisticated synthetic identity forgery, photo substitution, typography manipulation, and digital tampering. Security personnel require unified, high-density decision support interfaces that aggregate optical character recognition (OCR), Machine Readable Zone (MRZ) checksum validation, forensic tampering indicators, and biometric matching into clear, explainable risk assessments.

---

## 2. Project Objective
To design and build an AI-assisted screening console for identity and travel credentials that provides:
- Structured multi-stage document ingestion and inspection workflows.
- Standardized verification rules for international travel documents (ICAO Doc 9303).
- Tampering and manipulation anomaly indicators.
- Biometric facial correlation and liveness confidence signals.
- Explainable composite risk scoring (Low, Medium, High) with actionable decision recommendations.

---

## 3. Target Document Categories
- **Passports** (ICAO Doc 9303 Standard Machine-Readable Passports)
- **Visas & Electronic Travel Authorizations** (e-Visas, Consular Stamps)
- **National Identity Cards** (State IDs with Hologram & MRZ)
- **Driving Licences** (Physical & Digital Driver Credentials, AAMVA Standard)
- **Permits & Cross-Border Authorizations** (Temporary Residency & Transit Permits)

---

## 4. Planned AI & Verification Pipeline
1. **Document Classification**: Automatic format and issuing authority detection.
2. **OCR Extraction**: Visual inspection zone (VIZ) text and field parsing.
3. **MRZ Extraction & Parity Validation**: 7-3-1 weight factor checksum calculation.
4. **Document Rule Validation**: Expiration horizon, mandatory field presence, and serial schema checks.
5. **Cross-Document Consistency Checking**: Visual text vs barcode/MRZ vs security substrate comparison.
6. **AI-Based Tampering Detection**: Error Level Analysis (ELA), edge discontinuity, clone stamping, and typography kerning anomaly detection.
7. **Metadata & Exif Analysis**: File compression signatures and software re-saving traces.
8. **Facial Landmark & Biometric Matching**: Cosine similarity between physical photo and biometric live capture.
9. **Explainable Risk Scoring Engine**: Composite score aggregation with individual factor impact point weighting.

---

## 5. Development Status
- **Current Phase**: **Phase 1 — Project Foundation & Security UI Shell**
- **Implemented Capabilities**:
  - Centralized TypeScript domain architecture (`/src/types/`).
  - Modular API service layer abstraction (`/src/services/api.ts`).
  - High-information-density dark security console interface.
  - Operational Dashboard with live risk distribution charts and telemetry.
  - Document Intake & Intake form (`/src/pages/NewScreeningPage.tsx`).
  - Multi-section Diagnostic Result View (`/src/pages/ScreeningResultPage.tsx`).
  - Searchable & filterable Screening History Ledger (`/src/pages/ScreeningHistoryPage.tsx`).
  - Configurable System, AI Threshold, and Document Rules Console (`/src/pages/SettingsPage.tsx`).
  - Prominent regulatory disclaimer banners across all views.

---

## 6. Architecture & File Structure

```
├── index.html                    # Entry HTML with meta titles & fonts
├── metadata.json                 # Application metadata & platform settings
├── package.json                  # Dependencies & npm scripts
├── src/
│   ├── App.tsx                   # Main console router & page state
│   ├── main.tsx                  # React DOM entry point
│   ├── index.css                 # Global CSS with Tailwind utility classes
│   ├── types/
│   │   └── index.ts              # Domain interfaces & TypeScript types
│   ├── data/
│   │   ├── mockScreenings.ts     # Realistic demo screening dataset
│   │   └── defaultSettings.ts    # Default threshold & pipeline settings
│   ├── services/
│   │   └── api.ts                # Centralized async API service layer
│   ├── layouts/
│   │   └── ConsoleLayout.tsx     # Security console shell, topbar & sidebar
│   ├── components/
│   │   ├── DisclaimerBanner.tsx  # Regulatory disclaimer banner component
│   │   ├── StatCard.tsx          # High-density metric display cards
│   │   ├── RiskBadge.tsx         # Low/Medium/High risk indicators
│   │   ├── StatusBadge.tsx       # Screening status tags
│   │   ├── ValidationStatusPill.tsx # Pass/Warning/Fail validation pills
│   │   └── RiskDistributionChart.tsx # Multi-spectrum risk distribution
│   └── pages/
│       ├── DashboardPage.tsx     # Operational overview & recent feed
│       ├── NewScreeningPage.tsx  # Document intake & drag-and-drop form
│       ├── ScreeningResultPage.tsx # 5-section diagnostic inspection view
│       ├── ScreeningHistoryPage.tsx# Searchable audit ledger & CSV export
│       └── SettingsPage.tsx      # Rules & AI threshold configuration
```

---

## 7. Tech Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS (Dark Security Console Archetype)
- **Icons**: Lucide React
- **Build Tool**: Vite

---

## 8. Local Development Instructions
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build
```

---

## 9. Regulatory & Legal Disclaimer
IDShield AI is strictly an experimental educational and screening workflow evaluation system. It does not replace human border control officers, does not provide legal determination of identity, and must not be used as an official authentication platform without certified government backend database integrations and compliance certifications.
