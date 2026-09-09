import { StructuredPassportInput, ValidationConfig, ValidationRuleResult } from '../schemas/validationTypes';

export interface IValidationRule {
  readonly id: string;
  readonly name: string;
  readonly category: 'required_fields' | 'passport_number' | 'dates' | 'expiry' | 'nationality' | 'gender' | 'mrz_checksum' | 'consistency' | 'cross_field';
  readonly description: string;

  execute(input: StructuredPassportInput, config: ValidationConfig): Promise<ValidationRuleResult> | ValidationRuleResult;
}
