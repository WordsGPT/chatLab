import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';
import { CreateExperimentDto } from '@experiment/dto/create-experiment.dto';
import { SearchExperimentDto } from '@experiment/dto/search-experiment.dto';
import { SearchExperimentsDto } from '@experiment/dto/search-experiments.dto';
import { OptionsSearchExperimentDto } from '@experiment/dto/options-search-experiment.dto';

import { ExperimentValidation } from '@experiment/interface/experiment-validation.interface';

import { LlmModelService } from '@llm-model/llm-model.service';

import { PromptService } from '@prompt/prompt.service';
import { UsersService } from '@users/users.service';

import { ExperimentVariableDto } from '@experiment-variable/dto/experiment-variable.dto';
import { ValidationVariableType } from '@experiment-variable/enums/validation-variable-type.enum';

// Service for managing experiments
// It includes methods for creating, retrieving, and deleting experiments
@Injectable()
export class ExperimentService {
  // Limits for recent and featured experiments
  private readonly MAX_RECENT_EXPERIMENTS = 10;
  private readonly MAX_FEATURED_EXPERIMENTS = 10;

  // Pagination limit
  private readonly LIMIT_PER_PAGE = 20;

  constructor(
    private readonly llmModelService: LlmModelService,
    private readonly promptService: PromptService,
    private readonly userService: UsersService,

    @InjectRepository(ExperimentEntity)
    private experimentRepository: Repository<ExperimentEntity>,
  ) {}

  /**
   * Get all experiments for a specific user with optional filters and pagination
   *
   * @param userId - The ID of the user to retrieve experiments for
   * @param filters - The filters and pagination options
   * @returns An array of experiments and the total count
   */
  async getExperimentsFiltered(
    userId: string,
    filters: OptionsSearchExperimentDto,
  ): Promise<{ experiments: SearchExperimentsDto[]; total: number }> {
    const { page, featured, lastViewed, createdAt } = filters;

    const queryBuilder = this.experimentRepository
      .createQueryBuilder('experiment')
      .leftJoinAndSelect('experiment.user', 'user')
      .where('user.id = :userId', { userId });

    if (featured !== undefined) {
      queryBuilder.andWhere('experiment.featured = :featured', { featured });
    }

    if (lastViewed) {
      queryBuilder.orderBy(
        'experiment.lastViewed',
        lastViewed.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    if (createdAt) {
      queryBuilder.orderBy(
        'experiment.createdAt',
        createdAt.toUpperCase() as 'ASC' | 'DESC',
      );
    }

    queryBuilder
      .skip((page - 1) * this.LIMIT_PER_PAGE)
      .take(this.LIMIT_PER_PAGE);

    const [experiments, total] = await queryBuilder.getManyAndCount();

    return {
      experiments: experiments.map((experiment) => ({
        id: experiment.id,
        name: experiment.name,
        description: experiment.description,
        featured: experiment.featured,
        lastViewed: experiment.lastViewed,
      })),
      total,
    };
  }

  /**
   * Get all featured experiments for a specific user
   *
   * @param userId - The ID of the user to retrieve featured experiments for
   * @returns An array of all featured experiments for the user
   */
  async findFeatured(userId: string): Promise<SearchExperimentsDto[]> {
    const experiments = await this.experimentRepository.find({
      where: { user: { id: userId }, featured: true },
      order: { lastViewed: 'DESC' },
      take: this.MAX_FEATURED_EXPERIMENTS,
      relations: ['user'],
    });

    return experiments.map((experiment) => ({
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      featured: experiment.featured,
      lastViewed: experiment.lastViewed,
    }));
  }

  /**
   * Get all recent experiments for a specific user
   *
   * @param userId - The ID of the user to retrieve recent experiments for
   * @returns An array of all recent experiments for the user
   */
  async findRecent(userId: string): Promise<SearchExperimentsDto[]> {
    const experiments = await this.experimentRepository.find({
      where: { user: { id: userId }, featured: false },
      order: { lastViewed: 'DESC' },
      take: this.MAX_RECENT_EXPERIMENTS,
      relations: ['user'],
    });

    return experiments.map((experiment) => ({
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      featured: experiment.featured,
      lastViewed: experiment.lastViewed,
    }));
  }

  /**
   * Download the JSON schema for a specific experiment
   *
   * @param experimentId - The ID of the experiment to download the schema for
   * @param userId - The ID of the user who owns the experiment
   * @returns The JSON schema of the experiment
   */
  async downloadJsonSchema(
    experimentId: string,
    userId: string,
  ): Promise<ExperimentValidation> {
    const experiment = await this.findById(experimentId, userId);

    return experiment.experimentValidation;
  }

  /**
   * Get an specific experiment for a user
   *
   * @param experimentId - The unique identifier of the experiment to retrieve.
   * @param userId - The unique identifier of the user who owns the experiment.
   * @returns the requested experiment details.
   * @throws NotFoundException if the experiment is not found for the given user.
   */
  async findExperiment(
    experimentId: string,
    userId: string,
  ): Promise<SearchExperimentDto> {
    const experiment = await this.experimentRepository.findOne({
      where: { id: experimentId, user: { id: userId } },
      relations: ['user', 'variables', 'prompts', 'models'],
    });

    if (!experiment) {
      throw new NotFoundException(`Experiment not found`);
    }

    const prompts = experiment.promptOrder.map(
      (id) => experiment.prompts.find((p) => p.id === id)!.prompt,
    );

    const variables: ExperimentVariableDto[] = experiment.variables.map(
      (v) => ({
        name: v.name,
        type: v.type,
        validations: {
          ...v.validations,
          description: v.description,
        },
      }),
    );

    await this.updateExperimentLastViewed(experiment);

    return {
      id: experiment.id,
      name: experiment.name,
      description: experiment.description,
      llmConfigs: experiment.llmConfigs,
      models: experiment.models.map((model) => model.name),
      prompts,
      variables,
    };
  }

  /**
   * Create a new experiment for the authenticated user
   *
   * @param userId - The ID of the user to create the experiment for
   * @param createExperimentDto - The data transfer object containing the experiment details
   * @returns The created experiment as a SearchExperimentDto and a message indicating success
   */
  async createExperiment(
    userId: string,
    createExperimentDto: CreateExperimentDto,
  ): Promise<{ message: string; experiment: SearchExperimentsDto }> {
    const user = await this.userService.findById(userId);

    const models = await this.llmModelService.findModelsByNames(
      createExperimentDto.models,
    );

    const promptsWithOrder = await this.promptService.createPrompts(
      createExperimentDto.prompts,
      userId,
    );

    const variables = createExperimentDto.variables.map((v) => {
      const { description, ...restValidations } = v.validations;
      return {
        name: v.name,
        type: v.type,
        description: description,
        validations: {
          ...restValidations,
        },
      };
    });

    const experimentValidation = this.generateExperimentValidation(
      createExperimentDto.variables,
    );

    const newExperiment = this.experimentRepository.create({
      name: createExperimentDto.name,
      description: createExperimentDto.description ?? undefined,
      llmConfigs: createExperimentDto.llmConfigs,
      promptOrder: promptsWithOrder.map((p) => p.prompt.id),
      experimentValidation,
      user,
      models,
      prompts: promptsWithOrder.map((p) => p.prompt),
      variables,
    });

    await this.experimentRepository.save(newExperiment);

    const searchExperimentDto: SearchExperimentsDto = {
      id: newExperiment.id,
      name: newExperiment.name,
      description: newExperiment.description,
      featured: newExperiment.featured,
      lastViewed: newExperiment.lastViewed,
    };

    return {
      message: 'Experiment created successfully',
      experiment: searchExperimentDto,
    };
  }

  /**
   * Update the last viewed timestamp of an experiment
   *
   * @param experimentId - The ID of the experiment to update
   * @param userId - The ID of the user who owns the experiment
   */
  async updateLastView(experimentId: string, userId: string): Promise<void> {
    const experiment = await this.findById(experimentId, userId);

    await this.updateExperimentLastViewed(experiment);
  }

  /**
   * Toggle the featured status of an experiment
   *
   * @param experimentId - The ID of the experiment to toggle
   * @param userId - The ID of the user who owns the experiment
   * @returns A message indicating the result of the operation
   * @throws NotFoundException if the experiment is not found
   */
  async toggleFeatured(
    experimentId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const experiment = await this.findById(experimentId, userId);

    experiment.featured = !experiment.featured;
    await this.updateExperimentLastViewed(experiment);

    return { message: 'Experiment updated successfully' };
  }

  /**
   * Delete an experiment for a specific user
   *
   * @param id - The ID of the experiment to delete
   * @returns A message indicating the result of the operation
   * @throws NotFoundException if the experiment is not found
   */
  async deleteExperiment(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    await this.findById(id, userId);
    await this.experimentRepository.delete(id);

    return { message: 'Experiment deleted successfully' };
  }

  /**
   * Find an experiment by ID for a specific user
   *
   * @param id - The ID of the experiment to find
   * @param userId - The ID of the user who owns the experiment
   * @returns The found experiment entity
   * @throws NotFoundException if the experiment is not found
   */
  async findById(id: string, userId: string): Promise<ExperimentEntity> {
    const experiment = await this.experimentRepository.findOne({
      where: { id: id, user: { id: userId } },
      relations: ['user'],
    });

    if (!experiment) {
      throw new NotFoundException('Experiment not found');
    }

    return experiment;
  }

  /**
   * Generate the validation schema for an experiment
   *
   * @param variables - The variables to include in the validation schema
   * @returns The generated validation schema
   */
  private generateExperimentValidation(
    variables: ExperimentVariableDto[],
  ): ExperimentValidation {
    const schema: ExperimentValidation = {
      type: 'object',
      properties: {},
      required: [],
    };

    for (const variable of variables) {
      const { name, validations } = variable;

      const { required, ...restValidations } = validations || {};

      if (required) {
        schema.required!.push(name);
      }

      if (restValidations.type === ValidationVariableType.ARRAY) {
        const {
          type,
          description,
          minItems,
          maxItems,
          uniqueItems,
          ...itemValidations
        } = restValidations;

        const items = {
          type: variable.type.slice(0, -2) as ValidationVariableType,
          ...itemValidations,
        };

        schema.properties[name] = {
          type,
          description,
          minItems,
          maxItems,
          uniqueItems,
          items,
        };
      } else {
        schema.properties[name] = { ...restValidations };
      }
    }

    if (schema.required!.length === 0) {
      delete schema.required;
    }

    return schema;
  }

  /**
   * Auxiliary function to update the last viewed timestamp of an experiment
   *
   * @param experiment - The experiment to update
   */
  private async updateExperimentLastViewed(
    experiment: ExperimentEntity,
  ): Promise<void> {
    experiment.lastViewed = new Date();
    await this.experimentRepository.save(experiment);
  }
}
