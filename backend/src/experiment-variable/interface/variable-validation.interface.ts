import { ValidationVariableType } from '@experiment-variable/enums/validation-variable-type.enum';

// This interface is used for validating variable properties
export interface VariableValidation {
  type: ValidationVariableType;
  description?: string;
  required?: boolean;

  // String validations
  minLength?: number;
  maxLength?: number;
  format?: string;
  pattern?: string;

  // Number validations
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: number;
  exclusiveMaximum?: number;

  // Array validations
  items?: VariableValidation;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;

  // Object validations
  properties?: Record<string, object>;
  minProperties?: number;
  maxProperties?: number;
}
