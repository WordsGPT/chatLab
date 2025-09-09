import { IsNotEmpty, IsNumber, IsPositive, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for creating prompts
export class CreatePromptDto {
  @ApiProperty({
    description: 'The text of the prompt',
    example: 'What is the capital of France?',
  })
  @IsNotEmpty()
  @IsString()
  prompt: string;

  @ApiProperty({
    description: 'The order of the prompt',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  promptOrder: number;
}
