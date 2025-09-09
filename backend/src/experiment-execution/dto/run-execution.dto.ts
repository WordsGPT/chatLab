import { IsEnum, IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExecutionStatus } from '@experiment-execution/enums/execution-status.enum';

// This DTO is used for running an execution
export class RunExecutionDto {
  @ApiProperty({
    description: 'The UUID for the execution',
    type: 'string',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  id: string;

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
    description: 'The status of the execution',
    enum: ExecutionStatus,
    example: ExecutionStatus.LOADING,
  })
  @IsNotEmpty()
  @IsEnum(ExecutionStatus)
  status: ExecutionStatus;
}
