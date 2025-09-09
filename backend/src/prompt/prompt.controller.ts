import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import {
  ApiPromptAutocomplete,
  ApiRecentPrompts,
} from '@common/decorators/prompt-swagger.decorators';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RequestWithUser } from '@common/interfaces/request-with-user.interface';

import { SearchPromptDto } from '@prompt/dto/search-prompt.dto';
import { PromptService } from '@prompt/prompt.service';

// Controller for handling prompt routes
@Controller('prompt')
@ApiTags('Prompts')
@UseGuards(JwtAuthGuard)
export class PromptController {
  constructor(private readonly promptService: PromptService) {}

  /**
   * Get the 5 most recent prompts for the authenticated user
   *
   * @param req - The request object containing the authenticated user's information
   * @returns An array of the 5 most recent prompts
   */
  @Get('recent')
  @ApiRecentPrompts()
  async getRecentPrompts(
    @Req() req: RequestWithUser,
  ): Promise<SearchPromptDto[]> {
    const userId = req.user.id;
    return await this.promptService.getRecentPrompts(userId);
  }

  /**
   * Get a list of prompts that match a user's search query
   *
   * @param req - The request object containing the authenticated user's information
   * @param search - The search query
   * @returns An array of prompts that match the search query
   */
  @Get('autocomplete/')
  @ApiPromptAutocomplete()
  async autocompletePrompts(
    @Req() req: RequestWithUser,
    @Query('search') search: string,
  ): Promise<SearchPromptDto[]> {
    const userId = req.user.id;
    return await this.promptService.autocompletePrompts(userId, search);
  }
}
