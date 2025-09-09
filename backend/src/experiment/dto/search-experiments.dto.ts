import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for searching experiments
export class SearchExperimentsDto {
  @ApiProperty({
    description: 'The unique identifier of the experiment',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

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
    description: 'Whether the experiment is featured or not',
    example: true,
  })
  @IsBoolean()
  featured: boolean;

  @ApiProperty({
    description: 'The last view date of the experiment',
    example: '2023-10-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsString()
  lastViewed: Date;
}
