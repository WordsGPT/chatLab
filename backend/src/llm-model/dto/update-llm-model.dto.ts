import { PartialType, OmitType } from '@nestjs/mapped-types';

import { CreateLlmModelDto } from '@llm-model/dto/create-llm-model.dto';

// Este DTO se usa para actualizar un modelo LLM, omitiendo providerName
export class UpdateLlmModelDto extends PartialType(
  OmitType(CreateLlmModelDto, ['providerName'] as const),
) {}
