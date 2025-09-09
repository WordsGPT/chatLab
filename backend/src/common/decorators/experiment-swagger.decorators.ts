import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { ValidationVariableType } from '@experiment-variable/enums/validation-variable-type.enum';
import { VariableType } from '@experiment-variable/enums/variable-type.enum';
import { CreateExperimentDto } from '@experiment/dto/create-experiment.dto';
import { SearchExperimentDto } from '@experiment/dto/search-experiment.dto';
import { SearchExperimentsDto } from '@experiment/dto/search-experiments.dto';
import { OptionsSearchExperimentDto } from '@experiment/dto/options-search-experiment.dto';

// Decorator used for documenting the process of getting the list of experiments with optional filters
export function ApiGetExperimentsFiltered() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get experiments with filters',
      description:
        'Retrieve a list of experiments for the authenticated user with optional filters',
    }),
    ApiQuery({
      name: 'filters',
      required: false,
      type: OptionsSearchExperimentDto,
    }),
    ApiOkResponse({
      description: 'List of experiments retrieved successfully',
      type: SearchExperimentsDto,
      isArray: true,
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Filtered Experiment 1',
          description: 'Description for Filtered Experiment 1',
          featured: 'true',
          lastViewed: '2023-03-15T12:00:00Z',
        },
        {
          id: '234e4567-e89b-11d3-a563-522314174001',
          name: 'Filtered Experiment 2',
          description: 'Description for Filtered Experiment 2',
          featured: 'false',
          lastViewed: '2023-03-15T12:00:00Z',
        },
      ],
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

// Decorator used for documenting the process of getting the list of featured experiments
export function ApiGetFeaturedExperiments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get featured experiments',
      description:
        'Retrieve a list of featured experiments for the authenticated user',
    }),
    ApiOkResponse({
      description: 'List of featured experiments retrieved successfully',
      type: SearchExperimentsDto,
      isArray: true,
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Featured Experiment 1',
          description: 'Description for Featured Experiment 1',
          featured: 'true',
          lastViewed: '2023-03-15T12:00:00Z',
        },
        {
          id: '234e4567-e89b-11d3-a563-522314174001',
          name: 'Featured Experiment 2',
          description: 'Description for Featured Experiment 2',
          featured: 'true',
          lastViewed: '2023-03-15T12:00:00Z',
        },
      ],
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

// Decorator used for documenting the process of getting the list of recent experiments
export function ApiGetRecentExperiments() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get recent experiments',
      description:
        'Retrieve a list of recent experiments for the authenticated user',
    }),
    ApiOkResponse({
      description: 'List of recent experiments retrieved successfully',
      type: SearchExperimentsDto,
      isArray: true,
      example: [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Recent Experiment 1',
          description: 'Description for Recent Experiment 1',
          featured: 'false',
          lastViewed: '2023-03-15T12:00:00Z',
        },
        {
          id: '234e4567-e89b-11d3-a563-522314174001',
          name: 'Recent Experiment 2',
          description: 'Description for Recent Experiment 2',
          featured: 'false',
          lastViewed: '2023-03-15T12:00:00Z',
        },
      ],
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

// Decorator used for documenting the process of getting an individual experiment by ID
export function ApiGetExperiment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get an experiment by ID',
      description: 'Retrieve a specific experiment for the authenticated user',
    }),
    ApiOkResponse({
      description: 'Experiment retrieved successfully',
      type: SearchExperimentDto,
      example: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Experiment 1',
        description: 'Description for Experiment 1',
        llmConfigs: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 4096,
        },
        models: ['gpt-3.5', 'gpt-4'],
        prompts: ['Question 1', 'Question 2', 'Question 3'],
        variables: [
          {
            name: 'Variable 1',
            type: VariableType.STRING,
            validations: {
              description: 'Description for Variable 1',
              required: true,
              minLength: 2,
              maxLength: 100,
            },
          },
          {
            name: 'Variable 2',
            type: VariableType.NUMBER,
            validations: {
              required: true,
              min: 0,
              max: 100,
            },
          },
        ],
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
      description: 'Experiment not found',
      examples: {
        notFound: {
          summary: 'Experiment not found',
          value: {
            message: 'Not Found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the process of downloading the JSON schema of an experiment
export function ApiDownloadExperimentSchema() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiParam({
      name: 'id',
      description: 'The ID of the experiment to download the schema for',
    }),
    ApiOperation({
      summary: 'Download experiment schema',
      description: 'Download the JSON schema for a specific experiment',
    }),
    ApiResponse({
      status: 200,
      description: 'JSON schema file downloaded successfully',
      content: {
        'application/json': {
          schema: { type: 'string', format: 'binary' }, // indica que es un archivo
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
      description: 'Experiment not found',
      examples: {
        notFound: {
          summary: 'Experiment not found',
          value: {
            message: 'Not Found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the process of creating a new experiment
export function ApiCreateExperiment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create a new experiment',
      description: 'Create a new experiment for the authenticated user',
    }),
    ApiBody({
      description: 'Experiment created successfully',
      type: CreateExperimentDto,
      examples: {
        example1: {
          summary: 'Example of a new experiment',
          value: {
            name: 'New Experiment',
            description: 'Description for New Experiment',
            llmConfigs: {
              temperature: 0.7,
              top_p: 0.9,
              max_tokens: 4096,
            },
            models: ['gpt-3.5', 'gpt-4'],
            prompts: [
              {
                prompt: 'Question 1',
                promptOrder: 1,
              },
              {
                prompt: 'Question 2',
                promptOrder: 2,
              },
              {
                prompt: 'Question 3',
                promptOrder: 3,
              },
            ],
            variables: [
              {
                name: 'Variable 1',
                type: VariableType.STRING,
                validations: {
                  type: ValidationVariableType.STRING,
                  description: 'Description for Variable 1',
                  required: true,
                  minLength: 2,
                  maxLength: 100,
                },
              },
              {
                name: 'Variable 2',
                type: VariableType.NUMBER,
                validations: {
                  type: ValidationVariableType.NUMBER,
                  required: true,
                  min: 0,
                  max: 100,
                },
              },
            ],
          },
        },
      },
    }),
    ApiOkResponse({
      description: 'Experiment created successfully',
      examples: {
        success: {
          summary: 'Experiment created successfully',
          value: {
            message: 'Experiment created successfully',
            experiment: {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'New Experiment 1',
              description: 'Description for New Experiment 1',
              featured: 'true',
              lastViewed: '2023-03-15T12:00:00Z',
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request payload',
      examples: {
        invalidName: {
          summary: 'Invalid name',
          value: {
            message: [
              'Name must not be empty',
              'Name must be longer than or equal to 1 characters',
              'Name must be shorter than or equal to 100 characters',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidDescription: {
          summary: 'Invalid description',
          value: {
            message: ['Description must not be empty'],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidLLMConfig: {
          summary: 'Invalid LLMConfig',
          value: {
            message: [
              'Temperature must be higher than or equal to 0',
              'Temperature must be lower than or equal to 2',
              'Top p must be higher than or equal to 0',
              'Top p must be lower than or equal to 1',
              'Max tokens must be higher than or equal to 1',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidModels: {
          summary: 'Invalid models',
          value: {
            message: ['Models must be an array of strings'],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidPrompts: {
          summary: 'Invalid prompts',
          value: {
            message: [
              'Prompt must not be empty',
              'Prompt must be an string',
              'PromptOrder must not be empty',
              'PromptOrder must be a number',
              'PromptOrder must be positive',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidVariables: {
          summary: 'Invalid variables',
          value: {
            message: [
              'Name must not be empty',
              'Name must be an string',
              'Name must be shorter than or equal to 100 characters',
              'Type must be a valid enum value',
              'Validations must be a valid object',
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
  );
}

// Decorator used for documenting the process of updating the featured status of an experiment
export function ApiUpdateFeatured() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update the featured status of an experiment',
      description:
        'Updates the featured status of a specific experiment for the authenticated user',
    }),
    ApiOkResponse({
      description: 'Featured status updated successfully',
      examples: {
        success: {
          summary: 'Featured status updated successfully',
          value: { message: 'Experiment updated successfully' },
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
      description: 'Experiment not found',
      examples: {
        experimentNotFound: {
          summary: 'Experiment not found',
          value: {
            message: 'Experiment not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}

// Decorator used for documenting the process of deleting an experiment
export function ApiDeleteExperiment() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete an experiment',
      description: 'Deletes a specific experiment for the authenticated user',
    }),
    ApiOkResponse({
      description: 'Experiment deleted successfully',
      examples: {
        success: {
          summary: 'Experiment deleted successfully',
          value: { message: 'Experiment deleted successfully' },
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
      description: 'Experiment not found',
      examples: {
        experimentNotFound: {
          summary: 'Experiment not found',
          value: {
            message: 'Experiment not found',
            error: 'Not Found',
            statusCode: 404,
          },
        },
      },
    }),
  );
}
