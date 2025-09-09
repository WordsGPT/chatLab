import { IsNotEmpty, IsString, Length } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

// This DTO is used for changing the user's password
export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password of the user',
    example: 'currentPassword123',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'newSecurePassword456',
    format: 'password',
    minLength: 4,
    maxLength: 255,
  })
  @IsString()
  @Length(4, 255)
  newPassword: string;
}
