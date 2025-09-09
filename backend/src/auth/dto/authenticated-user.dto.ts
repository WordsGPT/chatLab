import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@users/enums/user-role.enum';

// DTO for transfer user data after authentication
export class AuthenticatedUserDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: 'e7b2fcfd-6d6d-4caf-927b-9d842c60eb70',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'alex@gmail.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'alex',
    minLength: 3,
    maxLength: 30,
  })
  username: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;
}
