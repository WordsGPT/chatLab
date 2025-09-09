import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { LLMConfigDto } from '@experiment/dto/llm-config.dto';

import { ExperimentVariableDto } from '@experiment-variable/dto/experiment-variable.dto';

import { CreatePromptDto } from '@prompt/dto/create-prompt.dto';

// This DTO is used for creating experiments
export class CreateExperimentDto {
  @ApiProperty({
    description: 'The name of the experiment',
    example: 'My Experiment',
  })
  @IsNotEmpty()
  @IsString()
  @Length(1, 100)
  name: string;

  @ApiProperty({
    description: 'The description of the experiment',
    example: 'This is a description of my experiment',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The LLM configuration for the experiment',
    type: LLMConfigDto,
  })
  llmConfigs: LLMConfigDto;

  @ApiProperty({
    description: 'The models used in the experiment',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  models: string[];

  @ApiProperty({
    description: 'The prompts used in the experiment',
    type: [CreatePromptDto],
  })
  prompts: CreatePromptDto[];

  @ApiProperty({
    description: 'The variables used in the experiment',
    type: [ExperimentVariableDto],
  })
  variables: ExperimentVariableDto[];
}
