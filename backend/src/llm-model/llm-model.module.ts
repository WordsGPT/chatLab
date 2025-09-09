import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { LlmModelService } from '@llm-model/llm-model.service';
import { LlmModelController } from '@llm-model/llm-model.controller';
import { LlmModelEntity } from '@llm-model/entities/llm-model.entity';
import { ModelsSeedService } from '@llm-model/seed/models-seed.service';
import { LlmProviderModule } from '@llm-provider/llm-provider.module';

// This module handles LLM model-related functionalities
@Module({
  imports: [LlmProviderModule, TypeOrmModule.forFeature([LlmModelEntity])],
  controllers: [LlmModelController],
  providers: [LlmModelService, ModelsSeedService],
  exports: [LlmModelService, ModelsSeedService],
})
export class LlmModelModule {}
