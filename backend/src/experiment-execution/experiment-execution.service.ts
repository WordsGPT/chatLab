import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { firstValueFrom } from 'rxjs';
import * as ExcelJS from 'exceljs';
import Ajv from 'ajv';

import {
  litellm_api_key,
  proxy_uri,
} from '@common/constants/env-convig.constant';

import { ExecutionStatus } from '@experiment-execution/enums/execution-status.enum';
import { LiteLLMResponse } from '@experiment-execution/interface/lite-llm.interface';
import { ExperimentExecutionEntity } from '@experiment-execution/entities/experiment-execution.entity';
import { SearchExecutionDto } from '@experiment-execution/dto/search-execution.dto';
import { OptionsSearchExecutionDto } from '@experiment-execution/dto/options-search-execution.dto';

import { ExperimentService } from '@experiment/experiment.service';
import { UsersService } from '@users/users.service';
import { SearchExperimentDto } from '@experiment/dto/search-experiment.dto';

// Service to manage experiment executions
// It includes methods to create, run, fetch, and delete executions
@Injectable()
export class ExperimentExecutionService {
  // LiteLLM Configuration
  private readonly proxyUrl = proxy_uri;
  private readonly headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${litellm_api_key}`,
  };

  // Pagination limit history
  private readonly LIMIT_PER_PAGE = 20;

  constructor(
    private readonly experimentService: ExperimentService,
    private readonly httpService: HttpService,
    private readonly userService: UsersService,

    @InjectRepository(ExperimentExecutionEntity)
    private executionRepository: Repository<ExperimentExecutionEntity>,
  ) {}

  /**
   * Get filtered executions for a specific experiment and user with pagination
   *
   * @param experimentId - The ID of the experiment to get executions for
   * @param userId - The ID of the user to get executions for
   * @param filters - The filtering options including page, status, and executedAt
   * @returns An array of filtered executions for the specified experiment and user
   */
  async getExecutionsFiltered(
    experimentId: string,
    userId: string,
    filters: OptionsSearchExecutionDto,
  ): Promise<{ executions: SearchExecutionDto[]; total: number }> {
    const { page, status, executedAt } = filters;

    const queryBuilder = this.executionRepository
      .createQueryBuilder('execution')
      .leftJoinAndSelect('execution.experiment', 'experiment')
      .leftJoinAndSelect('execution.user', 'user')
      .where('experiment.id = :experimentId', { experimentId })
      .andWhere('user.id = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('execution.status = :status', { status });
    }

    if (
      ((Number(status) as ExecutionStatus) === ExecutionStatus.FINISHED ||
        (Number(status) as ExecutionStatus) === ExecutionStatus.ERROR) &&
      executedAt
    ) {
      queryBuilder.orderBy(
        'execution.executedAt',
        executedAt.toUpperCase() as 'ASC' | 'DESC',
      );
    } else {
      queryBuilder.orderBy('execution.createdAt', 'DESC');
    }

    queryBuilder
      .skip((page - 1) * this.LIMIT_PER_PAGE)
      .take(this.LIMIT_PER_PAGE);

    const [executions, total] = await queryBuilder.getManyAndCount();

    return {
      executions: executions.map((execution) => ({
        id: execution.id,
        inputValues: execution.inputValues,
        status: execution.status,
        results: execution.results,
        executedAt: execution.executedAt,
      })),
      total,
    };
  }

  /**
   * Get temporal executions for a specific experiment and user
   *
   * @param experimentId - The ID of the experiment to get temporal executions for
   * @param userId - The ID of the user to get temporal executions for
   * @returns An array of temporal executions for the specified experiment
   */
  async getTemporalExecutions(
    experimentId: string,
    userId: string,
  ): Promise<SearchExecutionDto[]> {
    const executions = await this.executionRepository.find({
      where: {
        status: In([ExecutionStatus.CREATED, ExecutionStatus.LOADING]),
        experiment: { id: experimentId },
        user: { id: userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['experiment', 'user'],
      take: this.LIMIT_PER_PAGE,
    });

    return executions.map((execution) => ({
      id: execution.id,
      inputValues: execution.inputValues,
      status: execution.status,
      results: execution.results,
      executedAt: execution.executedAt,
    }));
  }

  /**
   * Get executions by their IDs for a specific experiment and user
   *
   * @param experimentId - The ID of the experiment to get executions for
   * @param userId - The ID of the user to get executions for
   * @param executionIds - The IDs of the executions to retrieve
   * @returns An array of executions matching the specified IDs
   */
  async getExecutionsByIds(
    experimentId: string,
    userId: string,
    executionIds: string[],
  ): Promise<SearchExecutionDto[]> {
    if (executionIds.length === 0) return [];

    const executions = await this.executionRepository.find({
      where: {
        id: In(executionIds),
        experiment: { id: experimentId },
        user: { id: userId },
      },
      relations: ['experiment', 'user'],
    });

    return executions.map((execution) => ({
      id: execution.id,
      inputValues: execution.inputValues,
      status: execution.status,
      results: execution.results,
      executedAt: execution.executedAt,
    }));
  }

  /**
   * Create a new experiment execution for a specific experiment and user
   *
   * @param createExecutionDto - The data transfer object containing the input values and prompts for the execution
   * @param experimentId - The ID of the experiment to create the execution for
   * @param userId - The ID of the user creating the execution
   * @returns An object containing a success message and the created execution details
   */
  async createExecution(
    inputValues: Record<string, string>,
    prompts: string[],
    experimentId: string,
    userId: string,
  ): Promise<{ message: string; execution: SearchExecutionDto }> {
    const user = await this.userService.findById(userId);

    const experiment = await this.experimentService.findById(
      experimentId,
      userId,
    );

    const finalPrompt = this.generateFinalPrompt(
      inputValues,
      prompts,
      experiment.description,
    );

    const execution = this.executionRepository.create({
      inputValues: inputValues,
      experiment,
      finalPrompt,
      user,
    });

    await this.executionRepository.save(execution);

    return {
      message: 'Execution created successfully',
      execution: {
        id: execution.id,
        inputValues: execution.inputValues,
        status: execution.status,
      },
    };
  }

  /**
   * Generate an Excel file containing the results of finished and errored executions
   * for a specific experiment and user
   *
   * @param experimentId - The ID of the experiment to get executions for
   * @param userId - The ID of the user to get executions for
   * @param prompts - The list of prompts to include in the Excel file
   * @returns A Buffer containing the Excel file data
   */
  async generateExcel(
    experimentId: string,
    userId: string,
    prompts: string[],
  ): Promise<Buffer> {
    const executions = await this.executionRepository.find({
      where: {
        status: In([ExecutionStatus.ERROR, ExecutionStatus.FINISHED]),
        experiment: { id: experimentId },
        user: { id: userId },
      },
      order: { createdAt: 'DESC' },
      relations: ['experiment', 'user'],
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Experiment');

    worksheet.columns = [
      { header: 'Input Values', key: 'inputValues', width: 40 },
      { header: 'Models', key: 'models', width: 20 },
      ...prompts.map((_, i) => ({
        header: prompts[i],
        key: `prompt_${i}`,
        width: 50,
      })),
    ];

    worksheet.columns.forEach((col) => {
      if (col.key) {
        worksheet.getColumn(col.key).alignment = { wrapText: true };
      }
    });

    for (const exec of executions) {
      const formattedInput = Object.entries(exec.inputValues)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n');

      Object.entries(exec.results).forEach(([model, modelResults]) => {
        const row: Record<string, any> = {
          inputValues: formattedInput,
          models: model,
        };

        prompts.forEach((prompt, promptIndex) => {
          if (Array.isArray(modelResults) && modelResults[promptIndex]) {
            row[`prompt_${promptIndex}`] = modelResults[promptIndex];
          } else {
            row[`prompt_${promptIndex}`] = '';
          }
        });

        worksheet.addRow(row);
      });
    }

    const uint8Array = await workbook.xlsx.writeBuffer();
    return Buffer.from(uint8Array);
  }

  /**
   * Upload experiment executions from a JSON file
   *
   * @param experimentId - The ID of the experiment to upload executions for
   * @param userId - The ID of the user uploading the executions
   * @param file - The uploaded file containing the executions
   * @param prompts - The list of prompts to include in the executions
   * @returns A message indicating the result of the upload
   */
  async uploadFileExecutions(
    experimentId: string,
    userId: string,
    file: Buffer,
    prompts: string[],
  ): Promise<{ message: string; executions: SearchExecutionDto[] }> {
    const jsonString = file.toString('utf8');
    let data: Record<string, any>[];

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data = JSON.parse(jsonString);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      throw new BadRequestException('JSON file not valid');
    }

    if (!Array.isArray(data)) {
      throw new BadRequestException('JSON must be an array of objects');
    }

    const experiment = await this.experimentService.findById(
      experimentId,
      userId,
    );

    const ajv = new Ajv();
    const validate = ajv.compile(experiment.experimentValidation);

    const createdExecutions: SearchExecutionDto[] = [];
    let successCount = 0;

    await Promise.allSettled(
      data.map(async (item) => {
        if (!validate(item)) return;

        const inputValues: Record<string, string> = {};
        for (const key in item) {
          if (Object.hasOwnProperty.call(item, key)) {
            inputValues[key] = JSON.stringify(item[key]);
          }
        }

        const newExecution = await this.createExecution(
          inputValues,
          prompts,
          experimentId,
          userId,
        );

        createdExecutions.push(newExecution.execution);
        successCount++;
      }),
    );

    let message = '';
    if (successCount === data.length) {
      message = 'All executions created successfully';
    } else if (successCount > 0) {
      message = `${successCount} executions created, ${data.length - successCount} failed`;
    } else {
      message = 'No executions created, all failed';
    }

    return { message, executions: createdExecutions };
  }

  /**
   * Run an experiment execution for a specific user
   *
   * @param id - The ID of the execution to run
   * @param userId - The ID of the user who owns the execution
   * @returns A message indicating the result of the run
   */
  async runExecution(
    id: string,
    userId: string,
    models: SearchExperimentDto['models'],
    llmConfigs: SearchExperimentDto['llmConfigs'],
  ): Promise<{ message: string; execution: SearchExecutionDto }> {
    const execution = await this.executionRepository.findOne({
      where: { id: id, user: { id: userId } },
      relations: ['user'],
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    execution.status = ExecutionStatus.LOADING;
    await this.executionRepository.save(execution);

    const results: Record<string, string[]> = {};
    let success = false;

    await Promise.all(
      models.map(async (model) => {
        try {
          const body = {
            model,
            messages: [{ role: 'user', content: execution.finalPrompt }],
            ...llmConfigs,
          };

          const response = await firstValueFrom(
            this.httpService.post<LiteLLMResponse>(
              `${this.proxyUrl}/chat/completions`,
              body,
              { headers: this.headers },
            ),
          );

          const llmResponse = response.data.choices[0].message.content;
          const parsed = this.parseLLMResponse(llmResponse);

          results[model] = parsed;

          if (parsed.length > 0) success = true;
        } catch (err: unknown) {
          if (err instanceof Error) {
            results[model] = [`Error: ${err.message}`];
          } else {
            results[model] = [`Error desconocido`];
          }
        }
      }),
    );

    const sortedResults: Record<string, string[]> = {};
    Object.keys(results)
      .sort()
      .forEach((key) => {
        sortedResults[key] = results[key];
      });

    execution.results = sortedResults;
    execution.status = success
      ? ExecutionStatus.FINISHED
      : ExecutionStatus.ERROR;
    execution.executedAt = new Date();

    await this.executionRepository.save(execution);

    const executionPayload: SearchExecutionDto = {
      id: execution.id,
      inputValues: execution.inputValues,
      status: execution.status,
      results: execution.results,
      executedAt: execution.executedAt,
    };

    return { message: 'Execution finished', execution: executionPayload };
  }

  /**
   * Run all pending executions for a specific experiment and user
   *
   * @param experimentId - The ID of the experiment to get pending executions for
   * @param userId - The ID of the user to get pending executions for
   * @param models - The list of models to use for running the executions
   * @param llmConfigs - The LLM configuration options to use for running the executions
   * @returns A message indicating the result of running all pending executions
   */
  async runAllPendingExecutions(
    experimentId: string,
    userId: string,
    models: SearchExperimentDto['models'],
    llmConfigs: SearchExperimentDto['llmConfigs'],
  ): Promise<{ message: string; changes: boolean; executionsIds?: string[] }> {
    const executions = await this.executionRepository.find({
      where: {
        status: ExecutionStatus.CREATED,
        experiment: { id: experimentId },
        user: { id: userId },
      },
      relations: ['experiment', 'user'],
    });

    const executionIds = executions.map((e) => e.id);

    if (executionIds.length === 0) {
      return { message: 'No pending executions found', changes: false };
    }

    await Promise.all(
      executionIds.map((id) =>
        this.runExecution(id, userId, models, llmConfigs),
      ),
    );

    return {
      message: 'All executions finished',
      changes: true,
      executionsIds: executionIds,
    };
  }

  /**
   * Delete an experiment execution for a specific user
   *
   * @param id - The ID of the execution to delete
   * @param userId - The ID of the user who owns the execution
   * @returns A message indicating the result of the deletion
   */
  async deleteExecution(
    id: string,
    userId: string,
  ): Promise<{ message: string }> {
    const execution = await this.executionRepository.findOne({
      where: { id: id, user: { id: userId } },
      relations: ['user'],
    });

    if (!execution) {
      throw new NotFoundException('Execution not found');
    }

    await this.executionRepository.delete(id);

    return { message: 'Execution deleted successfully' };
  }

  /**
   * Generate the final prompt for the experiment execution
   *
   * @param inputValues - The input values provided for the execution
   * @param prompts - The list of prompts to be answered
   * @param description - Optional description of the experiment
   * @returns The generated final prompt string
   */
  private generateFinalPrompt(
    inputValues: Record<string, string>,
    prompts: string[],
    description?: string,
  ): string {
    const descriptionBlock = description
      ? `\nThe experiment description is ${description}\n`
      : '';

    const genericInstructions = `
      You are an AI system running an experiment. ${descriptionBlock}
      Your task is to answer a series of prompts using the provided context.

      Rules:
      - Respond only with plain text, no explanations.
      - For each prompt, output the answer in the following format:
      ### RESULT <index>
      <answer>
    `;

    let contextBlock = 'Context of the experiment:\n';
    for (const [key, value] of Object.entries(inputValues)) {
      if (
        value !== null &&
        value !== undefined &&
        !(typeof value === 'string' && value.trim() === '') &&
        !(
          Array.isArray(value) &&
          value.every(
            (v) =>
              v === null ||
              v === undefined ||
              (typeof v === 'string' && v.trim() === ''),
          )
        )
      ) {
        const formattedValue = Array.isArray(value)
          ? JSON.stringify(value)
          : value;
        contextBlock += `${key}: ${formattedValue}\n`;
      }
    }

    const promptsBlock =
      '\nPrompts:\n' +
      prompts.map((p, i) => `${i + 1}. ${p}`).join('\n') +
      '\n\nReturn the results strictly in order.';

    return genericInstructions + '\n' + contextBlock + '\n' + promptsBlock;
  }

  /**
   * Parse the LLM response to extract individual results
   *
   * @param response - The raw response string from the LLM
   * @returns An array of extracted results
   */
  private parseLLMResponse(response: string): string[] {
    if (!response) return [];

    const regex = /### RESULT \d+\n([\s\S]*?)(?=(### RESULT \d+|$))/g;
    const results: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = regex.exec(response)) !== null) {
      const result = match[1].trim();
      if (result) results.push(result);
    }

    if (results.length === 0) {
      results.push(response.trim());
    }

    return results;
  }
}
