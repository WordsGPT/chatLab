import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import {
  default_admin_username,
  default_admin_email,
  default_admin_password,
} from '@common/constants/env-convig.constant';

import { UserEntity } from '@users/entities/user.entity';
import { UserRole } from '@users/enums/user-role.enum';

// Service for seeding initial data in the User table
@Injectable()
export class UserSeedService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a default user in the database
   */
  async createDefaultUser(): Promise<void> {
    const username = default_admin_username;
    const email = default_admin_email;
    const password = default_admin_password;
    const role = UserRole.ADMIN;

    const existing = await this.userRepository.findOne({ where: { email } });
    if (existing) return;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    await this.userRepository.save(user);
  }
}
