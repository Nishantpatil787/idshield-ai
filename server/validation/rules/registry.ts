import { IValidationRule } from './baseRule';
import { PassportRequiredFieldsRule } from './passport/requiredFieldsRule';
import { PassportNumberRule } from './passport/passportNumberRule';
import { PassportDateRule } from './passport/dateRule';
import { PassportExpiryRule } from './passport/expiryRule';
import { PassportNationalityRule } from './passport/nationalityRule';
import { PassportGenderRule } from './passport/genderRule';
import { PassportMrzChecksumRule } from './passport/mrzChecksumRule';
import { PassportOcrMrzConsistencyRule } from './passport/ocrMrzConsistencyRule';
import { PassportCrossFieldRule } from './passport/crossFieldRule';

export const PASSPORT_RULES: IValidationRule[] = [
  new PassportRequiredFieldsRule(),
  new PassportNumberRule(),
  new PassportDateRule(),
  new PassportExpiryRule(),
  new PassportNationalityRule(),
  new PassportGenderRule(),
  new PassportMrzChecksumRule(),
  new PassportOcrMrzConsistencyRule(),
  new PassportCrossFieldRule(),
];

export class RuleRegistry {
  private rules: Map<string, IValidationRule> = new Map();

  constructor(initialRules: IValidationRule[] = PASSPORT_RULES) {
    for (const rule of initialRules) {
      this.registerRule(rule);
    }
  }

  registerRule(rule: IValidationRule): void {
    this.rules.set(rule.id, rule);
  }

  unregisterRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  getRule(ruleId: string): IValidationRule | undefined {
    return this.rules.get(ruleId);
  }

  getAllRules(): IValidationRule[] {
    return Array.from(this.rules.values());
  }

  getRulesByCategory(category: string): IValidationRule[] {
    return this.getAllRules().filter((r) => r.category === category);
  }
}
