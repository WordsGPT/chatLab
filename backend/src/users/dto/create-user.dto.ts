import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { RegisterDto } from '@auth/dto/register.dto';

import { UserRole } from '@users/enums/user-role.enum';

// This DTO is used for creating a new user
export class CreateUserDto extends RegisterDto {
  @ApiProperty({
    description: 'Role to assign to the user',
    enum: UserRole,
    example: UserRole.USER,
    required: false,
    default: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
