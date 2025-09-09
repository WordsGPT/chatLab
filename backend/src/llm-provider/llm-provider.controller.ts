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
  ApiCreateLlmProvider,
  ApiFindAllLlmProvider,
  ApiHardDeleteLlmProvider,
  ApiSoftDeleteLlmProvider,
  ApiUpdateLlmProvider,
} from '@common/decorators/llm-provider-swagger.decorators';
import { Roles } from '@common/decorators/roles.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

import { CreateLlmProviderDto } from '@llm-provider/dto/create-llm-provider.dto';
import { UpdateLlmProviderDto } from '@llm-provider/dto/update-llm-provider.dto';
import { LlmProviderService } from '@llm-provider/llm-provider.service';

import { UserRole } from '@users/enums/user-role.enum';

// Controller for managing LLM providers
@Controller('llm-provider')
@ApiTags('LLM Provider')
@UseGuards(JwtAuthGuard)
export class LlmProviderController {
  constructor(private readonly llmProviderService: LlmProviderService) {}

  /**
   * Get all active LLM providers
   *
   * @returns A list of active LLM providers
   */
  @Get()
  @ApiFindAllLlmProvider()
  async findAll(): Promise<CreateLlmProviderDto[]> {
    return this.llmProviderService.findAll();
  }

  /**
   * Create a new LLM provider
   * Only accessible by admins
   *
   * @param createLlmProviderDto - The data for the new LLM provider
   * @returns A promise that resolves when the provider is created
   */
  @Post()
  @ApiCreateLlmProvider()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async create(
    @Body() createLlmProviderDto: CreateLlmProviderDto,
  ): Promise<{ message: string }> {
    await this.llmProviderService.create(createLlmProviderDto);
    return { message: 'LLM provider created successfully' };
  }

  /**
   * Update an existing LLM provider
   * Only accessible by admins
   *
   * @param name - The name of the LLM provider to update
   * @param updateLlmProviderDto - The updated data for the LLM provider
   * @returns A promise that resolves when the provider is updated
   */
  @Patch(':name')
  @ApiUpdateLlmProvider()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('name') name: string,
    @Body() updateLlmProviderDto: UpdateLlmProviderDto,
  ): Promise<{ message: string }> {
    await this.llmProviderService.update(name, updateLlmProviderDto);
    return { message: 'LLM provider updated successfully' };
  }

  /**
   * Soft delete an existing LLM provider
   * Only accessible by admins
   *
   * @param name - The name of the LLM provider
   * @returns A promise that resolves when the provider is soft deleted
   */
  @Delete('/soft-delete/:name')
  @ApiSoftDeleteLlmProvider()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async softDelete(@Param('name') name: string): Promise<{ message: string }> {
    await this.llmProviderService.softDeleteProvider(name);
    return { message: 'LLM provider removed successfully' };
  }

  /**
   * Hard delete an existing LLM provider
   * Only accessible by admins
   *
   * @param name - The name of the LLM provider
   * @returns A promise that resolves when the provider is hard deleted
   */
  @Delete('/hard-delete/:name')
  @ApiHardDeleteLlmProvider()
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async hardDelete(@Param('name') name: string): Promise<{ message: string }> {
    await this.llmProviderService.hardDeleteProvider(name);
    return { message: 'LLM provider permanently removed successfully' };
  }
}
