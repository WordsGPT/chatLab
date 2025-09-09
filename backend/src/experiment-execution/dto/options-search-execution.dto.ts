import { IsInt, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ExecutionStatus } from '@experiment-execution/enums/execution-status.enum';
import { OrderDirection } from '@common/enums/order-direction.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Range } from '@common/decorators/range.decorator';

// DTO for searching and filtering experiment executions
export class OptionsSearchExecutionDto {
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
    description: 'The status of the execution',
    enum: ExecutionStatus,
    required: false,
    example: ExecutionStatus.FINISHED,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Range(0, 3)
  status?: number;

  @ApiProperty({
    description: 'The order direction for sorting by execution date',
    enum: OrderDirection,
    required: false,
    example: OrderDirection.DESC,
  })
  @IsOptional()
  executedAt?: string;
}
