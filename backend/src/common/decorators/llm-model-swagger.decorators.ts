import { CreateLlmModelDto } from '@llm-model/dto/create-llm-model.dto';
import { UpdateLlmModelDto } from '@llm-model/dto/update-llm-model.dto';
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
export function ApiFindAllLlmModels() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Search all LLM models',
      description: 'Retrieves a list of all available LLM models.',
    }),
    ApiOkResponse({
      description: 'List of LLM models retrieved successfully',
      examples: {
        success: {
          summary: 'LLM models found',
          value: [
            {
              name: 'gpt-4',
              providerName: 'OpenAI',
            },
            {
              name: 'groq/llama-3.3-70b-versatile',
              providerName: 'Groq',
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
export function ApiCreateLlmModel() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new LLM model',
      description: 'Creates a new LLM model with the provided details.',
    }),
    ApiBody({
      description: 'Details of the LLM model to be created',
      type: CreateLlmModelDto,
      schema: {
        example: {
          name: 'gpt-4',
          providerName: 'OpenAI',
          isActive: true,
        },
      },
    }),
    ApiOkResponse({
      description: 'LLM model created successfully',
      examples: {
        success: {
          summary: 'Model created',
          value: { message: 'LLM model created successfully' },
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
        invalidProviderName: {
          summary: 'Invalid provider name',
          value: {
            message: [
              'providerName should not be empty',
              'providerName must be a string',
              'providerName must be longer than or equal to 2 characters',
              'providerName must be shorter than or equal to 30 characters',
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
export function ApiUpdateLlmModel() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update an existing LLM model',
      description: 'Updates the details of an existing LLM model.',
    }),
    ApiBody({
      description: 'Updated details of the LLM model',
      type: UpdateLlmModelDto,
      schema: {
        example: {
          isActive: false,
        },
      },
    }),
    ApiOkResponse({
      description: 'LLM model updated successfully',
      examples: {
        success: {
          summary: 'Model updated',
          value: { message: 'LLM model updated successfully' },
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
      description: 'LLM model not found',
      examples: {
        notFound: {
          summary: 'Model not found',
          value: {
            message: 'LLM model not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the soft delete process
export function ApiSoftDeleteLlmModel() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Soft delete an existing LLM model',
      description:
        'Marks an existing LLM model as deleted without removing it from the database.',
    }),
    ApiOkResponse({
      description: 'LLM model soft deleted successfully',
      examples: {
        success: {
          summary: 'Model soft deleted',
          value: { message: 'LLM model soft deleted successfully' },
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
      description: 'LLM model not found',
      examples: {
        notFound: {
          summary: 'Model not found',
          value: {
            message: 'LLM model not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the hard delete process
export function ApiHardDeleteLlmModel() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Hard delete an existing LLM model',
      description:
        'Permanently removes an existing LLM model from the database.',
    }),
    ApiOkResponse({
      description: 'LLM model hard deleted successfully',
      examples: {
        success: {
          summary: 'Model hard deleted',
          value: { message: 'LLM model hard deleted successfully' },
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
      description: 'LLM model not found',
      examples: {
        notFound: {
          summary: 'Model not found',
          value: {
            message: 'LLM model not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}
