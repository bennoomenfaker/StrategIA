import { Module } from '@nestjs/common';
import { CollectionPlansService } from './collection-plans.service';
import { CollectionPlansController } from './collection-plans.controller';
import { CollectionPlanRepository } from './repositories/collection-plan.repository';

@Module({
  controllers: [CollectionPlansController],
  providers: [CollectionPlansService, CollectionPlanRepository],
  exports: [CollectionPlansService],
})
export class CollectionPlansModule {}
