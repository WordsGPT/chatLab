import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { LlmModelEntity } from '@llm-model/entities/llm-model.entity';

// LLM Provider entity for the 'llm-provider' table
// Stores llm-provider info: id, name, image, isActive
// Set relations with LLM Model entity
@Entity('llm-provider')
export class LlmProviderEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
    length: 30,
  })
  name: string;

  @Column({
    nullable: true,
    length: 100,
  })
  image: string;

  @Column({ default: false })
  isActive: boolean;

  @OneToMany(() => LlmModelEntity, (model) => model.provider)
  models: LlmModelEntity[];
}
