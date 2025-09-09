import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { LlmProviderEntity } from '@llm-provider/entities/llm-provider';
import { CreateLlmProviderDto } from '@llm-provider/dto/create-llm-provider.dto';
import { UpdateLlmProviderDto } from '@llm-provider/dto/update-llm-provider.dto';

// Service for managing LLM providers
// It includes methods for creating, updating, and deleting providers
@Injectable()
export class LlmProviderService {
  constructor(
    @InjectRepository(LlmProviderEntity)
    private readonly llmProviderRepository: Repository<LlmProviderEntity>,
  ) {}

  /**
   * Get all active LLM providers
   *
   * @returns A list of active LLM providers
   */
  async findAll(): Promise<CreateLlmProviderDto[]> {
    return this.llmProviderRepository.find({
      where: { isActive: true },
      select: ['name', 'image'],
    });
  }

  /**
   * Get a LLM provider by name
   *
   * @param name - The name of the LLM provider
   * @returns The LLM provider if found, null otherwise
   * @throws NotFoundException if the provider is not found
   */
  async findByName(name: string): Promise<LlmProviderEntity> {
    const llmProvider = await this.llmProviderRepository.findOne({
      where: { name },
    });
    if (!llmProvider) {
      throw new NotFoundException('Provider not found');
    }
    return llmProvider;
  }

  /**
   * Create a new LLM provider
   *
   * @param createLlmProviderDto - The data for the new LLM provider
   * @returns A promise that resolves when the provider is created
   * @throws ConflictException if the provider already exists
   */
  async create(createLlmProviderDto: CreateLlmProviderDto): Promise<void> {
    const existingProvider = await this.findByName(createLlmProviderDto.name);
    if (existingProvider) {
      throw new ConflictException('LLM provider already exists');
    }
    const llmProvider = this.llmProviderRepository.create(createLlmProviderDto);
    await this.llmProviderRepository.save(llmProvider);
  }

  /**
   * Update an existing LLM provider
   *
   * @param name - The name of the LLM provider
   * @param updateLlmProviderDto - The updated data for the LLM provider
   */
  async update(
    name: string,
    updateLlmProviderDto: UpdateLlmProviderDto,
  ): Promise<void> {
    const llmProvider = await this.findByName(name);
    await this.llmProviderRepository.update(
      llmProvider.id,
      updateLlmProviderDto,
    );
  }

  /**
   * Soft delete an existing LLM provider
   *
   * @param name - The name of the LLM provider
   */
  async softDeleteProvider(name: string): Promise<void> {
    const llmProvider = await this.findByName(name);
    await this.llmProviderRepository.update(llmProvider.id, {
      isActive: false,
    });
  }

  /**
   * Hard delete an existing LLM provider
   *
   * @param name - The name of the LLM provider
   */
  async hardDeleteProvider(name: string): Promise<void> {
    const llmProvider = await this.findByName(name);
    await this.llmProviderRepository.delete(llmProvider.id);
  }
}
