import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
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
import { RawDataModule } from './modules/raw-data/raw-data.module';
import { AuditModule } from './modules/audit/audit.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { FeedModule } from './modules/feed/feed.module';
import { InsightsModule } from './modules/insights/insights.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { StrategicDecisionsModule } from './modules/strategic-decisions/strategic-decisions.module';
import { SignalsModule } from './modules/signals/signals.module';
import { TrendsModule } from './modules/trends/trends.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 10,
    }]),
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
    RawDataModule,
    AuditModule,
    AnalyticsModule,
    FeedModule,
    InsightsModule,
    RecommendationsModule,
    StrategicDecisionsModule,
    SignalsModule,
    TrendsModule,
    AiAssistantModule,
  ],
})
export class AppModule {}
