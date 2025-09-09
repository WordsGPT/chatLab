import { CreateLlmProviderDto } from '@llm-provider/dto/create-llm-provider.dto';
import { UpdateLlmProviderDto } from '@llm-provider/dto/update-llm-provider.dto';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

// Decorator used for documenting the search process
export function ApiFindAllLlmProvider() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Search all LLM providers',
      description: 'Retrieves a list of all available LLM providers.',
    }),
    ApiOkResponse({
      description: 'List of LLM providers retrieved successfully',
      examples: {
        success: {
          summary: 'LLM providers found',
          value: [
            {
              name: 'OpenAI',
              image: '/static/providers/openai.svg',
            },
            {
              name: 'Groq',
              image: '/static/providers/groq.png',
            },
          ],
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
  );
}

// Decorator used for documenting the creation process
export function ApiCreateLlmProvider() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new LLM provider',
      description: 'Creates a new LLM provider with the provided details.',
    }),
    ApiBody({
      description: 'Details of the LLM provider to be created',
      type: CreateLlmProviderDto,
      schema: {
        example: {
          name: 'OpenAI',
          image: '/static/providers/openai.svg',
          isActive: true,
        },
      },
    }),
    ApiOkResponse({
      description: 'LLM provider created successfully',
      examples: {
        success: {
          summary: 'Provider created',
          value: { message: 'LLM provider created successfully' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      examples: {
        invalidName: {
          summary: 'Invalid name',
          value: {
            message: [
              'name should not be empty',
              'name must be a string',
              'name must be longer than or equal to 2 characters',
              'name must be shorter than or equal to 30 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidImage: {
          summary: 'Invalid image URL',
          value: {
            message: [
              'image must be a string',
              'image must be longer than or equal to 2 characters',
              'image must be shorter than or equal to 100 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidIsActive: {
          summary: 'Invalid isActive value',
          value: {
            message: ['isActive must be a boolean'],
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
    ApiConflictResponse({
      description: 'LLM provider already exists',
      examples: {
        conflict: {
          summary: 'Provider exists',
          value: {
            message: 'LLM provider already exists',
            error: 'Conflict',
            statusCode: 409,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the updating process
export function ApiUpdateLlmProvider() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update an existing LLM provider',
      description: 'Updates the details of an existing LLM provider.',
    }),
    ApiBody({
      description: 'Updated details of the LLM provider',
      type: UpdateLlmProviderDto,
      schema: {
        example: {
          name: 'OpenAI',
          image: '/static/providers/openai.svg',
          isActive: true,
        },
      },
    }),
    ApiOkResponse({
      description: 'LLM provider updated successfully',
      examples: {
        success: {
          summary: 'Provider updated',
          value: { message: 'LLM provider updated successfully' },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      examples: {
        invalidName: {
          summary: 'Invalid name',
          value: {
            message: [
              'name should not be empty',
              'name must be a string',
              'name must be longer than or equal to 2 characters',
              'name must be shorter than or equal to 30 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidImage: {
          summary: 'Invalid image URL',
          value: {
            message: [
              'image must be a string',
              'image must be longer than or equal to 2 characters',
              'image must be shorter than or equal to 100 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidIsActive: {
          summary: 'Invalid isActive value',
          value: {
            message: ['isActive must be a boolean'],
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
      description: 'LLM provider not found',
      examples: {
        notFound: {
          summary: 'Provider not found',
          value: {
            message: 'LLM provider not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the soft delete process
export function ApiSoftDeleteLlmProvider() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Soft delete an existing LLM provider',
      description:
        'Marks an existing LLM provider as deleted without removing it from the database.',
    }),
    ApiOkResponse({
      description: 'LLM provider soft deleted successfully',
      examples: {
        success: {
          summary: 'Provider soft deleted',
          value: { message: 'LLM provider soft deleted successfully' },
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
      description: 'LLM provider not found',
      examples: {
        notFound: {
          summary: 'Provider not found',
          value: {
            message: 'LLM provider not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the hard delete process
export function ApiHardDeleteLlmProvider() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Hard delete an existing LLM provider',
      description:
        'Permanently removes an existing LLM provider from the database.',
    }),
    ApiOkResponse({
      description: 'LLM provider hard deleted successfully',
      examples: {
        success: {
          summary: 'Provider hard deleted',
          value: { message: 'LLM provider hard deleted successfully' },
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
      description: 'LLM provider not found',
      examples: {
        notFound: {
          summary: 'Provider not found',
          value: {
            message: 'LLM provider not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}
