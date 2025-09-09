import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

// DTO for user registration
export class RegisterDto {
  @ApiProperty({
    description: 'Email address for the new account',
    example: 'john@example.com',
    format: 'email',
    maxLength: 254,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @ApiProperty({
    description: 'Username for the new account',
    example: 'john_doe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @Length(3, 30)
  username: string;

  @ApiProperty({
    description: 'Password for the new account',
    example: 'mySecurePassword123',
    minLength: 4,
    maxLength: 255,
    format: 'password',
  })
  @IsString()
  @Length(4, 255)
  password: string;
}
