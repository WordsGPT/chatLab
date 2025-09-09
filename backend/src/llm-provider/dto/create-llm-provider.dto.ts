import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for creating a new LLM provider
export class CreateLlmProviderDto {
  @ApiProperty({
    description: 'Name of the LLM provider',
    example: 'OpenAI',
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 30)
  name: string;

  @ApiProperty({
    description: 'Image URL of the LLM provider',
    example: '/static/providers/openai.png',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  image?: string;

  @ApiProperty({
    description: 'Whether the LLM provider is active',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
