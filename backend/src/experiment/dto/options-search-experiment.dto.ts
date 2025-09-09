import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderDirection } from '@common/enums/order-direction.enum';
import { ApiProperty } from '@nestjs/swagger';

// DTO for searching and filtering experiment executions
export class OptionsSearchExperimentDto {
  @ApiProperty({
    description: 'The page number for pagination',
    type: String,
    required: false,
    example: '1',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Indicates if the experiment is featured',
    required: false,
    example: true,
  })
  @IsOptional()
  featured?: string;

  @ApiProperty({
    description: 'The order direction for sorting by execution date',
    enum: OrderDirection,
    required: false,
    example: OrderDirection.DESC,
  })
  @IsOptional()
  lastViewed?: string;

  @ApiProperty({
    description: 'The creation date for filtering experiments',
    enum: OrderDirection,
    required: false,
    example: OrderDirection.DESC,
  })
  @IsOptional()
  createdAt?: string;
}
