import { ValidationVariableType } from "@experiments/enums/validation-variable-type.enum";
import { VariableType } from "@experiments/enums/variable-type.enum";

// This constant is used for mapping variable types to their validation counterparts
export const VARIABLE_TO_VALIDATION_MAP: Record<VariableType, ValidationVariableType> = {
  [VariableType.STRING]: ValidationVariableType.STRING,
  [VariableType.NUMBER]: ValidationVariableType.NUMBER,
  [VariableType.BOOLEAN]: ValidationVariableType.BOOLEAN,
  [VariableType.OBJECT]: ValidationVariableType.OBJECT,
  [VariableType.STRING_ARRAY]: ValidationVariableType.ARRAY,
  [VariableType.NUMBER_ARRAY]: ValidationVariableType.ARRAY,
  [VariableType.BOOLEAN_ARRAY]: ValidationVariableType.ARRAY,
  [VariableType.OBJECT_ARRAY]: ValidationVariableType.ARRAY,
};