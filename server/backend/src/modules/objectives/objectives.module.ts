import { Module } from '@nestjs/common';
import { ObjectivesService } from './objectives.service';
import { ObjectivesController } from './objectives.controller';
import { ObjectiveRepository } from './repositories/objective.repository';

@Module({
  controllers: [ObjectivesController],
  providers: [ObjectivesService, ObjectiveRepository],
  exports: [ObjectivesService],
})
export class ObjectivesModule {}
