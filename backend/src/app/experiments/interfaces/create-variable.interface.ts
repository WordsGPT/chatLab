import { ValidationVariableType } from "@experiments/enums/validation-variable-type.enum";
import { VariableType } from "@experiments/enums/variable-type.enum";

// Interface for representing a variable in the experiment
export interface CreateVariable {
  name: string;
  type: VariableType;
  validations: {
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
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;

    // Object validations
    properties?: Record<string, object>;
    minProperties?: number;
    maxProperties?: number;
  };
}