import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';

import { UserEntity } from '@users/entities/user.entity';

// Prompt entity for the 'prompt' table
// Stores prompt info: id, prompt text, user who created it, and timestamps
// Set up relationships with user and experiment entities
@Entity('prompt')
export class PromptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'text',
  })
  prompt: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  lastUsedAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.prompts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToMany(() => ExperimentEntity, (experiment) => experiment.prompts)
  experiments: ExperimentEntity[];
}
