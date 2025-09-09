import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import {
  amazon_bedrock_access_key_id,
  amazon_bedrock_secret_access_key,
  anthropic_api_key,
  assemblyai_api_key,
  azure_api_base_url,
  azure_api_key,
  cohere_api_key,
  cerebras_api_key,
  databricks_api_key,
  deepgram_api_key,
  deepseek_api_key,
  elevenlabs_api_key,
  fireworks_api_key,
  google_api_key,
  groq_api_key,
  mistral_api_key,
  ollama_api_base_url,
  openai_api_key,
  openrouter_api_key,
  perplexity_api_key,
  sambanova_api_key,
  togetherai_api_key,
  triton_api_base_url,
  triton_api_key,
  xai_api_key,
} from '@common/constants/env-convig.constant';

import { LlmProviderEntity } from '@llm-provider/entities/llm-provider';

// Service for seeding initial data in the Providers table
@Injectable()
export class ProvidersSeedService {
  private readonly defaultProviders = [
    {
      name: 'Amazon Bedrock',
      image: '/static/providers/amazon.png',
      accessKeyId: amazon_bedrock_access_key_id,
      secretAccessKey: amazon_bedrock_secret_access_key,
    },
    {
      name: 'Anthropic',
      image: '/static/providers/anthropic.png',
      key: anthropic_api_key,
    },
    {
      name: 'AssemblyAI',
      image: '/static/providers/assemblyai.png',
      key: assemblyai_api_key,
    },
    {
      name: 'Azure',
      image: '/static/providers/azure.png',
      key: azure_api_key,
      baseUrl: azure_api_base_url,
    },
    {
      name: 'Cerebras',
      image: '/static/providers/cerebras.png',
      key: cerebras_api_key,
    },
    {
      name: 'Cohere',
      image: '/static/providers/cohere.png',
      key: cohere_api_key,
    },
    {
      name: 'Databricks',
      image: '/static/providers/databricks.png',
      key: databricks_api_key,
    },
    {
      name: 'Deepgram',
      image: '/static/providers/deepgram.png',
      key: deepgram_api_key,
    },
    {
      name: 'Deepseek',
      image: '/static/providers/deepseek.png',
      key: deepseek_api_key,
    },
    {
      name: 'ElevenLabs',
      image: '/static/providers/elevenlabs.svg',
      key: elevenlabs_api_key,
    },
    {
      name: 'Fireworks AI',
      image: '/static/providers/fireworks.png',
      key: fireworks_api_key,
    },
    {
      name: 'Google AI Studio',
      image: '/static/providers/google.png',
      key: google_api_key,
    },
    { name: 'Groq', image: '/static/providers/groq.png', key: groq_api_key },
    {
      name: 'Mistral AI',
      image: '/static/providers/mistral.png',
      key: mistral_api_key,
    },
    {
      name: 'Ollama',
      image: '/static/providers/ollama.png',
      baseUrl: ollama_api_base_url,
    },
    {
      name: 'OpenAI',
      image: '/static/providers/openai.svg',
      key: openai_api_key,
    },
    {
      name: 'Openrouter',
      image: '/static/providers/openrouter.png',
      key: openrouter_api_key,
    },
    {
      name: 'Perplexity',
      image: '/static/providers/perplexity.png',
      key: perplexity_api_key,
    },
    {
      name: 'Sambanova',
      image: '/static/providers/sambanova.png',
      key: sambanova_api_key,
    },
    {
      name: 'TogetherAI',
      image: '/static/providers/togetherai.png',
      key: togetherai_api_key,
    },
    {
      name: 'Triton',
      image: '/static/providers/triton.png',
      key: triton_api_key,
      baseUrl: triton_api_base_url,
    },
    { name: 'xAI', image: '/static/providers/xai.png', key: xai_api_key },
  ];

  constructor(
    @InjectRepository(LlmProviderEntity)
    private readonly providerRepository: Repository<LlmProviderEntity>,
  ) {}

  /*
   * Creates the default providers in the database
   */
  async createDefaultProviders(): Promise<void> {
    for (const provider of this.defaultProviders) {
      const existing = await this.providerRepository.findOne({
        where: { name: provider.name },
      });

      const isActive = !!provider.key;

      if (!existing) {
        const newProvider = this.providerRepository.create({
          name: provider.name,
          image: provider.image,
          isActive,
        });
        await this.providerRepository.save(newProvider);
      } else if (existing.isActive !== isActive) {
        existing.isActive = isActive;
        await this.providerRepository.save(existing);
      }
    }
  }
}
