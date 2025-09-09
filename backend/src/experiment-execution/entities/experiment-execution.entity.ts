import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';
import { ExecutionStatus } from '@experiment-execution/enums/execution-status.enum';
import { UserEntity } from '@users/entities/user.entity';

// Experiment Execution entity for the 'experiment_executions' table
// Stores execution info: id, inputValues, finalPrompt, result, status, executedAt, createdAt
// Set relations with Experiment and User entities
@Entity('experiment_executions')
export class ExperimentExecutionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'json',
  })
  inputValues: Record<string, string>;

  @Column({
    type: 'text',
  })
  finalPrompt: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  results: Record<string, string[]>;

  @Column({
    type: 'enum',
    enum: ExecutionStatus,
    default: ExecutionStatus.CREATED,
  })
  status: ExecutionStatus;

  @Column({
    type: 'timestamp',
    nullable: true,
  })
  executedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ExperimentEntity, (experiment) => experiment.executions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experimentId' })
  experiment: ExperimentEntity;

  @ManyToOne(() => UserEntity, (user) => user.executions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
}
