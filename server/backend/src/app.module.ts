import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import redisConfig from './config/redis.config';
import appConfig from './config/app.config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ObjectivesModule } from './modules/objectives/objectives.module';
import { AxesModule } from './modules/axes/axes.module';
import { HypothesesModule } from './modules/hypotheses/hypotheses.module';
import { PerimetersModule } from './modules/perimeters/perimeters.module';
import { CollectionPlansModule } from './modules/collection-plans/collection-plans.module';
import { CollectionEngineModule } from './modules/collection-engine/collection-engine.module';
import { ConnectorsModule } from './modules/connectors/connectors.module';
import { RawDataModule } from './modules/raw-data/raw-data.module';
import { AuditModule } from './modules/audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, redisConfig, appConfig],
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
      },
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    ProjectsModule,
    ObjectivesModule,
    AxesModule,
    HypothesesModule,
    PerimetersModule,
    CollectionPlansModule,
    CollectionEngineModule,
    ConnectorsModule,
    RawDataModule,
    AuditModule,
  ],
})
export class AppModule {}
