import { Injectable } from '@nestjs/common';
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common/exceptions';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';
import { JwtPayloadDto } from '@auth/dto/jwt-payload.dto';
import { JwtTokensDto } from '@auth/dto/jwt-tokens.dto';
import { LoginDto } from '@auth/dto/login.dto';
import { RegisterDto } from '@auth/dto/register.dto';

import { jwt_refresh_secret } from '@common/constants/env-convig.constant';

import { UsersService } from '@users/users.service';

// Service for handling authentication logic
// It includes methods for user registration, login, logout, and token management
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Logs in a user and generates access and refresh tokens
   *
   * @param user - The authenticated user data
   * @return the data transfer object containing user information, tokens, and theme preference
   */
  async login(user: AuthenticatedUserDto): Promise<LoginDto> {
    const payload = this.generateTokensPayload(user);
    const tokens = await this.generateTokens(payload);

    await this.updateRefreshToken(user.id, tokens.refresh_token);
    const themePreference = await this.usersService.getUserThemePreference(
      user.id,
    );

    return {
      ...user,
      tokens: tokens,
      themePreference: themePreference,
    };
  }

  /**
   * Logs out a user by clearing their refresh token
   *
   * @param userId - The ID of the user to log out
   */
  async logout(userId: string): Promise<void> {
    const user = await this.usersService.findById(userId);
    if (user) {
      await this.deleteRefreshToken(userId);
    }
  }

  /**
   * Refreshes the access token using the provided refresh token
   *
   * @param user - The authenticated user data
   * @returns A new access token for the user
   */
  async refresh(user: AuthenticatedUserDto): Promise<string> {
    const payload = this.generateTokensPayload(user);

    return await this.generateAccessToken(payload);
  }

  /**
   * Registers a new user by hashing their password and saving them to the database
   *
   * @param registerDto - The data transfer object containing user registration details
   * @throws ConflictException if the email is already registered
   */
  async register(registerDto: RegisterDto): Promise<void> {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });
  }

  /**
   * Generates access and refresh tokens for the user
   *
   * @param payload - The JWT payload containing user information
   * @return An object containing the access token and refresh token
   */
  private async generateTokens(payload: JwtPayloadDto): Promise<JwtTokensDto> {
    const access_token = await this.generateAccessToken(payload);
    const refresh_token = await this.generateRefreshToken(payload);

    return { access_token, refresh_token };
  }

  /**
   * Generates the JWT payload for the user
   *
   * @param user - The authenticated user data
   * @return The JWT payload containing user information
   */
  private generateTokensPayload(user: AuthenticatedUserDto): JwtPayloadDto {
    const payload: JwtPayloadDto = {
      sub: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
    return payload;
  }

  /**
   * Generates an access token for the user
   *
   * @param payload - The JWT payload containing user information
   * @return The generated access token
   */
  private async generateAccessToken(payload: JwtPayloadDto): Promise<string> {
    return await this.jwtService.signAsync(payload);
  }

  /**
   * Generates a refresh token for the user
   *
   * @param payload - The JWT payload containing user information
   * @return The generated refresh token
   */
  private async generateRefreshToken(payload: JwtPayloadDto): Promise<string> {
    return await this.jwtService.signAsync(payload, {
      secret: jwt_refresh_secret,
      expiresIn: '7d',
    });
  }

  /**
   * Updates the user's refresh token in the database
   *
   * @param userId - The ID of the user
   * @param refreshToken - The new refresh token to be saved
   */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Deletes the user's refresh token from the database
   *
   * @param userId - The ID of the user
   */
  private async deleteRefreshToken(userId: string): Promise<void> {
    await this.usersService.update(userId, {
      refreshToken: '',
    });
  }

  /**
   * Validates a user's credentials and returns the authenticated user data
   * Used by the LocalAuthGuard to authenticate users
   *
   * @param email - The user's email.
   * @param password - The user's password.
   * @returns The authenticated user data.
   * @throws UnauthorizedException if the credentials are invalid
   * @throws ForbiddenException if the user is inactive
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUserDto> {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new ForbiddenException('User is inactive');
    }

    const authenticatedUser: AuthenticatedUserDto = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return authenticatedUser;
  }

  /**
   * Validates the refresh token for the user
   * Used by the JwtRefreshAuthGuard to ensure the user has a valid refresh token
   *
   * @param userId - The ID of the user
   * @param refreshToken - The refresh token to validate
   * @returns The authenticated user data if the refresh token is valid
   * @throws UnauthorizedException if the refresh token is invalid or does not match
   */
  async validateRefreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<AuthenticatedUserDto> {
    const existingUser = await this.usersService.findById(userId);
    if (!existingUser || !existingUser.refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      existingUser.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const authenticatedUser: AuthenticatedUserDto = {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
    };

    return authenticatedUser;
  }
}
