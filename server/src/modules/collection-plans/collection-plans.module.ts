import { Module } from '@nestjs/common';
import { CollectionPlansService } from './collection-plans.service';
import { CollectionPlansController } from './collection-plans.controller';

@Module({
  controllers: [CollectionPlansController],
  providers: [CollectionPlansService],
  exports: [CollectionPlansService],
})
export class CollectionPlansModule {}
