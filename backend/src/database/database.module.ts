import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import {
  database_host,
  database_name,
  database_password,
  database_port,
  database_username,
} from '@common/constants/env-convig.constant';

// Database module to configure TypeORM with PostgreSQL
// It connects to the PostgreSQL database with the specified credentials
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: database_host,
      port: parseInt(database_port, 10),
      username: database_username,
      password: database_password,
      database: database_name,
      logging: ['error', 'warn'],
      autoLoadEntities: true,
      synchronize: true,
      migrationsRun: true,
    }),
  ],
})
export class DatabaseModule {}
