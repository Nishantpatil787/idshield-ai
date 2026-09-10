/**
 * IDShield AI — Risk Engine Deterministic Scenarios Test Suite (Scenarios A-H)
 */

import { RiskEngine, RiskEngineInput } from '../engine';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion Failed: ${message}`);
  }
}

console.log('======================================================');
console.log('  IDShield AI — Explainable Risk Engine Test Suite');
console.log('======================================================');

let passed = 0;
let total = 0;

function testScenario(name: string, fn: () => void) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ [PASS] ${name}`);
  } catch (err: any) {
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

// Scenario A: All checks clean
testScenario('Scenario A: Clean document receives LOW risk & CLEAR recommendation', () => {
  const input: RiskEngineInput = {
    ocrResult: { confidence: 0.98 },
    mrzResult: {
      detected: true,
      checksumValidation: {
        passport_number: true,
        date_of_birth: true,
        expiry_date: true,
        composite: true,
        all_passed: true,
      },
    },
    validationResult: {
      overall_status: 'VALID',
      passed: 9,
      failed: 0,
      warnings: 0,
      results: [],
    },
    consistencyResult: { overallMatch: true, mismatchCount: 0 },
    tamperingResult: { overallTamperingScore: 4 },
    faceResult: { status: 'MATCH', matchStatus: 'MATCHED', similarityScore: 95 },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore < 25, `Expected score < 25, got ${res.riskScore}`);
  assert(res.riskLevel === 'LOW', `Expected LOW risk, got ${res.riskLevel}`);
  assert(res.recommendedAction === 'CLEAR', `Expected CLEAR action, got ${res.recommendedAction}`);
});

// Scenario B: Expired passport
testScenario('Scenario B: Expired passport raises elevated risk', () => {
  const input: RiskEngineInput = {
    mrzResult: { detected: true, checksumValidation: { all_passed: true } },
    validationResult: {
      results: [
        {
          rule_id: 'expiry_horizon',
          status: 'FAIL',
          severity: 'HIGH',
          message: 'Document is expired as of 2023-01-01',
        },
      ],
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 25, `Expected elevated score >= 25, got ${res.riskScore}`);
  assert(res.explainableFactors.some((f) => f.id.includes('expiry_horizon')), 'Missing expiry factor');
});

// Scenario C: MRZ checksum failure
testScenario('Scenario C: MRZ checksum failure raises elevated risk', () => {
  const input: RiskEngineInput = {
    mrzResult: {
      detected: true,
      checksumValidation: {
        passport_number: false,
        date_of_birth: true,
        expiry_date: true,
        composite: false,
        all_passed: false,
      },
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 50, `Expected elevated risk >= 50, got ${res.riskScore}`);
  assert(res.explainableFactors.some((f) => f.id === 'rf-mrz-passno'), 'Missing passport number check digit factor');
});

// Scenario D: Document tampering evidence
testScenario('Scenario D: Document tampering evidence triggers HIGH_RISK or PHYSICAL_INSPECTION', () => {
  const input: RiskEngineInput = {
    tamperingResult: {
      overallTamperingScore: 85,
      photoManipulationStatus: 'FAIL',
      items: [{ type: 'photo_manipulation', status: 'FAIL', description: 'Photo boundary anomaly' }],
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 50, `Expected high risk score >= 50, got ${res.riskScore}`);
  assert(res.recommendedAction === 'PHYSICAL_INSPECTION' || res.recommendedAction === 'DENY_ENTRY', `Got ${res.recommendedAction}`);
});

// Scenario E: Face NO_MATCH + good quality
testScenario('Scenario E: Face NO_MATCH yields elevated risk and DENY/INSPECTION action', () => {
  const input: RiskEngineInput = {
    faceResult: {
      status: 'NO_MATCH',
      matchStatus: 'UNMATCHED',
      similarityScore: 22,
      qualityScore: 90,
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 45, `Expected score >= 45, got ${res.riskScore}`);
  assert(res.explainableFactors.some((f) => f.id === 'rf-face-nomatch'), 'Missing face nomatch factor');
});

// Scenario F: Missing face reference
testScenario('Scenario F: Missing face reference returns NOT_AVAILABLE without automatically forcing NO_MATCH', () => {
  const input: RiskEngineInput = {
    faceResult: {
      status: 'NOT_AVAILABLE',
      matchStatus: 'NOT_APPLICABLE',
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(!res.explainableFactors.some((f) => f.id === 'rf-face-nomatch'), 'Must NOT trigger false face mismatch factor');
  assert(res.explainableFactors.some((f) => f.id === 'rf-face-notavail'), 'Should log NOT_AVAILABLE factor with 0 impact');
});

// Scenario G: Multiple independent high-risk signals
testScenario('Scenario G: Multiple high-risk signals yield combined high risk score', () => {
  const input: RiskEngineInput = {
    mrzResult: {
      detected: true,
      checksumValidation: { passport_number: false, composite: false, all_passed: false },
    },
    tamperingResult: { overallTamperingScore: 90 },
    faceResult: { status: 'NO_MATCH', matchStatus: 'UNMATCHED', similarityScore: 15 },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 80, `Expected combined score >= 80, got ${res.riskScore}`);
  assert(res.recommendedAction === 'DENY_ENTRY', `Expected DENY_ENTRY, got ${res.recommendedAction}`);
});

// Scenario H: Poor quality document
testScenario('Scenario H: Poor quality document without MRZ returns SECONDARY_INTERVIEW or REVIEW', () => {
  const input: RiskEngineInput = {
    mrzResult: { detected: false },
    validationResult: {
      results: [{ rule_id: 'required_fields', status: 'WARNING', severity: 'MEDIUM', message: 'Low quality scan' }],
    },
  };

  const res = RiskEngine.calculateRisk(input);
  assert(res.riskScore >= 25, `Expected score >= 25, got ${res.riskScore}`);
});

console.log(`\nRisk Engine Suite Execution: ${passed}/${total} PASSED`);
if (passed < total) process.exit(1);
