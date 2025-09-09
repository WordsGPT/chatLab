import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { PromptEntity } from '@prompt/entities/prompt.entity';
import { SearchPromptDto } from '@prompt/dto/search-prompt.dto';
import { CreatePromptDto } from '@prompt/dto/create-prompt.dto';

import { UsersService } from '@users/users.service';

// Service for managing user prompts
// It includes methods for creating, retrieving, and searching prompts
@Injectable()
export class PromptService {
  constructor(
    private readonly usersService: UsersService,

    @InjectRepository(PromptEntity)
    private promptRepository: Repository<PromptEntity>,
  ) {}

  /**
   * Get a specific prompt for a user
   *
   * @param prompt The prompt text
   * @param userId The ID of the user
   * @returns The prompt entity or null if not found
   */
  async getPrompt(
    prompt: string,
    userId: string,
  ): Promise<PromptEntity | null> {
    return this.promptRepository.findOne({
      where: { prompt, user: { id: userId } },
      relations: ['user'],
    });
  }

  /**
   * Get the 5 most recent prompts for a user
   *
   * @param userId The ID of the user
   * @returns An array of the 5 most recent prompts
   */
  async getRecentPrompts(userId: string): Promise<SearchPromptDto[]> {
    const prompts = await this.promptRepository.find({
      where: { user: { id: userId } },
      order: { lastUsedAt: 'DESC' },
      take: 5,
      relations: ['user'],
    });

    return prompts.map((prompt) => ({ prompt: prompt.prompt }));
  }

  /**
   * Get a list of prompts that match a user's query
   *
   * @param userId The ID of the user
   * @param query The search query
   * @returns An array of prompts that match the query
   */
  async autocompletePrompts(
    userId: string,
    query: string,
  ): Promise<SearchPromptDto[]> {
    const prompts = await this.promptRepository.find({
      where: { user: { id: userId }, prompt: ILike(`%${query}%`) },
      take: 5,
      relations: ['user'],
    });

    return prompts.map((prompt) => ({ prompt: prompt.prompt }));
  }

  /**
   * Create a new prompt for a user
   *
   * @param prompt The prompt text
   * @param userId The ID of the user
   * @returns The created prompt entity
   */
  async createPrompt(prompt: string, userId: string): Promise<PromptEntity> {
    const existingPrompt = await this.getPrompt(prompt, userId);
    if (existingPrompt) {
      existingPrompt.lastUsedAt = new Date();
      await this.promptRepository.save(existingPrompt);
      return existingPrompt;
    }

    const user = await this.usersService.findById(userId);

    const newPrompt = this.promptRepository.create({ prompt, user });
    return this.promptRepository.save(newPrompt);
  }

  /**
   * Create multiple prompts for a user
   *
   * @param prompts An array of CreatePromptDto objects
   * @param userId The ID of the user
   * @returns An array of the created prompt entities
   */
  async createPrompts(
    prompts: CreatePromptDto[],
    userId: string,
  ): Promise<{ prompt: PromptEntity; order: number }[]> {
    const createdPrompts: { prompt: PromptEntity; order: number }[] = [];

    for (const dto of prompts) {
      const { prompt, promptOrder } = dto;

      const createdPrompt = await this.createPrompt(prompt, userId);
      createdPrompts.push({ prompt: createdPrompt, order: promptOrder });
    }

    createdPrompts.sort((a, b) => a.order - b.order);

    return createdPrompts;
  }
}
