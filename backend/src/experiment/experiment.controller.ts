import {
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
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

import {
  ApiCreateExperiment,
  ApiDeleteExperiment,
  ApiDownloadExperimentSchema,
  ApiGetExperiment,
  ApiGetExperimentsFiltered,
  ApiGetFeaturedExperiments,
  ApiGetRecentExperiments,
  ApiUpdateFeatured,
} from '@common/decorators/experiment-swagger.decorators';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

import { ExperimentService } from '@experiment/experiment.service';
import { CreateExperimentDto } from '@experiment/dto/create-experiment.dto';
import { SearchExperimentDto } from '@experiment/dto/search-experiment.dto';
import { SearchExperimentsDto } from '@experiment/dto/search-experiments.dto';
import { OptionsSearchExperimentDto } from '@experiment/dto/options-search-experiment.dto';

// Controller for handling experiment routes
@Controller('experiment')
@ApiTags('Experiments')
@UseGuards(JwtAuthGuard)
export class ExperimentController {
  constructor(private readonly experimentService: ExperimentService) {}

  /**
   * Get all experiments for the authenticated user with optional filters
   *
   * @param req - The request object containing the authenticated user's information
   * @param filters - Optional query parameters for filtering the experiments
   * @returns An array of all experiments matching the filters
   */
  @Get('all')
  @ApiGetExperimentsFiltered()
  async getExperimentsFiltered(
    @Req() req: RequestWithUser,
    @Query() filters: OptionsSearchExperimentDto,
  ): Promise<{ experiments: SearchExperimentsDto[]; total: number }> {
    const userId = req.user.id;
    return await this.experimentService.getExperimentsFiltered(userId, filters);
  }

  /**
   * Get all featured experiments for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @returns An array of all featured experiments
   */
  @Get('featured')
  @ApiGetFeaturedExperiments()
  async getFeaturedExperiments(
    @Req() req: RequestWithUser,
  ): Promise<SearchExperimentsDto[]> {
    const userId = req.user.id;
    return await this.experimentService.findFeatured(userId);
  }

  /**
   * Get all recent experiments for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @returns An array of all recent experiments
   */
  @Get('recent')
  @ApiGetRecentExperiments()
  async getRecentExperiments(@Req() req: RequestWithUser) {
    const userId = req.user.id;
    return await this.experimentService.findRecent(userId);
  }

  /**
   * Download the JSON schema for an experiment
   *
   * @param experimentId - The ID of the experiment to download the schema for
   * @param req - The request object containing the authenticated user's information
   * @returns The JSON schema file for the specified experiment
   */
  @Get('schema/:id')
  @ApiDownloadExperimentSchema()
  async downloadJsonSchema(
    @Req() req: RequestWithUser,
    @Param('id') experimentId: string,
    @Res() res: Response,
  ): Promise<void> {
    const userId = req.user.id;
    const schema = await this.experimentService.downloadJsonSchema(
      experimentId,
      userId,
    );

    res.set({
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="experiment-${experimentId}-schema.json"`,
    });

    res.send(JSON.stringify(schema, null, 2));
  }

  /**
   * Get an individual experiment by ID
   *
   * @param experimentId - The ID of the experiment to retrieve
   * @param req - The request object containing the authenticated user's information
   * @returns The requested experiment
   */
  @Get(':id')
  @ApiGetExperiment()
  async getExperiment(
    @Param('id') experimentId: string,
    @Req() req: RequestWithUser,
  ): Promise<SearchExperimentDto> {
    const userId = req.user.id;
    return await this.experimentService.findExperiment(experimentId, userId);
  }

  /**
   * Create a new experiment for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param createExperimentDto - The data transfer object containing the experiment details
   * @returns A message indicating the result of the operation
   */
  @Post('create')
  @ApiCreateExperiment()
  async createExperiment(
    @Req() req: RequestWithUser,
    @Body() createExperimentDto: CreateExperimentDto,
  ): Promise<{ message: string; experiment: SearchExperimentsDto }> {
    const userId = req.user.id;
    return await this.experimentService.createExperiment(
      userId,
      createExperimentDto,
    );
  }

  /**
   * Update the featured status of an experiment
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to update
   * @returns A message indicating the result of the operation
   */
  @Patch('featured/update/:id')
  @ApiUpdateFeatured()
  async updateFeatured(
    @Req() req: RequestWithUser,
    @Param('id') experimentId: string,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return await this.experimentService.toggleFeatured(experimentId, userId);
  }

  /**
   * Delete an experiment for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @param experimentId - The ID of the experiment to delete
   * @returns A message indicating the result of the operation
   */
  @Delete('delete/:id')
  @ApiDeleteExperiment()
  async deleteExperiment(
    @Req() req: RequestWithUser,
    @Param('id') experimentId: string,
  ): Promise<{ message: string }> {
    const userId = req.user.id;
    return await this.experimentService.deleteExperiment(experimentId, userId);
  }
}
