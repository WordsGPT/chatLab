import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExperimentExecutionController } from '@experiment-execution/experiment-execution.controller';
import { ExperimentExecutionService } from '@experiment-execution/experiment-execution.service';
import { ExperimentExecutionEntity } from '@experiment-execution/entities/experiment-execution.entity';

import { ExperimentModule } from '@experiment/experiment.module';
import { UsersModule } from '@users/users.module';

// This module handles the execution of experiments, including creating, retrieving, and managing experiment executions.
@Module({
  imports: [
    TypeOrmModule.forFeature([ExperimentExecutionEntity]),
    ExperimentModule,
    HttpModule,
    UsersModule,
  ],
  controllers: [ExperimentExecutionController],
  providers: [ExperimentExecutionService],
})
export class ExperimentExecutionModule {}
