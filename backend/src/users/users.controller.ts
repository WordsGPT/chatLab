import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';

import {
  ApiChangePassword,
  ApiChangeTheme,
  ApiEditProfile,
  ApiGetTheme,
  ApiHardDeleteUser,
  ApiSoftDeleteUser,
} from '@common/decorators/user-swagger.decorators';
import { Roles } from '@common/decorators/roles.decorator';
import { RolesGuard } from '@common/guards/roles.guard';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

import { UsersService } from '@users/users.service';
import { ChangePasswordDto } from '@users/dto/change-password.dto';
import { UpdateUserDto } from '@users/dto/update-user.dto';
import { UserRole } from '@users/enums/user-role.enum';
import { ThemePreference } from '@users/enums/theme-preference.enum';

// Controller for handling profile routes
@Controller('profile')
@ApiTags('Users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Retrieves the theme preference of the authenticated user
   * This endpoint returns the user's theme preference
   *
   * @param req - The request object containing the authenticated user's information
   * @returns The authenticated user's theme preference
   */
  @Get('theme')
  @ApiGetTheme()
  async getTheme(
    @Req() req: RequestWithUser,
  ): Promise<{ theme: ThemePreference }> {
    const userId = req.user.id;
    const theme = await this.usersService.getTheme(userId);
    return { theme };
  }

  /**
   * Changes the theme preference of the authenticated user
   * This endpoint allows users to update their theme preference
   *
   * @param req - The request object containing the authenticated user's information
   * @param theme - The new theme preference to be set
   * @returns A message indicating the theme was changed successfully
   */
  @Patch('change-theme')
  @ApiChangeTheme()
  async changeTheme(
    @Req() req: RequestWithUser,
    @Body() { theme }: { theme: ThemePreference },
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.usersService.changeTheme(userId, theme);
    return { message: 'Theme changed successfully' };
  }

  /**
   * Changes the password of the authenticated user
   * This endpoint allows users to update their account password
   *
   * @param req - The request object containing the authenticated user's information
   * @param changePasswordDto - The data transfer object containing the current and new passwords
   * @returns A message indicating the password was changed successfully
   */
  @Patch('change-password')
  @ApiChangePassword()
  async changePassword(
    @Req() req: RequestWithUser,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.usersService.changePassword(userId, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  /**
   * Updates the profile information of the authenticated user
   * This endpoint allows users to edit their profile details
   *
   * @param req - The request object containing the authenticated user's information
   * @param updateUserData - The data transfer object containing the updated user information
   * @returns The updated user entity
   */
  @Patch('edit')
  @ApiEditProfile()
  async edit(
    @Req() req: RequestWithUser,
    @Body() updateUserData: UpdateUserDto,
  ): Promise<AuthenticatedUserDto> {
    const userId = req.user.id;
    return await this.usersService.update(userId, updateUserData);
  }

  /**
   * Soft deletes the authenticated user's account
   * This endpoint marks the user's account as deleted without permanently removing it from the database
   *
   * @param req - The request object containing the authenticated user's information
   * @returns A message indicating the account was eliminated successfully
   */
  @Delete('soft-delete')
  @ApiSoftDeleteUser()
  async softDeleteUser(
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.usersService.softDeleteUser(userId);
    return { message: 'Account eliminated successfully' };
  }

  /**
   * Hard deletes the authenticated user's account
   * This endpoint permanently removes the user's account from the database
   * Only admins can perform this action
   *
   * @param req - The request object containing the authenticated user's information
   * @returns A message indicating the account was permanently deleted
   */
  @Delete('hard-delete')
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @ApiHardDeleteUser()
  async hardDeleteUser(
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    await this.usersService.hardDeleteUser(userId);
    return { message: 'Account permanently deleted' };
  }
}
