import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { models_env } from '@common/constants/env-convig.constant';

import { LlmModelEntity } from '@llm-model/entities/llm-model.entity';

import { LlmProviderEntity } from '@llm-provider/entities/llm-provider';

// Service for seeding initial data in the Models table
@Injectable()
export class ModelsSeedService {
  constructor(
    @InjectRepository(LlmModelEntity)
    private readonly modelRepository: Repository<LlmModelEntity>,

    @InjectRepository(LlmProviderEntity)
    private readonly providerRepository: Repository<LlmProviderEntity>,
  ) {}

  /*
   * Creates the default models in the database.
   */
  async createDefaultModels(): Promise<void> {
    let models = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      models = JSON.parse(models_env);
    } catch (error) {
      console.error('Error parsing MODELS from .env', error);
      return;
    }

    for (const modelData of models) {
      const { providerName, name } = modelData;

      const provider = await this.providerRepository.findOne({
        where: { name: providerName },
      });

      if (!provider) {
        console.warn(
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          `Provider ${providerName} not found. Ignoring model ${name}.`,
        );
        continue;
      }

      const existing = await this.modelRepository.findOne({
        where: {
          name,
          provider: { id: provider.id },
        },
        relations: ['provider'],
      });

      if (existing) continue;

      const model = this.modelRepository.create({
        name,
        provider,
      });

      await this.modelRepository.save(model);
    }
  }
}
