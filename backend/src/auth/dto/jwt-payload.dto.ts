import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@users/enums/user-role.enum';

// DTO for structure the JWT payload used in authentication
export class JwtPayloadDto {
  @ApiProperty({
    description: 'Subject (user ID) from the JWT token',
    example: 'e7b2fcfd-6d6d-4caf-927b-9d842c60eb70',
    format: 'uuid',
  })
  sub: string;

  @ApiProperty({
    description: 'Email address from the JWT token',
    example: 'alex@gmail.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Username from the JWT token',
    example: 'alex',
  })
  username: string;

  @ApiProperty({
    description: 'User role from the JWT token',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'Token issued at timestamp (optional)',
    example: 1640995200,
    required: false,
  })
  iat?: number;

  @ApiProperty({
    description: 'Token expiration timestamp (optional)',
    example: 1641081600,
    required: false,
  })
  exp?: number;
}
