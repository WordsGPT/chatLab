import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from '@auth/auth.service';
import { RegisterDto } from '@auth/dto/register.dto';
import { LoginDto } from '@auth/dto/login.dto';

import {
  ApiLogin,
  ApiLogout,
  ApiRefresh,
  ApiRegister,
} from '@common/decorators/auth-swagger.decorators';
import { LocalAuthGuard } from '@common/guards/local-auth.guard';
import { JwtRefreshAuthGuard } from '@common/guards/jwt-refresh-auth.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

// Controller for handling authentication routes
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Logs in a user and returns access and refresh tokens
   * This method uses the LocalAuthGuard to authenticate the user
   *
   * @param req - The request object containing user data
   * @returns An object containing the access token and refresh token
   */
  @Post('login')
  @ApiLogin()
  @UseGuards(LocalAuthGuard)
  login(@Req() req: RequestWithUser): Promise<LoginDto> {
    return this.authService.login(req.user);
  }

  /**
   * Logs out a user by invalidating their refresh token
   * This method uses the JwtAuthGuard to ensure the user is authenticated
   *
   * @param req - The request object containing user data
   * @returns A promise that resolves when the user is logged out
   */
  @Post('logout')
  @ApiLogout()
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: RequestWithUser): Promise<void> {
    return this.authService.logout(req.user.id);
  }

  /**
   * Refreshes the access token using the refresh token
   * This method uses the JwtRefreshAuthGuard to ensure the user is authenticated
   * and has a valid refresh token
   *
   * @param req - The request object containing user data
   * @returns A new access token for the user
   */
  @Post('refresh')
  @ApiRefresh()
  @UseGuards(JwtRefreshAuthGuard)
  refresh(@Req() req: RequestWithUser) {
    return this.authService.refresh(req.user);
  }

  /**
   * Registers a new user
   *
   * @param registerDto - The registration data
   * @returns A promise that resolves when the user is registered
   */
  @Post('register')
  @ApiRegister()
  @HttpCode(HttpStatus.NO_CONTENT)
  register(@Body() registerDto: RegisterDto): Promise<void> {
    return this.authService.register(registerDto);
  }
}
