import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiUnauthorizedResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { applyDecorators } from '@nestjs/common';

import { OptionsSearchExperimentDto } from '@experiment/dto/options-search-experiment.dto';
import { SearchExecutionDto } from '@experiment-execution/dto/search-execution.dto';
import { CreateExecutionDto } from '@experiment-execution/dto/create-execution.dto';

// Decorator used for documenting the process of retrieving executions for a specific experiment
export function ApiGetExperimentExecutions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get experiment executions',
      description: 'Retrieve all executions for a specific experiment',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to retrieve executions for',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'filters',
      required: false,
      type: OptionsSearchExperimentDto,
    }),
    ApiOkResponse({
      description: 'List of executions retrieved successfully',
      schema: {
        type: 'object',
        properties: {
          executions: {
            type: 'array',
            items: { $ref: getSchemaPath(SearchExecutionDto) },
          },
          total: { type: 'number', example: 42 },
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

// Decorator used for documenting the process of retrieving temporal executions for a specific experiment
export function ApiGetTemporalExecutions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get temporal executions',
      description: 'Retrieve all temporal executions for a specific experiment',
    }),
    ApiParam({
      name: 'experimentId',
      description:
        'The ID of the experiment to retrieve temporal executions for',
      required: true,
      type: String,
    }),
    ApiOkResponse({
      description: 'List of temporal executions retrieved successfully',
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(SearchExecutionDto) },
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

// Decorator used for documenting the process of updating temporal executions for a specific experiment
export function ApiUpdateTemporalExecutions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Update temporal executions',
      description: 'Update all temporal executions for a specific experiment',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to update temporal executions for',
      required: true,
      type: String,
    }),
    ApiQuery({
      name: 'executionIds',
      description: 'Comma-separated list of execution IDs to update',
      required: true,
      type: String,
    }),
    ApiOkResponse({
      description: 'List of temporal executions updated successfully',
      schema: {
        type: 'array',
        items: { $ref: getSchemaPath(SearchExecutionDto) },
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

// Decorator used for documenting the process of creating a new execution for a specific experiment
export function ApiCreateExperimentExecution() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Create experiment execution',
      description: 'Create a new execution for a specific experiment',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to create the execution for',
      required: true,
      type: String,
    }),
    ApiBody({
      description: 'Data for creating the experiment execution',
      type: CreateExecutionDto,
    }),
    ApiOkResponse({
      description: 'Experiment execution created successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Experiment execution created successfully',
          },
          execution: { $ref: getSchemaPath(SearchExecutionDto) },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data',
      examples: {
        invalidInputValues: {
          summary: 'Missing required fields',
          value: {
            message: [
              'InputValues must not be empty',
              'InputValues must be an object',
            ],
            error: 'Bad Request',
            statusCode: 400,
          },
        },
        invalidPrompts: {
          summary: 'Prompts is not an array of strings',
          value: {
            message: [
              'Prompts must not be empty',
              'Prompts must be an array',
              'Each prompt must be a string',
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

// Decorator used for documenting the process of downloading experiment results as an Excel file
export function ApiDownloadExcel() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Download experiment results as Excel',
      description: 'Download the results of an experiment as an Excel file',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to download results for',
      required: true,
      type: String,
    }),
    ApiBody({
      description: 'Prompts to include in the Excel',
      schema: {
        type: 'object',
        properties: {
          prompts: {
            type: 'array',
            items: { type: 'string' },
            example: ['prompt1', 'prompt2'],
          },
        },
        required: ['prompts'],
      },
    }),
    ApiOkResponse({
      description: 'Excel file generated successfully',
      content: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
          schema: { type: 'string', format: 'binary' }, // indica archivo binario
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

// Decorator used for documenting the process of uploading a file containing multiple experiment executions
export function ApiUploadExperimentExecutions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Upload experiment executions',
      description: 'Upload a file containing multiple experiment executions',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to upload executions for',
      required: true,
      type: String,
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      description:
        'File containing execution data and associated prompts in JSON format',
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
          },
          prompts: {
            type: 'array',
            items: { type: 'string' },
            example: ['prompt1', 'prompt2'],
          },
        },
        required: ['file', 'prompts'],
      },
    }),
    ApiOkResponse({
      description: 'Executions uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Executions uploaded successfully',
          },
          executions: {
            type: 'array',
            items: { $ref: getSchemaPath(SearchExecutionDto) },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid input data or no file uploaded',
      examples: {
        invalidData: {
          summary: 'Invalid data',
          value: {
            message: 'Bad Request',
            error: 'Invalid input data',
            statusCode: 400,
          },
        },
        noFile: {
          summary: 'No file uploaded',
          value: {
            message: 'Bad Request',
            error: 'No file uploaded',
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

// Decorator used for documenting the process of running a specific experiment execution
export function ApiRunExecution() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Run experiment execution',
      description: 'Run a specific experiment execution',
    }),
    ApiParam({
      name: 'id',
      description: 'The ID of the execution to run',
      required: true,
      type: String,
    }),
    ApiBody({
      description: 'Models and llmConfigs to use for the execution',
      schema: {
        type: 'object',
        properties: {
          models: {
            type: 'array',
            items: { type: 'string' },
            example: ['model1', 'model2'],
          },
          llmConfigs: {
            type: 'array',
            items: { type: 'object' },
            example: [{ key: 'value' }],
          },
        },
        required: ['models', 'llmConfigs'],
      },
    }),
    ApiOkResponse({
      description: 'Execution started successfully',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Execution started successfully',
          },
          execution: {
            $ref: getSchemaPath(SearchExecutionDto),
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

// Decorator used for documenting the process of running all pending executions for a specific experiment
export function ApiRunAllExecutions() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Run all pending executions',
      description: 'Run all pending executions for a specific experiment',
    }),
    ApiParam({
      name: 'experimentId',
      description: 'The ID of the experiment to run all pending executions for',
      required: true,
      type: String,
    }),
    ApiOkResponse({
      description: 'Executions started successfully',
      schema: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'Executions started' },
          changes: { type: 'boolean', example: true },
          executionsIds: {
            type: 'array',
            items: { type: 'string', format: 'uuid' },
            example: ['e1a2b3c4-d5f6-7890-1234-56789abcdef0'],
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

// Decorator used for documenting the process of deleting a specific experiment execution
export function ApiDeleteExecution() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Delete experiment execution',
      description: 'Delete a specific experiment execution',
    }),
    ApiParam({
      name: 'id',
      description: 'The ID of the execution to delete',
      required: true,
      type: String,
    }),
    ApiOkResponse({
      description: 'Featured status updated successfully',
      examples: {
        success: {
          summary: 'Featured status updated successfully',
          value: { message: 'Execution deleted successfully' },
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
