import { applyDecorators } from '@nestjs/common';
import { Min, Max } from 'class-validator';

// Decorator to validate that a number is within a specified range
export function Range(min: number, max: number) {
  return applyDecorators(Min(min), Max(max));
}
