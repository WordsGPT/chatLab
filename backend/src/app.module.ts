import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from '@auth/auth.module';
import { DatabaseModule } from '@database/database.module';
import { UsersModule } from '@users/users.module';
import { PromptModule } from '@prompt/prompt.module';
import { ExperimentModule } from '@experiment/experiment.module';
import { ExperimentExecutionModule } from '@experiment-execution/experiment-execution.module';
import { LlmProviderModule } from '@llm-provider/llm-provider.module';
import { LlmModelModule } from '@llm-model/llm-model.module';

// Main application module that imports all other modules
@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    UsersModule,
    PromptModule,
    ExperimentModule,
    LlmProviderModule,
    LlmModelModule,
    ExperimentExecutionModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
  ],
  controllers: [],
})
export class AppModule {}
