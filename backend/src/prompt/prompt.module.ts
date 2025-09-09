import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '@users/users.module';

import { PromptService } from '@prompt/prompt.service';
import { PromptController } from '@prompt/prompt.controller';
import { PromptEntity } from '@prompt/entities/prompt.entity';

// This module handles all prompt-related functionality
@Module({
  imports: [TypeOrmModule.forFeature([PromptEntity]), UsersModule],
  controllers: [PromptController],
  providers: [PromptService],
  exports: [PromptService],
})
export class PromptModule {}
