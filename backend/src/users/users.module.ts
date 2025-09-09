import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from '@common/strategies/jwt.strategy';

import { UserEntity } from '@users/entities/user.entity';
import { UsersController } from '@users/users.controller';
import { UsersService } from '@users/users.service';
import { UserSeedService } from '@users/seed/users-seed.service';

// This module handles user-related functionalities
@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, UserSeedService],
  exports: [UsersService, UserSeedService],
})
export class UsersModule {}
