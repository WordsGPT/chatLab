import { IsArray, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for creating executions
export class CreateExecutionDto {
  @ApiProperty({
    description: 'The input values for the execution',
    type: 'object',
    additionalProperties: { type: 'string' },
    example: { variable1: 'value1', variable2: 'value2' },
  })
  @IsNotEmpty()
  @IsObject()
  inputValues: Record<string, string>;

  @ApiProperty({
    description: 'The prompts to be used in the execution',
    type: [String],
    example: ['Prompt 1', 'Prompt 2'],
  })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  prompts: string[];
}
