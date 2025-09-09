import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtStrategy } from '@common/strategies/jwt.strategy';

import { LlmProviderController } from '@llm-provider/llm-provider.controller';
import { LlmProviderService } from '@llm-provider/llm-provider.service';
import { LlmProviderEntity } from '@llm-provider/entities/llm-provider';
import { ProvidersSeedService } from '@llm-provider/seed/providers-seed.service';

// This module manages LLM provider-related functionalities
@Module({
  imports: [TypeOrmModule.forFeature([LlmProviderEntity])],
  controllers: [LlmProviderController],
  providers: [LlmProviderService, JwtStrategy, ProvidersSeedService],
  exports: [LlmProviderService, ProvidersSeedService, TypeOrmModule],
})
export class LlmProviderModule {}
