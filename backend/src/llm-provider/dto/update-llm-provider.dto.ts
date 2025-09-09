import { PartialType } from '@nestjs/mapped-types';

import { CreateLlmProviderDto } from '@llm-provider/dto/create-llm-provider.dto';

// This DTO is used for updating an existing LLM provider
export class UpdateLlmProviderDto extends PartialType(CreateLlmProviderDto) {}
