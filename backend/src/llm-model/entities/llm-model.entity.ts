import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';
import { LlmProviderEntity } from '@llm-provider/entities/llm-provider';

// LLM Model entity for the 'llm_models' table
// Stores llm-model info: id, name, providerId, isActive
// Set relations with LLM Provider and Experiment entities
@Entity('llm_models')
export class LlmModelEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    length: 100,
  })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => LlmProviderEntity, (provider) => provider.models, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'providerId' })
  provider: LlmProviderEntity;

  @ManyToMany(() => ExperimentEntity, (experiment) => experiment.models)
  experiments: ExperimentEntity[];
}
