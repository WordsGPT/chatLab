import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { LlmModelEntity } from '@llm-model/entities/llm-model.entity';
import { CreateLlmModelDto } from '@llm-model/dto/create-llm-model.dto';
import { UpdateLlmModelDto } from '@llm-model/dto/update-llm-model.dto';

import { LlmProviderService } from '@llm-provider/llm-provider.service';

// Service for managing LLM models
// It includes methods for creating, updating, and deleting models
@Injectable()
export class LlmModelService {
  constructor(
    private readonly llmProviderService: LlmProviderService,

    @InjectRepository(LlmModelEntity)
    private llmModelRepository: Repository<LlmModelEntity>,
  ) {}

  /**
   * Get all active LLM models
   *
   * @returns An array of active LLM models
   */
  async findAll(): Promise<CreateLlmModelDto[]> {
    const llmModels = await this.llmModelRepository.find({
      where: { isActive: true, provider: { isActive: true } },
      relations: ['provider'],
    });

    return llmModels.map((llmModels) => ({
      name: llmModels.name,
      providerName: llmModels.provider.name,
    }));
  }

  /**
   * Get a LLM model by name
   *
   * @param name - The name of the LLM model
   * @returns The LLM model if found, null otherwise
   * @throws NotFoundException if the model is not found
   */
  async findModelByName(name: string): Promise<LlmModelEntity> {
    const llmModel = await this.llmModelRepository.findOne({ where: { name } });
    if (!llmModel) {
      throw new NotFoundException('Model not found');
    }
    return llmModel;
  }

  /**
   * Get LLM models by their names
   *
   * @param models - An array of model names
   * @returns An array of LLM models
   */
  async findModelsByNames(models: string[]): Promise<LlmModelEntity[]> {
    const llmModels = await this.llmModelRepository.find({
      where: { name: In(models) },
    });
    return llmModels;
  }

  /**
   * Create a new LLM model
   *
   * @param createLlmModelDto - The data for the new LLM model
   * @throws ConflictException if the model already exists
   */
  async createLlmModel(createLlmModelDto: CreateLlmModelDto): Promise<void> {
    const existingModel = await this.findModelByName(createLlmModelDto.name);
    if (existingModel) {
      throw new ConflictException('Model already exists');
    }

    const { providerName, ...modelData } = createLlmModelDto;

    const llmProvider = await this.llmProviderService.findByName(providerName);

    const llmModel = this.llmModelRepository.create({
      ...modelData,
      provider: llmProvider,
    });
    await this.llmModelRepository.save(llmModel);
  }

  /**
   * Update an existing LLM model
   *
   * @param name - The name of the LLM model
   * @param updateLlmModelDto - The data to update the LLM model
   */
  async updateLlmModel(
    name: string,
    updateLlmModelDto: UpdateLlmModelDto,
  ): Promise<void> {
    const llmModel = await this.findModelByName(name);
    await this.llmModelRepository.update(llmModel.id, updateLlmModelDto);
  }

  /**
   * Soft delete an existing LLM model
   *
   * @param name - The name of the LLM model
   */
  async softDeleteModel(name: string): Promise<void> {
    const llmModel = await this.findModelByName(name);
    await this.llmModelRepository.update(llmModel.id, { isActive: false });
  }

  /**
   * Hard delete an existing LLM model
   *
   * @param name - The name of the LLM model
   */
  async hardDeleteModel(name: string): Promise<void> {
    const llmModel = await this.findModelByName(name);
    await this.llmModelRepository.delete(llmModel.id);
  }
}
