import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Processor('collection-queue')
export class CollectionProcessor {
  private readonly logger = new Logger(CollectionProcessor.name);
  private readonly COLLECTOR_URL = process.env.COLLECTOR_URL || 'http://localhost:8000';

  constructor(
    private prisma: PrismaService,
    private httpService: HttpService,
  ) {}

  async handleCollection(job: Job<{ planId: string; sources: any[]; keywords: any[] }>) {
    const { planId, sources, keywords } = job.data;

    // Update job status
    const jobRecord = await this.prisma.collectionJob.findFirst({
      where: { collectionPlanId: planId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    if (jobRecord) {
      await this.prisma.collectionJob.update({
        where: { id: jobRecord.id },
        data: { status: 'PROCESSING', startedAt: new Date() },
      });
    }

    try {
      // Send to Python collector
      const sourcesPayload = sources.map(s => ({
        url: s.sourceUrl || s.url,
        type: s.sourceType || s.type,
        label: s.sourceLabel || s.label,
      }));

      const response = await firstValueFrom(
        this.httpService.post(`${this.COLLECTOR_URL}/collect`, {
          planId,
          sources: sourcesPayload,
          keywords: keywords.map(k => k.keyword || k),
        }),
      );

      const data = response.data;
      const itemsFound = data.itemsFound || 0;
      const itemsStored = data.itemsStored || 0;

      // Update job as completed
      if (jobRecord) {
        await this.prisma.collectionJob.update({
          where: { id: jobRecord.id },
          data: {
            status: 'COMPLETED',
            itemsFound,
            itemsStored,
            completedAt: new Date(),
          },
        });
      }

      // Update plan's last run
      await this.prisma.collectionPlan.update({
        where: { id: planId },
        data: { lastRunAt: new Date() },
      });

      this.logger.log(`Collection completed: ${itemsStored} items stored`);
      return { success: true, itemsStored };
    } catch (error) {
      this.logger.error(`Collection failed: ${error.message}`);

      if (jobRecord) {
        await this.prisma.collectionJob.update({
          where: { id: jobRecord.id },
          data: {
            status: 'FAILED',
            errorMessage: error.message,
            completedAt: new Date(),
            retryCount: { increment: 1 },
          },
        });
      }

      throw error;
    }
  }
}
