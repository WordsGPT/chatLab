import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';

import { CreateUserDto } from '@users/dto/create-user.dto';

// This DTO is used for updating an existing user
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Refresh token for the user (optional for update)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
