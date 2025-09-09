import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';
import { ExperimentExecutionEntity } from '@experiment-execution/entities/experiment-execution.entity';

import { PromptEntity } from '@prompt/entities/prompt.entity';

import { UserRole } from '@users/enums/user-role.enum';
import { ThemePreference } from '@users/enums/theme-preference.enum';

// User entity for the 'users' table
// Stores user info: id, username, email, password, role, etc.
// Sets up relations with experiments, executions, and prompts
@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 30,
  })
  username: string;

  @Column({
    unique: true,
    length: 254,
  })
  email: string;

  @Column({
    length: 255,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: ThemePreference,
    default: ThemePreference.AUTO,
  })
  themePreference: ThemePreference;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: '' })
  refreshToken: string;

  @Column({ default: '' })
  virtualToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ExperimentEntity, (experiment) => experiment.user)
  experiments: ExperimentEntity[];

  @OneToMany(() => ExperimentExecutionEntity, (execution) => execution.user)
  executions: ExperimentExecutionEntity[];

  @OneToMany(() => PromptEntity, (prompt) => prompt.user)
  prompts: PromptEntity[];
}
