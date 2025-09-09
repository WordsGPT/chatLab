import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { ExperimentEntity } from '@experiment/entities/experiment.entity';

import { VariableType } from '@experiment-variable/enums/variable-type.enum';
import { VariableValidation } from '@experiment-variable/interface/variable-validation.interface';

// ExperimentVariable entity for the 'experiment_variables' table
// Stores experiment variable info: id, name, type, description, validations, and associated experiment
// Set up relationships with the Experiment entity
@Entity('experiment_variables')
export class ExperimentVariableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 100,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: VariableType,
  })
  type: VariableType;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({ type: 'json', nullable: true })
  validations: VariableValidation;

  @ManyToOne(() => ExperimentEntity, (experiment) => experiment.variables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'experimentId' })
  experiment: ExperimentEntity;
}
