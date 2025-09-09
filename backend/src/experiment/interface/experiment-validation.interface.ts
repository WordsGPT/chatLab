import { VariableValidation } from '@experiment-variable/interface/variable-validation.interface';

// This interface is used for validating experiment properties
export interface ExperimentValidation {
  type: 'object';
  properties: Record<string, VariableValidation>;
  required?: string[];
}
