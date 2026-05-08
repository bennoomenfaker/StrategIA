import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpModule } from '@nestjs/axios';
import { CollectionEngineService } from './collection-engine.service';
import { CollectionQueueProcessor } from './processors/collection-queue.processor';
import { FilterService } from './services/filter.service';
import { DeduplicationService } from './services/deduplication.service';
import { RetryService } from './services/retry.service';
import { CollectionSchedulerService } from './scheduler/collection-scheduler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'collection-queue',
    }),
    HttpModule,
  ],
  providers: [
    CollectionEngineService,
    CollectionQueueProcessor,
    FilterService,
    DeduplicationService,
    RetryService,
    CollectionSchedulerService,
  ],
  exports: [CollectionEngineService],
})
export class CollectionEngineModule {}
