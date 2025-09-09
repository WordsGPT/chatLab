import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from '@auth/auth.controller';
import { AuthService } from '@auth/auth.service';

import { LocalStrategy } from '@common/strategies/local.strategy';
import { jwt_secret } from '@common/constants/env-convig.constant';
import { JwtStrategy } from '@common/strategies/jwt.strategy';
import { JwtRefreshStrategy } from '@common/strategies/jwt-refresh.strategy';

import { UsersModule } from '@users/users.module';

// This module handles authentication-related functionalities
// It imports necessary modules and registers strategies for JWT and local authentication
@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      secret: jwt_secret,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtRefreshStrategy],
})
export class AuthModule {}
