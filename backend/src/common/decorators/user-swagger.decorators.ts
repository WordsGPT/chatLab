import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthenticatedUserDto } from '@auth/dto/authenticated-user.dto';

import { UpdateUserDto } from '@users/dto/update-user.dto';
import { ChangePasswordDto } from '@users/dto/change-password.dto';
import { ThemePreference } from '@users/enums/theme-preference.enum';

// Decorator used for documenting the process of getting the theme preference
export function ApiGetTheme() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get user theme preference',
      description: 'Retrieves the theme preference of the authenticated user.',
    }),
    ApiOkResponse({
      description: 'Theme preference retrieved successfully',
      schema: {
        type: 'string',
        enum: Object.values(ThemePreference),
      },
      examples: {
        success: {
          summary: 'Theme preference',
          value: {
            theme: 'dark',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the change theme preference process
export function ApiChangeTheme() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Change user theme preference',
      description: 'Updates the theme preference of the authenticated user.',
    }),
    ApiBody({
      description: 'New theme preference',
      schema: {
        type: 'string',
        enum: Object.values(ThemePreference),
      },
      examples: {
        example1: {
          summary: 'Change theme preference',
          value: {
            theme: 'light',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Theme preference changed successfully',
      examples: {
        success: {
          summary: 'Theme preference changed',
          value: {
            message: 'Theme preference changed successfully',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid theme preference',
      examples: {
        invalidTheme: {
          summary: 'Invalid theme',
          value: {
            message: 'Invalid theme preference',
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the change password process
export function ApiChangePassword() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Change user password',
      description: 'Changes the password of the authenticated user.',
    }),
    ApiBody({
      type: ChangePasswordDto,
      description: 'Current and new password data',
      examples: {
        example1: {
          summary: 'Change password',
          value: {
            currentPassword: '123456',
            newPassword: '1234',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Password changed successfully',
      examples: {
        success: {
          summary: 'Password changed',
          value: {
            message: 'Password changed successfully',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid current password or validation error',
      examples: {
        incorrectPassword: {
          summary: 'Incorrect current password',
          value: {
            message: 'Current password is incorrect',
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidPassword: {
          summary: 'Invalid new password',
          value: {
            message: [
              'newPassword must be longer than or equal to 4 characters',
              'newPassword must be shorter than or equal to 255 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the edit user profile
export function ApiEditProfile() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Edit user profile',
      description: 'Updates the authenticated user profile information.',
    }),
    ApiBody({
      type: UpdateUserDto,
      description: 'User profile data to update',
      examples: {
        example1: {
          summary: 'Update profile',
          value: {
            email: 'juan@gmail.com',
            username: 'juan',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Profile updated successfully',
      type: AuthenticatedUserDto,
      examples: {
        success: {
          summary: 'Profile updated',
          value: {
            id: 'e7b2fcfd-6d6d-4caf-927b-9d842c60eb70',
            email: 'juan@gmail.com',
            username: 'juan',
            role: 'user',
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid profile data or email already exists',
      examples: {
        emailExists: {
          summary: 'Email already registered',
          value: {
            message: 'Email already registered',
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidEmail: {
          summary: 'Invalid email',
          value: {
            message: [
              'email should not be empty',
              'email must be an email',
              'email must be shorter than or equal to 254 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidUsername: {
          summary: 'Invalid username',
          value: {
            message: [
              'username must be longer than or equal to 3 characters',
              'username must be shorter than or equal to 30 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the soft delete user
export function ApiSoftDeleteUser() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Soft delete user account',
      description:
        'Deactivates the authenticated user account without permanently deleting it.',
    }),
    ApiOkResponse({
      description: 'Account eliminated successfully',
      examples: {
        success: {
          summary: 'Account eliminated',
          value: {
            message: 'Account eliminated successfully',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the hard delete user
export function ApiHardDeleteUser() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Hard delete user account',
      description:
        'Permanently removes the authenticated user account from the system.',
    }),
    ApiOkResponse({
      description: 'Account permanently deleted',
      examples: {
        success: {
          summary: 'Account permanently deleted',
          value: {
            message: 'Account permanently deleted',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired access token',
      examples: {
        invalidToken: {
          summary: 'Invalid token',
          value: {
            message: 'Unauthorized',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiNotFoundResponse({
      description: 'User not found',
      examples: {
        userNotFound: {
          summary: 'User not found',
          value: {
            message: 'User not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}
