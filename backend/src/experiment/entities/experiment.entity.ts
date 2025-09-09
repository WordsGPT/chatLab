import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { DEFAULT_LLM_CONFIG } from '@experiment/constants/llm-config-default';
import { LLMConfigDto } from '@experiment/dto/llm-config.dto';
import { ExperimentValidation } from '@experiment/interface/experiment-validation.interface';

import { ExperimentExecutionEntity } from '@experiment-execution/entities/experiment-execution.entity';
import { ExperimentVariableEntity } from '@experiment-variable/entities/experiment-variable.entity';
import { LlmModelEntity } from '@llm-model/entities/llm-model.entity';
import { PromptEntity } from '@prompt/entities/prompt.entity';
import { UserEntity } from '@users/entities/user.entity';

// Experiment entity for the 'experiment' table
// Stores experiment info: id, name, description, llmConfigs, featured, promptOrder, experimentValidation, lastViewed, createdAt
// Set relations with User, Prompt, LlmModel, ExperimentVariable and ExperimentExecution entities
@Entity('experiment')
export class ExperimentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'json',
    default: () => `'${JSON.stringify(DEFAULT_LLM_CONFIG)}'`,
  })
  llmConfigs: LLMConfigDto;

  @Column({
    type: 'boolean',
    default: false,
  })
  featured: boolean;

  @Column({
    type: 'json',
    default: '[]',
  })
  promptOrder: string[];

  @Column({ type: 'json', nullable: true })
  experimentValidation: ExperimentValidation;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastViewed: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(
    () => ExperimentExecutionEntity,
    (execution) => execution.experiment,
  )
  executions: ExperimentExecutionEntity[];

  @OneToMany(
    () => ExperimentVariableEntity,
    (variable) => variable.experiment,
    { cascade: true },
  )
  variables: ExperimentVariableEntity[];

  @ManyToOne(() => UserEntity, (user) => user.experiments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToMany(() => PromptEntity, (prompt) => prompt.experiments, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'experiment_prompts',
    joinColumn: { name: 'experimentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'promptId', referencedColumnName: 'id' },
  })
  prompts: PromptEntity[];

  @ManyToMany(() => LlmModelEntity, (model) => model.experiments, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'experiment_models',
    joinColumn: { name: 'experimentId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'modelId', referencedColumnName: 'id' },
  })
  models: LlmModelEntity[];
}
