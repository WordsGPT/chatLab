import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { LoginDto } from '@auth/dto/login.dto';
import { RegisterDto } from '@auth/dto/register.dto';

// Decorator used for documenting the user login
export function ApiLogin() {
  return applyDecorators(
    ApiOperation({
      summary: 'User login',
      description:
        'Authenticates a user and returns access and refresh tokens.',
    }),
    ApiBody({
      description: 'User login credentials',
      examples: {
        example1: {
          summary: 'Basic login',
          value: {
            email: 'alex@gmail.com',
            password: '123456',
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Login successful',
      type: LoginDto,
      examples: {
        success: {
          summary: 'Successful login',
          value: {
            id: 'fd7386e3-fa9a-43d9-95f3-35beb79d994d',
            username: 'alex',
            email: 'alex@gmail.com',
            role: 'user',
            tokens: {
              access_token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDczODZlMy1mYTlhLTQzZDktOTVmMy0zNWJlYjc5ZDk5NGQiLCJlbWFpbCI6ImFsbGVzb0Bob3RtYWlsLmNvbSIsInVzZXJuYW1lIjoibGFwaXNvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTU0MjgyMDEsImV4cCI6MTc1NTQzMTgwMX0.afDHexzPQRInqUW4W1wSj5Ki_yO6Ht4uNs7WByRH7ic',
              refresh_token:
                'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDczODZlMy1mYTlhLTQzZDktOTVmMy0zNWJlYjc5ZDk5NGQiLCJlbWFpbCI6ImFsbGVzb0Bob3RtYWlsLmNvbSIsInVzZXJuYW1lIjoibGFwaXNvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTU0MjgyMDEsImV4cCI6MTc1NjAzMzAwMX0.zTzN6uLqnLTC5ads-_1TKEHJ4BJZRqYV5TpKMUkm_pM',
            },
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid credentials',
      examples: {
        invalidCredentials: {
          summary: 'Invalid credentials',
          value: {
            message: 'Invalid credentials',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
    ApiForbiddenResponse({
      description: 'User is inactive',
      examples: {
        inactiveUser: {
          summary: 'User is inactive',
          value: {
            message: 'User is inactive',
            error: 'Forbidden',
            statusCode: 403,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the user logout
export function ApiLogout() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'User logout',
      description: 'Logs out the user by clearing their refresh token.',
    }),
    ApiNoContentResponse({
      description: 'Logout successful',
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
  );
}

// Decorator used for documenting the refreshing JWT tokens
export function ApiRefresh() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Refresh tokens',
      description:
        'Generates new access and refresh tokens using the refresh token.',
    }),
    ApiOkResponse({
      description: 'Tokens refreshed successfully',
      type: String,
      examples: {
        success: {
          summary: 'Tokens refreshed',
          value: {
            access_token:
              'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZDczODZlMy1mYTlhLTQzZDktOTVmMy0zNWJlYjc5ZDk5NGQiLCJlbWFpbCI6ImFsbGVzb0Bob3RtYWlsLmNvbSIsInVzZXJuYW1lIjoibGFwaXNvIiwicm9sZSI6InVzZXIiLCJpYXQiOjE3NTU0Mjg3MDMsImV4cCI6MTc1NTQzMjMwM30.kVLzA_danyrJe9g7funiUgB2E1me-HyojV4fU4QCbwg',
          },
        },
      },
    }),
    ApiUnauthorizedResponse({
      description: 'Invalid or expired refresh token',
      examples: {
        invalidRefreshToken: {
          summary: 'Invalid refresh token',
          value: {
            message: 'Access Denied',
            error: 'Unauthorized',
            statusCode: 401,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the user registration
export function ApiRegister() {
  return applyDecorators(
    ApiOperation({
      summary: 'Register new user',
      description:
        'Creates a new user account with email, username and password.',
    }),
    ApiBody({
      type: RegisterDto,
      description: 'User registration data',
      examples: {
        example1: {
          summary: 'Basic registration',
          value: {
            email: 'alex@gmail.com',
            username: 'alex',
            password: '123456',
          },
        },
      },
    }),
    ApiNoContentResponse({
      description: 'User created successfully',
    }),
    ApiBadRequestResponse({
      description: 'Invalid registration data or email already registered',
      examples: {
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
        invalidPassword: {
          summary: 'Invalid password',
          value: {
            message: [
              'password must be longer than or equal to 4 characters',
              'password must be shorter than or equal to 255 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
      },
    }),
    ApiConflictResponse({
      description: 'Email already registered',
      examples: {
        emailExists: {
          summary: 'Email already registered',
          value: {
            message: 'Email already registered',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      },
    }),
  );
}
