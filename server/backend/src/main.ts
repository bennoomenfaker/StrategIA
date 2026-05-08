import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('StrategIA API')
    .setDescription('AI-Augmented Strategic Intelligence & Competitive Intelligence SaaS Platform')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Authentication & Token management')
    .addTag('users', 'User management')
    .addTag('organizations', 'Multi-tenant organization management')
    .addTag('projects', 'Project CRUD and access control')
    .addTag('objectives', 'Strategic objectives')
    .addTag('axes', 'Analysis axes')
    .addTag('hypotheses', 'Hypothesis management')
    .addTag('perimeters', 'Hierarchical context perimeters')
    .addTag('collection-plans', 'Data collection plan management')
    .addTag('collection-engine', 'Async collection orchestration')
    .addTag('connectors', 'Data source connectors (RSS, Web, PDF)')
    .addTag('raw-data', 'Collected raw data')
    .addTag('audit', 'Activity logging & audit trail')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customSiteTitle: 'StrategIA API Documentation',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableCors({
    origin: process.env.APP_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`StrategIA API running on http://localhost:${port}/api`);
  console.log(`Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
