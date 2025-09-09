import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common/exceptions';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { AuthService } from '@auth/auth.service';
import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';

// Local strategy to handle user authentication using email and password
// It validates the user credentials and returns the authenticated user data
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  /**
   * Validates user credentials and returns the authenticated user data.
   *
   * @param email - The user's email address.
   * @param password - The user's password.
   * @returns The authenticated user object if credentials are valid.
   * @throws BadRequestException if email or password are empty or contain only whitespace.
   */
  async validate(
    email: string,
    password: string,
  ): Promise<AuthenticatedUserDto> {
    if (!email?.trim() || !password?.trim()) {
      throw new BadRequestException('Email and password must not be empty');
    }
    return await this.authService.validateUser(email, password);
  }
}
