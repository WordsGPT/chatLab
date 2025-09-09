import { Request } from 'express';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AuthService } from '@auth/auth.service';
import { JwtPayloadDto } from '@auth/dto/jwt-payload.dto';

import { jwt_refresh_secret } from '@common/constants/env-convig.constant';

// JWT refresh strategy to handle token validation
// It extracts the JWT from the Authorization header and validates it
// If valid, it returns the user information for further processing
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwt_refresh_secret,
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  /**
   * Validates the refresh token and generates new access and refresh tokens.
   *
   * @param req - The Express request object containing the Authorization header.
   * @param payload - The JWT payload containing user information.
   * @returns An object containing the new access token, refresh token, and user ID.
   * @throws UnauthorizedException if the refresh token is malformed or invalid.
   */
  async validate(req: Request, payload: JwtPayloadDto) {
    const refreshToken = req.get('Authorization')?.replace('Bearer', '').trim();
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token malformed');
    }

    const user = await this.authService.validateRefreshTokens(
      payload.sub,
      refreshToken,
    );

    return user;
  }
}
