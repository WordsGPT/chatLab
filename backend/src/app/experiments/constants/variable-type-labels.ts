import { VariableType } from '@experiments/enums/variable-type.enum';

// This constant is used for the labels for variable types
export const VARIABLE_TYPE_LABELS: Record<VariableType, string> = {
  [VariableType.STRING]: 'Text',
  [VariableType.NUMBER]: 'Number',
  [VariableType.BOOLEAN]: 'Boolean',
  [VariableType.OBJECT]: 'Object',
  [VariableType.STRING_ARRAY]: 'Set of texts',
  [VariableType.NUMBER_ARRAY]: 'Set of numbers',
  [VariableType.BOOLEAN_ARRAY]: 'Set of booleans',
  [VariableType.OBJECT_ARRAY]: 'Set of objects',
};