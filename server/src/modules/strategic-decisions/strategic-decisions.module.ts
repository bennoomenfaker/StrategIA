import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { StrategicDecisionsController } from './strategic-decisions.controller';
import { StrategicDecisionsService } from './strategic-decisions.service';

@Module({
  imports: [PrismaModule],
  controllers: [StrategicDecisionsController],
  providers: [StrategicDecisionsService],
  exports: [StrategicDecisionsService],
})
export class StrategicDecisionsModule {}
