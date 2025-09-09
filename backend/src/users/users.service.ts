import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import * as bcrypt from 'bcrypt';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';

import { ChangePasswordDto } from '@users/dto/change-password.dto';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { UserEntity } from '@users/entities/user.entity';
import { ThemePreference } from '@users/enums/theme-preference.enum';

// Service for handling user logic
// It includes methods for create, update, delete and searching
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  /**
   * Creates a new user
   *
   * @param createUserData - The data to create the user
   * @returns The created user entity
   */
  async create(createUserData: CreateUserDto): Promise<UserEntity> {
    const user = this.userRepository.create(createUserData);
    return await this.userRepository.save(user);
  }

  /**
   * Retrieves the theme preference of a user by ID
   *
   * @param id - The ID of the user whose theme preference is to be retrieved
   * @returns The theme preference of the user
   */
  async getUserThemePreference(id: string): Promise<ThemePreference> {
    const user = await this.findById(id);
    return user.themePreference;
  }

  /**
   * Retrieves the theme preference of a user by ID
   *
   * @param id - The ID of the user whose theme preference is to be retrieved
   * @returns The theme preference of the user
   */
  async getTheme(id: string): Promise<ThemePreference> {
    const user = await this.findById(id);
    return user.themePreference;
  }

  /**
   * Changes the theme preference of a user by ID
   *
   * @param id - The ID of the user whose theme preference is to be changed
   * @param theme - The new theme preference to be set
   * @returns A promise that resolves when the theme preference is changed
   */
  async changeTheme(id: string, theme: ThemePreference): Promise<void> {
    await this.findById(id);
    await this.userRepository.update(id, { themePreference: theme });
  }

  /**
   * Changes the password of a user
   *
   * @param id - The ID of the user whose password is to be changed
   * @param changePassword - The DTO containing the current and new passwords
   * @returns A promise that resolves when the password is changed
   * @throws BadRequestException if the current password is incorrect
   */
  async changePassword(
    id: string,
    changePassword: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findById(id);
    const isValid = await bcrypt.compare(
      changePassword.currentPassword,
      user.password,
    );

    if (!isValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(changePassword.newPassword, 10);
    user.password = hashedPassword;
    await this.userRepository.update(id, { password: hashedPassword });
  }

  /**
   * Updates a user by ID
   *
   * @param id - The ID of the user to update
   * @param updateUserData - The data to update the user
   * @returns The updated user entity
   */
  async update(
    id: string,
    updateUserData: UpdateUserDto,
  ): Promise<AuthenticatedUserDto> {
    await this.userRepository.update(id, updateUserData);
    const updatedUser = await this.findById(id);
    const authenticatedUser: AuthenticatedUserDto = {
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
    };
    return authenticatedUser;
  }

  /**
   * Soft deletes a user by ID
   *
   * @param id - The ID of the user to soft delete
   * @returns A promise that resolves when the user is soft deleted
   */
  async softDeleteUser(id: string): Promise<void> {
    await this.findById(id);
    await this.userRepository.update(id, { isActive: false });
  }

  /**
   * Deletes a user by email
   *
   * @param email - The email of the user to delete
   */
  async hardDeleteUser(email: string): Promise<void> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.userRepository.delete({ email });
  }

  /**
   * Finds a user by email
   *
   * @param email - The email of the user to find
   * @returns The found user entity or null if not found
   */
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ email });
    return user;
  }

  /**
   * Finds a user by ID
   *
   * @param id - The ID of the user to find
   * @returns The found user entity
   * @throws NotFoundException if the user is not found
   */
  async findById(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
