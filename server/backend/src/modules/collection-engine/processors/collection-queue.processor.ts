import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger, Injectable } from '@nestjs/common';

@Processor('collection-queue')
@Injectable()
export class CollectionQueueProcessor extends WorkerHost {
  private readonly logger = new Logger(CollectionQueueProcessor.name);

  async process(job: Job): Promise<unknown> {
    this.logger.log(`Job ${job.id} received (no-op mode)`);
    return { jobId: job.id, status: 'skipped' };
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} marked as completed`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job) {
    this.logger.error(`Job ${job.id} failed`);
  }
}
