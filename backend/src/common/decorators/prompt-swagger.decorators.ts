import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { SearchPromptDto } from '@prompt/dto/search-prompt.dto';

// Decorator used for documenting the 5 recent prompts
export function ApiRecentPrompts() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get recent prompts',
      description:
        'Retrieves the 5 most recent prompts for the authenticated user',
    }),
    ApiOkResponse({
      description: 'List of 5 recent prompts',
      type: SearchPromptDto,
      isArray: true,
      examples: {
        success: {
          summary: 'Prompts found',
          value: [
            {
              prompt: 'What is the capital of France?',
            },
            {
              prompt: 'What is the capital of Germany?',
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

// Decorator used for documenting the autocomplete of a prompt
export function ApiPromptAutocomplete() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiOperation({
      summary: 'Get prompt autocomplete suggestions',
      description: 'Retrieves autocomplete suggestions for a given prompt',
    }),
    ApiQuery({
      name: 'search',
      description: 'The prompt to get suggestions for',
      required: true,
      type: String,
      examples: {
        search: {
          summary: 'Search term',
          value: 'what is',
        },
      },
    }),
    ApiOkResponse({
      description: 'List of 5 autocomplete suggestions',
      type: String,
      isArray: true,
      examples: {
        success: {
          summary: 'Prompts found',
          value: [
            'What is the capital of France?',
            'What is the capital of Germany?',
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
