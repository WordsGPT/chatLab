import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for creating a new LLM model
export class CreateLlmModelDto {
  @ApiProperty({
    description: 'Name of the LLM model',
    example: 'gpt-4',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  name: string;

  @ApiProperty({
    description: 'Name of the LLM provider',
    example: 'OpenAI',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 30)
  providerName: string;

  @ApiProperty({
    description: 'Whether the LLM model is active',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
