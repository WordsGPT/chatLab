import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiCreateLlmModel,
  ApiFindAllLlmModels,
  ApiHardDeleteLlmModel,
  ApiSoftDeleteLlmModel,
  ApiUpdateLlmModel,
} from '@common/decorators/llm-model-swagger.decorators';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { LlmModelService } from '@llm-model/llm-model.service';
import { CreateLlmModelDto } from '@llm-model/dto/create-llm-model.dto';
import { UpdateLlmModelDto } from '@llm-model/dto/update-llm-model.dto';

import { UserRole } from '@users/enums/user-role.enum';

// Controller for managing LLM models
@Controller('llm-model')
@ApiTags('LLM Model')
@UseGuards(JwtAuthGuard)
export class LlmModelController {
  constructor(private readonly llmModelService: LlmModelService) {}

  @Get()
  @ApiFindAllLlmModels()
  async findAll(): Promise<CreateLlmModelDto[]> {
    return this.llmModelService.findAll();
  }

  @Post()
  @ApiCreateLlmModel()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(
    @Body() createLlmModelDto: CreateLlmModelDto,
  ): Promise<{ message: string }> {
    await this.llmModelService.createLlmModel(createLlmModelDto);
    return { message: 'LLM model created successfully' };
  }

  @Patch(':name')
  @ApiUpdateLlmModel()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('name') name: string,
    @Body() updateLlmModelDto: UpdateLlmModelDto,
  ): Promise<{ message: string }> {
    await this.llmModelService.updateLlmModel(name, updateLlmModelDto);
    return { message: 'LLM model updated successfully' };
  }

  @Delete('/soft-delete/:name')
  @ApiSoftDeleteLlmModel()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async softDelete(@Param('name') name: string): Promise<{ message: string }> {
    await this.llmModelService.softDeleteModel(name);
    return { message: 'LLM model removed successfully' };
  }

  @Delete('/hard-delete/:name')
  @ApiHardDeleteLlmModel()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async hardDelete(@Param('name') name: string): Promise<{ message: string }> {
    await this.llmModelService.hardDeleteModel(name);
    return { message: 'LLM model permanently removed successfully' };
  }
}
