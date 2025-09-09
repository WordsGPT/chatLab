import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import 'dotenv/config';

import { AppModule } from './app.module';

import { backend_port } from '@common/constants/env-convig.constant';
import { ModelsSeedService } from '@llm-model/seed/models-seed.service';
import { ProvidersSeedService } from '@llm-provider/seed/providers-seed.service';
import { UserSeedService } from '@users/seed/users-seed.service';

// Main entry point for the application
// It initializes the NestJS application, sets up global pipes, and configures Swagger documentation
// The application listens on the specified backend port
async function bootstrap() {
  // Initialize the NestJS application
  const app = await NestFactory.create(AppModule, {
    cors: true,
    // logger: ['error', 'warn'],
  });

  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Set up Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Chatwords')
    .setDescription(
      `
      RESTful API for the Chatwords Tool platform, providing endpoints for user authentication, experiment management, prompts, and data queries.
      
      JWT-based authentication is used to secure protected routes.
      `,
    )
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Authentication', '/auth endpoints')
    .addTag('Users', '/profile endpoints')
    .addTag('Experiments', '/experiment endpoints')
    .addTag('Experiment Execution', '/experiment-execution endpoints')
    .addTag('LLM Provider', '/llm-provider endpoints')
    .addTag('LLM Model', '/llm-model endpoints')
    .addTag('Prompts', '/prompt endpoints')
    .build();

  const options: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
  };

  const documentFactory = () =>
    SwaggerModule.createDocument(app, config, options);

  SwaggerModule.setup('swagger', app, documentFactory, {
    jsonDocumentUrl: 'swagger/json',
  });

  // Seed the database with default data
  const userSeedService = app.get(UserSeedService);
  await userSeedService.createDefaultUser();

  const providersSeedService = app.get(ProvidersSeedService);
  await providersSeedService.createDefaultProviders();

  const modelsSeedService = app.get(ModelsSeedService);
  await modelsSeedService.createDefaultModels();

  await app.listen(backend_port);
}

// Start the application and handle any errors during startup
bootstrap().catch((error) => {
  console.error('Error starting the application:', error);
  process.exit(1);
});
