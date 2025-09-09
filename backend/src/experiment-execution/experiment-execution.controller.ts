import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import {
  ApiCreateExperimentExecution,
  ApiDeleteExecution,
  ApiDownloadExcel,
  ApiGetExperimentExecutions,
  ApiGetTemporalExecutions,
  ApiRunAllExecutions,
  ApiRunExecution,
  ApiUpdateTemporalExecutions,
  ApiUploadExperimentExecutions,
} from '@common/decorators/experiment-executions-swagger.decorators';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

import { ExperimentExecutionService } from '@experiment-execution/experiment-execution.service';
import { CreateExecutionDto } from '@experiment-execution/dto/create-execution.dto';
import { SearchExecutionDto } from '@experiment-execution/dto/search-execution.dto';
import { OptionsSearchExecutionDto } from './dto/options-search-execution.dto';
import { SearchExperimentDto } from '@experiment/dto/search-experiment.dto';

// Controller for managing experiment executions
@Controller('experiment-execution')
@ApiTags('Experiment Execution')
@UseGuards(JwtAuthGuard)
export class ExperimentExecutionController {
  constructor(
    private readonly experimentExecutionService: ExperimentExecutionService,
  ) {}

  /**
   * Get all executions for a specific experiment and user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to get executions for
   * @returns An array of all executions for the specified experiment
   */
  @Get('executions/:experimentId')
  @ApiGetExperimentExecutions()
  async getExecutions(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @Query() filters: OptionsSearchExecutionDto,
  ): Promise<{ executions: SearchExecutionDto[]; total: number }> {
    const userId = req.user.id;
    return await this.experimentExecutionService.getExecutionsFiltered(
      experimentId,
      userId,
      filters,
    );
  }

  /**
   * Get temporal executions for a specific experiment and user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to get temporal executions for
   * @returns An array of temporal executions for the specified experiment
   */
  @Get('temporal-executions/:experimentId')
  @ApiGetTemporalExecutions()
  async getTemporalExecutions(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
  ): Promise<SearchExecutionDto[]> {
    const userId = req.user.id;
    return await this.experimentExecutionService.getTemporalExecutions(
      experimentId,
      userId,
    );
  }

  /**
   * Update temporal executions for a specific experiment and user based on provided execution IDs
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to update temporal executions for
   * @param executionIdsStr - A comma-separated string of execution IDs to update
   * @returns An array of updated temporal executions for the specified experiment
   */
  @Get('update-temporal-executions/:experimentId')
  @ApiUpdateTemporalExecutions()
  async updateTemporalExecutions(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @Query('executionIds') executionIdsStr: string,
  ): Promise<SearchExecutionDto[]> {
    const userId = req.user.id;
    const executionIds = executionIdsStr ? executionIdsStr.split(',') : [];

    return await this.experimentExecutionService.getExecutionsByIds(
      experimentId,
      userId,
      executionIds,
    );
  }

  /**
   * Create a new experiment execution for a specific experiment and user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to create the execution for
   * @param createExecutionDto - The data transfer object containing the input values and prompts for the execution
   * @returns An object containing a success message and the created execution details
   */
  @Post('create/execution/:experimentId')
  @ApiCreateExperimentExecution()
  async createExecution(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @Body() createExecutionDto: CreateExecutionDto,
  ): Promise<{ message: string; execution: SearchExecutionDto }> {
    const userId = req.user.id;
    return await this.experimentExecutionService.createExecution(
      createExecutionDto.inputValues,
      createExecutionDto.prompts,
      experimentId,
      userId,
    );
  }

  /**
   * Download experiment results as an Excel file for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to download results for
   * @param body - The request body containing the prompts to include in the Excel file
   */
  @Post('download/:experimentId')
  @ApiDownloadExcel()
  async downloadExcel(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @Body() body: { prompts: string[] },
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user.id;

    const buffer = await this.experimentExecutionService.generateExcel(
      experimentId,
      userId,
      body.prompts,
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename=experiment.xlsx',
    );
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );

    res.send(buffer);
  }

  /**
   * Upload a file containing multiple experiment executions for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to upload executions for
   * @param file - The uploaded file containing execution data
   * @param promptsJson - A JSON string containing an array of prompts associated with the executions
   * @returns An object containing a success message and an array of created executions
   */
  @Post('upload/executions/:experimentId')
  @ApiUploadExperimentExecutions()
  @UseInterceptors(FileInterceptor('file'))
  async uploadExecutions(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('prompts') promptsJson: string,
  ): Promise<{ message: string; executions: SearchExecutionDto[] }> {
    const userId = req.user.id;

    //eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const prompts: string[] = JSON.parse(promptsJson);

    if (!file || !(file.buffer instanceof Buffer)) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.experimentExecutionService.uploadFileExecutions(
      experimentId,
      userId,
      file.buffer,
      prompts,
    );
  }

  /**
   * Run an experiment execution for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param id - The ID of the execution to run
   * @param body - The request body containing the models and llmConfigs to use for the execution
   * @returns An object containing a success message and the updated execution details
   */
  @Patch('run/:id')
  @ApiRunExecution()
  async runExecution(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body()
    body: {
      models: SearchExperimentDto['models'];
      llmConfigs: SearchExperimentDto['llmConfigs'];
    },
  ): Promise<{ message: string; execution: SearchExecutionDto }> {
    const userId = req.user.id;
    return await this.experimentExecutionService.runExecution(
      id,
      userId,
      body.models,
      body.llmConfigs,
    );
  }

  /**
   * Run all pending experiment executions for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to run all pending executions for
   * @param body - The request body containing the models and llmConfigs to use for the executions
   * @returns A message indicating the result of running all pending executions
   */
  @Patch('run-all/:experimentId')
  @ApiRunAllExecutions()
  async runAllExecutions(
    @Req() req: RequestWithUser,
    @Param('experimentId') experimentId: string,
    @Body()
    body: {
      models: SearchExperimentDto['models'];
      llmConfigs: SearchExperimentDto['llmConfigs'];
    },
  ): Promise<{ message: string; changes: boolean; executionsIds?: string[] }> {
    const userId = req.user.id;
    return await this.experimentExecutionService.runAllPendingExecutions(
      experimentId,
      userId,
      body.models,
      body.llmConfigs,
    );
  }

  /**
   * Delete an experiment execution for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param id - The ID of the execution to delete
   * @returns A message indicating the result of the deletion
   */
  @Delete('delete/:id')
  @ApiDeleteExecution()
  async deleteExecution(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return await this.experimentExecutionService.deleteExecution(id, userId);
  }
}
