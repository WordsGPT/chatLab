import { IsEnum, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { VariableType } from '@experiment-variable/enums/variable-type.enum';
import { VariableValidation } from '@experiment-variable/interface/variable-validation.interface';
import { ValidationVariableType } from '@experiment-variable/enums/validation-variable-type.enum';

// This DTO is used for creating a new experiment variable
export class ExperimentVariableDto {
  @ApiProperty({
    description: 'The name of the experiment variable',
    example: 'Number of trials',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'The type of the experiment variable',
    enum: VariableType,
    example: VariableType.NUMBER,
  })
  @IsEnum(VariableType)
  type: VariableType;

  @ApiProperty({
    description: 'The validation rules for the experiment variable',
    example: {
      type: ValidationVariableType.NUMBER,
      required: true,
      minimum: 1,
      maximum: 100,
    },
    required: false,
  })
  validations: VariableValidation;
}
