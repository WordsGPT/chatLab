import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for searching prompts
export class SearchPromptDto {
  @ApiProperty({
    description: 'The text of the prompt',
    example: 'What is the capital of France?',
  })
  @IsNotEmpty()
  @IsString()
  prompt: string;
}
