import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperimentService } from '@experiment/experiment.service';
import { ExperimentController } from '@experiment/experiment.controller';
import { ExperimentEntity } from '@experiment/entities/experiment.entity';

import { ExperimentVariableEntity } from '@experiment-variable/entities/experiment-variable.entity';
import { LlmModelModule } from '@llm-model/llm-model.module';
import { PromptModule } from '@prompt/prompt.module';
import { UsersModule } from '@users/users.module';

// This module handles all experiment-related functionality
@Module({
  imports: [
    TypeOrmModule.forFeature([ExperimentEntity]),
    TypeOrmModule.forFeature([ExperimentVariableEntity]),
    LlmModelModule,
    UsersModule,
    PromptModule,
  ],
  controllers: [ExperimentController],
  providers: [ExperimentService],
  exports: [ExperimentService],
})
export class ExperimentModule {}
