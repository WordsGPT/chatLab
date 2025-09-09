import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';
import { JwtPayloadDto } from '@auth/dto/jwt-payload.dto';

import { jwt_secret } from '@common/constants/env-convig.constant';

// JWT strategy to handle token validation
// It extracts the JWT from the Authorization header and validates it
// If valid, it returns the user information for further processing
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_secret,
      ignoreExpiration: false,
    });
  }

  /**
   * Validates the JWT payload and returns the authenticated user data.
   *
   * @param payload - The JWT payload containing user information.
   * @returns The authenticated user object with id, email, username, and role.
   */
  validate(payload: JwtPayloadDto): AuthenticatedUserDto {
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      role: payload.role,
    };
  }
}
