import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { Range } from '@common/decorators/range.decorator';

// This DTO is used for configuring the LLM
export class LLMConfigDto {
  @ApiProperty({
    description: 'The temperature for the LLM',
    example: 1.0,
  })
  @IsNumber()
  @IsOptional()
  @Range(0, 2)
  temperature?: number;

  @ApiProperty({
    description: 'The top_p for the LLM',
    example: 1.0,
  })
  @IsNumber()
  @IsOptional()
  @Range(0, 1)
  top_p?: number;

  @ApiProperty({
    description: 'The max_tokens for the LLM',
    example: 4096,
  })
  @IsNumber()
  @IsOptional()
  @Min(1)
  max_tokens?: number;
}
