import { IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RunExecutionDto } from '@experiment-execution/dto/run-execution.dto';

// This DTO is used for the response after running an execution
export class RunExecutionResponseDto extends RunExecutionDto {
  @ApiProperty({
    description: 'The results of the execution per model',
    type: 'object',
    additionalProperties: {
      type: 'array',
      items: { type: 'string' },
      example: ['Result A', 'Result B', 'Result C'],
    },
    example: {
      'gpt-4': ['Result A1', 'Result A2'],
      'llama-2': ['Result B1', 'Result B2'],
    },
  })
  @IsOptional()
  @IsObject()
  results?: Record<string, string[]>;
}
