import { RuleRegistry, PASSPORT_RULES } from '../rules/registry';
import { DEFAULT_VALIDATION_CONFIG, createValidationConfig } from '../schemas/config';
import {
  DocumentValidationOverallStatus,
  DocumentValidationSummary,
  StructuredPassportInput,
  ValidationConfig,
  ValidationRuleResult,
} from '../schemas/validationTypes';

export interface ValidationOptions {
  configOverride?: Partial<ValidationConfig>;
  customRegistry?: RuleRegistry;
}

export class ValidationEngine {
  private registry: RuleRegistry;
  private config: ValidationConfig;

  constructor(options?: ValidationOptions) {
    this.registry = options?.customRegistry || new RuleRegistry(PASSPORT_RULES);
    this.config = createValidationConfig(options?.configOverride);
  }

  /**
   * Primary entry point: Runs all applicable deterministic passport validation rules
   */
  async validatePassport(
    input: StructuredPassportInput,
    options?: ValidationOptions
  ): Promise<DocumentValidationSummary> {
    const activeConfig = options?.configOverride
      ? createValidationConfig({ ...this.config, ...options.configOverride })
      : this.config;

    const registryToUse = options?.customRegistry || this.registry;
    const rules = registryToUse.getAllRules();

    const results: ValidationRuleResult[] = [];

    // Execute each rule sequentially (or parallelized safely)
    for (const rule of rules) {
      try {
        const result = await rule.execute(input, activeConfig);
        results.push(result);
      } catch (err: any) {
        // Never convert engine exceptions into a false PASS
        results.push({
          rule_id: rule.id,
          category: rule.category,
          status: 'FAIL',
          severity: 'HIGH',
          message: `Rule execution error encountered: ${err.message || 'Unknown error'}`,
          evidence: { error: String(err) },
        });
      }
    }

    let passed = 0;
    let warnings = 0;
    let failed = 0;
    let not_checked = 0;

    for (const res of results) {
      if (res.status === 'PASS') passed++;
      else if (res.status === 'WARNING') warnings++;
      else if (res.status === 'FAIL') failed++;
      else if (res.status === 'NOT_CHECKED') not_checked++;
    }

    // Determine overall status
    let overall_status: DocumentValidationOverallStatus = 'VALID';

    // Incomplete document check (e.g. no passport number and no full name)
    const hasCoreData = Boolean(
      input.fields?.passport_number?.value ||
      input.fields?.full_name?.value ||
      input.mrz?.parsed?.passportNumber ||
      input.mrz?.parsed?.fullName
    );

    if (!hasCoreData || (not_checked > 0 && passed === 0 && failed === 0 && warnings === 0)) {
      overall_status = 'INCOMPLETE';
    } else if (failed > 0) {
      overall_status = 'INVALID';
    } else if (warnings > 0) {
      overall_status = 'WARNING';
    } else if (passed > 0) {
      overall_status = 'VALID';
    } else {
      overall_status = 'NOT_CHECKED';
    }

    // Construct human-readable summary
    let summaryText = '';
    if (overall_status === 'VALID') {
      summaryText = `Document passed all ${passed} deterministic checks with zero anomalies or checksum failures.`;
    } else if (overall_status === 'WARNING') {
      summaryText = `Document verified with ${warnings} advisory warning(s) requiring operator notice.`;
    } else if (overall_status === 'INVALID') {
      summaryText = `Document validation failed on ${failed} deterministic rule(s). Secondary physical verification required.`;
    } else if (overall_status === 'INCOMPLETE') {
      summaryText = 'Insufficient credential fields available to perform complete deterministic validation.';
    } else {
      summaryText = 'Document validation not completed.';
    }

    return {
      overall_status,
      passed,
      warnings,
      failed,
      not_checked,
      total_rules: results.length,
      results,
      summary: summaryText,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Static helper for direct one-shot validation
   */
  static async validate(
    input: StructuredPassportInput,
    options?: ValidationOptions
  ): Promise<DocumentValidationSummary> {
    const engine = new ValidationEngine(options);
    return engine.validatePassport(input, options);
  }
}
